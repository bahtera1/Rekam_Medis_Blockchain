import React, { useEffect, useState, useCallback, useMemo } from "react";
import contract from "../contract";
import { uploadToPinata } from "../PinataUpload";

// --- Komponen Ikon (Hanya yang digunakan di file ini) ---
// Ikon-ikon ini digunakan di bagian pemilihan pasien dan form tambah RM
const IconSearch = () => (
    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
);
const IconArrowLeft = () => (
    <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" stroke='currentColor' strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
    </svg>
);
const IconChevronRight = () => (
    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
    </svg>
);
const IconEditPencil = () => <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>;

// Ikon-ikon untuk detail pasien dengan warna yang lebih bervariasi
const IconUser = () => <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path></svg>;
const IconCalendar = () => <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 002-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"></path></svg>;
const IconMail = () => <svg className="w-5 h-5 text-purple-500" fill="currentColor" viewBox="0 0 20 20"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"></path><path fillRule="evenodd" d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" clipRule="evenodd"></path></svg>;
const IconPhone = () => <svg className="w-5 h-5 text-orange-500" fill="currentColor" viewBox="0 0 20 20"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"></path></svg>;
const IconLocation = () => <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"></path></svg>;
const IconGender = () => (
    <svg className="w-5 h-5 text-indigo-500" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-2a6 6 0 100-12 6 6 0 000 12zm-2-7a1 1 0 100-2H6a1 1 0 100 2h2zm4 0a1 1 0 100-2h-2a1 1 0 100 2h2zm-2 4a1 1 0 100-2H8a1 1 0 100 2h2z" clipRule="evenodd" />
    </svg>
);
const IconBloodType = () => (
    <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a.93.93 0 01-.682-.282L4.43 12.83A6.003 6.003 0 014 8.5C4 5.467 7.16 3 10 3s6 2.467 6 5.5c0 1.34-.435 2.603-1.232 3.616l-.001.001-4.887 4.886A.93.93 0 0110 18zm0-13.5a4.5 4.5 0 00-4.5 4.5c0 .998.33 1.923.928 2.668L10 15.336l3.572-3.668A3.513 3.513 0 0014.5 8.5a4.5 4.5 0 00-4.5-4.5z" clipRule="evenodd" />
    </svg>
);

const IconIDPasien = () => (
    <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 2a8 8 0 100 16 8 8 0 000-16zM5 9a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 4a1 1 0 000 2h6a1 1 0 000-2H6z" clipRule="evenodd" />
    </svg>
);

const IconNIK = () => (
    <svg className="w-5 h-5 text-teal-500" fill="currentColor" viewBox="0 0 20 20">
        <path d="M4 4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm0 14V6h12v12H4zM9 10a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1zm3 0a1 1 0 011-1h.01a1 1 0 110 2H13a1 1 0 01-1-1zm-3 4a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1zm3 0a1 1 0 011-1h.01a1 1 0 110 2H13a1 1 0 01-1-1z" clipRule="evenodd" fillRule="evenodd" />
    </svg>
);

// DetailItem diperbaiki untuk UI yang lebih clean dan jarak lebih rapat
const DetailItem = ({ icon, label, value }) => (
    <div className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"> {/* Padding dikurangi */}
        <div className="flex-shrink-0 mr-3"> {/* Margin dikurangi */}
            {icon}
        </div>
        <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-600 mb-0.5">{label}</p> {/* Ukuran font label dikecilkan, margin dikurangi */}
            <p className="text-base font-semibold text-gray-900 truncate">{value || '-'}</p>
        </div>
    </div>
);

// Fungsi pembantu untuk memotong teks
const truncateText = (text, maxLength) => {
    if (!text) return { display: '-', truncated: false };
    if (text.length <= maxLength) return { display: text.substring(0, maxLength) + '...', truncated: true };
    return { display: text.substring(0, maxLength) + '...', truncated: true };
};


// --- Komponen Utama DataPasien ---
export default function DataPasien({ account, assignedPatients }) {
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [pasienData, setPasienData] = useState(null);
    const [rekamMedisHistory, setRekamMedisHistory] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [showNoteModal, setShowNoteModal] = useState(false);
    const [fullNoteContent, setFullNoteContent] = useState("");
    const [formData, setFormData] = useState({
        diagnosa: "", foto: "", catatan: "", tipeRekamMedis: ""
    });
    const [fotoFile, setFotoFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [submittingForm, setSubmittingForm] = useState(false);
    const [patientInfos, setPatientInfos] = useState([]);
    const [search, setSearch] = useState("");
    const [loadingHistory, setLoadingHistory] = useState(false);
    const [loadingData, setLoadingData] = useState(false);
    const [doctorNamesCache, setDoctorNamesCache] = useState({});

    const [historySearchTerm, setHistorySearchTerm] = useState('');
    const [sortByDate, setSortByDate] = useState('desc');

    useEffect(() => {
        setCurrentPage(1);
    }, [historySearchTerm, sortByDate]);

    useEffect(() => {
        setLoadingData(true);
        if (assignedPatients && assignedPatients.length > 0) {
            setPatientInfos(assignedPatients);
        } else {
            setPatientInfos([]);
        }
        setLoadingData(false);
    }, [assignedPatients]);

    const getActorName = useCallback(async (actorAddress) => {
        const addressAsString = typeof actorAddress === 'string' ? actorAddress : String(actorAddress);

        if (addressAsString === '0x0000000000000000000000000000000000000000' || !addressAsString) {
            return "N/A";
        }
        if (doctorNamesCache[addressAsString]) {
            return doctorNamesCache[addressAsString];
        }
        try {
            const isDoc = await contract.methods.isDokter(addressAsString).call();
            if (isDoc) {
                const dokterInfo = await contract.methods.getDokter(addressAsString).call();
                const namaDokter = dokterInfo[0];
                setDoctorNamesCache(prev => ({ ...prev, [addressAsString]: namaDokter }));
                return namaDokter;
            }
            const isPas = await contract.methods.isPasien(addressAsString).call();
            if (isPas) {
                const pasienData = await contract.methods.getPasienData(addressAsString).call();
                const namaPasien = pasienData[0];
                setDoctorNamesCache(prev => ({ ...prev, [addressAsString]: namaPasien }));
                return namaPasien;
            }
            return `${addressAsString.substring(0, 6)}...${addressAsString.substring(addressAsString.length - 4)}`;
        } catch (err) {
            console.warn(`Gagal mendapatkan nama untuk aktor ${addressAsString}:`, err);
            return `${addressAsString.substring(0, 6)}...${addressAsString.substring(addressAsString.length - 4)}`;
        }
    }, [doctorNamesCache]);

    const fetchDataPasien = useCallback(async () => {
        if (!selectedPatient) {
            setPasienData(null);
            setRekamMedisHistory([]);
            return;
        }
        setLoadingHistory(true);
        try {
            const p = await contract.methods.getPasienData(selectedPatient).call();
            setPasienData({
                nama: p[0],
                ID: p[1],
                NIK: p[2],
                golonganDarah: p[3],
                tanggalLahir: p[4],
                gender: p[5],
                alamat: p[6],
                noTelepon: p[7],
                email: p[8],
                rumahSakitPenanggungJawab: p[9]
            });

            const rmIds = await contract.methods.getRekamMedisIdsByPasien(selectedPatient).call();
            let allRecords = [];

            for (const id of rmIds) {
                const rmData = await contract.methods.getRekamMedis(id).call();
                const actorName = await getActorName(rmData[5]);

                allRecords.push({
                    id_rm: rmData[0].toString(),
                    pasien: rmData[1],
                    diagnosa: rmData[2],
                    foto: rmData[3],
                    catatan: rmData[4],
                    pembuat: actorName,
                    timestamp: Number(rmData[6]),
                    tipeRekamMedis: rmData[7]
                });
            }

            setRekamMedisHistory(allRecords);

        } catch (error) {
            console.error("Gagal memuat data pasien atau rekam medis:", error);
            alert(`Gagal memuat detail pasien: ${error.message || 'Terjadi kesalahan tidak dikenal'}`);
        } finally {
            setLoadingHistory(false);
        }
    }, [selectedPatient, getActorName]);

    useEffect(() => {
        if (selectedPatient) fetchDataPasien();
    }, [selectedPatient, fetchDataPasien]);

    const handleOpenModal = () => {
        setFormData({ diagnosa: "", foto: "", catatan: "", tipeRekamMedis: "" });
        setFotoFile(null);
        setUploading(false);
        setSubmittingForm(false);
        setShowModal(true);
    };

    const handleOpenNoteModal = (noteContent) => {
        setFullNoteContent(noteContent);
        setShowNoteModal(true);
    };

    const handleFotoFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
            if (file.size > MAX_FILE_SIZE_BYTES) {
                alert("Ukuran file melebihi batas maksimal 5 MB. Silakan pilih file yang lebih kecil.");
                e.target.value = null; // Clear the input
                setFotoFile(null);
                setFormData(f => ({ ...f, foto: "" }));
            } else {
                setFotoFile(file);
            }
        } else {
            setFotoFile(null);
            setFormData(f => ({ ...f, foto: "" }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedPatient) {
            alert("Pasien belum dipilih. Silakan pilih pasien terlebih dahulu.");
            return;
        }

        setSubmittingForm(true);
        let finalFotoUrl = formData.foto;

        try {
            if (fotoFile) {
                setUploading(true);
                finalFotoUrl = await uploadToPinata(fotoFile);
            }

            await contract.methods
                .tambahRekamMedis(
                    selectedPatient,
                    formData.diagnosa,
                    finalFotoUrl,
                    formData.catatan,
                    formData.tipeRekamMedis
                )
                .send({ from: account });
            alert("Rekam medis baru berhasil ditambahkan.");

            setShowModal(false);
            setFotoFile(null);
            setFormData({ diagnosa: "", foto: "", catatan: "", tipeRekamMedis: "" });

            await fetchDataPasien();
            setCurrentPage(1);
        } catch (err) {
            console.error("Gagal menyimpan rekam medis:", err);
            alert(`Gagal menyimpan rekam medis: ${err.message || 'Terjadi kesalahan tidak dikenal'}`);
        } finally {
            setUploading(false);
            setSubmittingForm(false);
        }
    };

    const filteredPatients = search
        ? patientInfos.filter(
            (p) =>
                (p.nama && p.nama.toLowerCase().includes(search.toLowerCase())) ||
                (p.ID && p.ID.toLowerCase().includes(search.toLowerCase())) ||
                (p.NIK && p.NIK.toLowerCase().includes(search.toLowerCase())) ||
                (p.address && p.address.toLowerCase().includes(search.toLowerCase()))
        )
        : patientInfos;

    const formatTimestamp = (ts) => {
        if (typeof ts === 'bigint') {
            ts = Number(ts);
        }
        if (!ts || ts === 0) return "-";

        if (isNaN(ts)) {
            console.error("Invalid timestamp received:", ts);
            return "-";
        }

        const date = new Date(ts * 1000);
        return date.toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });
    };

    const getFilteredAndSortedHistory = useMemo(() => {
        let currentFiltered = rekamMedisHistory;

        if (historySearchTerm) {
            const lowerCaseSearch = historySearchTerm.toLowerCase();
            currentFiltered = currentFiltered.filter(item =>
                (item.tipeRekamMedis && item.tipeRekamMedis.toLowerCase().includes(lowerCaseSearch)) ||
                (item.diagnosa && item.diagnosa.toLowerCase().includes(lowerCaseSearch)) ||
                (item.catatan && item.catatan.toLowerCase().includes(lowerCaseSearch)) ||
                (item.pembuat && item.pembuat.toLowerCase().includes(lowerCaseSearch)) ||
                formatTimestamp(item.timestamp).toLowerCase().includes(lowerCaseSearch)
            );
        }

        currentFiltered.sort((a, b) => {
            if (sortByDate === 'desc') {
                return b.timestamp - a.timestamp;
            } else {
                return a.timestamp - b.timestamp;
            }
        });

        return currentFiltered.map((item, idx) => ({ ...item, noUrut: idx + 1 }));
    }, [rekamMedisHistory, historySearchTerm, sortByDate]);

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(5);
    const totalPages = Math.ceil(getFilteredAndSortedHistory.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = getFilteredAndSortedHistory.slice(indexOfFirstItem, indexOfLastItem);


    const renderPaginationButtons = () => {
        const pages = [];
        if (totalPages <= 1) return null;

        let startPage = Math.max(1, currentPage - 2);
        let endPage = Math.min(totalPages, currentPage + 2);

        if (endPage - startPage + 1 < 5) {
            if (startPage === 1) {
                endPage = Math.min(totalPages, 5);
            } else if (endPage === totalPages) {
                startPage = Math.max(1, totalPages - 4);
            }
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

    const paginate = (pageNumber) => {
        if (pageNumber < 1 || pageNumber > totalPages) return;
        setCurrentPage(pageNumber);
    };


    return (
        <div className="w-full p-4 sm:p-6 md:p-8 lg:p-10">
            {!selectedPatient ? (
                <div className="max-w-full mx-auto">
                    {/* Ukuran teks PASIEN SAYA disesuaikan, emoji dihilangkan */}
                    <h2 className="text-2xl font-bold text-gray-800 mb-8 border-b-2 border-blue-200 pb-4">
                        PASIEN SAYA
                    </h2>
                    <div className="mb-8 flex flex-col sm:flex-row gap-4 items-center">
                        <div className="relative w-full sm:max-w-lg">
                            <span className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400">
                                <IconSearch />
                            </span>
                            <input
                                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-colors text-gray-700"
                                placeholder="Cari pasien (nama / ID / NIK / alamat wallet)..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>
                    {loadingData ? <p className="text-center text-blue-600 py-10 text-lg font-medium">Memuat daftar pasien...</p> :
                        filteredPatients.length === 0 ? (
                            <div className="bg-white rounded-xl shadow-lg p-10 text-center border border-gray-200">
                                <p className="italic text-gray-600 text-lg">
                                    {search ? "Tidak ada pasien yang cocok dengan pencarian Anda." : "Tidak ada pasien yang ditugaskan kepada Anda."}
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto bg-white rounded-xl shadow-lg border border-gray-200">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-blue-600 text-white">
                                        <tr>
                                            <th className="px-6 py-3.5 text-center text-sm font-semibold uppercase tracking-wider">No.</th>
                                            <th className="px-6 py-3.5 text-left text-sm font-semibold uppercase tracking-wider">ID Pasien</th>
                                            <th className="px-6 py-3.5 text-left text-sm font-semibold uppercase tracking-wider">NIK</th>
                                            <th className="px-6 py-3.5 text-left text-sm font-semibold uppercase tracking-wider">Nama Pasien</th>
                                            <th className="px-6 py-3.5 text-left text-sm font-semibold uppercase tracking-wider">Alamat Wallet</th>
                                            <th className="px-6 py-3.5 text-center text-sm font-semibold uppercase tracking-wider">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-100">
                                        {filteredPatients.map((p, idx) => (
                                            <tr key={p.address} className="hover:bg-blue-50 transition-colors duration-150">
                                                <td className="text-center px-6 py-4 whitespace-nowrap text-sm text-gray-700">{idx + 1}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{p.ID || "-"}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{p.NIK || "-"}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{p.nama}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-mono break-all">{p.address}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                                                    <button
                                                        onClick={() => setSelectedPatient(p.address)}
                                                        className="inline-flex items-center bg-blue-500 hover:bg-blue-600 text-white px-5 py-2.5 rounded-lg font-semibold text-sm transition shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                                                    >
                                                        Lihat Detail <IconChevronRight />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                </div>
            ) : (
                <div className="animate-fadeIn max-w-full mx-auto">
                    {/* Detail Pasien Card: Tombol Kembali di sudut kanan atas, ukuran teks disesuaikan, emoji dihilangkan */}
                    {pasienData && (
                        <div className="mb-10 bg-white rounded-xl shadow-xl p-8 border border-gray-200 relative">
                            <button
                                onClick={() => setSelectedPatient(null)}
                                className="absolute top-4 right-4 inline-flex items-center bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
                            >
                                <IconArrowLeft /> Kembali
                            </button>
                            <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b-2 border-blue-200 pb-5 pr-32">
                                Detail Pasien: <span className="text-blue-800">{pasienData.nama}</span>
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-x-4 gap-y-3">
                                <DetailItem icon={<IconUser />} label="Nama Lengkap" value={pasienData.nama} />
                                <DetailItem icon={<IconIDPasien />} label="ID Pasien" value={pasienData.ID} />
                                <DetailItem icon={<IconNIK />} label="NIK" value={pasienData.NIK} />
                                <DetailItem icon={<IconCalendar />} label="Tanggal Lahir" value={pasienData.tanggalLahir} />
                                <DetailItem icon={<IconGender />} label="Jenis Kelamin" value={pasienData.gender} />
                                <DetailItem icon={<IconBloodType />} label="Golongan Darah" value={pasienData.golonganDarah} />
                                <DetailItem icon={<IconLocation />} label="Alamat" value={pasienData.alamat} />
                                <DetailItem icon={<IconPhone />} label="No Telepon" value={pasienData.noTelepon} />
                                <DetailItem icon={<IconMail />} label="Email" value={pasienData.email} />
                            </div>
                        </div>
                    )}

                    <div className="mt-6 bg-white rounded-xl shadow-xl p-8 border border-gray-200">
                        <div className="flex flex-col sm:flex-row items-center justify-between mb-6 pb-5 border-b-2 border-gray-300">
                            {/* Ukuran teks Riwayat Rekam Medis disesuaikan, emoji dihilangkan */}
                            <h3 className="font-bold text-xl text-gray-800 mb-4 sm:mb-0">
                                Riwayat Rekam Medis
                            </h3>
                            <button
                                onClick={handleOpenModal}
                                className="inline-flex items-center bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold text-sm transition shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                            >
                                <IconEditPencil /> Tambah Rekam Medis Baru
                            </button>
                        </div>

                        {/* Filter dan Search untuk Riwayat Rekam Medis */}
                        <div className="flex flex-col sm:flex-row gap-4 mb-6">
                            <div className="relative flex-1">
                                <span className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400">
                                    <IconSearch />
                                </span>
                                <input
                                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-colors text-gray-700"
                                    placeholder="Cari diagnosa, catatan, pembuat, tipe, atau waktu..."
                                    value={historySearchTerm}
                                    onChange={(e) => setHistorySearchTerm(e.target.value)}
                                />
                            </div>
                            <select
                                className="w-full sm:w-auto border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-colors text-gray-700"
                                value={sortByDate}
                                onChange={(e) => setSortByDate(e.target.value)}
                            >
                                <option value="desc">Terbaru Dulu</option>
                                <option value="asc">Terlama Dulu</option>
                            </select>
                        </div>
                        {/* Akhir Filter dan Search */}

                        {loadingHistory ? (
                            <p className="italic text-blue-600 text-center py-10 text-lg font-medium">Memuat riwayat rekam medis...</p>
                        ) : getFilteredAndSortedHistory.length === 0 ? (
                            <p className="italic text-gray-600 text-center py-10 text-lg">
                                {historySearchTerm ? "Tidak ada rekam medis yang cocok dengan pencarian." : "Belum ada data rekam medis untuk pasien ini."}
                            </p>
                        ) : (
                            <div className="overflow-x-auto border border-gray-200 rounded-lg shadow-sm">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-100 text-gray-700">
                                        <tr>
                                            <th className="px-6 py-3.5 text-center text-sm font-semibold uppercase tracking-wider">No.</th>
                                            <th className="px-6 py-3.5 text-left text-sm font-semibold uppercase tracking-wider">Tipe RM</th>
                                            <th className="px-6 py-3.5 text-left text-sm font-semibold uppercase tracking-wider">Diagnosa</th>
                                            <th className="px-6 py-3.5 text-center text-sm font-semibold uppercase tracking-wider">Foto RM</th>
                                            <th className="px-6 py-3.5 text-left text-sm font-semibold uppercase tracking-wider">Catatan</th>
                                            <th className="px-6 py-3.5 text-left text-sm font-semibold uppercase tracking-wider">Dibuat Oleh</th>
                                            <th className="px-6 py-3.5 text-left text-sm font-semibold uppercase tracking-wider">Waktu Pembuatan</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-100">
                                        {currentItems.map((rm) => {
                                            const actorDisplay = rm.pembuat;
                                            const timestampDisplay = rm.timestamp ? formatTimestamp(rm.timestamp) : '-';
                                            const truncatedNote = truncateText(rm.catatan, 50);

                                            return (
                                                <tr key={`${rm.id_rm}-${rm.timestamp}`} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-center">{rm.noUrut}</td>
                                                    <td className="px-6 py-4 text-sm text-gray-800 min-w-[120px] break-words">{rm.tipeRekamMedis || '-'}</td>
                                                    <td className="px-6 py-4 text-sm text-gray-800 min-w-[200px] break-words">{rm.diagnosa}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                                                        {rm.foto ? (
                                                            <a href={rm.foto} target="_blank" rel="noopener noreferrer"
                                                                className="text-blue-600 hover:text-blue-800 underline font-medium">
                                                                Lihat File
                                                            </a>
                                                        ) : (
                                                            <span className="italic text-gray-400">N/A</span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-600 min-w-[250px] overflow-hidden whitespace-normal"
                                                        title={rm.catatan}>
                                                        {truncatedNote.display}
                                                        {truncatedNote.truncated && (
                                                            <button
                                                                onClick={() => handleOpenNoteModal(rm.catatan)}
                                                                className="text-blue-600 hover:text-blue-800 text-xs ml-1 font-semibold underline focus:outline-none"
                                                            >
                                                                selengkapnya
                                                            </button>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600" title={rm.pembuat || ''}>
                                                        {actorDisplay}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500 italic">
                                                        {timestampDisplay}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Pagination Controls */}
                        {totalPages > 0 && (
                            <div className="flex justify-center items-center mt-8">
                                <button
                                    onClick={() => paginate(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="px-5 py-2.5 mx-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium shadow-md"
                                >
                                    Sebelum
                                </button>
                                {renderPaginationButtons()}
                                <button
                                    onClick={() => paginate(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className="px-5 py-2.5 mx-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium shadow-md"
                                >
                                    Sesudah
                                </button>
                            </div>
                        )}
                        {/* Akhir Pagination Controls */}
                    </div>
                </div>
            )}

            {/* Modal untuk Menambah Rekam Medis Baru */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center p-4 z-[100] animate-fade-in">
                    <div className="bg-white rounded-xl p-8 shadow-2xl w-full max-w-lg relative animate-slide-up transform transition-all duration-300 border border-gray-200">
                        <button
                            className="absolute top-4 right-4 text-3xl text-gray-400 hover:text-red-600 transition-colors focus:outline-none"
                            onClick={() => setShowModal(false)}
                        > &times; </button>
                        <h3 className="text-2xl font-bold mb-6 text-blue-700 border-b-2 border-blue-200 pb-3">
                            Tambah Rekam Medis Baru 📝
                        </h3>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Diagnosa:</label>
                                <input type="text" name="diagnosa" value={formData.diagnosa}
                                    onChange={(e) => setFormData((f) => ({ ...f, diagnosa: e.target.value }))}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-colors text-gray-800"
                                    required />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Tipe Rekam Medis:</label>
                                <select name="tipeRekamMedis" value={formData.tipeRekamMedis}
                                    onChange={(e) => setFormData((f) => ({ ...f, tipeRekamMedis: e.target.value }))}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-colors text-gray-800"
                                    required >
                                    <option value="">Pilih Tipe Rekam Medis</option>
                                    <option value="Pemeriksaan Umum">Pemeriksaan Umum</option>
                                    <option value="Hasil Lab">Hasil Lab</option>
                                    <option value="Resep Obat">Resep Obat</option>
                                    <option value="Surat Rujukan">Surat Rujukan</option>
                                    <option value="Catatan Tindakan">Catatan Tindakan</option>
                                    <option value="Lainnya">Lainnya</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Foto Rekam Medis:</label>
                                <input type="file" accept="image/*,application/pdf"
                                    onChange={handleFotoFileChange}
                                    disabled={submittingForm}
                                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-5 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-300 rounded-lg p-2.5 shadow-sm transition-colors" />
                                <div className="text-xs text-gray-500 mt-1.5">
                                    Unggah foto/hasil scan (maks. 5 MB, format gambar atau PDF).
                                </div>
                                {uploading && fotoFile && <div className="text-xs text-blue-600 mt-1.5 animate-pulse">Mengupload file ke IPFS...</div>}
                                {!uploading && formData.foto && !fotoFile && (
                                    <div className="mt-2 text-sm text-gray-600">
                                        File saat ini: <a href={formData.foto} target="_blank" rel="noopener noreferrer"
                                            className="text-blue-600 hover:text-blue-800 underline">
                                            {formData.foto.substring(formData.foto.lastIndexOf('/') + 1).substring(0, 30)}...
                                        </a>
                                    </div>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Catatan:</label>
                                <textarea name="catatan" value={formData.catatan}
                                    onChange={(e) => setFormData((f) => ({ ...f, catatan: e.target.value }))}
                                    rows={5}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-colors text-gray-800" />
                            </div>
                            <div className="flex gap-4 pt-4 justify-end">
                                <button type="button" onClick={() => setShowModal(false)}
                                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-2.5 rounded-lg font-semibold transition shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-400">
                                    Batal
                                </button>
                                <button type="submit"
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-semibold transition shadow-md disabled:opacity-70 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                    disabled={uploading || submittingForm}>
                                    {uploading ? "Mengupload..." : (submittingForm ? "Menambah..." : "Tambah Rekam Medis")}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Baru untuk Menampilkan Catatan Lengkap */}
            {showNoteModal && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center p-4 z-[101] animate-fade-in">
                    <div className="bg-white rounded-xl p-8 shadow-2xl w-full max-w-xl relative animate-slide-up transform transition-all duration-300 border border-gray-200">
                        <button
                            className="absolute top-4 right-4 text-3xl text-gray-400 hover:text-red-600 transition-colors focus:outline-none"
                            onClick={() => setShowNoteModal(false)}
                        > &times; </button>
                        <h3 className="text-2xl font-bold mb-4 text-blue-700 border-b-2 border-blue-200 pb-3">
                            Catatan Lengkap
                        </h3>
                        <div className="text-base text-gray-800 leading-relaxed max-h-96 overflow-y-auto p-2 border border-gray-200 rounded-lg bg-gray-50">
                            {fullNoteContent}
                        </div>
                        <div className="mt-6 text-right">
                            <button
                                onClick={() => setShowNoteModal(false)}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-semibold transition shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}