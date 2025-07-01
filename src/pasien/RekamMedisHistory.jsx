import React, { useState, useEffect, useCallback, useMemo } from "react";
import contract from "../contract";

export default function RekamMedisHistory({ rekamMedisIds }) {
    const [allRecordsFlat, setAllRecordsFlat] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [error, setError] = useState(null);
    const [actorNamesCache, setActorNamesCache] = useState({}); // Mengubah nama cache untuk mencerminkan bisa dokter/pasien/admin

    // --- State untuk Paginasi dan Pengurutan ---
    const [currentPage, setCurrentPage] = useState(1);
    const [recordsPerPage] = useState(10); // Maksimal 10 item per halaman
    const [sortOrder, setSortOrder] = useState("desc"); // 'desc' (terbaru) atau 'asc' (terlama)

    // Fungsi untuk mendapatkan nama aktor (pembuat RM) dari alamat
    const getActorName = useCallback(async (actorAddress) => {
        if (!actorAddress || actorAddress === "0x0000000000000000000000000000000000000000") {
            return "N/A";
        }
        if (actorNamesCache[actorAddress]) { // Menggunakan actorNamesCache
            return actorNamesCache[actorAddress];
        }
        try {
            const role = await contract.methods.getUserRole(actorAddress).call();
            let name = "";

            switch (role) {
                case "Dokter":
                case "InactiveDokter": // Dokter tetap punya nama walau non-aktif
                    const dokterInfo = await contract.methods.getDokter(actorAddress).call();
                    name = dokterInfo[0]; // nama dokter
                    break;
                case "Pasien":
                    const pasienData = await contract.methods.getPasienData(actorAddress).call();
                    name = pasienData[0]; // nama pasien
                    break;
                case "AdminRS":
                case "InactiveAdminRS": // Admin RS tetap punya nama RS walau non-aktif
                    const adminInfo = await contract.methods.dataAdmin(actorAddress).call();
                    name = adminInfo[0]; // namaRumahSakit Admin RS
                    break;
                case "SuperAdmin":
                    name = "Super Admin (Sistem)"; // Nama hardcode untuk super admin
                    break;
                default:
                    name = `${actorAddress.substring(0, 6)}...${actorAddress.substring(actorAddress.length - 4)}`;
            }

            setActorNamesCache((prev) => ({ ...prev, [actorAddress]: name }));
            return name;
        } catch (err) {
            console.warn(`Gagal mendapatkan nama untuk aktor ${actorAddress}:`, err);
            return `${actorAddress.substring(0, 6)}...${actorAddress.substring(actorAddress.length - 4)}`;
        }
    }, [actorNamesCache]); // Depend on actorNamesCache for memoization

    useEffect(() => {
        let isMounted = true;
        const MIN_LOADING_TIME = 300;

        async function fetchHistory() {
            if (!isMounted) return;

            setLoading(true);
            setError(null);
            setAllRecordsFlat([]);
            setCurrentPage(1);

            if (!rekamMedisIds || rekamMedisIds.length === 0) {
                if (isMounted) setLoading(false);
                return;
            }

            const startTime = Date.now();

            try {
                let tempAllRecords = [];

                for (const id of rekamMedisIds) {
                    const rmData = await contract.methods.getRekamMedis(id).call();


                    const pembuatAddress = rmData[5]; // Pembuat adalah di indeks 5
                    const actorName = await getActorName(pembuatAddress); // Dapatkan nama pembuat

                    tempAllRecords.push({
                        id_rm: rmData[0].toString(),
                        pasien: rmData[1],
                        diagnosa: rmData[2],
                        foto: rmData[3],
                        catatan: rmData[4],
                        pembuat: actorName, // Gunakan nama aktor yang sudah didapatkan
                        timestamp: Number(rmData[6]), // Timestamp di indeks 6
                        tipeRekamMedis: rmData[7], // Tipe RM di indeks 7
                        // rumahSakitPembuatRM TIDAK ADA di smart contract lama
                    });
                }

                const sortedRecords = tempAllRecords.sort((a, b) =>
                    sortOrder === "desc" ? b.timestamp - a.timestamp : a.timestamp - b.timestamp
                );

                sortedRecords.forEach((record, idx) => {
                    record.noUrut = idx + 1;
                });

                const elapsedTime = Date.now() - startTime;
                const remainingTime = MIN_LOADING_TIME - elapsedTime;
                if (remainingTime > 0) {
                    await new Promise(resolve => setTimeout(resolve, remainingTime));
                }

                if (isMounted) {
                    setAllRecordsFlat(sortedRecords);
                }
            } catch (err) {
                if (isMounted) {
                    setError("Gagal memuat riwayat rekam medis. Periksa koneksi blockchain atau konsol.");
                    console.error("Kesalahan dalam fetching history:", err);
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        }

        fetchHistory();

        return () => {
            isMounted = false;
        };
    }, [rekamMedisIds, getActorName, sortOrder]); // sortOrder ditambahkan ke dependencies

    const formatTimestamp = (ts) => {
        if (typeof ts === "bigint") {
            ts = Number(ts);
        }
        if (!ts || ts === 0 || isNaN(ts)) return "-";
        const date = new Date(ts * 1000);
        // Format tanggal dan waktu ke waktu lokal Jakarta (WIB)
        return date.toLocaleString("id-ID", {
            timeZone: "Asia/Jakarta", // Menggunakan zona waktu WIB
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false // Format 24 jam
        });
    };


    const filteredAndSortedRecords = useMemo(() => {
        const filtered = allRecordsFlat.filter(
            (item) =>
                item.diagnosa.toLowerCase().includes(search.toLowerCase()) ||
                item.catatan.toLowerCase().includes(search.toLowerCase()) ||
                item.pembuat.toLowerCase().includes(search.toLowerCase()) ||
                (item.tipeRekamMedis && item.tipeRekamMedis.toLowerCase().includes(search.toLowerCase())) ||
                // item.rumahSakitPembuatRM tidak ada di smart contract lama, jadi hapus dari filter
                formatTimestamp(item.timestamp).toLowerCase().includes(search.toLowerCase())
        );
        return filtered;
    }, [allRecordsFlat, search]);

    // Logika Paginasi
    const indexOfLastRecord = currentPage * recordsPerPage;
    const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
    const currentRecords = filteredAndSortedRecords.slice(indexOfFirstRecord, indexOfLastRecord);

    const totalPages = Math.ceil(filteredAndSortedRecords.length / recordsPerPage);

    const paginate = (pageNumber) => {
        if (pageNumber < 1 || pageNumber > totalPages) return;
        setCurrentPage(pageNumber);
    };

    const renderPaginationButtons = () => {
        const pages = [];
        if (totalPages <= 1) return null;

        let startPage = Math.max(1, currentPage - 2);
        let endPage = Math.min(totalPages, currentPage + 2);

        if (currentPage <= 3) {
            endPage = Math.min(totalPages, 5);
            startPage = 1;
        } else if (currentPage + 2 >= totalPages) {
            startPage = Math.max(1, totalPages - 4);
            endPage = totalPages;
        }

        if (startPage > 1) {
            pages.push(
                <button
                    key={1}
                    onClick={() => paginate(1)}
                    className="px-4 py-2 mx-1 rounded-lg font-medium transition-colors bg-gray-200 text-gray-700 hover:bg-gray-300"
                >
                    1
                </button>
            );
            if (startPage > 2) {
                pages.push(<span key="dots-start" className="px-2 py-2 text-gray-500">...</span>);
            }
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(
                <button
                    key={i}
                    onClick={() => paginate(i)}
                    className={`px-4 py-2 mx-1 rounded-lg font-medium transition-colors ${currentPage === i
                        ? "bg-blue-600 text-white shadow-md"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        }`}
                >
                    {i}
                </button>
            );
        }

        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                pages.push(<span key="dots-end" className="px-2 py-2 text-gray-500">...</span>);
            }
            pages.push(
                <button
                    key={totalPages}
                    onClick={() => paginate(totalPages)}
                    className="px-4 py-2 mx-1 rounded-lg font-medium transition-colors bg-gray-200 text-gray-700 hover:bg-gray-300"
                >
                    {totalPages}
                </button>
            );
        }

        return pages;
    };


    return (
        <div className="w-full p-4">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                <h3 className="text-xl font-semibold text-blue-700">Riwayat Rekam Medis Detail</h3>
                <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                    {/* Input Pencarian */}
                    <input
                        type="text"
                        className="border border-blue-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 w-full sm:w-80 shadow-sm"
                        placeholder="Cari diagnosa, catatan, pembuat, tipe, atau waktu..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    {/* Dropdown Pengurutan */}
                    <select
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value)}
                        className="border border-blue-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 w-full sm:w-auto shadow-sm text-gray-700"
                    >
                        <option value="desc">Terbaru Dulu</option>
                        <option value="asc">Terlama Dulu</option>
                    </select>
                </div>
            </div>

            {error && (
                <div
                    className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
                    role="alert"
                >
                    {error}
                </div>
            )}

            <div className="overflow-x-auto shadow-lg rounded-xl border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-blue-600 text-white">
                        <tr>
                            <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider border-r border-blue-500">
                                No.
                            </th>
                            <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider border-r border-blue-500">
                                ID RM
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider border-r border-blue-500">
                                Tipe RM
                            </th>
                            <th className="px-4 py-3 text-left font-semibold uppercase tracking-wider border-r border-blue-500">
                                Diagnosa
                            </th>
                            <th className="px-4 py-3 text-left font-semibold uppercase tracking-wider border-r border-blue-500">
                                Catatan
                            </th>
                            <th className="px-4 py-3 text-center font-semibold uppercase tracking-wider border-r border-blue-500">
                                Foto/File
                            </th>
                            <th className="px-4 py-3 text-left font-semibold uppercase tracking-wider">
                                Dibuat Oleh
                            </th>
                            {/* HAPUS KOLOM "RS Pembuat RM" karena tidak ada di smart contract lama */}
                            {/* <th className="px-4 py-3 text-left font-semibold uppercase tracking-wider border-r border-blue-500">
                                RS Pembuat RM
                            </th> */}
                            <th className="px-4 py-3 text-left font-semibold uppercase tracking-wider">
                                Waktu Pembuatan
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                        {loading ? (
                            <tr>
                                {/* colSpan disesuaikan menjadi 8 (asumsi tanpa kolom RS Pembuat RM) */}
                                <td colSpan={8} className="text-center py-8 text-gray-500 text-lg">
                                    Memuat data riwayat...
                                </td>
                            </tr>
                        ) : filteredAndSortedRecords.length === 0 ? (
                            <tr>
                                {/* colSpan disesuaikan menjadi 8 */}
                                <td colSpan={8} className="text-center py-8 text-gray-500 italic text-lg">
                                    Tidak ada riwayat rekam medis ditemukan.
                                </td>
                            </tr>
                        ) : (
                            currentRecords.map((item) => {
                                const actorDisplay = item.pembuat;
                                const timestampDisplay = item.timestamp ? formatTimestamp(item.timestamp) : "-";

                                return (
                                    <tr key={`${item.id_rm}-${item.timestamp}`} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-3 text-center text-gray-700">{item.noUrut}</td>
                                        <td className="px-4 py-3 text-center font-mono text-gray-800 text-sm break-all">
                                            {item.id_rm}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-800 min-w-[120px] break-words">
                                            {item.tipeRekamMedis || "-"}
                                        </td>
                                        <td className="px-4 py-3 break-words text-gray-800 max-w-xs">{item.diagnosa}</td>
                                        <td className="px-4 py-3 break-words text-gray-600 max-w-xs">{item.catatan}</td>
                                        <td className="px-4 py-3 text-center">
                                            {item.foto ? (
                                                <a
                                                    href={item.foto}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 hover:underline text-sm font-medium"
                                                >
                                                    Lihat
                                                </a>
                                            ) : (
                                                <span className="italic text-gray-500 text-sm">-</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-700" title={item.pembuat || ""}>
                                            {actorDisplay}
                                        </td>
                                        <td className="px-4 py-3 text-xs text-gray-500 italic">
                                            {timestampDisplay}
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Kontrol Paginasi */}
            {totalPages > 0 && ( // Tampilkan paginasi hanya jika ada item (totalPages > 0)
                <div className="flex justify-center items-center mt-6">
                    <button
                        onClick={() => paginate(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-4 py-2 mx-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        Sebelumnya
                    </button>
                    {renderPaginationButtons()}
                    <button
                        onClick={() => paginate(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 mx-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        Berikutnya
                    </button>
                </div>
            )}
        </div>
    );
}