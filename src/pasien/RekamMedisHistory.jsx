import React, { useEffect, useState } from "react";
import contract from "../contract";

export default function RekamMedisHistory({ rekamMedisId }) {
    const [versions, setVersions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchVersions() {
            try {
                const versi = await contract.methods.getRekamMedisVersions(rekamMedisId).call();
                setVersions(versi);
            } catch (error) {
                console.error("Gagal ambil versi rekam medis:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchVersions();
    }, [rekamMedisId]);

    if (loading) return <p>Loading riwayat versi rekam medis...</p>;
    if (versions.length === 0) return <p>Tidak ada riwayat versi rekam medis.</p>;

    return (
        <div>
            <h3>Riwayat Versi Rekam Medis</h3>
            <table border="1" cellPadding="5" cellSpacing="0">
                <thead>
                    <tr>
                        <th>Versi</th>
                        <th>Nama</th>
                        <th>Umur</th>
                        <th>Gol. Darah</th>
                        <th>Tgl Lahir</th>
                        <th>Gender</th>
                        <th>Alamat</th>
                        <th>No Telepon</th>
                        <th>Email</th>
                        <th>Diagnosa</th>
                        <th>Catatan</th>
                    </tr>
                </thead>
                <tbody>
                    {versions.map((v, idx) => (
                        <tr key={idx}>
                            <td>{idx + 1}</td>
                            <td>{v.nama}</td>
                            <td>{v.umur}</td>
                            <td>{v.golonganDarah}</td>
                            <td>{v.tanggalLahir}</td>
                            <td>{v.gender}</td>
                            <td>{v.alamat}</td>
                            <td>{v.noTelepon}</td>
                            <td>{v.email}</td>
                            <td>{v.diagnosa}</td>
                            <td>{v.catatan}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
