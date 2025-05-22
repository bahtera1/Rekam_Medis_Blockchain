// src/pasien/PasienPage.jsx
import React, { useState, useEffect } from "react";
import contract from "../contract";
import web3 from "../web3";
import "./PasienPage.css";

import PasienSideBar from "./PasienSideBar";
import RekamMedisHistory from "./RekamMedisHistory";

export default function PasienPage() {
    const [account, setAccount] = useState("");
    const [loading, setLoading] = useState(true);

    // Data diri pasien
    const [dataDiri, setDataDiri] = useState(null);

    // Form data diri untuk pendaftaran pasien baru
    const [nama, setNama] = useState("");
    const [umur, setUmur] = useState("");
    const [golonganDarah, setGolonganDarah] = useState("");
    const [tanggalLahir, setTanggalLahir] = useState("");
    const [gender, setGender] = useState("");
    const [alamat, setAlamat] = useState("");
    const [noTelepon, setNoTelepon] = useState("");
    const [email, setEmail] = useState("");

    // History rekam medis pasien
    const [historyRekamMedis, setHistoryRekamMedis] = useState([]);

    // Tab aktif: 'dataDiri' atau 'riwayat'
    const [activeTab, setActiveTab] = useState("dataDiri");

    // State apakah pasien sudah terdaftar data diri
    const [isRegistered, setIsRegistered] = useState(false);

    useEffect(() => {
        async function fetchData() {
            try {
                const accounts = await web3.eth.getAccounts();
                if (accounts.length === 0) {
                    setLoading(false);
                    return;
                }

                const aktif = accounts[0];
                setAccount(aktif);

                // Cek apakah sudah terdaftar sebagai pasien dan data lengkap
                const pasienData = await contract.methods.getPasienData(aktif).call();

                // Jika nama pasien kosong ("") berarti belum daftar
                if (!pasienData[0]) {
                    // Pasien baru, belum isi data diri
                    setIsRegistered(false);
                } else {
                    // Sudah terdaftar, simpan data diri ke state
                    setIsRegistered(true);
                    setDataDiri({
                        nama: pasienData[0],
                        umur: pasienData[1],
                        golonganDarah: pasienData[2],
                        tanggalLahir: pasienData[3],
                        gender: pasienData[4],
                        alamat: pasienData[5],
                        noTelepon: pasienData[6],
                        email: pasienData[7],
                    });

                    // Ambil semua ID rekam medis pasien
                    const ids = await contract.methods.getRekamMedisIdsByPasien(aktif).call();

                    if (ids.length > 0) {
                        // Ambil semua rekam medis untuk riwayat
                        const all = await Promise.all(
                            ids.map((id) => contract.methods.getRekamMedis(id).call())
                        );
                        setHistoryRekamMedis(all);
                    }
                }
            } catch (err) {
                console.error("Gagal ambil data pasien:", err);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    // Fungsi submit data diri pasien (registrasi)
    const submitDataDiri = async () => {
        if (
            !nama ||
            !umur ||
            !golonganDarah ||
            !tanggalLahir ||
            !gender ||
            !alamat ||
            !noTelepon ||
            !email
        ) {
            alert("Mohon isi semua data diri dengan lengkap.");
            return;
        }

        try {
            const [from] = await web3.eth.getAccounts();

            await contract.methods
                .selfRegisterPasien(
                    nama,
                    parseInt(umur, 10),
                    golonganDarah,
                    tanggalLahir,
                    gender,
                    alamat,
                    noTelepon,
                    email
                )
                .send({ from });

            alert("Registrasi data diri berhasil.");

            // Segera fetch ulang data pasien
            const pasienData = await contract.methods.getPasienData(from).call();

            setIsRegistered(true);
            setDataDiri({
                nama: pasienData[0],
                umur: pasienData[1],
                golonganDarah: pasienData[2],
                tanggalLahir: pasienData[3],
                gender: pasienData[4],
                alamat: pasienData[5],
                noTelepon: pasienData[6],
                email: pasienData[7],
            });
        } catch (err) {
            console.error("Gagal simpan data diri:", err);
            alert("Gagal simpan data diri.");
        }
    };

    if (loading) return <p>Loading data pasien…</p>;
    if (!account) return <p>Silakan koneksikan wallet MetaMask Anda terlebih dahulu.</p>;

    return (
        <div className="pasien-container">
            <PasienSideBar activeTab={activeTab} setActiveTab={setActiveTab} />

            <div className="pasien-main">
                {activeTab === "dataDiri" && (
                    <>
                        <h2>Data Diri Pasien</h2>

                        {!isRegistered ? (
                            // Form input data diri untuk pasien baru
                            <div className="form-section">
                                <h3>Isi Data Diri</h3>

                                <div>
                                    <label>Nama Lengkap:</label>
                                    <input
                                        type="text"
                                        value={nama}
                                        onChange={(e) => setNama(e.target.value)}
                                    />
                                </div>

                                <div>
                                    <label>Umur:</label>
                                    <input
                                        type="number"
                                        value={umur}
                                        onChange={(e) => setUmur(e.target.value)}
                                    />
                                </div>

                                <div>
                                    <label>Golongan Darah:</label>
                                    <input
                                        type="text"
                                        value={golonganDarah}
                                        onChange={(e) => setGolonganDarah(e.target.value)}
                                    />
                                </div>

                                <div>
                                    <label>Tanggal Lahir:</label>
                                    <input
                                        type="date"
                                        value={tanggalLahir}
                                        onChange={(e) => setTanggalLahir(e.target.value)}
                                    />
                                </div>

                                <div>
                                    <label>Gender:</label>
                                    <select value={gender} onChange={(e) => setGender(e.target.value)}>
                                        <option value="">Pilih</option>
                                        <option value="Laki-laki">Laki-laki</option>
                                        <option value="Perempuan">Perempuan</option>
                                        <option value="Lainnya">Lainnya</option>
                                    </select>
                                </div>

                                <div>
                                    <label>Alamat:</label>
                                    <textarea
                                        value={alamat}
                                        onChange={(e) => setAlamat(e.target.value)}
                                    />
                                </div>

                                <div>
                                    <label>No. Telepon:</label>
                                    <input
                                        type="tel"
                                        value={noTelepon}
                                        onChange={(e) => setNoTelepon(e.target.value)}
                                    />
                                </div>

                                <div>
                                    <label>Email:</label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>

                                <button onClick={submitDataDiri}>Simpan Data Diri</button>
                            </div>
                        ) : (
                            // Tampilkan data diri pasien jika sudah terdaftar
                            <div className="card data-diri">
                                <div className="card-body">
                                    <h3 className="card-title">Data Diri</h3>
                                    <p>
                                        <strong>Nama:</strong> {dataDiri.nama}
                                    </p>
                                    <p>
                                        <strong>Umur:</strong> {dataDiri.umur}
                                    </p>
                                    <p>
                                        <strong>Golongan Darah:</strong> {dataDiri.golonganDarah}
                                    </p>
                                    <p>
                                        <strong>Tanggal Lahir:</strong> {dataDiri.tanggalLahir}
                                    </p>
                                    <p>
                                        <strong>Gender:</strong> {dataDiri.gender}
                                    </p>
                                    <p>
                                        <strong>Alamat:</strong> {dataDiri.alamat}
                                    </p>
                                    <p>
                                        <strong>No. Telepon:</strong> {dataDiri.noTelepon}
                                    </p>
                                    <p>
                                        <strong>Email:</strong> {dataDiri.email}
                                    </p>
                                </div>
                            </div>
                        )}
                    </>
                )}

                {activeTab === "riwayat" && (
                    <div className="history-section">
                        <h2>Riwayat Rekam Medis</h2>
                        {historyRekamMedis.length === 0 ? (
                            <p>Tidak ada riwayat versi rekam medis.</p>
                        ) : (
                            <RekamMedisHistory rekamMedisId={historyRekamMedis[0].id} />
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
