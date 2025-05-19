/* src/dokter/DokterSideBar.jsx */
import React from 'react';
import './DokterSideBar.css';

export default function DokterSideBar({ onSelect, activeTab }) {
    return (
        <aside className="dokter-sidebar">
            <h3>Menu Dokter</h3>
            <div className="dokter-sidebar-menu">
                <button
                    className={activeTab === 'dashboard' ? 'active' : ''}
                    onClick={() => onSelect('dashboard')}
                >
                    Dashboard
                </button>
                <button
                    className={activeTab === 'update' ? 'active' : ''}
                    onClick={() => onSelect('update')}
                >
                    Update Rekam Medis
                </button>
            </div>
            <button className="logout-button" onClick={() => onSelect('logout')}>Logout</button>
        </aside>
    )
}