import React, { useState } from "react";
import contract from "../contract";


const ArrowLeftIcon = ({ className = "w-5 h-5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
    </svg>
);

export default function AddAdminRSPage({ account, fetchAdmins, setNotif, setNotifType, onBack }) {
    const [namaRS, setNamaRS] = useState("");
    const [adminAddress, setAdminAddress] = useState("");
    const [alamatRS, setAlamatRS] = useState("");
    const [kotaRS, setKotaRS] = useState("");
    const [NIBRS, setNIBRS] = useState("");
    const [loading, setLoading] = useState(false);

    const handleRegisterRS = async (e) => {
        e.preventDefault();
        setNotif("");

        // Validasi sisi klien
        if (!namaRS.trim()) {
            setNotif("Nama Rumah Sakit tidak boleh kosong.");
            setNotifType("error");
            return;
        }
        if (!alamatRS.trim()) {
            setNotif("Alamat Rumah Sakit tidak boleh kosong.");
            setNotifType("error");
            return;
        }
        if (!kotaRS.trim()) {
            setNotif("Kota tidak boleh kosong.");
            setNotifType("error");
            return;
        }
        if (!NIBRS.trim()) {
            setNotif("NIBRS tidak boleh kosong.");
            setNotifType("error");
            return;
        }
        if (!adminAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
            setNotif("Alamat Wallet Admin RS tidak valid. Harus dimulai dengan '0x' diikuti 40 karakter heksadesimal.");
            setNotifType("error");
            return;
        }

        setLoading(true);
        try {
            await contract.methods.registerAdminRS(adminAddress, namaRS, alamatRS, kotaRS, NIBRS).send({ from: account });

            setNotif("Sukses mendaftarkan admin RS!");
            setNotifType("success");
            if (fetchAdmins) await fetchAdmins();

        } catch (err) {
            let errorMessage = "Gagal mendaftarkan admin RS.";
            if (err.message.includes("Admin RS sudah terdaftar") || err.message.includes("Admin sudah terdaftar")) {
                errorMessage = "Gagal mendaftarkan: Alamat admin sudah terdaftar.";
            } else if (err.message.includes("IDRS sudah digunakan") || err.message.includes("NIBRS sudah digunakan")) {
                errorMessage = "Gagal mendaftarkan: NIBRS sudah digunakan.";
            } else if (err.message.includes("Nama Rumah Sakit tidak boleh kosong")) {
                errorMessage = "Gagal mendaftarkan: Nama Rumah Sakit tidak boleh kosong (dari kontrak).";
            } else if (err.message.includes("Nomor Induk Berusaha Rumah Sakit tidak boleh kosong") || err.message.includes("NIBRS tidak boleh kosong")) {
                errorMessage = "Gagal mendaftarkan: NIBRS tidak boleh kosong (dari kontrak).";
            } else if (err.code === 4001) {
                errorMessage = "Transaksi ditolak oleh pengguna.";
            } else {
                console.error("Register RS error:", err);
                errorMessage += ` Detail: ${err.message || String(err)}`;
            }
            setNotif(errorMessage);
            setNotifType("error");
        } finally {
            setLoading(false);
            onBack();
        }
    };

    const handleBackClick = () => {
        onBack();
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 px-4 py-8">
            <div className="mx-auto max-w-2xl">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-4">
                        <button
                            onClick={handleBackClick}
                            className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                            aria-label="Kembali ke Dashboard Super Admin"
                        >
                            <ArrowLeftIcon className="w-6 h-6" />
                        </button>
                        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                            Registrasi Rumah Sakit Baru
                        </h1>
                    </div>
                </div>

                {/* Form Card */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                    {/* Info Banner */}
                    <div className="bg-blue-50 border-b border-blue-100 p-4">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-blue-700">
                                    Satu alamat Ethereum hanya dapat didaftarkan sebagai Admin RS untuk satu rumah sakit. Pastikan alamat dan NIBRS yang dimasukkan belum terdaftar.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleRegisterRS} className="p-6 space-y-6">
                        {/* Nama RS */}
                        <div>
                            <label htmlFor="namaRS" className="block text-sm font-medium text-gray-700 mb-2">
                                Nama Rumah Sakit *
                            </label>
                            <input
                                id="namaRS"
                                type="text"
                                required
                                value={namaRS}
                                onChange={(e) => setNamaRS(e.target.value)}
                                placeholder="Contoh: RS Harapan Bangsa"
                                disabled={loading}
                                className="block w-full rounded-lg border-gray-300 px-3 py-2.5 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500 transition-colors"
                            />
                        </div>

                        {/* Alamat RS */}
                        <div>
                            <label htmlFor="alamatRS" className="block text-sm font-medium text-gray-700 mb-2">
                                Alamat Rumah Sakit *
                            </label>
                            <input
                                id="alamatRS"
                                type="text"
                                value={alamatRS}
                                onChange={(e) => setAlamatRS(e.target.value)}
                                placeholder="Contoh: Jl. Merdeka No. 123"
                                disabled={loading}
                                className="block w-full rounded-lg border-gray-300 px-3 py-2.5 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500 transition-colors"
                            />
                        </div>

                        {/* Kota */}
                        <div>
                            <label htmlFor="kotaRS" className="block text-sm font-medium text-gray-700 mb-2">
                                Kota *
                            </label>
                            <input
                                id="kotaRS"
                                type="text"
                                value={kotaRS}
                                onChange={(e) => setKotaRS(e.target.value)}
                                placeholder="Contoh: Yogyakarta"
                                disabled={loading}
                                className="block w-full rounded-lg border-gray-300 px-3 py-2.5 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500 transition-colors"
                            />
                        </div>

                        {/* NIBRS */}
                        <div>
                            <label htmlFor="NIBRS" className="block text-sm font-medium text-gray-700 mb-2">
                                NIBRS (Nomor Induk Berusaha Rumah Sakit) *
                            </label>
                            <input
                                id="NIBRS"
                                type="text"
                                required
                                value={NIBRS}
                                onChange={(e) => setNIBRS(e.target.value)}
                                placeholder="Contoh: 1234567890"
                                disabled={loading}
                                className="block w-full rounded-lg border-gray-300 px-3 py-2.5 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500 transition-colors"
                            />
                        </div>

                        {/* Admin Address */}
                        <div>
                            <label htmlFor="adminAddress" className="block text-sm font-medium text-gray-700 mb-2">
                                Alamat Wallet Admin RS (Ethereum) *
                            </label>
                            <input
                                id="adminAddress"
                                type="text"
                                required
                                value={adminAddress}
                                onChange={(e) => setAdminAddress(e.target.value)}
                                placeholder="0x..."
                                disabled={loading}
                                pattern="^0x[a-fA-F0-9]{40}$"
                                title="Masukkan alamat Ethereum yang valid (dimulai dengan 0x dan diikuti 40 karakter heksadesimal)"
                                className="block w-full rounded-lg border-gray-300 px-3 py-2.5 font-mono text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500 transition-colors"
                            />
                            <p className="mt-2 text-xs text-gray-500">
                                Alamat wallet Ethereum yang akan menjadi admin untuk rumah sakit ini. Pastikan alamat ini unik dan belum digunakan.
                            </p>
                        </div>

                        {/* Submit Button */}
                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium py-2.5 px-4 rounded-lg shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <div className="flex items-center justify-center">
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Memproses...
                                    </div>
                                ) : (
                                    "Daftarkan Admin RS"
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}