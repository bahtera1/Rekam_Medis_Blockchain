import React, { useState } from "react";

export default function ManagePasienPage({
    pasienAddress,
    setPasienAddress,
    pasienNama,
    setPasienNama,
    registerPasien,
    loading,
    listPasien, // array objek { address, nama }
}) {
    const [searchPasien, setSearchPasien] = useState("");

    // Filter pasien berdasar nama atau alamat wallet
    const filteredPasienList = listPasien.filter((pasien) => {
        const nama = pasien.nama ? pasien.nama.toLowerCase() : "";
        const alamat = pasien.address ? pasien.address.toLowerCase() : "";
        const keyword = searchPasien.toLowerCase();

        return nama.includes(keyword) || alamat.includes(keyword);
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
                placeholder="Cari pasien berdasarkan nama atau alamat"
                value={searchPasien}
                onChange={(e) => setSearchPasien(e.target.value)}
                style={{ marginBottom: "10px", width: "100%", padding: "8px", borderRadius: "5px", border: "1px solid #ccc" }}
            />

            {filteredPasienList.length === 0 ? (
                <p>Pasien tidak ditemukan.</p>
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
                        {filteredPasienList.map(({ address, nama }, index) => (
                            <tr key={address}>
                                <td>{index + 1}</td>
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
