import React, { useState } from "react";

export default function DataDiriPasien({
  isRegistered,
  dataDiri,
  rekamMedisTerbaru,
  submitDataDiri,
  form,
  setForm,
  listAdminRS = [],
}) {
  // State untuk kontrol popup pendaftaran pasien baru
  const [showPopup, setShowPopup] = useState(!isRegistered);

  if (!isRegistered) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-6 max-w-xl mx-auto border border-blue-100 mt-10 transform transition-all duration-300 hover:shadow-2xl">
        {/* Popup konfirmasi pendaftaran */}
        {showPopup && (
          <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-sm mx-auto shadow-2xl border border-blue-200 animate-fadeIn">
              <h2 className="text-xl font-bold mb-4 text-blue-800 text-center">
                Daftar Sebagai Pasien Baru
              </h2>
              <p className="mb-6 text-center text-gray-600">
                Alamat wallet Anda belum terdaftar sebagai pasien. Silakan lanjutkan untuk mengisi data pendaftaran pasien baru.
              </p>
              <button
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onClick={() => setShowPopup(false)}
              >
                Lanjutkan Daftar
              </button>
            </div>
          </div>
        )}

        {/* Form pendaftaran pasien baru */}
        {!showPopup && (
          <>
            <h2 className="text-2xl font-extrabold mb-6 text-blue-800 text-center tracking-wide">
              Data Diri Pasien
            </h2>
            <form
              className="space-y-5"
              onSubmit={(e) => {
                e.preventDefault();
                submitDataDiri();
              }}
            >
              {/* Nama Lengkap */}
              <div>
                <label className="block text-sm font-medium text-blue-700 mb-2">
                  Nama Lengkap
                </label>
                <input
                  name="nama"
                  type="text"
                  className="w-full border border-blue-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 bg-blue-50 text-gray-800 placeholder-gray-400 focus:outline-none transition-all duration-200"
                  value={form.nama}
                  onChange={(e) => setForm((f) => ({ ...f, nama: e.target.value }))}
                  required
                  autoComplete="off"
                />
              </div>

              {/* Umur */}
              <div>
                <label className="block text-sm font-medium text-blue-700 mb-2">
                  Umur
                </label>
                <input
                  name="umur"
                  type="number"
                  min={0}
                  className="w-full border border-blue-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 bg-blue-50 text-gray-800 placeholder-gray-400 focus:outline-none transition-all duration-200"
                  value={form.umur}
                  onChange={(e) => setForm((f) => ({ ...f, umur: e.target.value }))}
                  required
                />
              </div>

              {/* Golongan Darah */}
              <div>
                <label className="block text-sm font-medium text-blue-700 mb-2">
                  Golongan Darah
                </label>
                <input
                  name="golonganDarah"
                  type="text"
                  className="w-full border border-blue-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 bg-blue-50 text-gray-800 placeholder-gray-400 focus:outline-none transition-all duration-200"
                  value={form.golonganDarah}
                  onChange={(e) => setForm((f) => ({ ...f, golonganDarah: e.target.value }))}
                  required
                />
              </div>

              {/* Tanggal Lahir */}
              <div>
                <label className="block text-sm font-medium text-blue-700 mb-2">
                  Tanggal Lahir
                </label>
                <input
                  name="tanggalLahir"
                  type="date"
                  className="w-full border border-blue-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 bg-blue-50 text-gray-800 placeholder-gray-400 focus:outline-none transition-all duration-200"
                  value={form.tanggalLahir}
                  onChange={(e) => setForm((f) => ({ ...f, tanggalLahir: e.target.value }))}
                  required
                />
              </div>

              {/* Gender */}
              <div>
                <label className="block text-sm font-medium text-blue-700 mb-2">
                  Gender
                </label>
                <select
                  name="gender"
                  className="w-full border border-blue-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 bg-blue-50 text-gray-800 placeholder-gray-400 focus:outline-none transition-all duration-200"
                  value={form.gender}
                  onChange={(e) => setForm((f) => ({ ...f, gender: e.target.value }))}
                  required
                >
                  <option value="">Pilih</option>
                  <option value="Laki-laki">Laki-laki</option>
                  <option value="Perempuan">Perempuan</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>

              {/* Alamat */}
              <div>
                <label className="block text-sm font-medium text-blue-700 mb-2">
                  Alamat
                </label>
                <textarea
                  name="alamat"
                  className="w-full border border-blue-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 bg-blue-50 text-gray-800 placeholder-gray-400 focus:outline-none transition-all duration-200"
                  value={form.alamat}
                  onChange={(e) => setForm((f) => ({ ...f, alamat: e.target.value }))}
                  rows={3}
                  required
                />
              </div>

              {/* No. Telepon */}
              <div>
                <label className="block text-sm font-medium text-blue-700 mb-2">
                  No. Telepon
                </label>
                <input
                  name="noTelepon"
                  type="tel"
                  className="w-full border border-blue-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 bg-blue-50 text-gray-800 placeholder-gray-400 focus:outline-none transition-all duration-200"
                  value={form.noTelepon}
                  onChange={(e) => setForm((f) => ({ ...f, noTelepon: e.target.value }))}
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-blue-700 mb-2">
                  Email
                </label>
                <input
                  name="email"
                  type="email"
                  className="w-full border border-blue-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 bg-blue-50 text-gray-800 placeholder-gray-400 focus:outline-none transition-all duration-200"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  required
                />
              </div>

              {/* Pilih Rumah Sakit */}
              <div>
                <label className="block text-sm font-medium text-blue-700 mb-2">
                  Pilih Rumah Sakit
                </label>
                <select
                  className="w-full border border-blue-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 bg-blue-50 text-gray-800 placeholder-gray-400 focus:outline-none transition-all duration-200"
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

              {/* Tombol Submit */}
              <button
                className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-bold w-full shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
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

  // Pasien sudah terdaftar tampilkan data diri dan rekam medis terbaru
  return (
    <div className="max-w-3xl mx-auto mt-10">
      <div className="bg-white rounded-2xl shadow-xl p-6 border border-blue-100 mb-6">
        <h2 className="text-2xl font-extrabold mb-6 text-blue-800 text-center tracking-wide">
          Data Diri Anda
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 text-gray-700">
          <p className="flex items-center">
            <span className="font-semibold text-blue-700 w-24">Nama:</span>{" "}
            {dataDiri.nama || "-"}
          </p>
          <p className="flex items-center">
            <span className="font-semibold text-blue-700 w-24">Umur:</span>{" "}
            {dataDiri.umur || "-"}
          </p>
          <p className="flex items-center">
            <span className="font-semibold text-blue-700 w-24">Golongan Darah:</span>{" "}
            {dataDiri.golonganDarah || "-"}
          </p>
          <p className="flex items-center">
            <span className="font-semibold text-blue-700 w-24">Tanggal Lahir:</span>{" "}
            {dataDiri.tanggalLahir || "-"}
          </p>
          <p className="flex items-center">
            <span className="font-semibold text-blue-700 w-24">Gender:</span>{" "}
            {dataDiri.gender || "-"}
          </p>
          <p className="flex items-center">
            <span className="font-semibold text-blue-700 w-24">Alamat:</span>{" "}
            {dataDiri.alamat || "-"}
          </p>
          <p className="flex items-center">
            <span className="font-semibold text-blue-700 w-24">No. Telepon:</span>{" "}
            {dataDiri.noTelepon || "-"}
          </p>
          <p className="flex items-center">
            <span className="font-semibold text-blue-700 w-24">Email:</span>{" "}
            {dataDiri.email || "-"}
          </p>
        </div>
      </div>

      {/* Card rekam medis tepat di bawah data diri */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-blue-100">
        <h3 className="text-lg font-bold mb-4 text-blue-700 text-center">
          Rekam Medis Terbaru
        </h3>
        {rekamMedisTerbaru ? (
          <div className="space-y-3 text-gray-700">
            <p className="flex items-center">
              <span className="font-medium text-blue-700 w-20">ID:</span>{" "}
              {rekamMedisTerbaru.id}
            </p>
            <p className="flex items-center">
              <span className="font-medium text-blue-700 w-20">Diagnosa:</span>{" "}
              {rekamMedisTerbaru.diagnosa}
            </p>
            <p className="flex items-center">
              <span className="font-medium text-blue-700 w-20">Catatan:</span>{" "}
              {rekamMedisTerbaru.catatan}
            </p>
            <p className="flex items-center">
              <span className="font-medium text-blue-700 w-20">Foto:</span>{" "}
              {rekamMedisTerbaru.foto ? (
                <a
                  href={rekamMedisTerbaru.foto}
                  className="text-blue-600 hover:text-blue-800 underline transition-colors duration-200"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Lihat Foto
                </a>
              ) : (
                <span className="italic text-gray-500">Tidak ada</span>
              )}
            </p>
            <p className="flex items-center">
              <span className="font-medium text-blue-700 w-20">Status Valid:</span>{" "}
              {rekamMedisTerbaru.valid ? (
                <span className="text-green-600 font-bold">Valid</span>
              ) : (
                <span className="text-red-600 font-bold">Tidak Valid</span>
              )}
            </p>
          </div>
        ) : (
          <p className="italic text-gray-500 text-center">Belum ada rekam medis.</p>
        )}
      </div>
    </div>
  );
}
