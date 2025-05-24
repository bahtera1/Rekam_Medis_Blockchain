import React, { useState } from "react";

export default function ManagePasienPage({
  loading,
  listPasien,    // [{ address, nama }, …]
}) {
  const [q, setQ] = useState("");

  const filtered = listPasien.filter(p => {
    const l = p.nama?.toLowerCase() || "";
    const a = p.address.toLowerCase();
    return l.includes(q.toLowerCase()) || a.includes(q.toLowerCase());
  });

  return (
    <div className="bg-[#f8fbff] p-8 rounded-2xl shadow-md w-full">
      <h3 className="text-2xl font-bold mb-6 text-blue-800">Daftar Pasien Terdaftar</h3>

      {/* Search Box with icon */}
      <div className="relative mb-6">
        <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none transform translate-x-1">
          {/* Icon cari dengan ukuran yang disesuaikan */}
          <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" fill="none" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" stroke="currentColor" strokeWidth="2" />
          </svg>
        </span>
        <input
          type="text"
          placeholder="Cari pasien..."
          value={q}
          onChange={e => setQ(e.target.value)}
          disabled={loading}
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-blue-100 shadow-sm bg-white text-gray-800 placeholder:text-blue-400 focus:ring-2 focus:ring-blue-300 focus:outline-none"
        />
      </div>



      <div className="rounded-xl overflow-hidden shadow w-full">
        <table className="w-full table-fixed text-center border-separate border-spacing-0">
          <colgroup>
            <col style={{ width: '60px' }} />
            <col style={{ width: '220px' }} />
            <col />
          </colgroup>
          <thead>
            <tr className="bg-[#2351e2] text-white text-base">
              <th className="py-3 px-4 font-bold">No.</th>
              <th className="py-3 px-4 font-bold">Nama</th>
              <th className="py-3 px-4 font-bold">Alamat Wallet</th>
            </tr>
          </thead>
          <tbody className="bg-white text-gray-700">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={3} className="py-6 text-gray-400">Tidak ada pasien.</td>
              </tr>
            ) : (
              filtered.map((p, i) => (
                <tr key={p.address} className="hover:bg-blue-50 transition">
                  <td className="py-3 px-4">{i + 1}</td>
                  <td className="py-3 px-4">{p.nama}</td>
                  <td className="py-3 px-4 font-mono text-xs break-all">{p.address}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
