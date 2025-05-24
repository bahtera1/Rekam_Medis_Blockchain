import React, { useState } from "react";

export default function DataDiriPasien({
    isRegistered,
    dataDiri,
    rekamMedisTerbaru,
    submitDataDiri,
    form,
    setForm,
}) {
    // State untuk kontrol pop up konfirmasi
    const [showPopup, setShowPopup] = useState(!isRegistered);

    // Jika pasien **belum terdaftar**, tampilkan pop up lalu baru form
    if (!isRegistered) {
        return (
            <div className="bg-white rounded-2xl shadow-lg p-8 max-w-xl mx-auto border border-blue-100 mt-8">
                {/* Pop up konfirmasi daftar */}
                {showPopup && (
                    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                        <div className="bg-white rounded-xl p-8 max-w-sm mx-auto shadow-lg border border-blue-300 relative animate-fadeIn">
                            <h2 className="text-xl font-bold mb-4 text-blue-800 text-center">
                                Daftar Sebagai Pasien Baru
                            </h2>
                            <p className="mb-4 text-center text-gray-700">
                                Alamat wallet Anda belum terdaftar sebagai pasien. Silakan lanjutkan untuk mengisi data pendaftaran pasien baru.
                            </p>
                            <button
                                className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold transition"
                                onClick={() => setShowPopup(false)}
                            >
                                Lanjutkan Daftar
                            </button>
                        </div>
                    </div>
                )}

                {/* Form hanya muncul jika pop up sudah ditutup */}
                {!showPopup && (
                    <>
                        <h2 className="text-2xl font-extrabold mb-6 text-blue-800 text-center tracking-wide">
                            Data Diri Pasien
                        </h2>
                        <form className="space-y-4" onSubmit={e => { e.preventDefault(); submitDataDiri(); }}>
                            {/* Semua input form */}
                            <div>
                                <label className="block font-semibold text-blue-700 mb-1">Nama Lengkap</label>
                                <input name="nama" type="text"
                                    className="w-full border border-blue-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 bg-blue-50"
                                    value={form.nama} onChange={e => setForm(f => ({ ...f, nama: e.target.value }))} required autoComplete="off" />
                            </div>
                            <div>
                                <label className="block font-semibold text-blue-700 mb-1">Umur</label>
                                <input name="umur" type="number" min={0}
                                    className="w-full border border-blue-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 bg-blue-50"
                                    value={form.umur} onChange={e => setForm(f => ({ ...f, umur: e.target.value }))} required />
                            </div>
                            <div>
                                <label className="block font-semibold text-blue-700 mb-1">Golongan Darah</label>
                                <input name="golonganDarah" type="text"
                                    className="w-full border border-blue-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 bg-blue-50"
                                    value={form.golonganDarah} onChange={e => setForm(f => ({ ...f, golonganDarah: e.target.value }))} required />
                            </div>
                            <div>
                                <label className="block font-semibold text-blue-700 mb-1">Tanggal Lahir</label>
                                <input name="tanggalLahir" type="date"
                                    className="w-full border border-blue-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 bg-blue-50"
                                    value={form.tanggalLahir} onChange={e => setForm(f => ({ ...f, tanggalLahir: e.target.value }))} required />
                            </div>
                            <div>
                                <label className="block font-semibold text-blue-700 mb-1">Gender</label>
                                <select name="gender"
                                    className="w-full border border-blue-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 bg-blue-50"
                                    value={form.gender} onChange={e => setForm(f => ({ ...f, gender: e.target.value }))} required>
                                    <option value="">Pilih</option>
                                    <option value="Laki-laki">Laki-laki</option>
                                    <option value="Perempuan">Perempuan</option>
                                    <option value="Lainnya">Lainnya</option>
                                </select>
                            </div>
                            <div>
                                <label className="block font-semibold text-blue-700 mb-1">Alamat</label>
                                <textarea name="alamat"
                                    className="w-full border border-blue-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 bg-blue-50"
                                    value={form.alamat} onChange={e => setForm(f => ({ ...f, alamat: e.target.value }))} rows={2} required />
                            </div>
                            <div>
                                <label className="block font-semibold text-blue-700 mb-1">No. Telepon</label>
                                <input name="noTelepon" type="tel"
                                    className="w-full border border-blue-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 bg-blue-50"
                                    value={form.noTelepon} onChange={e => setForm(f => ({ ...f, noTelepon: e.target.value }))} required />
                            </div>
                            <div>
                                <label className="block font-semibold text-blue-700 mb-1">Email</label>
                                <input name="email" type="email"
                                    className="w-full border border-blue-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 bg-blue-50"
                                    value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
                            </div>
                            <button
                                className="mt-8 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-bold w-full shadow transition"
                                type="submit"
                            >
                                Simpan Data Diri
                            </button>
                        </form>
                    </>
                )}
            </div>
        );
    }

    // Jika pasien sudah terdaftar, tampilkan data diri dan rekam medis terbaru (tidak berubah)
    return (
        <div className="max-w-2xl mx-auto mt-8">
            <div className="bg-white rounded-2xl shadow-xl p-10 border border-blue-100 mb-4">
                <h2 className="text-2xl font-extrabold mb-8 text-blue-800 text-center tracking-wide">
                    Data Diri Anda
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-4">
                    <p><span className="font-semibold text-blue-700">Nama:</span> {dataDiri.nama}</p>
                    <p><span className="font-semibold text-blue-700">Umur:</span> {dataDiri.umur}</p>
                    <p><span className="font-semibold text-blue-700">Golongan Darah:</span> {dataDiri.golonganDarah}</p>
                    <p><span className="font-semibold text-blue-700">Tanggal Lahir:</span> {dataDiri.tanggalLahir}</p>
                    <p><span className="font-semibold text-blue-700">Gender:</span> {dataDiri.gender}</p>
                    <p><span className="font-semibold text-blue-700">Alamat:</span> {dataDiri.alamat}</p>
                    <p><span className="font-semibold text-blue-700">No. Telepon:</span> {dataDiri.noTelepon}</p>
                    <p><span className="font-semibold text-blue-700">Email:</span> {dataDiri.email}</p>
                </div>
            </div>
            {/* Card rekam medis tepat di bawah data diri */}
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-blue-100 mb-6">
                <h3 className="text-lg font-bold mb-4 text-blue-700 text-center">Rekam Medis Terbaru</h3>
                {rekamMedisTerbaru ? (
                    <div className="space-y-2">
                        <p><span className="font-medium text-blue-700">ID:</span> {rekamMedisTerbaru.id}</p>
                        <p><span className="font-medium text-blue-700">Diagnosa:</span> {rekamMedisTerbaru.diagnosa}</p>
                        <p><span className="font-medium text-blue-700">Catatan:</span> {rekamMedisTerbaru.catatan}</p>
                        <p>
                            <span className="font-medium text-blue-700">Foto:</span>{" "}
                            {rekamMedisTerbaru.foto
                                ? <a href={rekamMedisTerbaru.foto} className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">Lihat Foto</a>
                                : <span className="italic text-gray-500">Tidak ada</span>
                            }
                        </p>
                        <p>
                            <span className="font-medium text-blue-700">Status Valid:</span>{" "}
                            {rekamMedisTerbaru.valid
                                ? <span className="text-green-600 font-bold">Valid</span>
                                : <span className="text-red-600 font-bold">Tidak Valid</span>
                            }
                        </p>
                    </div>
                ) : (
                    <p className="italic text-gray-500 text-center">Belum ada rekam medis.</p>
                )}
            </div>
        </div>
    );
}
