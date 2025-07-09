// PasienPage.js
import React, { useState, useEffect, useCallback } from "react";
import PasienSideBar from "./PasienSideBar";
import DataDiriPasien from "./DataDiriPasien";
import RekamMedisHistory from "./RekamMedisHistory";
import PasienRegisterPage from "./PasienRegisterPage";
import contract from "../contract";
import web3 from "../web3";
import queryString from 'query-string';

export default function PasienPage({ account, onLogout, setAccount }) {
    const [activeMenu, setActiveMenu] = useState("dataDiri");
    const [dataDiri, setDataDiri] = useState(null);
    const [isRegistered, setIsRegistered] = useState(false);
    const [rekamMedisIds, setRekamMedisIds] = useState([]);
    const [rekamMedisTerbaru, setRekamMedisTerbaru] = useState(null);
    const [loading, setLoading] = useState(true);
    const [listAdminRS, setListAdminRS] = useState([]);
    const [nextPatientId, setNextPatientId] = useState('');
    const [error, setError] = useState(null);

    const [form, setForm] = useState({
        nama: "",
        ID: "",
        NIK: "",
        golonganDarah: "",
        tanggalLahir: "",
        gender: "",
        alamat: "",
        noTelepon: "",
        email: "",
        adminRS: "",
    });

    const [actorInfoCache, setActorInfoCache] = useState({});

    const getActorDetails = useCallback(async (actorAddress) => {
        const addressAsString = typeof actorAddress === 'string' ? actorAddress : String(actorAddress);

        if (addressAsString === '0x0000000000000000000000000000000000000000' || !addressAsString) {
            return { name: "N/A", hospitalName: "N/A", role: "Unknown" };
        }

        if (actorInfoCache[addressAsString]) {
            return actorInfoCache[addressAsString];
        }

        let name = "";
        let hospitalName = "N/A";
        let role = "";

        try {
            role = await contract.methods.getUserRole(addressAsString).call();

            switch (role) {
                case "Dokter":
                case "InactiveDokter":
                    const dokterInfo = await contract.methods.getDokter(addressAsString).call();
                    name = dokterInfo[0];
                    const affiliatedAdminRSAddress = dokterInfo[5];
                    if (affiliatedAdminRSAddress !== "0x0000000000000000000000000000000000000000") {
                        try {
                            const adminRSData = await contract.methods.getAdminRS(affiliatedAdminRSAddress).call();
                            hospitalName = adminRSData[0];
                        } catch (e) {
                            console.warn(`Gagal mendapatkan nama RS afiliasi untuk dokter ${addressAsString}:`, e);
                            hospitalName = "N/A (RS Error)";
                        }
                    }
                    break;
                case "Pasien":
                    const pasienDataFromContract = await contract.methods.getPasienData(addressAsString).call();
                    // Karena getPasienData sekarang mengembalikan struct, akses propertinya langsung
                    name = pasienDataFromContract.nama; // Akses .nama
                    const responsibleRSAddress = pasienDataFromContract.rumahSakitPenanggungJawab; // Akses .rumahSakitPenanggungJawab
                    if (responsibleRSAddress !== "0x0000000000000000000000000000000000000000") {
                        try {
                            const adminRSData = await contract.methods.getAdminRS(responsibleRSAddress).call();
                            hospitalName = adminRSData[0];
                        } catch (e) {
                            console.warn(`Gagal mendapatkan nama RS penanggung jawab untuk pasien ${addressAsString}:`, e);
                            hospitalName = "N/A (RS Error)";
                        }
                    }
                    break;
                case "AdminRS":
                case "InactiveAdminRS":
                    const adminInfo = await contract.methods.getAdminRS(addressAsString).call();
                    name = adminInfo[0];
                    hospitalName = adminInfo[0];
                    break;
                case "SuperAdmin":
                    name = "Super Admin (Sistem)";
                    hospitalName = "Sistem Utama";
                    break;
                default:
                    name = `${addressAsString.substring(0, 6)}...${addressAsString.substring(addressAsString.length - 4)}`;
                    hospitalName = "N/A";
            }
        } catch (err) {
            console.warn(`Gagal mendapatkan detail aktor ${addressAsString}:`, err);
            name = `${addressAsString.substring(0, 6)}...${addressAsString.substring(addressAsString.length - 4)}`;
            hospitalName = "N/A (Error)";
        }

        const details = { name, hospitalName, role };
        setActorInfoCache((prev) => ({ ...prev, [addressAsString]: details }));
        return details;
    }, [actorInfoCache]);

    const loadPasienData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const registered = await contract.methods.isPasien(account).call();
            setIsRegistered(registered);

            if (registered) {
                // Perbaikan: Akses properti struct langsung
                const pasienData = await contract.methods.getPasienData(account).call();

                setDataDiri({
                    nama: pasienData.nama,
                    ID: pasienData.ID,
                    NIK: pasienData.NIK,
                    golonganDarah: pasienData.golonganDarah,
                    tanggalLahir: pasienData.tanggalLahir,
                    gender: pasienData.gender,
                    alamat: pasienData.alamat,
                    noTelepon: pasienData.noTelepon,
                    email: pasienData.email,
                    rumahSakitPenanggungJawab: pasienData.rumahSakitPenanggungJawab,
                    address: account,
                });

                setForm({
                    nama: pasienData.nama,
                    ID: pasienData.ID,
                    NIK: pasienData.NIK,
                    golonganDarah: pasienData.golonganDarah,
                    tanggalLahir: pasienData.tanggalLahir,
                    gender: pasienData.gender,
                    alamat: pasienData.alamat,
                    noTelepon: pasienData.noTelepon,
                    email: pasienData.email,
                    adminRS: pasienData.rumahSakitPenanggungJawab,
                });

                const rmIds = await contract.methods.getRekamMedisIdsByPasien(account).call();
                setRekamMedisIds(rmIds);

                if (rmIds.length > 0) {
                    const latestRmId = rmIds[rmIds.length - 1];
                    const latestRmData = await contract.methods.getRekamMedis(latestRmId).call();

                    const pembuatAddress = latestRmData[5];
                    const { name: pembuatNama, hospitalName: pembuatRSNama } = await getActorDetails(pembuatAddress);

                    setRekamMedisTerbaru({
                        id_rm: latestRmData[0].toString(),
                        pasien: latestRmData[1],
                        diagnosa: latestRmData[2],
                        foto: latestRmData[3],
                        catatan: latestRmData[4],
                        pembuat: latestRmData[5],
                        pembuatNama: pembuatNama,
                        pembuatRSNama: pembuatRSNama,
                        timestampPembuatan: Number(latestRmData[6]),
                        tipeRekamMedis: latestRmData[7],
                    });
                } else {
                    setRekamMedisTerbaru(null);
                }
                setActiveMenu("dataDiri");
            } else {
                setDataDiri(null);
                setRekamMedisTerbaru(null);
                setRekamMedisIds([]);
                setForm({
                    nama: "", ID: "", NIK: "", golonganDarah: "", tanggalLahir: "",
                    gender: "", alamat: "", noTelepon: "", email: "", adminRS: "",
                });
            }
        } catch (error) {
            console.error("Error loading pasien data:", error);
            setError("Gagal memuat data pasien. Pastikan Anda terhubung ke jaringan blockchain yang benar.");
            setIsRegistered(false);
            setDataDiri(null);
            setRekamMedisTerbaru(null);
            setRekamMedisIds([]);
        } finally {
            setLoading(false);
        }
    }, [account, getActorDetails]);

    const fetchAdminRSList = useCallback(async () => {
        try {
            const addresses = await contract.methods.getAllAdminRSAddresses().call();
            const adminRSData = await Promise.all(
                addresses.map(async (addr) => {
                    try {
                        const data = await contract.methods.getAdminRS(addr).call();
                        if (data.aktif) {
                            return {
                                address: addr,
                                nama: data.namaRumahSakit,
                                alamat: data.alamatRumahSakit,
                                kota: data.kota,
                                NIBRS: data.NIBRS,
                            };
                        }
                        return null;
                    } catch (error) {
                        console.error(`Error fetching AdminRS data for ${addr}:`, error);
                        return null;
                    }
                })
            );
            setListAdminRS(adminRSData.filter(Boolean));
        } catch (error) {
            console.error("Error fetching admin RS list:", error);
            setError("Gagal memuat daftar Rumah Sakit. Coba refresh halaman.");
        }
    }, []);

    const generateNextPatientId = useCallback(async () => {
        try {
            const total = await contract.methods.totalPasien().call();
            const nextIdNum = Number(total) + 1;
            const formattedId = `P-${String(nextIdNum).padStart(3, '0')}`;
            setNextPatientId(formattedId);
        } catch (error) {
            console.error("Error generating next patient ID:", error);
            setError("Gagal meng-generate ID Pasien otomatis.");
            setNextPatientId("P-ERR");
        }
    }, []);

    const submitDataDiri = useCallback(async () => {
        if (!nextPatientId || nextPatientId === "P-ERR") {
            alert("Gagal meng-generate ID Pasien. Silakan coba lagi.");
            return;
        }
        if (!form.nama || !form.NIK || !form.golonganDarah || !form.tanggalLahir || !form.gender || !form.alamat || !form.noTelepon || !form.email || !form.adminRS) {
            alert("Harap lengkapi semua data pendaftaran.");
            return;
        }
        try {
            // Estimasi gas untuk transaksi ini. Ambil nilai gas dari Remix (JavaScript VM)
            // Contoh estimasi dari Remix untuk selfRegisterPasien (banyak string) adalah sekitar 3-5 juta gas
            const GAS_LIMIT = 5000000; // Contoh: Alokasikan 5 juta gas. Sesuaikan jika perlu.

            await contract.methods.selfRegisterPasien(
                form.nama,
                nextPatientId, // Ini adalah ID
                form.NIK,
                form.golonganDarah,
                form.tanggalLahir,
                form.gender,
                form.alamat,
                form.noTelepon,
                form.email,
                form.adminRS
            ).send({
                from: account,
                gas: GAS_LIMIT // Menggunakan batas gas yang ditentukan
            });
            alert("Pendaftaran berhasil!");
            await loadPasienData();
        } catch (error) {
            console.error("Error self-registering patient:", error);
            let errorMessage = "Gagal mendaftar pasien. Pastikan data unik dan valid.";
            if (error.message.includes("out of gas")) {
                errorMessage = "Transaksi kehabisan gas. Coba tingkatkan batas gas (di MetaMask/kode) atau simpan data lebih sedikit.";
            } else if (error.message.includes("Pasien already registered")) {
                errorMessage = "Anda sudah terdaftar sebagai pasien.";
            } else if (error.message.includes("ID Pasien sudah digunakan")) {
                errorMessage = "ID pasien sudah digunakan. Coba refresh halaman.";
            } else if (error.message.includes("NIK Pasien sudah digunakan")) {
                errorMessage = "NIK pasien sudah digunakan. Harap masukkan NIK yang unik.";
            } else if (error.message.includes("revert")) {
                // Mencoba menangkap pesan revert yang lebih spesifik
                const revertReason = error.message.substring(error.message.indexOf("revert") + 6).trim();
                errorMessage = `Transaksi dibatalkan: ${revertReason}.`;
            }
            alert(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [account, form, loadPasienData, nextPatientId]);

    const updatePasienData = useCallback(async (updatedData) => {
        try {
            const GAS_LIMIT = 2000000; // Estimasi gas untuk update, biasanya lebih rendah dari register

            await contract.methods.updatePasienData(
                updatedData.nama,
                updatedData.NIK,
                updatedData.golonganDarah,
                updatedData.tanggalLahir,
                updatedData.gender,
                updatedData.alamat,
                updatedData.noTelepon,
                updatedData.email
            ).send({
                from: account,
                gas: GAS_LIMIT
            });
            alert("Data diri berhasil diperbarui!");
            await loadPasienData();
        } catch (error) {
            console.error("Error updating patient data:", error);
            let errorMessage = "Gagal memperbarui data diri. Lihat konsol untuk detail.";
            if (error.message.includes("NIK baru sudah digunakan")) {
                errorMessage = "NIK baru sudah digunakan oleh pasien lain. Harap masukkan NIK yang unik.";
            } else if (error.message.includes("out of gas")) {
                errorMessage = "Transaksi kehabisan gas saat update. Coba tingkatkan batas gas.";
            } else if (error.message.includes("revert")) {
                const revertReason = error.message.substring(error.message.indexOf("revert") + 6).trim();
                errorMessage = `Transaksi dibatalkan: ${revertReason}.`;
            }
            alert(errorMessage);
            throw error;
        }
    }, [account, loadPasienData]);

    const updatePasienRumahSakit = useCallback(async (newAdminRSAddress) => {
        try {
            const GAS_LIMIT = 1000000; // Estimasi gas untuk update RS

            await contract.methods.updatePasienRumahSakit(newAdminRSAddress).send({
                from: account,
                gas: GAS_LIMIT
            });
            alert("Rumah Sakit Penanggung Jawab berhasil diperbarui!");
            await loadPasienData();
        } catch (error) {
            console.error("Error updating patient hospital:", error);
            let errorMessage = "Gagal memperbarui RS Penanggung Jawab. Lihat konsol untuk detail.";
            if (error.message.includes("out of gas")) {
                errorMessage = "Transaksi kehabisan gas saat update RS. Coba tingkatkan batas gas.";
            } else if (error.message.includes("revert")) {
                const revertReason = error.message.substring(error.message.indexOf("revert") + 6).trim();
                errorMessage = `Transaksi dibatalkan: ${revertReason}.`;
            }
            alert(errorMessage);
            throw error;
        }
    }, [account, loadPasienData]);


    useEffect(() => {
        const parsed = queryString.parse(window.location.search);
        const addressFromUrl = parsed.address;

        if (addressFromUrl && web3.utils.isAddress(addressFromUrl)) {
            console.log("URL param address detected:", addressFromUrl);
            if (account !== addressFromUrl) {
                async function connectAndVerify() {
                    setLoading(true);
                    try {
                        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                        if (accounts[0].toLowerCase() === addressFromUrl.toLowerCase()) {
                            setAccount(accounts[0]);
                            console.log("Metamask connected to URL address:", accounts[0]);
                        } else {
                            setError("Metamask terhubung ke akun yang berbeda dari QR code. Silakan ganti akun.");
                            setLoading(false);
                        }
                    } catch (connectError) {
                        console.error("Error connecting Metamask via QR scan:", connectError);
                        setError("Gagal terhubung ke Metamask. Pastikan Metamask aktif dan berikan izin.");
                        setLoading(false);
                    }
                }
                connectAndVerify();
            } else {
                loadPasienData();
            }
        } else if (account) {
            loadPasienData();
        } else {
            setLoading(false);
        }
    }, [account, setAccount, loadPasienData]);

    useEffect(() => {
        fetchAdminRSList();
    }, [fetchAdminRSList]);

    useEffect(() => {
        if (account && !isRegistered && (nextPatientId === '' || nextPatientId === 'P-ERR')) {
            generateNextPatientId();
        }
    }, [account, isRegistered, nextPatientId, generateNextPatientId]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen text-blue-700 text-xl font-semibold">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mr-3"></div>
                Memuat data pasien...
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center h-screen bg-red-50 border-l-4 border-red-400 p-4 text-red-700 font-medium">
                <span className="text-2xl mr-2">🚫</span> {error}
            </div>
        );
    }

    if (!isRegistered) {
        return (
            <PasienRegisterPage
                submitDataDiri={submitDataDiri}
                form={form}
                setForm={setForm}
                listAdminRS={listAdminRS}
                onLogout={onLogout}
                nextPatientId={nextPatientId}
            />
        );
    }

    return (
        <div className="flex min-h-screen bg-gray-50">
            <PasienSideBar
                setActiveMenu={setActiveMenu}
                activeMenu={activeMenu}
                onLogout={onLogout}
                namaPasien={dataDiri?.nama || "Pasien"}
            />
            <div className="flex-1 p-8">
                {activeMenu === "dataDiri" && dataDiri ? (
                    <DataDiriPasien
                        dataDiri={dataDiri}
                        listAdminRS={listAdminRS}
                        updatePasienData={updatePasienData}
                        updatePasienRumahSakit={updatePasienRumahSakit}
                    />
                ) : activeMenu === "rekamMedisHistory" ? (
                    <RekamMedisHistory
                        rekamMedisIds={rekamMedisIds}
                        rekamMedisTerbaru={rekamMedisTerbaru}
                        accountContext={account}
                    />
                ) : (
                    <div className="flex justify-center items-center min-h-[70vh] text-gray-500 text-lg italic bg-white p-6 rounded-lg shadow-md">
                        <span className="text-4xl mr-3">✨</span> Pilih menu dari sidebar untuk melihat informasi Anda.
                    < /div>
                )}
            </div>
        </div>
    );
}