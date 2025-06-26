import React, { useEffect, useState } from "react";
import contract from "../contract"; // Pastikan path ini benar

export default function RekamMedisHistory({ rekamMedisId }) {
    const [allRecordsFlat, setAllRecordsFlat] = useState([]); // Semua versi rekam medis, diratakan dan diformat
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [error, setError] = useState(null);
    const [doctorNamesCache, setDoctorNamesCache] = useState({}); // Cache untuk nama dokter/aktor

    // Fungsi untuk mendapatkan nama dokter/aktor dari alamat
    const getActorName = async (actorAddress) => {
        if (actorAddress === '0x0000000000000000000000000000000000000000' || !actorAddress) {
            return "N/A"; // Alamat nol atau kosong
        }
        if (doctorNamesCache[actorAddress]) {
            return doctorNamesCache[actorAddress]; // Ambil dari cache
        }
        try {
            // Coba cek apakah itu dokter
            const isDoc = await contract.methods.isDokter(actorAddress).call();
            if (isDoc) {
                const dokterInfo = await contract.methods.getDokter(actorAddress).call();
                const namaDokter = dokterInfo[0]; // Nama dokter di indeks 0
                setDoctorNamesCache(prev => ({ ...prev, [actorAddress]: namaDokter }));
                return namaDokter;
            }

            // Coba cek apakah itu pasien
            const isPas = await contract.methods.isPasien(actorAddress).call();
            if (isPas) {
                const pasienData = await contract.methods.getPasienData(actorAddress).call();
                const namaPasien = pasienData[0]; // Nama pasien di indeks 0
                setDoctorNamesCache(prev => ({ ...prev, [actorAddress]: namaPasien }));
                return namaPasien;
            }

            // Jika bukan dokter atau pasien, tampilkan alamat terpotong
            return `${actorAddress.substring(0, 6)}...${actorAddress.substring(actorAddress.length - 4)}`;
        } catch (err) {
            console.warn(`Gagal mendapatkan nama untuk aktor ${actorAddress}:`, err);
            return `${actorAddress.substring(0, 6)}...${actorAddress.substring(actorAddress.length - 4)}`;
        }
    };

    useEffect(() => {
        async function fetchHistory() {
            setLoading(true);
            setError(null);
            setAllRecordsFlat([]); // Bersihkan data sebelumnya

            let idsToFetch = Array.isArray(rekamMedisId) && rekamMedisId.length > 0 ? rekamMedisId : [];
            if (!Array.isArray(rekamMedisId) && rekamMedisId !== null && rekamMedisId !== undefined) {
                idsToFetch = [rekamMedisId];
            }

            if (idsToFetch.length === 0) {
                setLoading(false);
                return;
            }

            try {
                let tempAllRecords = [];

                for (const id of idsToFetch) {
                    const idStr = id.toString();

                    // Ambil versi paling MUTAKHIR dari rekam medis (yang ada di mapping `rekamMedis`)
                    const currentRM = await contract.methods.getRekamMedis(idStr).call();

                    // Panggil fungsi baru getFullRekamMedisHistory
                    // Ini seharusnya mengembalikan array FullRMHistoryEntry[]
                    const fullHistoryRaw = await contract.methods.getFullRekamMedisHistory(id).call();

                    // Proses dan konversi BigInt, sekaligus dapatkan nama aktor
                    let chronologicalVersionsPromises = fullHistoryRaw.map(async (entry) => {
                        const actorName = await getActorName(entry.aktor); // Dapatkan nama aktor
                        return {
                            id_rm: entry.id_rm.toString(),
                            pasien: entry.pasien,
                            diagnosa: entry.diagnosa,
                            foto: entry.foto,
                            catatan: entry.catatan,
                            valid: entry.valid,
                            pembuat: actorName, // Gunakan nama aktor
                            timestamp: Number(entry.timestamp), // Pastikan konversi
                            jenisPerubahan: entry.jenisPerubahan,
                        };
                    });
                    let chronologicalVersions = await Promise.all(chronologicalVersionsPromises);

                    // Tambahkan versi *current* yang paling baru jika belum termasuk
                    const isLatestVersionIncluded = chronologicalVersions.some(
                        v => v.id_rm === currentRM[0].toString() &&
                            v.diagnosa === currentRM[2] &&
                            v.catatan === currentRM[4]
                    );

                    if (!isLatestVersionIncluded) {
                        const latestActorName = await getActorName(currentRM[6]); // currentRM[6] adalah pembuatAwal
                        chronologicalVersions.push({
                            id_rm: currentRM[0].toString(),
                            pasien: currentRM[1],
                            diagnosa: currentRM[2],
                            foto: currentRM[3],
                            catatan: currentRM[4],
                            valid: currentRM[5],
                            pembuat: latestActorName,
                            timestamp: Number(currentRM[7]), // currentRM[7] adalah timestampAwal
                            jenisPerubahan: 'Latest'
                        });
                    }

                    // Urutkan berdasarkan timestamp untuk mendapatkan urutan kronologis yang benar
                    chronologicalVersions.sort((a, b) => a.timestamp - b.timestamp);

                    // Berikan nomor versi (1, 2, 3, ...) setelah diurutkan per ID rekam medis
                    chronologicalVersions.forEach((version, index) => {
                        version.versiKe = index + 1;
                    });

                    tempAllRecords = tempAllRecords.concat(chronologicalVersions);
                }

                // Final sorting untuk tampilan tabel: ID Rekam Medis terbaru dulu, lalu Nomor Versi terbaru dulu
                let finalSortedRecords = tempAllRecords.sort((a, b) => {
                    const idDiff = parseInt(b.id_rm) - parseInt(a.id_rm);
                    if (idDiff !== 0) return idDiff;
                    return a.versiKe - b.versiKe; // Urutkan versi secara ascending untuk ID RM yang sama
                });

                setAllRecordsFlat(finalSortedRecords);

            } catch (err) {
                setError("Gagal memuat riwayat rekam medis.");
                console.error("Kesalahan dalam fetching history:", err);
            } finally {
                setLoading(false);
            }
        }

        fetchHistory();
    }, [rekamMedisId, contract, doctorNamesCache]); // Dependency array: re-fetch jika rekamMedisId atau contract/doctorNamesCache berubah

    const filtered = allRecordsFlat.filter(
        (item) =>
            item.diagnosa.toLowerCase().includes(search.toLowerCase()) ||
            item.catatan.toLowerCase().includes(search.toLowerCase()) ||
            item.pembuat.toLowerCase().includes(search.toLowerCase()) || // Cari berdasarkan nama aktor
            formatTimestamp(item.timestamp).toLowerCase().includes(search.toLowerCase()) // Cari berdasarkan waktu
    );

    const formatTimestamp = (ts) => {
        if (typeof ts === 'bigint') {
            ts = Number(ts);
        }
        if (!ts || ts === 0 || isNaN(ts)) return "-";
        const date = new Date(ts * 1000); // Kali 1000 karena timestamp dari Solidity biasanya dalam detik
        return date.toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });
    };

    return (
        <div className="w-full p-4">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                <h3 className="text-xl font-semibold text-blue-700">Riwayat Rekam Medis Detail</h3>
                <input
                    type="text"
                    className="border border-blue-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 w-full sm:w-80 shadow-sm"
                    placeholder="Cari diagnosa, catatan, pembuat, atau waktu..."
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
                            {/* Kolom "Versi" dihapus */}
                            <th className="px-4 py-3 text-left font-semibold uppercase tracking-wider border-r border-blue-500">Diagnosa</th>
                            <th className="px-4 py-3 text-left font-semibold uppercase tracking-wider border-r border-blue-500">Catatan</th>
                            <th className="px-4 py-3 text-center font-semibold uppercase tracking-wider border-r border-blue-500">Foto</th>
                            <th className="px-4 py-3 text-left font-semibold uppercase tracking-wider">Dibuat/Diupdate Oleh</th>
                            <th className="px-4 py-3 text-left font-semibold uppercase tracking-wider">Waktu</th>
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
                                return (
                                    <tr key={`${item.id_rm}-${item.versiKe}`} className="hover:bg-blue-50 transition-colors">
                                        <td className="px-4 py-3 text-center text-gray-700">{idx + 1}</td> {/* Nomor urut baris */}
                                        <td className="px-4 py-3 text-center font-mono text-gray-800 text-sm break-all">{item.id_rm}</td>
                                        {/* Sel data "Versi" dihapus */}
                                        <td className="px-4 py-3 break-words text-gray-800 max-w-xs">{item.diagnosa}</td>
                                        <td className="px-4 py-3 break-words text-gray-600 max-w-xs">{item.catatan}</td>
                                        <td className="px-4 py-3 text-center">
                                            {item.foto ? (
                                                <a href={item.foto} target="_blank" rel="noopener noreferrer"
                                                    className="text-blue-600 hover:underline text-sm font-medium">
                                                    Lihat Foto
                                                </a>
                                            ) : (
                                                <span className="italic text-gray-500 text-sm">-</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-700" title={item.pembuat}>
                                            {item.pembuat}
                                        </td>
                                        <td className="px-4 py-3 text-xs text-gray-500 italic">
                                            {formatTimestamp(item.timestamp)}
                                        </td>
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