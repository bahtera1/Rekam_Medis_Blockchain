import React, { useState, useEffect } from "react";
import DokterSideBar from "./DokterSideBar";
import DokterDashboard from "./DokterDashboard";
import DataPasien from "./DataPasien";
import contract from "../contract";

export default function DokterPage({ account, onLogout }) {
    const [assignedPatients, setAssignedPatients] = useState([]);
    const [dokterProfile, setDokterProfile] = useState(null);
    const [view, setView] = useState("dashboard");

    useEffect(() => {
        async function fetchData() {
            if (!account) return;
            const dokterData = await contract.methods.getDokter(account).call();
            const assignedPasien = dokterData[4] || [];
            setAssignedPatients(assignedPasien);
            setDokterProfile({
                nama: dokterData[0],
                spesialisasi: dokterData[1],
                nomorLisensi: dokterData[2],
                aktif: dokterData[3], // true/false
            });
        }
        fetchData();
    }, [account]);

    const handleSelect = (tab) => {
        if (tab === "logout") {
            if (window.confirm("Apakah Anda yakin ingin logout?")) {
                onLogout();
            }
        } else if (tab === "update") {
            // Cek jika dokter tidak aktif
            if (!dokterProfile?.aktif) {
                alert("Anda bukan dokter aktif / sedang dinonaktifkan.");
                return;
            }
            setView(tab);
        } else {
            setView(tab);
        }
    };

    return (
        <div className="min-h-screen flex flex-row bg-slate-100">
            <DokterSideBar onSelect={handleSelect} activeTab={view} isActive={dokterProfile?.aktif} />
            <main className="flex-1 px-8 py-10 sm:px-4 transition-all duration-300">
                {view === "dashboard" && (
                    <DokterDashboard
                        assignedPatients={assignedPatients}
                        dokterProfile={dokterProfile}
                    />
                )}
                {view === "update" && (
                    <section className="bg-white rounded-2xl shadow-lg p-8 animate-fadeIn">
                        <DataPasien account={account} assignedPatients={assignedPatients} />
                    </section>
                )}
            </main>
        </div>
    );
}
