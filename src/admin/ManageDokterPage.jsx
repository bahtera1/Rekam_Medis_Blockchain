import React from "react";

export default function ManageDokterPage({ dokterList, dokterAddress, dokterNama, loading, setDokterAddress, setDokterNama, registerDokter, toggleStatusDokter }) {
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
            {dokterList.length === 0 ? (
                <p>Belum ada dokter terdaftar.</p>
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
                        {dokterList.map((dokter) => (
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
