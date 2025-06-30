import React, { useState, useEffect, useCallback } from "react";
import contract from "../contract";
import web3 from "../web3"; // Tambahkan import web3
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
  const [listPasien, setListPasien] = useState([]); // Pastikan listPasien diinisialisasi sebagai array kosong
  const [selectedDokter, setSelectedDokter] = useState("");
  const [assignedPairs, setAssignedPairs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activePage, setActivePage] = useState("manageDokter"); // Default aktif di Manajemen Dokter
  const [namaRumahSakit, setNamaRumahSakit] = useState("");

  // Memoize fetch functions with useCallback for better performance and dependency management
  const fetchNamaRS = useCallback(async () => {
    try {
      const adminData = await contract.methods.dataAdmin(account).call();
      if (adminData && adminData.namaRumahSakit) {
        setNamaRumahSakit(adminData.namaRumahSakit);
      } else {
        setNamaRumahSakit("");
      }
    } catch (err) {
      console.error("Gagal mengambil nama RS:", err); // Teks disesuaikan
      setNamaRumahSakit("");
    }
  }, [account]);

  const fetchDokterList = useCallback(async () => {
    try {
      const total = await contract.methods.totalDokter().call();
      const list = [];
      for (let i = 0; i < total; i++) {
        const addr = await contract.methods.getDokterByIndex(i).call();
        // getDokter mengembalikan: nama, spesialisasi, nomorLisensi, aktif, pasienList, adminRS
        const result = await contract.methods.getDokter(addr).call();
        if (result[5] === account) {
          // result[5] adalah adminRS
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
      console.error("Gagal mengambil daftar dokter:", err); // Teks disesuaikan
    }
  }, [account]); // Depend on 'account' because it's used in the filter

  const fetchPasienList = useCallback(async () => {
    try {
      const pasienArray = await contract.methods.getDaftarPasien().call();
      const list = [];
      const zeroAddress = "0x0000000000000000000000000000000000000000";

      for (const addr of pasienArray) {
        // getPasienData mengembalikan: nama (0), ID (1), golonganDarah (2), tanggalLahir (3), gender (4),
        // alamat (5), noTelepon (6), email (7), rumahSakitPenanggungJawab (8)
        const data = await contract.methods.getPasienData(addr).call();

        // data[8] adalah rumahSakitPenanggungJawab (karena ID ditambahkan di indeks 1)
        // Hanya tampilkan pasien yang menjadi tanggung jawab RS ini ATAU pasien yang belum di-assign RS (address(0))
        if (data[8] === account || data[8] === zeroAddress) {
          list.push({
            address: addr,
            nama: data[0],
            ID: data[1], // <--- Ambil ID pasien dari indeks 1
          });
        }
      }
      setListPasien(list);
    } catch (err) {
      console.error("Gagal mengambil daftar pasien:", err); // Teks disesuaikan
    }
  }, [account]); // Depend on 'account' because it's used in the filter

  const fetchAssignedPairs = useCallback(async () => {
    // Hanya ambil jika dokterList dan listPasien sudah terisi
    if (dokterList.length === 0 || listPasien.length === 0) {
      return;
    }
    try {
      const pairs = dokterList
        .filter(
          (dok) =>
            dok.adminRS === account &&
            dok.assignedPasien &&
            dok.assignedPasien.length > 0
        )
        .map((dok) => ({
          dokterNama: dok.nama,
          dokterLisensi: dok.nomorLisensi,
          dokterAddress: dok.address,
          pasienList: dok.assignedPasien.map((addr) => {
            const pasienData = listPasien.find((p) => p.address === addr);
            return {
              nama: pasienData ? pasienData.nama : "Data Pasien Tidak Ditemukan", // Teks disesuaikan
              address: addr,
              ID: pasienData ? pasienData.ID : "-", // <--- Tambahkan ID pasien di sini
            };
          }),
        }));
      setAssignedPairs(pairs);
    } catch (err) {
      console.error("Gagal mengambil pairing dokter-pasien:", err); // Teks disesuaikan
    }
  }, [dokterList, listPasien, account]); // Depend on all values used in the function

  // Initial data fetch on component mount or account change
  useEffect(() => {
    async function fetchAllInitialData() {
      if (account) {
        setLoading(true);
        await fetchNamaRS(); // Ambil nama RS terlebih dahulu
        await fetchDokterList(); // Ambil daftar dokter
        await fetchPasienList(); // Ambil daftar pasien
        setLoading(false);
      }
    }
    fetchAllInitialData();
  }, [account, fetchNamaRS, fetchDokterList, fetchPasienList]); // Depend on account and memoized fetch functions

  // Effect to re-fetch assigned pairs when dokterList or listPasien change
  useEffect(() => {
    if (dokterList.length > 0 && listPasien.length > 0) {
      fetchAssignedPairs();
    }
  }, [dokterList, listPasien, fetchAssignedPairs]); // Depend on memoized fetchAssignedPairs

  const registerDokter = async () => {
    if (
      !dokterAddress ||
      !dokterNama ||
      !dokterSpesialisasi ||
      !dokterNomorLisensi
    ) {
      alert("Semua data dokter harus diisi."); // Teks disesuaikan
      return;
    }
    try {
      setLoading(true);
      await contract.methods
        .registerDokter(dokterAddress, dokterNama, dokterSpesialisasi, dokterNomorLisensi)
        .send({ from: account });
      alert("Dokter berhasil didaftarkan."); // Teks disesuaikan
      setDokterAddress("");
      setDokterNama("");
      setDokterSpesialisasi("");
      setDokterNomorLisensi("");
      await fetchDokterList(); // Refresh list
      await fetchPasienList(); // Refresh daftar pasien juga jika ada opsi penugasan baru
    } catch (err) {
      console.error("Gagal mendaftarkan dokter:", err); // Teks disesuaikan
      const errorMessage = err.message.includes("revert")
        ? err.message.substring(err.message.indexOf("revert") + "revert".length).trim()
        : "Gagal mendaftarkan dokter. Cek konsol untuk detail."; // Teks disesuaikan
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const toggleStatusDokter = async (addr, cur) => {
    try {
      setLoading(true);
      await contract.methods.setStatusDokter(addr, !cur).send({ from: account });
      alert("Status dokter diperbarui."); // Teks disesuaikan
      await fetchDokterList(); // Refresh list
      await fetchPasienList(); // Refresh daftar pasien juga
    } catch (err) {
      console.error("Gagal memperbarui status dokter:", err); // Teks disesuaikan
      const errorMessage = err.message.includes("revert")
        ? err.message.substring(err.message.indexOf("revert") + "revert".length).trim()
        : "Gagal memperbarui status dokter. Cek konsol untuk detail."; // Teks disesuaikan
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updateDokterInfo = async (address, nama, spesialisasi, nomorLisensi) => {
    if (!address || !nama || !spesialisasi || !nomorLisensi) {
      alert("Semua data dokter untuk pembaruan harus diisi."); // Teks disesuaikan
      return;
    }
    try {
      setLoading(true);
      await contract.methods
        .updateDokterInfo(address, nama, spesialisasi, nomorLisensi)
        .send({ from: account });
      alert("Informasi dokter berhasil diperbarui."); // Teks disesuaikan
      await fetchDokterList(); // Refresh list setelah update
      await fetchPasienList(); // Refresh daftar pasien juga
    } catch (err) {
      console.error("Gagal memperbarui informasi dokter:", err); // Teks disesuaikan
      const errorMessage = err.message.includes("revert")
        ? err.message.substring(err.message.indexOf("revert") + "revert".length).trim()
        : "Gagal memperbarui informasi dokter. Cek konsol untuk detail."; // Teks disesuaikan
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const assignPasien = async () => {
    if (!selectedDokter || !pasienAddress) {
      alert("Pilih dokter dan pasien."); // Teks disesuaikan
      return;
    }
    try {
      setLoading(true);
      await contract.methods.assignPasienToDokter(selectedDokter, pasienAddress).send({ from: account });
      alert("Pasien berhasil ditugaskan ke dokter."); // Teks disesuaikan
      setPasienAddress(""); // Reset field
      setSelectedDokter(""); // Reset field
      await fetchDokterList(); // Refresh daftar dokter (karena assignedPasien berubah)
      await fetchPasienList(); // Refresh daftar pasien (opsional, jika ada update info pasien terkait assign)
    } catch (err) {
      console.error("Gagal menugaskan pasien:", err); // Teks disesuaikan
      const errorMessage = err.message.includes("revert")
        ? err.message.substring(err.message.indexOf("revert") + "revert".length).trim()
        : "Gagal menugaskan pasien. Cek konsol untuk detail."; // Teks disesuaikan
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const unassignPasien = async (_dokterAddress, _pasienAddress) => {
    try {
      setLoading(true);
      const [from] = await web3.eth.getAccounts();
      await contract.methods.unassignPasienFromDokter(_dokterAddress, _pasienAddress).send({ from: from });
      alert("Pasien berhasil dibatalkan penugasannya dari dokter."); // Teks disesuaikan
      await fetchDokterList();
      await fetchPasienList();
    } catch (error) {
      console.error("Gagal membatalkan penugasan pasien:", error); // Teks disesuaikan
      const errorMessage = error.message.includes("revert")
        ? error.message.substring(error.message.indexOf("revert") + "revert".length).trim()
        : "Gagal membatalkan penugasan pasien. Cek konsol untuk detail."; // Teks disesuaikan
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
          {activePage === "manageDokter" && "Manajemen Dokter"}
          {activePage === "managePasien" && "Manajemen Pasien"}
          {activePage === "manageAssign" && "Penugasan Dokter - Pasien"}
          {!["manageDokter", "managePasien", "manageAssign"].includes(activePage) && "Panel Admin"}
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
            updateDokterInfo={updateDokterInfo}
          />
        )}
        {activePage === "managePasien" && (
          <ManagePasienPage
            loading={loading}
            listPasien={listPasien}
          />
        )}
        {activePage === "manageAssign" && (
          <ManageAssign
            dokterList={dokterList.filter(d => d.aktif)}
            listPasien={listPasien}
            selectedDokter={selectedDokter}
            setSelectedDokter={setSelectedDokter}
            pasienAddress={pasienAddress}
            setPasienAddress={setPasienAddress}
            assignPasien={assignPasien}
            unassignPasien={unassignPasien}
            loading={loading}
            assignedPairs={assignedPairs}
          />
        )}
      </div>
    </div>
  );
}