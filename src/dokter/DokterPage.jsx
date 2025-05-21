// DokterPage.jsx
import React, { useState, useEffect } from "react";
import DokterSideBar from "./DokterSideBar";
import UpdateRekamMedis from "./UpdateRekamMedis";
import "./DokterPage.css";
import web3 from "../web3";
import contract from "../contract";

export default function DokterPage() {
    const [account, setAccount] = useState("");
    const [assignedPatients, setAssignedPatients] = useState([]);
    const [view, setView] = useState("update"); // bisa "dashboard" atau "update"

    useEffect(() => {
        async function fetchData() {
            const accounts = await web3.eth.getAccounts();
            setAccount(accounts[0]);

            const dokterData = await contract.methods.getDokter(accounts[0]).call();
            console.log("dokterData:", dokterData);

            // Ambil array pasien dari index 4 atau properti pasien
            const assignedPasien = dokterData[4] || dokterData.pasien || [];
            console.log("assignedPatients (alamat):", assignedPasien);

            setAssignedPatients(assignedPasien);
        }
        fetchData();
    }, []);


    return (
        <div className="dokter-container">
            <DokterSideBar onSelect={setView} />
            <div className="dokter-main">
                {view === "dashboard" && (
                    <div>
                        <h2>Dashboard Dokter</h2>
                        <p>Total Pasien Terdaftar: {assignedPatients.length}</p>
                    </div>
                )}
                {view === "update" && <UpdateRekamMedis account={account} assignedPatients={assignedPatients} />}
            </div>
        </div>
    );
}
