import React, { useState, useEffect } from "react";
import contract from "../contract";
import web3 from "../web3";
import "./PasienPage.css";
import RekamMedisHistory from "./RekamMedisHistory";

export default function PatientPage() {
    const [account, setAccount] = useState("");
    const [hasData, setHasData] = useState(false);
    const [loading, setLoading] = useState(true);
    const [dataDiri, setDataDiri] = useState(null);
    const [historyRekamMedis, setHistoryRekamMedis] = useState([]);

    // Form fields (hanya untuk initial input, tapi tidak ditampilkan lagi setelah data ada)
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

                const ids = await contract.methods.getRekamMedisIdsByPasien(active).call();

                if (ids.length > 0) {
                    setHasData(true);

                    const rekamDiri = await contract.methods.rekamMedis(ids[0]).call();
                    setDataDiri({
                        nama: rekamDiri.nama,
                        umur: rekamDiri.umur,
                        tanggalLahir: rekamDiri.tanggalLahir,
                        gender: rekamDiri.gender,
                        alamat: rekamDiri.alamat,
                        noTelepon: rekamDiri.noTelepon,
                        email: rekamDiri.email,
                        diagnosa: rekamDiri.diagnosa,
                        catatan: rekamDiri.catatan,
                        foto: rekamDiri.foto,
                        valid: rekamDiri.valid,
                    });

                    const rekamList = await Promise.all(
                        ids.map(id => contract.methods.rekamMedis(id).call())
                    );
                    setHistoryRekamMedis(rekamList);
                } else {
                    setHasData(false);
                    setDataDiri(null);
                    setHistoryRekamMedis([]);
                }
            } catch (error) {
                console.error("Gagal ambil data:", error);
                setHasData(false);
                setDataDiri(null);
                setHistoryRekamMedis([]);
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

            // Refresh data diri dan history rekam medis
            const ids = await contract.methods.getRekamMedisIdsByPasien(from).call();
            const rekamDiri = await contract.methods.rekamMedis(ids[0]).call();
            setDataDiri({
                nama: rekamDiri.nama,
                umur: rekamDiri.umur,
                tanggalLahir: rekamDiri.tanggalLahir,
                gender: rekamDiri.gender,
                alamat: rekamDiri.alamat,
                noTelepon: rekamDiri.noTelepon,
                email: rekamDiri.email,
                valid: rekamDiri.valid,
            });

            const rekamList = await Promise.all(
                ids.map(id => contract.methods.rekamMedis(id).call())
            );
            setHistoryRekamMedis(rekamList);
        } catch (err) {
            console.error("Error submit data:", err);
            alert("Gagal menyimpan data rekam medis.");
        }
    };

    if (loading) return <p>Loading data pasien...</p>;

    if (!account) return <p>Silakan koneksikan wallet MetaMask Anda terlebih dahulu.</p>;

    return (
        <div className="patient-page">
            <h2>Data Diri Pasien</h2>

            {!hasData ? (
                <>
                    {/* Form input data hanya muncul jika pasien belum punya data */}
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
                    <div className="data-diri">
                        <p><strong>Nama:</strong> {dataDiri?.nama || "-"}</p>
                        <p><strong>Umur:</strong> {dataDiri?.umur || "-"}</p>
                        <p><strong>Tanggal Lahir:</strong> {dataDiri?.tanggalLahir || "-"}</p>
                        <p><strong>Gender:</strong> {dataDiri?.gender || "-"}</p>
                        <p><strong>Golongan Darah:</strong> {dataDiri?.golonganDarah || "-"}</p>
                        <p><strong>Alamat:</strong> {dataDiri?.alamat || "-"}</p>
                        <p><strong>No. Telepon:</strong> {dataDiri?.noTelepon || "-"}</p>
                        <p><strong>Email:</strong> {dataDiri?.email || "-"}</p>
                        <p><strong>Diagnosa:</strong> {dataDiri?.diagnosa || "-"}</p>
                        <p><strong>Catatan:</strong> {dataDiri?.catatan || "-"}</p>
                        <p><strong>Status Data:</strong> {dataDiri?.valid ? "Valid" : "Tidak Valid"}</p>

                        {dataDiri?.foto ? (
                            <div>
                                <strong>Foto Medis:</strong><br />
                                <img
                                    src={dataDiri.foto}
                                    alt="Foto Medis"
                                    style={{ maxWidth: "300px", maxHeight: "300px", marginTop: "8px" }}
                                />
                            </div>
                        ) : (
                            <p><em>Tidak ada foto medis tersedia</em></p>
                        )}
                    </div>

                    {/* Tampilkan riwayat rekam medis */}
                    <h3>Riwayat Rekam Medis</h3>
                    <table className="history-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Diagnosa</th>
                                <th>Catatan</th>
                                <th>Status Valid</th>
                            </tr>
                        </thead>
                        <tbody>
                            {historyRekamMedis.length === 0 ? (
                                <tr>
                                    <td colSpan="4" style={{ textAlign: "center" }}>Belum ada riwayat rekam medis.</td>
                                </tr>
                            ) : (
                                historyRekamMedis.map((rekam) => (
                                    <tr key={rekam.id}>
                                        <td>{rekam.id}</td>
                                        <td>{rekam.diagnosa || "-"}</td>
                                        <td>{rekam.catatan || "-"}</td>
                                        <td>{rekam.valid ? "Valid" : "Tidak Valid"}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                    {/* Tampilkan history versi rekam medis (versi update data) */}
                    {historyRekamMedis.length > 0 && (
                        <RekamMedisHistory rekamMedisId={historyRekamMedis[0].id} />
                    )}
                </>
            )}
        </div>
    );
}
