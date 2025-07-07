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

export default function ManagePasienPage({
    loading,
    listPasien, // [{ address, nama, ID, golonganDarah, tanggalLahir, gender, alamat, noTelepon, email }, …]
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
        const addressLower = (typeof p?.address === 'string' ? p.address.toLowerCase() : "");
        const queryLower = q.toLowerCase();
        return nameLower.includes(queryLower) || addressLower.includes(queryLower) || idLower.includes(queryLower);
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
        <div className="bg-slate-50 p-6 sm:p-8 rounded-xl sm:rounded-2xl shadow-xl w-full mx-auto my-8">
            <h3 className="text-2xl sm:text-2xl font-semibold mb-6 sm:mb-8 text-slate-700">
                Tabel Pasien Terdaftar
            </h3>

            <div className="relative mb-6 sm:mb-8">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <SearchIcon />
                </span>
                <input
                    type="search"
                    placeholder="Cari berdasarkan nama, ID, atau alamat wallet..."
                    value={q}
                    onChange={e => setQ(e.target.value)}
                    disabled={loading}
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-300 shadow-sm
                             bg-white text-slate-800 placeholder:text-slate-400
                             focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none
                             transition duration-150 ease-in-out text-sm sm:text-base"
                />
            </div>

            <div className="rounded-lg sm:rounded-xl shadow-lg overflow-hidden bg-white">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[900px] text-sm">
                        <colgroup>
                            <col style={{ width: '60px' }} />
                            <col style={{ width: '15%' }} />
                            <col style={{ width: '25%' }} />
                            <col style={{ minWidth: '400px' }} />
                        </colgroup>
                        <thead className="bg-blue-600 text-white">
                            <tr>
                                <th className="py-3.5 px-4 font-semibold text-center">No.</th>
                                <th className="py-3.5 px-4 font-semibold text-left">ID Pasien</th>
                                <th className="py-3.5 px-4 font-semibold text-left">Nama</th>
                                <th className="py-3.5 px-4 font-semibold text-left">Alamat Wallet</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="py-10 px-4 text-center text-slate-500">
                                        <div className="flex justify-center items-center space-x-2">
                                            <Spinner />
                                            <span>Memuat data pasien...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="py-8 px-4 text-center text-slate-500">
                                        {q ? "Tidak ada pasien yang cocok dengan pencarian Anda." : "Belum ada pasien terdaftar."}
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((p, i) => (
                                    <tr
                                        key={p?.address || `pasien-${i}`}
                                        className="hover:bg-blue-50 transition-colors duration-150 ease-in-out cursor-pointer"
                                        onClick={() => openDetailModal(p)}
                                    >
                                        <td className="py-3.5 px-4 text-center text-slate-600">{i + 1}</td>
                                        <td className="py-3.5 px-4 text-left text-slate-800 font-medium">{p?.ID || "-"}</td>
                                        <td className="py-3.5 px-4 text-left text-slate-800 font-medium">{p?.nama || "-"}</td>
                                        <td className="py-3.5 px-4 text-left text-slate-600 font-mono text-xs break-all">
                                            {p?.address || "Alamat tidak tersedia"}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {!loading && safeListPasien.length > 0 && filtered.length === 0 && q && (
                <p className="text-center text-slate-500 mt-6 text-sm">
                    Tidak ditemukan pasien dengan kata kunci "<span className="font-semibold">{q}</span>". Silakan coba kata kunci lain.
                </p>
            )}
            {!loading && safeListPasien.length === 0 && !q && (
                <p className="text-center text-slate-500 mt-6 text-sm">
                    Saat ini belum ada data pasien yang terdaftar di sistem.
                </p>
            )}

            {/* Modal Detail Pasien */}
            {showDetailModal && selectedPasienDetail && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4 overflow-y-auto"
                    onClick={closeDetailModal}
                >
                    <div
                        className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md animate-scaleIn transform duration-300 relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={closeDetailModal}
                            className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-3xl font-bold leading-none"
                            aria-label="Tutup"
                        >
                            &times;
                        </button>
                        <h4 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-3">Detail Pasien</h4>

                        <div className="space-y-4 text-gray-700 text-sm">
                            <p><strong>Nama:</strong> {selectedPasienDetail.nama || '-'}</p>
                            <p><strong>ID Pasien:</strong> {selectedPasienDetail.ID || '-'}</p>
                            <p><strong>Golongan Darah:</strong> {selectedPasienDetail.golonganDarah || '-'}</p>
                            <p><strong>Tanggal Lahir:</strong> {selectedPasienDetail.tanggalLahir || '-'}</p>
                            <p><strong>Gender:</strong> {selectedPasienDetail.gender || '-'}</p>
                            <p><strong>Alamat:</strong> {selectedPasienDetail.alamat || '-'}</p>
                            <p><strong>No. Telepon:</strong> {selectedPasienDetail.noTelepon || '-'}</p>
                            <p><strong>Email:</strong> {selectedPasienDetail.email || '-'}</p>
                            <p className="text-sm text-gray-600 break-all"><strong>Alamat Wallet:</strong> {selectedPasienDetail.address || '-'}</p>
                            <p className="text-sm text-gray-600 break-all"><strong>RS Penanggung Jawab:</strong> {selectedPasienDetail.rumahSakitPenanggungJawab || '-'}</p>
                        </div>
                        <button
                            onClick={() => fetchMedicalRecords(selectedPasienDetail.address)}
                            className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={medicalRecordsLoading}
                        >
                            {medicalRecordsLoading ? (
                                <>
                                    <Spinner />
                                    <span className="ml-2">Memuat Rekam Medis...</span>
                                </>
                            ) : (
                                "Lihat Rekam Medis"
                            )}
                        </button>
                    </div>
                </div>
            )}

            {/* Modal Rekam Medis Pasien */}
            {showMedicalRecordModal && selectedPasienDetail && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm p-4 overflow-y-auto"
                    onClick={closeMedicalRecordModal} // Tutup modal saat klik di luar konten
                >
                    <div
                        className="bg-white rounded-lg shadow-xl p-8 w-full max-w-2xl lg:max-w-4xl animate-scaleIn transform duration-300 relative"
                        onClick={(e) => e.stopPropagation()} // Cegah event klik menyebar ke latar belakang
                    >
                        <button
                            onClick={closeMedicalRecordModal}
                            className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-3xl font-bold leading-none"
                            aria-label="Tutup"
                        >
                            &times;
                        </button>
                        <h4 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-3">
                            Rekam Medis untuk {selectedPasienDetail.nama} ({selectedPasienDetail.ID})
                        </h4>

                        {medicalRecordsLoading ? (
                            <div className="flex justify-center items-center py-8">
                                <Spinner />
                                <span className="ml-2 text-gray-600">Memuat rekam medis...</span>
                            </div>
                        ) : medicalRecordsError ? (
                            <p className="text-red-500 text-center py-8">{medicalRecordsError}</p>
                        ) : medicalRecords.length === 0 ? (
                            <p className="text-gray-600 text-center py-8">Tidak ada rekam medis untuk pasien ini.</p>
                        ) : (
                            <div className="overflow-x-auto max-h-[60vh]"> {/* Batasi tinggi tabel rekam medis */}
                                <table className="min-w-full bg-white border border-gray-200">
                                    <thead className="bg-gray-100 sticky top-0 z-10">
                                        <tr>
                                            <th className="py-2 px-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">ID RM</th>
                                            <th className="py-2 px-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Tipe</th>
                                            <th className="py-2 px-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Diagnosa</th>
                                            <th className="py-2 px-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Catatan</th>
                                            <th className="py-2 px-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Pembuat</th>
                                            <th className="py-2 px-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Tanggal</th>
                                            <th className="py-2 px-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Foto (URL)</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {medicalRecords.map((rm) => (
                                            <tr key={rm.id} className="hover:bg-gray-50">
                                                <td className="py-2 px-3 whitespace-nowrap text-gray-800">{Number(rm.id)}</td>
                                                <td className="py-2 px-3 text-gray-800">{rm.tipeRekamMedis || '-'}</td>
                                                <td className="py-2 px-3 text-gray-800 break-words max-w-xs">{rm.diagnosa || '-'}</td>
                                                <td className="py-2 px-3 text-gray-800 break-words max-w-xs">{rm.catatan || '-'}</td>
                                                <td className="py-2 px-3 text-gray-800 font-mono text-xs">{rm.pembuat || '-'}</td>
                                                <td className="py-2 px-3 whitespace-nowrap text-gray-800 text-xs">{rm.timestampPembuatan || '-'}</td>
                                                <td className="py-2 px-3 text-blue-500 hover:underline cursor-pointer text-xs break-all">
                                                    {rm.foto ? <a href={rm.foto} target="_blank" rel="noopener noreferrer">Lihat Foto</a> : '-'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}