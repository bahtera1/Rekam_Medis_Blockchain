import React, { useState, useEffect, useCallback } from "react";
import PasienSideBar from "./PasienSideBar";
import DataDiriPasien from "./DataDiriPasien";
import RekamMedisHistory from "./RekamMedisHistory";
import PasienRegisterPage from "./PasienRegisterPage";
import contract from "../contract";
import web3 from "../web3";
import queryString from 'query-string';

// Menggunakan ikon dari library React Icons
import { FaSpinner, FaExclamationTriangle, FaInfoCircle, FaIdCard, FaUserPlus } from "react-icons/fa";
import KartuPasien from "./KartuPasien"; // Asumsi Anda akan membuat komponen ini

export default function PasienPage({ account, onLogout, setAccount }) {
  const [activeMenu, setActiveMenu] = useState("dataDiri");
  const [dataDiri, setDataDiri] = useState(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [rekamMedisIds, setRekamMedisIds] = useState([]);
  const [rekamMedisTerbaru, setRekamMedisTerbaru] = useState(null);
  const [loading, setLoading] = useState(true);
  const [listAdminRS, setListAdminRS] = useState([]);
  const [nextPatientId, setNextPatientId] = useState('');
  const [error, setError] = useState(null);

  const [form, setForm] = useState({
    nama: "",
    ID: "",
    NIK: "",
    golonganDarah: "",
    tanggalLahir: "",
    gender: "",
    alamat: "",
    noTelepon: "",
    email: "",
    adminRS: "",
  });

  const [actorInfoCache, setActorInfoCache] = useState({});

  const getActorDetails = useCallback(async (actorAddress) => {
    const addressAsString = typeof actorAddress === 'string' ? actorAddress : String(actorAddress);

    if (addressAsString === '0x0000000000000000000000000000000000000000' || !addressAsString) {
      return { name: "N/A", hospitalName: "N/A", role: "Unknown" };
    }

    if (actorInfoCache[addressAsString]) {
      return actorInfoCache[addressAsString];
    }

    let name = "";
    let hospitalName = "N/A";
    let role = "";

    try {
      role = await contract.methods.getUserRole(addressAsString).call();

      switch (role) {
        case "Dokter":
        case "InactiveDokter":
          const dokterInfo = await contract.methods.getDokter(addressAsString).call();
          name = dokterInfo[0];
          const affiliatedAdminRSAddress = dokterInfo[5];
          if (affiliatedAdminRSAddress !== "0x0000000000000000000000000000000000000000") {
            try {
              const adminRSData = await contract.methods.getAdminRS(affiliatedAdminRSAddress).call();
              hospitalName = adminRSData.namaRumahSakit; // Akses properti struct
            } catch (e) {
              console.warn(`Gagal mendapatkan nama RS afiliasi untuk dokter ${addressAsString}:`, e);
              hospitalName = "N/A (RS Error)";
            }
          }
          break;
        case "Pasien":
          const pasienDataFromContract = await contract.methods.getPasienData(addressAsString).call();
          name = pasienDataFromContract.nama;
          const responsibleRSAddress = pasienDataFromContract.rumahSakitPenanggungJawab;
          if (responsibleRSAddress !== "0x0000000000000000000000000000000000000000") {
            try {
              const adminRSData = await contract.methods.getAdminRS(responsibleRSAddress).call();
              hospitalName = adminRSData.namaRumahSakit; // Akses properti struct
            } catch (e) {
              console.warn(`Gagal mendapatkan nama RS penanggung jawab untuk pasien ${addressAsString}:`, e);
              hospitalName = "N/A (RS Error)";
            }
          }
          break;
        case "AdminRS":
        case "InactiveAdminRS":
          const adminInfo = await contract.methods.getAdminRS(addressAsString).call();
          name = adminInfo.namaRumahSakit; // Akses properti struct
          hospitalName = adminInfo.namaRumahSakit; // Akses properti struct
          break;
        case "SuperAdmin":
          name = "Super Admin (Sistem)";
          hospitalName = "Sistem Utama";
          break;
        default:
          name = `${addressAsString.substring(0, 6)}...${addressAsString.substring(addressAsString.length - 4)}`;
          hospitalName = "N/A";
      }
    } catch (err) {
      console.warn(`Gagal mendapatkan detail aktor ${addressAsString}:`, err);
      name = `${addressAsString.substring(0, 6)}...${addressAsString.substring(addressAsString.length - 4)}`;
      hospitalName = "N/A (Error)";
    }

    const details = { name, hospitalName, role };
    setActorInfoCache((prev) => ({ ...prev, [addressAsString]: details }));
    return details;
  }, [actorInfoCache]);

  const loadPasienData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const registered = await contract.methods.isPasien(account).call();
      setIsRegistered(registered);

      if (registered) {
        const pasienData = await contract.methods.getPasienData(account).call();

        setDataDiri({
          nama: pasienData.nama,
          ID: pasienData.ID,
          NIK: pasienData.NIK,
          golonganDarah: pasienData.golonganDarah,
          tanggalLahir: pasienData.tanggalLahir,
          gender: pasienData.gender,
          alamat: pasienData.alamat,
          noTelepon: pasienData.noTelepon,
          email: pasienData.email,
          rumahSakitPenanggungJawab: pasienData.rumahSakitPenanggungJawab,
          address: account,
        });

        setForm({
          nama: pasienData.nama,
          ID: pasienData.ID,
          NIK: pasienData.NIK,
          golonganDarah: pasienData.golonganDarah,
          tanggalLahir: pasienData.tanggalLahir,
          gender: pasienData.gender,
          alamat: pasienData.alamat,
          noTelepon: pasienData.noTelepon,
          email: pasienData.email,
          adminRS: pasienData.rumahSakitPenanggungJawab,
        });

        const rmIds = await contract.methods.getRekamMedisIdsByPasien(account).call();
        setRekamMedisIds(rmIds);

        if (rmIds.length > 0) {
          const latestRmId = rmIds[rmIds.length - 1];
          // Perbaikan: Akses properti struct untuk rekam medis
          const latestRmData = await contract.methods.getRekamMedis(latestRmId).call();

          const pembuatAddress = latestRmData.pembuat; // Akses .pembuat
          const { name: pembuatNama, hospitalName: pembuatRSNama } = await getActorDetails(pembuatAddress);

          setRekamMedisTerbaru({
            id_rm: latestRmData.id.toString(),
            pasien: latestRmData.pasien,
            diagnosa: latestRmData.diagnosa,
            foto: latestRmData.foto,
            catatan: latestRmData.catatan,
            pembuat: latestRmData.pembuat,
            pembuatNama: pembuatNama,
            pembuatRSNama: pembuatRSNama,
            timestampPembuatan: Number(latestRmData.timestampPembuatan),
            tipeRekamMedis: latestRmData.tipeRekamMedis,
          });
        } else {
          setRekamMedisTerbaru(null);
        }
        setActiveMenu("dataDiri");
      } else {
        setDataDiri(null);
        setRekamMedisTerbaru(null);
        setRekamMedisIds([]);
        setForm({
          nama: "", ID: "", NIK: "", golonganDarah: "", tanggalLahir: "",
          gender: "", alamat: "", noTelepon: "", email: "", adminRS: "",
        });
      }
    } catch (error) {
      console.error("Error loading pasien data:", error);
      setError("Gagal memuat data pasien. Pastikan Anda terhubung ke jaringan blockchain yang benar.");
      setIsRegistered(false);
      setDataDiri(null);
      setRekamMedisTerbaru(null);
      setRekamMedisIds([]);
    } finally {
      setLoading(false);
    }
  }, [account, getActorDetails]);

  const fetchAdminRSList = useCallback(async () => {
    try {
      const addresses = await contract.methods.getAllAdminRSAddresses().call();
      const adminRSData = await Promise.all(
        addresses.map(async (addr) => {
          try {
            const data = await contract.methods.getAdminRS(addr).call();
            if (data.aktif) {
              return {
                address: addr,
                nama: data.namaRumahSakit,
                alamat: data.alamatRumahSakit,
                kota: data.kota,
                NIBRS: data.NIBRS,
              };
            }
            return null;
          } catch (error) {
            console.error(`Error fetching AdminRS data for ${addr}:`, error);
            return null;
          }
        })
      );
      setListAdminRS(adminRSData.filter(Boolean));
    } catch (error) {
      console.error("Error fetching admin RS list:", error);
      setError("Gagal memuat daftar Rumah Sakit. Coba refresh halaman.");
    }
  }, []);

  const generateNextPatientId = useCallback(async () => {
    try {
      const total = await contract.methods.totalPasien().call();
      const nextIdNum = Number(total) + 1;
      const formattedId = `P-${String(nextIdNum).padStart(3, '0')}`;
      setNextPatientId(formattedId);
    } catch (error) {
      console.error("Error generating next patient ID:", error);
      setError("Gagal meng-generate ID Pasien otomatis.");
      setNextPatientId("P-ERR");
    }
  }, []);

  const submitDataDiri = useCallback(async () => {
    if (!nextPatientId || nextPatientId === "P-ERR") {
      alert("Gagal meng-generate ID Pasien. Silakan coba lagi.");
      return;
    }
    if (!form.nama || !form.NIK || !form.golonganDarah || !form.tanggalLahir || !form.gender || !form.alamat || !form.noTelepon || !form.email || !form.adminRS) {
      alert("Harap lengkapi semua data pendaftaran.");
      return;
    }
    try {
      const GAS_LIMIT = 5000000;

      await contract.methods.selfRegisterPasien(
        form.nama,
        nextPatientId,
        form.NIK,
        form.golonganDarah,
        form.tanggalLahir,
        form.gender,
        form.alamat,
        form.noTelepon,
        form.email,
        form.adminRS
      ).send({
        from: account,
        gas: GAS_LIMIT
      });
      alert("Pendaftaran berhasil!");
      await loadPasienData();
    } catch (error) {
      console.error("Error self-registering patient:", error);
      let errorMessage = "Gagal mendaftar pasien. Pastikan data unik dan valid.";
      if (error.message.includes("out of gas")) {
        errorMessage = "Transaksi kehabisan gas. Coba tingkatkan batas gas (di MetaMask/kode) atau simpan data lebih sedikit.";
      } else if (error.message.includes("Pasien already registered")) {
        errorMessage = "Anda sudah terdaftar sebagai pasien.";
      } else if (error.message.includes("ID Pasien sudah digunakan")) {
        errorMessage = "ID pasien sudah digunakan. Coba refresh halaman.";
      } else if (error.message.includes("NIK Pasien sudah digunakan")) {
        errorMessage = "NIK pasien sudah digunakan. Harap masukkan NIK yang unik.";
      } else if (error.message.includes("revert")) {
        const revertReason = error.message.substring(error.message.indexOf("revert") + 6).trim();
        errorMessage = `Transaksi dibatalkan: ${revertReason}.`;
      }
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [account, form, loadPasienData, nextPatientId]);

  const updatePasienData = useCallback(async (updatedData) => {
    try {
      const GAS_LIMIT = 2000000;

      await contract.methods.updatePasienData(
        updatedData.nama,
        updatedData.NIK,
        updatedData.golonganDarah,
        updatedData.tanggalLahir,
        updatedData.gender,
        updatedData.alamat,
        updatedData.noTelepon,
        updatedData.email
      ).send({
        from: account,
        gas: GAS_LIMIT
      });
      alert("Data diri berhasil diperbarui!");
      await loadPasienData();
    } catch (error) {
      console.error("Error updating patient data:", error);
      let errorMessage = "Gagal memperbarui data diri. Lihat konsol untuk detail.";
      if (error.message.includes("NIK baru sudah digunakan")) {
        errorMessage = "NIK baru sudah digunakan oleh pasien lain. Harap masukkan NIK yang unik.";
      } else if (error.message.includes("out of gas")) {
        errorMessage = "Transaksi kehabisan gas saat update. Coba tingkatkan batas gas.";
      } else if (error.message.includes("revert")) {
        const revertReason = error.message.substring(error.message.indexOf("revert") + 6).trim();
        errorMessage = `Transaksi dibatalkan: ${revertReason}.`;
      }
      alert(errorMessage);
      throw error;
    }
  }, [account, loadPasienData]);

  const updatePasienRumahSakit = useCallback(async (newAdminRSAddress) => {
    try {
      const GAS_LIMIT = 1000000;

      await contract.methods.updatePasienRumahSakit(newAdminRSAddress).send({
        from: account,
        gas: GAS_LIMIT
      });
      alert("Rumah Sakit Penanggung Jawab berhasil diperbarui!");
      await loadPasienData();
    } catch (error) {
      console.error("Error updating patient hospital:", error);
      let errorMessage = "Gagal memperbarui RS Penanggung Jawab. Lihat konsol untuk detail.";
      if (error.message.includes("out of gas")) {
        errorMessage = "Transaksi kehabisan gas saat update RS. Coba tingkatkan batas gas.";
      } else if (error.message.includes("revert")) {
        const revertReason = error.message.substring(error.message.indexOf("revert") + 6).trim();
        errorMessage = `Transaksi dibatalkan: ${revertReason}.`;
      }
      alert(errorMessage);
      throw error;
    }
  }, [account, loadPasienData]);

  useEffect(() => {
    const parsed = queryString.parse(window.location.search);
    const addressFromUrl = parsed.address;

    if (addressFromUrl && web3.utils.isAddress(addressFromUrl)) {
      console.log("URL param address detected:", addressFromUrl);
      if (account !== addressFromUrl) {
        async function connectAndVerify() {
          setLoading(true);
          try {
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            if (accounts[0].toLowerCase() === addressFromUrl.toLowerCase()) {
              setAccount(accounts[0]);
              console.log("Metamask connected to URL address:", accounts[0]);
            } else {
              setError("Metamask terhubung ke akun yang berbeda dari QR code. Silakan ganti akun.");
              setLoading(false);
            }
          } catch (connectError) {
            console.error("Error connecting Metamask via QR scan:", connectError);
            setError("Gagal terhubung ke Metamask. Pastikan Metamask aktif dan berikan izin.");
            setLoading(false);
          }
        }
        connectAndVerify();
      } else {
        loadPasienData();
      }
    } else if (account) {
      loadPasienData();
    } else {
      setLoading(false);
    }
  }, [account, setAccount, loadPasienData]);

  useEffect(() => {
    fetchAdminRSList();
  }, [fetchAdminRSList]);

  useEffect(() => {
    if (account && !isRegistered && (nextPatientId === '' || nextPatientId === 'P-ERR')) {
      generateNextPatientId();
    }
  }, [account, isRegistered, nextPatientId, generateNextPatientId]);

  // --- Loading State (disesuaikan dengan gaya lama tapi pakai ikon) ---
  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gradient-to-br from-blue-50 to-indigo-100 text-blue-700">
        <FaSpinner className="animate-spin text-6xl text-blue-500 mb-4" />
        <p className="text-xl font-semibold drop-shadow-sm">Memuat data pasien...</p>
        <p className="text-sm text-gray-500 mt-2">Harap tunggu sebentar.</p>
      </div>
    );
  }

  // --- Error State (disesuaikan dengan gaya lama tapi pakai ikon) ---
  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-red-50 border-l-8 border-red-500 p-8 text-red-800 font-medium rounded-lg shadow-xl mx-auto w-11/12 max-w-lg">
        <FaExclamationTriangle className="text-6xl text-red-600 mb-5" />
        <h2 className="text-2xl font-bold mb-3">Terjadi Kesalahan!</h2>
        <p className="text-center text-lg">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-6 px-6 py-3 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 transition duration-300 ease-in-out transform hover:scale-105"
        >
          Coba Lagi
        </button>
      </div>
    );
  }

  // --- Registration Page (jika belum terdaftar) (disesuaikan dengan gaya lama tapi pakai ikon) ---
  if (!isRegistered) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-8 flex items-center justify-center">
        <div className="bg-white p-10 rounded-xl shadow-2xl w-full max-w-3xl">
          <h2 className="text-4xl font-extrabold text-gray-900 mb-8 text-center flex items-center justify-center gap-3">
            <FaUserPlus className="text-indigo-600" /> Pendaftaran Pasien Baru
          </h2>
          <p className="text-center text-gray-600 mb-8 text-lg">
            Sepertinya Anda belum terdaftar sebagai pasien di sistem kami. Silakan lengkapi data diri Anda untuk memulai.
          </p>
          <PasienRegisterPage
            submitDataDiri={submitDataDiri}
            form={form}
            setForm={setForm}
            listAdminRS={listAdminRS}
            onLogout={onLogout}
            nextPatientId={nextPatientId}
          />
        </div>
      </div>
    );
  }

  // --- Main Pasien Dashboard ---
  return (
    <div className="flex min-h-screen bg-gray-100 font-sans">
      <PasienSideBar
        setActiveMenu={setActiveMenu}
        activeMenu={activeMenu}
        onLogout={onLogout}
        namaPasien={dataDiri?.nama || "Pasien"}
      />
      <div className="flex-1 p-6 md:p-10 lg:p-12">
        <header className="mb-8 md:mb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight">
            Selamat Datang, <span className="text-indigo-600">{dataDiri?.nama || "Pasien"}!</span>
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            Kelola data diri dan riwayat rekam medis Anda dengan mudah.
          </p>
        </header>

        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 lg:p-10 min-h-[calc(100vh-180px)]">
          {activeMenu === "dataDiri" && dataDiri ? (
            <DataDiriPasien
              dataDiri={dataDiri}
              listAdminRS={listAdminRS}
              updatePasienData={updatePasienData}
              updatePasienRumahSakit={updatePasienRumahSakit}
            />
          ) : activeMenu === "rekamMedisHistory" ? (
            <RekamMedisHistory
              rekamMedisIds={rekamMedisIds}
              rekamMedisTerbaru={rekamMedisTerbaru}
              accountContext={account}
            />
          ) : activeMenu === "kartuPasien" ? ( // <-- Tambahkan kondisi ini untuk Kartu Pasien
            <KartuPasien
              dataDiri={dataDiri}
              account={account} // Opsional, jika KartuPasien butuh account
            />
          ) : (
            <div className="flex flex-col justify-center items-center min-h-[calc(100vh-300px)] text-gray-500 text-xl italic bg-blue-50 border-2 border-blue-200 p-8 rounded-lg shadow-inner text-center">
              <FaInfoCircle className="text-7xl text-blue-400 mb-6" />
              <h3 className="text-2xl font-bold text-gray-700 mb-3">Informasi Tersedia di Sini</h3>
              <p className="max-w-md">
                Pilih menu dari sidebar di sebelah kiri untuk melihat detail data diri Anda atau meninjau riwayat rekam medis Anda.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}