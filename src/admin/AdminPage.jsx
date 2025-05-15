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

    // Fungsi ambil daftar dokter
    const fetchDokterList = async () => {
        try {
            const total = await contract.methods.totalDokter().call();
            const list = [];
            for (let i = 0; i < total; i++) {
                const addr = await contract.methods.getDokterByIndex(i).call();
                const result = await contract.methods.getDokter(addr).call();
                list.push({
                    address: addr,
                    nama: result.nama,
                    aktif: result.aktif,
                });
            }
            console.log("Dokter List:", list); // Tambahkan log untuk memeriksa data
            setDokterList(list);
        } catch (err) {
            console.error("Gagal ambil daftar dokter:", err);
            alert("Gagal ambil daftar dokter.");
        }
    };



    // Panggil sekali saat komponen mount
    useEffect(() => {
        fetchDokterList();
    }, []);

    // Daftarkan dokter baru dengan loading dan error handling
    const registerDokter = async () => {
        if (!dokterAddress || !dokterNama) {
            alert("Alamat dan nama dokter harus diisi.");
            return;
        }

        try {
            setLoading(true);
            await contract.methods
                .registerDokter(dokterAddress, dokterNama)
                .send({ from: account })
                .on("transactionHash", (hash) => {
                    console.log("Transaction hash:", hash);
                    // Bisa tampilkan spinner atau progress di UI
                })
                .on("receipt", (receipt) => {
                    console.log("Transaction receipt:", receipt);
                    alert("Dokter berhasil didaftarkan.");
                    fetchDokterList(); // refresh daftar dokter setelah sukses
                    setDokterAddress("");
                    setDokterNama("");
                });
        } catch (err) {
            console.error("Gagal mendaftarkan dokter:", err);
            alert("Dokter gagal didaftarkan.");
        } finally {
            setLoading(false);
        }
    };

    // Toggle status aktif/nonaktif dokter
    const toggleStatusDokter = async (address, currentStatus) => {
        try {
            setLoading(true);
            await contract.methods
                .setStatusDokter(address, !currentStatus)
                .send({ from: account });
            alert("Status dokter diperbarui.");
            fetchDokterList();
        } catch (err) {
            console.error(err);
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
            console.error(err);
            alert("Gagal assign pasien.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h2>Admin Panel - Manajemen Dokter</h2>

            <div style={{ marginBottom: "20px" }}>
                <h3>Daftarkan Dokter Baru</h3>
                <input
                    type="text"
                    placeholder="Alamat Wallet Dokter"
                    value={dokterAddress}
                    onChange={(e) => setDokterAddress(e.target.value)}
                    style={{ width: "300px" }}
                    disabled={loading}
                />
                <br />
                <input
                    type="text"
                    placeholder="Nama Dokter"
                    value={dokterNama}
                    onChange={(e) => setDokterNama(e.target.value)}
                    style={{ width: "300px", marginTop: "8px" }}
                    disabled={loading}
                />
                <br />
                <button
                    onClick={registerDokter}
                    style={{ marginTop: "8px" }}
                    disabled={loading}
                >
                    {loading ? "Loading..." : "Daftarkan Dokter"}
                </button>
            </div>

            <div style={{ marginBottom: "20px" }}>
                <h3>Daftar Dokter</h3>
                {dokterList.length === 0 ? (
                    <p>Belum ada dokter terdaftar.</p>
                ) : (
                    <table border="1" cellPadding="5" cellSpacing="0">
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

            <div>
                <h3>Assign Pasien ke Dokter</h3>
                <select
                    value={selectedDokter}
                    onChange={(e) => setSelectedDokter(e.target.value)}
                    style={{ width: "300px" }}
                    disabled={loading}
                >
                    <option value="">Pilih Dokter</option>
                    {dokterList.map((dokter) => (
                        <option key={dokter.address} value={dokter.address}>
                            {dokter.nama} ({dokter.address})
                        </option>
                    ))}
                </select>
                <br />
                <input
                    type="text"
                    placeholder="Alamat Wallet Pasien"
                    value={pasienAddress}
                    onChange={(e) => setPasienAddress(e.target.value)}
                    style={{ width: "300px", marginTop: "8px" }}
                    disabled={loading}
                />
                <br />
                <button onClick={assignPasien} style={{ marginTop: "8px" }} disabled={loading}>
                    {loading ? "Loading..." : "Assign Pasien"}
                </button>
            </div>
        </div>
    );
}
