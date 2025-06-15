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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        {/* Popup konfirmasi pendaftaran */}
        {showPopup && (
          <div className="fixed inset-0 bg-gray-900 bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl border border-blue-200 transform transition-all duration-300 scale-100 opacity-100 animate-fadeIn">
              <h2 className="text-3xl font-extrabold mb-5 text-blue-700 text-center">
                Selamat Datang Pasien Baru!
              </h2>
              <p className="mb-7 text-center text-gray-600 leading-relaxed">
                Alamat wallet Anda belum terdaftar. Mari lengkapi data diri Anda
                untuk mulai mengakses layanan rekam medis.
              </p>
              <button
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold text-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300 focus:ring-opacity-75 shadow-md"
                onClick={() => setShowPopup(false)}
              >
                Lanjutkan Pendaftaran
              </button>
            </div>
          </div>
        )}

        {/* Form pendaftaran pasien baru */}
        {!showPopup && (
          <div className="bg-white rounded-3xl shadow-2xl p-8 sm:p-10 max-w-2xl mx-auto border border-blue-100 transform transition-all duration-500 hover:shadow-3xl animate-slideInUp">
            <h2 className="text-3xl sm:text-4xl font-extrabold mb-8 text-blue-800 text-center tracking-tight">
              Registrasi Data Diri Pasien
            </h2>
            <form
              className="space-y-6"
              onSubmit={(e) => {
                e.preventDefault();
                submitDataDiri();
              }}
            >
              {/* Nama Lengkap */}
              <div>
                <label
                  htmlFor="nama"
                  className="block text-sm font-medium text-blue-700 mb-2"
                >
                  👤 Nama Lengkap
                </label>
                <input
                  id="nama"
                  name="nama"
                  type="text"
                  className="w-full border border-blue-200 rounded-xl px-5 py-3 focus:ring-3 focus:ring-blue-400 bg-blue-50 text-gray-800 placeholder-gray-400 focus:outline-none transition-all duration-300 text-base"
                  value={form.nama}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, nama: e.target.value }))
                  }
                  required
                  autoComplete="off"
                  placeholder="Masukkan nama lengkap Anda"
                />
              </div>

              {/* Golongan Darah */}
              <div>
                <label
                  htmlFor="golonganDarah"
                  className="block text-sm font-medium text-blue-700 mb-2"
                >
                  🩸 Golongan Darah
                </label>
                <input
                  id="golonganDarah"
                  name="golonganDarah"
                  type="text"
                  className="w-full border border-blue-200 rounded-xl px-5 py-3 focus:ring-3 focus:ring-blue-400 bg-blue-50 text-gray-800 placeholder-gray-400 focus:outline-none transition-all duration-300 text-base"
                  value={form.golonganDarah}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, golonganDarah: e.target.value }))
                  }
                  required
                  placeholder="Contoh: A, B, AB, O"
                />
              </div>

              {/* Tanggal Lahir */}
              <div>
                <label
                  htmlFor="tanggalLahir"
                  className="block text-sm font-medium text-blue-700 mb-2"
                >
                  🎂 Tanggal Lahir
                </label>
                <input
                  id="tanggalLahir"
                  name="tanggalLahir"
                  type="date"
                  className="w-full border border-blue-200 rounded-xl px-5 py-3 focus:ring-3 focus:ring-blue-400 bg-blue-50 text-gray-800 placeholder-gray-400 focus:outline-none transition-all duration-300 text-base"
                  value={form.tanggalLahir}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, tanggalLahir: e.target.value }))
                  }
                  required
                />
              </div>

              {/* Gender */}
              <div>
                <label
                  htmlFor="gender"
                  className="block text-sm font-medium text-blue-700 mb-2"
                >
                  🚻 Gender
                </label>
                <select
                  id="gender"
                  name="gender"
                  className="w-full border border-blue-200 rounded-xl px-5 py-3 focus:ring-3 focus:ring-blue-400 bg-blue-50 text-gray-800 placeholder-gray-400 focus:outline-none transition-all duration-300 text-base"
                  value={form.gender}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, gender: e.target.value }))
                  }
                  required
                >
                  <option value="">Pilih Gender</option>
                  <option value="Laki-laki">Laki-laki</option>
                  <option value="Perempuan">Perempuan</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>

              {/* Alamat */}
              <div>
                <label
                  htmlFor="alamat"
                  className="block text-sm font-medium text-blue-700 mb-2"
                >
                  🏠 Alamat Lengkap
                </label>
                <textarea
                  id="alamat"
                  name="alamat"
                  className="w-full border border-blue-200 rounded-xl px-5 py-3 focus:ring-3 focus:ring-blue-400 bg-blue-50 text-gray-800 placeholder-gray-400 focus:outline-none transition-all duration-300 text-base"
                  value={form.alamat}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, alamat: e.target.value }))
                  }
                  rows={3}
                  required
                  placeholder="Cth: Jl. Contoh No. 123, Kota Contoh"
                />
              </div>

              {/* No. Telepon */}
              <div>
                <label
                  htmlFor="noTelepon"
                  className="block text-sm font-medium text-blue-700 mb-2"
                >
                  📞 No. Telepon
                </label>
                <input
                  id="noTelepon"
                  name="noTelepon"
                  type="tel"
                  className="w-full border border-blue-200 rounded-xl px-5 py-3 focus:ring-3 focus:ring-blue-400 bg-blue-50 text-gray-800 placeholder-gray-400 focus:outline-none transition-all duration-300 text-base"
                  value={form.noTelepon}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, noTelepon: e.target.value }))
                  }
                  required
                  placeholder="Cth: 081234567890"
                />
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-blue-700 mb-2"
                >
                  📧 Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  className="w-full border border-blue-200 rounded-xl px-5 py-3 focus:ring-3 focus:ring-blue-400 bg-blue-50 text-gray-800 placeholder-gray-400 focus:outline-none transition-all duration-300 text-base"
                  value={form.email}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, email: e.target.value }))
                  }
                  required
                  placeholder="Cth: nama@example.com"
                />
              </div>

              {/* Tombol Submit */}
              <button
                className="mt-8 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-3 rounded-xl font-bold w-full shadow-lg transform transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300 focus:ring-opacity-75 text-lg"
                type="submit"
              >
                Simpan Data Diri
              </button>
            </form>
          </div>
        )}
      </div>
    );
  }

  // Pasien sudah terdaftar tampilkan data diri dan rekam medis terbaru
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl shadow-2xl p-8 border border-blue-100 mb-8 animate-fadeIn">
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-8 text-blue-800 text-center tracking-tight">
            Data Diri Pasien
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5 text-gray-700 text-lg">
            <p className="flex items-start">
              <span className="font-semibold text-blue-700 w-44 flex-shrink-0 flex items-center">
                👤 Nama Lengkap:
              </span>{" "}
              <span className="break-words flex-grow">
                {dataDiri.nama || "-"}
              </span>
            </p>
            <p className="flex items-start">
              <span className="font-semibold text-blue-700 w-44 flex-shrink-0 flex items-center">
                🩸 Golongan Darah:
              </span>{" "}
              <span className="break-words flex-grow">
                {dataDiri.golonganDarah || "-"}
              </span>
            </p>
            <p className="flex items-start">
              <span className="font-semibold text-blue-700 w-44 flex-shrink-0 flex items-center">
                🎂 Tanggal Lahir:
              </span>{" "}
              <span className="break-words flex-grow">
                {dataDiri.tanggalLahir || "-"}
              </span>
            </p>
            <p className="flex items-start">
              <span className="font-semibold text-blue-700 w-44 flex-shrink-0 flex items-center">
                🚻 Gender:
              </span>{" "}
              <span className="break-words flex-grow">
                {dataDiri.gender || "-"}
              </span>
            </p>
            <p className="flex items-start col-span-1 md:col-span-2">
              <span className="font-semibold text-blue-700 w-44 flex-shrink-0 flex items-center">
                🏠 Alamat:
              </span>{" "}
              <span className="break-words flex-grow">
                {dataDiri.alamat || "-"}
              </span>
            </p>
            <p className="flex items-start">
              <span className="font-semibold text-blue-700 w-44 flex-shrink-0 flex items-center">
                📞 No. Telepon:
              </span>{" "}
              <span className="break-words flex-grow">
                {dataDiri.noTelepon || "-"}
              </span>
            </p>
            <p className="flex items-start">
              <span className="font-semibold text-blue-700 w-44 flex-shrink-0 flex items-center">
                📧 Email:
              </span>{" "}
              <span className="break-words flex-grow">
                {dataDiri.email || "-"}
              </span>
            </p>
          </div>
        </div>

        {/* Card rekam medis tepat di bawah data diri */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 border border-blue-100 animate-fadeIn delay-100">
          <h3 className="text-2xl sm:text-3xl font-extrabold mb-6 text-blue-800 text-center tracking-tight">
            📜 Rekam Medis Terbaru
          </h3>
          {rekamMedisTerbaru ? (
            <div className="space-y-4 text-gray-700 text-lg">
              <p className="flex items-start">
                <span className="font-semibold text-blue-700 w-36 flex-shrink-0 flex items-center">
                  🆔 ID:
                </span>{" "}
                <span className="break-words flex-grow">
                  {rekamMedisTerbaru.id}
                </span>
              </p>
              <p className="flex items-start">
                <span className="font-semibold text-blue-700 w-36 flex-shrink-0 flex items-center">
                  📝 Diagnosa:
                </span>{" "}
                <span className="break-words flex-grow">
                  {rekamMedisTerbaru.diagnosa}
                </span>
              </p>
              <p className="flex items-start">
                <span className="font-semibold text-blue-700 w-36 flex-shrink-0 flex items-center">
                  🗒️ Catatan:
                </span>{" "}
                <span className="break-words flex-grow">
                  {rekamMedisTerbaru.catatan}
                </span>
              </p>
              <p className="flex items-start">
                <span className="font-semibold text-blue-700 w-36 flex-shrink-0 flex items-center">
                  📸 Foto:
                </span>{" "}
                {rekamMedisTerbaru.foto ? (
                  <a
                    href={rekamMedisTerbaru.foto}
                    className="text-blue-600 hover:text-blue-800 underline font-medium transition-colors duration-200 flex-grow"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Lihat Foto
                  </a>
                ) : (
                  <span className="italic text-gray-500 flex-grow">
                    Tidak ada
                  </span>
                )}
              </p>
              <p className="flex items-start">
                <span className="font-semibold text-blue-700 w-36 flex-shrink-0 flex items-center">
                  ✅ Status Valid:
                </span>{" "}
                {rekamMedisTerbaru.valid ? (
                  <span className="text-green-600 font-bold flex items-center flex-grow">
                    Valid
                  </span>
                ) : (
                  <span className="text-red-600 font-bold flex items-center flex-grow">
                    ❌ Tidak Valid
                  </span>
                )}
              </p>
            </div>
          ) : (
            <p className="italic text-gray-500 text-center text-lg">
              Belum ada rekam medis yang tercatat.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}