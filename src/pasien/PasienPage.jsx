import React, { useState, useEffect, useCallback } from "react";
import PasienSideBar from "./PasienSideBar";
import DataDiriPasien from "./DataDiriPasien";
import RekamMedisHistory from "./RekamMedisHistory";
import PasienRegisterPage from "./PasienRegisterPage";
import contract from "../contract";

export default function PasienPage({ account, onLogout }) {
  const [activeMenu, setActiveMenu] = useState("dataDiri"); // Default ke dataDiri
  const [dataDiri, setDataDiri] = useState(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [rekamMedisIds, setRekamMedisIds] = useState([]);
  const [rekamMedisTerbaru, setRekamMedisTerbaru] = useState(null);
  const [loading, setLoading] = useState(true);
  const [listAdminRS, setListAdminRS] = useState([]);
  const [nextPatientId, setNextPatientId] = useState(''); // State baru untuk ID pasien yang di-generate
  const [error, setError] = useState(null); // State untuk menangani error

  // State form untuk registrasi / update data diri
  const [form, setForm] = useState({
    nama: "",
    ID: "", // ID Pasien (akan diisi otomatis untuk registrasi)
    golonganDarah: "",
    tanggalLahir: "",
    gender: "",
    alamat: "",
    noTelepon: "",
    email: "",
    adminRS: "",
  });

  // Cache lokal untuk nama aktor dan nama RS terkait.
  // Ini adalah adaptasi dari konsep caching yang Anda miliki di RekamMedisHistory.
  const [actorInfoCache, setActorInfoCache] = useState({});

  // Fungsi untuk mendapatkan nama aktor dan nama rumah sakit terkait dari alamat
  // Fungsi ini tetap di sini seperti kode asli Anda.
  const getActorDetails = useCallback(async (actorAddress) => {
    if (!actorAddress || actorAddress === "0x0000000000000000000000000000000000000000") {
      return { name: "N/A", hospitalName: "N/A", role: "Unknown" };
    }

    // Cek cache terlebih dahulu
    if (actorInfoCache[actorAddress]) {
      return actorInfoCache[actorAddress];
    }

    let name = "";
    let hospitalName = "N/A";
    let role = "";

    try {
      role = await contract.methods.getUserRole(actorAddress).call();

      switch (role) {
        case "Dokter":
        case "InactiveDokter":
          const dokterInfo = await contract.methods.getDokter(actorAddress).call();
          name = dokterInfo[0]; // nama dokter
          const affiliatedAdminRSAddress = dokterInfo[5]; // Alamat Admin RS afiliasi dokter
          if (affiliatedAdminRSAddress !== "0x0000000000000000000000000000000000000000") {
            try {
              const adminRSData = await contract.methods.getAdminRS(affiliatedAdminRSAddress).call();
              hospitalName = adminRSData[0]; // namaRumahSakit
            } catch (e) {
              console.warn(`Gagal mendapatkan nama RS afiliasi untuk dokter ${actorAddress}:`, e);
              hospitalName = "N/A (RS Error)";
            }
          }
          break;
        case "Pasien":
          const pasienDataFromContract = await contract.methods.getPasienData(actorAddress).call();
          name = pasienDataFromContract[0]; // nama pasien
          const responsibleRSAddress = pasienDataFromContract[8]; // Alamat RS Penanggung Jawab pasien
          if (responsibleRSAddress !== "0x0000000000000000000000000000000000000000") {
            try {
              const adminRSData = await contract.methods.getAdminRS(responsibleRSAddress).call();
              hospitalName = adminRSData[0]; // namaRumahSakit
            } catch (e) {
              console.warn(`Gagal mendapatkan nama RS penanggung jawab untuk pasien ${actorAddress}:`, e);
              hospitalName = "N/A (RS Error)";
            }
          }
          break;
        case "AdminRS":
        case "InactiveAdminRS":
          const adminInfo = await contract.methods.getAdminRS(actorAddress).call(); // Menggunakan getAdminRS, bukan dataAdmin
          name = adminInfo[0]; // namaRumahSakit Admin RS
          hospitalName = adminInfo[0]; // Untuk Admin RS, nama RS adalah dirinya sendiri
          break;
        case "SuperAdmin":
          name = "Super Admin (Sistem)";
          hospitalName = "Sistem Utama"; // Atau sesuaikan jika ada nama khusus untuk RS Super Admin
          break;
        default:
          name = `${actorAddress.substring(0, 6)}...${actorAddress.substring(actorAddress.length - 4)}`;
          hospitalName = "N/A";
      }
    } catch (err) {
      console.warn(`Gagal mendapatkan detail aktor ${actorAddress}:`, err);
      name = `${actorAddress.substring(0, 6)}...${actorAddress.substring(actorAddress.length - 4)}`;
      hospitalName = "N/A (Error)";
    }

    const details = { name, hospitalName, role };
    setActorInfoCache((prev) => ({ ...prev, [actorAddress]: details })); // Simpan di cache
    return details;
  }, [actorInfoCache]); // actorInfoCache sebagai dependency

  // Fungsi untuk memuat data diri pasien dan rekam medis
  const loadPasienData = useCallback(async () => {
    setLoading(true);
    setError(null); // Reset error
    try {
      const registered = await contract.methods.isPasien(account).call();
      setIsRegistered(registered);

      if (registered) {
        const pasienData = await contract.methods.getPasienData(account).call();

        setDataDiri({
          nama: pasienData[0],
          ID: pasienData[1],
          golonganDarah: pasienData[2],
          tanggalLahir: pasienData[3],
          gender: pasienData[4],
          alamat: pasienData[5],
          noTelepon: pasienData[6],
          email: pasienData[7],
          rumahSakitPenanggungJawab: pasienData[8],
        });

        setForm({
          nama: pasienData[0],
          ID: pasienData[1],
          golonganDarah: pasienData[2],
          tanggalLahir: pasienData[3],
          gender: pasienData[4],
          alamat: pasienData[5],
          noTelepon: pasienData[6],
          email: pasienData[7],
          adminRS: pasienData[8],
        });

        const rmIds = await contract.methods.getRekamMedisIdsByPasien(account).call();
        setRekamMedisIds(rmIds);

        if (rmIds.length > 0) {
          // Ambil ID rekam medis terakhir (terbaru)
          const latestRmId = rmIds[rmIds.length - 1];
          const latestRmData = await contract.methods.getRekamMedis(latestRmId).call();

          const pembuatAddress = latestRmData[5];
          // GUNAKAN getActorDetails YANG SAMA DI SINI
          const { name: pembuatNama, hospitalName: pembuatRSNama } = await getActorDetails(pembuatAddress);

          setRekamMedisTerbaru({
            id_rm: latestRmData[0].toString(),
            pasien: latestRmData[1],
            diagnosa: latestRmData[2],
            foto: latestRmData[3],
            catatan: latestRmData[4],
            pembuat: latestRmData[5], // Tetap simpan alamat aslinya jika perlu
            pembuatNama: pembuatNama, // Nama aktor yang sudah diformat
            pembuatRSNama: pembuatRSNama, // Nama RS pembuat rekam medis
            timestampPembuatan: Number(latestRmData[6]),
            tipeRekamMedis: latestRmData[7],
          });
        } else {
          setRekamMedisTerbaru(null);
        }
        setActiveMenu("dataDiri"); // Set menu default ke dataDiri setelah berhasil load
      } else {
        setDataDiri(null);
        setRekamMedisTerbaru(null);
        setRekamMedisIds([]);
        setForm({
          nama: "", ID: "", golonganDarah: "", tanggalLahir: "",
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
  }, [account, getActorDetails]); // getActorDetails ditambahkan sebagai dependency

  // Fetch daftar Admin RS yang aktif
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
                IDRS: data.IDRS,
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
  }, []); // Tidak ada perubahan besar di sini

  // Fungsi untuk meng-generate ID pasien berikutnya
  const generateNextPatientId = useCallback(async () => {
    try {
      const total = await contract.methods.totalPasien().call();
      const nextIdNum = Number(total) + 1;
      const formattedId = `P-${String(nextIdNum).padStart(3, '0')}`; // Format P-001, P-002, dst.
      setNextPatientId(formattedId);
    } catch (error) {
      console.error("Error generating next patient ID:", error);
      setError("Gagal meng-generate ID Pasien otomatis.");
      setNextPatientId("P-ERR"); // Fallback jika gagal generate
    }
  }, []);

  // Fungsi untuk pendaftaran pasien
  const submitDataDiri = useCallback(async () => {
    if (!nextPatientId || nextPatientId === "P-ERR") {
      alert("Gagal meng-generate ID Pasien. Silakan coba lagi.");
      return;
    }
    if (!form.nama || !form.golonganDarah || !form.tanggalLahir || !form.gender || !form.alamat || !form.noTelepon || !form.email || !form.adminRS) {
      alert("Harap lengkapi semua data pendaftaran.");
      return;
    }
    try {
      await contract.methods.selfRegisterPasien(
        form.nama,
        nextPatientId,
        form.golonganDarah,
        form.tanggalLahir,
        form.gender,
        form.alamat,
        form.noTelepon,
        form.email,
        form.adminRS
      ).send({ from: account });
      alert("Pendaftaran berhasil!");
      await loadPasienData(); // Muat ulang data pasien setelah pendaftaran
    } catch (error) {
      console.error("Error self-registering patient:", error);
      let errorMessage = "Gagal mendaftar pasien. Pastikan ID unik dan RS valid. Lihat konsol untuk detail.";
      if (error.message.includes("Pasien already registered")) {
        errorMessage = "Anda sudah terdaftar sebagai pasien.";
      } else if (error.message.includes("ID already taken")) {
        errorMessage = "ID pasien sudah digunakan. Coba refresh halaman untuk ID baru.";
      }
      alert(errorMessage);
    }
  }, [account, form, loadPasienData, nextPatientId]);

  // Fungsi untuk update data diri pasien
  const updatePasienData = useCallback(async (updatedData) => {
    try {
      await contract.methods.updatePasienData(
        updatedData.nama,
        updatedData.golonganDarah,
        updatedData.tanggalLahir,
        updatedData.gender,
        updatedData.alamat,
        updatedData.noTelepon,
        updatedData.email
      ).send({ from: account });
      alert("Data diri berhasil diperbarui!");
      await loadPasienData();
    } catch (error) {
      console.error("Error updating patient data:", error);
      alert("Gagal memperbarui data diri. Lihat konsol untuk detail.");
      throw error;
    }
  }, [account, loadPasienData]);

  // Fungsi untuk update RS penanggung jawab
  const updatePasienRumahSakit = useCallback(async (newAdminRSAddress) => {
    try {
      await contract.methods.updatePasienRumahSakit(newAdminRSAddress).send({ from: account });
      alert("Rumah Sakit Penanggung Jawab berhasil diperbarui!");
      await loadPasienData();
    } catch (error) {
      console.error("Error updating patient hospital:", error);
      alert("Gagal memperbarui RS Penanggung Jawab. Lihat konsol untuk detail.");
      throw error;
    }
  }, [account, loadPasienData]);

  useEffect(() => {
    if (account) {
      fetchAdminRSList();
      loadPasienData();
    }
  }, [account, loadPasienData, fetchAdminRSList]);

  // Efek untuk meng-generate ID pasien saat halaman register dimuat
  useEffect(() => {
    if (account && !isRegistered && (nextPatientId === '' || nextPatientId === 'P-ERR')) {
      generateNextPatientId();
    }
  }, [account, isRegistered, nextPatientId, generateNextPatientId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-blue-700 text-xl font-semibold">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mr-3"></div>
        Memuat data pasien...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen bg-red-50 border-l-4 border-red-400 p-4 text-red-700 font-medium">
        <span className="text-2xl mr-2">🚫</span> {error}
      </div>
    );
  }

  // Logika utama pengalihan halaman di dalam PasienPage
  if (!isRegistered) {
    return (
      <PasienRegisterPage
        submitDataDiri={submitDataDiri}
        form={form}
        setForm={setForm}
        listAdminRS={listAdminRS}
        onLogout={onLogout}
        nextPatientId={nextPatientId} // Teruskan ID yang di-generate
      />
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <PasienSideBar setActiveMenu={setActiveMenu} activeMenu={activeMenu} onLogout={onLogout} />
      <div className="flex-1 p-8">
        {activeMenu === "dataDiri" && dataDiri ? (
          <DataDiriPasien
            dataDiri={dataDiri}
            // rekamMedisTerbaru tidak lagi diteruskan ke DataDiriPasien
            listAdminRS={listAdminRS}
            updatePasienData={updatePasienData}
            updatePasienRumahSakit={updatePasienRumahSakit}
          />
        ) : activeMenu === "rekamMedisHistory" ? (
          <RekamMedisHistory
            rekamMedisIds={rekamMedisIds}
            rekamMedisTerbaru={rekamMedisTerbaru} // rekamMedisTerbaru diteruskan ke RekamMedisHistory
          // Fungsi getActorDetails dan cache-nya tetap di RekamMedisHistory
          />
        ) : (
          <div className="flex justify-center items-center min-h-[70vh] text-gray-500 text-lg italic bg-white p-6 rounded-lg shadow-md">
            <span className="text-4xl mr-3">✨</span> Pilih menu dari sidebar untuk melihat informasi Anda.
          </div>
        )}
      </div>
    </div>
  );
}