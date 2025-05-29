import React, { useEffect, useState } from "react";
import contract from "../contract";

export default function RekamMedisHistory({ rekamMedisId }) {
    const [history, setHistory] = useState([]);
    const [updateHistory, setUpdateHistory] = useState({}); // { id: [{dokter, timestamp}, ...] }
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    useEffect(() => {
        async function fetchHistory() {
            setLoading(true);
            try {
                if (!rekamMedisId || rekamMedisId.length === 0) {
                    setHistory([]);
                    setLoading(false);
                    return;
                }
                let idArr = Array.isArray(rekamMedisId) ? rekamMedisId : [rekamMedisId];
                const all = await Promise.all(
                    idArr.map(id =>
                        contract.methods.getRekamMedis(id).call().then(data => ({
                            id,
                            diagnosa: data.diagnosa,
                            catatan: data.catatan,
                            foto: data.foto,
                            valid: data.valid
                        }))
                    )
                );
                setHistory(all.reverse());

                // Fetch update history utk semua rekam medis
                const updateHistories = {};
                await Promise.all(
                    idArr.map(async id => {
                        const [dokters, times] = await contract.methods.getRekamMedisUpdateHistory(id).call();
                        const updates = dokters.map((dokter, i) => ({
                            dokter,
                            timestamp: parseInt(times[i], 10)
                        }));
                        updateHistories[id] = updates;
                    })
                );
                setUpdateHistory(updateHistories);

            } catch (err) {
                setHistory([]);
            }
            setLoading(false);
        }
        fetchHistory();
    }, [rekamMedisId]);

    const filtered = history.filter(
        item =>
            item.diagnosa.toLowerCase().includes(search.toLowerCase()) ||
            item.catatan.toLowerCase().includes(search.toLowerCase())
    );

    // Fungsi format waktu
    const formatTimestamp = ts => {
        const date = new Date(ts * 1000);
        return date.toLocaleString();
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
                    onChange={e => setSearch(e.target.value)}
                />
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full border-collapse rounded-xl shadow text-sm">
                    <thead>
                        <tr className="bg-blue-700 text-white">
                            <th className="px-4 py-2 font-semibold">No.</th>
                            <th className="px-4 py-2 font-semibold">ID</th>
                            <th className="px-4 py-2 font-semibold">Diagnosa</th>
                            <th className="px-4 py-2 font-semibold">Catatan</th>
                            <th className="px-4 py-2 font-semibold">Foto</th>
                            <th className="px-4 py-2 font-semibold">Status</th>
                            <th className="px-4 py-2 font-semibold">Riwayat Update</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white">
                        {loading ? (
                            <tr>
                                <td colSpan={7} className="text-center py-6 text-gray-400">
                                    Memuat data riwayat…
                                </td>
                            </tr>
                        ) : filtered.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="text-center py-6 text-gray-400 italic">
                                    Tidak ada riwayat rekam medis.
                                </td>
                            </tr>
                        ) : (
                            filtered.map((item, idx) => (
                                <tr key={item.id} className="hover:bg-blue-50 transition">
                                    <td className="text-center px-4 py-2">{idx + 1}</td>
                                    <td className="px-4 py-2">{item.id}</td>
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
                                    <td className="px-4 py-2 text-sm">
                                        {updateHistory[item.id] && updateHistory[item.id].length > 0 ? (
                                            <ul>
                                                {updateHistory[item.id].map((upd, i) => (
                                                    <li key={i}>
                                                        Dokter: <code>{upd.dokter}</code> —{" "}
                                                        {formatTimestamp(upd.timestamp)}
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <span className="italic text-gray-500">Tidak ada update</span>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
