import React, { useState, useEffect } from "react";
import contract from "../contract";

export default function UpdateRekamMedis({ account, assignedPatients }) {
    const [editingPatient, setEditingPatient] = useState(null);
    const [rekamMedisId, setRekamMedisId] = useState(null);
    const [pasienData, setPasienData] = useState(null);
    const [formData, setFormData] = useState({
        diagnosa: "",
        foto: "",
        catatan: "",
    });

    // Load data pasien dan rekam medis terbaru saat mulai edit pasien
    const loadPatientAndRekam = async (pasienAddress) => {
        if (!pasienAddress) return;

        try {
            // Ambil data pasien (read-only)
            const pData = await contract.methods.getPasienData(pasienAddress).call();
            setPasienData({
                nama: pData[0],
                umur: pData[1],
                golonganDarah: pData[2],
                tanggalLahir: pData[3],
                gender: pData[4],
                alamat: pData[5],
                noTelepon: pData[6],
                email: pData[7],
            });

            // Ambil rekam medis terbaru pasien
            const ids = await contract.methods.getRekamMedisIdsByPasien(pasienAddress).call();
            if (ids.length === 0) {
                setRekamMedisId(null);
                setFormData({ diagnosa: "", foto: "", catatan: "" });
            } else {
                const id = ids[ids.length - 1]; // rekam medis terbaru
                setRekamMedisId(id);
                const rekam = await contract.methods.getRekamMedis(id).call();
                setFormData({
                    diagnosa: rekam.diagnosa,
                    foto: rekam.foto,
                    catatan: rekam.catatan,
                });
            }
        } catch (err) {
            console.error("Gagal load data pasien atau rekam medis:", err);
            alert("Gagal mengambil data pasien atau rekam medis.");
        }
    };

    // Saat mulai edit pasien
    const handleEditClick = (pasienAddress) => {
        setEditingPatient(pasienAddress);
        loadPatientAndRekam(pasienAddress);
    };

    const handleCancel = () => {
        setEditingPatient(null);
        setRekamMedisId(null);
        setPasienData(null);
        setFormData({ diagnosa: "", foto: "", catatan: "" });
    };

    const handleChange = (e) => {
        setFormData((f) => ({ ...f, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async () => {
        if (!editingPatient) return;

        try {
            if (rekamMedisId === null) {
                // Tambah rekam medis baru
                await contract.methods
                    .tambahRekamMedis(editingPatient, formData.diagnosa, formData.foto, formData.catatan)
                    .send({ from: account });
                alert("Rekam medis berhasil ditambahkan.");
            } else {
                // Update rekam medis yang sudah ada
                await contract.methods
                    .updateRekamMedis(rekamMedisId, formData.diagnosa, formData.foto, formData.catatan)
                    .send({ from: account });
                alert("Rekam medis berhasil diperbarui.");
            }

            // Kembali ke daftar pasien setelah berhasil simpan
            handleCancel();
        } catch (err) {
            console.error("Gagal simpan rekam medis:", err);
            alert("Gagal menyimpan rekam medis.");
        }
    };

    return (
        <div>
            {!editingPatient ? (
                <>
                    <h2>Daftar Pasien</h2>
                    {assignedPatients.length === 0 ? (
                        <p>Belum ada pasien yang diassign.</p>
                    ) : (
                        <table border="1" cellPadding="5" style={{ width: "100%", borderCollapse: "collapse" }}>
                            <thead style={{ backgroundColor: "#3182ce", color: "white" }}>
                                <tr>
                                    <th>No.</th>
                                    <th>Alamat Pasien</th>
                                    <th>Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {assignedPatients.map((pasienAddr, idx) => (
                                    <tr key={pasienAddr}>
                                        <td style={{ textAlign: "center" }}>{idx + 1}</td>
                                        <td>{pasienAddr}</td>
                                        <td>
                                            <button onClick={() => handleEditClick(pasienAddr)}>Update Data Pasien</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </>
            ) : (
                <>
                    <h2>Update Rekam Medis Pasien</h2>
                    <p><strong>Alamat Pasien:</strong> {editingPatient}</p>

                    {pasienData && (
                        <div style={{ marginBottom: 20, border: "1px solid #ccc", padding: 10, borderRadius: 4 }}>
                            <h3>Data Pasien (Informasi)</h3>
                            <p><strong>Nama:</strong> {pasienData.nama}</p>
                            <p><strong>Umur:</strong> {pasienData.umur}</p>
                            <p><strong>Golongan Darah:</strong> {pasienData.golonganDarah}</p>
                            <p><strong>Tanggal Lahir:</strong> {pasienData.tanggalLahir}</p>
                            <p><strong>Gender:</strong> {pasienData.gender}</p>
                            <p><strong>Alamat:</strong> {pasienData.alamat}</p>
                            <p><strong>No Telepon:</strong> {pasienData.noTelepon}</p>
                            <p><strong>Email:</strong> {pasienData.email}</p>
                        </div>
                    )}

                    <div style={{ marginBottom: "1rem" }}>
                        <label>Diagnosa:</label>
                        <input
                            type="text"
                            name="diagnosa"
                            value={formData.diagnosa}
                            onChange={handleChange}
                            style={{ width: "100%" }}
                        />
                    </div>

                    <div style={{ marginBottom: "1rem" }}>
                        <label>Foto (URL atau hash):</label>
                        <input
                            type="text"
                            name="foto"
                            value={formData.foto}
                            onChange={handleChange}
                            style={{ width: "100%" }}
                        />
                    </div>

                    <div style={{ marginBottom: "1rem" }}>
                        <label>Catatan:</label>
                        <textarea
                            name="catatan"
                            value={formData.catatan}
                            onChange={handleChange}
                            rows={4}
                            style={{ width: "100%" }}
                        />
                    </div>

                    <button onClick={handleSubmit} style={{ marginRight: 10 }}>
                        Simpan
                    </button>
                    <button onClick={handleCancel}>Batal</button>
                </>
            )}
        </div>
    );
}
