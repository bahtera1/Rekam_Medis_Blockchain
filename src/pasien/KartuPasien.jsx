// src/components/KartuPasien.js
import React from 'react';

// Fungsi helper untuk memformat tanggal
const formatTanggalLahir = (tanggalLahir) => {
    if (!tanggalLahir) return 'N/A';
    const date = new Date(tanggalLahir);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('id-ID', options);
};

export default function KartuPasien({ pasienData, hospitalName }) {
    if (!pasienData) {
        return <div className="text-gray-500">Memuat data kartu pasien...</div>;
    }

    return (
        <div id="kartuPasienCetak" className="p-6 bg-gradient-to-br from-blue-100 to-white rounded-lg shadow-xl border border-blue-200" style={{ width: '380px', height: '240px', fontFamily: 'Arial, sans-serif', boxSizing: 'border-box' }}>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-blue-800">Kartu Pasien</h2>
                <img src="/logo-rumahsakit.png" alt="Logo RS" className="h-10 w-auto" /> {/* Ganti dengan path logo RS Anda */}
            </div>

            <div className="text-sm text-gray-800 mb-3">
                <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold text-gray-600">ID Pasien:</span>
                    <span className="text-blue-700 font-medium">{pasienData.ID || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold text-gray-600">Nama:</span>
                    <span>{pasienData.nama || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold text-gray-600">NIK:</span>
                    <span>{pasienData.NIK || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold text-gray-600">Tgl. Lahir:</span>
                    <span>{formatTanggalLahir(pasienData.tanggalLahir)}</span>
                </div>
                <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold text-gray-600">Gol. Darah:</span>
                    <span>{pasienData.golonganDarah || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-600">RS Penanggung Jawab:</span>
                    <span className="font-medium text-blue-600">{hospitalName || 'Memuat...'}</span>
                </div>
            </div>

            <div className="text-xs text-gray-500 text-center mt-auto pt-2 border-t border-gray-200">
                Kartu ini adalah identitas pasien digital. Tidak dapat digunakan untuk transaksi keuangan.
            </div>
        </div>
    );
}