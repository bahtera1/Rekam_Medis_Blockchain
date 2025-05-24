// src/pasien/PasienPage.jsx
import React, { useState, useEffect } from "react";
import contract from "../contract";
import web3 from "../web3";
import PasienSideBar from "./PasienSideBar";
import RekamMedisHistory from "./RekamMedisHistory";

export default function PasienPage({ onLogout }) {
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
    // Rekam medis terbaru
    const [rekamMedisTerbaru, setRekamMedisTerbaru] = useState(null);

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
                    setIsRegistered(false);
                } else {
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
                        // inject id ke setiap objek rekam medis (jaga-jaga untuk table)
                        all.forEach((rekam, i) => rekam.id = ids[i]);
                        setHistoryRekamMedis(all);
                        // Ambil rekam medis terbaru
                        setRekamMedisTerbaru(all[all.length - 1]);
                    } else {
                        setHistoryRekamMedis([]);
                        setRekamMedisTerbaru(null);
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

    // Handler logout (opsional, agar bisa dipanggil di sidebar)
    const handleLogout = () => {
        if (onLogout) onLogout();
        else window.location.reload();
    };

    if (loading) return <p className="p-8 text-center">Loading data pasien…</p>;
    if (!account) return <p className="p-8 text-center">Silakan koneksikan wallet MetaMask Anda terlebih dahulu.</p>;

    return (
        <div className="min-h-screen flex flex-row bg-gradient-to-tr from-blue-50 to-blue-100">
            <PasienSideBar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout} />
            <div className="flex-1 px-8 py-10 sm:px-4 transition-all duration-300">
                {activeTab === "dataDiri" && (
                    <>
                        <h2 className="text-3xl font-bold text-blue-800 mb-4">Data Diri Pasien</h2>
                        {!isRegistered ? (
                            <div className="bg-white rounded-xl shadow-md p-8 max-w-lg mx-auto">
                                <h3 className="text-lg font-bold mb-6 text-blue-700">Isi Data Diri</h3>
                                <div className="space-y-3">
                                    <div>
                                        <label className="block font-medium mb-1">Nama Lengkap:</label>
                                        <input type="text" className="w-full border border-blue-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400"
                                            value={nama} onChange={e => setNama(e.target.value)} />
                                    </div>
                                    <div>
                                        <label className="block font-medium mb-1">Umur:</label>
                                        <input type="number" className="w-full border border-blue-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400"
                                            value={umur} onChange={e => setUmur(e.target.value)} />
                                    </div>
                                    <div>
                                        <label className="block font-medium mb-1">Golongan Darah:</label>
                                        <input type="text" className="w-full border border-blue-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400"
                                            value={golonganDarah} onChange={e => setGolonganDarah(e.target.value)} />
                                    </div>
                                    <div>
                                        <label className="block font-medium mb-1">Tanggal Lahir:</label>
                                        <input type="date" className="w-full border border-blue-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400"
                                            value={tanggalLahir} onChange={e => setTanggalLahir(e.target.value)} />
                                    </div>
                                    <div>
                                        <label className="block font-medium mb-1">Gender:</label>
                                        <select className="w-full border border-blue-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400"
                                            value={gender} onChange={e => setGender(e.target.value)}>
                                            <option value="">Pilih</option>
                                            <option value="Laki-laki">Laki-laki</option>
                                            <option value="Perempuan">Perempuan</option>
                                            <option value="Lainnya">Lainnya</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block font-medium mb-1">Alamat:</label>
                                        <textarea className="w-full border border-blue-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400"
                                            value={alamat} onChange={e => setAlamat(e.target.value)} />
                                    </div>
                                    <div>
                                        <label className="block font-medium mb-1">No. Telepon:</label>
                                        <input type="tel" className="w-full border border-blue-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400"
                                            value={noTelepon} onChange={e => setNoTelepon(e.target.value)} />
                                    </div>
                                    <div>
                                        <label className="block font-medium mb-1">Email:</label>
                                        <input type="email" className="w-full border border-blue-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400"
                                            value={email} onChange={e => setEmail(e.target.value)} />
                                    </div>
                                </div>
                                <button className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold w-full transition"
                                    onClick={submitDataDiri}>
                                    Simpan Data Diri
                                </button>
                            </div>
                        ) : (
                            <div className="flex flex-col lg:flex-row gap-6 max-w-4xl mx-auto">
                                {/* Data Diri Pasien */}
                                <div className="bg-white rounded-xl shadow-md p-8 w-full lg:w-1/2 mb-8 lg:mb-0">
                                    <h3 className="text-lg font-bold mb-6 text-blue-700">Profil Pasien</h3>
                                    <div className="space-y-2">
                                        <p><span className="font-medium">Nama:</span> {dataDiri.nama}</p>
                                        <p><span className="font-medium">Umur:</span> {dataDiri.umur}</p>
                                        <p><span className="font-medium">Golongan Darah:</span> {dataDiri.golonganDarah}</p>
                                        <p><span className="font-medium">Tanggal Lahir:</span> {dataDiri.tanggalLahir}</p>
                                        <p><span className="font-medium">Gender:</span> {dataDiri.gender}</p>
                                        <p><span className="font-medium">Alamat:</span> {dataDiri.alamat}</p>
                                        <p><span className="font-medium">No. Telepon:</span> {dataDiri.noTelepon}</p>
                                        <p><span className="font-medium">Email:</span> {dataDiri.email}</p>
                                    </div>
                                </div>
                                {/* Rekam Medis Terbaru */}
                                <div className="bg-white rounded-xl shadow-md p-8 w-full lg:w-1/2">
                                    <h3 className="text-lg font-bold mb-6 text-blue-700">Rekam Medis Terbaru</h3>
                                    {rekamMedisTerbaru ? (
                                        <div className="space-y-2">
                                            <p><span className="font-medium">ID:</span> {rekamMedisTerbaru.id}</p>
                                            <p><span className="font-medium">Diagnosa:</span> {rekamMedisTerbaru.diagnosa}</p>
                                            <p><span className="font-medium">Catatan:</span> {rekamMedisTerbaru.catatan}</p>
                                            <p>
                                                <span className="font-medium">Foto:</span>{" "}
                                                {rekamMedisTerbaru.foto ?
                                                    <a href={rekamMedisTerbaru.foto} className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">Lihat Foto</a>
                                                    : <span className="italic text-gray-500">Tidak ada</span>
                                                }
                                            </p>
                                            <p>
                                                <span className="font-medium">Status Valid:</span>{" "}
                                                {rekamMedisTerbaru.valid ?
                                                    <span className="text-green-600 font-bold">Valid</span>
                                                    : <span className="text-red-600 font-bold">Tidak Valid</span>
                                                }
                                            </p>
                                        </div>
                                    ) : (
                                        <p className="italic text-gray-500">Belum ada rekam medis.</p>
                                    )}
                                </div>
                            </div>
                        )}
                    </>
                )}

                {activeTab === "riwayat" && (
                    <div className="history-section bg-white rounded-xl shadow-md p-8 max-w-4xl mx-auto">
                        <h2 className="text-2xl font-bold mb-4 text-blue-700">Riwayat Rekam Medis</h2>
                        {historyRekamMedis.length === 0 ? (
                            <p className="italic text-gray-500">Tidak ada riwayat versi rekam medis.</p>
                        ) : (
                            <RekamMedisHistory rekamMedisId={historyRekamMedis.map(rm => rm.id)} />
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
