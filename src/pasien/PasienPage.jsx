import React, { useState, useEffect, useCallback } from "react";
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
    nama: "", golonganDarah: "", tanggalLahir: "", gender: "",
    alamat: "", noTelepon: "", email: "", adminRS: "",
  });

  const [listAdminRS, setListAdminRS] = useState([]);
  const [historyRekamMedisIds, setHistoryRekamMedisIds] = useState([]);
  const [rekamMedisTerbaru, setRekamMedisTerbaru] = useState(null);
  const [activeTab, setActiveTab] = useState("dataDiri");

  const [isRegistered, setIsRegistered] = useState(false);
  const [doctorNamesCache, setDoctorNamesCache] = useState({});

  // Fungsi untuk mendapatkan nama dokter/aktor dari alamat
  const getActorName = useCallback(async (actorAddress) => {
    if (actorAddress === '0x0000000000000000000000000000000000000000' || !actorAddress) {
      return "N/A";
    }
    if (doctorNamesCache[actorAddress]) { // Baca dari cache
      return doctorNamesCache[actorAddress];
    }
    try {
      const isDoc = await contract.methods.isDokter(actorAddress).call();
      if (isDoc) {
        const dokterInfo = await contract.methods.getDokter(actorAddress).call();
        const namaDokter = dokterInfo[0];
        setDoctorNamesCache(prev => ({ ...prev, [actorAddress]: namaDokter })); // Update cache
        return namaDokter;
      }

      const isPas = await contract.methods.isPasien(actorAddress).call();
      if (isPas) {
        const pasienData = await contract.methods.getPasienData(actorAddress).call();
        const namaPasien = pasienData[0];
        setDoctorNamesCache(prev => ({ ...prev, [actorAddress]: namaPasien })); // Update cache
        return namaPasien;
      }

      return `${actorAddress.substring(0, 6)}...${actorAddress.substring(actorAddress.length - 4)}`;
    } catch (err) {
      console.warn(`Gagal mendapatkan nama untuk aktor ${actorAddress}:`, err);
      return `${actorAddress.substring(0, 6)}...${actorAddress.substring(actorAddress.length - 4)}`;
    }
  }, [doctorNamesCache]); // contract DIHAPUS, doctorNamesCache DITAMBAHKAN

  const fetchData = useCallback(async () => {
    try {
      const accounts = await web3.eth.getAccounts();
      if (accounts.length === 0) {
        setLoading(false);
        return;
      }
      const aktif = accounts[0];
      setAccount(aktif);

      // Ambil daftar Admin RS
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

      // Ambil data diri pasien
      const pasienData = await contract.methods.getPasienData(aktif).call();

      if (!pasienData[0]) {
        setIsRegistered(false);
        setDataDiri(null);
        setForm((f) => ({
          ...f,
          nama: "", golonganDarah: "", tanggalLahir: "", gender: "",
          alamat: "", noTelepon: "", email: "",
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

        // Ambil riwayat rekam medis pasien (sekarang hanya IDs)
        const ids = await contract.methods.getRekamMedisIdsByPasien(aktif).call();
        setHistoryRekamMedisIds(ids);

        if (ids.length > 0) {
          const latestRmId = ids.reduce((maxId, currentId) => (parseInt(currentId) > parseInt(maxId) ? currentId : maxId), ids[0]);

          const rekam = await contract.methods.getRekamMedis(latestRmId).call();
          const pembuatNama = await getActorName(rekam[6]);

          setRekamMedisTerbaru({
            id: rekam[0].toString(),
            pasien: rekam[1],
            diagnosa: rekam[2],
            foto: rekam[3],
            catatan: rekam[4],
            valid: rekam[5],
            pembuat: rekam[6],
            pembuatNama: pembuatNama,
            timestampPembuatan: rekam[7],
            tipeRekamMedis: rekam[8],
          });

        } else {
          setRekamMedisTerbaru(null);
        }
      }
    } catch (err) {
      console.error("Gagal ambil data pasien:", err);
    } finally {
      setLoading(false);
    }
  }, [getActorName]); // getActorName sebagai dependency

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const submitDataDiri = async () => {
    const {
      nama, golonganDarah, tanggalLahir, gender,
      alamat, noTelepon, email, adminRS,
    } = form;

    if (
      !nama || !golonganDarah || !tanggalLahir || !gender ||
      !alamat || !noTelepon || !email || !adminRS
    ) {
      alert("Mohon isi semua data diri dan pilih rumah sakit dengan lengkap.");
      return;
    }

    try {
      const [from] = await web3.eth.getAccounts();
      await contract.methods
        .selfRegisterPasien(
          nama, golonganDarah, tanggalLahir, gender,
          alamat, noTelepon, email, adminRS
        )
        .send({ from });
      alert("Registrasi data diri berhasil.");

      await fetchData();
    } catch (err) {
      console.error("Gagal simpan data diri:", err);
      alert(`Gagal simpan data diri: ${err.message}`);
    }
  };

  const updatePasienData = async (updatedFormData) => {
    try {
      const [from] = await web3.eth.getAccounts();
      await contract.methods.updatePasienData(
        updatedFormData.nama,
        updatedFormData.golonganDarah,
        updatedFormData.tanggalLahir,
        updatedFormData.gender,
        updatedFormData.alamat,
        updatedFormData.noTelepon,
        updatedFormData.email
      ).send({ from });
      alert("Data diri berhasil diperbarui.");
      await fetchData();
    } catch (err) {
      console.error("Gagal memperbarui data diri pasien:", err);
      alert(`Gagal memperbarui data diri: ${err.message}`);
    }
  };

  const updatePasienRumahSakit = async (newAdminRSAddress) => {
    try {
      const [from] = await web3.eth.getAccounts();
      await contract.methods.updatePasienRumahSakit(newAdminRSAddress).send({ from });
      alert("Rumah Sakit Penanggung Jawab berhasil diperbarui.");
      await fetchData();
    } catch (err) {
      console.error("Gagal memperbarui RS penanggung jawab:", err);
      alert(`Gagal memperbarui RS penanggung jawab: ${err.message}`);
    }
  };

  const handleLogout = () => {
    if (onLogout) onLogout();
    else window.location.reload();
  };

  if (loading)
    return <p className="p-8 text-center">Memuat data pasien…</p>;
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
            updatePasienData={updatePasienData}
            updatePasienRumahSakit={updatePasienRumahSakit}
          />
        )}
        {activeTab === "riwayat" && (
          <div className="history-section bg-white rounded-xl shadow-md p-8 mx-auto">
            <h2 className="text-2xl font-bold mb-4 text-blue-700 text-center">
              Riwayat Rekam Medis
            </h2>
            {historyRekamMedisIds.length === 0 ? (
              <p className="italic text-gray-500 text-center">
                Tidak ada riwayat rekam medis.
              </p>
            ) : (
              <RekamMedisHistory
                rekamMedisIds={historyRekamMedisIds}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}