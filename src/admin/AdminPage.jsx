// AdminPage.js

import React, { useState, useEffect, useCallback } from "react";
import contract from "../contract";
import web3 from "../web3";
import ManageDokterPage from "./ManageDokterPage";
import ManagePasienPage from "./ManagePasienPage"; // <-- PERBAIKAN DI SINI
import ManageAssign from "./ManageAssign";
import AdminSideBar from "./AdminSideBar";

export default function AdminPage({ account, onLogout }) {
    const [dokterAddress, setDokterAddress] = useState("");
    const [dokterNama, setDokterNama] = useState("");
    const [dokterSpesialisasi, setDokterSpesialisasi] = useState("");
    const [dokterNomorLisensi, setDokterNomorLisensi] = useState("");
    const [dokterList, setDokterList] = useState([]);
    const [pasienAddress, setPasienAddress] = useState("");
    const [listPasien, setListPasien] = useState([]);
    const [selectedDokter, setSelectedDokter] = useState("");
    const [assignedPairs, setAssignedPairs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activePage, setActivePage] = useState("manageDokter");
    const [namaRumahSakit, setNamaRumahSakit] = useState("");

    // Di dalam file AdminPage.js
    const fetchNamaRS = useCallback(async () => {
        try {
            const adminData = await contract.methods.dataAdmin(account).call();

            // TAMBAHKAN BARIS INI UNTUK DEBUGGING
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
        try {
            const total = await contract.methods.totalDokter().call();
            const list = [];
            for (let i = 0; i < total; i++) {
                const addr = await contract.methods.getDokterByIndex(i).call();
                const result = await contract.methods.getDokter(addr).call();
                if (result[5] === account) {
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
        }
    }, [account]);

    const fetchPasienList = useCallback(async () => {
        try {
            const pasienArray = await contract.methods.getDaftarPasien().call();
            const list = [];
            const zeroAddress = "0x0000000000000000000000000000000000000000";

            for (const addr of pasienArray) {
                // getPasienData mengembalikan:
                // nama (0), ID (1), NIK (2), golonganDarah (3), tanggalLahir (4), gender (5),
                // alamat (6), noTelepon (7), email (8), rumahSakitPenanggungJawab (9)
                const data = await contract.methods.getPasienData(addr).call();

                // Hanya tampilkan pasien yang menjadi tanggung jawab RS ini ATAU pasien yang belum di-assign RS (address(0))
                // Indeks data[9] adalah rumahSakitPenanggungJawab setelah penambahan NIK
                if (data[9] === account || data[9] === zeroAddress) {
                    list.push({
                        address: addr,
                        nama: data[0],
                        ID: data[1],
                        NIK: data[2], // <-- Tambahkan NIK di sini
                        golonganDarah: data[3],
                        tanggalLahir: data[4],
                        gender: data[5],
                        alamat: data[6],
                        noTelepon: data[7],
                        email: data[8],
                        rumahSakitPenanggungJawab: data[9],
                    });
                }
            }
            setListPasien(list);
        } catch (err) {
            console.error("Gagal mengambil daftar pasien:", err);
        }
    }, [account]);

    // Di dalam file AdminPage.js

    const fetchAssignedPairs = useCallback(async () => {
        if (dokterList.length === 0 || listPasien.length === 0) {
            return;
        }
        try {
            const pairs = dokterList
                .filter(
                    (dok) =>
                        dok.adminRS === account &&
                        dok.assignedPasien &&
                        dok.assignedPasien.length > 0
                )
                .map((dok) => ({
                    dokterNama: dok.nama,
                    dokterLisensi: dok.nomorLisensi,
                    dokterSpesialisasi: dok.spesialisasi,
                    dokterAddress: dok.address,
                    pasienList: dok.assignedPasien.map((addr) => {
                        const pasienData = listPasien.find((p) => p.address === addr);
                        return {
                            nama: pasienData ? pasienData.nama : "Data Pasien Tidak Ditemukan",
                            address: addr,
                            ID: pasienData ? pasienData.ID : "-",
                            NIK: pasienData ? pasienData.NIK : "-", // <-- Tambahkan NIK di sini untuk ditampilkan di assignedPairs jika diperlukan
                        };
                    }),
                }));
            setAssignedPairs(pairs);
        } catch (err) {
            console.error("Gagal mengambil pairing dokter-pasien:", err);
        }
    }, [dokterList, listPasien, account]);

    useEffect(() => {
        async function fetchAllInitialData() {
            if (account) {
                setLoading(true);
                await fetchNamaRS();
                await fetchDokterList();
                await fetchPasienList();
                setLoading(false);
            }
        }
        fetchAllInitialData();
    }, [account, fetchNamaRS, fetchDokterList, fetchPasienList]);

    useEffect(() => {
        if (dokterList.length > 0 && listPasien.length > 0) {
            fetchAssignedPairs();
        }
    }, [dokterList, listPasien, fetchAssignedPairs]);

    const registerDokter = async () => {
        if (
            !dokterAddress ||
            !dokterNama ||
            !dokterSpesialisasi ||
            !dokterNomorLisensi
        ) {
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
            await fetchDokterList();
            await fetchPasienList(); // Memastikan list pasien juga diperbarui jika ada assign baru
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

    const toggleStatusDokter = async (addr, cur) => {
        try {
            setLoading(true);
            await contract.methods.setStatusDokter(addr, !cur).send({ from: account });
            alert("Status dokter diperbarui.");
            await fetchDokterList();
            await fetchPasienList(); // Memastikan list pasien juga diperbarui jika ada assign baru
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
            await fetchDokterList();
            await fetchPasienList(); // Memastikan list pasien juga diperbarui jika ada assign baru
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
            await fetchDokterList(); // Perbarui daftar dokter dan pasien setelah penugasan
            await fetchPasienList();
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
            const [from] = await web3.eth.getAccounts(); // Menggunakan web3.eth.getAccounts untuk mendapatkan pengirim
            await contract.methods.unassignPasienFromDokter(_dokterAddress, _pasienAddress).send({ from: from });
            alert("Pasien berhasil dibatalkan penugasannya dari dokter.");
            await fetchDokterList(); // Perbarui daftar dokter dan pasien setelah pembatalan penugasan
            await fetchPasienList();
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
                    />
                )}
            </div>
        </div>
    );
}