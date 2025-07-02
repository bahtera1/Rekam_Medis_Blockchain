// SuperAdminPage.jsx
import React, { useState, useEffect, useCallback, useMemo } from "react";
import contract from "../contract";
import AddAdminRSPage from "./AddAdminRSPage.jsx";
import EditAdminRSModal from "./EditAdminRSModal.jsx"; // Import komponen modal yang baru

// Icon untuk Edit
const IconEdit = ({ className = "w-4 h-4" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.4-8.4zm0 0L19.5 7.125m-1.5 1.5l-2.433 2.433m-1.875 1.875L9.75 10.5" />
    </svg>
);

// Icon untuk Aktif/Nonaktif
const IconToggle = ({ className = "w-4 h-4" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 10.5v6m3-3H9m4.06-7.19l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.456a2.25 2.25 0 00-1.555-2.107L15.682 5.25H12V4.75" />
    </svg>
);

// Icon untuk Tombol Registrasi
const PlusIcon = ({ className = "w-5 h-5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
);

// Icon untuk Logout
const IconLogout = ({ className = "w-5 h-5" }) => (
    <svg xmlns="http://www.w3.0000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
    </svg>
);

// Icon untuk Search
const IconSearch = ({ className = "w-5 h-5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
    </svg>
);


export default function SuperAdminPage({ account, onLogout }) {
    const [notif, setNotif] = useState("");
    const [notifType, setNotifType] = useState("info");

    const [daftarAdmin, setDaftarAdmin] = useState([]);
    const [loading, setLoading] = useState(false); // Global loading for main actions
    const [initialLoading, setInitialLoading] = useState(true);

    const [showConfirmModal, setShowConfirmModal] = useState(false);

    // State Modal Update Admin RS (sekarang hanya untuk mengontrol show/hide dan data yang akan diedit)
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [adminDataToEdit, setAdminDataToEdit] = useState(null); // Data yang akan dikirim ke modal

    // State Modal Konfirmasi Status Admin RS
    const [showStatusConfirmModal, setShowStatusConfirmModal] = useState(false);
    const [adminToToggleStatus, setAdminToToggleStatus] = useState(null);
    const [statusToSet, setStatusToSet] = useState(false);

    // State untuk tampilan form registrasi Admin RS baru
    const [showAddAdminForm, setShowAddAdminForm] = useState(false);

    // State untuk Search
    const [searchTerm, setSearchTerm] = useState("");

    // Fungsi ambil daftar Admin RS
    const fetchAdmins = useCallback(async () => {
        setInitialLoading(true);
        try {
            if (contract && contract.methods && contract.methods.getAllAdminRSAddresses && contract.methods.getAdminRS) {
                const adminAddresses = await contract.methods.getAllAdminRSAddresses().call();
                const detailedAdmins = await Promise.all(
                    adminAddresses.map(async (addr) => {
                        try {
                            const adminDataRaw = await contract.methods.getAdminRS(addr).call();
                            return {
                                address: addr,
                                namaRumahSakit: adminDataRaw[0],
                                aktif: adminDataRaw[1],
                                alamatRumahSakit: adminDataRaw[2],
                                kota: adminDataRaw[3],
                                NIBRS: adminDataRaw[4]
                            };
                        } catch (detailErr) {
                            console.error(`Error fetching admin ${addr}:`, detailErr);
                            // Notifikasi ini bisa muncul di SuperAdminPage
                            setNotif(`Gagal memuat detail untuk admin ${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}.`);
                            setNotifType("error");
                            return { address: addr, namaRumahSakit: "Gagal memuat", aktif: false, alamatRumahSakit: "", kota: "", NIBRS: "" };
                        }
                    })
                );
                setDaftarAdmin(detailedAdmins);
            } else {
                throw new Error("Kontrak atau metode tidak tersedia.");
            }
        } catch (err) {
            console.error("Fetch admins error:", err);
            setNotif("Gagal mengambil daftar admin RS! Pastikan kontrak sudah di-deploy dan ABI terbaru.");
            setNotifType("error");
            setDaftarAdmin([]);
        }
        setInitialLoading(false);
    }, []);

    useEffect(() => {
        if (account) {
            fetchAdmins();
        } else {
            setDaftarAdmin([]);
            setInitialLoading(false);
        }
    }, [account, fetchAdmins]);

    // Handler tampil/sembunyikan form AddAdminRSPage
    const handleShowAddAdminForm = () => {
        setNotif("");
        setShowAddAdminForm(true);
    };

    const handleHideAddAdminForm = () => {
        setShowAddAdminForm(false);
        fetchAdmins();
    };

    // Helper kelas notifikasi
    const getNotifClasses = () => {
        if (notifType === "success") return "bg-green-100 border-green-500 text-green-800";
        if (notifType === "error") return "bg-red-100 border-red-500 text-red-800";
        return "bg-sky-100 border-sky-500 text-sky-800";
    };

    // Handler Logout
    const handleLogoutClick = () => setShowConfirmModal(true);
    const confirmLogout = () => {
        if (onLogout) onLogout();
        setShowConfirmModal(false);
    };
    const cancelLogout = () => setShowConfirmModal(false);

    // Handler Edit Admin RS
    const handleEditClick = (adminData) => {
        setAdminDataToEdit(adminData); // Mengatur data yang akan diedit
        setShowUpdateModal(true); // Menampilkan modal
        setNotif(""); // Bersihkan notifikasi saat membuka modal
    };

    // Handler tutup modal edit
    const handleCloseUpdateModal = () => {
        setShowUpdateModal(false);
        setAdminDataToEdit(null); // Bersihkan data setelah modal ditutup
    };

    // Handler ubah status aktif/non-aktif
    const handleToggleStatusClick = (adminAddress, currentStatus) => {
        setAdminToToggleStatus({ address: adminAddress, currentStatus });
        setStatusToSet(!currentStatus);
        setShowStatusConfirmModal(true);
    };

    const confirmSetAdminRSStatus = async () => {
        if (!adminToToggleStatus) return;
        setNotif("");
        setLoading(true);
        try {
            if (!contract.methods.setStatusAdminRS) {
                throw new Error("Metode setStatusAdminRS tidak tersedia.");
            }
            await contract.methods.setStatusAdminRS(
                adminToToggleStatus.address,
                statusToSet
            ).send({ from: account });
            setNotif(`Sukses ${statusToSet ? "mengaktifkan" : "menonaktifkan"} Admin RS!`);
            setNotifType("success");
            setShowStatusConfirmModal(false);
            setAdminToToggleStatus(null);
            await fetchAdmins();
        } catch (err) {
            let errorMessage = `Gagal ${statusToSet ? "mengaktifkan" : "menonaktifkan"} Admin RS.`;
            if (err.message.includes("Admin RS tidak ditemukan")) {
                errorMessage = "Gagal: Admin RS tidak ditemukan di kontrak.";
            } else if (err.code === 4001) {
                errorMessage = "Transaksi ditolak oleh pengguna.";
            } else {
                errorMessage += ` Detail: ${err.message || String(err)}`;
                console.error("Set status Admin RS error:", err);
            }
            setNotif(errorMessage);
            setNotifType("error");
        }
        setLoading(false);
    };

    const cancelSetAdminRSStatus = () => {
        setShowStatusConfirmModal(false);
        setAdminToToggleStatus(null);
    };

    // Filtered Admins logic
    const filteredAdmins = useMemo(() => {
        if (!searchTerm) {
            return daftarAdmin;
        }
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        return daftarAdmin.filter(admin =>
            admin.namaRumahSakit.toLowerCase().includes(lowerCaseSearchTerm) ||
            admin.alamatRumahSakit.toLowerCase().includes(lowerCaseSearchTerm) ||
            admin.kota.toLowerCase().includes(lowerCaseSearchTerm) ||
            admin.NIBRS.toLowerCase().includes(lowerCaseSearchTerm) ||
            admin.address.toLowerCase().includes(lowerCaseSearchTerm) // Opsional: search by address
        );
    }, [daftarAdmin, searchTerm]);


    // Render kondisional: jika tampilkan form tambah admin RS
    if (showAddAdminForm) {
        return (
            <AddAdminRSPage
                account={account}
                fetchAdmins={fetchAdmins}
                setNotif={setNotif}
                setNotifType={setNotifType}
                onBack={handleHideAddAdminForm}
            />
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-100 to-blue-50 py-10 px-4 sm:px-6 lg:px-12">
            <div className="max-w-7xl mx-auto space-y-10">
                {/* Header */}
                <header>
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <h1 className="text-3xl font-bold text-gray-800">Beranda Super Admin</h1>
                        <button
                            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold px-5 py-2 rounded-lg shadow transition-colors"
                            onClick={handleLogoutClick}
                        >
                            <IconLogout />
                            Logout
                        </button>
                    </div>
                    <div className="mt-6 p-5 bg-white rounded-xl shadow border border-gray-200">
                        <p className="text-base text-gray-700">
                            <span className="font-semibold text-gray-800">Akun Terhubung:</span>
                            <span className="ml-2 font-mono text-blue-700 break-all bg-blue-100 px-3 py-1 rounded text-sm">
                                {account || "Tidak terhubung"}
                            </span>
                        </p>
                    </div>
                </header>

                {/* Notifikasi */}
                {notif && (
                    <div className={`border-l-4 p-4 rounded shadow ${getNotifClasses()}`} role="alert">
                        <p className="font-bold text-sm">
                            {notifType === "success" ? "Sukses!" : notifType === "error" ? "Error!" : "Info"}
                        </p>
                        <p className="text-sm mt-1">{notif}</p>
                    </div>
                )}

                {/* Tombol Registrasi RS Baru dan Search Bar */}
                <section className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    <button
                        className="flex items-center justify-center gap-2 w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg shadow transition-transform transform active:scale-95"
                        onClick={handleShowAddAdminForm}
                    >
                        <PlusIcon />
                        Tambah Rumah Sakit Baru
                    </button>
                    {/* Search Bar */}
                    <div className="relative w-full sm:w-72">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <IconSearch className="w-5 h-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Cari admin RS..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="block w-full rounded-lg border-gray-300 pl-10 pr-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                </section>

                {/* Tabel Daftar Admin RS */}
                <section className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
                    <div className="p-6">
                        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Daftar Admin RS Terdaftar</h2>
                        {initialLoading ? (
                            <div className="text-center py-12">
                                <svg
                                    className="animate-spin mx-auto h-10 w-10 text-blue-600"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                    ></circle>
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <p className="mt-3 text-gray-500 text-sm">Memuat daftar admin...</p>
                            </div>
                        ) : filteredAdmins.length === 0 ? (
                            <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 mx-auto text-gray-400 mb-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                                </svg>
                                <p className="text-gray-600 font-semibold text-lg">
                                    {searchTerm ? `Tidak ada hasil untuk "${searchTerm}"` : "Belum ada admin RS terdaftar."}
                                </p>
                                {!searchTerm && (
                                    <p className="text-sm text-gray-500 mt-1.5">Silakan daftarkan admin RS baru melalui form di atas.</p>
                                )}
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">No</th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Alamat Wallet Admin</th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Nama RS</th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Alamat RS</th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Kota</th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">NIBRS</th>
                                            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Status</th>
                                            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {filteredAdmins.map((adminData, idx) => (
                                            <tr
                                                key={adminData.address}
                                                className={`transition-colors duration-150 ${adminData.aktif
                                                    ? "bg-white hover:bg-gray-50"
                                                    : "bg-red-50 hover:bg-red-100"
                                                    }`}
                                            >
                                                <td className="px-4 py-3 text-sm text-center font-medium text-gray-700">{idx + 1}</td>
                                                <td className="px-4 py-3 text-sm text-gray-600 font-mono break-all">{adminData.address}</td>
                                                <td className="px-4 py-3 text-sm text-gray-800">{adminData.namaRumahSakit}</td>
                                                <td className="px-4 py-3 text-sm text-gray-600 break-words max-w-xs">{adminData.alamatRumahSakit || '-'}</td>
                                                <td className="px-4 py-3 text-sm text-gray-600">{adminData.kota || '-'}</td>
                                                <td className="px-4 py-3 text-sm text-gray-600">{adminData.NIBRS || '-'}</td>
                                                <td className="px-4 py-3 text-sm text-center">
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${adminData.aktif ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                                                        }`}>
                                                        {adminData.aktif ? "Aktif" : "Non-Aktif"}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-sm text-center">
                                                    <div className="flex justify-center space-x-2">
                                                        <button
                                                            onClick={() => handleEditClick(adminData)}
                                                            className="p-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-600 rounded-full transition-colors"
                                                            title="Edit Detail Admin RS"
                                                        >
                                                            <IconEdit />
                                                        </button>
                                                        <button
                                                            onClick={() => handleToggleStatusClick(adminData.address, adminData.aktif)}
                                                            className={`p-2 rounded-full transition-colors ${adminData.aktif
                                                                ? "bg-red-100 hover:bg-red-200 text-red-600"
                                                                : "bg-green-100 hover:bg-green-200 text-green-600"
                                                                }`}
                                                            title={adminData.aktif ? "Nonaktifkan Admin RS" : "Aktifkan Admin RS"}
                                                        >
                                                            <IconToggle />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </section>
            </div>

            {/* Modal Konfirmasi Logout */}
            {showConfirmModal && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-800 p-6 rounded-xl shadow-lg w-full max-w-md border border-gray-700">
                        <h3 className="text-xl font-semibold text-white mb-6 text-center">Konfirmasi Logout</h3>
                        <p className="text-gray-300 mb-8 text-center">
                            Apakah Anda yakin ingin keluar dari sesi ini?
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button
                                onClick={cancelLogout}
                                className="w-full sm:w-auto px-6 py-3 rounded-lg bg-gray-600 hover:bg-gray-500 text-gray-200 font-medium transition-colors"
                            >
                                Batal
                            </button>
                            <button
                                onClick={confirmLogout}
                                className="w-full sm:w-auto px-6 py-3 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold transition-colors"
                            >
                                Ya, Logout
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Render EditAdminRSModal */}
            <EditAdminRSModal
                show={showUpdateModal}
                onClose={handleCloseUpdateModal}
                adminData={adminDataToEdit}
                setNotif={setNotif}
                setNotifType={setNotifType}
                account={account}
                fetchAdmins={fetchAdmins}
            />

            {/* Modal Konfirmasi Ubah Status */}
            {showStatusConfirmModal && adminToToggleStatus && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-800 p-6 rounded-xl shadow-lg w-full max-w-md border border-gray-700">
                        <h3 className="text-xl font-semibold text-white mb-6 text-center">Konfirmasi Perubahan Status</h3>
                        <p className="text-gray-300 mb-8 text-center">
                            Anda akan {statusToSet ? "mengaktifkan" : "menonaktifkan"} Admin RS dengan alamat:
                            <br />
                            <span className="font-mono text-blue-300 break-all">{adminToToggleStatus.address}</span>
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button
                                onClick={cancelSetAdminRSStatus}
                                className="w-full sm:w-auto px-6 py-3 rounded-lg bg-gray-600 hover:bg-gray-500 text-gray-200 font-medium transition-colors"
                            >
                                Batal
                            </button>
                            <button
                                onClick={confirmSetAdminRSStatus}
                                className={`w-full sm:w-auto px-6 py-3 rounded-lg font-semibold transition-colors ${statusToSet ? "bg-green-600 hover:bg-green-700 text-white" : "bg-red-600 hover:bg-red-700 text-white"}`}
                                disabled={loading}
                            >
                                {loading ? "Memproses..." : `Ya, ${statusToSet ? "Aktifkan" : "Nonaktifkan"}`}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}