// ManagePasienPage.js
import React, { useState } from 'react';
import contract from '../contract'; // Pastikan import ini ada

// Komponen untuk ikon search
const SearchIcon = () => (
    <svg
        className="w-5 h-5 text-slate-400"
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 20 20"
    >
        <path
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
        />
    </svg>
);

// Komponen untuk spinner sederhana
const Spinner = () => (
    <svg
        className="animate-spin h-5 w-5 text-blue-600"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
    >
        <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
        ></circle>
        <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
    </svg>
);

// Komponen untuk ikon detail
const EyeIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
);

// Komponen untuk ikon file medical
const FileIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
);

export default function ManagePasienPage({
    loading,
    listPasien, // [{ address, nama, ID, NIK, golonganDarah, tanggalLahir, gender, alamat, noTelepon, email, rumahSakitPenanggungJawab }, …]
    account // Kita butuh account Admin RS untuk memanggil kontrak
}) {
    const [q, setQ] = useState("");
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showMedicalRecordModal, setShowMedicalRecordModal] = useState(false);
    const [selectedPasienDetail, setSelectedPasienDetail] = useState(null);
    const [medicalRecords, setMedicalRecords] = useState([]);
    const [medicalRecordsLoading, setMedicalRecordsLoading] = useState(false);
    const [medicalRecordsError, setMedicalRecordsError] = useState(null);

    const safeListPasien = Array.isArray(listPasien) ? listPasien : [];

    const filtered = safeListPasien.filter(p => {
        const nameLower = p?.nama?.toLowerCase() || "";
        const idLower = p?.ID?.toLowerCase() || "";
        const nikLower = p?.NIK?.toLowerCase() || ""; // <-- Tambahkan NIK ke pencarian
        const addressLower = (typeof p?.address === 'string' ? p.address.toLowerCase() : "");
        const queryLower = q.toLowerCase();
        return nameLower.includes(queryLower) || addressLower.includes(queryLower) || idLower.includes(queryLower) || nikLower.includes(queryLower);
    });

    const openDetailModal = (pasien) => {
        setSelectedPasienDetail(pasien);
        setShowDetailModal(true);
        // Reset state rekam medis saat membuka modal detail pasien
        setMedicalRecords([]);
        setMedicalRecordsError(null);
        setShowMedicalRecordModal(false); // Pastikan modal rekam medis tertutup
    };

    const closeDetailModal = () => {
        setShowDetailModal(false);
        setSelectedPasienDetail(null);
        setMedicalRecords([]); // Kosongkan rekam medis saat modal ditutup
        setMedicalRecordsError(null);
        setShowMedicalRecordModal(false);
    };

    const fetchMedicalRecords = async (pasienAddressToFetch) => {
        setMedicalRecordsLoading(true);
        setMedicalRecordsError(null);
        try {
            // Panggil fungsi baru di kontrak untuk Admin RS
            const records = await contract.methods.getRekamMedisByPasienUntukAdminRS(pasienAddressToFetch).call({ from: account });

            // Format timestamp menjadi tanggal yang lebih mudah dibaca
            const formattedRecords = records.map(record => ({
                ...record,
                timestampPembuatan: new Date(Number(record.timestampPembuatan) * 1000).toLocaleString()
            }));
            setMedicalRecords(formattedRecords);
            setShowMedicalRecordModal(true); // Tampilkan modal rekam medis
        } catch (err) {
            console.error("Gagal mengambil rekam medis:", err);
            const errorMessage = err.message.includes("revert")
                ? err.message.substring(err.message.indexOf("revert") + "revert".length).trim()
                : "Gagal mengambil rekam medis. Cek konsol untuk detail.";
            setMedicalRecordsError(errorMessage);
        } finally {
            setMedicalRecordsLoading(false);
        }
    };

    const closeMedicalRecordModal = () => {
        setShowMedicalRecordModal(false);
        setMedicalRecords([]);
        setMedicalRecordsError(null);
    };

    return (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-6 sm:p-8 rounded-2xl shadow-2xl w-full mx-auto my-8 border border-blue-200">
            <div className="mb-8">
                <h3 className="text-3xl font-bold text-gray-800 mb-2 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    Manajemen Pasien
                </h3>
                <p className="text-gray-600 text-sm">Kelola data pasien yang terdaftar di sistem</p>
            </div>

            {/* Search Section */}
            <div className="relative mb-8">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                    <SearchIcon />
                </div>
                <input
                    type="search"
                    placeholder="Cari berdasarkan nama, ID, NIK, atau alamat wallet..." // <-- Perbarui placeholder, HAPUS KOMENTAR JSX DI SINI
                    value={q}
                    onChange={e => setQ(e.target.value)}
                    disabled={loading}
                    className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-blue-200 shadow-sm
                             bg-white/80 backdrop-blur-sm text-gray-800 placeholder:text-gray-500
                             focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none
                             transition-all duration-200 ease-in-out text-sm sm:text-base
                             hover:border-blue-300"
                />
            </div>

            {/* Statistics Card */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-blue-200 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Total Pasien</p>
                            <p className="text-2xl font-bold text-blue-600">{safeListPasien.length}</p>
                        </div>
                        <div className="p-3 bg-blue-100 rounded-full">
                            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                            </svg>
                        </div>
                    </div>
                </div>
                <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-blue-200 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Hasil Pencarian</p>
                            <p className="text-2xl font-bold text-green-600">{filtered.length}</p>
                        </div>
                        <div className="p-3 bg-green-100 rounded-full">
                            <SearchIcon />
                        </div>
                    </div>
                </div>
                <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-blue-200 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Status</p>
                            <p className="text-lg font-semibold text-gray-700">{loading ? "Memuat..." : "Aktif"}</p>
                        </div>
                        <div className={`p-3 rounded-full ${loading ? 'bg-yellow-100' : 'bg-green-100'}`}>
                            <div className={`w-3 h-3 rounded-full ${loading ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`}></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Table Section */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-xl overflow-hidden border border-blue-200">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[900px] text-sm">
                        <colgroup>
                            <col style={{ width: '60px' }} />
                            <col style={{ width: '15%' }} />
                            <col style={{ width: '20%' }} />
                            <col style={{ width: '20%' }} /> {/* Kolom NIK baru */}
                            <col style={{ minWidth: '300px' }} />
                            <col style={{ width: '120px' }} />
                        </colgroup>
                        <thead className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                            <tr>
                                <th className="py-4 px-4 font-semibold text-center">No.</th>
                                <th className="py-4 px-4 font-semibold text-left">ID Pasien</th>
                                <th className="py-4 px-4 font-semibold text-left">Nama</th>
                                <th className="py-4 px-4 font-semibold text-left">NIK</th> {/* <-- Tambahkan header NIK */}
                                <th className="py-4 px-4 font-semibold text-left">Alamat Wallet</th>
                                <th className="py-4 px-4 font-semibold text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-blue-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="py-12 px-4 text-center text-gray-500"> {/* <-- Ubah colSpan */}
                                        <div className="flex flex-col items-center space-y-3">
                                            <Spinner />
                                            <span className="text-lg">Memuat data pasien...</span>
                                            <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                                                <div className="h-full bg-blue-500 animate-pulse rounded-full"></div>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-12 px-4 text-center text-gray-500"> {/* <-- Ubah colSpan */}
                                        <div className="flex flex-col items-center space-y-3">
                                            <div className="p-4 bg-gray-100 rounded-full">
                                                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                                </svg>
                                            </div>
                                            <span className="text-lg">
                                                {q ? `Tidak ada pasien yang cocok dengan pencarian "${q}"` : "Belum ada pasien terdaftar"}
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((p, i) => (
                                    <tr
                                        key={p?.address || `pasien-${i}`}
                                        className="hover:bg-blue-50/50 transition-all duration-200 ease-in-out group"
                                    >
                                        <td className="py-4 px-4 text-center text-gray-600 font-medium">{i + 1}</td>
                                        <td className="py-4 px-4 text-left">
                                            <span className="text-gray-800 font-semibold bg-blue-50 px-2 py-1 rounded-md">
                                                {p?.ID || "-"}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4 text-left">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                                    {(p?.nama || "?").charAt(0).toUpperCase()}
                                                </div>
                                                <span className="text-gray-800 font-medium">{p?.nama || "-"}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-4 text-left"> {/* <-- Sel NIK baru */}
                                            <span className="text-gray-800 font-medium">{p?.NIK || "-"}</span>
                                        </td>
                                        <td className="py-4 px-4 text-left">
                                            <code className="text-xs bg-gray-100 px-2 py-1 rounded border text-gray-600 break-all">
                                                {p?.address || "Alamat tidak tersedia"}
                                            </code>
                                        </td>
                                        <td className="py-4 px-4 text-center">
                                            <button
                                                onClick={() => openDetailModal(p)}
                                                className="inline-flex items-center space-x-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 text-sm font-medium shadow-sm hover:shadow-md"
                                            >
                                                <EyeIcon />
                                                <span>Detail</span>
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Detail Pasien */}
            {showDetailModal && selectedPasienDetail && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto"
                    onClick={closeDetailModal}
                >
                    <div
                        className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg transform transition-all duration-300 scale-100"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h4 className="text-2xl font-bold text-gray-800">Detail Pasien</h4>
                            <button
                                onClick={closeDetailModal}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
                            >
                                <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-1 gap-4">
                                <div className="bg-gray-50 p-4 rounded-xl">
                                    <label className="text-sm font-medium text-gray-600">Nama Lengkap</label>
                                    <p className="text-lg font-semibold text-gray-800">{selectedPasienDetail.nama || '-'}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-gray-50 p-4 rounded-xl">
                                        <label className="text-sm font-medium text-gray-600">ID Pasien</label>
                                        <p className="text-gray-800 font-medium">{selectedPasienDetail.ID || '-'}</p>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-xl">
                                        <label className="text-sm font-medium text-gray-600">NIK</label> {/* <-- Tampilkan NIK di modal */}
                                        <p className="text-gray-800 font-medium">{selectedPasienDetail.NIK || '-'}</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-gray-50 p-4 rounded-xl">
                                        <label className="text-sm font-medium text-gray-600">Golongan Darah</label>
                                        <p className="text-gray-800 font-medium">{selectedPasienDetail.golonganDarah || '-'}</p>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-xl">
                                        <label className="text-sm font-medium text-gray-600">Tanggal Lahir</label>
                                        <p className="text-gray-800 font-medium">{selectedPasienDetail.tanggalLahir || '-'}</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-gray-50 p-4 rounded-xl">
                                        <label className="text-sm font-medium text-gray-600">Jenis Kelamin</label>
                                        <p className="text-gray-800 font-medium">{selectedPasienDetail.gender || '-'}</p>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-xl">
                                        <label className="text-sm font-medium text-gray-600">No. Telepon</label>
                                        <p className="text-gray-800 font-medium">{selectedPasienDetail.noTelepon || '-'}</p>
                                    </div>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-xl">
                                    <label className="text-sm font-medium text-gray-600">Alamat</label>
                                    <p className="text-gray-800">{selectedPasienDetail.alamat || '-'}</p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-xl">
                                    <label className="text-sm font-medium text-gray-600">Email</label>
                                    <p className="text-gray-800 font-medium text-sm">{selectedPasienDetail.email || '-'}</p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-xl">
                                    <label className="text-sm font-medium text-gray-600">Alamat Wallet</label>
                                    <code className="text-xs bg-white px-2 py-1 rounded border text-gray-600 break-all block mt-1">
                                        {selectedPasienDetail.address || '-'}
                                    </code>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-xl">
                                    <label className="text-sm font-medium text-gray-600">RS Penanggung Jawab</label>
                                    <p className="text-gray-800 font-medium text-sm">{selectedPasienDetail.rumahSakitPenanggungJawab || '-'}</p>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => fetchMedicalRecords(selectedPasienDetail.address)}
                            className="mt-6 w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                            disabled={medicalRecordsLoading}
                        >
                            {medicalRecordsLoading ? (
                                <>
                                    <Spinner />
                                    <span className="ml-2">Memuat Rekam Medis...</span>
                                </>
                            ) : (
                                <>
                                    <FileIcon />
                                    <span className="ml-2">Lihat Rekam Medis</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            )}

            {/* Modal Rekam Medis Pasien */}
            {showMedicalRecordModal && selectedPasienDetail && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto"
                    onClick={closeMedicalRecordModal}
                >
                    <div
                        className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-6xl transform transition-all duration-300 scale-100"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h4 className="text-2xl font-bold text-gray-800">Rekam Medis</h4>
                                <p className="text-gray-600">
                                    {selectedPasienDetail.nama} ({selectedPasienDetail.ID})
                                </p>
                            </div>
                            <button
                                onClick={closeMedicalRecordModal}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
                            >
                                <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {medicalRecordsLoading ? (
                            <div className="flex flex-col items-center justify-center py-12">
                                <Spinner />
                                <span className="ml-2 text-gray-600 mt-4">Memuat rekam medis...</span>
                            </div>
                        ) : medicalRecordsError ? (
                            <div className="text-center py-12">
                                <div className="p-4 bg-red-50 rounded-xl inline-block">
                                    <svg className="w-8 h-8 text-red-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.084 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                    </svg>
                                    <p className="text-red-600 font-medium">{medicalRecordsError}</p>
                                </div>
                            </div>
                        ) : medicalRecords.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="p-4 bg-gray-50 rounded-xl inline-block">
                                    <FileIcon />
                                    <p className="text-gray-600 mt-2">Tidak ada rekam medis untuk pasien ini.</p>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-gray-50 rounded-xl p-4 max-h-[70vh] overflow-auto">
                                <div className="overflow-x-auto">
                                    <table className="min-w-full bg-white rounded-lg shadow-sm">
                                        <thead className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white sticky top-0 z-10">
                                            <tr>
                                                <th className="py-3 px-4 text-left text-sm font-semibold">ID RM</th>
                                                <th className="py-3 px-4 text-left text-sm font-semibold">Tipe</th>
                                                <th className="py-3 px-4 text-left text-sm font-semibold">Diagnosa</th>
                                                <th className="py-3 px-4 text-left text-sm font-semibold">Catatan</th>
                                                <th className="py-3 px-4 text-left text-sm font-semibold">Pembuat</th>
                                                <th className="py-3 px-4 text-left text-sm font-semibold">Tanggal</th>
                                                <th className="py-3 px-4 text-left text-sm font-semibold">Foto</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {medicalRecords.map((rm, index) => (
                                                <tr key={rm.id} className={`hover:bg-blue-50 transition-colors duration-200 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                                                    <td className="py-3 px-4 text-sm font-medium text-gray-800">
                                                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md">
                                                            #{Number(rm.id)}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-4 text-sm text-gray-700">
                                                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded-md">
                                                            {rm.tipeRekamMedis || '-'}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-4 text-sm text-gray-700 max-w-xs">
                                                        <div className="break-words">{rm.diagnosa || '-'}</div>
                                                    </td>
                                                    <td className="py-3 px-4 text-sm text-gray-700 max-w-xs">
                                                        <div className="break-words">{rm.catatan || '-'}</div>
                                                    </td>
                                                    <td className="py-3 px-4 text-xs text-gray-600">
                                                        <code className="bg-gray-100 px-2 py-1 rounded text-xs break-all">
                                                            {rm.pembuat || '-'}
                                                        </code>
                                                    </td>
                                                    <td className="py-3 px-4 text-xs text-gray-600">
                                                        <div className="bg-yellow-50 px-2 py-1 rounded border-l-4 border-yellow-400">
                                                            {rm.timestampPembuatan || '-'}
                                                        </div>
                                                    </td>
                                                    <td className="py-3 px-4 text-xs">
                                                        {rm.foto ? (
                                                            <a
                                                                href={rm.foto}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="inline-flex items-center space-x-1 bg-blue-100 hover:bg-blue-200 text-blue-700 px-2 py-1 rounded-md transition-colors duration-200"
                                                            >
                                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                                </svg>
                                                                <span>Lihat</span>
                                                            </a>
                                                        ) : (
                                                            <span className="text-gray-400 italic">Tidak ada foto</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}