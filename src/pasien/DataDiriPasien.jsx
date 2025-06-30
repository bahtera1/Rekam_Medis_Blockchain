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
const IconEdit = () => <span className="mr-2.5">✏️</span>;
const IconId = () => <span className="mr-2.5 text-blue-600 inline">🆔</span>; // Icon for Patient ID
const IconDiagnosa = () => <span className="mr-2.5 text-blue-600 inline">📝</span>;
const IconCatatan = () => <span className="mr-2.5 text-blue-600 inline">🗒️</span>;
const IconFoto = () => <span className="mr-2.5 text-blue-600 inline">📸</span>;
const IconMedicalType = () => <span className="mr-2.5 text-blue-600 inline">🩺</span>; // Tipe Rekam Medis
const IconTime = () => <span className="mr-2.5 text-blue-600 inline">⏱️</span>; // Ikon untuk timestamp
const IconDoctor = () => <span className="mr-2.5 text-blue-600 inline">👨‍⚕️</span>; // Ikon untuk pembuat RM


// MODIFIKASI: Komponen DetailItem untuk memastikan keselarasan
const DetailItem = ({ icon, label, value, colSpan = 1 }) => (
  <p className={`flex items-start ${colSpan === 2 ? 'md:col-span-2' : ''}`}>
    <span className="font-semibold text-blue-700 w-44 flex-shrink-0 flex items-center">
      {icon} {label}:
    </span>{" "}
    <span className="break-words flex-grow">
      {value || "-"}
    </span>
  </p>
);

// Fungsi formatTimestamp
const formatTimestamp = (ts) => {
  if (typeof ts === 'bigint') {
    ts = Number(ts);
  }
  if (!ts || ts === 0 || isNaN(ts)) return "-";
  const date = new Date(ts * 1000);
  return date.toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });
};


export default function DataDiriPasien({
  isRegistered,
  dataDiri, // Now dataDiri will contain the ID
  rekamMedisTerbaru,
  submitDataDiri, // This function should now call the smart contract's selfRegisterPasien without ID
  form,
  setForm,
  listAdminRS = [],
  updatePasienData, // Prop fungsi update data diri
  updatePasienRumahSakit, // Prop fungsi update RS
}) {
  const [showPopup, setShowPopup] = useState(!isRegistered);
  const [showEditDataDiriModal, setShowEditDataDiriModal] = useState(false);
  const [showEditRSModal, setShowEditRSModal] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [selectedRSforUpdate, setSelectedRSforUpdate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (dataDiri) {
      setEditFormData({
        nama: dataDiri.nama || '',
        golonganDarah: dataDiri.golonganDarah || '',
        tanggalLahir: dataDiri.tanggalLahir || '',
        gender: dataDiri.gender || '',
        alamat: dataDiri.alamat || '',
        noTelepon: dataDiri.noTelepon || '',
        email: dataDiri.email || '',
      });
      setSelectedRSforUpdate(dataDiri.rumahSakitPenanggungJawab || "");
    }
  }, [dataDiri]);

  const handleEditDataDiriSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await updatePasienData(editFormData);
      setShowEditDataDiriModal(false);
    } catch (error) {
      console.error("Error submitting updated data:", error);
      alert("Gagal memperbarui data diri.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditRSSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (!selectedRSforUpdate) {
        alert("Mohon pilih Rumah Sakit.");
        setIsSubmitting(false);
        return;
      }
      await updatePasienRumahSakit(selectedRSforUpdate);
      setShowEditRSModal(false);
    } catch (error) {
      console.error("Error submitting updated RS:", error);
      alert("Gagal memperbarui RS penanggung jawab.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isRegistered) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
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
                  <IconUser /> Nama Lengkap
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
                  <IconBloodType /> Golongan Darah
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
                  <IconCalendar /> Tanggal Lahir
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
                  <IconGender /> Gender
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
                  <IconLocation /> Alamat Lengkap
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
                  <IconPhone /> No. Telepon
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
                  <IconMail /> Email
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

              {/* Pilih Rumah Sakit */}
              <div>
                <label
                  htmlFor="adminRS"
                  className="block text-sm font-medium text-blue-700 mb-2"
                >
                  <IconHospital /> Pilih Rumah Sakit
                </label>
                <select
                  id="adminRS"
                  name="adminRS"
                  className="w-full border border-blue-200 rounded-xl px-5 py-3 focus:ring-3 focus:ring-blue-400 bg-blue-50 text-gray-800 placeholder-gray-400 focus:outline-none transition-all duration-300 text-base"
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
                className="mt-8 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-3 rounded-xl font-bold w-full shadow-lg transform transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300 focus:ring-opacity-75 text-lg"
                type="submit"
                disabled={isSubmitting} // Disable button saat submitting
              >
                {isSubmitting ? "Menyimpan Data..." : "Simpan Data Diri"}
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
          {/* --- Tombol Edit --- */}
          <div className="flex justify-end mb-6 gap-3">
            <button
              onClick={() => setShowEditDataDiriModal(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-semibold text-sm flex items-center shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-400"
            >
              <IconEdit /> Edit Data Diri
            </button>
            <button
              onClick={() => setShowEditRSModal(true)}
              className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg font-semibold text-sm flex items-center shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-teal-400"
            >
              <IconHospital /> Ubah RS Penanggung Jawab
            </button>
          </div>
          {/* --- Akhir Tombol Edit --- */}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5 text-gray-700 text-lg">
            <DetailItem icon={<IconId />} label="ID Pasien" value={dataDiri.ID} /> {/* Displaying Patient ID */}
            <DetailItem icon={<IconUser />} label="Nama Lengkap" value={dataDiri.nama} />
            <DetailItem icon={<IconBloodType />} label="Golongan Darah" value={dataDiri.golonganDarah} />
            <DetailItem icon={<IconCalendar />} label="Tanggal Lahir" value={dataDiri.tanggalLahir} />
            <DetailItem icon={<IconGender />} label="Gender" value={dataDiri.gender} />
            <DetailItem icon={<IconLocation />} label="Alamat" value={dataDiri.alamat} />
            <DetailItem icon={<IconPhone />} label="No. Telepon" value={dataDiri.noTelepon} />
            <DetailItem icon={<IconMail />} label="Email" value={dataDiri.email} />
            <DetailItem
              icon={<IconHospital />}
              label="RS Penanggung Jawab"
              value={
                dataDiri.rumahSakitPenanggungJawab && dataDiri.rumahSakitPenanggungJawab !== '0x0000000000000000000000000000000000000000'
                  ? listAdminRS.find(admin => admin.address === dataDiri.rumahSakitPenanggungJawab)?.nama || dataDiri.rumahSakitPenanggungJawab
                  : "Belum Terdaftar"
              }
              colSpan={2} // Menggunakan colSpan agar memenuhi 2 kolom
            />
          </div>
        </div>

        {/* Card rekam medis tepat di bawah data diri */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 border border-blue-100 animate-fadeIn delay-100">
          <h3 className="text-2xl sm:text-3xl font-extrabold mb-6 text-blue-800 text-center tracking-tight">
            📜 Rekam Medis Terbaru
          </h3>
          {rekamMedisTerbaru ? (
            // Mengubah ini menjadi DetailItem, dan mengatur colSpan
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5 text-gray-700 text-lg">
              <DetailItem icon={<IconId />} label="ID Rekam Medis" value={rekamMedisTerbaru.id_rm} /> {/* Changed label to ID Rekam Medis */}
              <DetailItem icon={<IconMedicalType />} label="Tipe RM" value={rekamMedisTerbaru.tipeRekamMedis} />
              <DetailItem
                icon={<IconTime />}
                label="Waktu Pembuatan"
                value={formatTimestamp(rekamMedisTerbaru.timestampPembuatan)}
              />
              <DetailItem
                icon={<IconDoctor />}
                label="Dibuat Oleh"
                value={rekamMedisTerbaru.pembuatNama}
              />
              {/* Diagnosa dan Catatan mungkin panjang, biarkan di kolom terpisah atau atur colSpan */}
              <DetailItem icon={<IconDiagnosa />} label="Diagnosa" value={rekamMedisTerbaru.diagnosa} colSpan={2} /> {/* Atur colSpan */}
              <DetailItem icon={<IconCatatan />} label="Catatan" value={rekamMedisTerbaru.catatan} colSpan={2} /> {/* Atur colSpan */}

              {/* Foto (Status Valid telah dihapus) */}
              <p className="flex items-start md:col-span-2">
                <span className="font-semibold text-blue-700 w-44 flex-shrink-0 flex items-center"> {/* w-44 agar sejajar */}
                  <IconFoto /> Foto:
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
            </div>
          ) : (
            <p className="italic text-gray-500 text-center text-lg">
              Belum ada rekam medis yang tercatat.
            </p>
          )}
        </div>
      </div>

      {/* --- Modal Edit Data Diri --- */}
      {showEditDataDiriModal && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-lg mx-auto shadow-2xl animate-fadeIn">
            <button
              className="absolute top-4 right-4 text-2xl text-gray-400 hover:text-red-600 transition-colors focus:outline-none"
              onClick={() => setShowEditDataDiriModal(false)}
            > &times; </button>
            <h3 className="text-2xl font-bold mb-5 text-blue-800 text-center">Edit Data Diri</h3>
            <form onSubmit={handleEditDataDiriSubmit} className="space-y-4">
              {/* Nama Lengkap */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
                <input type="text" name="nama" value={editFormData.nama || ''} onChange={(e) => setEditFormData({ ...editFormData, nama: e.target.value })} required
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500" />
              </div>
              {/* Golongan Darah */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Golongan Darah</label>
                <input type="text" name="golonganDarah" value={editFormData.golonganDarah || ''} onChange={(e) => setEditFormData({ ...editFormData, golonganDarah: e.target.value })} required
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500" />
              </div>
              {/* Tanggal Lahir */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Lahir</label>
                <input type="date" name="tanggalLahir" value={editFormData.tanggalLahir || ''} onChange={(e) => setEditFormData({ ...editFormData, tanggalLahir: e.target.value })} required
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500" />
              </div>
              {/* Gender */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                <select name="gender" value={editFormData.gender || ''} onChange={(e) => setEditFormData({ ...editFormData, gender: e.target.value })} required
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500">
                  <option value="">Pilih</option>
                  <option value="Laki-laki">Laki-laki</option>
                  <option value="Perempuan">Perempuan</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>
              {/* Alamat */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Alamat</label>
                <textarea name="alamat" value={editFormData.alamat || ''} onChange={(e) => setEditFormData({ ...editFormData, alamat: e.target.value })} rows={3} required
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500" />
              </div>
              {/* No. Telepon */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">No. Telepon</label>
                <input type="tel" name="noTelepon" value={editFormData.noTelepon || ''} onChange={(e) => setEditFormData({ ...editFormData, noTelepon: e.target.value })} required
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500" />
              </div>
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" name="email" value={editFormData.email || ''} onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })} required
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500" />
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button type="button" onClick={() => setShowEditDataDiriModal(false)}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg font-semibold transition-colors"
                  disabled={isSubmitting}>
                  Batal
                </button>
                <button type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50"
                  disabled={isSubmitting}>
                  {isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* --- Akhir Modal Edit Data Diri --- */}

      {/* --- Modal Edit RS Penanggung Jawab --- */}
      {showEditRSModal && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-sm mx-auto shadow-2xl animate-fadeIn">
            <button
              className="absolute top-4 right-4 text-2xl text-gray-400 hover:text-red-600 transition-colors focus:outline-none"
              onClick={() => setShowEditRSModal(false)}
            > &times; </button>
            <h3 className="text-2xl font-bold mb-5 text-blue-800 text-center">Ubah RS Penanggung Jawab</h3>
            <form onSubmit={handleEditRSSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pilih Rumah Sakit Baru</label>
                <select
                  value={selectedRSforUpdate}
                  onChange={(e) => setSelectedRSforUpdate(e.target.value)}
                  required
                  disabled={isSubmitting}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500">
                  <option value="">-- Pilih Rumah Sakit --</option>
                  {listAdminRS.map(({ address, nama }) => (
                    <option key={address} value={address}>
                      {nama}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button type="button" onClick={() => setShowEditRSModal(false)}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg font-semibold transition-colors"
                  disabled={isSubmitting}>
                  Batal
                </button>
                <button type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50"
                  disabled={isSubmitting}>
                  {isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* --- Akhir Modal Edit RS Penanggung Jawab --- */}
    </div>
  );
}