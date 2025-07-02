import React, { useState, useEffect } from "react";

// Komponen untuk ikon (menggunakan karakter Unicode)
const IconUser = () => <span className="mr-2.5 text-blue-600 inline">👤</span>;
const IconCalendar = () => <span className="mr-2.5 text-blue-600 inline">📅</span>;
const IconMail = () => <span className="mr-2.5 text-blue-600 inline">📧</span>;
const IconPhone = () => <span className="mr-2.5 text-blue-600 inline">📞</span>;
const IconLocation = () => <span className="mr-2.5 text-blue-600 inline">🏠</span>;
const IconGender = () => <span className="mr-2.5 text-blue-600 inline">🚻</span>;
const IconBloodType = () => <span className="mr-2.5 text-red-600 inline">🩸</span>;
const IconHospital = () => <span className="mr-2.5 text-blue-600 inline">🏥</span>;

export default function PasienRegisterPage({
    submitDataDiri,
    form,
    setForm,
    listAdminRS = [],
    onLogout, // Fungsi logout dari App.js
    nextPatientId // ID pasien yang di-generate dari PasienPage
}) {
    const [showPopup, setShowPopup] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Efek untuk mengisi form.ID dengan nextPatientId saat tersedia
    useEffect(() => {
        if (nextPatientId && form.ID !== nextPatientId) {
            setForm(prevForm => ({ ...prevForm, ID: nextPatientId }));
        }
    }, [nextPatientId, form.ID, setForm]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        // KOREKSI UTAMA UNTUK VALIDASI NOMOR TELEPON
        if (!/^\d+$/.test(form.noTelepon)) {
            alert("Nomor Telepon hanya boleh berisi angka.");
            setIsSubmitting(false);
            return;
        }

        try {
            await submitDataDiri();
        } catch (error) {
            console.error("Error submitting registration:", error);
            alert("Gagal mendaftar. Silakan coba lagi. Pastikan semua data benar dan ID Pasien unik.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            {showPopup && (
                <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-blue-200 transform transition-all duration-300 scale-100 opacity-100 animate-fadeIn">
                        <h2 className="text-3xl font-extrabold mb-5 text-blue-800 text-center">
                            👋 Selamat Datang Pasien Baru!
                        </h2>
                        <p className="mb-7 text-center text-gray-700 leading-relaxed">
                            Alamat wallet Anda belum terdaftar. Mari lengkapi data diri Anda
                            untuk mulai mengakses layanan rekam medis.
                        </p>
                        <button
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300 focus:ring-opacity-75 shadow-md"
                            onClick={() => setShowPopup(false)}
                        >
                            Lanjutkan Pendaftaran
                        </button>
                    </div>
                </div>
            )}

            {!showPopup && (
                <div className="bg-white rounded-3xl shadow-2xl p-8 sm:p-10 max-w-2xl mx-auto border border-blue-100 transform transition-all duration-500 hover:shadow-3xl animate-slideInUp">
                    <h2 className="text-3xl sm:text-4xl font-extrabold mb-6 text-blue-800 text-center tracking-tight pb-2 border-b-2 border-blue-100">
                        Registrasi Data Diri Pasien
                    </h2>
                    <form className="grid grid-cols-1 sm:grid-cols-2 gap-6" onSubmit={handleSubmit}>
                        <div className="sm:col-span-2">
                            <label htmlFor="nama" className="block text-sm font-medium text-blue-700 mb-1">
                                <IconUser /> Nama Lengkap
                            </label>
                            <input
                                id="nama"
                                name="nama"
                                type="text"
                                className="w-full border border-blue-300 rounded-xl px-5 py-3 bg-blue-50 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200"
                                value={form.nama}
                                onChange={(e) => setForm((f) => ({ ...f, nama: e.target.value }))}
                                required
                                autoComplete="off"
                                placeholder="Masukkan nama lengkap Anda"
                            />
                        </div>

                        <div>
                            <label htmlFor="golonganDarah" className="block text-sm font-medium text-blue-700 mb-1">
                                <IconBloodType /> Golongan Darah
                            </label>
                            <select
                                id="golonganDarah"
                                name="golonganDarah"
                                className="w-full border border-blue-300 rounded-xl px-5 py-3 bg-blue-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200"
                                value={form.golonganDarah}
                                onChange={(e) => setForm((f) => ({ ...f, golonganDarah: e.target.value }))}
                                required
                            >
                                <option value="">Pilih Golongan Darah</option>
                                <option value="A">A</option>
                                <option value="B">B</option>
                                <option value="AB">AB</option>
                                <option value="O">O</option>
                            </select>
                        </div>

                        <div>
                            <label htmlFor="tanggalLahir" className="block text-sm font-medium text-blue-700 mb-1">
                                <IconCalendar /> Tanggal Lahir
                            </label>
                            <input
                                id="tanggalLahir"
                                name="tanggalLahir"
                                type="date"
                                className="w-full border border-blue-300 rounded-xl px-5 py-3 bg-blue-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200"
                                value={form.tanggalLahir}
                                onChange={(e) => setForm((f) => ({ ...f, tanggalLahir: e.target.value }))}
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="gender" className="block text-sm font-medium text-blue-700 mb-1">
                                <IconGender /> Gender
                            </label>
                            <select
                                id="gender"
                                name="gender"
                                className="w-full border border-blue-300 rounded-xl px-5 py-3 bg-blue-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200"
                                value={form.gender}
                                onChange={(e) => setForm((f) => ({ ...f, gender: e.target.value }))}
                                required
                            >
                                <option value="">Pilih Gender</option>
                                <option value="Laki-laki">Laki-laki</option>
                                <option value="Perempuan">Perempuan</option>
                            </select>
                        </div>

                        <div className="sm:col-span-2">
                            <label htmlFor="alamat" className="block text-sm font-medium text-blue-700 mb-1">
                                <IconLocation /> Alamat Lengkap
                            </label>
                            <textarea
                                id="alamat"
                                name="alamat"
                                className="w-full border border-blue-300 rounded-xl px-5 py-3 bg-blue-50 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200"
                                value={form.alamat}
                                onChange={(e) => setForm((f) => ({ ...f, alamat: e.target.value }))}
                                rows={3}
                                required
                                placeholder="Cth: Jl. Contoh No. 123, Kota A"
                            />
                        </div>

                        <div>
                            <label htmlFor="noTelepon" className="block text-sm font-medium text-blue-700 mb-1">
                                <IconPhone /> No. Telepon
                            </label>
                            <input
                                id="noTelepon"
                                name="noTelepon"
                                type="tel" // Tetap type="tel" untuk keyboard numerik di mobile
                                // Hapus pattern="[0-9]*" jika Anda ingin validasi hanya di submit
                                className="w-full border border-blue-300 rounded-xl px-5 py-3 bg-blue-50 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200"
                                value={form.noTelepon}
                                onChange={(e) => setForm((f) => ({ ...f, noTelepon: e.target.value }))} // KOREKSI: Hapus .replace(/\D/g, '')
                                required
                                placeholder="Cth: 081234567890"
                            />
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-blue-700 mb-1">
                                <IconMail /> Email
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                className="w-full border border-blue-300 rounded-xl px-5 py-3 bg-blue-50 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200"
                                value={form.email}
                                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                                required
                                placeholder="Cth: nama@example.com"
                            />
                        </div>

                        <div className="sm:col-span-2">
                            <label htmlFor="adminRS" className="block text-sm font-medium text-blue-700 mb-1">
                                <IconHospital /> Pilih Rumah Sakit Penanggung Jawab
                            </label>
                            <select
                                id="adminRS"
                                name="adminRS"
                                className="w-full border border-blue-300 rounded-xl px-5 py-3 bg-blue-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200"
                                value={form.adminRS}
                                onChange={(e) => setForm((f) => ({ ...f, adminRS: e.target.value }))}
                                required
                            >
                                <option value="">-- Pilih Rumah Sakit --</option>
                                {listAdminRS.map(({ address, nama }) => (
                                    <option key={address} value={address}>
                                        {nama}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="sm:col-span-2 flex justify-between mt-6 space-x-4">
                            <button
                                className="flex-1 bg-gray-400 hover:bg-gray-500 text-white px-8 py-3 rounded-xl font-bold shadow-lg transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-gray-300 focus:ring-opacity-75 text-lg"
                                type="button"
                                onClick={onLogout}
                                disabled={isSubmitting}
                            >
                                Kembali
                            </button>
                            <button
                                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-3 rounded-xl font-bold shadow-lg transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300 focus:ring-opacity-75 text-lg disabled:opacity-60 disabled:cursor-not-allowed"
                                type="submit"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? "Menyimpan Data..." : "Simpan Data Diri"}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}