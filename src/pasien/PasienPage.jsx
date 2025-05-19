// src/pasien/PasienPage.jsx
import React, { useState, useEffect } from "react";
import contract from "../contract";
import web3 from "../web3";
import "./PasienPage.css";

import PasienSideBar from "./PasienSideBar";
import RekamMedisHistory from "./RekamMedisHistory";

export default function PasienPage() {
    const [account, setAccount] = useState("");
    const [hasData, setHasData] = useState(false);
    const [loading, setLoading] = useState(true);
    const [dataDiri, setDataDiri] = useState(null);
    const [historyRekamMedis, setHistoryRekamMedis] = useState([]);

    // Form initial (jika pasien belum isi data)
    const [nama, setNama] = useState("");
    const [umur, setUmur] = useState("");
    const [tanggalLahir, setTanggalLahir] = useState("");
    const [gender, setGender] = useState("");
    const [alamat, setAlamat] = useState("");
    const [noTelepon, setNoTelepon] = useState("");
    const [email, setEmail] = useState("");

    // Tab aktif: 'dataDiri' atau 'riwayat'
    const [activeTab, setActiveTab] = useState("dataDiri");

    useEffect(() => {
        async function fetchData() {
            try {
                const accounts = await web3.eth.getAccounts();
                if (accounts.length === 0) return;

                const aktif = accounts[0];
                setAccount(aktif);

                // ambil semua ID rekam medis pasien
                const ids = await contract.methods
                    .getRekamMedisIdsByPasien(aktif)
                    .call();

                if (ids.length > 0) {
                    setHasData(true);

                    // Data diri = rekam pertama
                    const pertama = await contract.methods.rekamMedis(ids[0]).call();
                    setDataDiri({
                        nama: pertama.nama,
                        umur: pertama.umur,
                        tanggalLahir: pertama.tanggalLahir,
                        gender: pertama.gender,
                        alamat: pertama.alamat,
                        noTelepon: pertama.noTelepon,
                        email: pertama.email,
                        diagnosa: pertama.diagnosa,
                        catatan: pertama.catatan,
                        foto: pertama.foto,
                        valid: pertama.valid,
                    });

                    // seluruh versi untuk riwayat
                    const all = await Promise.all(
                        ids.map((id) => contract.methods.rekamMedis(id).call())
                    );
                    setHistoryRekamMedis(all);
                }
            } catch (err) {
                console.error("Gagal ambil data pasien:", err);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, []);

    const submitData = async () => {
        if (
            !nama ||
            !umur ||
            !tanggalLahir ||
            !gender ||
            !alamat ||
            !noTelepon ||
            !email
        ) {
            alert("Mohon isi semua data yang diperlukan.");
            return;
        }
        try {
            const [from] = await web3.eth.getAccounts();
            await contract.methods
                .tambahRekamMedis(
                    from,
                    nama,
                    parseInt(umur, 10),
                    "", // golonganDarah kosong
                    tanggalLahir,
                    gender,
                    alamat,
                    noTelepon,
                    email,
                    "", // diagnosa kosong
                    "", // foto kosong
                    "" // catatan kosong
                )
                .send({ from });

            alert("Data rekam medis berhasil disimpan.");

            // refresh data
            const ids = await contract.methods
                .getRekamMedisIdsByPasien(from)
                .call();
            const pertama = await contract.methods.rekamMedis(ids[0]).call();
            setDataDiri({
                nama: pertama.nama,
                umur: pertama.umur,
                tanggalLahir: pertama.tanggalLahir,
                gender: pertama.gender,
                alamat: pertama.alamat,
                noTelepon: pertama.noTelepon,
                email: pertama.email,
                diagnosa: pertama.diagnosa,
                catatan: pertama.catatan,
                foto: pertama.foto,
                valid: pertama.valid,
            });
            const all = await Promise.all(
                ids.map((id) => contract.methods.rekamMedis(id).call())
            );
            setHistoryRekamMedis(all);
            setHasData(true);
        } catch (err) {
            console.error("Gagal simpan data:", err);
            alert("Gagal menyimpan data.");
        }
    };

    if (loading) return <p>Loading data pasien…</p>;
    if (!account)
        return <p>Silakan koneksikan wallet MetaMask Anda terlebih dahulu.</p>;

    return (
        <div className="pasien-container">
            <PasienSideBar
                activeTab={activeTab}
                setActiveTab={setActiveTab}
            />

            <div className="pasien-main">
                {activeTab === "dataDiri" && (
                    <>
                        <h2>Data Diri Pasien</h2>

                        {!hasData ? (
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
                                    <label>Tanggal Lahir:</label>
                                    <input
                                        type="date"
                                        value={tanggalLahir}
                                        onChange={(e) => setTanggalLahir(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label>Gender:</label>
                                    <select
                                        value={gender}
                                        onChange={(e) => setGender(e.target.value)}
                                    >
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
                                <button onClick={submitData}>Simpan Data</button>
                            </div>
                        ) : (
                            <div className="card data-diri">
                                <div className="card-body">
                                    <h3 className="card-title">Data Diri</h3>
                                    <p className="info-item">
                                        <strong>Nama:</strong> {dataDiri.nama}
                                    </p>
                                    <p className="info-item">
                                        <strong>Umur:</strong> {dataDiri.umur}
                                    </p>
                                    <p className="info-item">
                                        <strong>Tanggal Lahir:</strong> {dataDiri.tanggalLahir}
                                    </p>
                                    <p className="info-item">
                                        <strong>Gender:</strong> {dataDiri.gender}
                                    </p>
                                    <p className="info-item">
                                        <strong>Alamat:</strong> {dataDiri.alamat}
                                    </p>
                                    <p className="info-item">
                                        <strong>No. Telepon:</strong> {dataDiri.noTelepon}
                                    </p>
                                    <p className="info-item">
                                        <strong>Email:</strong> {dataDiri.email}
                                    </p>
                                    <p className="info-item">
                                        <strong>Diagnosa:</strong> {dataDiri.diagnosa || "-"}
                                    </p>
                                    <p className="info-item">
                                        <strong>Catatan:</strong> {dataDiri.catatan || "-"}
                                    </p>
                                    <p className="info-item">
                                        <strong>Status:</strong>{" "}
                                        {dataDiri.valid ? "Valid" : "Tidak Valid"}
                                    </p>
                                    {dataDiri.foto && (
                                        <div style={{ marginTop: 16 }}>
                                            <img
                                                src={dataDiri.foto}
                                                alt="Medis"
                                                className="img-thumbnail"
                                            />
                                        </div>
                                    )}
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
                            <RekamMedisHistory
                                rekamMedisId={historyRekamMedis[0].id}
                            />
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
