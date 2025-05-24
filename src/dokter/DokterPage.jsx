import React, { useState, useEffect } from "react";
import DokterSideBar from "./DokterSideBar";
import UpdateRekamMedis from "./UpdateRekamMedis";
import web3 from "../web3";
import contract from "../contract";

export default function DokterPage({ account, onLogout }) {
    const [assignedPatients, setAssignedPatients] = useState([]);
    const [view, setView] = useState("dashboard"); // Default dashboard

    useEffect(() => {
        async function fetchData() {
            // Tidak perlu ambil akun jika sudah dari parent
            if (!account) return;
            const dokterData = await contract.methods.getDokter(account).call();
            const assignedPasien = dokterData[4] || [];
            setAssignedPatients(assignedPasien);
        }
        fetchData();
    }, [account]);

    // Handler menu dan logout
    const handleSelect = (tab) => {
        if (tab === "logout") {
            if (window.confirm("Apakah Anda yakin ingin logout?")) {
                onLogout(); // Pakai handler dari parent, langsung logout dan redirect ke login
            }
        } else {
            setView(tab);
        }
    };

    return (
        <div className="min-h-screen flex flex-row bg-slate-100">
            <DokterSideBar onSelect={handleSelect} activeTab={view} />
            <main className="flex-1 px-8 py-10 sm:px-4 transition-all duration-300">
                {view === "dashboard" && (
                    <section className="bg-white rounded-2xl shadow-lg p-8 mb-10 animate-fadeIn">
                        <h2 className="text-3xl font-bold text-blue-700 mb-4">Dashboard Dokter</h2>
                        <p className="text-lg text-gray-700 font-medium">
                            Total Pasien Terdaftar:{" "}
                            <span className="font-bold text-blue-700">{assignedPatients.length}</span>
                        </p>
                    </section>
                )}
                {view === "update" && (
                    <section className="bg-white rounded-2xl shadow-lg p-8 animate-fadeIn">
                        <UpdateRekamMedis account={account} assignedPatients={assignedPatients} />
                    </section>
                )}
            </main>
        </div>
    );
}
