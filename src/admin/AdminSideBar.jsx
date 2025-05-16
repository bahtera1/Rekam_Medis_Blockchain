import React from "react";
import "./AdminSideBar.css";

export default function AdminSideBar({ activePage, setActivePage }) {
    return (
        <div className="sidebar">
            <h3>Menu Admin</h3>
            <button
                className={activePage === "manageDokter" ? "active" : ""}
                onClick={() => setActivePage("manageDokter")}
            >
                Manajemen Dokter
            </button>
            <button
                className={activePage === "managePasien" ? "active" : ""}
                onClick={() => setActivePage("managePasien")}
            >
                Manajemen Pasien
            </button>
            <button
                className={activePage === "manageAssign" ? "active" : ""}
                onClick={() => setActivePage("manageAssign")}
            >
                Assign Pasien ke Dokter
            </button>
        </div>
    );
}
