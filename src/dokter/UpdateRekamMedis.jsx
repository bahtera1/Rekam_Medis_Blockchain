// UpdateRekamMedis.jsx
import React, { useState } from "react";
import contract from "../contract";
import "./DokterPage.css";

export default function UpdateRekamMedis({ account, assignedPatients }) {
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
        try {
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
        } catch (error) {
            console.error("Gagal mengambil rekam medis:", error);
            alert("Gagal mengambil data rekam medis.");
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

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
        <>
            <h2>Update Rekam Medis</h2>
            <label>Pilih Pasien:</label>
            <select
                value={selectedPatient}
                onChange={(e) => {
                    setSelectedPatient(e.target.value);
                    fetchRekamMedis(e.target.value);
                }}
            >
                <option value="">-- Pilih Pasien --</option>
                {/* Pastikan assignedPatients adalah array */}
                {(Array.isArray(assignedPatients) ? assignedPatients : []).map((p) => (
                    <option key={p} value={p}>
                        {p}
                    </option>
                ))}
            </select>

            {rekamMedisId && (
                <div className="form-container">
                    <input name="nama" value={formData.nama} onChange={handleChange} placeholder="Nama" />
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
                    <input name="gender" value={formData.gender} onChange={handleChange} placeholder="Gender" />
                    <input name="alamat" value={formData.alamat} onChange={handleChange} placeholder="Alamat" />
                    <input
                        name="noTelepon"
                        value={formData.noTelepon}
                        onChange={handleChange}
                        placeholder="No Telepon"
                    />
                    <input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="Email" />
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
                    <button onClick={submitUpdate}>Update Rekam Medis</button>
                </div>
            )}
        </>
    );
}
