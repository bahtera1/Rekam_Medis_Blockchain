import React, { useState } from "react";

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

    const commonSelectClass =
        "w-full border border-gray-300 rounded-md px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition duration-150 ease-in-out disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed bg-white";

    const commonThClass = "px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider";

    return (
        <div className="space-y-8">
            {/* Card 1: Form Assign Pasien */}
            <div className="bg-white rounded-xl shadow-xl p-6 sm:p-8">
                <h3 className="text-2xl font-semibold text-slate-800 mb-6 border-b pb-3">
                    Assign Pasien ke Dokter
                </h3>
                <div className="space-y-4 mb-6">
                    <select
                        value={selectedDokter}
                        onChange={(e) => setSelectedDokter(e.target.value)}
                        disabled={loading}
                        className={commonSelectClass}
                    >
                        <option value="">Pilih Dokter</option>
                        {dokterList.map((dokter) => (
                            <option key={dokter.address} value={dokter.address}>
                                {/* --- PERUBAHAN DI SINI: Tampilkan spesialisasi dan nomor lisensi --- */}
                                {dokter.nama} - (Spesialis {dokter.spesialisasi}) (Lisensi: {dokter.nomorLisensi}) ({dokter.address.substring(0, 6)}...{dokter.address.substring(dokter.address.length - 4)})
                                {/* --- AKHIR PERUBAHAN --- */}
                            </option>
                        ))}
                    </select>

                    <select
                        value={pasienAddress}
                        onChange={(e) => setPasienAddress(e.target.value)}
                        disabled={loading}
                        className={commonSelectClass}
                    >
                        <option value="">Pilih Pasien</option>
                        {listPasien.map((pasien) => (
                            <option key={pasien.address} value={pasien.address}>
                                {pasien.nama || "Nama Belum Terdaftar"} ({pasien.address.substring(0, 6)}...{pasien.address.substring(pasien.address.length - 4)})
                            </option>
                        ))}
                    </select>
                </div>

                <button
                    onClick={assignPasien}
                    disabled={loading || !selectedDokter || !pasienAddress}
                    className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-8 py-2.5 rounded-lg font-semibold transition duration-150 ease-in-out disabled:opacity-60 disabled:cursor-not-allowed"
                >
                    {loading ? "Memproses..." : "Assign Pasien"}
                </button>
            </div>

            {/* Card 2: Daftar Pasangan Dokter - Pasien */}
            <div className="bg-white rounded-xl shadow-xl p-6 sm:p-8">
                <h3 className="text-2xl font-semibold text-slate-800 mb-6">
                    Daftar Pasangan Dokter - Pasien
                </h3>
                {!assignedPairs || assignedPairs.length === 0 ? (
                    <p className="italic text-gray-500 text-center py-4">
                        Belum ada pasangan dokter dan pasien yang di-assign.
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
                                    <th className={`${commonThClass} text-center`}>Daftar Pasien</th>
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
                                                                            <th className="px-3 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Nama</th>
                                                                            <th className="px-3 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider min-w-40">Alamat Wallet</th>
                                                                            <th className="px-3 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Aksi</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody className="divide-y divide-gray-100">
                                                                        {pair.pasienList.map((p, i) => (
                                                                            <tr key={p.address} className="hover:bg-slate-50 transition-colors">
                                                                                <td className="px-3 py-2 text-sm text-gray-600 text-center align-middle">{i + 1}</td>
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