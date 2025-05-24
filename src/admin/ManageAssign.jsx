import React, { useState } from "react";

export default function ManageAssign({
    dokterList,
    listPasien,
    selectedDokter,
    setSelectedDokter,
    pasienAddress,
    setPasienAddress,
    assignPasien,
    loading,
    assignedPairs,
}) {
    const [openIndex, setOpenIndex] = useState(null);

    return (
        <div>
            <h3 className="text-xl font-bold mb-4 text-blue-800">Assign Pasien ke Dokter</h3>
            <select
                value={selectedDokter}
                onChange={(e) => setSelectedDokter(e.target.value)}
                disabled={loading}
                className="w-full mb-2 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
                <option value="">Pilih Dokter</option>
                {dokterList.map((dokter) => (
                    <option key={dokter.address} value={dokter.address}>
                        {dokter.nama} ({dokter.address})
                    </option>
                ))}
            </select>

            <select
                value={pasienAddress}
                onChange={(e) => setPasienAddress(e.target.value)}
                disabled={loading}
                className="w-full mb-2 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
                <option value="">Pilih Pasien</option>
                {listPasien.map((pasien) => (
                    <option key={pasien.address} value={pasien.address}>
                        {pasien.nama || pasien.address}
                    </option>
                ))}
            </select>

            <button
                onClick={assignPasien}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold mb-6 transition"
            >
                {loading ? "Loading..." : "Assign Pasien"}
            </button>

            <div className="bg-slate-50 mt-6 p-6 rounded-xl shadow-lg">
                <h3 className="text-lg font-semibold text-blue-700 mb-4">Daftar Pasangan Dokter - Pasien</h3>
                {(!assignedPairs || assignedPairs.length === 0) ? (
                    <p className="italic text-gray-500">Belum ada pasangan dokter dan pasien yang diassign.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-300 bg-white rounded-lg shadow">
                            <thead className="bg-blue-700 text-white">
                                <tr>
                                    <th className="w-16 px-3 py-2 text-center">No.</th>
                                    <th className="w-44 px-3 py-2 text-left">Nama Dokter</th>
                                    <th className="w-40 px-3 py-2 text-left">No. Lisensi</th>
                                    <th className="w-72 px-3 py-2 text-left">Alamat Dokter</th>
                                    <th className="w-56 px-3 py-2 text-center">Daftar Pasien</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white">
                                {assignedPairs.map((pair, idx) => (
                                    <React.Fragment key={idx}>
                                        <tr className="hover:bg-blue-50">
                                            <td className="px-3 py-2 text-center align-middle">{idx + 1}</td>
                                            <td className="px-3 py-2 text-left align-middle">{pair.dokterNama}</td>
                                            <td className="px-3 py-2 text-left align-middle">{pair.dokterLisensi}</td>
                                            <td className="px-3 py-2 text-left text-xs align-middle">{pair.dokterAddress}</td>
                                            <td className="px-3 py-2 text-center align-middle">
                                                <button
                                                    onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                                                    className={`bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded transition ${openIndex === idx ? "font-bold" : ""}`}
                                                >
                                                    {openIndex === idx
                                                        ? "Sembunyikan Pasien"
                                                        : `Tampilkan Pasien (${pair.pasienList.length})`}
                                                </button>
                                            </td>
                                        </tr>
                                        {openIndex === idx && (
                                            <tr>
                                                <td colSpan={5} className="bg-blue-50 px-0 py-0">
                                                    <div className="overflow-x-auto p-2">
                                                        <table className="min-w-full bg-white rounded-md">
                                                            <thead>
                                                                <tr className="bg-blue-500 text-white">
                                                                    <th className="w-14 px-2 py-1 text-center">No.</th>
                                                                    <th className="w-44 px-2 py-1 text-left">Nama</th>
                                                                    <th className="w-72 px-2 py-1 text-left">Alamat Wallet</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {pair.pasienList.map((p, i) => (
                                                                    <tr key={p.address} className="hover:bg-blue-100">
                                                                        <td className="text-center px-2 py-1 align-middle">{i + 1}</td>
                                                                        <td className="px-2 py-1 text-left align-middle">{p.nama}</td>
                                                                        <td className="px-2 py-1 text-left text-xs align-middle">{p.address}</td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
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
