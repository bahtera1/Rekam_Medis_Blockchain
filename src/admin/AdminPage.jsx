import React, { useState, useEffect } from "react";
import contract from "../contract";
import "./AdminPage.css";

export default function AdminPage({ account }) {
    const [dokterAddress, setDokterAddress] = useState("");
    const [dokterNama, setDokterNama] = useState("");
    const [dokterList, setDokterList] = useState([]);
    const [pasienAddress, setPasienAddress] = useState("");
    const [selectedDokter, setSelectedDokter] = useState("");
    const [loading, setLoading] = useState(false);
    const [listPasien, setListPasien] = useState([]);

    // Ambil daftar dokter
    const fetchDokterList = async () => {
        try {
            const total = await contract.methods.totalDokter().call();
            const list = [];
            for (let i = 0; i < total; i++) {
                const addr = await contract.methods.getDokterByIndex(i).call();
                const result = await contract.methods.getDokter(addr).call();
                list.push({
                    address: addr,
                    nama: result[0],  // nama
                    aktif: result[1], // aktif
                });
            }
            setDokterList(list);
        } catch (err) {
            console.error("Gagal ambil daftar dokter:", err);
            alert("Gagal ambil daftar dokter.");
        }
    };

    // Ambil daftar pasien
    const fetchPasienList = async () => {
        try {
            const pasienArray = await contract.methods.getDaftarPasien().call();
            setListPasien(pasienArray);
        } catch (err) {
            console.error("Gagal ambil daftar pasien:", err);
            alert("Gagal ambil daftar pasien.");
        }
    };

    useEffect(() => {
        fetchDokterList();
        fetchPasienList();
    }, []);

    // Daftarkan dokter baru
    const registerDokter = async () => {
        if (!dokterAddress || !dokterNama) {
            alert("Alamat dan nama dokter harus diisi.");
            return;
        }
        try {
            setLoading(true);
            await contract.methods
                .registerDokter(dokterAddress, dokterNama)
                .send({ from: account });
            alert("Dokter berhasil didaftarkan.");
            setDokterAddress("");
            setDokterNama("");
            fetchDokterList();
        } catch (err) {
            console.error("Gagal mendaftarkan dokter:", err);
            alert("Dokter gagal didaftarkan.");
        } finally {
            setLoading(false);
        }
    };

    // Daftarkan pasien baru
    const registerPasien = async () => {
        if (!pasienAddress) {
            alert("Alamat pasien harus diisi.");
            return;
        }
        try {
            setLoading(true);
            await contract.methods
                .registerPasien(pasienAddress)
                .send({ from: account });
            alert("Pasien berhasil didaftarkan.");
            setPasienAddress("");
            fetchPasienList();
        } catch (err) {
            console.error("Gagal mendaftarkan pasien:", err);
            alert("Pasien gagal didaftarkan.");
        } finally {
            setLoading(false);
        }
    };

    // Toggle status dokter aktif/nonaktif
    const toggleStatusDokter = async (address, currentStatus) => {
        try {
            setLoading(true);
            await contract.methods
                .setStatusDokter(address, !currentStatus)
                .send({ from: account });
            alert("Status dokter diperbarui.");
            fetchDokterList();
        } catch (err) {
            console.error("Gagal update status dokter:", err);
            alert("Gagal update status dokter.");
        } finally {
            setLoading(false);
        }
    };

    // Assign pasien ke dokter
    const assignPasien = async () => {
        if (!selectedDokter || !pasienAddress) {
            alert("Pilih dokter dan masukkan alamat pasien.");
            return;
        }
        try {
            setLoading(true);
            await contract.methods
                .assignPasienToDokter(selectedDokter, pasienAddress)
                .send({ from: account });
            alert("Pasien berhasil diassign ke dokter.");
            setPasienAddress("");
            setSelectedDokter("");
        } catch (err) {
            console.error("Gagal assign pasien:", err);
            alert("Gagal assign pasien.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-container">
            <h2>Admin Panel - Manajemen Dokter</h2>

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
            </div>

            <div className="list-section">
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
                                            onClick={() =>
                                                toggleStatusDokter(dokter.address, dokter.aktif)
                                            }
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
            </div>

            <div className="form-section">
                <h3>Assign Pasien ke Dokter</h3>
                <select
                    value={selectedDokter}
                    onChange={(e) => setSelectedDokter(e.target.value)}
                    disabled={loading}
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
                    style={{ width: "300px", marginTop: "8px" }}
                    disabled={loading}
                >
                    <option value="">Pilih Pasien</option>
                    {listPasien.map((pasien) => (
                        <option key={pasien} value={pasien}>
                            {pasien}
                        </option>
                    ))}
                </select>
            </div>

            <div className="list-section">
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
        </div>
    );
}
