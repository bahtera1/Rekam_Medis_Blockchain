import React from "react";

export default function ManagePasienPage({ pasienAddress, setPasienAddress, registerPasien, loading, listPasien }) {
    return (
        <div className="form-section">
            <h3>Daftarkan Pasien Baru</h3>
            <input
                type="text"
                placeholder="Alamat Wallet Pasien"
                value={pasienAddress}
                onChange={(e) => setPasienAddress(e.target.value)}
                disabled={loading}
            />
            <button onClick={registerPasien} disabled={loading}>
                {loading ? "Loading..." : "Daftarkan Pasien"}
            </button>

            <h3>Daftar Pasien Terdaftar</h3>
            {listPasien.length === 0 ? (
                <p>Belum ada pasien terdaftar.</p>
            ) : (
                <ul>
                    {listPasien.map((pasien) => (
                        <li key={pasien}>{pasien}</li>
                    ))}
                </ul>
            )}
        </div>
    );
}
