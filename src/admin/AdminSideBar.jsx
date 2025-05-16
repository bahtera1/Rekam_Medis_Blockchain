import React from "react";
import "./AdminSideBar.css";

export default function AdminSideBar({ activePage, setActivePage, onLogout }) {
    const handleLogout = () => {
        const confirmed = window.confirm("Apakah Anda yakin ingin logout?");
        if (confirmed) {
            onLogout();
        }
    };

    return (
        <div className="sidebar">
            <h3>Menu Admin</h3>
            <div className="sidebar-menu">
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

            {/* Logout button fixed di bawah */}
            <button className="logout-button" onClick={handleLogout}>
                Logout
            </button>
        </div>
    );
}
