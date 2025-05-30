import React, { useState, useEffect } from "react";
import contract from "../contract";
import { uploadToPinata } from "../PinataUpload";

// Komponen Ikon Sederhana
const IconSearch = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);
const IconArrowLeft = () => (
  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
  </svg>
);
const IconChevronRight = () => (
  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
  </svg>
);
const IconUser = () => <svg className="w-5 h-5 mr-2 text-blue-500 inline" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path></svg>;
const IconCalendar = () => <svg className="w-5 h-5 mr-2 text-blue-500 inline" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"></path></svg>;
const IconMail = () => <svg className="w-5 h-5 mr-2 text-blue-500 inline" fill="currentColor" viewBox="0 0 20 20"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"></path><path fillRule="evenodd" d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" clipRule="evenodd"></path></svg>;
const IconPhone = () => <svg className="w-5 h-5 mr-2 text-blue-500 inline" fill="currentColor" viewBox="0 0 20 20"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"></path></svg>;
const IconLocation = () => <svg className="w-5 h-5 mr-2 text-blue-500 inline" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"></path></svg>;
const IconEditPencil = () => <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>;


export default function DataPasien({ account, assignedPatients }) {
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [pasienData, setPasienData] = useState(null);
  const [rekamMedisHistory, setRekamMedisHistory] = useState([]);
  const [updateHistories, setUpdateHistories] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [editingRM, setEditingRM] = useState(null);
  const [formData, setFormData] = useState({
    diagnosa: "", foto: "", catatan: "",
  });
  const [fotoFile, setFotoFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [patientInfos, setPatientInfos] = useState([]);
  const [search, setSearch] = useState("");
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [loadingData, setLoadingData] = useState(false);

  useEffect(() => {
    async function fetchInfos() {
      setLoadingData(true);
      const infos = await Promise.all(assignedPatients.map(async (addr) => {
        try {
          const p = await contract.methods.getPasienData(addr).call();
          return { address: addr, nama: p[0] || "Nama Tidak Tersedia" };
        } catch (err){
          console.error(`Gagal memuat nama untuk pasien ${addr}:`, err);
          return { address: addr, nama: "Gagal Memuat Nama" };
        }
      }));
      setPatientInfos(infos);
      setLoadingData(false);
    }
    if (assignedPatients && assignedPatients.length > 0) fetchInfos();
    else setPatientInfos([]);
  }, [assignedPatients]);

  useEffect(() => {
    const fetchDataPasien = async () => {
      if (!selectedPatient) {
        setPasienData(null);
        setRekamMedisHistory([]);
        setUpdateHistories({});
        return;
      }
      setLoadingHistory(true);
      try {
        const p = await contract.methods.getPasienData(selectedPatient).call();
        setPasienData({
          nama: p[0], umur: p[1].toString(), golonganDarah: p[2], tanggalLahir: p[3],
          gender: p[4], alamat: p[5], noTelepon: p[6], email: p[7],
        });

        const ids = await contract.methods.getRekamMedisIdsByPasien(selectedPatient).call();
        let allVersions = [];
        let allUpdates = {};

        for (const id of ids) {
          const idStr = id.toString(); 
          const latestResult = await contract.methods.getRekamMedis(idStr).call();
          const latest = {
            id: latestResult[0].toString(), pasien: latestResult[1], diagnosa: latestResult[2],
            foto: latestResult[3], catatan: latestResult[4], valid: latestResult[5]
          };

          const versionsRawResults = await contract.methods.getRekamMedisVersions(idStr).call();
          const versionsRaw = versionsRawResults.map(v => ({
            id: v.id.toString(), pasien: v.pasien, diagnosa: v.diagnosa, 
            foto: v.foto, catatan: v.catatan, valid: v.valid
          }));
          
          const formattedVersions = versionsRaw.map((v, idx) => ({
            ...v,
            id_rm: idStr, 
            versiKe: idx + 1, 
          }));

          formattedVersions.push({
            ...latest,
            id_rm: idStr,
            versiKe: formattedVersions.length + 1,
          });
          
          allVersions = allVersions.concat(formattedVersions);

          try {
            const [dokters, timestamps] = await contract.methods.getRekamMedisUpdateHistory(idStr).call();
            allUpdates[idStr] = dokters.map((dokter, i) => ({
              dokter, timestamp: parseInt(timestamps[i].toString(), 10), 
            }));
          } catch (err) {
            console.warn(`Gagal memuat riwayat update untuk RM ID ${idStr}:`, err);
            allUpdates[idStr] = [];
          }
        }
        
        allVersions.sort((a, b) => parseInt(a.id_rm) - parseInt(b.id_rm) || b.versiKe - a.versiKe);
        
        setRekamMedisHistory(allVersions);
        setUpdateHistories(allUpdates);
      } catch (error) {
        console.error("Gagal memuat data pasien atau rekam medis:", error);
        alert("Gagal memuat detail pasien.");
      } finally {
        setLoadingHistory(false);
      }
    };
    if (selectedPatient) fetchDataPasien();
  }, [selectedPatient]);

  const getLatestRMForPatient = () => {
    if (!rekamMedisHistory || rekamMedisHistory.length === 0) return null;

    const uniqueRmIds = [...new Set(rekamMedisHistory.map(rm => rm.id_rm.toString()))];
    if (uniqueRmIds.length === 0) return null;

    const latestRmId = uniqueRmIds.reduce((maxId, currentId) =>
        parseInt(currentId) > parseInt(maxId) ? currentId : maxId, uniqueRmIds[0]);

    const versionsOfLatestRmId = rekamMedisHistory.filter(rm => rm.id_rm.toString() === latestRmId);
    if (versionsOfLatestRmId.length === 0) return null;

    return versionsOfLatestRmId.reduce((latest, current) => (current.versiKe > latest.versiKe ? current : latest), versionsOfLatestRmId[0]);
  };

  const handleOpenModal = () => {
    const latestRMEntry = getLatestRMForPatient();
    if (!rekamMedisHistory || rekamMedisHistory.length === 0 || !latestRMEntry) { 
      setEditingRM(null); 
      setFormData({ diagnosa: "", foto: "", catatan: "" });
    } else { 
      setEditingRM(latestRMEntry.id_rm);
      setFormData({
        diagnosa: latestRMEntry.diagnosa,
        foto: latestRMEntry.foto, 
        catatan: latestRMEntry.catatan,
      });
    }
    setFotoFile(null);
    setShowModal(true);
  };

  const handleFotoUpload = async () => {
    if (fotoFile) {
      setUploading(true);
      try {
        const url = await uploadToPinata(fotoFile);
        setFormData((f) => ({ ...f, foto: url }));
        return url;
      } catch (e) {
        alert("Upload foto ke IPFS gagal.");
        throw e;
      } finally {
        setUploading(false);
      }
    }
    return formData.foto;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPatient) {
      alert("Pasien belum dipilih. Silakan pilih pasien terlebih dahulu.");
      return;
    }
    setUploading(true); 
    try {
      let fotoUrl = formData.foto;
      if (fotoFile) {
        fotoUrl = await handleFotoUpload();
      }

      if (editingRM) {
        await contract.methods
          .updateRekamMedis(editingRM, formData.diagnosa, fotoUrl, formData.catatan)
          .send({ from: account });
        alert("Rekam medis berhasil diperbarui.");
      } else {
        await contract.methods
          .tambahRekamMedis(selectedPatient, formData.diagnosa, fotoUrl, formData.catatan)
          .send({ from: account });
        alert("Rekam medis baru berhasil ditambahkan.");
      }
      setShowModal(false);
      setFotoFile(null); 

      const currentSelected = selectedPatient;
      setSelectedPatient(null);
      setTimeout(() => setSelectedPatient(currentSelected), 100); 
    } catch (err) {
      console.error("Gagal menyimpan rekam medis:", err);
      alert(`Gagal menyimpan rekam medis: ${err.message.substring(0, 200)}`); 
    } finally {
      setUploading(false);
    }
  };

  const filteredPatients = search
    ? patientInfos.filter(
        (p) =>
          (p.nama && p.nama.toLowerCase().includes(search.toLowerCase())) ||
          (p.address && p.address.toLowerCase().includes(search.toLowerCase()))
      )
    : patientInfos;

  const formatTimestamp = (ts) => {
    if (!ts || ts === 0) return "-";
    const date = new Date(ts * 1000);
    return date.toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });
  };
  
  return (
    <div className="w-full"> 
      {!selectedPatient ? (
        <>
          <h2 className="text-3xl font-bold mb-6 text-blue-700 border-b pb-3">Pilih Pasien</h2>
          <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center">
            <div className="relative w-full sm:max-w-md">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <IconSearch />
              </span>
              <input
                className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                placeholder="Cari pasien (nama / alamat wallet)..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {loadingData ? <p className="text-center text-gray-600 py-8">Memuat daftar pasien...</p> :
           filteredPatients.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <p className="italic text-gray-600">
                {search ? "Tidak ada pasien yang cocok dengan pencarian Anda." : "Tidak ada pasien yang ditugaskan kepada Anda."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto bg-white rounded-xl shadow-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-blue-600 text-white">
                  <tr>
                    <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">No.</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Nama Pasien</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Alamat Wallet</th>
                    <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">Aksi</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredPatients.map((p, idx) => (
                    <tr key={p.address} className="hover:bg-blue-50 transition-colors duration-150">
                      <td className="text-center px-6 py-4 whitespace-nowrap text-sm">{idx + 1}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{p.nama}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono break-all">{p.address}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                        <button
                          onClick={() => setSelectedPatient(p.address)}
                          className="inline-flex items-center bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold text-xs transition shadow-md hover:shadow-lg"
                        >
                          Lihat Detail <IconChevronRight />
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
        <div className="animate-fadeIn">
          <button
            onClick={() => setSelectedPatient(null)}
            className="mb-6 inline-flex items-center bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition shadow hover:shadow-md"
          >
            <IconArrowLeft /> Kembali ke Daftar Pasien
          </button>
          
          {pasienData && (
            <div className="mb-8 p-6 border border-blue-200 rounded-xl bg-white shadow-lg">
              <h2 className="text-2xl font-bold mb-4 text-blue-700 border-b pb-2">
                Detail Pasien: <span className="text-blue-800">{pasienData.nama}</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-6 text-sm text-gray-700">
                <p><IconUser /><strong>Nama:</strong> {pasienData.nama || '-'}</p>
                <p><IconCalendar /><strong>Umur:</strong> {pasienData.umur && parseInt(pasienData.umur) > 0 ? `${pasienData.umur} tahun` : '-'}</p>
                <p><IconCalendar /><strong>Tanggal Lahir:</strong> {pasienData.tanggalLahir || '-'}</p>
                <p><strong>Jenis Kelamin:</strong> {pasienData.gender || '-'}</p>
                <p><strong>Golongan Darah:</strong> {pasienData.golonganDarah || '-'}</p>
                <p><IconLocation /><strong>Alamat:</strong> {pasienData.alamat || '-'}</p>
                <p><IconPhone /><strong>No Telepon:</strong> {pasienData.noTelepon || '-'}</p>
                <p><IconMail /><strong>Email:</strong> {pasienData.email || '-'}</p>
              </div>
            </div>
          )}

          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="flex flex-col sm:flex-row items-center justify-between mb-4 pb-3 border-b">
              <h3 className="font-bold text-xl text-blue-700 mb-2 sm:mb-0">Riwayat Rekam Medis</h3>
              <button
                onClick={handleOpenModal}
                className="inline-flex items-center bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-semibold text-sm transition shadow hover:shadow-md"
              >
                <IconEditPencil /> Kelola/Catat Rekam Medis
              </button>
            </div>
            {loadingHistory ? (
              <p className="italic text-gray-600 text-center py-6">Memuat riwayat rekam medis...</p>
            ) : !rekamMedisHistory || rekamMedisHistory.length === 0 ? (
              <p className="italic text-gray-600 text-center py-6">Belum ada data rekam medis untuk pasien ini.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg">
                  <thead className="bg-blue-500 text-white">
                    <tr>
                      {/* Perubahan: Kolom No. ditambahkan, ID RM dihapus */}
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">No.</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Versi</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Diagnosa</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider">Foto</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Catatan</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Dibuat/Diupdate Oleh</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Waktu</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {/* Perubahan: Menambahkan 'index' untuk penomoran */}
                    {rekamMedisHistory.map((rm, index) => { 
                      let currentUpdateInfo = null;
                      const rmUpdates = updateHistories[rm.id_rm.toString()] || []; 
                      
                      if (rm.versiKe >= 1 && (rm.versiKe - 1) < rmUpdates.length) {
                          currentUpdateInfo = rmUpdates[rm.versiKe - 1];
                      }

                      return (
                        <tr key={`${rm.id_rm}-${rm.versiKe}`} className="hover:bg-gray-50 transition-colors">
                          {/* Perubahan: Sel untuk No. ditambahkan */}
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 text-center">{index + 1}</td>
                          {/* Kolom ID RM dihapus dari sini */}
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 text-center">{rm.versiKe}</td>
                          <td className="px-4 py-3 text-sm text-gray-800">{rm.diagnosa}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-center">
                            {rm.foto ? (
                              <a href={rm.foto} target="_blank" rel="noopener noreferrer"
                                 className="text-blue-600 hover:text-blue-800 underline font-medium">
                                Lihat Foto
                              </a>
                            ) : (
                              <span className="italic text-gray-400">N/A</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">{rm.catatan}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-center">
                            <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${rm.valid ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                              {rm.valid ? "Valid" : "Nonaktif"}
                            </span>
                          </td>
                           <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 font-mono break-all" title={currentUpdateInfo ? currentUpdateInfo.dokter : ''}>
                            {currentUpdateInfo ? `${currentUpdateInfo.dokter.substring(0, 6)}...${currentUpdateInfo.dokter.substring(currentUpdateInfo.dokter.length - 4)}` : <span className="italic text-gray-400">- (Awal)</span>}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-500 italic">
                            {currentUpdateInfo ? formatTimestamp(currentUpdateInfo.timestamp) : '-'}
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
            <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center p-4 z-[100]">
              <div className="bg-white rounded-xl p-6 sm:p-8 shadow-2xl w-full max-w-lg relative animate-fadeInUp transform transition-all duration-300">
                <button
                  className="absolute top-4 right-4 text-2xl text-gray-400 hover:text-red-600 transition-colors"
                  onClick={() => setShowModal(false)}
                > &times; </button>
                <h3 className="text-2xl font-bold mb-6 text-blue-700 border-b pb-3">
                  {editingRM ? `Update Rekam Medis (ID: ${editingRM})` : "Tambah Rekam Medis Baru"}
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Diagnosa:</label>
                    <input type="text" name="diagnosa" value={formData.diagnosa}
                      onChange={(e) => setFormData((f) => ({ ...f, diagnosa: e.target.value }))}
                      className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                      required />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Foto (Gambar/Scan):</label>
                    <input type="file" accept="image/*"
                      onChange={(e) => {
                        setFotoFile(e.target.files[0]);
                      }}
                      className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-300 rounded-lg p-2 shadow-sm" />
                    {uploading && fotoFile && <div className="text-xs text-blue-600 mt-1 animate-pulse">Mengupload foto ke IPFS...</div>}
                    {!uploading && formData.foto && !fotoFile && ( 
                      <div className="mt-2 text-sm">
                        Foto saat ini: <a href={formData.foto} target="_blank" rel="noopener noreferrer"
                           className="text-blue-600 hover:text-blue-800 underline">
                          {formData.foto.substring(formData.foto.lastIndexOf('/') + 1).substring(0, 30)}...
                        </a>
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Catatan:</label>
                    <textarea name="catatan" value={formData.catatan}
                      onChange={(e) => setFormData((f) => ({ ...f, catatan: e.target.value }))}
                      rows={4}
                      className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm" />
                  </div>
                  <div className="flex gap-4 pt-2 justify-end">
                    <button type="button" onClick={() => { setShowModal(false); setFotoFile(null); }}
                      className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2.5 rounded-lg font-semibold transition shadow-sm">
                      Batal
                    </button>
                    <button type="submit"
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-semibold transition shadow-sm disabled:opacity-70"
                      disabled={uploading}>
                      {uploading ? (editingRM ? "Menyimpan..." : "Menambah...") : (editingRM ? "Simpan Update" : "Tambah Rekam Medis")}
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