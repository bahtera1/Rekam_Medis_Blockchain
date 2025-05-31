import React, { useState } from "react";

// Komponen untuk ikon search (menggunakan path dari Heroicons sebagai contoh)
const SearchIcon = () => (
  <svg
    className="w-5 h-5 text-slate-400"
    aria-hidden="true"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 20 20"
  >
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
    />
  </svg>
);

// Komponen untuk spinner sederhana
const Spinner = () => (
  <svg
    className="animate-spin h-5 w-5 text-blue-600"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    ></circle>
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    ></path>
  </svg>
);

export default function ManagePasienPage({
  loading,
  listPasien, // [{ address, nama }, …]
}) {
  const [q, setQ] = useState("");
  console.log("Prop listPasien yang diterima:", listPasien); // <--- TAMBAHKAN INI
  console.log("Prop loading yang diterima:", loading); // <--- Tambahkan ini juga untuk konteks
  // Pastikan listPasien adalah array sebelum melakukan filter untuk menghindari error runtime
  const safeListPasien = Array.isArray(listPasien) ? listPasien : [];

  const filtered = safeListPasien.filter(p => {
    // Pastikan p (objek pasien) dan propertinya ada sebelum diakses
    const nameLower = p?.nama?.toLowerCase() || "";
    // Pastikan p.address ada dan merupakan string sebelum toLowerCase
    const addressLower = (typeof p?.address === 'string' ? p.address.toLowerCase() : "");
    const queryLower = q.toLowerCase();
    return nameLower.includes(queryLower) || addressLower.includes(queryLower);
  });

  return (
    // Kontainer utama halaman - max-w-7xl dihilangkan untuk memperbesar card
    <div className="bg-slate-50 p-6 sm:p-8 rounded-xl sm:rounded-2xl shadow-xl w-full mx-auto my-8"> {/* max-w-7xl dihilangkan dari sini */}
      {/* Judul Halaman */}
      <h3 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-slate-700">
        Daftar Pasien Terdaftar
      </h3>

      {/* Kotak Pencarian */}
      <div className="relative mb-6 sm:mb-8">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <SearchIcon />
        </span>
        <input
          type="search" // Menggunakan type="search" untuk input pencarian
          placeholder="Cari berdasarkan nama atau alamat wallet..."
          value={q}
          onChange={e => setQ(e.target.value)}
          disabled={loading} // Nonaktifkan input saat loading
          className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-300 shadow-sm 
                     bg-white text-slate-800 placeholder:text-slate-400 
                     focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none
                     transition duration-150 ease-in-out text-sm sm:text-base"
        />
      </div>

      {/* Kontainer Tabel */}
      <div className="rounded-lg sm:rounded-xl shadow-lg overflow-hidden bg-white">
        {/* Wrapper untuk scroll horizontal pada tabel di layar kecil */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-sm">
            <colgroup>
              <col style={{ width: '60px' }} /> {/* Kolom Nomor */}
              <col style={{ width: '30%' }} />  {/* Kolom Nama */}
              <col style={{ minWidth: '400px' }} /> {/* Kolom Alamat Wallet */}
            </colgroup>
            {/* Header Tabel */}
            <thead className="bg-blue-600 text-white">
              <tr>
                <th className="py-3.5 px-4 font-semibold text-center">No.</th>
                <th className="py-3.5 px-4 font-semibold text-left">Nama</th>
                <th className="py-3.5 px-4 font-semibold text-left">Alamat Wallet</th>
              </tr>
            </thead>
            {/* Body Tabel */}
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                // State Loading
                <tr>
                  <td colSpan={3} className="py-10 px-4 text-center text-slate-500">
                    <div className="flex justify-center items-center space-x-2">
                      <Spinner />
                      <span>Memuat data pasien...</span>
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                // State Tidak Ada Data (baik karena filter atau memang kosong)
                <tr>
                  <td colSpan={3} className="py-8 px-4 text-center text-slate-500">
                    {q ? "Tidak ada pasien yang cocok dengan pencarian Anda." : "Belum ada pasien terdaftar."}
                  </td>
                </tr>
              ) : (
                // Menampilkan data pasien yang sudah difilter
                filtered.map((p, i) => (
                  <tr
                    key={p?.address || `pasien-${i}`} // Fallback key jika address tidak ada
                    className="hover:bg-blue-50 transition-colors duration-150 ease-in-out"
                  >
                    <td className="py-3.5 px-4 text-center text-slate-600">{i + 1}</td>
                    <td className="py-3.5 px-4 text-left text-slate-800 font-medium">{p?.nama || "-"}</td>
                    <td className="py-3.5 px-4 text-left text-slate-600 font-mono text-xs break-all">
                      {p?.address || "Alamat tidak tersedia"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pesan tambahan jika tidak ada hasil pencarian namun ada data asli */}
      {!loading && safeListPasien.length > 0 && filtered.length === 0 && q && (
        <p className="text-center text-slate-500 mt-6 text-sm">
          Tidak ditemukan pasien dengan kata kunci "<span className="font-semibold">{q}</span>". Silakan coba kata kunci lain.
        </p>
      )}
      {/* Pesan tambahan jika memang tidak ada data sama sekali dari awal */}
      {!loading && safeListPasien.length === 0 && !q && (
        <p className="text-center text-slate-500 mt-6 text-sm">
          Saat ini belum ada data pasien yang terdaftar di sistem.
        </p>
      )}
    </div>
  );
}