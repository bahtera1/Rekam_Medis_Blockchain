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

    // State untuk form assign
    const [selectedDokter, setSelectedDokter] = useState("");
    const [pasienAddress, setPasienAddress] = useState("");

    const [loading, setLoading] = useState(false);
    const [activePage, setActivePage] = useState("manageDokter");
    const [namaRumahSakit, setNamaRumahSakit] = useState("");

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
                // Filter dokter hanya yang berafiliasi dengan RS admin yang login
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

    const fetchAssignedPairs = useCallback(async () => {
        if (loading || (dokterList.length === 0 && listPasien.length === 0)) {
            setAssignedPairs([]);
            return;
        }

        try {
            const activeDoctorsForAssignmentDisplay = dokterList.filter(dok => dok.aktif);

            const pairs = activeDoctorsForAssignmentDisplay
                .filter(dok =>
                    dok.adminRS.toLowerCase() === account.toLowerCase() &&
                    dok.assignedPasien &&
                    dok.assignedPasien.length > 0
                )
                .map(dok => ({
                    dokterNama: dok.nama,
                    dokterLisensi: dok.nomorLisensi,
                    dokterSpesialisasi: dok.spesialisasi,
                    dokterAddress: dok.address,
                    pasienList: dok.assignedPasien
                        .map(pasienAddr => {
                            const pasienData = listPasien.find(p => p.address.toLowerCase() === pasienAddr.toLowerCase());

                            if (pasienData && pasienData.rumahSakitPenanggungJawab.toLowerCase() === account.toLowerCase()) {
                                return {
                                    nama: pasienData.nama,
                                    address: pasienAddr,
                                    ID: pasienData.ID,
                                    NIK: pasienData.NIK,
                                };
                            }
                            return null;
                        })
                        .filter(p => p !== null),
                }));
            setAssignedPairs(pairs);
        } catch (err) {
            console.error("Gagal mengambil pairing dokter-pasien:", err);
            setAssignedPairs([]);
        }
    }, [dokterList, listPasien, account, loading]);


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

    // useEffect untuk fetchAssignedPairs (bergantung pada dokterList dan listPasien)
    useEffect(() => {
        if (dokterList.length > 0 || listPasien.length > 0) {
            fetchAssignedPairs();
        } else if (!loading) {
            setAssignedPairs([]);
        }
    }, [dokterList, listPasien, fetchAssignedPairs, loading]);


    // --- Handler untuk Operasi Kontrak ---

    const handleRefreshData = async () => {
        console.log("Refreshing all data...");
        setLoading(true);
        await fetchDokterList();
        await fetchPasienList();
        setLoading(false);
    };

    const registerDokter = async () => {
        if (!dokterAddress || !dokterNama || !dokterSpesialisasi || !dokterNomorLisensi) {
            alert("Semua data dokter harus diisi.");
            return;
        }
        try {
            setLoading(true);
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
            console.error("Gagal mendaftarkan dokter:", err);
            const errorMessage = err.message.includes("revert")
                ? err.message.substring(err.message.indexOf("revert") + "revert".length).trim()
                : "Gagal mendaftarkan dokter. Cek konsol untuk detail.";
            alert(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const toggleStatusDokter = async (addr, curStatus) => {
        try {
            setLoading(true);

            // 1. Ubah status dokter di kontrak
            await contract.methods.setStatusDokter(addr, !curStatus).send({ from: account });

            // 2. Jika status baru adalah NON-AKTIF, tawarkan untuk unassign semua pasiennya
            if (!curStatus === false) {
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

            // --- BARIS YANG DIPERBAIKI ---
            // Menggunakan !curStatus secara langsung untuk menentukan string status yang benar
            alert(`Status dokter diperbarui menjadi ${!curStatus ? "Aktif" : "Non-aktif"}.`);

            await handleRefreshData();
        } catch (err) {
            console.error("Gagal memperbarui status dokter:", err);
            const errorMessage = err.message.includes("revert")
                ? err.message.substring(err.message.indexOf("revert") + "revert".length).trim()
                : "Gagal memperbarui status dokter. Cek konsol untuk detail.";
            alert(errorMessage);
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
            const errorMessage = err.message.includes("revert")
                ? err.message.substring(err.message.indexOf("revert") + "revert".length).trim()
                : "Gagal memperbarui informasi dokter. Cek konsol untuk detail.";
            alert(errorMessage);
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
            await contract.methods.assignPasienToDokter(selectedDokter, pasienAddress).send({ from: account });
            alert("Pasien berhasil ditugaskan ke dokter.");
            setPasienAddress("");
            setSelectedDokter("");
            await handleRefreshData();
        } catch (err) {
            console.error("Gagal menugaskan pasien:", err);
            const errorMessage = err.message.includes("revert")
                ? err.message.substring(err.message.indexOf("revert") + "revert".length).trim()
                : "Gagal menugaskan pasien. Cek konsol untuk detail.";
            alert(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const unassignPasien = async (_dokterAddress, _pasienAddress) => {
        try {
            setLoading(true);
            await contract.methods.unassignPasienFromDokter(_dokterAddress, _pasienAddress).send({ from: account });
            alert("Pasien berhasil dibatalkan penugasannya dari dokter.");
            await handleRefreshData();
        } catch (error) {
            console.error("Gagal membatalkan penugasan pasien:", error);
            const errorMessage = error.message.includes("revert")
                ? error.message.substring(error.message.indexOf("revert") + "revert".length).trim()
                : "Gagal membatalkan penugasan pasien. Cek konsol untuk detail.";
            alert(errorMessage);
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
                        listPasien={listPasien}
                        selectedDokter={selectedDokter}
                        setSelectedDokter={setSelectedDokter}
                        pasienAddress={pasienAddress}
                        setPasienAddress={setPasienAddress}
                        assignPasien={assignPasien}
                        unassignPasien={unassignPasien}
                        loading={loading}
                        assignedPairs={assignedPairs}
                        onAssignmentChange={handleRefreshData}
                    />
                )}
            </div>
        </div>
    );
}