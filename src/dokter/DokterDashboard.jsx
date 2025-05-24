import React from "react";

export default function DokterDashboard({ assignedPatients, dokterProfile }) {
    return (
        <section className="bg-white rounded-2xl shadow-lg p-8 mb-10 animate-fadeIn">
            <h2 className="text-3xl font-bold text-blue-700 mb-4">Dashboard Dokter</h2>

            {/* Info Profil Dokter */}
            {dokterProfile && (
                <div className="mb-6 border p-6 rounded-xl bg-blue-50 shadow-sm flex flex-col sm:flex-row sm:items-center sm:gap-10">
                    <div className="flex-1">
                        <h3 className="text-xl font-semibold text-blue-800 mb-1">{dokterProfile.nama}</h3>
                        <p className="text-gray-700 mb-0.5">Spesialisasi: <span className="font-medium">{dokterProfile.spesialisasi}</span></p>
                        <p className="text-gray-700 mb-0.5">Nomor Lisensi: <span className="font-medium">{dokterProfile.nomorLisensi}</span></p>
                    </div>
                    <div className="flex items-center gap-2 mt-4 sm:mt-0">
                        <span
                            className={`h-3 w-3 rounded-full inline-block mr-2 ${dokterProfile.aktif ? "bg-green-500" : "bg-red-500"}`}
                            title={dokterProfile.aktif ? "Aktif" : "Tidak Aktif"}
                        ></span>
                        <span className={`text-base font-semibold ${dokterProfile.aktif ? "text-green-700" : "text-red-700"}`}>
                            {dokterProfile.aktif ? "Aktif" : "Tidak Aktif"}
                        </span>
                    </div>
                </div>
            )}

            <p className="text-lg text-gray-700 font-medium">
                Total Pasien Terdaftar:{" "}
                <span className="font-bold text-blue-700">{assignedPatients.length}</span>
            </p>
        </section>
    );
}
