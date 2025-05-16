// src/dokter/DokterPage.jsx
import React, { useState, useEffect } from "react";
import web3 from "../web3";
import contract from "../contract";

export default function DokterPage() {
    const [account, setAccount] = useState("");
    const [assignedPatients, setAssignedPatients] = useState([]);
    const [selectedPatient, setSelectedPatient] = useState("");
    const [rekamMedisId, setRekamMedisId] = useState(null);
    const [formData, setFormData] = useState({
        nama: "",
        umur: "",
        golonganDarah: "",
        tanggalLahir: "",
        gender: "",
        alamat: "",
        noTelepon: "",
        email: "",
        diagnosa: "",
        foto: "",
        catatan: "",
    });

    useEffect(() => {
        async function fetchData() {
            const accounts = await web3.eth.getAccounts();
            setAccount(accounts[0]);

            // Ambil data dokter (nama, status, daftar pasien)
            const dokterData = await contract.methods.getDokter(accounts[0]).call();
            // dokterData[2] adalah array alamat pasien yang diassign
            setAssignedPatients(dokterData[2]);
        }
        fetchData();
    }, []);

    // Ambil rekam medis pasien saat pasien dipilih
    const fetchRekamMedis = async (pasienAddress) => {
        if (!pasienAddress) {
            setRekamMedisId(null);
            setFormData({
                nama: "",
                umur: "",
                golonganDarah: "",
                tanggalLahir: "",
                gender: "",
                alamat: "",
                noTelepon: "",
                email: "",
                diagnosa: "",
                foto: "",
                catatan: "",
            });
            return;
        }

        const ids = await contract.methods.getRekamMedisIdsByPasien(pasienAddress).call();
        if (ids.length === 0) {
            alert("Pasien belum memiliki rekam medis.");
            setRekamMedisId(null);
            return;
        }

        setRekamMedisId(ids[0]);
        const rekam = await contract.methods.rekamMedis(ids[0]).call();

        setFormData({
            nama: rekam.nama,
            umur: rekam.umur,
            golonganDarah: rekam.golonganDarah,
            tanggalLahir: rekam.tanggalLahir,
            gender: rekam.gender,
            alamat: rekam.alamat,
            noTelepon: rekam.noTelepon,
            email: rekam.email,
            diagnosa: rekam.diagnosa,
            foto: rekam.foto,
            catatan: rekam.catatan,
        });
    };

    // Update form field
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Kirim update rekam medis ke smart contract
    const submitUpdate = async () => {
        if (!rekamMedisId) {
            alert("Pilih pasien dengan rekam medis yang valid.");
            return;
        }
        try {
            await contract.methods
                .updateRekamMedis(
                    rekamMedisId,
                    formData.nama,
                    parseInt(formData.umur),
                    formData.golonganDarah,
                    formData.tanggalLahir,
                    formData.gender,
                    formData.alamat,
                    formData.noTelepon,
                    formData.email,
                    formData.diagnosa,
                    formData.foto,
                    formData.catatan
                )
                .send({ from: account });
            alert("Rekam medis berhasil diperbarui.");
        } catch (err) {
            console.error("Gagal update rekam medis:", err);
            alert("Gagal update data rekam medis.");
        }
    };

    return (
        <div>
            <h2>Dokter - Update Rekam Medis</h2>

            <label>Pilih Pasien:</label>
            <select
                value={selectedPatient}
                onChange={(e) => {
                    setSelectedPatient(e.target.value);
                    fetchRekamMedis(e.target.value);
                }}
            >
                <option value="">-- Pilih Pasien --</option>
                {assignedPatients.map((p) => (
                    <option key={p} value={p}>
                        {p}
                    </option>
                ))}
            </select>

            {rekamMedisId && (
                <div style={{ marginTop: "20px" }}>
                    <h3>Data Rekam Medis Pasien</h3>

                    <input
                        name="nama"
                        value={formData.nama}
                        onChange={handleChange}
                        placeholder="Nama"
                    />
                    <input
                        name="umur"
                        type="number"
                        value={formData.umur}
                        onChange={handleChange}
                        placeholder="Umur"
                    />
                    <input
                        name="golonganDarah"
                        value={formData.golonganDarah}
                        onChange={handleChange}
                        placeholder="Golongan Darah"
                    />
                    <input
                        name="tanggalLahir"
                        type="date"
                        value={formData.tanggalLahir}
                        onChange={handleChange}
                        placeholder="Tanggal Lahir"
                    />
                    <input
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        placeholder="Gender"
                    />
                    <input
                        name="alamat"
                        value={formData.alamat}
                        onChange={handleChange}
                        placeholder="Alamat"
                    />
                    <input
                        name="noTelepon"
                        value={formData.noTelepon}
                        onChange={handleChange}
                        placeholder="No Telepon"
                    />
                    <input
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Email"
                    />
                    <input
                        name="diagnosa"
                        value={formData.diagnosa}
                        onChange={handleChange}
                        placeholder="Diagnosa"
                    />
                    <input
                        name="foto"
                        value={formData.foto}
                        onChange={handleChange}
                        placeholder="Foto (URL atau hash)"
                    />
                    <textarea
                        name="catatan"
                        value={formData.catatan}
                        onChange={handleChange}
                        placeholder="Catatan"
                    />
                    <br />
                    <button onClick={submitUpdate}>Update Rekam Medis</button>
                </div>
            )}
        </div>
    );
}
