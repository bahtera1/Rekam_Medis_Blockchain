import React, { useState, useEffect } from "react";
import contract from "../contract";
import { uploadToPinata } from "../PinataUpload";

export default function DataPasien({ account, assignedPatients }) {
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [pasienData, setPasienData] = useState(null);
  const [rekamMedisHistory, setRekamMedisHistory] = useState([]); // Semua versi rekam medis lengkap
  const [updateHistories, setUpdateHistories] = useState({}); // { rekamMedisId: [{dokter, timestamp}, ...] }
  const [showModal, setShowModal] = useState(false);
  const [editingRM, setEditingRM] = useState(null);
  const [formData, setFormData] = useState({
    diagnosa: "",
    foto: "",
    catatan: "",
  });
  const [fotoFile, setFotoFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [patientInfos, setPatientInfos] = useState([]);
  const [search, setSearch] = useState("");
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Ambil data nama pasien untuk fitur search
  useEffect(() => {
    async function fetchInfos() {
      const infos = [];
      for (const addr of assignedPatients) {
        try {
          const p = await contract.methods.getPasienData(addr).call();
          infos.push({
            address: addr,
            nama: p[0] || "-",
          });
        } catch {
          infos.push({
            address: addr,
            nama: "-",
          });
        }
      }
      setPatientInfos(infos);
    }
    if (assignedPatients.length > 0) fetchInfos();
    else setPatientInfos([]);
  }, [assignedPatients]);

  // Ambil detail pasien dan seluruh versi rekam medis (history lengkap) + riwayat update dokter per rekam medis
  useEffect(() => {
    const fetchDataPasien = async () => {
      if (!selectedPatient) {
        setPasienData(null);
        setRekamMedisHistory([]);
        setUpdateHistories({});
        return;
      }

      setLoadingHistory(true);

      // Ambil data pasien
      const p = await contract.methods.getPasienData(selectedPatient).call();
      setPasienData({
        nama: p[0],
        umur: p[1],
        golonganDarah: p[2],
        tanggalLahir: p[3],
        gender: p[4],
        alamat: p[5],
        noTelepon: p[6],
        email: p[7],
      });

      // Ambil semua rekam medis ID pasien
      const ids = await contract.methods.getRekamMedisIdsByPasien(selectedPatient).call();

      let allVersions = [];
      let allUpdates = {};

      for (const id of ids) {
        // Ambil data rekam medis terbaru
        const latest = await contract.methods.getRekamMedis(id).call();
        const latestData = { ...latest, id };

        // Ambil semua versi (history) rekam medis
        const versions = await contract.methods.getRekamMedisVersions(id).call();

        // Format semua versi
        const formattedVersions = versions.map((v, idx) => ({
          id: v.id,
          diagnosa: v.diagnosa,
          foto: v.foto,
          catatan: v.catatan,
          valid: v.valid,
          versiKe: idx + 1,
        }));

        // Tambah versi terbaru sebagai versi terakhir
        formattedVersions.push({
          ...latestData,
          versiKe: formattedVersions.length + 1,
        });

        allVersions = allVersions.concat(formattedVersions);

        // Ambil riwayat update dokter & timestamp untuk rekam medis ini
        try {
          const [dokters, timestamps] = await contract.methods.getRekamMedisUpdateHistory(id).call();
          const updates = dokters.map((dokter, i) => ({
            dokter,
            timestamp: parseInt(timestamps[i], 10),
          }));
          allUpdates[id] = updates;
        } catch {
          allUpdates[id] = [];
        }
      }

      // Urutkan semua versi berdasarkan versiKe ascending
      allVersions.sort((a, b) => a.versiKe - b.versiKe);

      setRekamMedisHistory(allVersions);
      setUpdateHistories(allUpdates);

      setLoadingHistory(false);
    };

    if (selectedPatient) fetchDataPasien();
  }, [selectedPatient]);

  const openModal = () => {
    setFotoFile(null);
    if (rekamMedisHistory.length > 0) {
      // Ambil versi terbaru berdasarkan versiKe tertinggi
      const latest = rekamMedisHistory.reduce((prev, current) =>
        prev.versiKe > current.versiKe ? prev : current
      );
      setEditingRM(latest.id);
      setFormData({
        diagnosa: latest.diagnosa,
        foto: latest.foto,
        catatan: latest.catatan,
      });
    } else {
      setEditingRM(null);
      setFormData({
        diagnosa: "",
        foto: "",
        catatan: "",
      });
    }
    setShowModal(true);
  };

  const handleFotoUpload = async () => {
    if (fotoFile) {
      setUploading(true);
      try {
        const url = await uploadToPinata(fotoFile);
        setFormData((f) => ({ ...f, foto: url }));
        setUploading(false);
        return url;
      } catch (e) {
        setUploading(false);
        alert("Upload foto ke IPFS gagal.");
        throw e;
      }
    }
    return formData.foto;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let fotoUrl = formData.foto;
      if (fotoFile) {
        fotoUrl = await handleFotoUpload();
      }
      if (!selectedPatient) return;
      if (editingRM) {
        await contract.methods
          .updateRekamMedis(editingRM, formData.diagnosa, fotoUrl, formData.catatan)
          .send({ from: account });
        alert("Rekam medis berhasil diperbarui.");
      } else {
        await contract.methods
          .tambahRekamMedis(selectedPatient, formData.diagnosa, fotoUrl, formData.catatan)
          .send({ from: account });
        alert("Rekam medis berhasil ditambahkan.");
      }
      setShowModal(false);
      setSelectedPatient(null);
      setTimeout(() => setSelectedPatient(selectedPatient), 100);
    } catch (err) {
      alert("Gagal menyimpan rekam medis.");
    }
  };

  const filteredPatients = search
    ? patientInfos.filter(
        (p) =>
          (p.nama && p.nama.toLowerCase().includes(search.toLowerCase())) ||
          (p.address && p.address.toLowerCase().includes(search.toLowerCase()))
      )
    : patientInfos;

  // Format timestamp helper
  const formatTimestamp = (ts) => {
    if (!ts) return "-";
    const date = new Date(ts * 1000);
    return date.toLocaleString();
  };

  return (
    <div>
      {!selectedPatient ? (
        <>
          <h2 className="text-2xl font-bold mb-6 text-blue-700">Data Pasien</h2>
          <div className="flex items-center gap-2 mb-3">
            <div className="relative w-full max-w-xs">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <svg
                  width="20"
                  height="20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </span>
              <input
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                placeholder="Cari pasien berdasarkan nama atau alamat..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          {filteredPatients.length === 0 ? (
            <p className="italic text-gray-500">Tidak ada pasien yang sesuai.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white rounded-lg shadow">
                <thead>
                  <tr className="bg-blue-700 text-white">
                    <th className="px-3 py-2 text-center">No.</th>
                    <th className="px-3 py-2 text-left">Nama</th>
                    <th className="px-3 py-2 text-left">Alamat Wallet</th>
                    <th className="px-3 py-2 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPatients.map((p, idx) => (
                    <tr key={p.address} className="hover:bg-blue-50">
                      <td className="text-center px-3 py-2">{idx + 1}</td>
                      <td className="px-3 py-2">{p.nama}</td>
                      <td className="px-3 py-2">{p.address}</td>
                      <td className="px-3 py-2 text-center">
                        <button
                          onClick={() => setSelectedPatient(p.address)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition"
                        >
                          Lihat Data
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      ) : (
        <div>
          <button
            onClick={() => setSelectedPatient(null)}
            className="mb-4 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg font-medium"
          >
            ← Kembali ke Daftar Pasien
          </button>
          <h2 className="text-2xl font-bold mb-2 text-blue-700">Data Pasien</h2>
          {pasienData && (
            <div className="mb-6 p-4 border border-blue-300 rounded-md bg-slate-50">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-10">
                <p>
                  <span className="font-semibold">Nama:</span> {pasienData.nama}
                </p>
                <p>
                  <span className="font-semibold">Umur:</span> {pasienData.umur}
                </p>
                <p>
                  <span className="font-semibold">Golongan Darah:</span> {pasienData.golonganDarah}
                </p>
                <p>
                  <span className="font-semibold">Tanggal Lahir:</span> {pasienData.tanggalLahir}
                </p>
                <p>
                  <span className="font-semibold">Gender:</span> {pasienData.gender}
                </p>
                <p>
                  <span className="font-semibold">Alamat:</span> {pasienData.alamat}
                </p>
                <p>
                  <span className="font-semibold">No Telepon:</span> {pasienData.noTelepon}
                </p>
                <p>
                  <span className="font-semibold">Email:</span> {pasienData.email}
                </p>
              </div>
            </div>
          )}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-blue-600 text-lg">Riwayat Rekam Medis Lengkap</h3>
              <button
                onClick={openModal}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition"
              >
                Update Rekam Medis
              </button>
            </div>
            {loadingHistory ? (
              <p className="italic text-gray-500">Memuat riwayat rekam medis...</p>
            ) : rekamMedisHistory.length === 0 ? (
              <p className="italic text-gray-500">Belum ada rekam medis.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white rounded-md">
                  <thead>
                    <tr className="bg-blue-600 text-white">
                      <th className="px-2 py-2 text-left">Versi Ke-</th>
                      <th className="px-2 py-2 text-left">Diagnosa</th>
                      <th className="px-2 py-2 text-left">Foto</th>
                      <th className="px-2 py-2 text-left">Catatan</th>
                      <th className="px-2 py-2 text-center">Status</th>
                      <th className="px-2 py-2 text-left">Diubah Oleh Dokter</th>
                      <th className="px-2 py-2 text-left">Waktu Update</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rekamMedisHistory.map((rm, idx) => {
                      // Ambil riwayat update dokter untuk rekam medis id rm.id
                      const updates = updateHistories[rm.id] || [];

                      // Ambil data update sesuai versi (versiKe - 1) atau default null jika tidak ada
                      const updateInfo = updates[rm.versiKe - 1] || null;

                      return (
                        <tr key={`${rm.id}-${idx}`} className="hover:bg-blue-50">
                          <td className="px-2 py-2">{rm.versiKe}</td>
                          <td className="px-2 py-2">{rm.diagnosa}</td>
                          <td className="px-2 py-2">
                            {rm.foto ? (
                              <a
                                href={rm.foto}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 underline"
                              >
                                Lihat Foto
                              </a>
                            ) : (
                              <span className="italic text-gray-400">Tidak Ada</span>
                            )}
                          </td>
                          <td className="px-2 py-2">{rm.catatan}</td>
                          <td className="px-2 py-2 text-center">
                            <span
                              className={
                                rm.valid
                                  ? "text-green-600 font-bold"
                                  : "text-red-600 font-semibold"
                              }
                            >
                              {rm.valid ? "Valid" : "Nonaktif"}
                            </span>
                          </td>
                          <td className="px-2 py-2">
                            {updateInfo ? (
                              <code className="bg-gray-100 px-1 rounded">
                                {updateInfo.dokter}
                              </code>
                            ) : (
                              <span className="italic text-gray-500">-</span>
                            )}
                          </td>
                          <td className="px-2 py-2">
                            {updateInfo ? (
                              <span className="text-gray-600 text-xs italic">
                                {formatTimestamp(updateInfo.timestamp)}
                              </span>
                            ) : (
                              <span className="italic text-gray-500">-</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          {showModal && (
            <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
              <div className="bg-white rounded-2xl p-8 shadow-2xl w-full max-w-lg relative animate-fadeIn">
                <button
                  className="absolute top-3 right-4 text-xl text-gray-500 hover:text-red-600"
                  onClick={() => setShowModal(false)}
                >
                  ×
                </button>
                <h3 className="text-xl font-bold mb-4 text-blue-700">Update Rekam Medis</h3>
                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label className="block font-semibold mb-1">Diagnosa:</label>
                    <input
                      type="text"
                      name="diagnosa"
                      value={formData.diagnosa}
                      onChange={(e) =>
                        setFormData((f) => ({ ...f, diagnosa: e.target.value }))
                      }
                      className="w-full px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block font-semibold mb-1">Foto (Gambar/Scan):</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setFotoFile(e.target.files[0])}
                      className="w-full px-3 py-2 border border-blue-300 rounded-md"
                    />
                    {uploading && (
                      <div className="text-sm text-blue-700 mt-1">
                        Uploading ke IPFS...
                      </div>
                    )}
                    {formData.foto && (
                      <div className="mt-2">
                        <a
                          href={formData.foto}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 underline"
                        >
                          Preview Foto
                        </a>
                      </div>
                    )}
                  </div>
                  <div className="mb-6">
                    <label className="block font-semibold mb-1">Catatan:</label>
                    <textarea
                      name="catatan"
                      value={formData.catatan}
                      onChange={(e) =>
                        setFormData((f) => ({ ...f, catatan: e.target.value }))
                      }
                      rows={4}
                      className="w-full px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition"
                      disabled={uploading}
                    >
                      Simpan
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="bg-gray-400 hover:bg-gray-500 text-white px-6 py-2 rounded-lg font-semibold transition"
                    >
                      Batal
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
