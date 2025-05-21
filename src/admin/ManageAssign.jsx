import React from "react";

export default function ManageAssign({
    dokterList,
    listPasien,
    selectedDokter,
    setSelectedDokter,
    pasienAddress,
    setPasienAddress,
    assignPasien,
    loading,
    assignedPairs,
}) {
    return (
        <div>
            <h3>Assign Pasien ke Dokter</h3>

            <select
                value={selectedDokter}
                onChange={(e) => setSelectedDokter(e.target.value)}
                disabled={loading}
            >
                <option value="">Pilih Dokter</option>
                {dokterList.map((dokter) => (
                    <option key={dokter.address} value={dokter.address}>
                        {dokter.nama} ({dokter.address})
                    </option>
                ))}
            </select>

            <select
                value={pasienAddress}
                onChange={(e) => setPasienAddress(e.target.value)}
                disabled={loading}
            >
                <option value="">Pilih Pasien</option>
                {listPasien.map((pasien) => (
                    <option key={pasien.address} value={pasien.address}>
                        {pasien.nama || pasien.address}
                    </option>
                ))}
            </select>

            <button onClick={assignPasien} disabled={loading} style={{ marginLeft: "10px" }}>
                {loading ? "Loading..." : "Assign Pasien"}
            </button>

            <div className="list-section" style={{ marginTop: "30px" }}>
                <h3>Daftar Pasangan Dokter - Pasien</h3>
                {assignedPairs.length === 0 ? (
                    <p>Belum ada pasangan dokter dan pasien yang diassign.</p>
                ) : (
                    <table>
                        <thead>
                            <tr>
                                <th>Nama Dokter</th>
                                <th>Alamat Dokter</th>
                                <th>Alamat Pasien</th>
                            </tr>
                        </thead>
                        <tbody>
                            {assignedPairs.map((pair, idx) => (
                                <tr key={idx}>
                                    <td>{pair.dokterNama}</td>
                                    <td>{pair.dokterAddress}</td>
                                    <td>{pair.pasienAddress}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
