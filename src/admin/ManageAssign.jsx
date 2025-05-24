import React, { useState } from "react";

export default function ManageAssign({
    dokterList,
    listPasien,
    selectedDokter,
    setSelectedDokter,
    pasienAddress,
    setPasienAddress,
    assignPasien,
    loading,
    assignedPairs,
}) {
    // Simpan index dokter yang sedang expanded
    const [openIndex, setOpenIndex] = useState(null);

    return (
        <div>
            <h3>Assign Pasien ke Dokter</h3>
            <select
                value={selectedDokter}
                onChange={(e) => setSelectedDokter(e.target.value)}
                disabled={loading}
                style={{ width: "100%", marginBottom: 10, padding: 7 }}
            >
                <option value="">Pilih Dokter</option>
                {dokterList.map((dokter) => (
                    <option key={dokter.address} value={dokter.address}>
                        {dokter.nama} ({dokter.address})
                    </option>
                ))}
            </select>

            <select
                value={pasienAddress}
                onChange={(e) => setPasienAddress(e.target.value)}
                disabled={loading}
                style={{ width: "100%", marginBottom: 10, padding: 7 }}
            >
                <option value="">Pilih Pasien</option>
                {listPasien.map((pasien) => (
                    <option key={pasien.address} value={pasien.address}>
                        {pasien.nama || pasien.address}
                    </option>
                ))}
            </select>

            <button onClick={assignPasien} disabled={loading} style={{ marginBottom: 25 }}>
                {loading ? "Loading..." : "Assign Pasien"}
            </button>

            <div className="list-section" style={{ marginTop: "30px" }}>
                <h3>Daftar Pasangan Dokter - Pasien</h3>
                {(!assignedPairs || assignedPairs.length === 0) ? (
                    <p>Belum ada pasangan dokter dan pasien yang diassign.</p>
                ) : (
                    <table border="1" cellPadding="7" style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead style={{ background: "#3182ce", color: "#fff" }}>
                            <tr>
                                <th>No.</th>
                                <th>Nama Dokter</th>
                                <th>No. Lisensi</th>
                                <th>Alamat Dokter</th>
                                <th>Daftar Pasien</th>
                            </tr>
                        </thead>
                        <tbody>
                            {assignedPairs.map((pair, idx) => (
                                <React.Fragment key={idx}>
                                    <tr>
                                        <td style={{ textAlign: "center" }}>{idx + 1}</td>
                                        <td>{pair.dokterNama}</td>
                                        <td>{pair.dokterLisensi}</td>
                                        <td style={{ fontSize: 12 }}>{pair.dokterAddress}</td>
                                        <td>
                                            <button
                                                onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                                                style={{
                                                    background: "#3182ce",
                                                    color: "#fff",
                                                    border: "none",
                                                    padding: "4px 10px",
                                                    borderRadius: "4px",
                                                    cursor: "pointer",
                                                }}
                                            >
                                                {openIndex === idx
                                                    ? "Sembunyikan Pasien"
                                                    : `Tampilkan Pasien (${pair.pasienList.length})`}
                                            </button>
                                        </td>
                                    </tr>
                                    {openIndex === idx && (
                                        <tr>
                                            <td colSpan={5}>
                                                <div style={{ background: "#f8f9fa", padding: 10, borderRadius: 6 }}>
                                                    <table style={{ width: "100%" }}>
                                                        <thead>
                                                            <tr style={{ background: "#3182ce", color: "#fff" }}>
                                                                <th>No.</th>
                                                                <th>Nama</th>
                                                                <th>Alamat Wallet</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {pair.pasienList.map((p, i) => (
                                                                <tr key={p.address}>
                                                                    <td style={{ textAlign: "center" }}>{i + 1}</td>
                                                                    <td>{p.nama}</td>
                                                                    <td style={{ fontSize: 12 }}>{p.address}</td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
