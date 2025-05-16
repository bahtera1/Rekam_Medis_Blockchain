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
    const [dokterList, setDokterList] = useState([]);
    const [pasienAddress, setPasienAddress] = useState("");
    const [selectedDokter, setSelectedDokter] = useState("");
    const [loading, setLoading] = useState(false);
    const [listPasien, setListPasien] = useState([]);
    const [assignedPairs, setAssignedPairs] = useState([]);
    const [activePage, setActivePage] = useState("manageDokter"); // halaman aktif default

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
                    aktif: result[1],
                });
            }
            setDokterList(list);
            fetchAssignedPairs(list);
        } catch (err) {
            console.error("Gagal ambil daftar dokter:", err);
            alert("Gagal ambil daftar dokter.");
        }
    };

    const fetchPasienList = async () => {
        try {
            const pasienArray = await contract.methods.getDaftarPasien().call();
            setListPasien(pasienArray);
        } catch (err) {
            console.error("Gagal ambil daftar pasien:", err);
            alert("Gagal ambil daftar pasien.");
        }
    };

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
    const registerDokter = async () => {
        if (!dokterAddress || !dokterNama) {
            alert("Alamat dan nama dokter harus diisi.");
            return;
        }
        try {
            setLoading(true);
            await contract.methods.registerDokter(dokterAddress, dokterNama).send({ from: account });
            alert("Dokter berhasil didaftarkan.");
            setDokterAddress("");
            setDokterNama("");
            await fetchDokterList();
        } catch (err) {
            console.error("Gagal mendaftarkan dokter:", err);
            alert("Dokter gagal didaftarkan.");
        } finally {
            setLoading(false);
        }
    };

    const registerPasien = async () => {
        if (!pasienAddress) {
            alert("Alamat pasien harus diisi.");
            return;
        }
        try {
            setLoading(true);
            await contract.methods.registerPasien(pasienAddress).send({ from: account });
            alert("Pasien berhasil didaftarkan.");
            setPasienAddress("");
            await fetchPasienList();
        } catch (err) {
            console.error("Gagal mendaftarkan pasien:", err);
            alert("Pasien gagal didaftarkan.");
        } finally {
            setLoading(false);
        }
    };

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
                        loading={loading}
                        setDokterAddress={setDokterAddress}
                        setDokterNama={setDokterNama}
                        registerDokter={registerDokter}
                        toggleStatusDokter={toggleStatusDokter}
                    />
                )}

                {activePage === "managePasien" && (
                    <ManagePasienPage
                        pasienAddress={pasienAddress}
                        setPasienAddress={setPasienAddress}
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
