import React from "react";

// Placeholder untuk ikon (Anda bisa menggantinya dengan SVG atau library ikon)
const IconStethoscope = () => (
    <svg className="w-5 h-5 text-blue-600 mr-2 inline-block" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
        <path d="M9 10h.01M15 10h.01M12 2a8 8 0 00-8 8v2a2 2 0 002 2h2.32a2 2 0 011.68.92L12 18.3l1.99-3.38a2 2 0 011.68-.92H18a2 2 0 002-2v-2a8 8 0 00-8-8zM9 10a.01.01 0 010-.02.01.01 0 010 .02zm6 0a.01.01 0 010-.02.01.01 0 010 .02z"></path>
    </svg>
);

const IconLicense = () => (
    <svg className="w-5 h-5 text-blue-600 mr-2 inline-block" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
        <path d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 012-2h2a2 2 0 012 2v1m-4 0h4m-9 4h1.01M12 10h1.01M15 10h1.01M9 14h1.01M12 14h1.01M15 14h1.01M9 18h1.01M12 18h1.01M15 18h1.01"></path>
    </svg>
);


export default function DokterDashboard({ assignedPatients, dokterProfile }) {
    return (
        <section className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 mb-10 animate-fadeIn">
            <h2 className="text-3xl font-bold text-blue-700 mb-8 border-b pb-4">
                Beranda Dokter
            </h2>

            {dokterProfile && (
                <div className="mb-8 p-6 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 shadow-md border border-blue-100">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex-1 mb-4 sm:mb-0">
                            <h3 className="text-2xl font-semibold text-blue-800 mb-2">
                                {dokterProfile.nama}
                            </h3>
                            <div className="space-y-1.5 text-gray-700">
                                <p className="flex items-center">
                                    <IconStethoscope />
                                    Spesialisasi: <span className="font-semibold ml-1">{dokterProfile.spesialisasi}</span>
                                </p>
                                <p className="flex items-center">
                                    <IconLicense />
                                    Nomor Lisensi: <span className="font-semibold ml-1">{dokterProfile.nomorLisensi}</span>
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-white shadow-sm border self-start sm:self-center">
                            <span
                                className={`h-3.5 w-3.5 rounded-full inline-block ${dokterProfile.aktif ? "bg-green-500 animate-pulse" : "bg-red-500"}`}
                                title={dokterProfile.aktif ? "Aktif" : "Tidak Aktif"}
                            ></span>
                            <span className={`text-md font-semibold ${dokterProfile.aktif ? "text-green-700" : "text-red-700"}`}>
                                {dokterProfile.aktif ? "Aktif" : "Tidak Aktif"}
                            </span>
                        </div>
                    </div>
                </div>
            )}

            <div className="mt-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Ringkasan Pasien</h3>
                <div className="bg-gray-50 p-6 rounded-xl shadow border border-gray-200 text-center sm:text-left">
                    <p className="text-gray-600 text-lg">
                        Total Pasien yang Anda Tangani:
                    </p>
                    {/* Ukuran angka pasien diperkecil dari text-5xl menjadi text-4xl */}
                    <p className="text-2xl font-extrabold text-blue-600 mt-1">
                        {assignedPatients.length}
                    </p>
                    {/* Keterangan ditambahkan di bawah angka */}
                    <p className="text-sm text-gray-500 mt-2">
                        Ini adalah jumlah pasien aktif yang anda tangani.
                    </p>
                </div>
            </div>
        </section>
    );
}