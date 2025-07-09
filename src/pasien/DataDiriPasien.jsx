import React, { useState, useEffect } from "react";

// Komponen untuk ikon (menggunakan karakter Unicode)
const IconUser = () => <span className="mr-2 text-blue-600">👤</span>;
const IconCalendar = () => <span className="mr-2 text-blue-600">📅</span>;
const IconMail = () => <span className="mr-2 text-blue-600">📧</span>;
const IconPhone = () => <span className="mr-2 text-blue-600">📞</span>;
const IconLocation = () => <span className="mr-2 text-blue-600">🏠</span>;
const IconGender = () => <span className="mr-2 text-blue-600">🚻</span>;
const IconBloodType = () => <span className="mr-2 text-red-600">🩸</span>;
const IconHospital = () => <span className="mr-2 text-blue-600">🏥</span>;
const IconEdit = () => <span className="mr-2">✏️</span>;
const IconId = () => <span className="mr-2 text-blue-600">🆔</span>;
const IconNIK = () => <span className="mr-2 text-blue-600">💳</span>; // Ikon baru untuk NIK

// Komponen DetailItem yang diperbaiki
const DetailItem = ({ icon, label, value, colSpan = 1 }) => (
  <div className={`${colSpan === 2 ? 'md:col-span-2' : ''}`}>
    <div className="flex items-start">
      <span className="font-medium text-gray-700 min-w-0 flex items-center mr-3">
        {icon} {label}:
      </span>
      <span className="text-gray-900 break-words flex-1">
        {value || "-"}
      </span>
    </div>
  </div>
);


export default function DataDiriPasien({
  dataDiri,
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
        NIK: dataDiri.NIK || '', // <-- Inisialisasi NIK di editFormData
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

    // Validasi NIK: harus 16 digit angka
    if (!/^\d{16}$/.test(editFormData.NIK)) {
      alert("NIK harus terdiri dari 16 digit angka.");
      setIsSubmitting(false);
      return;
    }

    // Validasi Nomor Telepon: hanya boleh berisi angka
    if (!/^\d+$/.test(editFormData.noTelepon)) {
      alert("Nomor Telepon hanya boleh berisi angka.");
      setIsSubmitting(false);
      return;
    }

    try {
      await updatePasienData(editFormData);
      setShowEditDataDiriModal(false);
    } catch (error) {
      console.error("Error submitting updated data:", error);
      // Pesan error dari PasienPage (kontrak) sudah ditangani di sana
      // Cukup tampilkan pesan generik atau error yang dilempar dari PasienPage
      alert(error.message || "Gagal memperbarui data diri.");
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

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Card Data Diri Pasien */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Data Diri Pasien
          </h2>
          <button
            onClick={() => setShowEditDataDiriModal(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            <IconEdit /> Edit Data Diri
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DetailItem icon={<IconId />} label="ID Pasien" value={dataDiri.ID} />
          <DetailItem icon={<IconUser />} label="Nama Lengkap" value={dataDiri.nama} />
          <DetailItem icon={<IconNIK />} label="NIK" value={dataDiri.NIK} /> {/* <-- Tampilkan NIK di sini */}
          <DetailItem icon={<IconBloodType />} label="Golongan Darah" value={dataDiri.golonganDarah} />
          <DetailItem icon={<IconCalendar />} label="Tanggal Lahir" value={dataDiri.tanggalLahir} />
          <DetailItem icon={<IconGender />} label="Gender" value={dataDiri.gender} />
          <DetailItem icon={<IconPhone />} label="No. Telepon" value={dataDiri.noTelepon} />
          <DetailItem icon={<IconMail />} label="Email" value={dataDiri.email} />
          <DetailItem icon={<IconLocation />} label="Alamat" value={dataDiri.alamat} colSpan={2} /> {/* Alamat bisa full-width */}
        </div>
      </div>

      {/* Modal Edit Data Diri */}
      {showEditDataDiriModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Edit Data Diri</h3>
                <button
                  onClick={() => setShowEditDataDiriModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleEditDataDiriSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
                  <input
                    type="text"
                    value={editFormData.nama || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, nama: e.target.value })}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    autoComplete="off"
                  />
                </div>

                {/* Input NIK di Modal Edit Data Diri */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nomor Induk Kependudukan (NIK)</label>
                  <input
                    type="text"
                    pattern="\d{16}"
                    maxLength="16"
                    value={editFormData.NIK || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, NIK: e.target.value })}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    autoComplete="off"
                    placeholder="16 digit NIK"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Golongan Darah</label>
                  <input
                    type="text"
                    value={editFormData.golonganDarah || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, golonganDarah: e.target.value })}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    autoComplete="off"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Lahir</label>
                  <input
                    type="date"
                    value={editFormData.tanggalLahir || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, tanggalLahir: e.target.value })}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                  <select
                    value={editFormData.gender || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, gender: e.target.value })}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Pilih</option>
                    <option value="Laki-laki">Laki-laki</option>
                    <option value="Perempuan">Perempuan</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Alamat</label>
                  <textarea
                    value={editFormData.alamat || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, alamat: e.target.value })}
                    rows={3}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    autoComplete="off"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">No. Telepon</label>
                  <input
                    type="tel"
                    value={editFormData.noTelepon || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, noTelepon: e.target.value })}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    autoComplete="off"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={editFormData.email || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    autoComplete="off"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowEditDataDiriModal(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                    disabled={isSubmitting}
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Card RS Penanggung Jawab */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">
            🏥 Rumah Sakit Penanggung Jawab
          </h3>
          <button
            onClick={() => setShowEditRSModal(true)}
            className="inline-flex items-center px-4 py-2 bg-teal-600 text-white text-sm font-medium rounded-lg hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition-colors"
          >
            <IconHospital /> Ubah RS
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

      {/* Modal Edit RS */}
      {showEditRSModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Ubah RS Penanggung Jawab</h3>
                <button
                  onClick={() => setShowEditRSModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleEditRSSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pilih Rumah Sakit Baru</label>
                  <select
                    value={selectedRSforUpdate}
                    onChange={(e) => setSelectedRSforUpdate(e.target.value)}
                    required
                    disabled={isSubmitting}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">-- Pilih Rumah Sakit --</option>
                    {listAdminRS.map(({ address, nama }) => (
                      <option key={address} value={address}>
                        {nama}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowEditRSModal(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                    disabled={isSubmitting}
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}