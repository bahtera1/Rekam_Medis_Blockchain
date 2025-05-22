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
    <div>
      <h3>Daftar Pasien Terdaftar</h3>
      <input
        type="text"
        placeholder="Cari pasien..."
        value={q}
        onChange={e => setQ(e.target.value)}
        disabled={loading}
        style={{ width: "100%", padding: "6px", marginBottom: "10px" }}
      />
      {filtered.length === 0 ? (
        <p>Tidak ada pasien.</p>
      ) : (
        <table border="1" cellPadding="5" style={{ width: "100%" }}>
          <thead style={{ background: "#3182ce", color: "#fff" }}>
            <tr>
              <th>No.</th>
              <th>Nama</th>
              <th>Alamat Wallet</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p, i) => (
              <tr key={p.address}>
                <td style={{ textAlign: "center" }}>{i + 1}</td>
                <td>{p.nama}</td>
                <td>{p.address}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
