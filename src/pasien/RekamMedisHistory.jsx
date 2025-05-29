import React, { useEffect, useState } from "react";
import contract from "../contract";

export default function RekamMedisHistory({ rekamMedisId }) {
    const [historyVersions, setHistoryVersions] = useState({}); // { id: [RekamMedisData, ...] }
    const [currentData, setCurrentData] = useState([]); // Data rekam medis terbaru
    const [updateHistory, setUpdateHistory] = useState({}); // { id: [{dokter, timestamp}, ...] }
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [error, setError] = useState(null); // Untuk menampilkan pesan error di UI

    useEffect(() => {
        async function fetchHistory() {
            setLoading(true);
            setError(null);
            console.log("Fetching history for rekamMedisId:", rekamMedisId); // Debug
            try {
                if (!rekamMedisId || rekamMedisId.length === 0) {
                    console.log("No rekamMedisId provided, resetting state.");
                    setCurrentData([]);
                    setHistoryVersions({});
                    setUpdateHistory({});
                    setLoading(false);
                    return;
                }

                let idArr = Array.isArray(rekamMedisId) ? rekamMedisId : [rekamMedisId];
                console.log("ID array:", idArr); // Debug

                // Ambil data rekam medis terbaru semua ID
                const latestData = await Promise.all(
                    idArr.map((id) =>
                        contract.methods.getRekamMedis(id).call().then((data) => {
                            console.log(`Latest data for ID ${id}:`, data); // Debug
                            return {
                                id,
                                pasien: data.pasien,
                                diagnosa: data.diagnosa,
                                foto: data.foto,
                                catatan: data.catatan,
                                valid: data.valid,
                            };
                        }).catch((err) => {
                            console.error(`Error fetching getRekamMedis for ID ${id}:`, err);
                            return null;
                        })
                    )
                );
                const validLatestData = latestData.filter((data) => data !== null).reverse();
                setCurrentData(validLatestData);
                console.log("Current data set:", validLatestData); // Debug

                // Ambil semua versi rekam medis untuk tiap ID
                const versions = {};
                await Promise.all(
                    idArr.map(async (id) => {
                        try {
                            const vers = await contract.methods.getRekamMedisVersions(id).call();
                            versions[id.toString()] = vers.map((v) => ({
                                id: v.id,
                                pasien: v.pasien,
                                diagnosa: v.diagnosa,
                                foto: v.foto,
                                catatan: v.catatan,
                                valid: v.valid,
                            }));
                            console.log(`Versions for ID ${id}:`, versions[id.toString()]); // Debug
                        } catch (err) {
                            console.error(`Error fetching versions for ID ${id}:`, err);
                            versions[id.toString()] = [];
                        }
                    })
                );
                setHistoryVersions(versions);
                console.log("History versions set:", versions); // Debug

                // Ambil riwayat update dokter + timestamp
                const updateHistories = {};
                await Promise.all(
                    idArr.map(async (id) => {
                        try {
                            const result = await contract.methods.getRekamMedisUpdateHistory(id).call();
                            console.log(`Raw result for ID ${id}:`, result); // Debug
                            if (!result || !Array.isArray(result) || result.length < 2) {
                                console.warn(`Invalid result for ID ${id}:`, result);
                                updateHistories[id.toString()] = [];
                                return;
                            }
                            const [dokters, timestamps] = result;
                            if (!Array.isArray(dokters) || !Array.isArray(timestamps)) {
                                console.warn(`Non-array result for ID ${id}:`, { dokters, timestamps });
                                updateHistories[id.toString()] = [];
                                return;
                            }
                            const updates = dokters.map((dokter, i) => ({
                                dokter,
                                timestamp: parseInt(timestamps[i], 10) || 0,
                            }));
                            updateHistories[id.toString()] = updates;
                            console.log(`Update history for ID ${id}:`, updates); // Debug
                        } catch (err) {
                            console.error(`Error fetching update history for ID ${id}:`, err);
                            updateHistories[id.toString()] = [];
                        }
                    })
                );
                setUpdateHistory(updateHistories);
                console.log("Update history set:", updateHistories); // Debug
            } catch (err) {
                console.error("General error in fetchHistory:", err);
                setError("Gagal memuat riwayat rekam medis. Silakan coba lagi.");
                setCurrentData([]);
                setHistoryVersions({});
                setUpdateHistory({});
            }
            setLoading(false);
        }
        fetchHistory();
    }, [rekamMedisId]);

    // Filter pencarian berdasarkan diagnosa dan catatan dari versi terbaru
    const filtered = currentData.filter(
        (item) =>
            item.diagnosa.toLowerCase().includes(search.toLowerCase()) ||
            item.catatan.toLowerCase().includes(search.toLowerCase())
    );

    const formatTimestamp = (ts) => {
        if (!ts) return "-";
        const date = new Date(ts * 1000);
        const formatted = date.toLocaleString();
        console.log(`Formatting timestamp ${ts}:`, formatted); // Debug
        return formatted;
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <span className="font-semibold text-blue-700">Tabel Riwayat Rekam Medis</span>
                <input
                    type="text"
                    className="border border-blue-200 rounded-lg px-3 py-1 focus:ring-2 focus:ring-blue-400 w-64"
                    placeholder="Cari diagnosa/catatan..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {error && (
                <div className="text-red-600 text-center py-4">{error}</div>
            )}

            <div className="overflow-x-auto">
                <table className="min-w-full border-collapse rounded-xl shadow text-sm">
                    <thead>
                        <tr className="bg-blue-700 text-white">
                            <th className="px-4 py-2 font-semibold">No.</th>
                            <th className="px-4 py-2 font-semibold">ID</th>
                            <th className="px-4 py-2 font-semibold">Versi Ke-</th>
                            <th className="px-4 py-2 font-semibold">Diagnosa</th>
                            <th className="px-4 py-2 font-semibold">Catatan</th>
                            <th className="px-4 py-2 font-semibold">Foto</th>
                            <th className="px-4 py-2 font-semibold">Status</th>
                            <th className="px-4 py-2 font-semibold">Riwayat Update Dokter</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white">
                        {loading ? (
                            <tr>
                                <td colSpan={8} className="text-center py-6 text-gray-400">
                                    Memuat data riwayat…
                                </td>
                            </tr>
                        ) : filtered.length === 0 ? (
                            <tr>
                                <td colSpan={8} className="text-center py-6 text-gray-400 italic">
                                    Tidak ada riwayat rekam medis.
                                </td>
                            </tr>
                        ) : (
                            filtered.map((item, idx) => {
                                const versions = historyVersions[item.id.toString()] || [];
                                const updates = updateHistory[item.id.toString()] || [];
                                console.log(`Rendering item ${item.id}:`, { versions, updates }); // Debug

                                // Jika versi kosong, tampilkan data terbaru saja sebagai versi ke-1
                                if (versions.length === 0) {
                                    return (
                                        <tr key={`${item.id}-no-version`} className="hover:bg-blue-50 transition">
                                            <td className="text-center px-4 py-2">{idx + 1}</td>
                                            <td className="px-4 py-2">{item.id}</td>
                                            <td className="px-4 py-2">1</td>
                                            <td className="px-4 py-2">{item.diagnosa}</td>
                                            <td className="px-4 py-2">{item.catatan}</td>
                                            <td className="px-4 py-2">
                                                {item.foto ? (
                                                    <a
                                                        href={item.foto}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-blue-600 underline"
                                                    >
                                                        Lihat
                                                    </a>
                                                ) : (
                                                    <span className="italic text-gray-500">-</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-2 text-center">
                                                {item.valid ? (
                                                    <span className="text-green-600 font-bold">Valid</span>
                                                ) : (
                                                    <span className="text-red-600 font-bold">Tidak Valid</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-2 text-sm max-w-xs break-words">
                                                {updates.length > 0 ? (
                                                    <ul className="list-disc list-inside space-y-1">
                                                        {updates.map((upd, i) => (
                                                            <li key={i}>
                                                                <span className="font-semibold">Dokter:</span>{" "}
                                                                <code className="bg-gray-100 px-1 rounded">{upd.dokter}</code>{" "}
                                                                <span className="text-gray-600 text-xs italic">
                                                                    ({formatTimestamp(upd.timestamp)})
                                                                </span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                ) : (
                                                    <span className="italic text-gray-500">Tidak ada update</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                }

                                // Jika ada versi, tampilkan versi2 tersebut dengan rowSpan pada No dan ID
                                return versions.map((v, vidx) => (
                                    <tr key={`${item.id}-version-${vidx}`} className="hover:bg-blue-50 transition">
                                        {vidx === 0 && (
                                            <td rowSpan={versions.length} className="text-center px-4 py-2 align-top">
                                                {idx + 1}
                                            </td>
                                        )}
                                        {vidx === 0 && (
                                            <td rowSpan={versions.length} className="px-4 py-2 align-top">{item.id}</td>
                                        )}
                                        <td className="px-4 py-2">{vidx + 1}</td>
                                        <td className="px-4 py-2">{v.diagnosa}</td>
                                        <td className="px-4 py-2">{v.catatan}</td>
                                        <td className="px-4 py-2">
                                            {v.foto ? (
                                                <a
                                                    href={v.foto}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 underline"
                                                >
                                                    Lihat
                                                </a>
                                            ) : (
                                                <span className="italic text-gray-500">-</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-2 text-center">
                                            {v.valid ? (
                                                <span className="text-green-600 font-bold">Valid</span>
                                            ) : (
                                                <span className="text-red-600 font-bold">Tidak Valid</span>
                                            )}
                                        </td>
                                        {vidx === 0 && (
                                            <td rowSpan={versions.length} className="px-4 py-2 text-sm max-w-xs break-words align-top">
                                                {updates.length > 0 ? (
                                                    <ul className="list-disc list-inside space-y-1">
                                                        {updates.map((upd, i) => (
                                                            <li key={i}>
                                                                <span className="font-semibold">Dokter:</span>{" "}
                                                                <code className="bg-gray-100 px-1 rounded">{upd.dokter}</code>{" "}
                                                                <span className="text-gray-600 text-xs italic">
                                                                    ({formatTimestamp(upd.timestamp)})
                                                                </span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                ) : (
                                                    <span className="italic text-gray-500">Tidak ada update</span>
                                                )}
                                            </td>
                                        )}
                                    </tr>
                                ));
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}