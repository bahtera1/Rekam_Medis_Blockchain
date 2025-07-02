import React, { useState, useEffect, useCallback } from "react";
import PasienSideBar from "./PasienSideBar";
import DataDiriPasien from "./DataDiriPasien";
import RekamMedisHistory from "./RekamMedisHistory";
import PasienRegisterPage from "./PasienRegisterPage";
import contract from "../contract";
import web3 from "../web3";

export default function PasienPage({ account, onLogout }) {
  const [activeMenu, setActiveMenu] = useState("dataDiri"); // Default ke dataDiri
  const [dataDiri, setDataDiri] = useState(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [rekamMedisIds, setRekamMedisIds] = useState([]);
  const [rekamMedisTerbaru, setRekamMedisTerbaru] = useState(null);
  const [loading, setLoading] = useState(true);
  const [listAdminRS, setListAdminRS] = useState([]);
  const [nextPatientId, setNextPatientId] = useState(''); // State baru untuk ID pasien yang di-generate

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
    }
  }, []);

  // Fungsi untuk mendapatkan nama rumah sakit dari alamat admin RS
  const getHospitalNameForDisplay = useCallback(async (adminRSAddress) => {
    if (!adminRSAddress || adminRSAddress === "0x0000000000000000000000000000000000000000") {
      return "N/A";
    }
    try {
      const rsInfo = await contract.methods.getAdminRS(adminRSAddress).call();
      return rsInfo[0];
    } catch (error) {
      console.error(`Failed to get hospital name for ${adminRSAddress}:`, error);
      return "N/A (Error Kontrak RS)";
    }
  }, []);

  // Fungsi untuk mendapatkan nama aktor (dokter/pasien) untuk ditampilkan
  const getActorNameForDisplay = useCallback(async (actorAddress) => {
    if (!actorAddress || actorAddress === "0x0000000000000000000000000000000000000000") {
      return "N/A";
    }
    try {
      const isDoc = await contract.methods.isDokter(actorAddress).call();
      if (isDoc) {
        const dokterInfo = await contract.methods.getDokter(actorAddress).call();
        return dokterInfo[0];
      }
      const isPas = await contract.methods.isPasien(actorAddress).call();
      if (isPas) {
        const pasienInfo = await contract.methods.getPasienData(actorAddress).call();
        return pasienInfo[0];
      }
      return `${actorAddress.substring(0, 6)}...${actorAddress.substring(actorAddress.length - 4)}`;
    } catch (error) {
      console.error(`Failed to get actor name for ${actorAddress}:`, error);
      return `${actorAddress.substring(0, 6)}...${actorAddress.substring(actorAddress.length - 4)}`;
    }
  }, []);

  // Fungsi untuk memuat data diri pasien dan rekam medis
  const loadPasienData = useCallback(async () => {
    setLoading(true);
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

        // Fetch rekam medis terbaru
        const rmIds = await contract.methods.getRekamMedisIdsByPasien(account).call();
        setRekamMedisIds(rmIds);

        if (rmIds.length > 0) {
          const latestRmId = rmIds[rmIds.length - 1];
          const latestRmData = await contract.methods.getRekamMedis(latestRmId).call();

          const pembuatAddress = latestRmData[5];
          const pembuatNama = await getActorNameForDisplay(pembuatAddress);
          let pembuatRSNama = "N/A";

          const isPembuatDokter = await contract.methods.isDokter(pembuatAddress).call();
          const isPembuatPasien = await contract.methods.isPasien(pembuatAddress).call();

          if (isPembuatDokter) {
            const dokterInfo = await contract.methods.getDokter(pembuatAddress).call();
            const rsAfiliasiAddress = dokterInfo[5];
            pembuatRSNama = await getHospitalNameForDisplay(rsAfiliasiAddress);
          } else if (isPembuatPasien) {
            const pasienRmPembuatData = await contract.methods.getPasienData(pembuatAddress).call();
            const rsPasienAddress = pasienRmPembuatData[8];
            pembuatRSNama = await getHospitalNameForDisplay(rsPasienAddress);
          } else {
            const isPembuatAdminRS = await contract.methods.isRumahSakit(pembuatAddress).call();
            if (isPembuatAdminRS) {
              pembuatRSNama = await getHospitalNameForDisplay(pembuatAddress);
            } else {
              pembuatRSNama = "N/A (Tipe Pembuat RM tidak dikenal)";
            }
          }

          setRekamMedisTerbaru({
            id_rm: latestRmData[0].toString(),
            pasien: latestRmData[1],
            diagnosa: latestRmData[2],
            foto: latestRmData[3],
            catatan: latestRmData[4],
            pembuat: latestRmData[5],
            pembuatNama: pembuatNama,
            pembuatRSNama: pembuatRSNama,
            timestampPembuatan: latestRmData[6],
            tipeRekamMedis: latestRmData[7],
          });
        } else {
          setRekamMedisTerbaru(null);
        }
        setActiveMenu("dataDiri"); // Set menu default ke dataDiri setelah berhasil load
      } else {
        // Jika tidak terdaftar, pastikan data kosong
        setDataDiri(null);
        setRekamMedisTerbaru(null);
        setRekamMedisIds([]);
      }
    } catch (error) {
      console.error("Error loading pasien data:", error);
      setIsRegistered(false);
      setDataDiri(null);
      setRekamMedisTerbaru(null);
      setRekamMedisIds([]);
    } finally {
      setLoading(false);
    }
  }, [account, getActorNameForDisplay, getHospitalNameForDisplay]);

  // Fungsi untuk meng-generate ID pasien berikutnya
  const generateNextPatientId = useCallback(async () => {
    try {
      const total = await contract.methods.totalPasien().call(); // <-- KOREKSI INI: Panggil totalPasien()
      const nextIdNum = Number(total) + 1;
      const formattedId = `P-${String(nextIdNum).padStart(3, '0')}`; // Format P-001, P-002, dst.
      setNextPatientId(formattedId);
      // setForm(prevForm => ({ ...prevForm, ID: formattedId })); // Tidak perlu update form di sini, karena submitDataDiri akan menggunakan nextPatientId
    } catch (error) {
      console.error("Error generating next patient ID:", error);
      setNextPatientId("P-ERR"); // Fallback jika gagal generate
    }
  }, []);

  // Fungsi untuk pendaftaran pasien
  const submitDataDiri = useCallback(async () => {
    // Pastikan ID sudah ter-generate sebelum submit
    if (!nextPatientId || nextPatientId === "P-ERR") { // Cek nextPatientId, bukan form.ID
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
        nextPatientId, // <-- KOREKSI INI: Gunakan nextPatientId langsung
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
      alert("Gagal mendaftar pasien. Pastikan ID unik dan RS valid. Lihat konsol untuk detail.");
      throw error;
    }
  }, [account, form, loadPasienData, nextPatientId]); // Tambahkan nextPatientId ke dependencies

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
    // Hanya generate jika ada akun, belum terdaftar, dan belum ada ID yang di-generate atau ID-nya 'P-ERR'
    if (account && !isRegistered && (nextPatientId === '' || nextPatientId === 'P-ERR')) {
      generateNextPatientId();
    }
  }, [account, isRegistered, nextPatientId, generateNextPatientId]); // Tambahkan nextPatientId sebagai dependency

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-blue-700 text-xl">
        Memuat data pasien...
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
    <div className="flex">
      <PasienSideBar setActiveMenu={setActiveMenu} activeMenu={activeMenu} onLogout={onLogout} />
      <div className="flex-1 p-8">
        {activeMenu === "dataDiri" && dataDiri ? (
          <DataDiriPasien
            dataDiri={dataDiri}
            rekamMedisTerbaru={rekamMedisTerbaru}
            listAdminRS={listAdminRS}
            updatePasienData={updatePasienData}
            updatePasienRumahSakit={updatePasienRumahSakit}
          />
        ) : activeMenu === "rekamMedisHistory" ? (
          <RekamMedisHistory rekamMedisIds={rekamMedisIds} />
        ) : (
          <div className="flex justify-center items-center min-h-screen-70vh text-gray-500">
            Pilih menu dari sidebar atau data sedang dimuat...
          </div>
        )}
      </div>
    </div>
  );
}