// ManageAssign.js

import React, { useState } from "react";
import Select from 'react-select';

// --- Komponen Ikon ---
const ChevronDownIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
);
const TrashIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
);

// --- Komponen Utama ---
export default function ManageAssign({
    dokterList,
    listPasien, // Prop ini sudah berisi data NIK pasien dari AdminPage
    selectedDokter,
    setSelectedDokter,
    pasienAddress,
    setPasienAddress,
    assignPasien,
    unassignPasien,
    loading,
    assignedPairs,
    onAssignmentChange,
}) {
    const [openIndex, setOpenIndex] = useState(null);

    // Opsi dan style untuk react-select
    const dokterOptions = dokterList.map(dokter => ({
        value: dokter.address,
        // Tampilkan nama dan spesialisasi di label dropdown
        label: `${dokter.nama} - ${dokter.spesialisasi} (${dokter.nomorLisensi})`
    }));

    // --- MODIFIKASI PENTING DI SINI: pasienOptions ---
    const pasienOptions = listPasien.map(pasien => ({
        value: pasien.address,
        // Tampilkan nama dan NIK pasien di label dropdown
        label: `${pasien.nama || "N/A"} (ID: ${pasien.ID || "-"}) (NIK: ${pasien.NIK || "-"})`
    }));

    const customStyles = {
        control: (p, s) => ({ ...p, borderColor: s.isFocused ? '#3B82F6' : '#D1D5DB', boxShadow: s.isFocused ? '0 0 0 1px #3B82F6' : 'none', borderRadius: '0.75rem', padding: '0.5rem', transition: 'all 150ms ease-in-out' }),
        option: (p, s) => ({ ...p, backgroundColor: s.isSelected ? '#3B82F6' : s.isFocused ? '#EFF6FF' : null, color: s.isSelected ? 'white' : '#1F2937', cursor: 'pointer', padding: '0.75rem 1rem' }),
        menu: (p) => ({ ...p, borderRadius: '0.75rem', marginTop: '0.5rem' })
    };

    const handleAssign = async () => {
        await assignPasien();
        if (onAssignmentChange) {
            onAssignmentChange();
        }
    };

    const handleUnassign = async (dokterAddress, pasienAddressToUnassign) => {
        await unassignPasien(dokterAddress, pasienAddressToUnassign);
        if (onAssignmentChange) {
            onAssignmentChange();
        }
    };

    return (
        <div className="space-y-10">
            {/* --- Card 1: Form Penugasan Baru --- */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-blue-200">
                <h3 className="text-2xl font-bold text-gray-800 mb-6 border-b border-gray-200 pb-4">
                    Formulir Penugasan Baru
                </h3>
                <div className="space-y-6">
                    <div>
                        <label htmlFor="select-pasien" className="block text-sm font-medium text-gray-700 mb-2">Pilih Pasien</label>
                        <Select id="select-pasien" options={pasienOptions} value={pasienOptions.find(o => o.value === pasienAddress) || null} onChange={opt => setPasienAddress(opt ? opt.value : '')} isDisabled={loading} placeholder="Cari nama atau ID pasien..." styles={customStyles} />
                    </div>
                    <div>
                        <label htmlFor="select-dokter" className="block text-sm font-medium text-gray-700 mb-2">Pilih Dokter</label>
                        <Select id="select-dokter" options={dokterOptions} value={dokterOptions.find(o => o.value === selectedDokter) || null} onChange={opt => setSelectedDokter(opt ? opt.value : '')} isDisabled={loading} placeholder="Cari nama atau spesialisasi dokter..." styles={customStyles} />
                    </div>
                    <div className="pt-4 flex justify-end">
                        <button onClick={handleAssign} disabled={loading || !selectedDokter || !pasienAddress} className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3 px-8 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none">
                            {loading ? "Memproses..." : "Tugaskan"}
                        </button>
                    </div>
                </div>
            </div>

            {/* --- Card 2: Tabel Penugasan Aktif --- */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-xl overflow-hidden border border-blue-200">
                <div className="p-8 border-b border-gray-200">
                    <h3 className="text-2xl font-bold text-gray-800">Daftar Penugasan Aktif</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[1024px] text-sm">
                        <thead className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                            <tr>
                                <th className="py-4 px-4 font-semibold text-center w-16">No.</th>
                                <th className="py-4 px-4 font-semibold text-left">Nama Dokter</th>
                                <th className="py-4 px-4 font-semibold text-left">Spesialisasi</th>
                                <th className="py-4 px-4 font-semibold text-left">No. Lisensi</th>
                                <th className="py-4 px-4 font-semibold text-center">Pasien Ditangani</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-blue-100">
                            {loading && (
                                <tr><td colSpan={5} className="text-center py-12 text-gray-500">Memuat data...</td></tr>
                            )}
                            {!loading && (!assignedPairs || assignedPairs.length === 0) && (
                                <tr><td colSpan={5} className="text-center py-12 text-gray-500 italic">Belum ada penugasan yang dibuat.</td></tr>
                            )}
                            {!loading && assignedPairs.map((pair, idx) => {
                                const displayPasienList = pair.pasienList;

                                return (
                                    <React.Fragment key={idx}>
                                        <tr className="hover:bg-blue-50/50 transition-colors duration-200 group">
                                            <td className="py-4 px-4 text-center text-gray-600 font-medium">{idx + 1}</td>
                                            <td className="py-4 px-4">
                                                <div className="font-semibold text-gray-800">{pair.dokterNama}</div>
                                            </td>
                                            <td className="py-4 px-4">
                                                <div className="text-gray-800">{pair.dokterSpesialisasi}</div>
                                            </td>
                                            <td className="py-4 px-4">
                                                <code className="bg-gray-100 text-gray-800 px-2 py-1 rounded-md text-xs font-mono">{pair.dokterLisensi}</code>
                                            </td>
                                            <td className="py-4 px-4 text-center">
                                                <button onClick={() => setOpenIndex(openIndex === idx ? null : idx)} className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-lg transition-colors duration-200 text-sm font-medium">
                                                    <span>{openIndex === idx ? "Sembunyikan" : `Tampilkan (${displayPasienList.length})`}</span>
                                                    <ChevronDownIcon />
                                                </button>
                                            </td>
                                        </tr>
                                        {openIndex === idx && (
                                            <tr className="bg-blue-50/40">
                                                <td colSpan={5} className="p-0">
                                                    <div className="p-4 m-4 bg-white rounded-xl shadow-inner border">
                                                        {displayPasienList.length === 0 ? (
                                                            <p className="text-sm text-gray-500 italic text-center py-3">Dokter ini tidak memiliki pasien yang berafiliasi dengan RS Anda.</p>
                                                        ) : (
                                                            <table className="min-w-full">
                                                                <thead>
                                                                    <tr className="border-b border-gray-200">
                                                                        <th className="py-2 px-3 text-left text-xs font-semibold text-gray-500">Nama Pasien</th>
                                                                        <th className="py-2 px-3 text-left text-xs font-semibold text-gray-500">ID Pasien</th>
                                                                        <th className="py-2 px-3 text-left text-xs font-semibold text-gray-500">NIK Pasien</th> {/* New Header for NIK */}
                                                                        <th className="py-2 px-3 text-center text-xs font-semibold text-gray-500">Aksi</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {displayPasienList.map((p, i) => (
                                                                        <tr key={i} className="hover:bg-red-50/50 border-b border-gray-100 last:border-b-0">
                                                                            <td className="py-3 px-3 text-sm text-gray-700">{p.nama}</td>
                                                                            <td className="py-3 px-3 text-sm text-gray-700">
                                                                                <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-md text-xs">{p.ID}</span>
                                                                            </td>
                                                                            <td className="py-3 px-3 text-sm text-gray-700"> {/* New Cell for NIK */}
                                                                                <span className="text-gray-800 px-2 py-1 rounded-md text-xs">{p.NIK || '-'}</span>
                                                                            </td>
                                                                            <td className="py-3 px-3 text-center">
                                                                                <button onClick={() => handleUnassign(pair.dokterAddress, p.address)} disabled={loading} className="inline-flex items-center space-x-1 bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1.5 rounded-md text-xs font-medium transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed">
                                                                                    <TrashIcon />
                                                                                    <span>Lepas Tugas</span>
                                                                                </button>
                                                                            </td>
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}