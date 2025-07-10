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
const IconNIK = () => <span className="mr-3 text-blue-600 text-lg">💳</span>; // Ikon NIK

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
    const [showEditModal, setShowEditModal] = useState(false); // State untuk mengontrol tampilan modal
    const [modalEditedData, setModalEditedData] = useState({}); // State untuk data di dalam modal
    const [selectedAdminRS, setSelectedAdminRS] = useState("");
    const [hospitalName, setHospitalName] = useState("Memuat...");
    const [isUpdatingRS, setIsUpdatingRS] = useState(false);
    const [isSubmittingModal, setIsSubmittingModal] = useState(false); // Untuk submit di dalam modal

    // Effect untuk memperbarui nama RS penanggung jawab (saat dataDiri atau listAdminRS berubah)
    useEffect(() => {
        if (dataDiri?.rumahSakitPenanggungJawab && listAdminRS.length > 0) {
            const rs = listAdminRS.find((rsItem) => rsItem.address === dataDiri.rumahSakitPenanggungJawab);
            setHospitalName(rs ? rs.nama : "Belum Terdaftar / Tidak Ditemukan");
        } else if (!dataDiri?.rumahSakitPenanggungJawab) {
            setHospitalName("Belum Terdaftar");
        }
    }, [dataDiri?.rumahSakitPenanggungJawab, listAdminRS]);

    // Fungsi untuk membuka modal edit dan mengisi data awal
    const openEditModal = () => {
        if (dataDiri) {
            setModalEditedData({
                nama: dataDiri.nama || '',
                NIK: dataDiri.NIK || '',
                golonganDarah: dataDiri.golonganDarah || '',
                tanggalLahir: formatTanggalLahir(dataDiri.tanggalLahir) || '',
                gender: dataDiri.gender || '',
                alamat: dataDiri.alamat || '',
                noTelepon: dataDiri.noTelepon || '',
                email: dataDiri.email || '',
            });
            setShowEditModal(true);
        }
    };

    // Handler perubahan input di dalam modal
    const handleModalChange = (e) => {
        const { name, value } = e.target;
        setModalEditedData((prev) => ({ ...prev, [name]: value }));
    };

    // Handler submit form di dalam modal
    const handleModalSave = async () => {
        setIsSubmittingModal(true);
        // Validasi NIK dan No. Telepon di sini
        if (!/^\d{16}$/.test(modalEditedData.NIK)) {
            alert("NIK harus terdiri dari 16 digit angka.");
            setIsSubmittingModal(false);
            return;
        }
        if (!/^\d+$/.test(modalEditedData.noTelepon)) {
            alert("Nomor Telepon hanya boleh berisi angka.");
            setIsSubmittingModal(false);
            return;
        }

        try {
            await updatePasienData(modalEditedData);
            setShowEditModal(false); // Tutup modal setelah berhasil
        } catch (error) {
            console.error("Error submitting updated data from modal:", error);
            alert(error.message || "Gagal memperbarui data diri.");
        } finally {
            setIsSubmittingModal(false);
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

    // Callback untuk download PDF
    const downloadPdf = useCallback(async () => {
        const input = document.getElementById('idCardContent');

        if (!input) {
            alert("Elemen kartu pasien tidak ditemukan.");
            return;
        }

        try {
            // Dimensi kartu kredit standar: 85.6 mm x 53.98 mm
            // Sesuaikan lebar target sesuai kebutuhan Anda
            const targetCardWidthMm = 85.6; // Menggunakan lebar standar kartu kredit
            const targetCardHeightMm = 53.98; // Tinggi standar kartu kredit

            const canvas = await html2canvas(input, {
                scale: 3, // Pertahankan skala ini untuk kualitas yang tidak buram
                useCORS: true,
                allowTaint: true,
                // foreignObjectRendering: true, // Opsional: Coba ini jika teks masih buram
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'landscape',
                unit: 'mm',
                format: [targetCardWidthMm, targetCardHeightMm],
                precision: 2
            });

            // Hitung rasio aspek canvas dan sesuaikan agar gambar pas di halaman PDF
            const canvasAspectRatio = canvas.width / canvas.height;
            let imgWidthPdf = pdf.internal.pageSize.getWidth();
            let imgHeightPdf = imgWidthPdf / canvasAspectRatio;

            if (imgHeightPdf > pdf.internal.pageSize.getHeight()) {
                imgHeightPdf = pdf.internal.pageSize.getHeight();
                imgWidthPdf = imgHeightPdf * canvasAspectRatio;
            }

            const x = (pdf.internal.pageSize.getWidth() - imgWidthPdf) / 2;
            const y = (pdf.internal.pageSize.getHeight() - imgHeightPdf) / 2;

            pdf.addImage(imgData, 'PNG', x, y, imgWidthPdf, imgHeightPdf);
            pdf.save(`kartu-pasien-${dataDiri?.ID || 'unknown'}.pdf`);
            alert("Kartu pasien berhasil diunduh!");
        } catch (error) {
            console.error("Error generating PDF:", error);
            alert("Gagal mengunduh kartu pasien. Coba lagi.");
        }
    }, [dataDiri]);

    const APP_BASE_URL = process.env.REACT_APP_BASE_URL || window.location.origin;

    if (!dataDiri) {
        return (
            <div className="flex items-center justify-center min-h-64 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl">
                <div className="text-center p-5">
                    <div className="text-6xl mb-4">🏥</div>
                    <div className="text-gray-600 text-lg">Data diri pasien tidak tersedia</div>
                </div>
            </div>
        );
    }

    // Komponen DetailItem untuk mode tampilan (tanpa edit)
    const DetailItem = ({ icon, label, value, colSpan = 1 }) => (
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
                <span className="text-gray-900 font-medium text-base break-words">
                    {value || <span className="text-gray-400 italic">Tidak tersedia</span>}
                </span>
            </div>
        </div>
    );

    return (
        <div className="w-full">
            {/* Header dengan gradient */}
            <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 p-6 rounded-t-2xl">
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

            <div className="p-6 bg-white rounded-b-2xl shadow-xl">
                {/* Bagian Informasi Pribadi (Mode Tampilan) */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center">
                            <div className="w-1 h-7 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full mr-3"></div>
                            <h3 className="text-xl font-bold text-gray-800">Informasi Pribadi</h3>
                        </div>
                        <button
                            onClick={openEditModal} // Tombol untuk membuka modal edit
                            className="px-4 py-2 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white rounded-lg transition-all duration-200 flex items-center text-sm"
                        >
                            <span className="mr-1">✏️</span>
                            Edit
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <DetailItem icon={<span className="mr-3 text-blue-600 text-lg">🆔</span>} label="ID Pasien" value={dataDiri.ID} readOnly={true} />
                        <DetailItem icon={<IconUser />} label="Nama Lengkap" value={dataDiri.nama} />
                        <DetailItem icon={<span className="mr-3 text-blue-600 text-lg">💳</span>} label="NIK" value={dataDiri.NIK} />
                        <DetailItem icon={<IconBloodType />} label="Golongan Darah" value={dataDiri.golonganDarah} />
                        <DetailItem icon={<IconCalendar />} label="Tanggal Lahir" value={dataDiri.tanggalLahir} />
                        <DetailItem icon={<IconGender />} label="Gender" value={dataDiri.gender} />
                        <DetailItem icon={<IconPhone />} label="No. Telepon" value={dataDiri.noTelepon} />
                        <DetailItem icon={<IconMail />} label="Email" value={dataDiri.email} />
                        <DetailItem icon={<IconLocation />} label="Alamat" value={dataDiri.alamat} colSpan={2} />
                        <DetailItem
                            icon={<span className="mr-3 text-blue-600 text-lg">🔗</span>}
                            label="Alamat Dompet"
                            value={<span className="font-mono text-sm break-all bg-gray-100 px-2 py-1 rounded">{dataDiri.address}</span>}
                            colSpan={2}
                        />
                        <DetailItem icon={<IconHospital />} label="RS Penanggung Jawab" value={hospitalName} colSpan={2} />
                    </div>
                </div>

                {/* Bagian Ubah RS Penanggung Jawab (Ini tetap terpisah karena logicnya berbeda) */}
                <div className="mb-8 mt-8">
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
                            <div className="flex-1 flex justify-center items-center">
                                <div>
                                    {/* Konten yang akan dicetak */}
                                    <div id="idCardContent"
                                        className="border-2 border-indigo-600 rounded-lg p-5 bg-gradient-to-br from-indigo-50 to-white"
                                        style={{ width: '400px', height: '240px', boxSizing: 'border-box', overflow: 'hidden' }}
                                    >
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
                                                {/* ---- BAGIAN YANG PERLU DIUBAH FONT-SIZE ALAMAT WALLET ---- */}
                                                <div className="mt-2 pt-2 border-t border-indigo-200">
                                                    <p className="text-xs text-gray-500">
                                                        <strong>Alamat Wallet:</strong>
                                                        {/* Ubah text-xs menjadi text-[10px] atau text-[9px] */}
                                                        <span className="font-mono block mt-0.5 text-[9px] text-wrap">{dataDiri.address}</span>
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
                                    Unduh Kartu Pasien
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal Edit Data Diri */}
            {showEditModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-3xl w-full border border-gray-200">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Edit Data Diri Pasien</h2>
                        <form onSubmit={(e) => { e.preventDefault(); handleModalSave(); }}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 mb-6">
                                {/* Input Nama */}
                                <div className="md:col-span-2">
                                    <label htmlFor="modalNama" className="flex items-center text-sm font-semibold text-gray-700 mb-1">
                                        <IconUser /> Nama Lengkap
                                    </label>
                                    <input
                                        id="modalNama"
                                        name="nama"
                                        type="text"
                                        className="w-full border border-gray-200 rounded-md px-3 py-2 bg-gray-50 text-gray-800 focus:outline-none focus:border-blue-500 text-sm"
                                        value={modalEditedData.nama || ""}
                                        onChange={handleModalChange}
                                        required
                                        autoComplete="off"
                                    />
                                </div>

                                {/* Input NIK */}
                                <div className="md:col-span-2">
                                    <label htmlFor="modalNIK" className="flex items-center text-sm font-semibold text-gray-700 mb-1">
                                        <IconNIK /> Nomor Induk Kependudukan (NIK)
                                    </label>
                                    <input
                                        id="modalNIK"
                                        name="NIK"
                                        type="text"
                                        pattern="\d{16}"
                                        maxLength="16"
                                        className="w-full border border-gray-200 rounded-md px-3 py-2 bg-gray-50 text-gray-800 focus:outline-none focus:border-blue-500 text-sm"
                                        value={modalEditedData.NIK || ""}
                                        onChange={handleModalChange}
                                        required
                                        autoComplete="off"
                                    />
                                </div>

                                {/* Input Golongan Darah */}
                                <div>
                                    <label htmlFor="modalGolonganDarah" className="flex items-center text-sm font-semibold text-gray-700 mb-1">
                                        <IconBloodType /> Golongan Darah
                                    </label>
                                    <select
                                        id="modalGolonganDarah"
                                        name="golonganDarah"
                                        value={modalEditedData.golonganDarah || ""}
                                        onChange={handleModalChange}
                                        required
                                        className="w-full border border-gray-200 rounded-md px-3 py-2 bg-gray-50 text-gray-800 focus:outline-none focus:border-blue-500 text-sm"
                                    >
                                        <option value="">Pilih Golongan Darah</option>
                                        <option value="A">A</option>
                                        <option value="B">B</option>
                                        <option value="AB">AB</option>
                                        <option value="O">O</option>
                                    </select>
                                </div>

                                {/* Input Tanggal Lahir */}
                                <div>
                                    <label htmlFor="modalTanggalLahir" className="flex items-center text-sm font-semibold text-gray-700 mb-1">
                                        <IconCalendar /> Tanggal Lahir
                                    </label>
                                    <input
                                        id="modalTanggalLahir"
                                        name="tanggalLahir"
                                        type="date"
                                        className="w-full border border-gray-200 rounded-md px-3 py-2 bg-gray-50 text-gray-800 focus:outline-none focus:border-blue-500 text-sm"
                                        value={modalEditedData.tanggalLahir || ""}
                                        onChange={handleModalChange}
                                        required
                                    />
                                </div>

                                {/* Input Gender */}
                                <div>
                                    <label htmlFor="modalGender" className="flex items-center text-sm font-semibold text-gray-700 mb-1">
                                        <IconGender /> Gender
                                    </label>
                                    <select
                                        id="modalGender"
                                        name="gender"
                                        value={modalEditedData.gender || ""}
                                        onChange={handleModalChange}
                                        required
                                        className="w-full border border-gray-200 rounded-md px-3 py-2 bg-gray-50 text-gray-800 focus:outline-none focus:border-blue-500 text-sm"
                                    >
                                        <option value="">Pilih Gender</option>
                                        <option value="Laki-laki">Laki-laki</option>
                                        <option value="Perempuan">Perempuan</option>
                                        <option value="Lainnya">Lainnya</option>
                                    </select>
                                </div>

                                {/* Input No. Telepon */}
                                <div>
                                    <label htmlFor="modalNoTelepon" className="flex items-center text-sm font-semibold text-gray-700 mb-1">
                                        <IconPhone /> No. Telepon
                                    </label>
                                    <input
                                        id="modalNoTelepon"
                                        name="noTelepon"
                                        type="tel"
                                        className="w-full border border-gray-200 rounded-md px-3 py-2 bg-gray-50 text-gray-800 focus:outline-none focus:border-blue-500 text-sm"
                                        value={modalEditedData.noTelepon || ""}
                                        onChange={handleModalChange}
                                        required
                                        autoComplete="off"
                                    />
                                </div>

                                {/* Input Email */}
                                <div className="md:col-span-2">
                                    <label htmlFor="modalEmail" className="flex items-center text-sm font-semibold text-gray-700 mb-1">
                                        <IconMail /> Email
                                    </label>
                                    <input
                                        id="modalEmail"
                                        name="email"
                                        type="email"
                                        className="w-full border border-gray-200 rounded-md px-3 py-2 bg-gray-50 text-gray-800 focus:outline-none focus:border-blue-500 text-sm"
                                        value={modalEditedData.email || ""}
                                        onChange={handleModalChange}
                                        required
                                        autoComplete="off"
                                    />
                                </div>

                                {/* Input Alamat Lengkap */}
                                <div className="md:col-span-2">
                                    <label htmlFor="modalAlamat" className="flex items-center text-sm font-semibold text-gray-700 mb-1">
                                        <IconLocation /> Alamat Lengkap
                                    </label>
                                    <textarea
                                        id="modalAlamat"
                                        name="alamat"
                                        rows={3}
                                        className="w-full border border-gray-200 rounded-md px-3 py-2 bg-gray-50 text-gray-800 focus:outline-none focus:border-blue-500 text-sm"
                                        value={modalEditedData.alamat || ""}
                                        onChange={handleModalChange}
                                        required
                                        autoComplete="off"
                                    ></textarea>
                                </div>
                            </div>

                            {/* Tombol Simpan/Batal di Modal */}
                            <div className="flex justify-end space-x-3 mt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowEditModal(false)}
                                    className="px-6 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={isSubmittingModal}
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={isSubmittingModal}
                                >
                                    {isSubmittingModal ? "Menyimpan..." : "Simpan Perubahan"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}