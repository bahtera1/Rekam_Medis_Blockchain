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
    <div className="form-section">
      <h3>Daftarkan Dokter Baru</h3>
      <input
        type="text"
        placeholder="Alamat Wallet Dokter"
        value={dokterAddress}
        onChange={(e) => setDokterAddress(e.target.value)}
        disabled={loading}
      />
      <input
        type="text"
        placeholder="Nama Dokter"
        value={dokterNama}
        onChange={(e) => setDokterNama(e.target.value)}
        disabled={loading}
      />
      <input
        type="text"
        placeholder="Spesialisasi Dokter"
        value={dokterSpesialisasi}
        onChange={(e) => setDokterSpesialisasi(e.target.value)}
        disabled={loading}
      />
      <input
        type="text"
        placeholder="Nomor Lisensi Dokter"
        value={dokterNomorLisensi}
        onChange={(e) => setDokterNomorLisensi(e.target.value)}
        disabled={loading}
      />
      <button onClick={registerDokter} disabled={loading}>
        {loading ? "Loading..." : "Daftarkan Dokter"}
      </button>

      <h3 style={{ marginTop: "2rem" }}>Daftar Dokter</h3>
      <p>Total dokter terdaftar: <strong>{dokterList.length}</strong></p>

      <input
        type="text"
        placeholder="Cari dokter..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ margin: "10px 0", width: "100%", padding: "5px" }}
      />

      {filteredDokter.length === 0 ? (
        <p>Belum ada dokter yang sesuai pencarian.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Alamat</th>
              <th>Nama</th>
              <th>Spesialisasi</th>
              <th>Nomor Lisensi</th>
              <th>Status Aktif</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredDokter.map((d) => (
              <tr key={d.address}>
                <td>{d.address}</td>
                <td>{d.nama}</td>
                <td>{d.spesialisasi}</td>
                <td>{d.nomorLisensi}</td>
                <td>{d.aktif ? "Aktif" : "Tidak Aktif"}</td>
                <td>
                  <button
                    onClick={() => toggleStatusDokter(d.address, d.aktif)}
                    disabled={loading}
                  >
                    {d.aktif ? "Nonaktifkan" : "Aktifkan"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
