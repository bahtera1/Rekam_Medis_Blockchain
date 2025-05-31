import React, { useState, useEffect } from "react";
import contract from "../contract";
import ManageDokterPage from "./ManageDokterPage";
import ManagePasienPage from "./ManagePasienPage";
import ManageAssign from "./ManageAssign";
import AdminSideBar from "./AdminSideBar";

export default function AdminPage({ account, onLogout }) {
  const [dokterAddress, setDokterAddress] = useState("");
  const [dokterNama, setDokterNama] = useState("");
  const [dokterSpesialisasi, setDokterSpesialisasi] = useState("");
  const [dokterNomorLisensi, setDokterNomorLisensi] = useState("");
  const [dokterList, setDokterList] = useState([]);
  const [pasienAddress, setPasienAddress] = useState("");
  const [listPasien, setListPasien] = useState([]);
  const [selectedDokter, setSelectedDokter] = useState("");
  const [assignedPairs, setAssignedPairs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activePage, setActivePage] = useState("manageDokter");
  const [namaRumahSakit, setNamaRumahSakit] = useState("");

  useEffect(() => {
    const fetchNamaRS = async () => {
      try {
        const adminData = await contract.methods.dataAdmin(account).call();
        if (adminData && adminData.namaRumahSakit) {
          setNamaRumahSakit(adminData.namaRumahSakit);
        } else {
          setNamaRumahSakit("");
        }
      } catch (err) {
        console.error("Gagal ambil nama RS:", err);
        setNamaRumahSakit("");
      }
    };
    if (account) fetchNamaRS();
  }, [account]);

  const fetchDokterList = async () => {
    try {
      const total = await contract.methods.totalDokter().call();
      const list = [];
      for (let i = 0; i < total; i++) {
        const addr = await contract.methods.getDokterByIndex(i).call();
        const result = await contract.methods.getDokter(addr).call();
        if (result[5] === account) { // result[5] adalah adminRS
          list.push({
            address: addr,
            nama: result[0],
            spesialisasi: result[1],
            nomorLisensi: result[2],
            aktif: result[3],
            assignedPasien: result[4],
            adminRS: result[5],
          });
        }
      }
      setDokterList(list);
    } catch (err) {
      console.error("Gagal ambil daftar dokter:", err);
      // alert("Gagal ambil daftar dokter."); // Mungkin tidak perlu alert di sini jika hanya refresh
    }
  };

  const fetchPasienList = async () => {
    try {
      const pasienArray = await contract.methods.getDaftarPasien().call();
      const list = [];
      for (const addr of pasienArray) {
        const data = await contract.methods.getPasienData(addr).call();
        if (data[7] === account) { // data[8] adalah rumahSakitPenanggungJawab
          list.push({ address: addr, nama: data[0] });
        }
      }
      setListPasien(list);
    } catch (err) {
      console.error("Gagal ambil daftar pasien:", err);
      // alert("Gagal ambil daftar pasien.");
    }
  };

  const fetchAssignedPairs = async () => {
    // Pastikan dokterList dan listPasien sudah terisi sebelum memanggil ini
    if (dokterList.length === 0 || listPasien.length === 0) {
        // console.log("Menunggu dokterList dan listPasien terisi untuk fetchAssignedPairs");
        return;
    }
    try {
      const pairs = dokterList
        .filter(dok => dok.adminRS === account && dok.assignedPasien && dok.assignedPasien.length > 0)
        .map(dok => ({
          dokterNama: dok.nama,
          dokterLisensi: dok.nomorLisensi,
          dokterAddress: dok.address,
          pasienList: dok.assignedPasien.map(addr => {
            const pasienData = listPasien.find(p => p.address === addr);
            return {
              nama: pasienData ? pasienData.nama : "Data Pasien Tidak Ditemukan",
              address: addr,
            };
          }),
        }));
      setAssignedPairs(pairs);
    } catch (err) {
      console.error("Gagal ambil pairing dokter-pasien:", err);
    }
  };

  useEffect(() => {
    async function fetchInitialData() {
      if (account) { // Hanya fetch jika account sudah ada
        setLoading(true); // Set loading saat mulai fetch data awal
        await fetchDokterList();
        await fetchPasienList();
        setLoading(false); // Selesai loading setelah data awal ter-fetch
      }
    }
    fetchInitialData();
    // eslint-disable-next-line
  }, [account]); // Re-fetch jika akun berubah

  useEffect(() => {
    // Panggil fetchAssignedPairs setelah dokterList dan listPasien diperbarui dan ada isinya
    if (dokterList.length > 0 && listPasien.length > 0) {
      fetchAssignedPairs();
    }
    // eslint-disable-next-line
  }, [dokterList, listPasien]); // Dependensi ke dokterList dan listPasien

  const registerDokter = async () => {
    if (!dokterAddress || !dokterNama || !dokterSpesialisasi || !dokterNomorLisensi) {
      alert("Semua data dokter harus diisi.");
      return;
    }
    try {
      setLoading(true);
      await contract.methods
        .registerDokter(dokterAddress, dokterNama, dokterSpesialisasi, dokterNomorLisensi)
        .send({ from: account });
      alert("Dokter berhasil didaftarkan.");
      setDokterAddress("");
      setDokterNama("");
      setDokterSpesialisasi("");
      setDokterNomorLisensi("");
      await fetchDokterList(); // Refresh list
    } catch (err) {
      console.error("Gagal mendaftarkan dokter:", err);
      const errorMessage = err.message.includes("revert")
        ? err.message.substring(err.message.indexOf("revert") + "revert".length).trim()
        : "Gagal mendaftarkan dokter. Cek konsol untuk detail.";
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const toggleStatusDokter = async (addr, cur) => {
    try {
      setLoading(true);
      await contract.methods.setStatusDokter(addr, !cur).send({ from: account });
      alert("Status dokter diperbarui.");
      await fetchDokterList(); // Refresh list
    } catch (err) {
      console.error("Gagal update status dokter:", err);
      const errorMessage = err.message.includes("revert")
        ? err.message.substring(err.message.indexOf("revert") + "revert".length).trim()
        : "Gagal update status dokter. Cek konsol untuk detail.";
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Fungsi untuk UPDATE INFO DOKTER
  const updateDokterInfo = async (address, nama, spesialisasi, nomorLisensi) => {
    if (!address || !nama || !spesialisasi || !nomorLisensi) {
      alert("Semua data dokter untuk pembaruan harus diisi.");
      return;
    }
    try {
      setLoading(true);
      await contract.methods
        .updateDokterInfo(address, nama, spesialisasi, nomorLisensi)
        .send({ from: account });
      alert("Informasi dokter berhasil diperbarui.");
      await fetchDokterList(); // Refresh list setelah update
    } catch (err) {
      console.error("Gagal memperbarui informasi dokter:", err);
      const errorMessage = err.message.includes("revert")
        ? err.message.substring(err.message.indexOf("revert") + "revert".length).trim()
        : "Gagal memperbarui informasi dokter. Cek konsol untuk detail.";
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };


  const assignPasien = async () => {
    if (!selectedDokter || !pasienAddress) {
      alert("Pilih dokter dan masukkan alamat pasien.");
      return;
    }
    try {
      setLoading(true);
      await contract.methods.assignPasienToDokter(selectedDokter, pasienAddress).send({ from: account });
      alert("Pasien berhasil diassign ke dokter.");
      setPasienAddress(""); // Reset field
      setSelectedDokter(""); // Reset field
      // Refresh kedua list karena assignedPasien di dokter mungkin berubah
      await fetchDokterList(); 
      await fetchPasienList(); // Jika ada info pasien yang perlu diupdate setelah assign (opsional)
                               // atau cukup fetchAssignedPairs() jika hanya UI pairing yg berubah
      await fetchAssignedPairs(); // Langsung update UI pairing
    } catch (err) {
      console.error("Gagal assign pasien:", err);
      const errorMessage = err.message.includes("revert")
        ? err.message.substring(err.message.indexOf("revert") + "revert".length).trim()
        : "Gagal assign pasien. Cek konsol untuk detail.";
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-row min-h-screen w-full">
      <AdminSideBar
        activePage={activePage}
        setActivePage={setActivePage}
        onLogout={onLogout}
        namaRumahSakit={namaRumahSakit}
      />
      <div className="flex-1 p-12 bg-white shadow-inner overflow-y-auto transition-all duration-300 sm:p-8 xs:p-6">
        <h2
          className="mb-8 text-4xl font-bold text-gray-800 tracking-tight relative animate-fadeIn sm:text-3xl xs:text-2xl
            after:content-[''] after:absolute after:bottom-[-10px] after:left-0 after:w-20 after:h-1 after:bg-blue-500 after:rounded"
        >
          {/* Dinamiskan judul berdasarkan activePage atau biarkan Admin Panel */}
          {activePage === "manageDokter" && "Manajemen Dokter"}
          {activePage === "managePasien" && "Manajemen Pasien"}
          {activePage === "manageAssign" && "Assign Pasien ke Dokter"}
          {!["manageDokter", "managePasien", "manageAssign"].includes(activePage) && "Admin Panel"}
        </h2>

        {activePage === "manageDokter" && (
          <ManageDokterPage
            dokterList={dokterList}
            dokterAddress={dokterAddress}
            dokterNama={dokterNama}
            dokterSpesialisasi={dokterSpesialisasi}
            dokterNomorLisensi={dokterNomorLisensi}
            loading={loading}
            setDokterAddress={setDokterAddress}
            setDokterNama={setDokterNama}
            setDokterSpesialisasi={setDokterSpesialisasi}
            setDokterNomorLisensi={setDokterNomorLisensi}
            registerDokter={registerDokter}
            toggleStatusDokter={toggleStatusDokter}
            updateDokterInfo={updateDokterInfo} // <--- TAMBAHKAN PROP INI
          />
        )}
        {activePage === "managePasien" && (
          <ManagePasienPage 
            loading={loading} 
            listPasien={listPasien} 
            // Jika ada fungsi terkait pasien yang perlu di-pass dari AdminPage, tambahkan di sini
          />
        )}
        {activePage === "manageAssign" && (
          <ManageAssign
            dokterList={dokterList.filter(d => d.aktif)} // Hanya dokter aktif yang bisa di-assign
            listPasien={listPasien}
            selectedDokter={selectedDokter}
            setSelectedDokter={setSelectedDokter}
            pasienAddress={pasienAddress}
            setPasienAddress={setPasienAddress}
            assignPasien={assignPasien}
            loading={loading}
            assignedPairs={assignedPairs}
          />
        )}
      </div>
    </div>
  );
}