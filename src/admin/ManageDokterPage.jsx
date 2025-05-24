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
}) {
  const [search, setSearch] = useState("");

  const filteredDokter = dokterList.filter((d) => {
    const q = search.toLowerCase();
    return (
      d.nama.toLowerCase().includes(q) ||
      d.address.toLowerCase().includes(q) ||
      d.spesialisasi.toLowerCase().includes(q) ||
      d.nomorLisensi.toLowerCase().includes(q)
    );
  });

  return (
    <div className="bg-slate-50 rounded-xl shadow-lg p-6">
      <h3 className="text-xl font-bold text-blue-800 mb-4">Daftarkan Dokter Baru</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-2">
        <input
          type="text"
          placeholder="Alamat Wallet Dokter"
          value={dokterAddress}
          onChange={(e) => setDokterAddress(e.target.value)}
          disabled={loading}
          className="border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="text"
          placeholder="Nama Dokter"
          value={dokterNama}
          onChange={(e) => setDokterNama(e.target.value)}
          disabled={loading}
          className="border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="text"
          placeholder="Spesialisasi Dokter"
          value={dokterSpesialisasi}
          onChange={(e) => setDokterSpesialisasi(e.target.value)}
          disabled={loading}
          className="border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="text"
          placeholder="Nomor Lisensi Dokter"
          value={dokterNomorLisensi}
          onChange={(e) => setDokterNomorLisensi(e.target.value)}
          disabled={loading}
          className="border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <button
        onClick={registerDokter}
        disabled={loading}
        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold mb-6 transition"
      >
        {loading ? "Loading..." : "Daftarkan Dokter"}
      </button>

      <h3 className="mt-10 text-lg font-bold text-blue-800 mb-2">Daftar Dokter</h3>
      <p>Total dokter terdaftar: <strong>{dokterList.length}</strong></p>

      <input
        type="text"
        placeholder="Cari dokter..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="my-2 w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
      />

      {filteredDokter.length === 0 ? (
        <p className="italic text-gray-500">Belum ada dokter yang sesuai pencarian.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-300 bg-white rounded-lg shadow mt-2">
            <thead className="bg-blue-700 text-white">
              <tr>
                <th className="px-3 py-2">Alamat</th>
                <th className="px-3 py-2">Nama</th>
                <th className="px-3 py-2">Spesialisasi</th>
                <th className="px-3 py-2">Nomor Lisensi</th>
                <th className="px-3 py-2">Status Aktif</th>
                <th className="px-3 py-2">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredDokter.map((d) => (
                <tr key={d.address} className="hover:bg-blue-50">
                  <td className="px-3 py-2 text-xs">{d.address}</td>
                  <td className="px-3 py-2">{d.nama}</td>
                  <td className="px-3 py-2">{d.spesialisasi}</td>
                  <td className="px-3 py-2">{d.nomorLisensi}</td>
                  <td className="px-3 py-2">
                    <span className={`px-2 py-1 rounded ${d.aktif ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
                      {d.aktif ? "Aktif" : "Tidak Aktif"}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <button
                      onClick={() => toggleStatusDokter(d.address, d.aktif)}
                      disabled={loading}
                      className={`px-3 py-1 rounded-lg font-bold ${d.aktif
                        ? "bg-red-600 hover:bg-red-700 text-white"
                        : "bg-green-600 hover:bg-green-700 text-white"
                        } transition`}
                    >
                      {d.aktif ? "Nonaktifkan" : "Aktifkan"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
