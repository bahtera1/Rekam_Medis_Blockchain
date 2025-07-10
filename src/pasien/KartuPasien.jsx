// src/components/KartuPasien.js
import React from 'react';

// Fungsi helper untuk memformat tanggal
const formatTanggalLahir = (tanggalLahir) => {
    if (!tanggalLahir) return 'N/A';
    const date = new Date(tanggalLahir);
    // Tambahan: Pastikan tanggal valid sebelum format
    if (isNaN(date.getTime())) {
        return tanggalLahir; // Kembalikan string asli jika tidak bisa diparse sebagai tanggal
    }
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('id-ID', options);
};

export default function KartuPasien({ pasienData, hospitalName }) {
    if (!pasienData) {
        return <div className="text-gray-500">Memuat data kartu pasien...</div>;
    }

    return (
        <div
            id="kartuPasienCetak"
            className="p-4 bg-gradient-to-br from-blue-100 to-white rounded-lg shadow-xl border border-blue-200"
            // --- UKURAN KARTU DIPERKECIL DI SINI ---
            style={{ width: '320px', height: '200px', fontFamily: 'Arial, sans-serif', boxSizing: 'border-box', display: 'flex', flexDirection: 'column' }}
        >
            <div className="flex justify-between items-center mb-2"> {/* Padding dan margin disesuaikan */}
                <h2 className="text-lg font-bold text-blue-800">Kartu Pasien</h2> {/* Ukuran font diperkecil */}
                <img src="/logo-rumahsakit.png" alt="Logo RS" className="h-8 w-auto" /> {/* Tinggi logo diperkecil */}
            </div>

            <div className="text-xs text-gray-800 flex-grow mb-2"> {/* Ukuran font dan margin disesuaikan */}
                <div className="flex justify-between items-center mb-0.5"> {/* Margin diperkecil */}
                    <span className="font-semibold text-gray-600">ID Pasien:</span>
                    <span className="text-blue-700 font-medium">{pasienData.ID || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center mb-0.5">
                    <span className="font-semibold text-gray-600">Nama:</span>
                    <span>{pasienData.nama || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center mb-0.5">
                    <span className="font-semibold text-gray-600">NIK:</span>
                    <span>{pasienData.NIK || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center mb-0.5">
                    <span className="font-semibold text-gray-600">Tgl. Lahir:</span>
                    <span>{formatTanggalLahir(pasienData.tanggalLahir)}</span>
                </div>
                <div className="flex justify-between items-center mb-0.5">
                    <span className="font-semibold text-gray-600">Gol. Darah:</span>
                    <span>{pasienData.golonganDarah || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center mb-0.5">
                    <span className="font-semibold text-gray-600">Gender:</span>
                    <span>{pasienData.gender || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center mb-0.5">
                    <span className="font-semibold text-gray-600">Alamat:</span>
                    <span className="w-1/2 text-right truncate">{pasienData.alamat || 'N/A'}</span> {/* truncate jika terlalu panjang */}
                </div>
                <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-600">RS Penanggung Jawab:</span>
                    <span className="font-medium text-blue-600 text-right truncate">{hospitalName || 'Memuat...'}</span> {/* truncate jika terlalu panjang */}
                </div>
            </div>

            <div className="text-xxs text-gray-500 text-center mt-auto pt-1 border-t border-gray-200"> {/* Font dan padding disesuaikan */}
                Kartu ini adalah identitas pasien digital. Tidak dapat digunakan untuk transaksi keuangan.
            </div>
        </div>
    );
}