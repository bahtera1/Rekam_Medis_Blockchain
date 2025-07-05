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
    onLogout,
    nextPatientId
}) {
    const [showPopup, setShowPopup] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (nextPatientId && form.ID !== nextPatientId) {
            setForm(prevForm => ({ ...prevForm, ID: nextPatientId }));
        }
    }, [nextPatientId, form.ID, setForm]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

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
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center py-8 px-4">
            {showPopup && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-xl border border-blue-100 animate-pulse">
                        <div className="text-center">
                            <div className="text-6xl mb-4">👋</div>
                            <h2 className="text-2xl font-bold mb-4 text-gray-800">
                                Selamat Datang Pasien Baru!
                            </h2>
                            <p className="mb-6 text-gray-600 leading-relaxed">
                                Alamat wallet Anda belum terdaftar. Mari lengkapi data diri Anda untuk mulai mengakses layanan rekam medis.
                            </p>
                            <button
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
                                onClick={() => setShowPopup(false)}
                            >
                                Lanjutkan Pendaftaran
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {!showPopup && (
                <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-4xl mx-auto border border-gray-200 backdrop-blur-sm">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-gray-800 mb-2">
                            Registrasi Data Diri Pasien
                        </h2>
                        <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 mx-auto rounded-full"></div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" onSubmit={handleSubmit}>
                        <div className="lg:col-span-2">
                            <label htmlFor="nama" className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                                <IconUser /> Nama Lengkap
                            </label>
                            <input
                                id="nama"
                                name="nama"
                                type="text"
                                className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 bg-gray-50 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all duration-200"
                                value={form.nama}
                                onChange={(e) => setForm((f) => ({ ...f, nama: e.target.value }))}
                                required
                                autoComplete="off"
                                placeholder="Masukkan nama lengkap Anda"
                            />
                        </div>

                        <div>
                            <label htmlFor="golonganDarah" className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                                <IconBloodType /> Golongan Darah
                            </label>
                            <select
                                id="golonganDarah"
                                name="golonganDarah"
                                className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 bg-gray-50 text-gray-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all duration-200"
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
                            <label htmlFor="tanggalLahir" className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                                <IconCalendar /> Tanggal Lahir
                            </label>
                            <input
                                id="tanggalLahir"
                                name="tanggalLahir"
                                type="date"
                                className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 bg-gray-50 text-gray-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all duration-200"
                                value={form.tanggalLahir}
                                onChange={(e) => setForm((f) => ({ ...f, tanggalLahir: e.target.value }))}
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="gender" className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                                <IconGender /> Gender
                            </label>
                            <select
                                id="gender"
                                name="gender"
                                className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 bg-gray-50 text-gray-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all duration-200"
                                value={form.gender}
                                onChange={(e) => setForm((f) => ({ ...f, gender: e.target.value }))}
                                required
                            >
                                <option value="">Pilih Gender</option>
                                <option value="Laki-laki">Laki-laki</option>
                                <option value="Perempuan">Perempuan</option>
                            </select>
                        </div>

                        <div>
                            <label htmlFor="noTelepon" className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                                <IconPhone /> No. Telepon
                            </label>
                            <input
                                id="noTelepon"
                                name="noTelepon"
                                type="tel"
                                className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 bg-gray-50 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all duration-200"
                                value={form.noTelepon}
                                onChange={(e) => setForm((f) => ({ ...f, noTelepon: e.target.value }))}
                                required
                                placeholder="Cth: 081234567890"
                            />
                        </div>

                        <div className="lg:col-span-2">
                            <label htmlFor="email" className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                                <IconMail /> Email
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 bg-gray-50 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all duration-200"
                                value={form.email}
                                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                                required
                                placeholder="Cth: nama@example.com"
                            />
                        </div>

                        <div className="lg:col-span-2">
                            <label htmlFor="alamat" className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                                <IconLocation /> Alamat Lengkap
                            </label>
                            <textarea
                                id="alamat"
                                name="alamat"
                                className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 bg-gray-50 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all duration-200 resize-none"
                                value={form.alamat}
                                onChange={(e) => setForm((f) => ({ ...f, alamat: e.target.value }))}
                                rows={3}
                                required
                                placeholder="Cth: Jl. Contoh No. 123, Kota A"
                            />
                        </div>

                        <div className="lg:col-span-2">
                            <label htmlFor="adminRS" className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                                <IconHospital /> Pilih Rumah Sakit Penanggung Jawab
                            </label>
                            <select
                                id="adminRS"
                                name="adminRS"
                                className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 bg-gray-50 text-gray-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all duration-200"
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

                        <div className="lg:col-span-2 flex flex-col sm:flex-row gap-4 mt-8 pt-6 border-t border-gray-200">
                            <button
                                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold shadow-lg transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                type="button"
                                onClick={onLogout}
                                disabled={isSubmitting}
                            >
                                Kembali
                            </button>
                            <button
                                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-lg font-semibold shadow-lg transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                type="button"
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? "Menyimpan Data..." : "Simpan Data Diri"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}