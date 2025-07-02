// SuperAdminPage.jsx
import React, { useState, useEffect, useCallback } from "react";
import contract from "../contract";
import AddAdminRSPage from "./AddAdminRSPage.jsx";

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
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
    </svg>
);


export default function SuperAdminPage({ account, onLogout }) {
    const [notif, setNotif] = useState("");
    const [notifType, setNotifType] = useState("info");

    const [daftarAdmin, setDaftarAdmin] = useState([]);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);

    const [showConfirmModal, setShowConfirmModal] = useState(false);

    // State Modal Update Admin RS
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [currentAdminToUpdate, setCurrentAdminToUpdate] = useState(null);
    const [updateFormData, setUpdateFormData] = useState({
        namaRumahSakit: "",
        alamatRumahSakut: "",
        kota: "",
        NIBRS: ""
    });
    // Menambahkan state untuk melacak apakah ada perubahan pada form update
    const [hasChanges, setHasChanges] = useState(false);

    // State Modal Konfirmasi Status Admin RS
    const [showStatusConfirmModal, setShowStatusConfirmModal] = useState(false);
    const [adminToToggleStatus, setAdminToToggleStatus] = useState(null);
    const [statusToSet, setStatusToSet] = useState(false);

    // State untuk tampilan form registrasi Admin RS baru
    const [showAddAdminForm, setShowAddAdminForm] = useState(false);

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
                                alamatRumahSakut: adminDataRaw[2],
                                kota: adminDataRaw[3],
                                NIBRS: adminDataRaw[4]
                            };
                        } catch (detailErr) {
                            console.error(`Error fetching admin ${addr}:`, detailErr);
                            setNotif(`Gagal memuat detail untuk admin ${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}.`);
                            setNotifType("error");
                            return { address: addr, namaRumahSakit: "Gagal memuat", aktif: false, alamatRumahSakut: "", kota: "", NIBRS: "" };
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
        setCurrentAdminToUpdate(adminData);
        setUpdateFormData({
            namaRumahSakit: adminData.namaRumahSakit,
            alamatRumahSakut: adminData.alamatRumahSakut, // Perhatikan penulisan "alamatRumahSakut"
            kota: adminData.kota,
            NIBRS: adminData.NIBRS
        });
        setHasChanges(false); // Set false di awal saat modal dibuka
        setNotif(""); // Bersihkan notifikasi saat membuka modal
        setShowUpdateModal(true);
    };

    // Handler perubahan input pada form update
    const handleUpdateFormChange = (e) => {
        const { id, value } = e.target;
        // Gunakan destructuring yang sesuai dengan nama state Anda
        const fieldName = id === 'updateNamaRS' ? 'namaRumahSakit' :
            id === 'updateAlamatRS' ? 'alamatRumahSakut' : // Perhatikan penulisan
                id === 'updateKotaRS' ? 'kota' :
                    id === 'updateNIBRS' ? 'NIBRS' : id; // Default fallback, meskipun seharusnya tercover

        setUpdateFormData(prev => {
            const newData = { ...prev, [fieldName]: value };

            // Cek apakah ada perubahan dibandingkan data awal
            const changed = (
                newData.namaRumahSakit !== currentAdminToUpdate.namaRumahSakit ||
                newData.alamatRumahSakut !== currentAdminToUpdate.alamatRumahSakut || // Perhatikan penulisan
                newData.kota !== currentAdminToUpdate.kota ||
                newData.NIBRS !== currentAdminToUpdate.NIBRS
            );
            setHasChanges(changed);
            return newData;
        });
    };

    const handleUpdateAdminRSDetails = async (e) => {
        e.preventDefault();
        if (!currentAdminToUpdate) return;

        // Tidak perlu validasi hasChanges di sini lagi, karena tombolnya sudah disabled
        // if (!hasChanges && !loading) { /* ... */ }

        // Validasi form kosong saat update
        if (!updateFormData.namaRumahSakit.trim() ||
            !updateFormData.alamatRumahSakut.trim() || // Perhatikan penulisan
            !updateFormData.kota.trim() ||
            !updateFormData.NIBRS.trim()) {
            setNotif("Semua field detail rumah sakit tidak boleh kosong.");
            setNotifType("error");
            return;
        }

        setNotif("");
        setLoading(true);
        try {
            if (!contract.methods.updateAdminRSDetails) {
                throw new Error("Metode updateAdminRSDetails tidak tersedia.");
            }
            await contract.methods.updateAdminRSDetails(
                currentAdminToUpdate.address,
                updateFormData.namaRumahSakit,
                updateFormData.alamatRumahSakut, // Perhatikan penulisan
                updateFormData.kota,
                updateFormData.NIBRS
            ).send({ from: account });

            setNotif("Sukses memperbarui detail Admin RS!");
            setNotifType("success");
            setShowUpdateModal(false);
            setCurrentAdminToUpdate(null);
            setHasChanges(false); // Reset setelah sukses
            await fetchAdmins();
        } catch (err) {
            let errorMessage = "Gagal memperbarui detail Admin RS.";
            if (err.message.includes("IDRS sudah digunakan") || err.message.includes("NIBRS sudah digunakan") || err.message.includes("Nomor Induk Berusaha sudah digunakan")) {
                errorMessage = "Gagal memperbarui: NIBRS baru sudah digunakan.";
            } else if (err.message.includes("Nama Rumah Sakit baru tidak boleh kosong") || err.message.includes("Nama Rumah Sakit tidak boleh kosong")) {
                errorMessage = "Gagal memperbarui: Nama Rumah Sakit tidak boleh kosong.";
            } else if (err.message.includes("Nomor Induk Berusaha Rumah Sakit tidak boleh kosong") || err.message.includes("NIBRS tidak boleh kosong")) {
                errorMessage = "Gagal memperbarui: NIBRS tidak boleh kosong.";
            } else if (err.code === 4001) {
                errorMessage = "Transaksi ditolak oleh pengguna.";
            } else {
                errorMessage += ` Detail: ${err.message || String(err)}`;
                console.error("Update Admin RS error:", err);
            }
            setNotif(errorMessage);
            setNotifType("error");
        } finally {
            setLoading(false);
        }
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
            <div className="max-w-6xl mx-auto space-y-10">
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

                {/* Tombol Registrasi RS Baru */}
                <section>
                    <button
                        className="flex items-center justify-center gap-2 w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg shadow transition-transform transform active:scale-95"
                        onClick={handleShowAddAdminForm}
                    >
                        <PlusIcon />
                        Tambah Rumah Sakit Baru
                    </button>
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
                        ) : daftarAdmin.length === 0 ? (
                            <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 mx-auto text-gray-400 mb-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                                </svg>
                                <p className="text-gray-600 font-semibold text-lg">Belum ada admin RS terdaftar.</p>
                                <p className="text-sm text-gray-500 mt-1.5">Silakan daftarkan admin RS baru melalui form di atas.</p>
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
                                        {daftarAdmin.map((adminData, idx) => (
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
                                                <td className="px-4 py-3 text-sm text-gray-600 break-words max-w-xs">{adminData.alamatRumahSakut || '-'}</td>
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

            {/* Modal Edit Admin RS */}
            {showUpdateModal && currentAdminToUpdate && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
                    <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-lg border border-gray-200">
                        <h3 className="text-xl font-semibold text-gray-800 mb-6 text-center">Edit Detail Admin RS</h3>
                        <form onSubmit={handleUpdateAdminRSDetails} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Alamat Admin (Tidak dapat diubah)</label>
                                <input
                                    type="text"
                                    value={currentAdminToUpdate.address}
                                    disabled
                                    className="w-full rounded-lg bg-gray-100 border border-gray-300 p-3 font-mono text-sm cursor-not-allowed"
                                />
                            </div>
                            <div>
                                <label htmlFor="namaRumahSakit" className="block text-sm font-medium text-gray-700 mb-1">Nama Rumah Sakit</label>
                                <input
                                    id="namaRumahSakit"
                                    type="text"
                                    required
                                    value={updateFormData.namaRumahSakit}
                                    onChange={handleUpdateFormChange}
                                    placeholder="Contoh: RS Harapan Bangsa"
                                    className="w-full rounded-lg border-gray-300 p-3 shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm transition-colors"
                                    disabled={loading}
                                />
                            </div>
                            <div>
                                <label htmlFor="alamatRumahSakut" className="block text-sm font-medium text-gray-700 mb-1">Alamat Rumah Sakit</label>
                                <input
                                    id="alamatRumahSakut"
                                    type="text"
                                    required
                                    value={updateFormData.alamatRumahSakut}
                                    onChange={handleUpdateFormChange}
                                    placeholder="Contoh: Jl. Merdeka No. 123"
                                    className="w-full rounded-lg border-gray-300 p-3 shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm transition-colors"
                                    disabled={loading}
                                />
                            </div>
                            <div>
                                <label htmlFor="kota" className="block text-sm font-medium text-gray-700 mb-1">Kota</label>
                                <input
                                    id="kota"
                                    type="text"
                                    required
                                    value={updateFormData.kota}
                                    onChange={handleUpdateFormChange}
                                    placeholder="Contoh: Yogyakarta"
                                    className="w-full rounded-lg border-gray-300 p-3 shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm transition-colors"
                                    disabled={loading}
                                />
                            </div>
                            <div>
                                <label htmlFor="NIBRS" className="block text-sm font-medium text-gray-700 mb-1">NIBRS</label>
                                <input
                                    id="NIBRS"
                                    type="text"
                                    required
                                    value={updateFormData.NIBRS}
                                    onChange={handleUpdateFormChange}
                                    placeholder="Contoh: NIBRS unik"
                                    className="w-full rounded-lg border-gray-300 p-3 shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm transition-colors"
                                    disabled={loading}
                                />
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowUpdateModal(false);
                                        setNotif(""); // Bersihkan notif saat modal dibatalkan
                                    }}
                                    className="px-6 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold transition-colors"
                                    disabled={loading}
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors disabled:opacity-70"
                                    disabled={loading || !hasChanges} // Tombol dinonaktifkan jika loading atau tidak ada perubahan
                                >
                                    {loading ? "Menyimpan..." : "Simpan Perubahan"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

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