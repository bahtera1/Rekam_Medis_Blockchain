import React, { useState } from "react";
import Select from 'react-select'; // <--- Import react-select

export default function ManageAssign({
    dokterList,
    listPasien,
    selectedDokter,
    setSelectedDokter,
    pasienAddress,
    setPasienAddress,
    assignPasien,
    unassignPasien,
    loading,
    assignedPairs,
}) {
    const [openIndex, setOpenIndex] = useState(null);

    const commonThClass = "px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider";

    // Siapkan data untuk react-select
    const dokterOptions = dokterList.map(dokter => ({
        value: dokter.address,
        label: `${dokter.nama} - ${dokter.spesialisasi} (Lisensi: ${dokter.nomorLisensi}) (${dokter.address.substring(0, 6)}...${dokter.address.substring(dokter.address.length - 4)})`
    }));

    const pasienOptions = listPasien.map(pasien => ({
        value: pasien.address,
        label: `${pasien.nama || "Nama Belum Terdaftar"} (ID: ${pasien.ID || "-"}) (${pasien.address.substring(0, 6)}...${pasien.address.substring(pasien.address.length - 4)})` // Ditambahkan ID
    }));

    // Gaya kustom untuk react-select agar mirip dengan input Tailwind lainnya
    const customStyles = {
        control: (provided, state) => ({
            ...provided,
            borderColor: state.isFocused ? '#3B82F6' : '#D1D5DB', // Warna border biru saat fokus
            boxShadow: state.isFocused ? '0 0 0 1px #3B82F6' : 'none', // Ring saat fokus
            borderRadius: '0.375rem', // rounded-md
            minHeight: '2.5rem', // py-2.5 (disesuaikan)
            padding: '0.375rem 0.75rem', // px-4 (disesuaikan)
            backgroundColor: state.isDisabled ? '#F3F4F6' : 'white', // bg-slate-100 saat disabled
            color: state.isDisabled ? '#6B7280' : provided.color, // text-slate-500 saat disabled
            cursor: state.isDisabled ? 'not-allowed' : 'default',
            transition: 'all 150ms ease-in-out',
        }),
        option: (provided, state) => ({
            ...provided,
            backgroundColor: state.isSelected ? '#3B82F6' : state.isFocused ? '#EFF6FF' : null, // bg-blue-600 selected, bg-blue-50 focused
            color: state.isSelected ? 'white' : '#1F2937', // text-white selected, text-gray-800 normal
            cursor: 'pointer',
            padding: '0.5rem 1rem',
        }),
        singleValue: (provided) => ({
            ...provided,
            color: '#1F2937', // text-gray-800
        }),
        placeholder: (provided) => ({
            ...provided,
            color: '#9CA3AF', // placeholder-gray-400
        }),
        dropdownIndicator: (provided) => ({
            ...provided,
            color: '#9CA3AF', // Warna ikon dropdown
            '&:hover': {
                color: '#6B7280',
            }
        }),
        clearIndicator: (provided) => ({
            ...provided,
            color: '#9CA3AF',
            '&:hover': {
                color: '#6B7280',
            }
        }),
        menu: (provided) => ({
            ...provided,
            borderRadius: '0.375rem',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
            marginTop: '0.25rem',
        }),
    };


    return (
        <div className="space-y-8">
            {/* Card 1: Form Tugaskan Dokter ke Pasien */}
            <div className="bg-white rounded-xl shadow-xl p-6 sm:p-8">
                <h3 className="text-2xl font-semibold text-slate-800 mb-6 border-b pb-3">
                    Tugaskan Dokter ke Pasien
                </h3>
                <div className="space-y-4 mb-6">
                    {/* Dropdown Pilih Pasien (sekarang yang pertama) */}
                    <Select
                        options={pasienOptions}
                        value={pasienOptions.find(option => option.value === pasienAddress) || null}
                        onChange={selectedOption => setPasienAddress(selectedOption ? selectedOption.value : '')}
                        isDisabled={loading}
                        placeholder="Pilih Pasien"
                        isClearable={true}
                        isSearchable={true}
                        styles={customStyles}
                        classNamePrefix="react-select"
                    />

                    {/* Dropdown Pilih Dokter (sekarang yang kedua) */}
                    <Select
                        options={dokterOptions}
                        value={dokterOptions.find(option => option.value === selectedDokter) || null}
                        onChange={selectedOption => setSelectedDokter(selectedOption ? selectedOption.value : '')}
                        isDisabled={loading}
                        placeholder="Pilih Dokter"
                        isClearable={true}
                        isSearchable={true}
                        styles={customStyles}
                        classNamePrefix="react-select"
                    />
                </div>

                <button
                    onClick={assignPasien}
                    disabled={loading || !selectedDokter || !pasienAddress}
                    className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-8 py-2.5 rounded-lg font-semibold transition duration-150 ease-in-out disabled:opacity-60 disabled:cursor-not-allowed"
                >
                    {loading ? "Memproses..." : "Tugaskan Dokter"} {/* Teks tombol disesuaikan */}
                </button>
            </div>

            {/* Card 2: Daftar Penugasan Dokter - Pasien */}
            <div className="bg-white rounded-xl shadow-xl p-6 sm:p-8">
                {/* Judul ini sekarang memiliki border-b untuk konsistensi */}
                <h3 className="text-2xl font-semibold text-slate-800 mb-6 border-b pb-3">
                    Tabel Penugasan Dokter - Pasien
                </h3>
                {!assignedPairs || assignedPairs.length === 0 ? (
                    <p className="italic text-gray-500 text-center py-4">
                        Belum ada penugasan .
                    </p>
                ) : (
                    <div className="overflow-x-auto rounded-lg border border-gray-200">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-slate-100">
                                <tr>
                                    <th className={`${commonThClass} text-center w-16`}>No.</th>
                                    <th className={commonThClass}>Nama Dokter</th>
                                    <th className={commonThClass}>No. Lisensi</th>
                                    <th className={`${commonThClass} min-w-48`}>Alamat Dokter</th>
                                    <th className={`${commonThClass} text-center`}>Tabel Pasien Ditugaskan</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {assignedPairs.map((pair, idx) => (
                                    <React.Fragment key={idx}>
                                        <tr className="hover:bg-slate-50 transition-colors duration-150">
                                            <td className="px-4 py-3 text-sm text-gray-700 text-center align-middle">{idx + 1}</td>
                                            <td className="px-4 py-3 text-sm text-gray-900 font-medium align-middle">{pair.dokterNama}</td>
                                            <td className="px-4 py-3 text-sm text-gray-700 align-middle">{pair.dokterLisensi}</td>
                                            <td className="px-4 py-3 text-xs text-gray-600 align-middle" title={pair.dokterAddress}>
                                                {pair.dokterAddress.substring(0, 12)}...{pair.dokterAddress.substring(pair.dokterAddress.length - 8)}
                                            </td>
                                            <td className="px-4 py-3 text-center align-middle">
                                                <button
                                                    onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                                                    className={`inline-flex items-center text-sm font-medium px-3 py-1.5 rounded-md transition-all duration-150 ease-in-out
                                                    ${openIndex === idx
                                                            ? "bg-blue-600 text-white hover:bg-blue-700"
                                                            : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                                                        }`}
                                                >
                                                    {openIndex === idx ? "Sembunyikan" : `Tampilkan (${pair.pasienList.length})`}
                                                </button>
                                            </td>
                                        </tr>
                                        {openIndex === idx && (
                                            <tr>
                                                <td colSpan={5} className="p-0 bg-slate-50">
                                                    <div className="p-3 m-2 border border-slate-200 rounded-md bg-white shadow-inner">
                                                        {pair.pasienList.length === 0 ? (
                                                            <p className="text-sm text-gray-500 italic text-center py-3">Tidak ada pasien untuk dokter ini.</p>
                                                        ) : (
                                                            <div className="overflow-x-auto">
                                                                <table className="min-w-full">
                                                                    <thead className="bg-slate-100">
                                                                        <tr>
                                                                            <th className="px-3 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider w-14">No.</th>
                                                                            <th className="px-3 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">ID Pasien</th> {/* Ditambahkan kolom ID Pasien */}
                                                                            <th className="px-3 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Nama Pasien</th>
                                                                            <th className="px-3 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider min-w-40">Alamat Wallet Pasien</th>
                                                                            <th className="px-3 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Aksi</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody className="divide-y divide-gray-100">
                                                                        {pair.pasienList.map((p, i) => (
                                                                            <tr key={p.address} className="hover:bg-slate-50 transition-colors">
                                                                                <td className="px-3 py-2 text-sm text-gray-600 text-center align-middle">{i + 1}</td>
                                                                                <td className="px-3 py-2 text-sm text-gray-800 align-middle">{p.ID || "-"}</td> {/* Tampilkan ID Pasien */}
                                                                                <td className="px-3 py-2 text-sm text-gray-800 align-middle">{p.nama || "Nama Belum Ada"}</td>
                                                                                <td className="px-3 py-2 text-xs text-gray-500 align-middle" title={p.address}>
                                                                                    {p.address.substring(0, 10)}...{p.address.substring(p.address.length - 6)}
                                                                                </td>
                                                                                <td className="px-3 py-2 text-center align-middle">
                                                                                    <button
                                                                                        onClick={() => unassignPasien(pair.dokterAddress, p.address)}
                                                                                        disabled={loading}
                                                                                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-md text-xs font-medium transition duration-150 ease-in-out disabled:opacity-60 disabled:cursor-not-allowed"
                                                                                    >
                                                                                        Hapus
                                                                                    </button>
                                                                                </td>
                                                                            </tr>
                                                                        ))}
                                                                    </tbody>
                                                                </table>
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}