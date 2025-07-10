// DataDiriPasien.jsx
import React, { useState, useEffect, useCallback } from "react";
import { QRCodeCanvas } from 'qrcode.react';
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

// Komponen untuk ikon dengan styling yang lebih baik
const IconUser = () => <span className="mr-3 text-blue-600 text-lg">👤</span>;
const IconCalendar = () => <span className="mr-3 text-blue-600 text-lg">📅</span>;
const IconMail = () => <span className="mr-3 text-blue-600 text-lg">📧</span>;
const IconPhone = () => <span className="mr-3 text-blue-600 text-lg">📞</span>;
const IconLocation = () => <span className="mr-3 text-blue-600 text-lg">🏠</span>;
const IconGender = () => <span className="mr-3 text-blue-600 text-lg">🚻</span>;
const IconBloodType = () => <span className="mr-3 text-red-600 text-lg">🩸</span>;
const IconHospital = () => <span className="mr-3 text-blue-600 text-lg">🏥</span>;

// Helper untuk format tanggal
const formatTanggalLahir = (tanggalLahir) => {
  if (!tanggalLahir) return '';
  const date = new Date(tanggalLahir);
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function DataDiriPasien({
  dataDiri,
  listAdminRS = [],
  updatePasienData,
  updatePasienRumahSakit,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({});
  const [selectedAdminRS, setSelectedAdminRS] = useState("");
  const [hospitalName, setHospitalName] = useState("Memuat...");
  const [isUpdatingRS, setIsUpdatingRS] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (dataDiri) {
      setEditedData({
        nama: dataDiri.nama || '',
        NIK: dataDiri.NIK || '',
        golonganDarah: dataDiri.golonganDarah || '',
        tanggalLahir: formatTanggalLahir(dataDiri.tanggalLahir) || '',
        gender: dataDiri.gender || '',
        alamat: dataDiri.alamat || '',
        noTelepon: dataDiri.noTelepon || '',
        email: dataDiri.email || '',
      });
      setSelectedAdminRS(dataDiri.rumahSakitPenanggungJawab || "");
      const rs = listAdminRS.find((rsItem) => rsItem.address === dataDiri.rumahSakitPenanggungJawab);
      setHospitalName(rs ? rs.nama : "Belum Terdaftar");
    }
  }, [dataDiri, listAdminRS]);

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditedData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveDataDiri = async () => {
    setIsSubmitting(true);
    if (!/^\d{16}$/.test(editedData.NIK)) {
      alert("NIK harus terdiri dari 16 digit angka.");
      setIsSubmitting(false);
      return;
    }

    if (!/^\d+$/.test(editedData.noTelepon)) {
      alert("Nomor Telepon hanya boleh berisi angka.");
      setIsSubmitting(false);
      return;
    }

    try {
      await updatePasienData(editedData);
      setIsEditing(false);
    } catch (error) {
      console.error("Error submitting updated data:", error);
      alert(error.message || "Gagal memperbarui data diri.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateRS = async () => {
    setIsUpdatingRS(true);
    try {
      if (!selectedAdminRS) {
        alert("Mohon pilih Rumah Sakit.");
        setIsUpdatingRS(false);
        return;
      }
      await updatePasienRumahSakit(selectedAdminRS);
    } catch (error) {
      console.error("Error submitting updated RS:", error);
      alert("Gagal memperbarui RS penanggung jawab.");
    } finally {
      setIsUpdatingRS(false);
    }
  };

  const downloadPdf = useCallback(async () => {
    const input = document.getElementById('idCardContent');

    if (!input) {
      alert("Elemen kartu pasien tidak ditemukan.");
      return;
    }

    try {
      const canvas = await html2canvas(input, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: [100, 60]
      });

      const imgWidth = 90;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const x = (pdf.internal.pageSize.getWidth() - imgWidth) / 2;
      const y = (pdf.internal.pageSize.getHeight() - imgHeight) / 2;

      pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight);
      pdf.save(`kartu-pasien-${dataDiri?.ID || 'unknown'}.pdf`);
      alert("Kartu pasien berhasil diunduh!");
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Gagal mengunduh kartu pasien. Coba lagi.");
    }
  }, [dataDiri]);

  const APP_BASE_URL = process.env.REACT_APP_BASE_URL;

  if (!dataDiri) {
    return (
      <div className="flex items-center justify-center min-h-64 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl">
        <div className="text-center">
          <div className="text-6xl mb-4">🏥</div>
          <div className="text-gray-600 text-lg">Data diri pasien tidak tersedia</div>
        </div>
      </div>
    );
  }

  // Komponen DetailItem baru untuk mode tampilan/edit
  const EditableDetailItem = ({ icon, label, name, type = "text", options, colSpan = 1, pattern, maxLength, placeholder, rows }) => (
    <div className={`${colSpan === 2 ? 'md:col-span-2' : ''} bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-3 hover:shadow-md transition-all duration-300 border border-gray-200`}>
      <div className="flex items-start">
        <div className="flex items-center">
          {icon}
          <span className="font-semibold text-gray-800 text-xs uppercase tracking-wide">
            {label}
          </span>
        </div>
      </div>
      <div className="mt-1 ml-6">
        {isEditing ? (
          type === "select" ? (
            <select
              id={name}
              name={name}
              value={editedData[name] || ""}
              onChange={handleEditChange}
              required
              className="w-full p-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm"
            >
              <option value="">Pilih {label}</option>
              {options.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          ) : type === "textarea" ? (
            <textarea
              id={name}
              name={name}
              value={editedData[name] || ""}
              onChange={handleEditChange}
              rows={rows}
              required
              className="w-full p-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm"
              autoComplete="off"
              placeholder={placeholder}
            ></textarea>
          ) : (
            <input
              type={type}
              id={name}
              name={name}
              value={editedData[name] || ""}
              onChange={handleEditChange}
              pattern={pattern}
              maxLength={maxLength}
              required
              className="w-full p-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm"
              autoComplete="off"
              placeholder={placeholder}
            />
          )
        ) : (
          <span className="text-gray-900 font-medium text-base break-words">
            {label === "Tanggal Lahir" ? formatTanggalLahir(dataDiri[name]) :
              label === "Alamat Dompet" ? <span className="font-mono text-sm break-all bg-gray-100 px-2 py-1 rounded">{dataDiri[name]}</span> :
                label === "RS Penanggung Jawab" ? hospitalName :
                  dataDiri[name] || <span className="text-gray-400 italic">Tidak tersedia</span>}
          </span>
        )}
      </div>
    </div>
  );

  return (
    <div className="bg-white shadow-2xl rounded-2xl overflow-hidden">
      {/* Header dengan gradient */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 p-6">
        <div className="flex items-center">
          <div className="bg-white/20 rounded-full p-3 mr-3">
            <span className="text-3xl">👤</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">Data Diri Pasien</h2>
            <p className="text-blue-100 text-sm">Informasi lengkap profil pasien</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Bagian Informasi Pribadi (Mode Tampilan/Edit) */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center">
              <div className="w-1 h-7 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full mr-3"></div>
              <h3 className="text-xl font-bold text-gray-800">Informasi Pribadi</h3>
            </div>
            {isEditing ? (
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    // Reset editedData to original dataDiri if cancelled
                    setEditedData({
                      nama: dataDiri.nama || '',
                      NIK: dataDiri.NIK || '',
                      golonganDarah: dataDiri.golonganDarah || '',
                      tanggalLahir: formatTanggalLahir(dataDiri.tanggalLahir) || '',
                      gender: dataDiri.gender || '',
                      alamat: dataDiri.alamat || '',
                      noTelepon: dataDiri.noTelepon || '',
                      email: dataDiri.email || '',
                    });
                  }}
                  className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-all duration-200 flex items-center text-sm"
                  disabled={isSubmitting}
                >
                  <span className="mr-1">✕</span>
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleSaveDataDiri}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg transition-all duration-200 flex items-center disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span className="mr-1">⏳</span>
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <span className="mr-1">💾</span>
                      Simpan
                    </>
                  )}
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white rounded-lg transition-all duration-200 flex items-center text-sm"
              >
                <span className="mr-1">✏️</span>
                Edit
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <EditableDetailItem icon={<span className="mr-3 text-blue-600 text-lg">🆔</span>} label="ID Pasien" name="ID" />
            <EditableDetailItem icon={<IconUser />} label="Nama Lengkap" name="nama" />
            <EditableDetailItem icon={<span className="mr-3 text-blue-600 text-lg">💳</span>} label="NIK" name="NIK" pattern="\d{16}" maxLength="16" placeholder="16 digit NIK" />
            <EditableDetailItem icon={<IconBloodType />} label="Golongan Darah" name="golonganDarah" type="select" options={["A", "B", "AB", "O"]} />
            <EditableDetailItem icon={<IconCalendar />} label="Tanggal Lahir" name="tanggalLahir" type="date" />
            <EditableDetailItem icon={<IconGender />} label="Gender" name="gender" type="select" options={["Laki-laki", "Perempuan", "Lainnya"]} />
            <EditableDetailItem icon={<IconPhone />} label="No. Telepon" name="noTelepon" type="tel" placeholder="08xxxxxxxxxx" />
            <EditableDetailItem icon={<IconMail />} label="Email" name="email" type="email" placeholder="contoh@email.com" />
            <EditableDetailItem icon={<IconLocation />} label="Alamat" name="alamat" type="textarea" rows="2" placeholder="Masukkan alamat lengkap..." colSpan={2} />
            <EditableDetailItem icon={<IconHospital />} label="RS Penanggung Jawab" name="rumahSakitPenanggungJawab" /> {/* Ini tetap non-editable dari sini */}
            <EditableDetailItem
              icon={<span className="mr-3 text-blue-600 text-lg">🔗</span>}
              label="Alamat Dompet"
              name="address"
              colSpan={2}
            />
          </div>
        </div>

        {/* Bagian Ubah RS Penanggung Jawab (Ini tetap terpisah karena logicnya berbeda) */}
        <div className="mb-8">
          <div className="flex items-center mb-5">
            <div className="w-1 h-7 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full mr-3"></div>
            <h3 className="text-xl font-bold text-gray-800">Ubah Rumah Sakit Penanggung Jawab</h3>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-5 border border-purple-200">
            <div className="flex flex-col lg:flex-row lg:items-end gap-3">
              <div className="flex-1 space-y-1">
                <label htmlFor="adminRSSelect" className="text-sm font-semibold text-gray-700 flex items-center">
                  <IconHospital /> Pilih Rumah Sakit Baru
                </label>
                <select
                  id="adminRSSelect"
                  value={selectedAdminRS || ""}
                  onChange={(e) => setSelectedAdminRS(e.target.value)}
                  required
                  disabled={isUpdatingRS}
                  className="w-full p-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 text-sm"
                >
                  <option value="">Pilih Rumah Sakit</option>
                  {listAdminRS.map((rs) => (
                    <option key={rs.address} value={rs.address}>
                      {rs.nama} ({rs.kota})
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={handleUpdateRS}
                disabled={isUpdatingRS || !selectedAdminRS || selectedAdminRS === dataDiri.rumahSakitPenanggungJawab}
                className={`px-5 py-2 rounded-lg transition-all duration-200 flex items-center text-sm ${isUpdatingRS || !selectedAdminRS || selectedAdminRS === dataDiri.rumahSakitPenanggungJawab
                  ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                  : "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                  }`}
              >
                {isUpdatingRS ? (
                  <>
                    <span className="mr-1">⏳</span>
                    Memperbarui...
                  </>
                ) : (
                  <>
                    <span className="mr-1">🔄</span>
                    Update RS
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Bagian Cetak Kartu Pasien */}
        <div>
          <div className="flex items-center mb-5">
            <div className="w-1 h-7 bg-gradient-to-b from-indigo-500 to-blue-500 rounded-full mr-3"></div>
            <h3 className="text-xl font-bold text-gray-800">Cetak Kartu Pasien</h3>
          </div>

          <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl p-5 border border-indigo-200">
            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-5">
              <div className="flex-1">
                <div className="bg-white rounded-lg p-3 shadow-lg">
                  {/* Konten yang akan dicetak */}
                  <div id="idCardContent" className="border-2 border-indigo-600 rounded-lg p-5 bg-gradient-to-br from-indigo-50 to-white">
                    <div className="flex flex-col md:flex-row items-center gap-5">
                      <div className="flex-shrink-0">
                        <div className="bg-white p-1 rounded-lg shadow-md">
                          <QRCodeCanvas
                            value={`${APP_BASE_URL}/pasien-dashboard?address=${dataDiri.address}`}
                            size={100}
                            level="H"
                            includeMargin={true}
                            fgColor="#4F46E5"
                          />
                        </div>
                        <p className="text-xs text-gray-600 text-center mt-1 font-medium">Pindai untuk Akses</p>
                      </div>
                      <div className="flex-grow text-gray-800 text-left w-full">
                        <div className="border-b border-indigo-200 pb-2 mb-2">
                          <h4 className="text-xl font-bold text-indigo-800 mb-0.5">{dataDiri.nama}</h4>
                          <p className="text-xs text-indigo-600 font-medium">ID: {dataDiri.ID}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-1.5 text-xs">
                          <div><strong>NIK:</strong> {dataDiri.NIK}</div>
                          <div><strong>Gol. Darah:</strong> <span className="text-red-600 font-bold">{dataDiri.golonganDarah}</span></div>
                          <div><strong>Tgl. Lahir:</strong> {dataDiri.tanggalLahir}</div>
                          <div><strong>Gender:</strong> {dataDiri.gender}</div>
                        </div>
                        <div className="mt-2 pt-2 border-t border-indigo-200">
                          <p className="text-xs text-gray-500">
                            <strong>Alamat Wallet:</strong>
                            <span className="font-mono block mt-0.5 text-xs">{dataDiri.address}</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center space-y-2">
                <button
                  onClick={downloadPdf}
                  className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-lg transition-all duration-200 flex items-center shadow-lg hover:shadow-xl text-sm"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  Download PDF
                </button>
                <p className="text-xs text-gray-500 text-center max-w-xs">
                  Kartu ini dapat digunakan sebagai identitas digital Anda di berbagai layanan kesehatan
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}