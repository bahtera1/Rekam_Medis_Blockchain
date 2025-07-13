// PasienRegisterPage.js
import React, { useState, useEffect } from "react";

// Komponen untuk ikon (menggunakan karakter Unicode)
const IconUser = () => <span className="mr-1.5 text-blue-600 inline text-sm">👤</span>;
const IconCalendar = () => <span className="mr-1.5 text-blue-600 inline text-sm">📅</span>;
const IconMail = () => <span className="mr-1.5 text-blue-600 inline text-sm">📧</span>;
const IconPhone = () => <span className="mr-1.5 text-blue-600 inline text-sm">📞</span>;
const IconLocation = () => <span className="mr-1.5 text-blue-600 inline text-sm">🏠</span>;
const IconGender = () => <span className="mr-1.5 text-blue-600 inline text-sm">🚻</span>;
const IconBloodType = () => <span className="mr-1.5 text-red-600 inline text-sm">🩸</span>;
const IconHospital = () => <span className="mr-1.5 text-blue-600 inline text-sm">🏥</span>;
const IconNIK = () => <span className="mr-1.5 text-blue-600 inline text-sm">💳</span>;

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

        if (!/^\d{16}$/.test(form.NIK)) {
            alert("NIK harus terdiri dari 16 digit angka.");
            setIsSubmitting(false);
            return;
        }

        if (!/^\d+$/.test(form.noTelepon)) {
            alert("Nomor Telepon hanya boleh berisi angka.");
            setIsSubmitting(false);
            return;
        }

        try {
            await submitDataDiri();
        } catch (error) {
            console.error("Error submitting registration:", error);
            alert("Gagal mendaftar. Silakan coba lagi. Pastikan semua data benar, ID Pasien dan NIK unik.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        // Hapus div pembungkus utama di sini. Biarkan PasienPage yang menanganinya.
        // Cukup render popup dan form utama sebagai sibling, atau bungkus dengan React.Fragment
        <>
            {showPopup && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-2">
                    <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-xl border border-blue-100 animate-pulse">
                        <div className="text-center">
                            <div className="text-5xl mb-3">👋</div>
                            <h2 className="text-xl font-bold mb-3 text-gray-800">
                                Selamat Datang Pasien Baru!
                            </h2>
                            <p className="mb-4 text-gray-600 leading-relaxed text-sm">
                                Alamat wallet Anda belum terdaftar. Mari lengkapi data diri Anda untuk mulai mengakses layanan rekam medis.
                            </p>
                            <button
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-semibold transition-all duration-200 hover:scale-105 active:scale-95 shadow-md hover:shadow-lg"
                                onClick={() => setShowPopup(false)}
                            >
                                Lanjutkan Pendaftaran
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Ini adalah card form utama yang Anda inginkan */}
            {!showPopup && ( // Tetap bungkus form dalam kondisi ini agar muncul setelah popup ditutup
                <div className="bg-white rounded-xl shadow-xl p-6 max-w-3xl mx-auto border border-gray-200">
                    <div className="text-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-800 mb-1.5">
                            Registrasi Data Diri Pasien
                        </h2>
                        <div className="w-20 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 mx-auto rounded-full"></div>
                    </div>

                    <form className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4" onSubmit={handleSubmit}>
                        <div className="md:col-span-2">
                            <label htmlFor="nama" className="flex items-center text-xs font-semibold text-gray-700 mb-1">
                                <IconUser /> Nama Lengkap
                            </label>
                            <input
                                id="nama"
                                name="nama"
                                type="text"
                                className="w-full border border-gray-200 rounded-md px-3 py-2 bg-gray-50 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all duration-200 text-sm"
                                value={form.nama}
                                onChange={(e) => setForm((f) => ({ ...f, nama: e.target.value }))}
                                required
                                autoComplete="off"
                                placeholder="Masukkan nama lengkap Anda"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label htmlFor="nik" className="flex items-center text-xs font-semibold text-gray-700 mb-1">
                                <IconNIK /> Nomor Induk Kependudukan (NIK)
                            </label>
                            <input
                                id="nik"
                                name="NIK"
                                type="text"
                                pattern="\d{16}"
                                maxLength="16"
                                className="w-full border border-gray-200 rounded-md px-3 py-2 bg-gray-50 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all duration-200 text-sm"
                                value={form.NIK}
                                onChange={(e) => setForm((f) => ({ ...f, NIK: e.target.value }))}
                                required
                                autoComplete="off"
                                placeholder="Masukkan 16 digit NIK Anda"
                            />
                        </div>

                        <div>
                            <label htmlFor="golonganDarah" className="flex items-center text-xs font-semibold text-gray-700 mb-1">
                                <IconBloodType /> Golongan Darah
                            </label>
                            <select
                                id="golonganDarah"
                                name="golonganDarah"
                                className="w-full border border-gray-200 rounded-md px-3 py-2 bg-gray-50 text-gray-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all duration-200 text-sm"
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
                            <label htmlFor="tanggalLahir" className="flex items-center text-xs font-semibold text-gray-700 mb-1">
                                <IconCalendar /> Tanggal Lahir
                            </label>
                            <input
                                id="tanggalLahir"
                                name="tanggalLahir"
                                type="date"
                                className="w-full border border-gray-200 rounded-md px-3 py-2 bg-gray-50 text-gray-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all duration-200 text-sm"
                                value={form.tanggalLahir}
                                onChange={(e) => setForm((f) => ({ ...f, tanggalLahir: e.target.value }))}
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="gender" className="flex items-center text-xs font-semibold text-gray-700 mb-1">
                                <IconGender /> Gender
                            </label>
                            <select
                                id="gender"
                                name="gender"
                                className="w-full border border-gray-200 rounded-md px-3 py-2 bg-gray-50 text-gray-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all duration-200 text-sm"
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
                            <label htmlFor="noTelepon" className="flex items-center text-xs font-semibold text-gray-700 mb-1">
                                <IconPhone /> No. Telepon
                            </label>
                            <input
                                id="noTelepon"
                                name="noTelepon"
                                type="tel"
                                className="w-full border border-gray-200 rounded-md px-3 py-2 bg-gray-50 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all duration-200 text-sm"
                                value={form.noTelepon}
                                onChange={(e) => setForm((f) => ({ ...f, noTelepon: e.target.value }))}
                                required
                                autoComplete="off"
                                placeholder="Cth: 081234567890"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label htmlFor="email" className="flex items-center text-xs font-semibold text-gray-700 mb-1">
                                <IconMail /> Email
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                className="w-full border border-gray-200 rounded-md px-3 py-2 bg-gray-50 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all duration-200 text-sm"
                                value={form.email}
                                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                                required
                                autoComplete="off"
                                placeholder="Cth: nama@example.com"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label htmlFor="alamat" className="flex items-center text-xs font-semibold text-gray-700 mb-1">
                                <IconLocation /> Alamat Lengkap
                            </label>
                            <textarea
                                id="alamat"
                                name="alamat"
                                className="w-full border border-gray-200 rounded-md px-3 py-2 bg-gray-50 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all duration-200 resize-none text-sm"
                                value={form.alamat}
                                onChange={(e) => setForm((f) => ({ ...f, alamat: e.target.value }))}
                                rows={2}
                                required
                                autoComplete="off"
                                placeholder="Cth: Jl. Contoh No. 123, Kota A"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label htmlFor="adminRS" className="flex items-center text-xs font-semibold text-gray-700 mb-1">
                                <IconHospital /> Pilih Rumah Sakit Penanggung Jawab
                            </label>
                            <select
                                id="adminRS"
                                name="adminRS"
                                className="w-full border border-gray-200 rounded-md px-3 py-2 bg-gray-50 text-gray-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all duration-200 text-sm"
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

                        <div className="md:col-span-2 flex flex-col sm:flex-row gap-3 mt-4 pt-4 border-t border-gray-200">
                            <button
                                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-5 py-2 rounded-md font-semibold shadow-md transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                                type="button"
                                onClick={onLogout}
                                disabled={isSubmitting}
                            >
                                Kembali
                            </button>
                            <button
                                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-5 py-2 rounded-md font-semibold shadow-md transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                                type="submit"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? "Menyimpan Data..." : "Simpan Data Diri"}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </>
    );
}