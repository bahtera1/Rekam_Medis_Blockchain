// EditAdminRSModal.jsx
import React, { useState, useEffect } from "react";
import contract from "../contract"; // Pastikan path ini benar

export default function EditAdminRSModal({
    show,
    onClose,
    adminData, // Ini adalah currentAdminToUpdate dari SuperAdminPage
    setNotif,
    setNotifType,
    account,
    fetchAdmins // Fungsi untuk refresh data di SuperAdminPage
}) {
    const [updateFormData, setUpdateFormData] = useState({
        namaRumahSakit: "",
        alamatRumahSakit: "",
        kota: "",
        NIBRS: ""
    });
    const [loading, setLoading] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);

    // Effect untuk mengisi form saat adminData berubah (modal dibuka atau data di-update)
    useEffect(() => {
        if (adminData) {
            setUpdateFormData({
                namaRumahSakit: adminData.namaRumahSakit,
                alamatRumahSakit: adminData.alamatRumahSakit,
                kota: adminData.kota,
                NIBRS: adminData.NIBRS
            });
            setHasChanges(false); // Reset changes saat data baru dimuat
        }
    }, [adminData]);

    // Handler perubahan input pada form update
    const handleUpdateFormChange = (e) => {
        const { id, value } = e.target;
        const fieldName = id; // Karena ID input sudah sesuai dengan nama properti di updateFormData

        setUpdateFormData(prev => {
            const newData = { ...prev, [fieldName]: value };

            // Cek apakah ada perubahan dibandingkan data awal (adminData)
            const changed = (
                newData.namaRumahSakit !== adminData.namaRumahSakit ||
                newData.alamatRumahSakit !== adminData.alamatRumahSakit ||
                newData.kota !== adminData.kota ||
                newData.NIBRS !== adminData.NIBRS
            );
            setHasChanges(changed);
            return newData;
        });
    };

    const handleUpdateAdminRSDetails = async (e) => {
        e.preventDefault();
        setNotif(""); // Bersihkan notifikasi

        // Validasi form kosong saat update
        if (!updateFormData.namaRumahSakit.trim() ||
            !updateFormData.alamatRumahSakit.trim() ||
            !updateFormData.kota.trim() ||
            !updateFormData.NIBRS.trim()) {
            setNotif("Semua field detail rumah sakit tidak boleh kosong.");
            setNotifType("error");
            return;
        }

        setLoading(true);
        try {
            if (!contract.methods.updateAdminRSDetails) {
                throw new Error("Metode updateAdminRSDetails tidak tersedia di kontrak.");
            }

            await contract.methods.updateAdminRSDetails(
                adminData.address, // Gunakan alamat dari adminData asli
                updateFormData.namaRumahSakit,
                updateFormData.alamatRumahSakit,
                updateFormData.kota,
                updateFormData.NIBRS
            ).send({ from: account });

            setNotif("Sukses memperbarui detail Admin RS!");
            setNotifType("success");
            onClose(); // Tutup modal
            setHasChanges(false); // Reset setelah sukses
            if (fetchAdmins) await fetchAdmins(); // Refresh data di tabel SuperAdminPage

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

    if (!show) return null; // Jangan render modal jika show=false

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-lg border border-gray-200">
                <h3 className="text-xl font-semibold text-gray-800 mb-6 text-center">Edit Detail Admin RS</h3>
                <form onSubmit={handleUpdateAdminRSDetails} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Alamat Admin (Tidak dapat diubah)</label>
                        <input
                            type="text"
                            value={adminData?.address || ''} // Gunakan optional chaining
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
                        <label htmlFor="alamatRumahSakit" className="block text-sm font-medium text-gray-700 mb-1">Alamat Rumah Sakit</label>
                        <input
                            id="alamatRumahSakit"
                            type="text"
                            required
                            value={updateFormData.alamatRumahSakit}
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
                                onClose(); // Tutup modal
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
    );
}