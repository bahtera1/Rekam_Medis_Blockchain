// AdminPage.js

import React, { useState, useEffect, useCallback } from "react";
import contract from "../contract";
import ManageDokterPage from "./ManageDokterPage";
import ManagePasienPage from "./ManagePasienPage";
import ManageAssign from "./ManageAssign";
import AdminSideBar from "./AdminSideBar";

export default function AdminPage({ account, onLogout }) {
    // State untuk form dokter
    const [dokterAddress, setDokterAddress] = useState("");
    const [dokterNama, setDokterNama] = useState("");
    const [dokterSpesialisasi, setDokterSpesialisasi] = useState("");
    const [dokterNomorLisensi, setDokterNomorLisensi] = useState("");

    // State untuk data yang diambil dari kontrak
    const [dokterList, setDokterList] = useState([]); // List dokter lengkap (aktif/non-aktif) dari RS ini
    const [listPasien, setListPasien] = useState([]); // Pasien yang berafiliasi dengan RS admin ini
    const [assignedPairs, setAssignedPairs] = useState([]); // Pasangan dokter-pasien yang AKTIF

    // --- State Baru untuk Melacak Pasien yang Sudah Ditugaskan ---
    const [assignedPatientAddresses, setAssignedPatientAddresses] = useState(new Set()); 

    // State untuk form assign
    const [selectedDokter, setSelectedDokter] = useState("");
    const [pasienAddress, setPasienAddress] = useState("");

    const [loading, setLoading] = useState(false);
    const [activePage, setActivePage] = useState("manageDokter");
    const [namaRumahSakit, setNamaRumahSakit] = useState("");

    // --- Helper function untuk mengekstrak pesan error dari objek error Web3 ---
    const getWeb3ErrorMessage = (err) => {
        let errorMessage = "Terjadi kesalahan yang tidak diketahui.";
        if (err.message) {
            if (err.message.includes("revert")) {
                const revertReasonMatch = err.message.match(/revert\s(.*)/);
                if (revertReasonMatch && revertReasonMatch[1]) {
                    errorMessage = revertReasonMatch[1].trim();
                } else {
                    errorMessage = "Transaksi dibatalkan oleh smart contract (revert).";
                }
            } else if (err.message.includes("User denied transaction signature")) {
                errorMessage = "Transaksi dibatalkan oleh pengguna.";
            } else if (err.code === 4001) { // Common code for Metamask user denied
                errorMessage = "Transaksi dibatalkan oleh pengguna.";
            } else {
                errorMessage = err.message;
            }
        } else if (err.data && err.data.message) {
            errorMessage = err.data.message;
        } else if (err.reason) {
            errorMessage = err.reason;
        }
        return errorMessage;
    };


    // --- Fetching Data Functions ---

    const fetchNamaRS = useCallback(async () => {
        try {
            const adminData = await contract.methods.dataAdmin(account).call();
            console.log("Data Admin RS:", adminData);
            if (adminData && adminData.namaRumahSakit) {
                setNamaRumahSakit(adminData.namaRumahSakit);
            } else {
                setNamaRumahSakit("");
            }
        } catch (err) {
            console.error("Gagal mengambil nama RS:", err);
            setNamaRumahSakit("");
        }
    }, [account]);

    const fetchDokterList = useCallback(async () => {
        setLoading(true);
        try {
            const total = await contract.methods.totalDokter().call();
            const list = [];
            for (let i = 0; i < total; i++) {
                const addr = await contract.methods.getDokterByIndex(i).call();
                const result = await contract.methods.getDokter(addr).call();
                if (result[5].toLowerCase() === account.toLowerCase()) {
                    list.push({
                        address: addr,
                        nama: result[0],
                        spesialisasi: result[1],
                        nomorLisensi: result[2],
                        aktif: result[3],
                        assignedPasien: result[4],
                        adminRS: result[5],
                    });
                }
            }
            setDokterList(list);
        } catch (err) {
            console.error("Gagal mengambil daftar dokter:", err);
            setDokterList([]);
        } finally {
            setLoading(false);
        }
    }, [account]);

    const fetchPasienList = useCallback(async () => {
        setLoading(true);
        try {
            const pasienAddressesForCurrentAdminRS = await contract.methods.getPasienByAdminRS().call({ from: account });

            const list = [];
            for (const addr of pasienAddressesForCurrentAdminRS) {
                const data = await contract.methods.getPasienData(addr).call();

                list.push({
                    address: addr,
                    nama: data[0],
                    ID: data[1],
                    NIK: data[2],
                    golonganDarah: data[3],
                    tanggalLahir: data[4],
                    gender: data[5],
                    alamat: data[6],
                    noTelepon: data[7],
                    email: data[8],
                    rumahSakitPenanggungJawab: data[9],
                });
            }
            setListPasien(list);
        } catch (err) {
            console.error("Gagal mengambil daftar pasien:", err);
            setListPasien([]);
        } finally {
            setLoading(false);
        }
    }, [account]);

    // --- PENGOLAHAN assignedPairs & assignedPatientAddresses ---
    const processAssignedData = useCallback(() => {
        const tempAssignedPairs = [];
        const tempAssignedPatientAddresses = new Set(); // Reset Set untuk setiap pemrosesan

        for (const dok of dokterList) {
            if (dok.adminRS.toLowerCase() === account.toLowerCase() && dok.assignedPasien && dok.assignedPasien.length > 0) {
                const patientsForThisDoctor = [];
                for (const pasienAddr of dok.assignedPasien) {
                    const pasienData = listPasien.find(p => p.address.toLowerCase() === pasienAddr.toLowerCase());
                    if (pasienData && pasienData.rumahSakitPenanggungJawab.toLowerCase() === account.toLowerCase()) {
                        patientsForThisDoctor.push({
                            nama: pasienData.nama,
                            address: pasienAddr,
                            ID: pasienData.ID,
                            NIK: pasienData.NIK,
                        });
                        tempAssignedPatientAddresses.add(pasienAddr.toLowerCase()); // Tambahkan ke Set
                    }
                }
                if (patientsForThisDoctor.length > 0) {
                    tempAssignedPairs.push({
                        dokterNama: dok.nama,
                        dokterLisensi: dok.nomorLisensi,
                        dokterSpesialisasi: dok.spesialisasi,
                        dokterAddress: dok.address,
                        pasienList: patientsForThisDoctor,
                    });
                }
            }
        }
        setAssignedPairs(tempAssignedPairs);
        setAssignedPatientAddresses(tempAssignedPatientAddresses); // Perbarui state Set
    }, [dokterList, listPasien, account]);


    // --- useEffect untuk Fetch Data Awal ---
    useEffect(() => {
        async function fetchAllInitialData() {
            if (account) {
                await fetchNamaRS();
                await fetchDokterList();
                await fetchPasienList();
            }
        }
        fetchAllInitialData();
    }, [account, fetchNamaRS, fetchDokterList, fetchPasienList]);

    // useEffect untuk memproses data penugasan setelah dokter/pasien list terupdate
    useEffect(() => {
        if (dokterList.length > 0 || listPasien.length > 0) {
            processAssignedData();
        } else if (!loading) {
            setAssignedPairs([]);
            setAssignedPatientAddresses(new Set()); // Kosongkan jika tidak ada data
        }
    }, [dokterList, listPasien, processAssignedData, loading]);


    // --- Handler untuk Operasi Kontrak ---

    const handleRefreshData = async () => {
        console.log("Refreshing all data...");
        setLoading(true);
        await fetchDokterList(); // Ini akan memicu ulang processAssignedData via useEffect
        await fetchPasienList(); // Ini juga
        // setLoading(false) akan dipanggil oleh fetchDokterList/fetchPasienList.finally
    };

    const registerDokter = async () => {
        if (!dokterAddress || !dokterNama || !dokterSpesialisasi || !dokterNomorLisensi) {
            alert("Semua data dokter harus diisi.");
            return;
        }

        try {
            setLoading(true);

            // --- VALIDASI FRONTEND UNTUK ALAMAT DOKTER ---
            const lowerDokterAddress = dokterAddress.toLowerCase();

            // 1. Cek apakah sudah terdaftar sebagai Dokter
            const isDokterRegistered = await contract.methods.isDokter(lowerDokterAddress).call();
            if (isDokterRegistered) {
                alert("Pendaftaran gagal: Alamat ini sudah terdaftar sebagai dokter.");
                console.warn("Validasi Frontend: Alamat sudah terdaftar sebagai dokter.");
                setLoading(false);
                return;
            }

            // 2. Cek apakah sudah terdaftar sebagai Pasien
            const isPasienRegistered = await contract.methods.isPasien(lowerDokterAddress).call();
            if (isPasienRegistered) {
                alert("Pendaftaran gagal: Alamat ini sudah terdaftar sebagai pasien, tidak bisa menjadi dokter.");
                console.warn("Validasi Frontend: Alamat sudah terdaftar sebagai pasien.");
                setLoading(false);
                return;
            }

            // 3. Cek apakah sudah terdaftar sebagai Admin RS lain (atau Admin RS yang sama)
            const adminData = await contract.methods.dataAdmin(lowerDokterAddress).call();
            if (adminData && adminData.namaRumahSakit && adminData.namaRumahSakit.length > 0) {
                alert("Pendaftaran gagal: Alamat ini sudah terdaftar sebagai Admin RS, tidak bisa menjadi dokter.");
                console.warn("Validasi Frontend: Alamat sudah terdaftar sebagai Admin RS.");
                setLoading(false);
                return;
            }
            // --- AKHIR VALIDASI FRONTEND ---

            await contract.methods
                .registerDokter(dokterAddress, dokterNama, dokterSpesialisasi, dokterNomorLisensi)
                .send({ from: account });

            alert("Dokter berhasil didaftarkan.");
            setDokterAddress("");
            setDokterNama("");
            setDokterSpesialisasi("");
            setDokterNomorLisensi("");
            await handleRefreshData();
        } catch (err) {
            console.error("Gagal mendaftarkan dokter (Transaksi Blockchain):", err);
            const errorMessage = getWeb3ErrorMessage(err);
            alert(`Pendaftaran gagal: ${errorMessage}`);
        } finally {
            setLoading(false);
        }
    };


    const toggleStatusDokter = async (addr, curStatus) => {
        try {
            setLoading(true);

            await contract.methods.setStatusDokter(addr, !curStatus).send({ from: account });

            if (curStatus === true) { // Jika status baru adalah NON-AKTIF (sebelumnya aktif)
                const doctorToDeactivate = dokterList.find(d => d.address.toLowerCase() === addr.toLowerCase());
                if (doctorToDeactivate && doctorToDeactivate.assignedPasien && doctorToDeactivate.assignedPasien.length > 0) {
                    const confirmUnassign = window.confirm(
                        `Anda menonaktifkan dokter ${doctorToDeactivate.nama}. ` +
                        `Apakah Anda juga ingin secara otomatis melepaskan ${doctorToDeactivate.assignedPasien.length} pasien yang ditugaskan kepadanya? ` +
                        `Ini akan memicu ${doctorToDeactivate.assignedPasien.length} transaksi tambahan dan mungkin memakan waktu.`
                    );

                    if (confirmUnassign) {
                        alert(`Memulai proses pelepasan penugasan untuk ${doctorToDeactivate.assignedPasien.length} pasien. Harap konfirmasi di dompet Anda untuk setiap transaksi.`);
                        for (const pasienAddr of doctorToDeactivate.assignedPasien) {
                            try {
                                console.log(`Attempting to unassign patient ${pasienAddr} from doctor ${addr}`);
                                await contract.methods.unassignPasienFromDokter(addr, pasienAddr).send({ from: account });
                                console.log(`Successfully unassigned ${pasienAddr}`);
                            } catch (unassignErr) {
                                console.error(`Gagal melepaskan penugasan pasien ${pasienAddr} dari dokter ${addr}:`, unassignErr);
                                alert(`Peringatan: Gagal melepaskan penugasan pasien ${pasienAddr}. Silakan periksa konsol.`);
                            }
                        }
                        alert("Proses pelepasan penugasan selesai.");
                    } else {
                        alert("Pelepasan penugasan pasien dibatalkan oleh pengguna.");
                    }
                }
            }

            alert(`Status dokter diperbarui menjadi ${!curStatus ? "Aktif" : "Non-aktif"}.`);
            await handleRefreshData();
        } catch (err) {
            console.error("Gagal memperbarui status dokter:", err);
            const errorMessage = getWeb3ErrorMessage(err);
            alert(`Gagal memperbarui status: ${errorMessage}`);
        } finally {
            setLoading(false);
        }
    };

    const updateDokterInfo = async (address, nama, spesialisasi, nomorLisensi) => {
        if (!address || !nama || !spesialisasi || !nomorLisensi) {
            alert("Semua data dokter untuk pembaruan harus diisi.");
            return;
        }
        try {
            setLoading(true);
            await contract.methods
                .updateDokterInfo(address, nama, spesialisasi, nomorLisensi)
                .send({ from: account });
            alert("Informasi dokter berhasil diperbarui.");
            await handleRefreshData();
        } catch (err) {
            console.error("Gagal memperbarui informasi dokter:", err);
            const errorMessage = getWeb3ErrorMessage(err);
            alert(`Gagal memperbarui informasi: ${errorMessage}`);
        } finally {
            setLoading(false);
        }
    };

    const assignPasien = async () => {
        if (!selectedDokter || !pasienAddress) {
            alert("Pilih dokter dan pasien.");
            return;
        }
        try {
            setLoading(true);
            // --- VALIDASI FRONTEND UNTUK PASIEN YANG SUDAH DITUGASKAN ---
            if (assignedPatientAddresses.has(pasienAddress.toLowerCase())) {
                const patientName = listPasien.find(p => p.address.toLowerCase() === pasienAddress.toLowerCase())?.nama || pasienAddress;
                alert(`Gagal menugaskan: Pasien "${patientName}" sudah ditugaskan ke dokter lain.`);
                console.warn(`Validasi Frontend: Pasien ${patientName} (${pasienAddress}) sudah ditugaskan.`);
                setLoading(false);
                return;
            }
            // --- AKHIR VALIDASI FRONTEND ---

            await contract.methods.assignPasienToDokter(selectedDokter, pasienAddress).send({ from: account });
            alert("Pasien berhasil ditugaskan ke dokter.");
            setPasienAddress("");
            setSelectedDokter("");
            await handleRefreshData(); // Ini akan memicu pembaruan assignedPatientAddresses
        } catch (err) {
            console.error("Gagal menugaskan pasien:", err);
            const errorMessage = getWeb3ErrorMessage(err);
            alert(`Gagal menugaskan: ${errorMessage}`);
        } finally {
            setLoading(false);
        }
    };

    const unassignPasien = async (_dokterAddress, _pasienAddress) => {
        try {
            setLoading(true);
            await contract.methods.unassignPasienFromDokter(_dokterAddress, _pasienAddress).send({ from: account });
            alert("Pasien berhasil dibatalkan penugasannya dari dokter.");
            await handleRefreshData(); // Ini akan memicu pembaruan assignedPatientAddresses
        } catch (error) {
            console.error("Gagal membatalkan penugasan pasien:", error);
            const errorMessage = getWeb3ErrorMessage(error);
            alert(`Gagal membatalkan penugasan: ${errorMessage}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-row min-h-screen w-full">
            <AdminSideBar
                activePage={activePage}
                setActivePage={setActivePage}
                onLogout={onLogout}
                namaRumahSakit={namaRumahSakit}
            />
            <div className="flex-1 p-12 bg-white shadow-inner overflow-y-auto transition-all duration-300 sm:p-8 xs:p-6">
                <h2
                    className="mb-8 text-4xl font-bold text-gray-800 tracking-tight relative animate-fadeIn sm:text-3xl xs:text-2xl
                    after:content-[''] after:absolute after:bottom-[-10px] after:left-0 after:w-20 after:h-1 after:bg-blue-500 after:rounded"
                >
                    {activePage === "manageDokter" && "MANAJEMEN DOKTER"}
                    {activePage === "managePasien" && "PASIEN TERDAFTAR"}
                    {activePage === "manageAssign" && "PENUGASAN PASIEN-DOKTER"}
                    {!["manageDokter", "managePasien", "manageAssign"].includes(activePage) && "Panel Admin"}
                </h2>

                {activePage === "manageDokter" && (
                    <ManageDokterPage
                        dokterList={dokterList}
                        dokterAddress={dokterAddress}
                        dokterNama={dokterNama}
                        dokterSpesialisasi={dokterSpesialisasi}
                        dokterNomorLisensi={dokterNomorLisensi}
                        loading={loading}
                        setDokterAddress={setDokterAddress}
                        setDokterNama={setDokterNama}
                        setDokterSpesialisasi={setDokterSpesialisasi}
                        setDokterNomorLisensi={setDokterNomorLisensi}
                        registerDokter={registerDokter}
                        toggleStatusDokter={toggleStatusDokter}
                        updateDokterInfo={updateDokterInfo}
                    />
                )}
                {activePage === "managePasien" && (
                    <ManagePasienPage
                        loading={loading}
                        listPasien={listPasien}
                        account={account}
                        onPatientDataChange={handleRefreshData}
                    />
                )}
                {activePage === "manageAssign" && (
                    <ManageAssign
                        dokterList={dokterList.filter(d => d.aktif)}
                        listPasien={listPasien} // listPasien lengkap
                        selectedDokter={selectedDokter}
                        setSelectedDokter={setSelectedDokter}
                        pasienAddress={pasienAddress}
                        setPasienAddress={setPasienAddress}
                        assignPasien={assignPasien}
                        unassignPasien={unassignPasien}
                        loading={loading}
                        assignedPairs={assignedPairs}
                        assignedPatientAddresses={assignedPatientAddresses} // Prop baru untuk filtering
                        onAssignmentChange={handleRefreshData}
                    />
                )}
            </div>
        </div>
    );
}