import React, { useState, useEffect } from "react";
import contract from "../contract"; // Pastikan path ini benar
import { uploadToPinata } from "../PinataUpload"; // Pastikan path ini benar

// Komponen Ikon (tetap sama seperti sebelumnya)
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
const IconUser = () => <svg className="w-5 h-5 mr-2.5 text-blue-600 inline" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path></svg>;
const IconCalendar = () => <svg className="w-5 h-5 mr-2.5 text-blue-600 inline" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"></path></svg>;
const IconMail = () => <svg className="w-5 h-5 mr-2.5 text-blue-600 inline" fill="currentColor" viewBox="0 0 20 20"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"></path><path fillRule="evenodd" d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" clipRule="evenodd"></path></svg>;
const IconPhone = () => <svg className="w-5 h-5 mr-2.5 text-blue-600 inline" fill="currentColor" viewBox="0 0 20 20"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"></path></svg>;
const IconLocation = () => <svg className="w-5 h-5 mr-2.5 text-blue-600 inline" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"></path></svg>;
const IconEditPencil = () => <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>;
const IconGender = () => (
  <svg className="w-5 h-5 mr-2.5 text-blue-600 inline" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-2a6 6 0 100-12 6 6 0 000 12zm-2-7a1 1 0 100-2H6a1 1 0 100 2h2zm4 0a1 1 0 100-2h-2a1 1 0 100 2h2zm-2 4a1 1 0 100-2H8a1 1 0 100 2h2z" clipRule="evenodd" />
  </svg>
);
const IconBloodType = () => (
  <svg className="w-5 h-5 mr-2.5 text-red-600 inline" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M10 18a.93.93 0 01-.682-.282L4.43 12.83A6.003 6.003 0 014 8.5C4 5.467 7.16 3 10 3s6 2.467 6 5.5c0 1.34-.435 2.603-1.232 3.616l-.001.001-4.887 4.886A.93.93 0 0110 18zm0-13.5a4.5 4.5 0 00-4.5 4.5c0 .998.33 1.923.928 2.668L10 15.336l3.572-3.668A3.513 3.513 0 0014.5 8.5a4.5 4.5 0 00-4.5-4.5z" clipRule="evenodd" />
  </svg>
);

const DetailItem = ({ icon, label, value }) => (
  <div className="flex items-start py-3">
    {icon && <div className="mr-3 mt-1 text-blue-600 flex-shrink-0 w-5 h-5">{icon}</div>}
    <div className="flex-1">
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className="text-base font-semibold text-gray-800">{value || '-'}</p>
    </div>
  </div>
);

export default function DataPasien({ account, assignedPatients }) {
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [pasienData, setPasienData] = useState(null);
  const [rekamMedisHistory, setRekamMedisHistory] = useState([]);
  const [updateHistories, setUpdateHistories] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [editingRM, setEditingRM] = useState(null);
  const [formData, setFormData] = useState({
    diagnosa: "", foto: "", catatan: "", // catatan akan diisi teks, foto akan diisi URL
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
          // Asumsi: getPasienData mengembalikan [nama, golonganDarah, tanggalLahir, gender, alamat, noTelepon, email, rumahSakitPenanggungJawab]
          return { address: addr, nama: p[0] || "Nama Tidak Tersedia" };
        } catch (err) {
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
          nama: p[0],
          golonganDarah: p[1],
          tanggalLahir: p[2],
          gender: p[3],
          alamat: p[4],
          noTelepon: p[5],
          email: p[6],
          rumahSakitPenanggungJawab: p[7] // Jangan lupa field terakhir jika ada
        });

        const ids = await contract.methods.getRekamMedisIdsByPasien(selectedPatient).call();
        let allVersions = [];
        let allUpdates = {};

        for (const id of ids) {
          const idStr = id.toString();
          const latestResult = await contract.methods.getRekamMedis(idStr).call();

          // PERBAIKAN PENTING DI SINI: Sesuaikan indeks agar sesuai dengan return Solidity
          // Solidity returns: uint id, address pasien, string diagnosa, string foto, string catatan, bool valid
          const latest = {
            id_rm: latestResult[0].toString(), // id
            pasien: latestResult[1],          // pasien
            diagnosa: latestResult[2],        // diagnosa
            foto: latestResult[3],            // foto
            catatan: latestResult[4],         // catatan
            valid: latestResult[5]            // valid
          };

          const versionsRawResults = await contract.methods.getRekamMedisVersions(idStr).call();
          const versionsRaw = versionsRawResults.map(v => ({
            // Ini asumsi v adalah objek dengan properti yang sesuai dari struct RekamMedisData
            id_rm: v.id.toString(),
            pasien: v.pasien,
            diagnosa: v.diagnosa,
            foto: v.foto,
            catatan: v.catatan,
            valid: v.valid
          }));

          const formattedVersions = versionsRaw.map((v, idx) => ({
            ...v,
            versiKe: idx + 1,
          }));

          // Filter out the 'latest' version if it's already present in formattedVersions
          // This avoids duplicate entries if the latest version is also stored in versionsRawResults
          const uniqueFormattedVersions = formattedVersions.filter(fv =>
            !(fv.id_rm === latest.id_rm && fv.diagnosa === latest.diagnosa && fv.catatan === latest.catatan) // Anda mungkin perlu penentu unik yang lebih baik
          );

          // Add the 'latest' version at the end, ensuring it's the highest version
          const allRecordVersions = [...uniqueFormattedVersions, { ...latest, versiKe: uniqueFormattedVersions.length + 1 }];
          allVersions = allVersions.concat(allRecordVersions);

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
        // Sorting unik berdasarkan id_rm dan versiKe
        const uniqueRecords = {};
        allVersions.forEach(rm => {
          const key = `${rm.id_rm}-${rm.versiKe}`;
          // Simpan versi yang lebih tinggi jika ada duplikasi ID-versi
          if (!uniqueRecords[key] || uniqueRecords[key].versiKe < rm.versiKe) {
            uniqueRecords[key] = rm;
          }
        });

        let finalSortedRecords = Object.values(uniqueRecords).sort((a, b) => {
          // Urutkan berdasarkan ID rekam medis (descending) lalu versi (descending)
          if (parseInt(a.id_rm) !== parseInt(b.id_rm)) {
            return parseInt(b.id_rm) - parseInt(a.id_rm);
          }
          return b.versiKe - a.versiKe;
        });

        setRekamMedisHistory(finalSortedRecords);
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

    // Filter rekamMedisHistory to only include records for the currently selected patient
    const relevantRecords = rekamMedisHistory.filter(rm => rm.pasien === selectedPatient);

    if (relevantRecords.length === 0) return null;

    // Find the highest id_rm among the relevant records
    const latestRmId = relevantRecords.reduce((maxId, currentRecord) => {
      return parseInt(currentRecord.id_rm) > parseInt(maxId) ? currentRecord.id_rm : maxId;
    }, relevantRecords[0].id_rm); // Initialize with the first record's id

    // Get all versions for this latestRmId
    const versionsOfLatestRmId = relevantRecords.filter(rm => rm.id_rm.toString() === latestRmId);

    if (versionsOfLatestRmId.length === 0) return null;

    // Return the specific version with the highest `versiKe` for that `latestRmId`
    return versionsOfLatestRmId.reduce((latest, current) => (current.versiKe > latest.versiKe ? current : latest), versionsOfLatestRmId[0]);
  };

  const handleOpenModal = () => {
    const latestRMEntry = getLatestRMForPatient();
    if (!latestRMEntry) { // If no RM history exists for the selected patient
      setEditingRM(null);
      setFormData({ diagnosa: "", foto: "", catatan: "" });
    } else {
      setEditingRM(latestRMEntry.id_rm);
      setFormData({ // Mengisi form modal dengan data rekam medis terbaru
        diagnosa: latestRMEntry.diagnosa,
        foto: latestRMEntry.foto,
        catatan: latestRMEntry.catatan,
      });
    }
    setFotoFile(null); // Reset file input
    setShowModal(true);
  };

  const handleFotoUpload = async () => {
    if (fotoFile) {
      setUploading(true);
      try {
        const url = await uploadToPinata(fotoFile);
        // setFormData((f) => ({ ...f, foto: url })); // Ini akan di-set setelah upload berhasil di handleSubmit
        return url; // Mengembalikan URL langsung
      } catch (e) {
        alert("Upload foto ke IPFS gagal.");
        throw e;
      } finally {
        setUploading(false);
      }
    }
    return formData.foto; // Kembalikan URL foto yang sudah ada jika tidak ada file baru
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPatient) {
      alert("Pasien belum dipilih. Silakan pilih pasien terlebih dahulu.");
      return;
    }
    setUploading(true); // Mulai status uploading
    try {
      let finalFotoUrl = formData.foto; // Default: gunakan URL foto yang sudah ada di state
      if (fotoFile) { // Jika ada file baru yang dipilih, lakukan upload
        finalFotoUrl = await uploadToPinata(fotoFile); // Upload dan dapatkan URL baru
      }
      // Perbarui formData dengan URL foto final sebelum mengirim ke kontrak
      setFormData((f) => ({ ...f, foto: finalFotoUrl }));

      if (editingRM) {
        await contract.methods
          .updateRekamMedis(editingRM, formData.diagnosa, finalFotoUrl, formData.catatan)
          .send({ from: account });
        alert("Rekam medis berhasil diperbarui.");
      } else {
        await contract.methods
          .tambahRekamMedis(selectedPatient, formData.diagnosa, finalFotoUrl, formData.catatan)
          .send({ from: account });
        alert("Rekam medis baru berhasil ditambahkan.");
      }
      setShowModal(false);
      setFotoFile(null); // Reset input file setelah submit

      // Refresh data pasien setelah submit berhasil
      const currentSelected = selectedPatient;
      setSelectedPatient(null); // Set to null to trigger re-fetch
      setTimeout(() => setSelectedPatient(currentSelected), 100); // Set back to selectedPatient to trigger useEffect
    } catch (err) {
      console.error("Gagal menyimpan rekam medis:", err);
      // Lebih spesifik dalam pesan error jika memungkinkan
      alert(`Gagal menyimpan rekam medis: ${err.message || 'Terjadi kesalahan tidak dikenal'}`);
    } finally {
      setUploading(false); // Akhiri status uploading
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
    <div className="w-full p-4 sm:p-6 md:p-8 ">
      {!selectedPatient ? (
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-blue-700 border-b border-gray-300 pb-4">Pilih Pasien</h2>
          <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row gap-4 items-center">
            <div className="relative w-full sm:max-w-lg">
              <span className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400">
                <IconSearch />
              </span>
              <input
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-colors"
                placeholder="Cari pasien (nama / alamat wallet)..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          {loadingData ? <p className="text-center text-gray-600 py-10 text-lg">Memuat daftar pasien...</p> :
            filteredPatients.length === 0 ? (
              <div className="bg-white rounded-xl shadow-md p-10 text-center">
                <p className="italic text-gray-600 text-lg">
                  {search ? "Tidak ada pasien yang cocok dengan pencarian Anda." : "Tidak ada pasien yang ditugaskan kepada Anda."}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto bg-white rounded-xl shadow-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-blue-600 text-white">
                    <tr>
                      <th className="px-6 py-3.5 text-center text-xs font-semibold uppercase tracking-wider">No.</th>
                      <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider">Nama Pasien</th>
                      <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider">Alamat Wallet</th>
                      <th className="px-6 py-3.5 text-center text-xs font-semibold uppercase tracking-wider">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredPatients.map((p, idx) => (
                      <tr key={p.address} className="hover:bg-blue-50 transition-colors duration-150">
                        <td className="text-center px-6 py-4 whitespace-nowrap text-sm text-gray-700">{idx + 1}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{p.nama}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-mono break-all">{p.address}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                          <button
                            onClick={() => setSelectedPatient(p.address)}
                            className="inline-flex items-center bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold text-xs transition shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
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
        </div>
      ) : (
        <div className="animate-fadeIn max-w-7xl mx-auto p-6 sm:p-8 md:p-10">
          <button
            onClick={() => setSelectedPatient(null)}
            className="mb-8 inline-flex items-center bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
          >
            <IconArrowLeft /> Kembali ke Daftar Pasien
          </button>

          {pasienData && (
            <div className="mb-10 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-blue-700 border-b border-gray-300 pb-5">
                Detail Pasien: <span className="text-blue-800">{pasienData.nama}</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-2">
                <DetailItem icon={<IconUser />} label="Nama Lengkap" value={pasienData.nama} />
                <DetailItem icon={<IconCalendar />} label="Tanggal Lahir" value={pasienData.tanggalLahir} />
                <DetailItem icon={<IconGender />} label="Jenis Kelamin" value={pasienData.gender} />
                <DetailItem icon={<IconBloodType />} label="Golongan Darah" value={pasienData.golonganDarah} />
                <DetailItem icon={<IconLocation />} label="Alamat" value={pasienData.alamat} />
                <DetailItem icon={<IconPhone />} label="No Telepon" value={pasienData.noTelepon} />
                <DetailItem icon={<IconMail />} label="Email" value={pasienData.email} />
              </div>
            </div>
          )}

          <div>
            <div className="flex flex-col sm:flex-row items-center justify-between mb-6 pb-5 border-b border-gray-300">
              <h3 className="font-bold text-2xl sm:text-3xl text-blue-700 mb-4 sm:mb-0">Riwayat Rekam Medis</h3>
              <button
                onClick={handleOpenModal}
                className="inline-flex items-center bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold text-sm transition shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
              >
                <IconEditPencil /> Kelola/Catat Rekam Medis
              </button>
            </div>
            {loadingHistory ? (
              <p className="italic text-gray-600 text-center py-10 text-lg">Memuat riwayat rekam medis...</p>
            ) : !rekamMedisHistory || rekamMedisHistory.length === 0 ? (
              <p className="italic text-gray-600 text-center py-10 text-lg">Belum ada data rekam medis untuk pasien ini.</p>
            ) : (
              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-blue-600 text-white">
                    <tr>
                      <th className="px-6 py-3.5 text-center text-xs font-semibold uppercase tracking-wider">No.</th>
                      <th className="px-6 py-3.5 text-center text-xs font-semibold uppercase tracking-wider">Versi</th>
                      <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider">Diagnosa</th>
                      <th className="px-6 py-3.5 text-center text-xs font-semibold uppercase tracking-wider">Foto</th>
                      <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider">Catatan</th> {/* Ini akan menampilkan string catatan */}
                      <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider">Dibuat/Diupdate Oleh</th>
                      <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider">Waktu</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {rekamMedisHistory.map((rm, index) => {
                      let currentUpdateInfo = null;
                      const rmUpdates = updateHistories[rm.id_rm.toString()] || [];
                      // Check if there's an update entry for this specific version (versiKe)
                      if (rm.versiKe > 0 && (rm.versiKe - 1) < rmUpdates.length) {
                        currentUpdateInfo = rmUpdates[rm.versiKe - 1];
                      }
                      return (
                        <tr key={`${rm.id_rm}-${rm.versiKe}`} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-center">{index + 1}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-center">{rm.versiKe}</td>
                          <td className="px-6 py-4 text-sm text-gray-800 min-w-[200px] break-words">{rm.diagnosa}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                            {rm.foto ? ( // rm.foto adalah URL IPFS
                              <a href={rm.foto} target="_blank" rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 underline font-medium">
                                Lihat Foto
                              </a>
                            ) : (
                              <span className="italic text-gray-400">N/A</span>
                            )}
                          </td>
                          {/* rm.catatan ditampilkan sebagai teks biasa. Jika isinya URL, itu karena data di blockchain */}
                          <td className="px-6 py-4 text-sm text-gray-600 min-w-[250px] break-words">{rm.catatan}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono break-all" title={currentUpdateInfo ? currentUpdateInfo.dokter : ''}>
                            {currentUpdateInfo ? `${currentUpdateInfo.dokter.substring(0, 6)}...${currentUpdateInfo.dokter.substring(currentUpdateInfo.dokter.length - 4)}` : <span className="italic text-gray-400">- (Data Awal)</span>}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500 italic">
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
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center p-4 z-[100]">
          <div className="bg-white rounded-xl p-6 sm:p-8 shadow-2xl w-full max-w-lg relative animate-fadeInUp transform transition-all duration-300">
            <button
              className="absolute top-4 right-4 text-2xl text-gray-400 hover:text-red-600 transition-colors focus:outline-none"
              onClick={() => setShowModal(false)}
            > &times; </button>
            <h3 className="text-xl sm:text-2xl font-bold mb-6 text-blue-700 border-b pb-3">
              {editingRM ? `Update Rekam Medis (ID: ${editingRM})` : "Tambah Rekam Medis Baru"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Diagnosa:</label>
                <input type="text" name="diagnosa" value={formData.diagnosa}
                  onChange={(e) => setFormData((f) => ({ ...f, diagnosa: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-colors"
                  required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Foto (Gambar/Scan):</label>
                <input type="file" accept="image/*"
                  onChange={(e) => {
                    setFotoFile(e.target.files[0]);
                  }}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-300 rounded-lg p-2.5 shadow-sm transition-colors" />
                {uploading && fotoFile && <div className="text-xs text-blue-600 mt-1.5 animate-pulse">Mengupload foto ke IPFS...</div>}
                {!uploading && formData.foto && !fotoFile && (
                  <div className="mt-2 text-sm">
                    Foto saat ini: <a href={formData.foto} target="_blank" rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 underline">
                      {formData.foto.substring(formData.foto.lastIndexOf('/') + 1).substring(0, 30)}...
                    </a>
                  </div>
                )}
              </div>
              <div> {/* Textarea untuk Catatan (input string) */}
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Catatan:</label>
                <textarea name="catatan" value={formData.catatan}
                  onChange={(e) => setFormData((f) => ({ ...f, catatan: e.target.value }))}
                  rows={4}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-colors" />
              </div>
              <div className="flex gap-4 pt-3 justify-end">
                <button type="button" onClick={() => { setShowModal(false); setFotoFile(null); }}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-2.5 rounded-lg font-semibold transition shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-400">
                  Batal
                </button>
                <button type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-semibold transition shadow-sm disabled:opacity-70 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  disabled={uploading}>
                  {uploading ? (editingRM ? "Menyimpan..." : "Menambah...") : (editingRM ? "Simpan Update" : "Tambah Rekam Medis")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}