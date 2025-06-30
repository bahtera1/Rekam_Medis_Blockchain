import React, { useState, useEffect, useCallback } from "react";
import contract from "../contract";
import AdminRSRow from "./AdminRSRow"; // <--- Import komponen AdminRSRow

export default function SuperAdminPage({ account, onLogout }) {
    const [showRegister, setShowRegister] = useState(false);
    // State untuk form registrasi
    const [namaRS, setNamaRS] = useState("");
    const [adminAddress, setAdminAddress] = useState("");
    const [alamatRS, setAlamatRS] = useState("");
    const [kotaRS, setKotaRS] = useState("");
    const [IDRS, setIDRS] = useState("");

    const [notif, setNotif] = useState("");
    const [notifType, setNotifType] = useState("info");

    const [daftarAdmin, setDaftarAdmin] = useState([]);
    const [loading, setLoading] = useState(false); // Untuk submit form
    const [initialLoading, setInitialLoading] = useState(true); // Untuk loading daftar awal

    const [showConfirmModal, setShowConfirmModal] = useState(false);

    // --- State untuk Modal Update Admin RS ---
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [currentAdminToUpdate, setCurrentAdminToUpdate] = useState(null); // Data admin yang sedang diedit
    const [updateFormData, setUpdateFormData] = useState({ // Form data untuk update
        namaRumahSakit: "",
        alamatRumahSakit: "",
        kota: "",
        IDRS: ""
    });
    // --- State untuk Modal Konfirmasi Aktif/Nonaktif ---
    const [showStatusConfirmModal, setShowStatusConfirmModal] = useState(false);
    const [adminToToggleStatus, setAdminToToggleStatus] = useState(null); // Alamat admin yang statusnya akan diubah
    const [statusToSet, setStatusToSet] = useState(false); // Status yang akan di-set

    // Fungsi ambil daftar admin RS dari kontrak (gunakan useCallback agar stabil)
    const fetchAdmins = useCallback(async () => {
        setInitialLoading(true);
        try {
            if (contract && contract.methods && contract.methods.getAllAdminRSAddresses && contract.methods.getAdminRS) {
                const adminAddresses = await contract.methods.getAllAdminRSAddresses().call();

                const detailedAdmins = await Promise.all(
                    adminAddresses.map(async (addr) => {
                        try {
                            // PENTING: Index harus sesuai dengan urutan return dari fungsi getAdminRS di Solidity
                            // getAdminRS mengembalikan: nama, aktif, alamat, kota, IDRS
                            const adminDataRaw = await contract.methods.getAdminRS(addr).call();
                            return {
                                address: addr,
                                namaRumahSakit: adminDataRaw[0],
                                aktif: adminDataRaw[1],
                                alamatRumahSakit: adminDataRaw[2],
                                kota: adminDataRaw[3],
                                IDRS: adminDataRaw[4]
                            };
                        } catch (detailErr) {
                            console.error(`Error fetching detail for admin ${addr}:`, detailErr);
                            // Set notif yang lebih informatif di sini juga
                            setNotif(`Gagal memuat detail untuk admin ${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}. Cek konsol browser.`);
                            setNotifType("error");
                            return { address: addr, namaRumahSakit: "Gagal memuat", aktif: false, alamatRumahSakit: "", kota: "", IDRS: "" };
                        }
                    })
                );
                setDaftarAdmin(detailedAdmins);
            } else {
                throw new Error("Kontrak atau metode tidak tersedia (getAllAdminRSAddresses/getAdminRS)"); // Teks disesuaikan
            }
        } catch (err) {
            setNotif("Gagal mengambil daftar admin RS utama! Pastikan kontrak sudah di-deploy dan ABI terbaru."); // Teks disesuaikan
            setNotifType("error");
            console.error("Fetch admins error (main):", err);
            setDaftarAdmin([]);
        }
        setInitialLoading(false);
    }, []); // Dependensi kosong karena contract statis (contract sudah di-import)

    useEffect(() => {
        if (account) {
            fetchAdmins();
        } else {
            setDaftarAdmin([]);
            setInitialLoading(false);
        }
    }, [account, fetchAdmins]);


    // FUNGSI INI DIHAPUS KARENA SUDAH TIDAK DIGUNAKAN
    /*
    const getNamaRS = useCallback(async (address) => {
        // Fungsi ini tidak perlu lagi mengambil data terpisah
        const admin = daftarAdmin.find(a => a.address === address);
        return admin ? admin.namaRumahSakit : "N/A (check AdminRSRow logic)";
    }, [daftarAdmin]);
    */


    // --- Handler untuk Form Registrasi ---
    const handleRegisterRS = async (e) => {
        e.preventDefault();
        setNotif("");
        setLoading(true);
        try {
            if (!contract.methods.registerAdminRS) {
                throw new Error("Metode registerAdminRS tidak tersedia di kontrak.");
            }
            // Pastikan parameter sesuai dengan urutan di kontrak Solidity
            // registerAdminRS(address _admin, string _namaRS, string _alamatRS, string _kotaRS, string _IDRS)
            await contract.methods.registerAdminRS(adminAddress, namaRS, alamatRS, kotaRS, IDRS).send({ from: account });

            setNotif("Sukses mendaftarkan admin RS!");
            setNotifType("success");
            setShowRegister(false);
            // Reset form registrasi
            setNamaRS("");
            setAdminAddress("");
            setAlamatRS("");
            setKotaRS("");
            setIDRS("");
            await fetchAdmins(); // Muat ulang daftar admin setelah registrasi
        } catch (err) {
            let errorMessage = "Gagal mendaftarkan admin RS.";
            if (err.message.includes("Admin RS sudah terdaftar")) {
                errorMessage = "Gagal mendaftarkan: Alamat admin sudah terdaftar."; // Teks disesuaikan
            } else if (err.message.includes("IDRS sudah digunakan")) {
                errorMessage = "Gagal mendaftarkan: IDRS sudah digunakan."; // Teks disesuaikan
            } else if (err.message.includes("Nama Rumah Sakit tidak boleh kosong")) {
                errorMessage = "Gagal mendaftarkan: Nama Rumah Sakit tidak boleh kosong."; // Teks disesuaikan
            } else if (err.message.includes("IDRS tidak boleh kosong")) {
                errorMessage = "Gagal mendaftarkan: IDRS tidak boleh kosong."; // Teks disesuaikan
            } else if (err.code === 4001) {
                errorMessage = "Transaksi ditolak oleh pengguna."; // Teks disesuaikan
            } else {
                console.error("Register RS error:", err);
                errorMessage += ` Detail: ${err.message || String(err)}`;
            }
            setNotif(errorMessage);
            setNotifType("error");
        }
        setLoading(false);
    };

    // --- Handler untuk Konfirmasi Logout ---
    const getNotifClasses = () => {
        if (notifType === "success") return "bg-green-100 border-green-500 text-green-700";
        if (notifType === "error") return "bg-red-100 border-red-500 text-red-700";
        return "bg-sky-100 border-sky-500 text-sky-700";
    };

    const handleLogoutClick = () => {
        setShowConfirmModal(true);
    };

    const confirmLogout = () => {
        if (onLogout) {
            onLogout();
        }
        setShowConfirmModal(false);
    };

    const cancelLogout = () => {
        setShowConfirmModal(false);
    };

    // --- Handler untuk Edit Admin RS ---
    const handleEditClick = (adminData) => {
        setCurrentAdminToUpdate(adminData);
        setUpdateFormData({
            namaRumahSakit: adminData.namaRumahSakit,
            alamatRumahSakit: adminData.alamatRumahSakit,
            kota: adminData.kota,
            IDRS: adminData.IDRS
        });
        setShowUpdateModal(true);
    };

    const handleUpdateAdminRSDetails = async (e) => {
        e.preventDefault();
        if (!currentAdminToUpdate) return;

        setNotif("");
        setLoading(true);
        try {
            if (!contract.methods.updateAdminRSDetails) {
                throw new Error("Metode updateAdminRSDetails tidak tersedia di kontrak."); // Teks disesuaikan
            }
            // Pastikan parameter sesuai dengan urutan di kontrak Solidity
            // updateAdminRSDetails(address _admin, string _namaBaru, string _alamatBaru, string _kotaBaru, string _IDRSBaru)
            await contract.methods.updateAdminRSDetails(
                currentAdminToUpdate.address,
                updateFormData.namaRumahSakit,
                updateFormData.alamatRumahSakit,
                updateFormData.kota,
                updateFormData.IDRS
            ).send({ from: account });

            setNotif("Sukses memperbarui detail Admin RS!"); // Teks disesuaikan
            setNotifType("success");
            setShowUpdateModal(false);
            setCurrentAdminToUpdate(null);
            await fetchAdmins(); // Muat ulang daftar admin setelah update
        } catch (err) {
            let errorMessage = "Gagal memperbarui detail Admin RS."; // Teks disesuaikan
            if (err.message.includes("IDRS sudah digunakan")) {
                errorMessage = "Gagal memperbarui: IDRS baru sudah digunakan."; // Teks disesuaikan
            } else if (err.message.includes("Nama Rumah Sakit baru tidak boleh kosong")) {
                errorMessage = "Gagal memperbarui: Nama Rumah Sakit tidak boleh kosong."; // Teks disesuaikan
            } else if (err.message.includes("IDRS baru tidak boleh kosong")) {
                errorMessage = "Gagal memperbarui: IDRS tidak boleh kosong."; // Teks disesuaikan
            } else if (err.code === 4001) {
                errorMessage = "Transaksi ditolak oleh pengguna."; // Teks disesuaikan
            } else {
                console.error("Update Admin RS error:", err);
                errorMessage += ` Detail: ${err.message || String(err)}`;
            }
            setNotif(errorMessage);
            setNotifType("error");
        }
        setLoading(false);
    };

    // --- Handler untuk Mengubah Status Aktif/Nonaktif Admin RS ---
    const handleToggleStatusClick = (adminAddress, currentStatus) => {
        setAdminToToggleStatus({ address: adminAddress, currentStatus: currentStatus });
        setStatusToSet(!currentStatus); // Status yang akan di-set
        setShowStatusConfirmModal(true);
    };

    const confirmSetAdminRSStatus = async () => {
        if (!adminToToggleStatus) return;

        setNotif("");
        setLoading(true);
        try {
            if (!contract.methods.setStatusAdminRS) {
                throw new Error("Metode setStatusAdminRS tidak tersedia di kontrak."); // Teks disesuaikan
            }
            await contract.methods.setStatusAdminRS(
                adminToToggleStatus.address,
                statusToSet
            ).send({ from: account });

            setNotif(`Sukses ${statusToSet ? "mengaktifkan" : "menonaktifkan"} Admin RS!`); // Teks disesuaikan
            setNotifType("success");
            setShowStatusConfirmModal(false);
            setAdminToToggleStatus(null);
            await fetchAdmins(); // Muat ulang daftar admin setelah perubahan status
        } catch (err) {
            let errorMessage = `Gagal ${statusToSet ? "mengaktifkan" : "menonaktifkan"} Admin RS.`; // Teks disesuaikan
            if (err.message.includes("Admin RS tidak ditemukan")) {
                errorMessage = "Gagal: Admin RS tidak ditemukan di kontrak."; // Teks disesuaikan
            } else if (err.code === 4001) {
                errorMessage = "Transaksi ditolak oleh pengguna."; // Teks disesuaikan
            } else {
                console.error("Set status Admin RS error:", err);
                errorMessage += ` Detail: ${err.message || String(err)}`;
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


    // Icon untuk tombol registrasi
    const PlusIcon = ({ className = "w-5 h-5" }) => (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className={className}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
    );

    const MinusIcon = ({ className = "w-5 h-5" }) => (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className={className}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" />
        </svg>
    );


    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-100 to-sky-100 py-10 px-4 sm:px-6 lg:px-12">
            <div className="max-w-6xl mx-auto space-y-10">
                <header>
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
                            Dashboard Super Admin
                        </h1> {/* Teks disesuaikan */}
                        <button
                            className="bg-red-600 hover:bg-red-700 text-white font-semibold px-5 py-2.5 rounded-xl shadow-lg hover:shadow-red-500/40 transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-75 flex items-center gap-2.5 transform active:scale-95"
                            onClick={handleLogoutClick}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                            </svg>
                            Logout
                        </button>
                    </div>
                    <div className="mt-6 p-5 bg-white shadow-xl rounded-xl border border-slate-200/80">
                        <p className="text-base text-slate-700">
                            <span className="font-semibold text-slate-800">Akun Terhubung:</span>
                            <span className="ml-2 font-mono text-sky-700 break-all bg-sky-100 px-3 py-1.5 rounded-lg text-sm">
                                {account || "Tidak terhubung"}
                            </span>
                        </p>
                    </div>
                </header>

                {notif && (
                    <div className={`border-l-4 p-4 rounded-lg shadow-lg mb-0 ${getNotifClasses()}`} role="alert">
                        <p className="font-bold text-sm">
                            {notifType === "success" ? "Sukses!" : notifType === "error" ? "Terjadi Kesalahan!" : "Informasi"}
                        </p>
                        <p className="text-sm mt-1">{notif}</p>
                    </div>
                )}

                {/* Form Registrasi Admin RS */}
                <section>
                    <button
                        className="flex items-center justify-center w-full sm:w-auto bg-sky-600 hover:bg-sky-700 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-sky-500/40 transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-opacity-75 transform active:scale-95"
                        onClick={() => {
                            setShowRegister(!showRegister);
                            setNotif("");
                        }}
                    >
                        {showRegister ? <MinusIcon className="mr-2 h-5 w-5" /> : <PlusIcon className="mr-2 h-5 w-5" />}
                        {showRegister ? "Tutup Form Registrasi" : "Registrasi Rumah Sakit Baru"}
                    </button>

                    {showRegister && (
                        <div className="mt-6 bg-white shadow-2xl rounded-xl border border-slate-200/80 p-6 sm:p-8 transform transition-all duration-300 ease-out">
                            <p className="text-sm text-slate-600 mb-4 border-b pb-3 border-slate-200">
                                Harap diperhatikan: Satu alamat Ethereum hanya dapat didaftarkan sebagai Admin RS untuk satu rumah sakit. Pastikan alamat dan IDRS yang dimasukkan belum terdaftar.
                            </p> {/* Petunjuk baru */}
                            <form onSubmit={handleRegisterRS} className="space-y-6">
                                <div>
                                    <label htmlFor="namaRS" className="block text-sm font-medium text-slate-700 mb-1.5">
                                        Nama Rumah Sakit
                                    </label>
                                    <input
                                        id="namaRS"
                                        type="text"
                                        className="w-full border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 sm:text-sm p-3.5 transition-all duration-150 ease-in-out"
                                        required
                                        value={namaRS}
                                        onChange={(e) => setNamaRS(e.target.value)}
                                        placeholder="Contoh: RS Harapan Bangsa"
                                        disabled={loading}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="alamatRS" className="block text-sm font-medium text-slate-700 mb-1.5">
                                        Alamat Rumah Sakit
                                    </label>
                                    <input
                                        id="alamatRS"
                                        type="text"
                                        className="w-full border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 sm:text-sm p-3.5 transition-all duration-150 ease-in-out"
                                        value={alamatRS}
                                        onChange={(e) => setAlamatRS(e.target.value)}
                                        placeholder="Contoh: Jl. Merdeka No. 123"
                                        disabled={loading}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="kotaRS" className="block text-sm font-medium text-slate-700 mb-1.5">
                                        Kota
                                    </label>
                                    <input
                                        id="kotaRS"
                                        type="text"
                                        className="w-full border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 sm:text-sm p-3.5 transition-all duration-150 ease-in-out"
                                        value={kotaRS}
                                        onChange={(e) => setKotaRS(e.target.value)}
                                        placeholder="Contoh: Jakarta"
                                        disabled={loading}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="IDRS" className="block text-sm font-medium text-slate-700 mb-1.5">
                                        IDRS (ID Rumah Sakit)
                                    </label>
                                    <input
                                        id="IDRS"
                                        type="text"
                                        className="w-full border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 sm:text-sm p-3.5 transition-all duration-150 ease-in-out"
                                        required
                                        value={IDRS}
                                        onChange={(e) => setIDRS(e.target.value)}
                                        placeholder="Contoh: RSID-001 (Contoh ID unik dari RS)" // Placeholder disesuaikan
                                        disabled={loading}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="adminAddress" className="block text-sm font-medium text-slate-700 mb-1.5">
                                        Alamat Wallet Admin RS (Ethereum)
                                    </label>
                                    <input
                                        id="adminAddress"
                                        type="text"
                                        className="w-full border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 sm:text-sm p-3.5 font-mono transition-all duration-150 ease-in-out"
                                        required
                                        value={adminAddress}
                                        onChange={(e) => setAdminAddress(e.target.value)}
                                        placeholder="0x..."
                                        disabled={loading}
                                        pattern="^0x[a-fA-F0-9]{40}$"
                                        title="Masukkan alamat Ethereum yang valid (dimulai dengan 0x dan diikuti 40 karakter heksadesimal)"
                                    />
                                    <p className="text-xs text-slate-500 mt-1">
                                        Ini adalah alamat wallet Ethereum yang akan menjadi admin untuk rumah sakit ini. Pastikan alamat ini unik dan belum digunakan sebagai admin RS lain.
                                    </p> {/* Petunjuk baru */}
                                </div>
                                <button
                                    type="submit"
                                    className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white font-semibold px-8 py-3 rounded-xl shadow-lg hover:shadow-green-500/40 transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-75 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center transform active:scale-95"
                                    disabled={loading}
                                >
                                    {loading ? "Memproses..." : "Daftarkan Admin RS"}
                                </button>
                            </form>
                        </div>
                    )}
                </section>

                {/* Tabel daftar Admin RS */}
                <section className="bg-white shadow-2xl rounded-xl overflow-hidden border border-slate-200/80">
                    <div className="p-6 sm:p-8">
                        <h2 className="text-2xl font-semibold text-slate-800 mb-6">
                            Daftar Admin Rumah Sakit Terdaftar
                        </h2>
                        {initialLoading ? (
                            <div className="text-center py-12">
                                <svg
                                    className="animate-spin mx-auto h-10 w-10 text-sky-600"
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
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    ></path>
                                </svg>
                                <p className="mt-3 text-slate-500 text-sm">Memuat daftar admin...</p>
                            </div>
                        ) : daftarAdmin.length === 0 ? (
                            <div className="text-center py-12 bg-slate-50 rounded-xl border border-slate-200/80">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 mx-auto text-slate-400 mb-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                                </svg>
                                <p className="text-slate-600 font-semibold text-lg">Belum ada admin RS yang terdaftar.</p>
                                <p className="text-sm text-slate-500 mt-1.5">Silakan daftarkan admin RS baru melalui form di atas.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto rounded-lg border border-slate-200/80">
                                <table className="min-w-full divide-y divide-slate-200">
                                    <thead className="bg-slate-100/80">
                                        <tr>
                                            <th scope="col" className="px-4 py-3.5 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">No</th>
                                            <th scope="col" className="px-4 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Alamat Wallet Admin</th>
                                            <th scope="col" className="px-4 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Nama Rumah Sakit</th>
                                            <th scope="col" className="px-4 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Alamat RS</th>
                                            <th scope="col" className="px-4 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Kota</th>
                                            <th scope="col" className="px-4 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">IDRS</th>
                                            <th scope="col" className="px-4 py-3.5 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</th>
                                            <th scope="col" className="px-4 py-3.5 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-slate-200">
                                        {daftarAdmin.map((adminData, idx) => (
                                            <AdminRSRow
                                                key={adminData.address}
                                                adminData={adminData}
                                                no={idx + 1}
                                                onEdit={handleEditClick}
                                                onToggleStatus={handleToggleStatusClick}
                                            />
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </section>

                <footer className="mt-12 pt-8 pb-4 border-t border-slate-300/70 text-center text-sm text-slate-600">
                    <p>&copy; {new Date().getFullYear()} Sistem Rekam Medis Terdesentralisasi. All rights reserved.</p>
                </footer>
            </div>

            {/* --- Modal Konfirmasi Logout --- */}
            {showConfirmModal && (
                <div className="fixed inset-0 bg-black bg-opacity-75 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-800 p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-md border border-slate-700">
                        <h3 className="text-xl font-semibold text-white mb-6 text-center">Konfirmasi Logout</h3>
                        <p className="text-slate-300 mb-8 text-center">
                            Apakah Anda yakin ingin keluar dari sesi ini?
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center gap-4">
                            <button
                                onClick={cancelLogout}
                                className="w-full sm:w-auto px-6 py-3 rounded-lg bg-slate-600 hover:bg-slate-500 text-slate-200 font-medium transition-colors duration-150 order-2 sm:order-1"
                            >
                                Batal
                            </button>
                            <button
                                onClick={confirmLogout}
                                className="w-full sm:w-auto px-6 py-3 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold transition-colors duration-150 order-1 sm:order-2"
                            >
                                Ya, Logout
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* --- Akhir Modal Konfirmasi Logout --- */}

            {/* --- Modal Edit Admin RS Details --- */}
            {showUpdateModal && currentAdminToUpdate && (
                <div className="fixed inset-0 bg-black bg-opacity-75 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-lg border border-slate-200/80">
                        <h3 className="text-xl font-semibold text-slate-800 mb-6 text-center">Edit Detail Admin RS</h3>
                        <form onSubmit={handleUpdateAdminRSDetails} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Alamat Admin (Tidak dapat diubah)</label>
                                <input
                                    type="text"
                                    value={currentAdminToUpdate.address}
                                    className="w-full border-slate-300 rounded-lg bg-slate-100 cursor-not-allowed sm:text-sm p-3.5 font-mono"
                                    disabled
                                />
                            </div>
                            <div>
                                <label htmlFor="updateNamaRS" className="block text-sm font-medium text-slate-700 mb-1.5">Nama Rumah Sakit</label>
                                <input
                                    id="updateNamaRS"
                                    type="text"
                                    className="w-full border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 sm:text-sm p-3.5 transition-all duration-150 ease-in-out"
                                    required
                                    value={updateFormData.namaRumahSakit}
                                    onChange={(e) => setUpdateFormData(prev => ({ ...prev, namaRumahSakit: e.target.value }))}
                                    disabled={loading}
                                />
                            </div>
                            <div>
                                <label htmlFor="updateAlamatRS" className="block text-sm font-medium text-slate-700 mb-1.5">Alamat Rumah Sakit</label>
                                <input
                                    id="updateAlamatRS"
                                    type="text"
                                    className="w-full border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 sm:text-sm p-3.5 transition-all duration-150 ease-in-out"
                                    value={updateFormData.alamatRumahSakit}
                                    onChange={(e) => setUpdateFormData(prev => ({ ...prev, alamatRumahSakit: e.target.value }))}
                                    disabled={loading}
                                />
                            </div>
                            <div>
                                <label htmlFor="updateKotaRS" className="block text-sm font-medium text-slate-700 mb-1.5">Kota</label>
                                <input
                                    id="updateKotaRS"
                                    type="text"
                                    className="w-full border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 sm:text-sm p-3.5 transition-all duration-150 ease-in-out"
                                    value={updateFormData.kota}
                                    onChange={(e) => setUpdateFormData(prev => ({ ...prev, kota: e.target.value }))}
                                    disabled={loading}
                                />
                            </div>
                            <div>
                                <label htmlFor="updateIDRS" className="block text-sm font-medium text-slate-700 mb-1.5">IDRS</label>
                                <input
                                    id="updateIDRS"
                                    type="text"
                                    className="w-full border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 sm:text-sm p-3.5 transition-all duration-150 ease-in-out"
                                    required
                                    value={updateFormData.IDRS}
                                    onChange={(e) => setUpdateFormData(prev => ({ ...prev, IDRS: e.target.value }))}
                                    disabled={loading}
                                />
                            </div>
                            <div className="flex justify-end space-x-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowUpdateModal(false)}
                                    className="px-6 py-2.5 rounded-lg font-semibold text-slate-700 bg-slate-200 hover:bg-slate-300 transition-colors duration-150"
                                    disabled={loading}
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2.5 rounded-lg font-semibold text-white bg-sky-600 hover:bg-sky-700 transition-colors duration-150 disabled:opacity-70 disabled:cursor-not-allowed"
                                    disabled={loading}
                                >
                                    {loading ? "Menyimpan..." : "Simpan Perubahan"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* --- Akhir Modal Edit Admin RS Details --- */}

            {/* --- Modal Konfirmasi Ubah Status (Aktif/Nonaktif) --- */}
            {showStatusConfirmModal && adminToToggleStatus && (
                <div className="fixed inset-0 bg-black bg-opacity-75 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-800 p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-md border border-slate-700">
                        <h3 className="text-xl font-semibold text-white mb-6 text-center">Konfirmasi Perubahan Status</h3>
                        <p className="text-slate-300 mb-8 text-center">
                            Anda akan {statusToSet ? "mengaktifkan" : "menonaktifkan"} Admin RS dengan alamat: <br />
                            <span className="font-mono text-sky-300 break-all">{adminToToggleStatus.address}</span>.<br />
                            Apakah Anda yakin?
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center gap-4">
                            <button
                                onClick={cancelSetAdminRSStatus}
                                className="w-full sm:w-auto px-6 py-3 rounded-lg bg-slate-600 hover:bg-slate-500 text-slate-200 font-medium transition-colors duration-150 order-2 sm:order-1"
                            >
                                Batal
                            </button>
                            <button
                                onClick={confirmSetAdminRSStatus}
                                className={`w-full sm:w-auto px-6 py-3 rounded-lg font-semibold transition-colors duration-150 order-1 sm:order-2 ${statusToSet ? "bg-green-600 hover:bg-green-700 text-white" : "bg-red-600 hover:bg-red-700 text-white"}`}
                                disabled={loading}
                            >
                                {loading ? "Memproses..." : `Ya, ${statusToSet ? "Aktifkan" : "Nonaktifkan"}`}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* --- Akhir Modal Konfirmasi Ubah Status --- */}
        </div>
    );
}