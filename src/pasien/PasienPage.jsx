import React, { useState, useEffect, useCallback } from "react";
import contract from "../contract";
import web3 from "../web3";
import PasienSideBar from "./PasienSideBar";
import DataDiriPasien from "./DataDiriPasien";
import RekamMedisHistory from "./RekamMedisHistory";

export default function PasienPage({ onLogout }) {
  const [account, setAccount] = useState("");
  const [loading, setLoading] = useState(true);

  const [dataDiri, setDataDiri] = useState(null); // dataDiri will now include the ID
  const [form, setForm] = useState({
    nama: "",
    golonganDarah: "",
    tanggalLahir: "",
    gender: "",
    alamat: "",
    noTelepon: "",
    email: "",
    adminRS: "", // Ini yang perlu dipastikan terisi
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
        // getPasienData mengembalikan: nama (0), ID (1), golonganDarah (2), ...
        const namaPasien = pasienData[0]; // Nama Pasien ada di indeks 0
        setDoctorNamesCache(prev => ({ ...prev, [actorAddress]: namaPasien })); // Update cache
        return namaPasien;
      }

      return `${actorAddress.substring(0, 6)}...${actorAddress.substring(actorAddress.length - 4)}`;
    } catch (err) {
      console.warn(`Gagal mendapatkan nama untuk aktor ${actorAddress}:`, err);
      return `${actorAddress.substring(0, 6)}...${actorAddress.substring(actorAddress.length - 4)}`;
    }
  }, [doctorNamesCache]);

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
      // getPasienData mengembalikan: nama (0), ID (1), golonganDarah (2), tanggalLahir (3), gender (4),
      // alamat (5), noTelepon (6), email (7), rumahSakitPenanggungJawab (8)
      const pasienDataFromContract = await contract.methods.getPasienData(aktif).call();


      if (!pasienDataFromContract[0]) { // Check if 'nama' is empty (meaning patient is not registered)
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
          adminRS: admins.length > 0 ? admins[0].address : "", // Set default RS if available
        }));
      } else {
        setIsRegistered(true);
        setDataDiri({
          nama: pasienDataFromContract[0],
          ID: pasienDataFromContract[1],
          golonganDarah: pasienDataFromContract[2],
          tanggalLahir: pasienDataFromContract[3],
          gender: pasienDataFromContract[4],
          alamat: pasienDataFromContract[5],
          noTelepon: pasienDataFromContract[6],
          email: pasienDataFromContract[7],
          rumahSakitPenanggungJawab: pasienDataFromContract[8],
        });
        setForm({ // Keep form values consistent for editing
          nama: pasienDataFromContract[0],
          golonganDarah: pasienDataFromContract[2],
          tanggalLahir: pasienDataFromContract[3],
          gender: pasienDataFromContract[4],
          alamat: pasienDataFromContract[5],
          noTelepon: pasienDataFromContract[6],
          email: pasienDataFromContract[7],
          adminRS: pasienDataFromContract[8],
        });

        // Ambil riwayat rekam medis pasien (sekarang hanya IDs)
        const ids = await contract.methods.getRekamMedisIdsByPasien(aktif).call();
        setHistoryRekamMedisIds(ids);

        if (ids.length > 0) {
          // Sort IDs numerically (important for consistency, as they are strings from contract)
          const sortedIds = [...ids].sort((a, b) => parseInt(b) - parseInt(a));
          const latestRmId = sortedIds[0];

          const rekam = await contract.methods.getRekamMedis(latestRmId).call();
          const pembuatNama = await getActorName(rekam[6]);

          setRekamMedisTerbaru({
            id: rekam[0].toString(),
            pasien: rekam[1],
            diagnosa: rekam[2],
            foto: rekam[3],
            catatan: rekam[4],
            // Removed 'valid' as per smart contract change
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
      // More robust error message for the user if needed, or set an error state
    } finally {
      setLoading(false);
    }
  }, [getActorName]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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
      !nama || !golonganDarah || !tanggalLahir || !gender ||
      !alamat || !noTelepon || !email || !adminRS // Pastikan adminRS terisi
    ) {
      alert("Mohon isi semua data diri dan pilih rumah sakit dengan lengkap.");
      return;
    }

    // --- Logic to generate patient ID (P-001, P-002, etc.) ---
    let newPatientId = "";
    try {
      // Fetch the total number of patients to generate the next ID
      // This assumes your smart contract has a way to get the total count,
      // or you might need to iterate through daftarPasien.
      // For simplicity, let's assume `daftarPasien` from contract can give count.
      // If `daftarPasien` contains all patients, length + 1 would be the next.
      const allPatients = await contract.methods.getDaftarPasien().call();
      const nextIdNumber = allPatients.length + 1;
      newPatientId = `P-${String(nextIdNumber).padStart(3, '0')}`;
      console.log("Generated new patient ID:", newPatientId);

    } catch (err) {
      console.error("Failed to generate patient ID:", err);
      alert("Gagal membuat ID pasien otomatis. Silakan coba lagi.");
      return;
    }
    // --- End of ID generation logic ---


    try {
      const [from] = await web3.eth.getAccounts();
      // MODIFIED: Pass the generated newPatientId as the second parameter
      await contract.methods
        .selfRegisterPasien(
          nama,
          newPatientId, // <-- Pass the generated ID here
          golonganDarah,
          tanggalLahir,
          gender,
          alamat,
          noTelepon,
          email,
          adminRS
        )
        .send({ from });
      alert(`Registrasi data diri berhasil. ID Pasien Anda: ${newPatientId}`); // User feedback with generated ID
      await fetchData(); // Re-fetch to get the newly generated ID and update state
    } catch (err) {
      console.error("Gagal simpan data diri:", err);
      // More specific error parsing to show actual revert reason from Solidity
      const errorMessage = err.message.includes("revert")
        ? err.message.substring(err.message.indexOf("revert") + "revert".length).trim()
        : "Terjadi kesalahan tidak dikenal saat menyimpan data diri.";
      alert(`Gagal simpan data diri: ${errorMessage}`);
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
            submitDataDiri={submitDataDiri} // This will now call selfRegisterPasien with generated ID
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