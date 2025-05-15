// src/pasien/PasienPage.jsx
import React, { useState, useEffect } from "react";
import contract from "../contract";
import web3 from "../web3";
import "./PasienPage.css"

export default function PatientPage() {
    const [account, setAccount] = useState("");
    const [hasData, setHasData] = useState(false);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    // Form fields
    const [nama, setNama] = useState("");
    const [umur, setUmur] = useState("");
    const [tanggalLahir, setTanggalLahir] = useState("");
    const [gender, setGender] = useState("");
    const [alamat, setAlamat] = useState("");
    const [noTelepon, setNoTelepon] = useState("");
    const [email, setEmail] = useState("");

    useEffect(() => {
        async function fetchData() {
            try {
                const accounts = await web3.eth.getAccounts();
                if (accounts.length === 0) return;
                const active = accounts[0];
                setAccount(active);

                // Ambil daftar rekam medis pasien dengan fungsi khusus di kontrak
                const ids = await contract.methods.getRekamMedisIdsByPasien(active).call();

                if (ids.length > 0) {
                    setHasData(true);
                    const rekam = await contract.methods.rekamMedis(ids[0]).call();

                    setData({
                        nama: rekam.nama,
                        umur: rekam.umur,
                        tanggalLahir: rekam.tanggalLahir,
                        gender: rekam.gender,
                        alamat: rekam.alamat,
                        noTelepon: rekam.noTelepon,
                        email: rekam.email,
                        valid: rekam.valid,
                    });
                } else {
                    setHasData(false);
                    setData(null);
                }
            } catch (error) {
                console.error("Gagal ambil data:", error);
                setHasData(false);
                setData(null);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    const submitData = async () => {
        if (!nama || !umur || !tanggalLahir || !gender || !alamat || !noTelepon || !email) {
            alert("Mohon isi semua data yang diperlukan.");
            return;
        }

        try {
            const accounts = await web3.eth.getAccounts();
            const from = accounts[0];

            await contract.methods
                .tambahRekamMedis(
                    from,
                    nama,
                    parseInt(umur),
                    "", // golonganDarah kosong
                    tanggalLahir,
                    gender,
                    alamat,
                    noTelepon,
                    email,
                    "", // diagnosa kosong
                    "", // foto kosong
                    ""  // catatan kosong
                )
                .send({ from });

            alert("Data rekam medis berhasil disimpan.");
            setHasData(true);

            // Refresh data pasien
            const ids = await contract.methods.getRekamMedisIdsByPasien(from).call();
            const rekam = await contract.methods.rekamMedis(ids[0]).call();
            setData({
                nama: rekam.nama,
                umur: rekam.umur,
                tanggalLahir: rekam.tanggalLahir,
                gender: rekam.gender,
                alamat: rekam.alamat,
                noTelepon: rekam.noTelepon,
                email: rekam.email,
                valid: rekam.valid,
            });
        } catch (err) {
            console.error("Error submit data:", err);
            alert("Gagal menyimpan data rekam medis.");
        }
    };

    if (loading) {
        return <p>Loading data pasien...</p>;
    }

    if (!account) {
        return <p>Silakan koneksikan wallet MetaMask Anda terlebih dahulu.</p>;
    }

    return (
        <div>
            <h2>Data Pasien</h2>

            {!hasData ? (
                <>
                    <div>
                        <label>Nama Lengkap:</label><br />
                        <input
                            type="text"
                            value={nama}
                            onChange={e => setNama(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label>Umur:</label><br />
                        <input
                            type="number"
                            value={umur}
                            onChange={e => setUmur(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label>Tanggal Lahir:</label><br />
                        <input
                            type="date"
                            value={tanggalLahir}
                            onChange={e => setTanggalLahir(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label>Gender:</label><br />
                        <select
                            value={gender}
                            onChange={e => setGender(e.target.value)}
                            required
                        >
                            <option value="">Pilih</option>
                            <option value="Laki-laki">Laki-laki</option>
                            <option value="Perempuan">Perempuan</option>
                            <option value="Lainnya">Lainnya</option>
                        </select>
                    </div>
                    <div>
                        <label>Alamat:</label><br />
                        <textarea
                            value={alamat}
                            onChange={e => setAlamat(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label>No. Telepon:</label><br />
                        <input
                            type="tel"
                            value={noTelepon}
                            onChange={e => setNoTelepon(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label>Email:</label><br />
                        <input
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <br />
                    <button onClick={submitData}>Simpan Data</button>
                </>
            ) : (
                <>
                    <p><strong>Nama:</strong> {data?.nama || "-"}</p>
                    <p><strong>Umur:</strong> {data?.umur || "-"}</p>
                    <p><strong>Tanggal Lahir:</strong> {data?.tanggalLahir || "-"}</p>
                    <p><strong>Gender:</strong> {data?.gender || "-"}</p>
                    <p><strong>Alamat:</strong> {data?.alamat || "-"}</p>
                    <p><strong>No. Telepon:</strong> {data?.noTelepon || "-"}</p>
                    <p><strong>Email:</strong> {data?.email || "-"}</p>
                    <p><strong>Status Data:</strong> {data?.valid ? "Valid" : "Tidak Valid"}</p>
                </>
            )}
        </div>
    );
}
