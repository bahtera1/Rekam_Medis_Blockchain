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
    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" stroke='currentColor' strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
    </svg>
);
const IconChevronRight = () => (
    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
    </svg>
);
const IconEditPencil = () => <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>;

// Ikon-ikon untuk detail pasien
const IconUser = () => <svg className="w-5 h-5 mr-2.5 text-blue-600 inline" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path></svg>;
const IconCalendar = () => <svg className="w-5 h-5 mr-2.5 text-blue-600 inline" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 002-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"></path></svg>;
const IconMail = () => <svg className="w-5 h-5 mr-2.5 text-blue-600 inline" fill="currentColor" viewBox="0 0 20 20"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"></path><path fillRule="evenodd" d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" clipRule="evenodd"></path></svg>;
const IconPhone = () => <svg className="w-5 h-5 mr-2.5 text-blue-600 inline" fill="currentColor" viewBox="0 0 20 20"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"></path></svg>;
const IconLocation = () => <svg className="w-5 h-5 mr-2.5 text-blue-600 inline" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"></path></svg>;
const IconGender = () => (
    <svg className="w-5 h-5 mr-2.5 text-blue-600 inline" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-2a6 6 0 100-12 6 6 0 000 12zm-2-7a1 1 0 100-2H6a1 1 0 100 2h2zm4 0a1 1 0 100-2h-2a1 1 0 100 2h2zm-2 4a1 1 0 100-2H8a1 1 0 100 2h2z" clipRule="evenodd" />
    </svg>
);
const IconBloodType = () => (
    <svg className="w-5 h-5 mr-2.5 text-red-600 inline" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a.93.93 0 01-.682-.282L4.43 12.83A6.003 6.003 0 014 8.5C4 5.467 7.16 3 10 3s6 2.467 6 5.5c0 1.34-.435 2.603-1.232 3.616l-.001.001-4.887 4.886A.93.93 0 0110 18zm0-13.5a4.5 4.5 0 00-4.5 4.5c0 .998.33 1.923.928 2.668L10 15.336l3.572-3.668A3.513 3.513 0 0014.5 8.5a4.5 4.5 0 00-4.5-4.5z" clipRule="evenodd" />
    </svg>
);

// Icon baru untuk ID pasien
const IconIDPasien = () => (
    <svg className="w-5 h-5 mr-2.5 text-blue-600 inline" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 2a8 8 0 100 16 8 8 0 000-16zM5 9a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 4a1 1 0 000 2h6a1 1 0 000-2H6z" clipRule="evenodd" />
    </svg>
);

// Icon baru untuk NIK
const IconNIK = () => (
    <svg className="w-5 h-5 mr-2.5 text-blue-600 inline" fill="currentColor" viewBox="0 0 20 20">
        <path d="M4 4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm0 14V6h12v12H4zM9 10a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1zm3 0a1 1 0 011-1h.01a1 1 0 110 2H13a1 1 0 01-1-1zm-3 4a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1zm3 0a1 1 0 011-1h.01a1 1 0 110 2H13a1 1 0 01-1-1z" clipRule="evenodd" fillRule="evenodd" />
    </svg>
);


// DetailItem adalah komponen umum, bisa dipindahkan ke folder components jika banyak digunakan
const DetailItem = ({ icon, label, value }) => (
    <div className="flex items-start py-3">
        {icon && <div className="mr-3 mt-1 text-blue-600 flex-shrink-0 w-5 h-5">{icon}</div>}
        <div className="flex-1">
            <p className="text-sm font-medium text-gray-500">{label}</p>
            <p className="text-base font-semibold text-gray-800">{value || '-'}</p>
        </div>
    </div>
);

// Fungsi pembantu untuk memotong teks
const truncateText = (text, maxLength) => {
    if (!text) return { display: '-', truncated: false };
    if (text.length <= maxLength) return { display: text, truncated: false };
    return { display: text.substring(0, maxLength) + '...', truncated: true };
};


// --- Komponen Utama DataPasien ---
export default function DataPasien({ account, assignedPatients }) {
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [pasienData, setPasienData] = useState(null); // PasienData sekarang mengandung ID
    const [rekamMedisHistory, setRekamMedisHistory] = useState([]);
    const [showModal, setShowModal] = useState(false); // Modal untuk menambah rekam medis
    const [showNoteModal, setShowNoteModal] = useState(false); // Modal baru untuk melihat catatan lengkap
    const [fullNoteContent, setFullNoteContent] = useState(""); // Konten catatan lengkap untuk modal
    const [formData, setFormData] = useState({
        diagnosa: "", foto: "", catatan: "", tipeRekamMedis: ""
    });
    const [fotoFile, setFotoFile] = useState(null);
    const [uploading, setUploading] = useState(false); // State untuk proses upload file ke Pinata
    const [submittingForm, setSubmittingForm] = useState(false); // State untuk proses submit form ke blockchain
    const [patientInfos, setPatientInfos] = useState([]);
    const [search, setSearch] = useState(""); // Search for patient list (for patient list selection)
    const [loadingHistory, setLoadingHistory] = useState(false); // Untuk riwayat rekam medis
    const [loadingData, setLoadingData] = useState(false); // Untuk daftar pasien
    const [doctorNamesCache, setDoctorNamesCache] = useState({});

    const [historySearchTerm, setHistorySearchTerm] = useState('');
    const [sortByDate, setSortByDate] = useState('desc');

    useEffect(() => {
        setCurrentPage(1);
    }, [historySearchTerm, sortByDate]);

    useEffect(() => {
        setLoadingData(true);
        if (assignedPatients && assignedPatients.length > 0) {
            setPatientInfos(assignedPatients); // assignedPatients sekarang sudah membawa ID
        } else {
            setPatientInfos([]);
        }
        setLoadingData(false);
    }, [assignedPatients]);

    const getActorName = useCallback(async (actorAddress) => {
        // Pastikan actorAddress adalah string. Jika bukan, konversi ke string atau tangani.
        const addressAsString = typeof actorAddress === 'string' ? actorAddress : String(actorAddress);

        if (addressAsString === '0x0000000000000000000000000000000000000000' || !addressAsString) {
            return "N/A";
        }
        if (doctorNamesCache[addressAsString]) { // Gunakan addressAsString untuk cache
            return doctorNamesCache[addressAsString];
        }
        try {
            const isDoc = await contract.methods.isDokter(addressAsString).call(); // Gunakan addressAsString
            if (isDoc) {
                const dokterInfo = await contract.methods.getDokter(addressAsString).call(); // Gunakan addressAsString
                const namaDokter = dokterInfo[0];
                setDoctorNamesCache(prev => ({ ...prev, [addressAsString]: namaDokter })); // Update cache
                return namaDokter;
            }
            const isPas = await contract.methods.isPasien(addressAsString).call(); // Gunakan addressAsString
            if (isPas) {
                const pasienData = await contract.methods.getPasienData(addressAsString).call(); // Gunakan addressAsString
                const namaPasien = pasienData[0];
                setDoctorNamesCache(prev => ({ ...prev, [addressAsString]: namaPasien })); // Update cache
                return namaPasien;
            }
            // Jika bukan dokter atau pasien, tampilkan versi singkat alamat string
            return `${addressAsString.substring(0, 6)}...${addressAsString.substring(addressAsString.length - 4)}`;
        } catch (err) {
            console.warn(`Gagal mendapatkan nama untuk aktor ${addressAsString}:`, err);
            return `${addressAsString.substring(0, 6)}...${addressAsString.substring(addressAsString.length - 4)}`;
        }
    }, [doctorNamesCache]);

    // Fungsi untuk memuat detail pasien dan riwayat rekam medis (dibungkus useCallback)
    const fetchDataPasien = useCallback(async () => {
        if (!selectedPatient) {
            setPasienData(null);
            setRekamMedisHistory([]);
            return;
        }
        setLoadingHistory(true);
        try {
            // getPasienData mengembalikan:
            // nama (0), ID (1), NIK (2), golonganDarah (3), tanggalLahir (4), gender (5),
            // alamat (6), noTelepon (7), email (8), rumahSakitPenanggungJawab (9)
            const p = await contract.methods.getPasienData(selectedPatient).call();
            setPasienData({
                nama: p[0],
                ID: p[1], // <--- Ambil ID Pasien di sini
                NIK: p[2], // <--- Ambil NIK di sini
                golonganDarah: p[3], // Index bergeser
                tanggalLahir: p[4], // Index bergeser
                gender: p[5], // Index bergeser
                alamat: p[6], // Index bergeser
                noTelepon: p[7], // Index bergeser
                email: p[8], // Index bergeser
                rumahSakitPenanggungJawab: p[9] // Index bergeser
            });

            const rmIds = await contract.methods.getRekamMedisIdsByPasien(selectedPatient).call();
            let allRecords = [];

            for (const id of rmIds) {
                const rmData = await contract.methods.getRekamMedis(id).call();
                // RekamMedisData struct:
                // uint id;                 // Index 0
                // address pasien;          // Index 1
                // string diagnosa;         // Index 2
                // string foto;             // Index 3
                // string catatan;          // Index 4
                // address pembuat;         // Index 5
                // uint256 timestampPembuatan; // Index 6
                // string tipeRekamMedis;   // Index 7

                const actorName = await getActorName(rmData[5]); // pembuat is at index 5

                allRecords.push({
                    id_rm: rmData[0].toString(),
                    pasien: rmData[1],
                    diagnosa: rmData[2],
                    foto: rmData[3],
                    catatan: rmData[4],
                    pembuat: actorName, // Use the resolved actorName
                    timestamp: Number(rmData[6]), // timestamp is at index 6
                    tipeRekamMedis: rmData[7] // tipeRekamMedis is at index 7
                });
            }

            setRekamMedisHistory(allRecords);

        } catch (error) {
            console.error("Gagal memuat data pasien atau rekam medis:", error);
            alert(`Gagal memuat detail pasien: ${error.message || 'Terjadi kesalahan tidak dikenal'}`);
        } finally {
            setLoadingHistory(false);
        }
    }, [selectedPatient, getActorName]); // <--- Dependensi untuk useCallback

    // Effect memanggil fetchDataPasien
    useEffect(() => {
        if (selectedPatient) fetchDataPasien();
    }, [selectedPatient, fetchDataPasien]); // <--- Dependensi diubah

    const handleOpenModal = () => {
        setFormData({ diagnosa: "", foto: "", catatan: "", tipeRekamMedis: "" });
        setFotoFile(null);
        setUploading(false); // Pastikan state uploading direset saat modal dibuka
        setSubmittingForm(false); // Pastikan state submittingForm direset saat modal dibuka
        setShowModal(true);
    };

    // Fungsi untuk membuka modal catatan lengkap
    const handleOpenNoteModal = (noteContent) => {
        setFullNoteContent(noteContent);
        setShowNoteModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedPatient) {
            alert("Pasien belum dipilih. Silakan pilih pasien terlebih dahulu.");
            return;
        }

        setSubmittingForm(true); // Mulai proses submit form
        let finalFotoUrl = formData.foto; // Default to existing foto URL if any

        try {
            if (fotoFile) { // Only upload if a new file is selected
                setUploading(true); // Mulai proses upload file ke Pinata
                finalFotoUrl = await uploadToPinata(fotoFile);
            }

            await contract.methods
                .tambahRekamMedis(
                    selectedPatient,
                    formData.diagnosa,
                    finalFotoUrl, // Use the potentially new URL
                    formData.catatan,
                    formData.tipeRekamMedis
                )
                .send({ from: account });
            alert("Rekam medis baru berhasil ditambahkan.");

            setShowModal(false);
            setFotoFile(null); // Clear file input
            setFormData({ diagnosa: "", foto: "", catatan: "", tipeRekamMedis: "" }); // Clear form data

            // PENTING: Panggil fetchDataPasien setelah rekam medis baru ditambahkan
            await fetchDataPasien(); // <--- Panggil fungsi ini untuk merefresh data
            setCurrentPage(1); // Reset paginasi ke halaman pertama
        } catch (err) {
            console.error("Gagal menyimpan rekam medis:", err);
            alert(`Gagal menyimpan rekam medis: ${err.message || 'Terjadi kesalahan tidak dikenal'}`);
        } finally {
            setUploading(false); // Pastikan ini direset di finally
            setSubmittingForm(false); // Pastikan ini direset di finally
        }
    };

    const filteredPatients = search
        ? patientInfos.filter(
            (p) =>
                (p.nama && p.nama.toLowerCase().includes(search.toLowerCase())) ||
                (p.ID && p.ID.toLowerCase().includes(search.toLowerCase())) || // Tambahkan pencarian berdasarkan ID
                (p.NIK && p.NIK.toLowerCase().includes(search.toLowerCase())) || // <-- Tambahkan pencarian berdasarkan NIK
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

    // --- Logika Filter & Pagination Riwayat Rekam Medis (diimplementasi di sini) ---
    const getFilteredAndSortedHistory = useMemo(() => {
        let currentFiltered = rekamMedisHistory;

        // Filter berdasarkan Teks Pencarian
        if (historySearchTerm) {
            const lowerCaseSearch = historySearchTerm.toLowerCase();
            currentFiltered = currentFiltered.filter(item =>
                // item.id_rm.toString().toLowerCase().includes(lowerCaseSearch) || // Menghapus filter ID RM
                (item.tipeRekamMedis && item.tipeRekamMedis.toLowerCase().includes(lowerCaseSearch)) ||
                (item.diagnosa && item.diagnosa.toLowerCase().includes(lowerCaseSearch)) ||
                (item.catatan && item.catatan.toLowerCase().includes(lowerCaseSearch)) || // Filter catatan
                (item.pembuat && item.pembuat.toLowerCase().includes(lowerCaseSearch)) ||
                formatTimestamp(item.timestamp).toLowerCase().includes(lowerCaseSearch)
            );
        }

        // Urutkan berdasarkan Tanggal
        currentFiltered.sort((a, b) => {
            if (sortByDate === 'desc') {
                return b.timestamp - a.timestamp; // Terbaru di atas
            } else {
                return a.timestamp - b.timestamp; // Terlama di atas
            }
        });

        // Berikan nomor urut setelah filtering & sorting
        return currentFiltered.map((item, idx) => ({ ...item, noUrut: idx + 1 }));
    }, [rekamMedisHistory, historySearchTerm, sortByDate]);

    // Logika Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(5); // Jumlah item per halaman
    const totalPages = Math.ceil(getFilteredAndSortedHistory.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = getFilteredAndSortedHistory.slice(indexOfFirstItem, indexOfLastItem);


    const renderPaginationButtons = () => {
        const pages = [];
        if (totalPages <= 1) return null;

        // Logika untuk menampilkan maksimal 5 tombol paginasi
        let startPage = Math.max(1, currentPage - 2);
        let endPage = Math.min(totalPages, currentPage + 2);

        // Sesuaikan startPage dan endPage agar selalu ada 5 tombol jika totalPages memungkinkan
        // Prioritaskan 5 tombol di sekitar halaman aktif
        if (endPage - startPage + 1 < 5) {
            if (startPage === 1) { // Jika di awal, perluas ke kanan
                endPage = Math.min(totalPages, 5);
            } else if (endPage === totalPages) { // Jika di akhir, perluas ke kiri
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
            if (startPage > 2) { // Jika ada gap lebih dari 1 halaman dari halaman 1
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
            if (endPage < totalPages - 1) { // Jika ada gap lebih dari 1 halaman ke halaman terakhir
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
        <div className="w-full p-1 sm:p-1 md:p-1 ">
            {!selectedPatient ? (
                <div className="max-w-full mx-auto"> {/* <<< DIUBAH: max-w-8xl menjadi max-w-full */}
                    {/* Judul "PASIEN SAYA" - Diperbarui agar konsisten */}
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-8 border-b pb-4"> {/* <<< DIUBAH FONT-SIZE, FONT-WEIGHT, TEXT-COLOR, MB */}
                        PASIEN SAYA
                    </h2>
                    <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row gap-4 items-center">
                        <div className="relative w-full sm:max-w-lg">
                            <span className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400">
                                <IconSearch />
                            </span>
                            <input
                                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-colors"
                                placeholder="Cari pasien (nama / ID / NIK / alamat wallet)..." // <-- PERBAIKAN DI SINI, tambahkan NIK ke placeholder
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>
                    {loadingData ? <p className="text-center text-slate-600 py-10 text-lg">Memuat daftar pasien...</p> : // <<< DIUBAH TEXT-COLOR
                        filteredPatients.length === 0 ? (
                            <div className="bg-white rounded-xl shadow-md p-10 text-center">
                                <p className="italic text-slate-600 text-lg"> {/* <<< DIUBAH TEXT-COLOR */}
                                    {search ? "Tidak ada pasien yang cocok dengan pencarian Anda." : "Tidak ada pasien yang ditugaskan kepada Anda."}
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto bg-white rounded-xl shadow-lg">
                                <table className="min-w-full divide-y divide-gray-200">
                                    {/* Header Tabel - Diperbarui agar konsisten */}
                                    <thead className="bg-blue-600 text-white"> {/* <<< DIUBAH BG DAN TEXT COLOR */}
                                        <tr>
                                            <th className="px-6 py-3.5 text-center text-xs font-semibold uppercase tracking-wider">No.</th>
                                            <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider">ID Pasien</th>
                                            <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider">NIK</th> {/* <-- Tambahkan header NIK */}
                                            <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider">Nama Pasien</th>
                                            <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider">Alamat Wallet</th>
                                            <th className="px-6 py-3.5 text-center text-xs font-semibold uppercase tracking-wider">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {filteredPatients.map((p, idx) => (
                                            <tr key={p.address} className="hover:bg-blue-50 transition-colors duration-150">
                                                <td className="text-center px-6 py-4 whitespace-nowrap text-sm text-gray-700">{idx + 1}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{p.ID || "-"}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{p.NIK || "-"}</td> {/* <-- Tampilkan NIK di tabel */}
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{p.nama}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-mono break-all">{p.address}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                                                    <button
                                                        onClick={() => setSelectedPatient(p.address)}
                                                        className="inline-flex items-center bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold text-xs transition shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
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
                <div className="animate-fadeIn max-w-full mx-auto p-6 sm:p-8 md:p-10">
                    {/* <<< AWAL PERUBAHAN UNTUK TOMBOL KEMBALI */}
                    <div className="w-full max-w-9xl mx-auto mb-8"> {/* Container untuk tombol kembali, sejajarkan dengan card di bawah */}
                        <button
                            onClick={() => setSelectedPatient(null)}
                            className="inline-flex items-center bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
                        >
                            <IconArrowLeft /> Kembali ke Daftar Pasien
                        </button>
                    </div>
                    {/* <<< AKHIR PERUBAHAN UNTUK TOMBOL KEMBALI */}

                    {pasienData && (
                        <div className="mb-10 sm:mb-12 bg-white rounded-xl shadow-xl p-6 sm:p-8">
                            {/* Judul "Detail Pasien" - Diperbarui agar konsisten */}
                            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 border-b pb-5">
                                Detail Pasien: <span className="text-blue-800">{pasienData.nama}</span>
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2"> {/* gap-x-6 untuk kerapian */}
                                <DetailItem icon={<IconUser />} label="Nama Lengkap" value={pasienData.nama} />
                                <DetailItem icon={<IconIDPasien />} label="ID Pasien" value={pasienData.ID} />
                                <DetailItem icon={<IconNIK />} label="NIK" value={pasienData.NIK} /> {/* <-- Tampilkan NIK di detail */}
                                <DetailItem icon={<IconCalendar />} label="Tanggal Lahir" value={pasienData.tanggalLahir} />
                                <DetailItem icon={<IconGender />} label="Jenis Kelamin" value={pasienData.gender} />
                                <DetailItem icon={<IconBloodType />} label="Golongan Darah" value={pasienData.golonganDarah} />
                                <DetailItem icon={<IconLocation />} label="Alamat" value={pasienData.alamat} />
                                <DetailItem icon={<IconPhone />} label="No Telepon" value={pasienData.noTelepon} />
                                <DetailItem icon={<IconMail />} label="Email" value={pasienData.email} />
                            </div>
                        </div>
                    )}

                    <div className="mt-6 bg-white rounded-xl shadow-xl p-6 sm:p-8">
                        <div className="flex flex-col sm:flex-row items-center justify-between mb-6 pb-5 border-b border-gray-300">
                            {/* Judul "Riwayat Rekam Medis" - Diperbarui agar konsisten */}
                            <h3 className="font-semibold text-2xl sm:text-2xl text-slate-800 mb-4 sm:mb-0">
                                Riwayat Rekam Medis
                            </h3>
                            <button
                                onClick={handleOpenModal}
                                className="inline-flex items-center bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold text-sm transition shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                            >
                                <IconEditPencil /> Tambah Rekam Medis Baru
                            </button>
                        </div>

                        {/* --- Filter dan Search untuk Riwayat Rekam Medis (diimplementasi di sini) --- */}
                        <div className="flex flex-col sm:flex-row gap-4 mb-6">
                            <div className="relative flex-1">
                                <span className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400">
                                    <IconSearch />
                                </span>
                                <input
                                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-colors"
                                    placeholder="Cari diagnosa, catatan, pembuat, tipe, atau waktu..."
                                    value={historySearchTerm}
                                    onChange={(e) => setHistorySearchTerm(e.target.value)}
                                />
                            </div>
                            <select
                                className="w-full sm:w-auto border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-colors"
                                value={sortByDate}
                                onChange={(e) => setSortByDate(e.target.value)}
                            >
                                <option value="desc">Terbaru Dulu</option>
                                <option value="asc">Terlama Dulu</option>
                            </select>
                        </div>
                        {/* --- Akhir Filter dan Search --- */}

                        {loadingHistory ? (
                            <p className="italic text-slate-600 text-center py-10 text-lg">Memuat riwayat rekam medis...</p>
                        ) : getFilteredAndSortedHistory.length === 0 ? (
                            <p className="italic text-slate-600 text-center py-10 text-lg">
                                {historySearchTerm ? "Tidak ada rekam medis yang cocok dengan pencarian." : "Belum ada data rekam medis untuk pasien ini."}
                            </p>
                        ) : (
                            <div className="overflow-x-auto border border-gray-200 rounded-lg">
                                <table className="min-w-full divide-y divide-gray-200">
                                    {/* Header Tabel - Diperbarui agar konsisten */}
                                    <thead className="bg-slate-100 text-slate-600">
                                        <tr>
                                            <th className="px-6 py-3.5 text-center text-xs font-semibold uppercase tracking-wider">No.</th>
                                            {/* Kolom ID RM dihapus sesuai permintaan */}
                                            <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider">Tipe RM</th>
                                            <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider">Diagnosa</th>
                                            <th className="px-6 py-3.5 text-center text-xs font-semibold uppercase tracking-wider">Foto RM</th>
                                            <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider">Catatan</th>
                                            <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider">Dibuat Oleh</th>
                                            <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider">Waktu Pembuatan</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-100">
                                        {currentItems.map((rm) => {
                                            const actorDisplay = rm.pembuat;
                                            const timestampDisplay = rm.timestamp ? formatTimestamp(rm.timestamp) : '-';
                                            const truncatedNote = truncateText(rm.catatan, 50); // Panggil fungsi truncateText

                                            return (
                                                <tr key={`${rm.id_rm}-${rm.timestamp}`} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-center">{rm.noUrut}</td>
                                                    {/* Data ID RM dihapus sesuai permintaan */}
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
                                                    <td className="px-6 py-4 text-sm text-gray-600 min-w-[250px] overflow-hidden whitespace-normal" // Changed to normal to allow wrapping in modal
                                                        title={rm.catatan}> {/* Catatan lengkap tetap muncul saat hover */}
                                                        {truncatedNote.display} {/* Tampilkan teks yang sudah dipotong */}
                                                        {truncatedNote.truncated && (
                                                            <button
                                                                onClick={() => handleOpenNoteModal(rm.catatan)}
                                                                className="text-blue-600 hover:text-blue-800 text-xs ml-1 font-semibold underline focus:outline-none"
                                                            >
                                                                selengkapnya
                                                            </button>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500" title={rm.pembuat || ''}>
                                                        {actorDisplay}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500 italic">
                                                        {timestampDisplay}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* --- Pagination Controls - Diperbarui agar konsisten --- */}
                        {totalPages > 0 && (
                            <div className="flex justify-center items-center mt-6">
                                <button
                                    onClick={() => paginate(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="px-4 py-2 mx-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium"
                                >
                                    Sebelum
                                </button>
                                {renderPaginationButtons()}
                                <button
                                    onClick={() => paginate(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className="px-4 py-2 mx-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium"
                                >
                                    Sesudah
                                </button>
                            </div>
                        )}
                        {/* --- Akhir Pagination Controls --- */}
                    </div>
                </div>
            )}

            {/* Modal untuk Menambah Rekam Medis Baru */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center p-4 z-[100]">
                    <div className="bg-white rounded-xl p-6 sm:p-8 shadow-2xl w-full max-w-lg relative animate-fadeInUp transform transition-all duration-300">
                        <button
                            className="absolute top-4 right-4 text-2xl text-gray-400 hover:text-red-600 transition-colors focus:outline-none"
                            onClick={() => setShowModal(false)}
                        > &times; </button>
                        <h3 className="text-xl sm:text-2xl font-bold mb-6 text-blue-700 border-b pb-3">
                            Tambah Rekam Medis Baru
                        </h3>
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Diagnosa:</label>
                                <input type="text" name="diagnosa" value={formData.diagnosa}
                                    onChange={(e) => setFormData((f) => ({ ...f, diagnosa: e.target.value }))}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-colors"
                                    required />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tipe Rekam Medis:</label>
                                <select name="tipeRekamMedis" value={formData.tipeRekamMedis}
                                    onChange={(e) => setFormData((f) => ({ ...f, tipeRekamMedis: e.target.value }))}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-colors"
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
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Foto Rekam Medis:</label>
                                <input type="file" accept="image/*,application/pdf"
                                    onChange={(e) => {
                                        setFotoFile(e.target.files[0]);
                                    }}
                                    disabled={submittingForm} // Ini agar input file tidak bisa diubah saat form sedang disubmit
                                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-300 rounded-lg p-2.5 shadow-sm transition-colors" />
                                <div className="text-xs text-gray-500 mt-1.5">
                                    Unggah foto/hasil scan (misal: hasil lab, resep, citra radiografi, surat rujukan, catatan medis tulisan tangan, atau dokumen medis lainnya).
                                </div>
                                {uploading && fotoFile && <div className="text-xs text-blue-600 mt-1.5 animate-pulse">Mengupload file ke IPFS...</div>}
                                {!uploading && formData.foto && !fotoFile && (
                                    <div className="mt-2 text-sm">
                                        File saat ini: <a href={formData.foto} target="_blank" rel="noopener noreferrer"
                                            className="text-blue-600 hover:text-blue-800 underline">
                                            {formData.foto.substring(formData.foto.lastIndexOf('/') + 1).substring(0, 30)}...
                                        </a>
                                    </div>
                                )}
                            </div>
                            <div> {/* Textarea untuk Catatan (input string) */}
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Catatan:</label>
                                <textarea name="catatan" value={formData.catatan}
                                    onChange={(e) => setFormData((f) => ({ ...f, catatan: e.target.value }))}
                                    rows={4}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-colors" />
                            </div>
                            <div className="flex gap-4 pt-3 justify-end">
                                <button type="button" onClick={() => setShowModal(false)}
                                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-2.5 rounded-lg font-semibold transition shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-400">
                                    Batal
                                </button>
                                <button type="submit"
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-semibold transition shadow-sm disabled:opacity-70 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                    disabled={uploading || submittingForm}> {/* Disabled jika sedang upload atau submit form */}
                                    {uploading ? "Mengupload..." : (submittingForm ? "Menambah..." : "Tambah Rekam Medis")}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Baru untuk Menampilkan Catatan Lengkap */}
            {showNoteModal && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center p-4 z-[101]"> {/* z-index lebih tinggi dari modal lainnya */}
                    <div className="bg-white rounded-xl p-6 sm:p-8 shadow-2xl w-full max-w-xl relative animate-fadeInUp transform transition-all duration-300">
                        <button
                            className="absolute top-4 right-4 text-2xl text-gray-400 hover:text-red-600 transition-colors focus:outline-none"
                            onClick={() => setShowNoteModal(false)}
                        > &times; </button>
                        <h3 className="text-xl sm:text-2xl font-bold mb-4 text-blue-700 border-b pb-3">
                            Catatan Lengkap
                        </h3>
                        <div className="text-base text-gray-800 leading-relaxed max-h-96 overflow-y-auto"> {/* Max height dan scroll */}
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