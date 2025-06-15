import React, { useState, useEffect } from "react";
import DokterSideBar from "./DokterSideBar";
import DokterDashboard from "./DokterDashboard";
import DataPasien from "./DataPasien";
import contract from "../contract";

export default function DokterPage({ account, onLogout }) {
    const [assignedPatients, setAssignedPatients] = useState([]);
    const [dokterProfile, setDokterProfile] = useState(null);
    const [view, setView] = useState("dashboard");
    const [isLoading, setIsLoading] = useState(true);
    const [fetchError, setFetchError] = useState(null);

    useEffect(() => {
        async function fetchData() {
            if (!account || !contract) {
                setIsLoading(false);
                setFetchError("Akun atau kontrak tidak tersedia.");
                return;
            }

            console.log("DokterPage: Memulai fetch data untuk akun:", account);
            setIsLoading(true);
            setFetchError(null); // Reset error sebelum fetch baru

            try {
                // Panggil getDokter untuk mendapatkan detail dokter
                // Hasilnya adalah array: [nama, spesialisasi, nomorLisensi, aktif, pasienList, adminRS]
                const dokterData = await contract.methods.getDokter(account).call();

                // Periksa apakah data yang diterima valid (setidaknya ada field 'aktif')
                if (dokterData && typeof dokterData[3] !== 'undefined') {
                    const assignedPasienList = dokterData[4] || []; // pasienList ada di index ke-4
                    setAssignedPatients(assignedPasienList);
                    setDokterProfile({
                        nama: dokterData[0],
                        spesialisasi: dokterData[1],
                        nomorLisensi: dokterData[2],
                        aktif: dokterData[3], // boolean
                        adminRS: dokterData[5] // Mungkin berguna untuk info tambahan
                    });
                    console.log("DokterPage: Data berhasil diambil - Nama:", dokterData[0], "Aktif:", dokterData[3], "Pasien:", assignedPasienList.length);
                } else {
                    console.error("DokterPage: Data dokter tidak valid atau tidak ditemukan untuk akun:", account);
                    setFetchError("Data dokter tidak ditemukan. Pastikan akun Anda terdaftar sebagai dokter.");
                    setDokterProfile(null);
                    setAssignedPatients([]);
                }
            } catch (err) {
                console.error("DokterPage: Error saat mengambil data dokter:", err);
                // Coba ekstrak pesan revert jika ada
                const revertMessage = err.message.match(/revert (.+)/);
                const displayError = revertMessage ? revertMessage[1] : "Terjadi kesalahan saat mengambil data Anda.";
                setFetchError(`Gagal mengambil data: ${displayError}`);
                setDokterProfile(null);
                setAssignedPatients([]);
            } finally {
                setIsLoading(false);
            }
        }

        fetchData();
    }, [account]); // Bergantung pada `account`

    const handleSelect = (tab) => {
        if (tab === "logout") {
            if (window.confirm("Apakah Anda yakin ingin logout?")) {
                onLogout();
            }
        } else if (tab === "update") {
            // Cek jika dokter tidak aktif atau profil belum termuat
            if (!dokterProfile) {
                alert("Data profil dokter belum termuat atau tidak valid.");
                return;
            }
            if (!dokterProfile.aktif) {
                alert("Akun dokter Anda saat ini tidak aktif. Anda tidak dapat mengupdate data pasien.");
                return;
            }
            setView(tab);
        } else {
            setView(tab);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-slate-100">
                <div className="text-center">
                    <svg className="animate-spin h-10 w-10 text-blue-600 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="text-xl font-medium text-gray-700">Memuat data dokter...</p>
                </div>
            </div>
        );
    }

    if (fetchError && !dokterProfile) { // Hanya tampilkan error fatal jika profil gagal dimuat sama sekali
        return (
            <div className="flex flex-col justify-center items-center min-h-screen bg-slate-100 p-6 text-center">
                <svg className="w-16 h-16 text-red-500 mb-4" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <p className="text-2xl font-semibold text-red-600 mb-3">Terjadi Kesalahan</p>
                <p className="text-md text-gray-600 mb-6 max-w-md">{fetchError}</p>
                <button
                    onClick={onLogout}
                    className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition"
                >
                    Logout dan Coba Lagi
                </button>
            </div>
        );
    }

    // Jika dokterProfile null setelah loading selesai dan tidak ada error fatal (mis. akun bukan dokter), tampilkan pesan
    if (!dokterProfile) {
        return (
            <div className="flex flex-col justify-center items-center min-h-screen bg-slate-100 p-6 text-center">
                <svg className="w-16 h-16 text-yellow-500 mb-4" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor"><path d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                <p className="text-2xl font-semibold text-yellow-700 mb-3">Data Tidak Ditemukan</p>
                <p className="text-md text-gray-600 mb-6 max-w-md">
                    Tidak dapat memuat profil dokter untuk akun ini. Pastikan akun Anda terdaftar sebagai dokter.
                </p>
                <button
                    onClick={onLogout}
                    className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition"
                >
                    Logout
                </button>
            </div>
        );
    }


    return (
        <div className="min-h-screen flex flex-col sm:flex-row bg-slate-100">
            <DokterSideBar
                onSelect={handleSelect}
                activeTab={view}
                isActive={dokterProfile?.aktif}
                dokterNama={dokterProfile?.nama || "Dokter"}
            />
            <main className="flex-1 px-4 sm:px-8 py-8 sm:py-10 transition-all duration-300 overflow-y-auto">
                {view === "dashboard" && dokterProfile && (
                    <DokterDashboard
                        assignedPatients={assignedPatients}
                        dokterProfile={dokterProfile}
                    />
                )}
                {view === "update" && dokterProfile?.aktif && ( // Hanya render jika dokter aktif
                    <section className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 animate-fadeIn">
                        <DataPasien account={account} assignedPatients={assignedPatients} />
                    </section>
                )}
                {view === "update" && !dokterProfile?.aktif && (
                    <div className="flex flex-col items-center justify-center h-full p-6 bg-white rounded-2xl shadow-xl">
                        <svg className="w-16 h-16 text-red-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"></path></svg>
                        <h3 className="text-xl font-semibold text-red-700 mb-2">Akses Ditolak</h3>
                        <p className="text-gray-600 text-center">Akun dokter Anda tidak aktif. Anda tidak dapat mengakses halaman ini.</p>
                    </div>
                )}
            </main>
        </div>
    );
}