import React from "react";

export default function ManagePasienPage({
    pasienAddress,
    setPasienAddress,
    pasienNama,
    setPasienNama,
    registerPasien,
    loading,
    listPasien, // array objek { address, nama }
}) {
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
            {listPasien.length === 0 ? (
                <p>Belum ada pasien terdaftar.</p>
            ) : (
                <table border="1" cellPadding="5" cellSpacing="0" style={{ width: "100%", marginTop: "10px" }}>
                    <thead style={{ backgroundColor: "#3182ce", color: "white" }}>
                        <tr>
                            <th>No.</th>
                            <th>Nama Pasien</th>
                            <th>Alamat Wallet</th>
                        </tr>
                    </thead>
                    <tbody>
                        {listPasien.map(({ address, nama }, index) => (
                            <tr key={address}>
                                <td>{index + 1}</td> {/* Nomor urut */}
                                <td>{nama || "-"}</td>
                                <td>{address}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}
