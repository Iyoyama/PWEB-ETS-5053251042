# KasLepas

Aplikasi web sederhana untuk mencatat keuangan pekerja lepas (freelancer): tagihan klien, pemasukan, pengeluaran, dan budget bulanan, semuanya dalam satu halaman. Tanpa framework, tanpa server, tanpa proses build.

## Fitur

- **Ringkasan**: saldo, total pemasukan, total pengeluaran, dan piutang klien. Saldo juga menampilkan proyeksi jika semua klien membayar.
- **Tagihan klien**: buat tagihan saat proyek dikirim, pantau status (belum dibayar, lunas, terlambat), dan lihat piutang per klien. Tagihan yang ditandai lunas otomatis masuk ke pemasukan.
- **Transaksi**: catat pemasukan tunai dan pengeluaran, lengkap dengan edit, hapus, dan filter (kata kunci, jenis, kategori, rentang tanggal).
- **Budget**: pasang batas pengeluaran bulanan per kategori. Ada peringatan saat pemakaian mencapai 80% dan saat melewati batas.
- **Backup**: ekspor semua data ke file JSON dan impor kembali saat ganti perangkat.

## Cara menjalankan

Cukup buka `index.html` di browser. Tidak ada dependensi yang perlu dipasang.

Jika ingin lewat server lokal:

```bash
# Python
python3 -m http.server 8000

# atau Node.js
npx serve .
```

Lalu buka `http://localhost:8000`.

## Struktur file

```
kaslepas/
├── index.html   # Struktur halaman
├── style.css    # Tampilan (tema gelap, responsif)
├── script.js    # Logika aplikasi
└── README.md
```

## Penyimpanan data

Data disimpan di `localStorage` browser, jadi tetap ada setelah halaman ditutup tetapi hanya di browser dan perangkat yang sama.

| Key                  | Isi                              |
| -------------------- | -------------------------------- |
| `kaslepas_transaksi` | Transaksi dan tagihan klien      |
| `kaslepas_budget`    | Batas budget per kategori        |

Menghapus data situs di browser akan menghapus semua catatan. Unduh backup JSON secara berkala lewat bagian **Backup**.

### Format backup

```json
{
  "aplikasi": "KasLepas",
  "versi": 1,
  "diekspor": "2026-10-19T08:00:00.000Z",
  "transaksi": [],
  "budget": []
}
```

Saat impor, seluruh data diperiksa dulu. Jika ada data yang rusak, impor dibatalkan. Data yang sudah ada akan diganti setelah kamu mengonfirmasi.

## Cara kerja singkat

- **Tagihan** disimpan sebagai item pemasukan dengan `status: "belum dibayar"`. Selama belum lunas, nominalnya dihitung sebagai piutang, bukan pemasukan.
- Saat ditandai **lunas**, status berubah menjadi `lunas`, tanggalnya mengikuti tanggal dibayar, dan nominalnya masuk ke pemasukan. Status lunas bisa dibatalkan.
- Tagihan dianggap **terlambat** jika tanggal jatuh tempo sudah lewat dan belum dibayar.
- **Budget** menghitung pengeluaran per kategori pada bulan yang dipilih. Statusnya `aman`, `mendekati` (80% atau lebih), atau `lewat`.

## Kustomisasi

Semua pengaturan utama ada di bagian atas `script.js`:

| Konstanta        | Fungsi                                              |
| ---------------- | --------------------------------------------------- |
| `KATEGORI`       | Daftar kategori pemasukan dan pengeluaran           |
| `AMBANG_BUDGET`  | Persentase pemakaian untuk status "mendekati" (80)  |
| `DURASI_TOAST`   | Lama notifikasi tampil, dalam milidetik             |

Warna dan ukuran dapat diubah lewat variabel CSS di `:root` pada `style.css` (misalnya `--green`, `--red`, `--amber`, `--wrap`).

## Catatan teknis

- Bahasa dan format: Indonesia (`id-ID`), mata uang Rupiah tanpa desimal.
- Semua teks dari pengguna di-escape sebelum dirender ke HTML.
- Dialog konfirmasi memakai elemen `<dialog>` bawaan browser, sehingga membutuhkan browser modern.
- Gaya responsif dengan titik henti di 1024px, 640px, dan 400px.
