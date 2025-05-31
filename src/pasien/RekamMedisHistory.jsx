import React, { useEffect, useState } from "react";
import contract from "../contract";

export default function RekamMedisHistory({ rekamMedisId }) {
    const [allRecordsFlat, setAllRecordsFlat] = useState([]); // Semua versi rekam medis, diratakan dan diformat
    const [updateHistory, setUpdateHistory] = useState({}); // { id: [{dokter, timestamp}, ...] }
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchHistory() {
            setLoading(true);
            setError(null);
            setAllRecordsFlat([]); // Bersihkan data sebelumnya
            setUpdateHistory({});

            if (!rekamMedisId || (Array.isArray(rekamMedisId) && rekamMedisId.length === 0)) {
                setLoading(false);
                return;
            }

            try {
                let idsToFetch = Array.isArray(rekamMedisId) ? rekamMedisId : [rekamMedisId];
                let tempAllRecords = [];
                let tempUpdateHistories = {};

                for (const id of idsToFetch) {
                    const idStr = id.toString();

                    // 1. Ambil versi historis dari rekam medis
                    let versionsRaw = [];
                    try {
                        versionsRaw = await contract.methods.getRekamMedisVersions(idStr).call();
                        // console.log(`Raw versions for ID ${idStr}:`, versionsRaw); // Debugging
                    } catch (e) {
                        console.warn(`Could not fetch versions for RM ID ${idStr}:`, e);
                    }

                    // 2. Ambil data rekam medis terbaru (current state)
                    let latestDataFromContract = null;
                    try {
                        // Urutan return dari getRekamMedis: uint id, address pasien, string diagnosa, string foto, string catatan, bool valid
                        const result = await contract.methods.getRekamMedis(idStr).call();
                        latestDataFromContract = {
                            id: result[0].toString(),
                            pasien: result[1],
                            diagnosa: result[2],
                            foto: result[3],
                            catatan: result[4],
                            valid: result[5],
                        };
                        // console.log(`Latest data for ID ${idStr}:`, latestDataFromContract); // Debugging
                    } catch (e) {
                        console.warn(`Could not fetch latest data for RM ID ${idStr}:`, e);
                    }

                    // 3. Gabungkan versi historis dan versi terbaru, pastikan unik dan urut
                    let combinedVersions = [];
                    // Tambahkan versi historis yang sudah ada
                    versionsRaw.forEach((v, idx) => {
                        combinedVersions.push({
                            id: v.id.toString(),
                            pasien: v.pasien,
                            diagnosa: v.diagnosa,
                            foto: v.foto,
                            catatan: v.catatan,
                            valid: v.valid,
                            versiKe: idx + 1, // Versi historis
                        });
                    });

                    // Tambahkan versi terbaru jika ada dan belum termasuk di historis
                    if (latestDataFromContract) {
                        // Cek apakah versi terbaru sudah ada di versionsRaw (jika update terbaru tidak selalu menambah versi)
                        const isLatestAlreadyInHistory = combinedVersions.some(
                            v => v.diagnosa === latestDataFromContract.diagnosa &&
                                v.foto === latestDataFromContract.foto &&
                                v.catatan === latestDataFromContract.catatan &&
                                v.valid === latestDataFromContract.valid &&
                                v.id === latestDataFromContract.id // Penting: pastikan ID juga sama
                        );

                        if (!isLatestAlreadyInHistory) {
                            combinedVersions.push({
                                ...latestDataFromContract,
                                versiKe: combinedVersions.length + 1, // Versi terbaru
                            });
                        }
                    }

                    // Urutkan versi secara descending (versi paling baru di atas)
                    combinedVersions.sort((a, b) => b.versiKe - a.versiKe);

                    // Tambahkan metadata untuk rowspan di tabel
                    combinedVersions = combinedVersions.map((v, idx) => ({
                        ...v,
                        isFirstRowForId: idx === 0,
                        rowSpanCount: combinedVersions.length,
                    }));
                    tempAllRecords = tempAllRecords.concat(combinedVersions);

                    // 4. Ambil riwayat update (dokter dan timestamp)
                    try {
                        const [dokters, timestamps] = await contract.methods.getRekamMedisUpdateHistory(idStr).call();
                        tempUpdateHistories[idStr] = dokters.map((dokter, i) => ({
                            dokter,
                            timestamp: parseInt(timestamps[i], 10) || 0,
                        }));
                    } catch (e) {
                        console.warn(`Could not fetch update history for RM ID ${idStr}:`, e);
                        tempUpdateHistories[idStr] = [];
                    }
                }

                // Urutkan semua rekam medis dari ID yang berbeda berdasarkan ID (tertinggi di atas)
                // dan kemudian berdasarkan versi (tertinggi di atas)
                tempAllRecords.sort((a, b) => {
                    const idDiff = parseInt(b.id) - parseInt(a.id);
                    if (idDiff !== 0) return idDiff;
                    return b.versiKe - a.versiKe;
                });

                // Perbaiki `isFirstRowForId` dan `rowSpanCount` setelah sorting global
                const finalGroupedRecords = {};
                tempAllRecords.forEach(record => {
                    if (!finalGroupedRecords[record.id]) {
                        finalGroupedRecords[record.id] = [];
                    }
                    finalGroupedRecords[record.id].push(record);
                });

                let finalFlatRecords = [];
                Object.keys(finalGroupedRecords).sort((a, b) => parseInt(b) - parseInt(a)).forEach(id => {
                    const group = finalGroupedRecords[id].sort((a, b) => b.versiKe - a.versiKe); // Sort each group
                    group.forEach((record, idx) => {
                        finalFlatRecords.push({
                            ...record,
                            isFirstRowForId: idx === 0,
                            rowSpanCount: group.length,
                        });
                    });
                });

                setAllRecordsFlat(finalFlatRecords);
                setUpdateHistory(tempUpdateHistories);

            } catch (err) {
                setError("Gagal memuat riwayat rekam medis.");
                console.error("Kesalahan dalam fetching history:", err);
            } finally {
                setLoading(false);
            }
        }

        fetchHistory();
    }, [rekamMedisId]); // Dependency array: re-fetch jika rekamMedisId berubah

    const filtered = allRecordsFlat.filter(
        (item) =>
            item.diagnosa.toLowerCase().includes(search.toLowerCase()) ||
            item.catatan.toLowerCase().includes(search.toLowerCase())
    );

    const formatTimestamp = (ts) => {
        if (!ts) return "-";
        const date = new Date(ts * 1000);
        return date.toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });
    };

    return (
        <div className="w-full p-4">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                <h3 className="text-xl font-semibold text-blue-700">Riwayat Rekam Medis Detail</h3>
                <input
                    type="text"
                    className="border border-blue-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 w-full sm:w-80 shadow-sm"
                    placeholder="Cari diagnosa atau catatan..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">{error}</div>}

            <div className="overflow-x-auto shadow-lg rounded-xl border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-blue-600 text-white">
                        <tr>
                            <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider border-r border-blue-500">No.</th>
                            <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider border-r border-blue-500">ID RM</th>
                            <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider border-r border-blue-500">Versi</th>
                            <th className="px-4 py-3 text-left font-semibold uppercase tracking-wider border-r border-blue-500">Diagnosa</th>
                            <th className="px-4 py-3 text-left font-semibold uppercase tracking-wider border-r border-blue-500">Catatan</th>
                            <th className="px-4 py-3 text-center font-semibold uppercase tracking-wider border-r border-blue-500">Foto</th>
                            <th className="px-4 py-3 text-left font-semibold uppercase tracking-wider">Riwayat Update</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                        {loading ? (
                            <tr>
                                <td colSpan={7} className="text-center py-8 text-gray-500 text-lg">
                                    Memuat data riwayat...
                                </td>
                            </tr>
                        ) : filtered.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="text-center py-8 text-gray-500 italic text-lg">
                                    Tidak ada riwayat rekam medis ditemukan.
                                </td>
                            </tr>
                        ) : (
                            filtered.map((item, idx) => {
                                const updates = updateHistory[item.id] || [];
                                // Sesuaikan update info dengan versi yang ditampilkan
                                const currentUpdateInfo = updates.length > 0 && item.versiKe > 0 && (item.versiKe - 1) < updates.length
                                    ? updates[item.versiKe - 1]
                                    : null;

                                return (
                                    <tr key={`${item.id}-${item.versiKe}`} className="hover:bg-blue-50 transition-colors">
                                        {item.isFirstRowForId && (
                                            <td rowSpan={item.rowSpanCount} className="text-center px-4 py-3 align-top border-r text-gray-700">
                                                {/* Ini akan menampilkan nomor urut untuk ID RM (bukan versi) */}
                                                {/* Perlu logika tambahan untuk mendapatkan nomor urut unik per ID RM */}
                                                {filtered.filter(f => f.isFirstRowForId && parseInt(f.id) >= parseInt(item.id)).length}
                                            </td>
                                        )}
                                        {item.isFirstRowForId && (
                                            <td rowSpan={item.rowSpanCount} className="px-4 py-3 align-top border-r font-mono text-gray-800 text-sm break-all">
                                                {item.id}
                                            </td>
                                        )}
                                        <td className="px-4 py-3 text-center border-r text-gray-700">
                                            {item.versiKe}
                                        </td>
                                        <td className="px-4 py-3 border-r break-words text-gray-800 max-w-xs">
                                            {item.diagnosa}
                                        </td>
                                        <td className="px-4 py-3 border-r break-words text-gray-600 max-w-xs">
                                            {item.catatan}
                                        </td>
                                        <td className="px-4 py-3 text-center border-r">
                                            {item.foto ? (
                                                <a href={item.foto} target="_blank" rel="noopener noreferrer"
                                                    className="text-blue-600 hover:underline text-sm font-medium">
                                                    Lihat Foto
                                                </a>
                                            ) : (
                                                <span className="italic text-gray-500 text-sm">-</span>
                                            )}
                                        </td>
                                        {item.isFirstRowForId && (
                                            <td rowSpan={item.rowSpanCount} className="px-4 py-3 text-sm max-w-xs break-words align-top">
                                                {updates.length > 0 ? (
                                                    <ul className="list-disc list-inside space-y-1">
                                                        {updates.map((upd, i) => (
                                                            <li key={i} className="text-gray-700">
                                                                <span className="font-semibold">Oleh:</span>{" "}
                                                                <code className="bg-gray-100 px-1 rounded text-xs break-all">{upd.dokter.substring(0, 6)}...{upd.dokter.substring(upd.dokter.length - 4)}</code>{" "}
                                                                <span className="text-gray-500 text-xs italic">
                                                                    ({formatTimestamp(upd.timestamp)})
                                                                </span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                ) : (
                                                    <span className="italic text-gray-500 text-sm">Tidak ada info update</span>
                                                )}
                                            </td>
                                        )}
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}