# Bismillah PDD Sukses

| | |
|---|---|
| **Nama** | Ahmad Balya Malkan |
| **NRP** | 5053251042 |
| **Aplikasi** | [iyoyama.github.io/PWEB-ETS-5053251042](https://iyoyama.github.io/PWEB-ETS-5053251042/) |
 
## Persona
 
**Pekerja lepas (freelancer)**
 
[TULIS 2–3 KALIMAT DENGAN KATA-KATAMU SENDIRI: siapa persona ini dan apa masalah keuangannya.]
 
## Fitur
 
### Fitur wajib
- [x] **W1** Tambah transaksi (tanggal, jenis, kategori, nominal, catatan)
- [x] **W2** Daftar transaksi dirender dari JavaScript, terbaru di atas, nominal berformat Rupiah
- [x] **W3** Hapus transaksi dengan konfirmasi
- [x] **W4** Data tersimpan di localStorage dan tetap ada setelah refresh
- [x] **W5** Ringkasan saldo, pemasukan, dan pengeluaran, diperbarui otomatis
- [x] **W6** Validasi form dengan pesan error di halaman
### Fitur khas persona (freelancer)
- [x] Tagihan klien berstatus "belum dibayar" atau "lunas"
- [x] Tagihan yang ditandai lunas otomatis menjadi pemasukan
- [x] Total piutang ditampilkan di ringkasan
### Fitur bonus
- [x] Filter berdasarkan jenis dan kategori, plus pencarian kata kunci pada catatan
- [x] Ekspor dan impor data JSON (backup)
- [x] Tampilan responsif, rapi di layar 360px
### Belum selesai
- Edit transaksi
- Budget per kategori
## Cara menggunakan
 
### 1. Mencatat pengeluaran
1. Pilih **Jenis: Pengeluaran** (pilihan awal).
2. Isi tanggal, pilih kategori (misalnya Transportasi), isi nominal, dan catatan jika perlu.
3. Klik **Simpan**. Transaksi muncul di daftar dan saldo berkurang.
### 2. Mencatat pemasukan yang sudah dibayar
1. Pilih **Jenis: Pemasukan**. Pilihan kategori berganti menjadi daftar jasa, dan muncul kolom **Status pembayaran**.
2. Pilih status **Lunas**, isi data lainnya, lalu klik **Simpan**.
3. Nominal langsung masuk ke pemasukan dan menambah saldo.
### 3. Mencatat tagihan klien (belum dibayar)
1. Pilih **Jenis: Pemasukan**, lalu status **Belum dibayar**.
2. Klik **Simpan**. Transaksi diberi lencana kuning "Belum dibayar".
3. Nominalnya masuk ke kartu **Piutang klien**, belum masuk pemasukan dan saldo.
4. Saat klien membayar, klik **Tandai lunas** pada transaksi itu. Nominalnya pindah dari piutang ke pemasukan.
### 4. Menghapus transaksi
Klik **Hapus** pada transaksi, lalu konfirmasi pada kotak dialog yang muncul.
 
### 5. Mencari dan menyaring transaksi
Di bagian **Daftar Transaksi**, ketik kata kunci untuk mencari di catatan, atau pilih jenis dan kategori. Ketiganya bisa dipakai bersamaan.
 
### 6. Backup data
- **Ekspor JSON**: mengunduh file `backup-kaslepas.json` berisi semua transaksi.
- **Impor JSON**: memilih file backup untuk memulihkan data. Data saat ini akan diganti setelah kamu mengonfirmasi. File yang formatnya salah ditolak dengan pesan di halaman.
## Cara menjalankan di komputer sendiri
 
Unduh atau clone repo ini, lalu buka `index.html` di browser. Tidak ada yang perlu dipasang.
 
## Struktur file
 
```
├── index.html   # Struktur halaman
├── style.css    # Tampilan (responsif)
├── script.js    # Logika aplikasi
├── README.md
├── AI-LOG.md    # Catatan penggunaan AI
└── PROSES.md    # Proses kerja, rancangan data, keputusan desain, bug
```
 
## Struktur data
 
Semua transaksi disimpan sebagai **array objek** di `localStorage` dengan key `transaksi-kaslepas`, dalam bentuk teks JSON.
 
```js
{
  id: 1739251200000,          // unik, dari Date.now()
  tanggal: "2026-10-12",
  jenis: "pemasukan",         // "pemasukan" atau "pengeluaran"
  kategori: "Jasa Fotografi",
  nominal: 500000,            // angka, bukan teks "Rp 500.000"
  catatan: "Pemotretan produk",
  status: "belum dibayar"     // hanya untuk pemasukan: "belum dibayar" atau "lunas"
}
```
 
Tagihan klien tidak disimpan terpisah. Tagihan adalah transaksi pemasukan yang `status`-nya `"belum dibayar"`, sehingga fitur khas memakai data yang sama dengan transaksi biasa.
 
## Penjelasan kode
 
### Alur utama
 
```
aksi user  →  ubah array `transaksi`  →  simpanData()  →  render()
```
 
Array `transaksi` di `script.js` adalah satu-satunya sumber data. Tampilan tidak pernah diubah langsung. Setiap perubahan data selalu diakhiri `render()` yang menggambar ulang ringkasan dan daftar dari array itu.
 
### Saat halaman dibuka
 
`muatData()` membaca localStorage (`JSON.parse`) → `isiFilterKategori()` → `ubahJenis()` mengisi dropdown form → `render()` menampilkan data.
 
### Saat tombol Simpan diklik
 
`tambahTransaksi()` membuat objek dari isi form → `validasi()` memeriksa isiannya → jika ada error, `tampilkanError()` menampilkannya dan proses berhenti → jika lolos, `transaksi.push()` → `simpanData()` → `resetForm()` → `render()`.
 
### Fungsi per bagian di `script.js`
 
| Bagian | Fungsi | Tugas |
|---|---|---|
| Penyimpanan | `simpanData()` | Mengubah array menjadi teks dengan `JSON.stringify`, lalu menyimpannya |
| | `muatData()` | Membaca teks dan mengubahnya kembali dengan `JSON.parse`; jika data rusak, mulai dari kosong |
| Helper | `formatRupiah()` | Mengubah angka menjadi tampilan `Rp 1.000.000` |
| | `hariIni()` | Tanggal hari ini dengan format `YYYY-MM-DD` (waktu lokal) |
| | `escapeHtml()` | Mencegah catatan dari user dibaca browser sebagai kode HTML |
| Ringkasan | `jumlahkan()` | Menjumlahkan nominal dengan `reduce` |
| | `hitungRingkasan()` | Memakai `filter` untuk memisahkan pemasukan lunas, pengeluaran, dan piutang |
| | `renderRingkasan()` | Menulis hasil perhitungan ke empat kartu |
| Daftar | `ambilTransaksiTampil()` | Menerapkan filter dan pencarian, lalu mengurutkan dari terbaru |
| | `renderDaftar()` | Membuat elemen `<li>` untuk tiap transaksi dan memasangnya ke halaman |
| | `render()` | Memanggil `renderRingkasan()` dan `renderDaftar()` |
| Validasi | `validasi()` | Memeriksa tanggal, kategori, dan nominal lebih dari 0 |
| | `tampilkanError()` | Menampilkan daftar pesan error di bawah form |
| Aksi | `tambahTransaksi()` | Menangani submit form |
| | `resetForm()` | Mengosongkan form setelah disimpan |
| | `ubahJenis()` | Dipanggil saat jenis berganti: mengatur kolom status dan isi dropdown kategori |
| | `aturBarisStatus()` | Menampilkan kolom status hanya untuk pemasukan |
| | `isiKategoriForm()` | Mengisi dropdown kategori sesuai jenis |
| | `hapusTransaksi()` | Konfirmasi, lalu menghapus dengan `filter` |
| | `tandaiLunas()` | Mencari transaksi dengan `find`, lalu mengubah statusnya menjadi lunas |
| | `klikDaftar()` | Satu listener untuk semua tombol Hapus dan Tandai lunas |
| Backup | `ekspor()` | Membuat file JSON untuk diunduh |
| | `dataValid()` | Memeriksa bentuk tiap data yang diimpor |
| | `impor()` | Membaca file, memvalidasi, lalu mengganti data |
| Awal | `isiFilterKategori()` | Mengisi dropdown filter dengan semua kategori |
 
### Konsep yang dipakai
 
| Konsep | Contoh di kode |
|---|---|
| Event listener | `form.addEventListener("submit", tambahTransaksi)` |
| Event delegation | `klikDaftar()` membaca `data-aksi` dan `data-id` dari tombol yang diklik |
| Manipulasi DOM | `createElement`, `appendChild`, `textContent`, `innerHTML` di `renderDaftar()` |
| Method array | `push` (tambah), `filter` (hapus dan saring), `find` (cari), `sort` (urutkan), `forEach` (render), `reduce` (jumlahkan) |
| localStorage | `setItem` dengan `JSON.stringify`, `getItem` dengan `JSON.parse` |
| Validasi input | `validasi()` mengembalikan daftar pesan, dan penyimpanan dibatalkan jika tidak kosong |
| Tipe data | Nominal diubah dengan `Number()` karena nilai input selalu berupa teks |
 
### Aturan hitung ringkasan
 
- **Pemasukan** = pemasukan dengan status selain "belum dibayar"
- **Pengeluaran** = semua transaksi berjenis pengeluaran
- **Saldo** = pemasukan − pengeluaran
- **Piutang** = jumlah tagihan berstatus "belum dibayar"
## Kategori
 
- **Pemasukan** (15 jasa): fotografi, videografi, editing video (3 kategori), editing warna foto, editing foto profesional (3 kategori), desain grafis (3 kategori), motion maker (3 kategori)
- **Pengeluaran** (6): Peralatan & Perawatan, Software & Langganan, Transportasi, Internet & Pulsa, Makan, Lainnya
Untuk menambah kategori, edit objek `KATEGORI` di bagian atas `script.js`.
 
