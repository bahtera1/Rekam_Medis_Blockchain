import React, { useState } from "react";

export default function ManagePasienPage({
  pasienAddress,
  setPasienAddress,
  pasienNama,
  setPasienNama,
  registerPasien,
  loading,
  listPasien,
}) {
  const [searchPasien, setSearchPasien] = useState("");

  const filteredPasien = listPasien.filter((p) => {
    const q = searchPasien.toLowerCase();
    return (
      (p.nama && p.nama.toLowerCase().includes(q)) ||
      p.address.toLowerCase().includes(q)
    );
  });

  return (
    <div>
      <h3>Daftarkan Pasien Baru</h3>
      <input
        type="text"
        placeholder="Alamat Wallet Pasien"
        value={pasienAddress}
        onChange={(e) => setPasienAddress(e.target.value)}
        disabled={loading}
      />
      <input
        type="text"
        placeholder="Nama Pasien"
        value={pasienNama}
        onChange={(e) => setPasienNama(e.target.value)}
        disabled={loading}
      />
      <button onClick={registerPasien} disabled={loading}>
        {loading ? "Loading..." : "Daftarkan Pasien"}
      </button>

      <h3>Daftar Pasien Terdaftar</h3>
      <input
        type="text"
        placeholder="Cari pasien..."
        value={searchPasien}
        onChange={(e) => setSearchPasien(e.target.value)}
        style={{ margin: "10px 0", width: "100%", padding: "8px" }}
      />

      {filteredPasien.length === 0 ? (
        <p>Pasien tidak ditemukan.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }} border="1">
          <thead style={{ background: "#3182ce", color: "white" }}>
            <tr>
              <th>No.</th>
              <th>Nama Pasien</th>
              <th>Alamat Wallet</th>
            </tr>
          </thead>
          <tbody>
            {filteredPasien.map((p, idx) => (
              <tr key={p.address}>
                <td style={{ textAlign: "center" }}>{idx + 1}</td>
                <td>{p.nama || "-"}</td>
                <td>{p.address}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
