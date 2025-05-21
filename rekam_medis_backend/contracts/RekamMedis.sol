// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract RekamMedis {
    address public admin;

    struct Dokter {
        string nama;
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
    event RekamMedisDitambahkan(
        uint id,
        address pasien,
        string diagnosa,
        bool valid
    );
    event RekamMedisDiperbarui(uint id, string diagnosa, string catatan);
    event AdminDitetapkan(address newAdmin);
    event DokterTerdaftar(address dokter, string nama);
    event DokterStatusDiubah(address dokter, bool aktif);
    event PasienDiassignKeDokter(address dokter, address pasien);
    event PasienTerdaftar(address pasien);

    constructor() {
        admin = 0xB0dC0Bf642d339517438017Fc185Bb0f758A01D2;
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

    // Register dokter baru dengan nama dan aktifkan langsung
    function registerDokter(
        address _dokter,
        string memory _nama
    ) public hanyaAdmin {
        require(!isDokter[_dokter], "Dokter sudah terdaftar.");
        require(!isPasien[_dokter], "Alamat sudah terdaftar sebagai Pasien.");
        isDokter[_dokter] = true;
        dataDokter[_dokter] = Dokter({
            nama: _nama,
            aktif: true,
            assignedPasien: new address[](0)
        });
        daftarDokter.push(_dokter);
        emit DokterTerdaftar(_dokter, _nama);
    }

    // Ambil total dokter terdaftar
    function totalDokter() public view returns (uint) {
        return daftarDokter.length;
    }

    // Ambil alamat dokter berdasarkan index
    function getDokterByIndex(uint index) public view returns (address) {
        require(index < daftarDokter.length, "Index dokter tidak valid.");
        return daftarDokter[index];
    }

    // Set status dokter aktif/nonaktif
    function setStatusDokter(address _dokter, bool _aktif) public hanyaAdmin {
        require(isDokter[_dokter], "Dokter tidak terdaftar.");
        dataDokter[_dokter].aktif = _aktif;
        emit DokterStatusDiubah(_dokter, _aktif);
    }

    // Assign pasien ke dokter tertentu
    function assignPasienToDokter(
        address _dokter,
        address _pasien
    ) public hanyaAdmin {
        require(isDokter[_dokter], "Dokter tidak terdaftar.");
        require(isPasien[_pasien], "Pasien tidak terdaftar.");

        address[] storage pasienDokter = dataDokter[_dokter].assignedPasien;
        for (uint i = 0; i < pasienDokter.length; i++) {
            if (pasienDokter[i] == _pasien) {
                revert("Pasien sudah ditugaskan ke dokter ini.");
            }
        }
        pasienDokter.push(_pasien);
        emit PasienDiassignKeDokter(_dokter, _pasien);
    }

    // Cek apakah pasien sudah diassign ke dokter
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

    // Ambil daftar pasien yang diassign ke dokter tertentu
    function getAssignedPasienByDokter(
        address _dokter
    ) public view returns (address[] memory) {
        require(isDokter[_dokter], "Dokter tidak terdaftar.");
        return dataDokter[_dokter].assignedPasien;
    }

    // Get data dokter
    function getDokter(
        address _dokter
    )
        public
        view
        returns (string memory nama, bool aktif, address[] memory pasien)
    {
        Dokter storage d = dataDokter[_dokter];
        return (d.nama, d.aktif, d.assignedPasien);
    }

    // Register pasien oleh admin
    function registerPasien(address _pasien) public hanyaAdmin {
        require(!isDokter[_pasien], "Alamat sudah terdaftar sebagai Dokter.");
        require(!isPasien[_pasien], "Pasien sudah terdaftar.");
        isPasien[_pasien] = true;
        daftarPasien.push(_pasien);
        emit PasienTerdaftar(_pasien);
    }

    // Self register pasien
    function selfRegisterPasien() public {
        require(!isPasien[msg.sender], "Anda sudah terdaftar sebagai Pasien.");
        isPasien[msg.sender] = true;
        daftarPasien.push(msg.sender);
        emit PasienTerdaftar(msg.sender);
    }

    // Get role user
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

    // Set admin baru
    function setAdmin(address _newAdmin) public hanyaAdmin {
        admin = _newAdmin;
        emit AdminDitetapkan(_newAdmin);
    }

    // Tambah rekam medis pasien
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
    ) public hanyaPasien(_pasien) {
        rekamMedisCount++;
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
        // Simpan versi lama ke array versi
        rekamMedisVersions[_id].push(rekam);

        // Update data rekam medis
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
