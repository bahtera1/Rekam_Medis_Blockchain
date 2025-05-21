// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract RekamMedis {
    address public admin;

    struct Dokter {
        string nama;
        string spesialisasi;
        string nomorLisensi;
        bool aktif;
        address[] assignedPasien;
    }

    mapping(address => Dokter) public dataDokter;
    mapping(address => bool) public isDokter;
    mapping(address => bool) public isPasien;

    address[] public daftarDokter; // daftar semua alamat dokter
    address[] public daftarPasien; // daftar semua alamat pasien

    struct RekamMedisData {
        uint id;
        address pasien;
        string nama;
        uint umur;
        string golonganDarah;
        string tanggalLahir;
        string gender;
        string alamat;
        string noTelepon;
        string email;
        string diagnosa;
        string foto;
        string catatan;
        bool valid;
    }

    mapping(uint => RekamMedisData) public rekamMedis;
    mapping(address => uint[]) public rekamMedisByPasien;

    uint public rekamMedisCount;

    // Versi history rekam medis
    mapping(uint => RekamMedisData[]) public rekamMedisVersions;

    // Events
    event RekamMedisDitambahkan(
        uint id,
        address pasien,
        string diagnosa,
        bool valid
    );
    event RekamMedisDiperbarui(uint id, string diagnosa, string catatan);
    event AdminDitetapkan(address newAdmin);
    event DokterTerdaftar(
        address dokter,
        string nama,
        string spesialisasi,
        string nomorLisensi
    );
    event DokterStatusDiubah(address dokter, bool aktif);
    event PasienDiassignKeDokter(address dokter, address pasien);
    event PasienTerdaftar(address pasien);

    constructor() {
        admin = msg.sender; // Set pembuat kontrak sebagai admin awal
    }

    modifier hanyaAdmin() {
        require(
            msg.sender == admin,
            "Hanya admin yang bisa melakukan aksi ini."
        );
        _;
    }

    modifier hanyaDokterAktif() {
        require(
            isDokter[msg.sender] && dataDokter[msg.sender].aktif,
            "Hanya dokter aktif yang bisa memperbarui rekam medis."
        );
        _;
    }

    modifier hanyaDokterAktifUntukPasien(address _pasien) {
        require(
            isDokter[msg.sender] && dataDokter[msg.sender].aktif,
            "Hanya dokter aktif yang bisa memperbarui rekam medis."
        );
        require(
            isPasienAssignedToDokter(msg.sender, _pasien),
            "Dokter tidak di-assign untuk pasien ini."
        );
        _;
    }

    modifier hanyaPasien(address pasien) {
        require(
            msg.sender == pasien,
            "Hanya pasien yang bisa membuat rekam medis mereka."
        );
        _;
    }

    // Register dokter baru dengan tambahan spesialisasi dan nomor lisensi
    function registerDokter(
        address _dokter,
        string memory _nama,
        string memory _spesialisasi,
        string memory _nomorLisensi
    ) public hanyaAdmin {
        require(!isDokter[_dokter], "Dokter sudah terdaftar.");
        require(!isPasien[_dokter], "Alamat sudah terdaftar sebagai Pasien.");
        isDokter[_dokter] = true;
        dataDokter[_dokter] = Dokter({
            nama: _nama,
            spesialisasi: _spesialisasi,
            nomorLisensi: _nomorLisensi,
            aktif: true,
            assignedPasien: new address[](0)
        });
        daftarDokter.push(_dokter);
        emit DokterTerdaftar(_dokter, _nama, _spesialisasi, _nomorLisensi);
    }

    function totalDokter() public view returns (uint) {
        return daftarDokter.length;
    }

    function getDokterByIndex(uint index) public view returns (address) {
        require(index < daftarDokter.length, "Index dokter tidak valid.");
        return daftarDokter[index];
    }

    // Set status dokter aktif/nonaktif (tidak perlu ubah spesialisasi dan lisensi di sini)
    function setStatusDokter(address _dokter, bool _aktif) public hanyaAdmin {
        require(isDokter[_dokter], "Dokter tidak terdaftar.");
        dataDokter[_dokter].aktif = _aktif;
        emit DokterStatusDiubah(_dokter, _aktif);
    }

    // Update data dokter (misal untuk update nama, spesialisasi, atau nomor lisensi)
    function updateDataDokter(
        address _dokter,
        string memory _nama,
        string memory _spesialisasi,
        string memory _nomorLisensi
    ) public hanyaAdmin {
        require(isDokter[_dokter], "Dokter tidak terdaftar.");
        dataDokter[_dokter].nama = _nama;
        dataDokter[_dokter].spesialisasi = _spesialisasi;
        dataDokter[_dokter].nomorLisensi = _nomorLisensi;
        // Emit event jika perlu dibuat event update dokter (tidak wajib)
    }

    function assignPasienToDokter(
        address _dokter,
        address _pasien
    ) public hanyaAdmin {
        require(isDokter[_dokter], "Dokter tidak terdaftar.");
        require(isPasien[_pasien], "Pasien tidak terdaftar.");
        address[] storage pasienDokter = dataDokter[_dokter].assignedPasien;
        for (uint i = 0; i < pasienDokter.length; i++) {
            require(
                pasienDokter[i] != _pasien,
                "Pasien sudah ditugaskan ke dokter ini."
            );
        }
        pasienDokter.push(_pasien);
        emit PasienDiassignKeDokter(_dokter, _pasien);
    }

    function isPasienAssignedToDokter(
        address _dokter,
        address _pasien
    ) public view returns (bool) {
        address[] storage pasienList = dataDokter[_dokter].assignedPasien;
        for (uint i = 0; i < pasienList.length; i++) {
            if (pasienList[i] == _pasien) {
                return true;
            }
        }
        return false;
    }

    function getAssignedPasienByDokter(
        address _dokter
    ) public view returns (address[] memory) {
        require(isDokter[_dokter], "Dokter tidak terdaftar.");
        return dataDokter[_dokter].assignedPasien;
    }

    // Get data dokter lengkap termasuk spesialisasi dan nomor lisensi
    function getDokter(
        address _dokter
    )
        public
        view
        returns (
            string memory nama,
            string memory spesialisasi,
            string memory nomorLisensi,
            bool aktif,
            address[] memory pasien
        )
    {
        Dokter storage d = dataDokter[_dokter];
        return (
            d.nama,
            d.spesialisasi,
            d.nomorLisensi,
            d.aktif,
            d.assignedPasien
        );
    }

    // Daftarkan pasien oleh admin tanpa menyimpan nama secara terpisah,
    // nama pasien diambil dari data rekam medis pertama
    function registerPasien(address _pasien) public hanyaAdmin {
        require(!isDokter[_pasien], "Alamat sudah terdaftar sebagai Dokter.");
        require(!isPasien[_pasien], "Pasien sudah terdaftar.");
        isPasien[_pasien] = true;
        daftarPasien.push(_pasien);
        emit PasienTerdaftar(_pasien);
    }

    // Self register pasien tanpa nama (bisa dikembangkan)
    function selfRegisterPasien() public {
        require(!isPasien[msg.sender], "Anda sudah terdaftar sebagai Pasien.");
        isPasien[msg.sender] = true;
        daftarPasien.push(msg.sender);
        emit PasienTerdaftar(msg.sender);
    }

    // Ambil role user
    function getUserRole(address _user) public view returns (string memory) {
        if (_user == admin) return "Admin";
        if (isDokter[_user]) return "Dokter";
        if (isPasien[_user]) return "Pasien";
        return "Unknown";
    }

    // Ambil daftar rekam medis milik pasien
    function getRekamMedisIdsByPasien(
        address pasien
    ) public view returns (uint[] memory) {
        return rekamMedisByPasien[pasien];
    }

    // Ambil daftar semua pasien
    function getDaftarPasien() public view returns (address[] memory) {
        return daftarPasien;
    }

    // Ambil nama pasien dari rekam medis pertama (jika ada)
    function getNamaPasien(
        address _pasien
    ) public view returns (string memory) {
        uint[] memory ids = rekamMedisByPasien[_pasien];
        if (ids.length == 0) {
            return "";
        }
        return rekamMedis[ids[0]].nama;
    }

    // Set admin baru
    function setAdmin(address _newAdmin) public hanyaAdmin {
        admin = _newAdmin;
        emit AdminDitetapkan(_newAdmin);
    }

    // Tambah rekam medis pasien (self data input)
    function tambahRekamMedis(
        address _pasien,
        string memory _nama,
        uint _umur,
        string memory _golonganDarah,
        string memory _tanggalLahir,
        string memory _gender,
        string memory _alamat,
        string memory _noTelepon,
        string memory _email,
        string memory _diagnosa,
        string memory _foto,
        string memory _catatan
    ) public {
        require(
            msg.sender == _pasien || msg.sender == admin,
            "Hanya pasien atau admin yang bisa menambah rekam medis."
        );

        rekamMedisCount++;

        if (msg.sender == admin) {
            // Jika admin, simpan hanya nama, sisanya kosong atau default
            rekamMedis[rekamMedisCount] = RekamMedisData(
                rekamMedisCount,
                _pasien,
                _nama,
                0, // umur default
                "", // golonganDarah kosong
                "", // tanggalLahir kosong
                "", // gender kosong
                "", // alamat kosong
                "", // noTelepon kosong
                "", // email kosong
                "", // diagnosa kosong
                "", // foto kosong
                "", // catatan kosong
                true
            );
        } else {
            // Jika pasien, simpan semua data sesuai input
            rekamMedis[rekamMedisCount] = RekamMedisData(
                rekamMedisCount,
                _pasien,
                _nama,
                _umur,
                _golonganDarah,
                _tanggalLahir,
                _gender,
                _alamat,
                _noTelepon,
                _email,
                _diagnosa,
                _foto,
                _catatan,
                true
            );
        }

        rekamMedisByPasien[_pasien].push(rekamMedisCount);
        emit RekamMedisDitambahkan(rekamMedisCount, _pasien, _diagnosa, true);
    }

    // Update rekam medis dokter aktif
    function updateRekamMedis(
        uint _id,
        string memory _nama,
        uint _umur,
        string memory _golonganDarah,
        string memory _tanggalLahir,
        string memory _gender,
        string memory _alamat,
        string memory _noTelepon,
        string memory _email,
        string memory _diagnosa,
        string memory _foto,
        string memory _catatan
    ) public hanyaDokterAktifUntukPasien(rekamMedis[_id].pasien) {
        RekamMedisData storage rekam = rekamMedis[_id];
        rekamMedisVersions[_id].push(rekam);
        rekam.nama = _nama;
        rekam.umur = _umur;
        rekam.golonganDarah = _golonganDarah;
        rekam.tanggalLahir = _tanggalLahir;
        rekam.gender = _gender;
        rekam.alamat = _alamat;
        rekam.noTelepon = _noTelepon;
        rekam.email = _email;
        rekam.diagnosa = _diagnosa;
        rekam.foto = _foto;
        rekam.catatan = _catatan;
        emit RekamMedisDiperbarui(_id, _diagnosa, _catatan);
    }

    // Fungsi untuk ambil versi rekam medis
    function getRekamMedisVersions(
        uint _id
    ) public view returns (RekamMedisData[] memory) {
        return rekamMedisVersions[_id];
    }

    // Nonaktifkan rekam medis (admin)
    function nonaktifkanRekamMedis(uint _id) public hanyaAdmin {
        rekamMedis[_id].valid = false;
    }
}
