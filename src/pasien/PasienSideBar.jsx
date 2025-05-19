// src/pasien/PasienSideBar.jsx
import React from "react";

export default function PasienSideBar({ activeTab, setActiveTab }) {
    return (
        <aside className="pasien-sidebar">
            <h3>Menu Pasien</h3>
            <button
                className={activeTab === "dataDiri" ? "active" : ""}
                onClick={() => setActiveTab("dataDiri")}
            >
                Data Diri
            </button>
            <button
                className={activeTab === "riwayat" ? "active" : ""}
                onClick={() => setActiveTab("riwayat")}
            >
                Riwayat
            </button>
        </aside>
    );
}
