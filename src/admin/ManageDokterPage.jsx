import React, { useState } from "react";

export default function ManageDokterPage({
    dokterList,
    dokterAddress,
    dokterNama,
    loading,
    setDokterAddress,
    setDokterNama,
    registerDokter,
    toggleStatusDokter,
}) {
    const [search, setSearch] = useState("");

    // Filter dokter sesuai pencarian (nama atau alamat)
    const filteredDokter = dokterList.filter((dokter) => {
        const searchLower = search.toLowerCase();
        return (
            (dokter.nama && dokter.nama.toLowerCase().includes(searchLower)) ||
            (dokter.address && dokter.address.toLowerCase().includes(searchLower))
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
            <button onClick={registerDokter} disabled={loading}>
                {loading ? "Loading..." : "Daftarkan Dokter"}
            </button>

            <h3>Daftar Dokter</h3>
            <input
                type="text"
                placeholder="Cari dokter..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ marginBottom: "10px", width: "100%", padding: "5px" }}
            />
            {filteredDokter.length === 0 ? (
                <p>Belum ada dokter yang sesuai pencarian.</p>
            ) : (
                <table>
                    <thead>
                        <tr>
                            <th>Alamat</th>
                            <th>Nama</th>
                            <th>Status Aktif</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredDokter.map((dokter) => (
                            <tr key={dokter.address}>
                                <td>{dokter.address}</td>
                                <td>{dokter.nama}</td>
                                <td>{dokter.aktif ? "Aktif" : "Tidak Aktif"}</td>
                                <td>
                                    <button
                                        onClick={() => toggleStatusDokter(dokter.address, dokter.aktif)}
                                        disabled={loading}
                                    >
                                        {dokter.aktif ? "Nonaktifkan" : "Aktifkan"}
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
