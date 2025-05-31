import React, { useState, useEffect, useCallback } from "react"; // Tambahkan useCallback
import contract from "../contract"; // Pastikan path ini benar
import web3 from "../web3"; // Pastikan path ini benar
import PasienSideBar from "./PasienSideBar";
import DataDiriPasien from "./DataDiriPasien";
import RekamMedisHistory from "./RekamMedisHistory";

export default function PasienPage({ onLogout }) {
  const [account, setAccount] = useState("");
  const [loading, setLoading] = useState(true);

  const [dataDiri, setDataDiri] = useState(null);
  const [form, setForm] = useState({
    nama: "",
    golonganDarah: "",
    tanggalLahir: "",
    gender: "",
    alamat: "",
    noTelepon: "",
    email: "",
    adminRS: "", // alamat admin RS (rumah sakit) pilihan pasien
  });

  const [listAdminRS, setListAdminRS] = useState([]); // daftar Admin RS untuk dropdown

  const [historyRekamMedis, setHistoryRekamMedis] = useState([]); // Semua ID rekam medis yang dimiliki pasien
  const [rekamMedisTerbaru, setRekamMedisTerbaru] = useState(null); // Objek rekam medis terbaru
  const [activeTab, setActiveTab] = useState("dataDiri");
  const [isRegistered, setIsRegistered] = useState(false);

  // --- PERBAIKAN: Pindahkan definisi fetchData keluar dari useEffect ---
  const fetchData = useCallback(async () => {
    try {
      const accounts = await web3.eth.getAccounts();
      if (accounts.length === 0) {
        setLoading(false);
        return;
      }
      const aktif = accounts[0];
      setAccount(aktif);

      // Ambil data admin RS (rumah sakit)
      const totalAdmin = await contract.methods.totalAdmin().call();
      const admins = [];
      for (let i = 0; i < totalAdmin; i++) {
        const addr = await contract.methods.getAdminByIndex(i).call();
        const adminData = await contract.methods.dataAdmin(addr).call();
        if (adminData.aktif) {
          admins.push({ address: addr, nama: adminData.namaRumahSakit });
        }
      }
      setListAdminRS(admins);

      // Ambil data pasien
      const pasienData = await contract.methods.getPasienData(aktif).call();

      if (!pasienData[0]) {
        setIsRegistered(false);
        setDataDiri(null);
        setForm((f) => ({
          ...f,
          nama: "",
          golonganDarah: "",
          tanggalLahir: "",
          gender: "",
          alamat: "",
          noTelepon: "",
          email: "",
          adminRS: admins.length > 0 ? admins[0].address : "",
        }));
      } else {
        setIsRegistered(true);
        setDataDiri({
          nama: pasienData[0],
          golonganDarah: pasienData[1],
          tanggalLahir: pasienData[2],
          gender: pasienData[3],
          alamat: pasienData[4],
          noTelepon: pasienData[5],
          email: pasienData[6],
          rumahSakitPenanggungJawab: pasienData[7],
        });
        setForm({
          nama: pasienData[0],
          golonganDarah: pasienData[1],
          tanggalLahir: pasienData[2],
          gender: pasienData[3],
          alamat: pasienData[4],
          noTelepon: pasienData[5],
          email: pasienData[6],
          adminRS: pasienData[7],
        });

        // Ambil riwayat rekam medis ID
        const ids = await contract.methods.getRekamMedisIdsByPasien(aktif).call();
        if (ids.length > 0) {
          const allRecords = await Promise.all(
            ids.map(async (id) => {
              const rekam = await contract.methods.getRekamMedis(id).call();
              // Sesuaikan indeks agar sesuai dengan urutan return dari smart contract
              return {
                id: rekam[0].toString(),
                pasien: rekam[1],
                diagnosa: rekam[2],
                foto: rekam[3],
                catatan: rekam[4],
                valid: rekam[5],
              };
            })
          );

          // Urutkan rekam medis untuk menemukan yang terbaru (berdasarkan ID)
          const sortedRecords = allRecords.sort((a, b) => {
            return parseInt(b.id) - parseInt(a.id);
          });

          setHistoryRekamMedis(sortedRecords);
          setRekamMedisTerbaru(sortedRecords.length > 0 ? sortedRecords[0] : null);

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
  }, []); // Dependensi kosong karena fetchData tidak bergantung pada prop atau state yang berubah dan tidak perlu di-recreate

  // Load data awal saat komponen mount
  useEffect(() => {
    fetchData();
  }, [fetchData]); // Tambahkan fetchData ke dependency array useEffect

  const submitDataDiri = async () => {
    const {
      nama,
      golonganDarah,
      tanggalLahir,
      gender,
      alamat,
      noTelepon,
      email,
      adminRS,
    } = form;

    if (
      !nama ||
      !golonganDarah ||
      !tanggalLahir ||
      !gender ||
      !alamat ||
      !noTelepon ||
      !email ||
      !adminRS
    ) {
      alert("Mohon isi semua data diri dan pilih rumah sakit dengan lengkap.");
      return;
    }

    try {
      const [from] = await web3.eth.getAccounts();
      await contract.methods
        .selfRegisterPasien(
          nama,
          golonganDarah,
          tanggalLahir,
          gender,
          alamat,
          noTelepon,
          email,
          adminRS
        )
        .send({ from });
      alert("Registrasi data diri berhasil.");

      // Refresh data pasien setelah simpan
      await fetchData(); // Panggil fetchData di sini
    } catch (err) {
      console.error("Gagal simpan data diri:", err);
      alert(`Gagal simpan data diri: ${err.message}`);
    }
  };

  const handleLogout = () => {
    if (onLogout) onLogout();
    else window.location.reload();
  };

  if (loading)
    return <p className="p-8 text-center">Loading data pasien…</p>;
  if (!account)
    return (
      <p className="p-8 text-center">
        Silakan koneksikan wallet MetaMask Anda terlebih dahulu.
      </p>
    );

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
            listAdminRS={listAdminRS}
          />
        )}
        {activeTab === "riwayat" && (
          <div className="history-section bg-white rounded-xl shadow-md p-8 mx-auto">
            <h2 className="text-2xl font-bold mb-4 text-blue-700 text-center">
              Riwayat Rekam Medis
            </h2>
            {historyRekamMedis.length === 0 ? (
              <p className="italic text-gray-500 text-center">
                Tidak ada riwayat rekam medis.
              </p>
            ) : (
              <RekamMedisHistory
                rekamMedisId={historyRekamMedis.map(rm => rm.id)}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}