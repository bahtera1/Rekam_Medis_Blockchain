import React, { useState, useEffect } from "react";
import contract from "../contract";
import ManageDokterPage from "./ManageDokterPage";
import ManagePasienPage from "./ManagePasienPage";
import ManageAssign from "./ManageAssign";
import AdminSideBar from "./AdminSideBar";
import "./AdminPage.css";

export default function AdminPage({ account, onLogout }) {
  const [dokterAddress, setDokterAddress] = useState("");
  const [dokterNama, setDokterNama] = useState("");
  const [dokterSpesialisasi, setDokterSpesialisasi] = useState("");
  const [dokterNomorLisensi, setDokterNomorLisensi] = useState("");
  const [dokterList, setDokterList] = useState([]);

  // Masih kita simpan pasienAddress untuk ManageAssign
  const [pasienAddress, setPasienAddress] = useState("");
  const [listPasien, setListPasien] = useState([]);

  const [selectedDokter, setSelectedDokter] = useState("");
  const [assignedPairs, setAssignedPairs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activePage, setActivePage] = useState("manageDokter");

  // --- Fetch Dokter ---
  const fetchDokterList = async () => {
    try {
      const total = await contract.methods.totalDokter().call();
      const list = [];
      for (let i = 0; i < total; i++) {
        const addr = await contract.methods.getDokterByIndex(i).call();
        const result = await contract.methods.getDokter(addr).call();
        // getDokter returns [nama, spesialisasi, nomorLisensi, aktif, assignedPasien]
        list.push({
          address: addr,
          nama: result[0],
          spesialisasi: result[1],
          nomorLisensi: result[2],
          aktif: result[3],
          assignedPasien: result[4],
        });
      }
      setDokterList(list);
      fetchAssignedPairs(list);
    } catch (err) {
      console.error("Gagal ambil daftar dokter:", err);
      alert("Gagal ambil daftar dokter.");
    }
  };

  // --- Fetch Pasien ---
  const fetchPasienList = async () => {
    try {
      const pasienArray = await contract.methods.getDaftarPasien().call();
      const list = [];
      for (const addr of pasienArray) {
        const data = await contract.methods.getPasienData(addr).call();
        // getPasienData returns [nama, umur, golDar, tglLhr, gender, alamat, telp, email]
        list.push({ address: addr, nama: data[0] });
      }
      setListPasien(list);
    } catch (err) {
      console.error("Gagal ambil daftar pasien:", err);
      alert("Gagal ambil daftar pasien.");
    }
  };

  // --- Fetch Pairing ---
  const fetchAssignedPairs = (dokterList) => {
    const pairs = [];
    dokterList.forEach((dok) => {
      dok.assignedPasien.forEach((pasien) => {
        pairs.push({
          dokterNama: dok.nama,
          dokterAddress: dok.address,
          pasienAddress: pasien,
        });
      });
    });
    setAssignedPairs(pairs);
  };

  useEffect(() => {
    fetchDokterList();
    fetchPasienList();
  }, []);

  // --- Register Dokter ---
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
      await fetchDokterList();
    } catch (err) {
      console.error("Gagal mendaftarkan dokter:", err);
      alert("Gagal mendaftarkan dokter.");
    } finally {
      setLoading(false);
    }
  };

  // --- Toggle Status Dokter ---
  const toggleStatusDokter = async (addr, cur) => {
    try {
      setLoading(true);
      await contract.methods.setStatusDokter(addr, !cur).send({ from: account });
      alert("Status dokter diperbarui.");
      await fetchDokterList();
    } catch (err) {
      console.error("Gagal update status dokter:", err);
      alert("Gagal update status dokter.");
    } finally {
      setLoading(false);
    }
  };

  // --- Assign Pasien ke Dokter ---
  const assignPasien = async () => {
    if (!selectedDokter || !pasienAddress) {
      alert("Pilih dokter dan masukkan alamat pasien.");
      return;
    }
    try {
      setLoading(true);
      await contract.methods
        .assignPasienToDokter(selectedDokter, pasienAddress)
        .send({ from: account });
      alert("Pasien berhasil diassign ke dokter.");
      setPasienAddress("");
      setSelectedDokter("");
      await fetchDokterList();
      await fetchPasienList();
    } catch (err) {
      console.error("Gagal assign pasien:", err);
      alert("Gagal assign pasien.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-container">
      <AdminSideBar activePage={activePage} setActivePage={setActivePage} onLogout={onLogout} />

      <div className="main-content">
        <h2>Admin Panel</h2>

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
            dokterList={dokterList}
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
