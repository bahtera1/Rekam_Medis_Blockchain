import React, { useState, useEffect } from "react";

export default function ManageDokterPage({
  dokterList,
  dokterAddress, // Untuk form pendaftaran
  dokterNama, // Untuk form pendaftaran
  dokterSpesialisasi, // Untuk form pendaftaran
  dokterNomorLisensi, // Untuk form pendaftaran
  loading,
  setDokterAddress,
  setDokterNama,
  setDokterSpesialisasi,
  setDokterNomorLisensi,
  registerDokter,
  toggleStatusDokter,
  updateDokterInfo, // PROPS BARU untuk fungsi update
}) {
  const [search, setSearch] = useState("");

  // State untuk modal edit
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentEditingDokter, setCurrentEditingDokter] = useState(null);
  const [editNama, setEditNama] = useState("");
  const [editSpesialisasi, setEditSpesialisasi] = useState("");
  const [editNomorLisensi, setEditNomorLisensi] = useState("");

  const spesialisasiOptions = [
    "Umum",
    "Anak",
    "Penyakit Dalam",
    "Bedah",
    "Gigi",
    "Kulit dan Kelamin",
  ];

  const filteredDokter = dokterList.filter((d) => {
    const q = search.toLowerCase();
    const nama = d.nama || "";
    const address = d.address || "";
    const spesialisasi = d.spesialisasi || "";
    const nomorLisensi = d.nomorLisensi || "";

    return (
      nama.toLowerCase().includes(q) ||
      address.toLowerCase().includes(q) ||
      spesialisasi.toLowerCase().includes(q) ||
      nomorLisensi.toLowerCase().includes(q)
    );
  });

  const commonInputClass =
    "w-full border border-gray-300 rounded-md px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition duration-150 ease-in-out disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed";
  const helperTextClass = "text-xs text-gray-500 mt-1 ml-1";

  // Handler untuk membuka modal edit
  const handleOpenEditModal = (dokter) => {
    setCurrentEditingDokter(dokter);
    setEditNama(dokter.nama);
    setEditSpesialisasi(dokter.spesialisasi);
    setEditNomorLisensi(dokter.nomorLisensi);
    setIsEditModalOpen(true);
  };

  // Handler untuk menutup modal edit
  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setCurrentEditingDokter(null);
  };

  // Handler untuk menyimpan perubahan
  const handleSaveChanges = async () => {
    if (!currentEditingDokter) return;
    try {
      await updateDokterInfo(
        currentEditingDokter.address,
        editNama,
        editSpesialisasi,
        editNomorLisensi
      );
      handleCloseEditModal(); // Tutup modal setelah sukses
    } catch (error) {
      console.error("Gagal update dokter:", error);
      // Handle error (misalnya tampilkan notifikasi)
    }
  };

  useEffect(() => {
    if (!loading && !dokterAddress && !dokterNama && !dokterSpesialisasi && !dokterNomorLisensi) {
      // Logika reset field pendaftaran bisa disempurnakan di sini jika perlu
    }
  }, [loading, dokterAddress, dokterNama, dokterSpesialisasi, dokterNomorLisensi]);


  return (
    <div className="w-full">
      <div className="mx-auto">
        {/* Bagian Pendaftaran Dokter Baru */}
        <div className="bg-white rounded-xl shadow-xl p-6 sm:p-8 mb-8">
          <h3 className="text-2xl font-semibold text-slate-800 mb-6 border-b pb-3">
            Daftarkan Dokter Baru
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5 mb-6">
            <div>
              <label htmlFor="dokterAddress" className="block text-sm font-medium text-gray-700 mb-1">Alamat Wallet Dokter</label>
              <input
                id="dokterAddress"
                type="text"
                placeholder="Contoh: 0x123Abc..."
                value={dokterAddress}
                onChange={(e) => setDokterAddress(e.target.value)}
                disabled={loading}
                className={commonInputClass}
              />
              <p className={helperTextClass}>Alamat wallet unik dokter pada sistem blockchain.</p>
            </div>
            <div>
              <label htmlFor="dokterNama" className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap Dokter</label>
              <input
                id="dokterNama"
                type="text"
                placeholder="Masukkan nama lengkap dokter"
                value={dokterNama}
                onChange={(e) => setDokterNama(e.target.value)}
                disabled={loading}
                className={commonInputClass}
              />
              <p className={helperTextClass}>Sertakan gelar.</p>
            </div>
            <div>
              <label htmlFor="dokterSpesialisasi" className="block text-sm font-medium text-gray-700 mb-1">Spesialisasi Dokter</label>
              <select
                id="dokterSpesialisasi"
                value={dokterSpesialisasi}
                onChange={(e) => setDokterSpesialisasi(e.target.value)}
                disabled={loading}
                className={commonInputClass}
              >
                <option value="" disabled>Pilih Spesialisasi</option>
                {spesialisasiOptions.map((spesialisasi) => (
                  <option key={spesialisasi} value={spesialisasi}>
                    {spesialisasi}
                  </option>
                ))}
              </select>
              <p className={helperTextClass}>Pilih spesialisasi utama dokter.</p>
            </div>
            <div>
              <label htmlFor="dokterNomorLisensi" className="block text-sm font-medium text-gray-700 mb-1">Nomor Lisensi Dokter</label>
              <input
                id="dokterNomorLisensi"
                type="text"
                placeholder="Contoh: SIP-12345/2025"
                value={dokterNomorLisensi}
                onChange={(e) => setDokterNomorLisensi(e.target.value)}
                disabled={loading}
                className={commonInputClass}
              />
              <p className={helperTextClass}>
                Masukkan nomor lisensi resmi.
              </p>
            </div>
          </div>
          <button
            onClick={registerDokter}
            disabled={loading}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-8 py-2.5 rounded-lg font-semibold transition duration-150 ease-in-out disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Menyimpan..." : "Daftarkan Dokter"}
          </button>
        </div>

        {/* Bagian Daftar Dokter */}
        <div className="bg-white rounded-xl shadow-xl p-6 sm:p-8">
          <h3 className="text-2xl font-semibold text-slate-800 mb-2">
            Daftar Dokter
          </h3>
          <p className="text-sm text-gray-600 mb-5">
            Total dokter terdaftar:{" "}
            <strong className="font-medium">{dokterList.length}</strong>
          </p>

          <div className="relative my-4">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="h-5 w-5 text-gray-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Cari berdasarkan nama, alamat wallet, spesialisasi, atau nomor lisensi..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`w-full pl-10 pr-4 ${commonInputClass}`}
            />
          </div>


          {filteredDokter.length === 0 && search ? (
            <p className="italic text-gray-500 text-center py-4">
              Tidak ada dokter yang cocok dengan pencarian Anda.
            </p>
          ) : filteredDokter.length === 0 && !search ? (
            <p className="italic text-gray-500 text-center py-4">
              Belum ada dokter yang terdaftar.
            </p>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-slate-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">No.</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Alamat Wallet</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Nama</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Spesialisasi</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Nomor Lisensi</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Aksi</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredDokter.map((d, index) => (
                    <tr key={d.address} className="hover:bg-slate-50 transition-colors duration-150">
                      <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">{index + 1}</td>
                      {/* Perubahan di sini: Menghapus div dengan class w-32 dan truncate */}
                      <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap break-all">
                        {d.address}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 font-medium whitespace-nowrap">{d.nama}</td>
                      <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">{d.spesialisasi}</td>
                      <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">{d.nomorLisensi}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className={`px-2.5 py-1 text-xs font-semibold rounded-full ${d.aktif
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                            }`}
                        >
                          {d.aktif ? "Aktif" : "Tidak Aktif"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm whitespace-nowrap space-x-2">
                        <button
                          onClick={() => toggleStatusDokter(d.address, d.aktif)}
                          disabled={loading}
                          className={`px-3 py-1.5 rounded-md font-medium text-xs ${d.aktif
                            ? "bg-red-500 hover:bg-red-600 text-white"
                            : "bg-green-500 hover:bg-green-600 text-white"
                            } transition duration-150 ease-in-out disabled:opacity-60 disabled:cursor-not-allowed`}
                        >
                          {loading ? "..." : (d.aktif ? "Nonaktifkan" : "Aktifkan")}
                        </button>
                        <button
                          onClick={() => handleOpenEditModal(d)}
                          disabled={loading}
                          className="px-3 py-1.5 rounded-md font-medium text-xs bg-yellow-500 hover:bg-yellow-600 text-white transition duration-150 ease-in-out disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          Update
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal Edit Dokter */}
      {isEditModalOpen && currentEditingDokter && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex justify-center items-center">
          <div className="bg-white p-6 sm:p-8 rounded-xl shadow-xl w-full max-w-lg mx-4">
            <h3 className="text-xl font-semibold text-slate-800 mb-6 border-b pb-3">
              Update Data Dokter
            </h3>
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Alamat Wallet Dokter</label>
                <input
                  type="text"
                  value={currentEditingDokter.address}
                  disabled
                  className={`${commonInputClass} bg-slate-100`}
                />
                <p className={helperTextClass}>Alamat wallet tidak dapat diubah.</p>
              </div>
              <div>
                <label htmlFor="editDokterNama" className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap Dokter</label>
                <input
                  id="editDokterNama"
                  type="text"
                  value={editNama}
                  onChange={(e) => setEditNama(e.target.value)}
                  disabled={loading}
                  className={commonInputClass}
                  placeholder="Masukkan nama lengkap dokter"
                />
                <p className={helperTextClass}>Sertakan gelar.</p>
              </div>
              <div>
                <label htmlFor="editDokterSpesialisasi" className="block text-sm font-medium text-gray-700 mb-1">Spesialisasi Dokter</label>
                <select
                  id="editDokterSpesialisasi"
                  value={editSpesialisasi}
                  onChange={(e) => setEditSpesialisasi(e.target.value)}
                  disabled={loading}
                  className={commonInputClass}
                >
                  <option value="" disabled>Pilih Spesialisasi</option>
                  {spesialisasiOptions.map((spesialisasi) => (
                    <option key={spesialisasi} value={spesialisasi}>
                      {spesialisasi}
                    </option>
                  ))}
                </select>
                <p className={helperTextClass}>Pilih spesialisasi utama dokter.</p>
              </div>
              <div>
                <label htmlFor="editDokterNomorLisensi" className="block text-sm font-medium text-gray-700 mb-1">Nomor Lisensi Dokter</label>
                <input
                  id="editDokterNomorLisensi"
                  type="text"
                  value={editNomorLisensi}
                  onChange={(e) => setEditNomorLisensi(e.target.value)}
                  disabled={loading}
                  className={commonInputClass}
                  placeholder="Contoh: SIP-12345/2025"
                />
                <p className={helperTextClass}>Masukkan nomor lisensi resmi.</p>
              </div>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleCloseEditModal}
                disabled={loading}
                className="px-6 py-2.5 rounded-lg border border-gray-300 hover:bg-gray-100 text-gray-700 font-medium transition duration-150 ease-in-out disabled:opacity-60"
              >
                Batal
              </button>
              <button
                onClick={handleSaveChanges}
                disabled={loading}
                className="px-6 py-2.5 rounded-lg bg-green-600 hover:bg-green-700 text-white font-medium transition duration-150 ease-in-out disabled:opacity-60"
              >
                {loading ? "Menyimpan..." : "Simpan Perubahan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}