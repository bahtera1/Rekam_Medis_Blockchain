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

  const [pasienAddress, setPasienAddress] = useState("");
  const [pasienNama, setPasienNama] = useState("");
  const [listPasien, setListPasien] = useState([]);

  const [selectedDokter, setSelectedDokter] = useState("");
  const [loading, setLoading] = useState(false);
  const [assignedPairs, setAssignedPairs] = useState([]);
  const [activePage, setActivePage] = useState("manageDokter");

  // Ambil daftar dokter dari blockchain
  const fetchDokterList = async () => {
    try {
      const total = await contract.methods.totalDokter().call();
      const list = [];
      for (let i = 0; i < total; i++) {
        const addr = await contract.methods.getDokterByIndex(i).call();
        const result = await contract.methods.getDokter(addr).call();
        list.push({
          address: addr,
          nama: result[0],
          spesialisasi: result[1],
          nomorLisensi: result[2],
          aktif: result[3],
        });
      }
      setDokterList(list);
      fetchAssignedPairs(list);
    } catch (err) {
      console.error("Gagal ambil daftar dokter:", err);
      alert("Gagal ambil daftar dokter.");
    }
  };

  // Ambil daftar pasien lengkap dengan nama dari rekam medis pertama
  const fetchPasienList = async () => {
    try {
      const pasienArray = await contract.methods.getDaftarPasien().call();
      const list = [];
      for (const addr of pasienArray) {
        const ids = await contract.methods.getRekamMedisIdsByPasien(addr).call();
        let nama = "-";
        if (ids.length > 0) {
          const rekam = await contract.methods.rekamMedis(ids[0]).call();
          nama = rekam.nama;
        }
        list.push({ address: addr, nama });
      }
      setListPasien(list);
    } catch (err) {
      console.error("Gagal ambil daftar pasien:", err);
      alert("Gagal ambil daftar pasien.");
    }
  };

  // Ambil pasangan dokter-pasien
  const fetchAssignedPairs = async (dokterList) => {
    try {
      let pairs = [];
      for (const dokter of dokterList) {
        const pasienList = await contract.methods.getAssignedPasienByDokter(dokter.address).call();
        pasienList.forEach((pasien) => {
          pairs.push({
            dokterNama: dokter.nama,
            dokterAddress: dokter.address,
            pasienAddress: pasien,
          });
        });
      }
      setAssignedPairs(pairs);
    } catch (err) {
      console.error("Gagal ambil pasangan dokter-pasien:", err);
    }
  };

  useEffect(() => {
    fetchDokterList();
    fetchPasienList();
  }, []);

  // Daftarkan dokter baru dengan tambahan spesialisasi dan nomor lisensi
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
      alert("Dokter gagal didaftarkan.");
    } finally {
      setLoading(false);
    }
  };

  // Daftarkan pasien baru sekaligus tambah rekam medis awal (nama saja)
  const registerPasien = async () => {
    if (!pasienAddress || !pasienNama) {
      alert("Alamat dan nama pasien harus diisi.");
      return;
    }
    try {
      setLoading(true);
      await contract.methods.registerPasien(pasienAddress).send({ from: account });
      await contract.methods
        .tambahRekamMedis(
          pasienAddress,
          pasienNama,
          0,
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          ""
        )
        .send({ from: account });
      alert("Pasien berhasil didaftarkan dan data rekam medis awal tersimpan.");
      setPasienAddress("");
      setPasienNama("");
      await fetchPasienList();
    } catch (err) {
      console.error("Gagal mendaftarkan pasien dan simpan data rekam medis:", err);
      alert("Gagal mendaftarkan pasien dan simpan data rekam medis.");
    } finally {
      setLoading(false);
    }
  };

  // Toggle status dokter aktif/nonaktif
  const toggleStatusDokter = async (address, currentStatus) => {
    try {
      setLoading(true);
      await contract.methods.setStatusDokter(address, !currentStatus).send({ from: account });
      alert("Status dokter diperbarui.");
      await fetchDokterList();
    } catch (err) {
      console.error("Gagal update status dokter:", err);
      alert("Gagal update status dokter.");
    } finally {
      setLoading(false);
    }
  };

  // Assign pasien ke dokter (tidak diubah)
  const assignPasien = async () => {
    if (!selectedDokter || !pasienAddress) {
      alert("Pilih dokter dan masukkan alamat pasien.");
      return;
    }
    try {
      setLoading(true);
      await contract.methods.assignPasienToDokter(selectedDokter, pasienAddress).send({ from: account });
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
            pasienAddress={pasienAddress}
            setPasienAddress={setPasienAddress}
            pasienNama={pasienNama}
            setPasienNama={setPasienNama}
            registerPasien={registerPasien}
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
