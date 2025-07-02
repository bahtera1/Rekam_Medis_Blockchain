import React, { useState, useEffect } from "react";

// Komponen untuk ikon (menggunakan karakter Unicode)
const IconUser = () => <span className="mr-2.5 text-blue-600 inline">👤</span>;
const IconCalendar = () => <span className="mr-2.5 text-blue-600 inline">📅</span>;
const IconMail = () => <span className="mr-2.5 text-blue-600 inline">📧</span>; // <-- Tetap ada karena di SC lama ada email
const IconPhone = () => <span className="mr-2.5 text-blue-600 inline">📞</span>;
const IconLocation = () => <span className="mr-2.5 text-blue-600 inline">🏠</span>;
const IconGender = () => <span className="mr-2.5 text-blue-600 inline">🚻</span>;
const IconBloodType = () => <span className="mr-2.5 text-red-600 inline">🩸</span>;
const IconHospital = () => <span className="mr-2.5 text-blue-600 inline">🏥</span>;
const IconEdit = () => <span className="mr-2.5">✏️</span>;
const IconId = () => <span className="mr-2.5 text-blue-600 inline">🆔</span>;
const IconDiagnosa = () => <span className="mr-2.5 text-blue-600 inline">📝</span>;
const IconCatatan = () => <span className="mr-2.5 text-blue-600 inline">🗒️</span>;
const IconFoto = () => <span className="mr-2.5 text-blue-600 inline">📸</span>;
const IconMedicalType = () => <span className="mr-2.5 text-blue-600 inline">🩺</span>;
const IconTime = () => <span className="mr-2.5 text-blue-600 inline">⏱️</span>;
const IconDoctor = () => <span className="mr-2.5 text-blue-600 inline">👨‍⚕️</span>;

// MODIFIKASI: Komponen DetailItem untuk memastikan keselarasan dan tampilan yang lebih baik
const DetailItem = ({ icon, label, value, colSpan = 1 }) => (
  <p className={`flex items-start ${colSpan === 2 ? 'md:col-span-2' : ''} text-gray-800`}>
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
  dataDiri, // Sudah pasti pasien terdaftar, jadi dataDiri ada
  rekamMedisTerbaru, // Sudah pasti pasien terdaftar
  listAdminRS = [],
  updatePasienData,
  updatePasienRumahSakit,
}) {
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
        email: dataDiri.email || '', // <-- Tetap ada karena di SC lama ada email
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

  // Ini adalah tampilan untuk Pasien yang SUDAH TERDAFTAR
  return (

    <div className="max-w-4xl mx-auto space-y-10">
      {/* Card Data Diri Pasien */}
      <div className="bg-white rounded-3xl shadow-lg p-8 border border-blue-100 animate-fadeIn">
        <h2 className="text-3xl sm:text-4xl font-extrabold mb-6 text-blue-800 text-center tracking-tight pb-2 border-b-2 border-blue-100">
          Data Diri Pasien
        </h2>
        <div className="flex justify-end mb-6">
          <button
            onClick={() => setShowEditDataDiriModal(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-semibold text-sm flex items-center shadow transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-400"
          >
            <IconEdit /> Edit Data Diri
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-gray-700 text-lg">
          <DetailItem icon={<IconId />} label="ID Pasien" value={dataDiri.ID} />
          <DetailItem icon={<IconUser />} label="Nama Lengkap" value={dataDiri.nama} />
          <DetailItem icon={<IconBloodType />} label="Golongan Darah" value={dataDiri.golonganDarah} />
          <DetailItem icon={<IconCalendar />} label="Tanggal Lahir" value={dataDiri.tanggalLahir} />
          <DetailItem icon={<IconGender />} label="Gender" value={dataDiri.gender} />
          <DetailItem icon={<IconLocation />} label="Alamat" value={dataDiri.alamat} />
          <DetailItem icon={<IconPhone />} label="No. Telepon" value={dataDiri.noTelepon} />
          <DetailItem icon={<IconMail />} label="Email" value={dataDiri.email} /> {/* <-- Tetap ada karena di SC lama ada email */}
        </div>
      </div>

      {/* Modal Edit Data Diri (disesuaikan dengan atribut email) */}
      {showEditDataDiriModal && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-8 max-w-lg mx-auto shadow-2xl animate-zoomIn relative">
            <button
              className="absolute top-4 right-4 text-3xl text-gray-400 hover:text-red-600 transition-colors focus:outline-none"
              onClick={() => setShowEditDataDiriModal(false)}
            > &times; </button>
            <h3 className="text-2xl font-bold mb-6 text-blue-800 text-center">Edit Data Diri</h3>
            <form onSubmit={handleEditDataDiriSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
                <input type="text" name="nama" value={editFormData.nama || ''} onChange={(e) => setEditFormData({ ...editFormData, nama: e.target.value })} required
                  className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Golongan Darah</label>
                <input type="text" name="golonganDarah" value={editFormData.golonganDarah || ''} onChange={(e) => setEditFormData({ ...editFormData, golonganDarah: e.target.value })} required
                  className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Lahir</label>
                <input type="date" name="tanggalLahir" value={editFormData.tanggalLahir || ''} onChange={(e) => setEditFormData({ ...editFormData, tanggalLahir: e.target.value })} required
                  className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                <select name="gender" value={editFormData.gender || ''} onChange={(e) => setEditFormData({ ...editFormData, gender: e.target.value })} required
                  className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200">
                  <option value="">Pilih</option>
                  <option value="Laki-laki">Laki-laki</option>
                  <option value="Perempuan">Perempuan</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Alamat</label>
                <textarea name="alamat" value={editFormData.alamat || ''} onChange={(e) => setEditFormData({ ...editFormData, alamat: e.target.value })} rows={3} required
                  className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">No. Telepon</label>
                <input type="tel" name="noTelepon" value={editFormData.noTelepon || ''} onChange={(e) => setEditFormData({ ...editFormData, noTelepon: e.target.value })} required
                  className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" name="email" value={editFormData.email || ''} onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })} required
                  className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200" />
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button type="button" onClick={() => setShowEditDataDiriModal(false)}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-5 py-2 rounded-lg font-semibold transition-colors duration-200"
                  disabled={isSubmitting}>
                  Batal
                </button>
                <button type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-semibold transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isSubmitting}>
                  {isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Card RS Penanggung Jawab */}
      <div className="bg-white rounded-3xl shadow-lg p-8 border border-blue-100 animate-fadeIn delay-100">
        <h3 className="text-2xl sm:text-3xl font-extrabold mb-4 text-blue-800 text-center tracking-tight pb-1 border-b border-blue-100">
          🏥 Rumah Sakit Penanggung Jawab
        </h3>
        <div className="flex justify-end mb-6">
          <button
            onClick={() => setShowEditRSModal(true)}
            className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg font-semibold text-sm flex items-center shadow transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-teal-400"
          >
            <IconHospital /> Ubah RS Penanggung Jawab
          </button>
        </div>
        <DetailItem
          icon={<IconHospital />}
          label="RS Penanggung Jawab"
          value={
            dataDiri.rumahSakitPenanggungJawab &&
              dataDiri.rumahSakitPenanggungJawab !== '0x0000000000000000000000000000000000000000'
              ? listAdminRS.find(admin => admin.address === dataDiri.rumahSakitPenanggungJawab)?.nama ||
              dataDiri.rumahSakitPenanggungJawab
              : "Belum Terdaftar"
          }
          colSpan={2}
        />
      </div>

      {/* Modal Edit RS Penanggung Jawab (Tidak ada perubahan signifikan di sini) */}
      {showEditRSModal && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-8 max-w-sm mx-auto shadow-2xl animate-zoomIn relative">
            <button
              className="absolute top-4 right-4 text-3xl text-gray-400 hover:text-red-600 transition-colors focus:outline-none"
              onClick={() => setShowEditRSModal(false)}
            > &times; </button>
            <h3 className="text-2xl font-bold mb-6 text-blue-800 text-center">Ubah RS Penanggung Jawab</h3>
            <form onSubmit={handleEditRSSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pilih Rumah Sakit Baru</label>
                <select
                  value={selectedRSforUpdate}
                  onChange={(e) => setSelectedRSforUpdate(e.target.value)}
                  required
                  disabled={isSubmitting}
                  className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200">
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
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-5 py-2 rounded-lg font-semibold transition-colors duration-200"
                  disabled={isSubmitting}>
                  Batal
                </button>
                <button type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-semibold transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isSubmitting}>
                  {isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* --- Akhir Modal Edit RS Penanggung Jawab --- */}

      {/* Card Rekam Medis Terbaru (Asumsi rekamMedisTerbaru sudah memiliki pembuatRSNama dari parent) */}
      {/* Jika tidak, Anda perlu menambahkan logic getHospitalName di parent atau di sini */}
      <div className="bg-white rounded-3xl shadow-lg p-8 border border-blue-100 animate-fadeIn delay-200">
        <h3 className="text-2xl sm:text-3xl font-extrabold mb-4 text-blue-800 text-center tracking-tight pb-1 border-b border-blue-100">
          📜 Rekam Medis Terbaru
        </h3>
        {rekamMedisTerbaru ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-gray-700 text-lg">
              <DetailItem icon={<IconId />} label="ID Rekam Medis" value={rekamMedisTerbaru.id_rm} />
              <DetailItem icon={<IconMedicalType />} label="Tipe RM" value={rekamMedisTerbaru.tipeRekamMedis} />
              <DetailItem icon={<IconDiagnosa />} label="Diagnosa" value={rekamMedisTerbaru.diagnosa} />
              <DetailItem icon={<IconDoctor />} label="Dibuat Oleh" value={rekamMedisTerbaru.pembuatNama} />
              <DetailItem icon={<IconCatatan />} label="Catatan" value={rekamMedisTerbaru.catatan} />
              {/* Asumsi: rekamMedisTerbaru sudah memiliki properti pembuatRSNama yang sudah dikonversi di parent */}
              {/* Jika rekamMedisTerbaru tidak memiliki pembuatRSNama, Anda perlu menambahkan logika konversi di PasienPage.jsx */}
              <DetailItem icon={<IconHospital />} label="RS Pembuat" value={rekamMedisTerbaru.pembuatRSNama || 'N/A'} />
            </div>

            <hr className="my-4 border-t border-blue-100" />

            <div className="flex flex-col md:flex-row md:justify-between md:items-center text-gray-700 text-lg space-y-4 md:space-y-0">
              <DetailItem
                icon={<IconTime />}
                label="Waktu Pembuatan"
                value={formatTimestamp(rekamMedisTerbaru.timestampPembuatan)}
              />
              <div className="flex items-center w-full md:w-auto">
                <span className="font-semibold text-blue-700 w-44 flex-shrink-0 flex items-center">
                  <IconFoto /> Foto:
                </span>{" "}
                {rekamMedisTerbaru.foto ? (
                  <a
                    href={rekamMedisTerbaru.foto}
                    className="inline-block bg-blue-100 hover:bg-blue-200 text-blue-700 px-4 py-2 rounded transition-colors duration-200"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Lihat Foto/File
                  </a>
                ) : (
                  <span className="italic text-gray-500">Tidak ada</span>
                )}
              </div>
            </div>
          </div>
        ) : (
          <p className="italic text-gray-500 text-center text-lg py-4">
            Belum ada rekam medis yang tercatat.
          </p>
        )}
      </div>
    </div>
  );
}