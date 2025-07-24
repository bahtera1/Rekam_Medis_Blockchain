# Implementasi Sistem Rekam Medis Elektronik Menggunakan Teknologi Blockchain

**Disusun oleh:**
* **Naufal Assani Saputra** (NIM: 20210140058)

**Dosen Pembimbing:**
* **Ir. Eko Prasetyo, M.Eng., Ph.D.** (NIDN: 0522046701)  
* **Prayitno, S.ST., M.T., Ph.D.** (NIDN: 0010048506)

## Deskripsi Proyek

Proyek ini merupakan **Aplikasi Terdesentralisasi (DApp)** yang mengimplementasikan Sistem Rekam Medis Elektronik (SRE) dengan memanfaatkan teknologi Blockchain.  
Sistem ini dirancang untuk meningkatkan keamanan, integritas, dan transparansi data rekam medis, serta mengatasi kelemahan pada sistem RME konvensional.

Aplikasi ini sepenuhnya berjalan di sisi klien (*frontend*) dan berinteraksi langsung dengan *smart contract* yang di-*deploy* di jaringan *blockchain* Ethereum.  
Data medis sensitif disimpan secara *off-chain* di InterPlanetary File System (IPFS), sementara *Content Identifier* (CID) dari file tersebut dicatat di *blockchain* untuk memastikan integritas dan ketersediaan data.

## Fitur Utama

* Manajemen Data Pasien dan Dokter  
* Penyimpanan dan Pengambilan Data Rekam Medis yang Terdesentralisasi  
* Otentikasi dan Otorisasi Pengguna melalui dompet digital (wallet) seperti MetaMask  
* Integrasi Langsung dengan Jaringan Blockchain untuk Imutabilitas Data  
* **Fitur Audit Trail Visual:** Menampilkan seluruh riwayat rekam medis pasien dalam format tabel yang kronologis dan terstruktur  
* Kontrol Akses data rekam medis yang berdaulat di tangan pasien  

## Teknologi yang Digunakan

* **Bahasa Pemrograman:** JavaScript, HTML, CSS, Solidity  
* **Frontend Framework/Library:** ReactJS, Tailwind CSS, Web3.js  
* **Blockchain Tools:** Truffle, Ganache, MetaMask, IPFS, Pinata, Ngrok  
* **Lingkungan Pengembangan:** Node.js, npm, Visual Studio Code

## Struktur Proyek


## Persyaratan Sistem

Pastikan perangkat lunak berikut sudah terinstal di komputer Anda:

1. Node.js (versi LTS terbaru direkomendasikan)  
2. npm (disertakan bersama Node.js)  
3. Truffle (`npm install -g truffle`)  
4. Ganache (desktop app atau `ganache-cli`)  
5. Git  
6. Ekstensi browser MetaMask  

---

## Panduan Instalasi dan Menjalankan Proyek

### Langkah 1 – Kloning Repositori

Unduh proyek dengan menjalankan perintah berikut di terminal:

```bash
git clone https://github.com/bahtera1/REKAM_MEDIS_BLOCKCHAIN.git
cd REKAM_MEDIS_BLOCKCHAIN
```
### Langkah 2 – Menjalankan Ganache
Buka aplikasi Ganache Desktop atau jalankan ganache-cli di terminal untuk membuat jaringan blockchain lokal.

### Langkah 3 – Instalasi Dependensi
Instal semua dependensi dengan:
```bash
  npm install
  npm install react-router-dom
  npm install react-scripts@latest webpack@latest --save-dev
```

### Langkah 4 – Deploy Smart Contract
Pastikan Ganache berjalan, lalu jalankan:
File dan Intalasi Ganache ada di : https://github.com/bahtera1/rekam_medis_backend.git

###Langkah 5 – Konfigurasi File .env
Buat file .env di root direktori dan isi seperti berikut:
```bash
# Alamat smart contract yang telah di-deploy ke jaringan blockchain
REACT_APP_CONTRACT_ADDRESS=0x...  # Ganti dengan alamat kontrak yang sebenarnya

# URL base aplikasi React (sesuaikan jika diakses dari perangkat lain)
REACT_APP_BASE_URL=http://localhost:3000  # Bisa juga http://<IP-Lokal>:3000

# Chain ID jaringan blockchain (0x539 = 1337 untuk Ganache)
REACT_APP_EXPECTED_CHAIN_ID=0x539  # Sesuaikan dengan jaringan Ganache atau testnet yang kamu pakai

# Nama jaringan blockchain untuk ditampilkan di MetaMask
REACT_APP_NETWORK_NAME="Local Ganache DApp"

# RPC URL dari jaringan blockchain (localhost untuk Ganache atau gunakan ngrok untuk remote access)
REACT_APP_RPC_URL=http://127.0.0.1:7545  # Ganti dengan URL Ngrok jika ingin diakses dari jaringan lain(Misal Lewat Handphone)

# Informasi mata uang native dari jaringan (biasanya Ethereum untuk Ganache/Testnet)
REACT_APP_NATIVE_CURRENCY_NAME="Ethereum"
REACT_APP_NATIVE_CURRENCY_SYMBOL="ETH"
REACT_APP_NATIVE_CURRENCY_DECIMALS=18

# Kunci API dari layanan Pinata (digunakan untuk menyimpan file ke IPFS)
REACT_APP_PINATA_API_KEY=YOUR_PINATA_API_KEY  # Dapatkan dari akun Pinata
REACT_APP_PINATA_SECRET_API_KEY=YOUR_PINATA_SECRET_API_KEY  # Simpan dengan aman, jangan di-push ke GitHub

```
Langkah 6 – Menjalankan Aplikasi
Jalankan aplikasi dalam mode pengembangan:
```bash
  npm run dev
```
Buka browser dan akses http://localhost:3000.
Pastikan MetaMask terhubung ke jaringan Ganache yang sesuai.
