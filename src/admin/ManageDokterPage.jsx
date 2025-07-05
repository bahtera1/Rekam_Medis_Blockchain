import React, { useState } from "react";

export default function ManageDokterPage({
  dokterList,
  dokterAddress,
  dokterNama,
  dokterSpesialisasi,
  dokterNomorLisensi,
  loading,
  setDokterAddress,
  setDokterNama,
  setDokterSpesialisasi,
  setDokterNomorLisensi,
  registerDokter,
  toggleStatusDokter,
  updateDokterInfo,
}) {
  const [search, setSearch] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentEditingDokter, setCurrentEditingDokter] = useState(null);
  const [editNama, setEditNama] = useState("");
  const [editSpesialisasi, setEditSpesialisasi] = useState("");
  const [editNomorLisensi, setEditNomorLisensi] = useState("");

  const spesialisasiOptions = ["Umum", "Anak", "Penyakit Dalam", "Bedah", "Gigi"];

  const filteredDokter = dokterList.filter((d) => {
    const q = search.toLowerCase();
    return [d.nama, d.address, d.spesialisasi, d.nomorLisensi]
      .join(" ").toLowerCase().includes(q);
  });

  const handleOpenEditModal = (dokter) => {
    setCurrentEditingDokter(dokter);
    setEditNama(dokter.nama);
    setEditSpesialisasi(dokter.spesialisasi);
    setEditNomorLisensi(dokter.nomorLisensi);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setCurrentEditingDokter(null);
  };

  const handleSaveChanges = async () => {
    if (!currentEditingDokter) return;
    try {
      await updateDokterInfo(
        currentEditingDokter.address,
        editNama,
        editSpesialisasi,
        editNomorLisensi
      );
      handleCloseEditModal();
    } catch (error) {
      console.error("Gagal update dokter:", error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Form Pendaftaran */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
          <span className="text-blue-600 mr-2">👨‍⚕️</span>
          Daftarkan Dokter Baru
        </h3>

        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Alamat Wallet Dokter
            </label>
            <input
              type="text"
              placeholder="0x123Abc..."
              value={dokterAddress}
              onChange={(e) => setDokterAddress(e.target.value)}
              disabled={loading}
              className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all disabled:bg-gray-50"
            />
            <p className="text-xs text-gray-500 mt-1">Alamat wallet unik dokter</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Nama Lengkap Dokter
            </label>
            <input
              type="text"
              placeholder="Dr. John Doe, Sp.A"
              value={dokterNama}
              onChange={(e) => setDokterNama(e.target.value)}
              disabled={loading}
              className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all disabled:bg-gray-50"
            />
            <p className="text-xs text-gray-500 mt-1">Sertakan gelar medis</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Spesialisasi
            </label>
            <select
              value={dokterSpesialisasi}
              onChange={(e) => setDokterSpesialisasi(e.target.value)}
              disabled={loading}
              className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all disabled:bg-gray-50"
            >
              <option value="">Pilih Spesialisasi</option>
              {spesialisasiOptions.map((spec) => (
                <option key={spec} value={spec}>{spec}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Nomor Lisensi
            </label>
            <input
              type="text"
              placeholder="SIP-12345/2025"
              value={dokterNomorLisensi}
              onChange={(e) => setDokterNomorLisensi(e.target.value)}
              disabled={loading}
              className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all disabled:bg-gray-50"
            />
            <p className="text-xs text-gray-500 mt-1">Nomor lisensi resmi</p>
          </div>
        </div>

        <button
          onClick={registerDokter}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 hover:scale-105 active:scale-95"
        >
          {loading ? "Menyimpan..." : "Daftarkan Dokter"}
        </button>
      </div>

      {/* Daftar Dokter */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <h3 className="text-2xl font-bold text-gray-800 flex items-center mb-4 sm:mb-0">
            <span className="text-green-600 mr-2">📋</span>
            Daftar Dokter
          </h3>
          <div className="bg-blue-50 px-4 py-2 rounded-lg">
            <span className="text-sm font-medium text-blue-700">
              Total: {dokterList.length} dokter
            </span>
          </div>
        </div>

        <div className="relative mb-6">
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Cari berdasarkan nama, alamat, spesialisasi, atau nomor lisensi..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
          />
        </div>

        {filteredDokter.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-gray-500 text-lg">
              {search ? "Tidak ada dokter yang cocok" : "Belum ada dokter terdaftar"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">No</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Alamat Wallet</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Nama</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Spesialisasi</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Lisensi</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredDokter.map((d, index) => (
                  <tr key={d.address} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 text-gray-600">{index + 1}</td>
                    <td className="py-3 px-4 text-gray-600 text-xs font-mono">{d.address}</td>
                    <td className="py-3 px-4 font-medium text-gray-800">{d.nama}</td>
                    <td className="py-3 px-4 text-gray-600">{d.spesialisasi}</td>
                    <td className="py-3 px-4 text-gray-600">{d.nomorLisensi}</td>
                    <td className="py-3 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${d.aktif ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                        }`}>
                        {d.aktif ? "Aktif" : "Tidak Aktif"}
                      </span>
                    </td>
                    <td className="py-3 px-4 space-x-2">
                      <button
                        onClick={() => toggleStatusDokter(d.address, d.aktif)}
                        disabled={loading}
                        className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${d.aktif
                            ? "bg-red-500 hover:bg-red-600 text-white"
                            : "bg-green-500 hover:bg-green-600 text-white"
                          } disabled:opacity-50`}
                      >
                        {d.aktif ? "Nonaktifkan" : "Aktifkan"}
                      </button>
                      <button
                        onClick={() => handleOpenEditModal(d)}
                        disabled={loading}
                        className="px-3 py-1 rounded-md text-xs font-medium bg-yellow-500 hover:bg-yellow-600 text-white transition-all disabled:opacity-50"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Edit */}
      {isEditModalOpen && currentEditingDokter && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
              <span className="text-yellow-600 mr-2">✏️</span>
              Update Data Dokter
            </h3>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Alamat Wallet
                </label>
                <input
                  type="text"
                  value={currentEditingDokter.address}
                  disabled
                  className="w-full px-4 py-3 bg-gray-100 border-2 border-gray-200 rounded-lg text-gray-500"
                />
                <p className="text-xs text-gray-500 mt-1">Alamat wallet tidak dapat diubah</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  value={editNama}
                  onChange={(e) => setEditNama(e.target.value)}
                  disabled={loading}
                  className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all disabled:bg-gray-50"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Spesialisasi
                </label>
                <select
                  value={editSpesialisasi}
                  onChange={(e) => setEditSpesialisasi(e.target.value)}
                  disabled={loading}
                  className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all disabled:bg-gray-50"
                >
                  <option value="">Pilih Spesialisasi</option>
                  {spesialisasiOptions.map((spec) => (
                    <option key={spec} value={spec}>{spec}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nomor Lisensi
                </label>
                <input
                  type="text"
                  value={editNomorLisensi}
                  onChange={(e) => setEditNomorLisensi(e.target.value)}
                  disabled={loading}
                  className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all disabled:bg-gray-50"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleCloseEditModal}
                disabled={loading}
                className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-all disabled:opacity-50"
              >
                Batal
              </button>
              <button
                onClick={handleSaveChanges}
                disabled={loading}
                className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-all disabled:opacity-50"
              >
                {loading ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}