import React, { useState, useEffect, useCallback, useMemo, useDeferredValue } from "react";
import contract from "../contract";

// Komponen untuk ikon (menggunakan karakter Unicode)
const IconId = () => <span className="mr-2 text-blue-600">🆔</span>;
const IconDiagnosa = () => <span className="mr-2 text-blue-600">📝</span>;
const IconCatatan = () => <span className="mr-2 text-blue-600">🗒️</span>;
const IconFoto = () => <span className="mr-2 text-blue-600">📸</span>;
const IconMedicalType = () => <span className="mr-2 text-blue-600">🩺</span>;
const IconTime = () => <span className="mr-2 text-blue-600">⏱️</span>;
const IconDoctor = () => <span className="mr-2 text-blue-600">👨‍⚕️</span>;
const IconHospital = () => <span className="mr-2 text-blue-600">🏥</span>;

// Komponen DetailItem yang diperbaiki
const DetailItem = ({ icon, label, value, colSpan = 1 }) => (
    <div className={`${colSpan === 2 ? 'md:col-span-2' : ''}`}>
        <div className="flex items-start">
            <span className="font-medium text-gray-700 min-w-0 flex items-center mr-3">
                {icon} {label}:
            </span>
            <span className="text-gray-900 break-words flex-1">
                {value || "-"}
            </span>
        </div>
    </div>
);

// Fungsi formatTimestamp
const formatTimestamp = (ts) => {
    if (typeof ts === 'bigint') {
        ts = Number(ts);
    }
    if (!ts || ts === 0 || isNaN(ts)) return "-";
    const date = new Date(ts * 1000);
    return date.toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });
};

// **PERUBAHAN UTAMA DI SINI:** rekamMedisTerbaru sekarang opsional, dan komponen akan fetch data sendiri berdasarkan rekamMedisIds.
export default function RekamMedisHistory({ rekamMedisIds, rekamMedisTerbaru }) { // rekamMedisTerbaru diterima sebagai prop
    const [allRecordsFlat, setAllRecordsFlat] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [error, setError] = useState(null);
    const [actorInfoCache, setActorInfoCache] = useState({});
    const [currentPage, setCurrentPage] = useState(1);
    const [recordsPerPage] = useState(10);
    const [sortOrder, setSortOrder] = useState("desc");

    const deferredSearch = useDeferredValue(search);
    const deferredSortOrder = useDeferredValue(sortOrder);

    // Fungsi getActorDetails tetap di sini seperti kode asli Anda
    const getActorDetails = useCallback(async (actorAddress) => {
        const addressAsString = typeof actorAddress === 'string' ? actorAddress : String(actorAddress);

        if (addressAsString === "0x0000000000000000000000000000000000000000" || !addressAsString) {
            return { name: "N/A", hospitalName: "N/A", role: "Unknown" };
        }

        if (actorInfoCache[addressAsString]) {
            return actorInfoCache[addressAsString];
        }

        let name = "";
        let hospitalName = "N/A";
        let role = "";

        try {
            role = await contract.methods.getUserRole(addressAsString).call();

            switch (role) {
                case "Dokter":
                case "InactiveDokter":
                    const dokterInfo = await contract.methods.getDokter(addressAsString).call();
                    name = dokterInfo[0];
                    const affiliatedAdminRSAddress = dokterInfo[5];
                    if (affiliatedAdminRSAddress !== "0x0000000000000000000000000000000000000000") {
                        try {
                            const adminRSData = await contract.methods.getAdminRS(affiliatedAdminRSAddress).call();
                            hospitalName = adminRSData[0];
                        } catch (e) {
                            console.warn(`Gagal mendapatkan nama RS afiliasi untuk dokter ${addressAsString}:`, e);
                            hospitalName = "N/A (RS Error)";
                        }
                    }
                    break;
                case "Pasien":
                    // *** PERBAIKAN DI SINI: Akses properti struct langsung ***
                    const pasienDataContract = await contract.methods.getPasienData(addressAsString).call();
                    name = pasienDataContract.nama; // Akses properti 'nama'
                    const responsibleRSAddress = pasienDataContract.rumahSakitPenanggungJawab; // Akses properti 'rumahSakitPenanggungJawab'
                    if (responsibleRSAddress !== "0x0000000000000000000000000000000000000000") {
                        try {
                            const adminRSData = await contract.methods.getAdminRS(responsibleRSAddress).call();
                            hospitalName = adminRSData[0];
                        } catch (e) {
                            console.warn(`Gagal mendapatkan nama RS penanggung jawab untuk pasien ${addressAsString}:`, e);
                            hospitalName = "N/A (RS Error)";
                        }
                    }
                    break;
                case "AdminRS":
                case "InactiveAdminRS":
                    const adminInfo = await contract.methods.getAdminRS(addressAsString).call();
                    name = adminInfo[0];
                    hospitalName = adminInfo[0];
                    break;
                case "SuperAdmin":
                    name = "Super Admin (Sistem)";
                    hospitalName = "Sistem Utama";
                    break;
                default:
                    name = `${addressAsString.substring(0, 6)}...${addressAsString.substring(addressAsString.length - 4)}`;
                    hospitalName = "N/A";
            }
        } catch (err) {
            console.warn(`Gagal mendapatkan detail aktor ${addressAsString}:`, err);
            name = `${addressAsString.substring(0, 6)}...${addressAsString.substring(addressAsString.length - 4)}`;
            hospitalName = "N/A (Error)";
        }

        const details = { name, hospitalName, role };
        setActorInfoCache((prev) => ({ ...prev, [addressAsString]: details }));
        return details;
    }, [actorInfoCache]);

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
                const tempAllRecords = [];
                
                for (const id of rekamMedisIds) {
                    const rmData = await contract.methods.getRekamMedis(id).call();

                    const pembuatAddress = rmData[5];
                    const { name: actorName, hospitalName: rmHospitalName } = await getActorDetails(pembuatAddress);

                    tempAllRecords.push({
                        id_rm: rmData[0].toString(),
                        pasien: rmData[1],
                        diagnosa: rmData[2],
                        foto: rmData[3],
                        catatan: rmData[4],
                        pembuat: actorName,
                        rumahSakitPembuatRM: rmHospitalName,
                        timestamp: Number(rmData[6]),
                        tipeRekamMedis: rmData[7],
                    });
                }

                const sortedRecords = tempAllRecords.sort((a, b) =>
                    deferredSortOrder === "desc" ? b.timestamp - a.timestamp : a.timestamp - b.timestamp
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
    }, [rekamMedisIds, getActorDetails, deferredSortOrder]); // rekamMedisIds adalah dependency utama

    const filteredAndSortedRecords = useMemo(() => {
        const filtered = allRecordsFlat.filter(
            (item) =>
                item.diagnosa.toLowerCase().includes(deferredSearch.toLowerCase()) ||
                item.catatan.toLowerCase().includes(deferredSearch.toLowerCase()) ||
                item.pembuat.toLowerCase().includes(deferredSearch.toLowerCase()) ||
                (item.tipeRekamMedis && item.tipeRekamMedis.toLowerCase().includes(deferredSearch.toLowerCase())) ||
                (item.rumahSakitPembuatRM && item.rumahSakitPembuatRM.toLowerCase().includes(deferredSearch.toLowerCase())) ||
                formatTimestamp(item.timestamp).toLowerCase().includes(deferredSearch.toLowerCase())
        );
        return filtered;
    }, [allRecordsFlat, deferredSearch]);

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
                    className="px-3 py-2 mx-1 rounded-lg font-medium transition-colors bg-gray-200 text-gray-700 hover:bg-gray-300"
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
                    className={`px-3 py-2 mx-1 rounded-lg font-medium transition-colors ${currentPage === i
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
                    className="px-3 py-2 mx-1 rounded-lg font-medium transition-colors bg-gray-200 text-gray-700 hover:bg-gray-300"
                >
                    {totalPages}
                </button>
            );
        }

        return pages;
    };

    return (
        <div className="w-full p-6 bg-gray-50 min-h-screen">
            {/* Card Rekam Medis Terbaru - Dipindahkan ke sini */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6">
                    📜 Rekam Medis Terbaru Anda
                </h3>

                {rekamMedisTerbaru ? (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <DetailItem icon={<IconId />} label="ID Rekam Medis" value={rekamMedisTerbaru.id_rm} />
                            <DetailItem icon={<IconMedicalType />} label="Tipe RM" value={rekamMedisTerbaru.tipeRekamMedis} />
                            <DetailItem icon={<IconDiagnosa />} label="Diagnosa" value={rekamMedisTerbaru.diagnosa} />
                            <DetailItem icon={<IconDoctor />} label="Dibuat Oleh" value={rekamMedisTerbaru.pembuatNama} />
                            <DetailItem icon={<IconCatatan />} label="Catatan" value={rekamMedisTerbaru.catatan} />
                            <DetailItem icon={<IconHospital />} label="RS Pembuat" value={rekamMedisTerbaru.pembuatRSNama || 'N/A'} />
                        </div>

                        <div className="border-t border-gray-200 pt-4">
                            <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0">
                                <DetailItem
                                    icon={<IconTime />}
                                    label="Waktu Pembuatan"
                                    value={formatTimestamp(rekamMedisTerbaru.timestampPembuatan)}
                                />
                                <div className="flex items-center">
                                    <span className="font-medium text-gray-700 flex items-center mr-3">
                                        <IconFoto /> Foto:
                                    </span>
                                    {rekamMedisTerbaru.foto ? (
                                        <a
                                            href={rekamMedisTerbaru.foto}
                                            className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            Lihat Foto/File
                                        </a>
                                    ) : (
                                        <span className="text-gray-500 italic">Tidak ada</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <p className="text-gray-500 italic">
                            Belum ada rekam medis yang tercatat.
                        </p>
                    </div>
                )}
            </div>

            {/* Header Section untuk Riwayat Lengkap */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                    <h3 className="text-2xl font-bold text-gray-900 flex items-center">
                        📚 Riwayat Rekam Medis Lengkap
                    </h3>
                    <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                        <input
                            type="text"
                            className="border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full sm:w-80 shadow-sm transition-all"
                            placeholder="🔍 Cari diagnosa, catatan, pembuat..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <select
                            value={sortOrder}
                            onChange={(e) => setSortOrder(e.target.value)}
                            className="border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full sm:w-auto shadow-sm text-gray-700 transition-all"
                        >
                            <option value="desc">📅 Terbaru Dulu</option>
                            <option value="asc">📅 Terlama Dulu</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Error Alert */}
            {error && (
                <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6 rounded-lg">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <span className="text-red-400">⚠️</span>
                        </div>
                        <div className="ml-3">
                            <p className="text-red-700">{error}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Table Section */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gradient-to-r from-blue-600 to-blue-700">
                            <tr>
                                <th className="px-4 py-4 text-center text-xs font-semibold text-white uppercase tracking-wider">
                                    No.
                                </th>
                                <th className="px-4 py-4 text-center text-xs font-semibold text-white uppercase tracking-wider">
                                    ID RM
                                </th>
                                <th className="px-4 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                                    Tipe RM
                                </th>
                                <th className="px-4 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                                    Diagnosa
                                </th>
                                <th className="px-4 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                                    Catatan
                                </th>
                                <th className="px-4 py-4 text-center text-xs font-semibold text-white uppercase tracking-wider">
                                    Foto/File
                                </th>
                                <th className="px-4 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                                    Dibuat Oleh
                                </th>
                                <th className="px-4 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                                    RS Pembuat RM
                                </th>
                                <th className="px-4 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                                    Waktu Pembuatan
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan={9} className="text-center py-12">
                                        <div className="flex items-center justify-center">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                            <span className="ml-3 text-gray-500">Memuat data riwayat...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredAndSortedRecords.length === 0 ? (
                                <tr>
                                    <td colSpan={9} className="text-center py-12">
                                        <div className="text-gray-500">
                                            <span className="text-4xl mb-4 block">📋</span>
                                            <p className="text-lg italic">Tidak ada riwayat rekam medis ditemukan.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                currentRecords.map((item, index) => {
                                    const actorDisplay = item.pembuat;
                                    const timestampDisplay = item.timestamp ? formatTimestamp(item.timestamp) : "-";

                                    return (
                                        <tr key={`${item.id_rm}-${item.timestamp}`} className={`hover:bg-blue-50 transition-colors ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                                            <td className="px-4 py-4 text-center text-gray-700 font-medium">{item.noUrut}</td>
                                            <td className="px-4 py-4 text-center font-mono text-gray-800 text-sm">
                                                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                                                    {item.id_rm}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 text-sm text-gray-800">
                                                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                                                    {item.tipeRekamMedis || "-"}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 text-gray-800 max-w-xs">
                                                <div className="line-clamp-2">{item.diagnosa}</div>
                                            </td>
                                            <td className="px-4 py-4 text-gray-600 max-w-xs">
                                                <div className="line-clamp-2">{item.catatan}</div>
                                            </td>
                                            <td className="px-4 py-4 text-center">
                                                {item.foto ? (
                                                    <a
                                                        href={item.foto}
                                                        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors"
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        📎 Lihat
                                                    </a>
                                                ) : (
                                                    <span className="text-gray-400 text-sm">-</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-4 text-sm text-gray-700" title={item.pembuat || ""}>
                                                {actorDisplay}
                                            </td>
                                            <td className="px-4 py-4 text-sm text-gray-700">
                                                <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">
                                                    {item.rumahSakitPembuatRM || "-"}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 text-xs text-gray-500">
                                                <div className="flex flex-col">
                                                    <span>⏰ {timestampDisplay}</span>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination */}
            {totalPages > 0 && (
                <div className="bg-white rounded-lg shadow-sm p-4 mt-6">
                    <div className="flex justify-center items-center">
                        <button
                            onClick={() => paginate(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="px-4 py-2 mx-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            ← Sebelumnya
                        </button>
                        {renderPaginationButtons()}
                        <button
                            onClick={() => paginate(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="px-4 py-2 mx-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Berikutnya →
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}