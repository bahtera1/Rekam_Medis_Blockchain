import React, { useState, useEffect } from "react";
import contract from "../contract";
import web3 from "../web3";
import PasienSideBar from "./PasienSideBar";
import DataDiriPasien from "./DataDiriPasien";
import RekamMedisHistory from "./RekamMedisHistory";

export default function PasienPage({ onLogout }) {
    const [account, setAccount] = useState("");
    const [loading, setLoading] = useState(true);

    const [dataDiri, setDataDiri] = useState(null);
    const [form, setForm] = useState({
        nama: "", umur: "", golonganDarah: "", tanggalLahir: "",
        gender: "", alamat: "", noTelepon: "", email: ""
    });

    const [historyRekamMedis, setHistoryRekamMedis] = useState([]);
    const [rekamMedisTerbaru, setRekamMedisTerbaru] = useState(null);
    const [activeTab, setActiveTab] = useState("dataDiri");
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
                const pasienData = await contract.methods.getPasienData(aktif).call();
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
                    // auto update form jika data pasien sudah ada (opsional, biar bisa edit nanti)
                    setForm({
                        nama: pasienData[0],
                        umur: pasienData[1],
                        golonganDarah: pasienData[2],
                        tanggalLahir: pasienData[3],
                        gender: pasienData[4],
                        alamat: pasienData[5],
                        noTelepon: pasienData[6],
                        email: pasienData[7],
                    });
                    const ids = await contract.methods.getRekamMedisIdsByPasien(aktif).call();
                    if (ids.length > 0) {
                        const all = await Promise.all(
                            ids.map((id) => contract.methods.getRekamMedis(id).call())
                        );
                        all.forEach((rekam, i) => rekam.id = ids[i]);
                        setHistoryRekamMedis(all);
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

    const submitDataDiri = async () => {
        const { nama, umur, golonganDarah, tanggalLahir, gender, alamat, noTelepon, email } = form;
        if (!nama || !umur || !golonganDarah || !tanggalLahir || !gender || !alamat || !noTelepon || !email) {
            alert("Mohon isi semua data diri dengan lengkap.");
            return;
        }
        try {
            const [from] = await web3.eth.getAccounts();
            await contract.methods.selfRegisterPasien(
                nama,
                parseInt(umur, 10),
                golonganDarah,
                tanggalLahir,
                gender,
                alamat,
                noTelepon,
                email
            ).send({ from });
            alert("Registrasi data diri berhasil.");
            // fetch ulang data pasien
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
            setForm({
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
                    <DataDiriPasien
                        isRegistered={isRegistered}
                        dataDiri={dataDiri}
                        rekamMedisTerbaru={rekamMedisTerbaru}
                        submitDataDiri={submitDataDiri}
                        form={form}
                        setForm={setForm}
                    />
                )}
                {activeTab === "riwayat" && (
                    <div className="history-section bg-white rounded-xl shadow-md p-8 max-w-4xl mx-auto">
                        <h2 className="text-2xl font-bold mb-4 text-blue-700 text-center">Riwayat Rekam Medis</h2>
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
