/* ==========================================================================
   KasLepas - Persona: Pekerja lepas (freelancer)
   Alur besar:  aksi user -> ubah array `transaksi` -> simpanData() -> render()
   ========================================================================== */

/* ---------- 1. DATA & KONSTANTA ---------- */

const KUNCI_STORAGE = "transaksi-kaslepas";
const KATEGORI = ["Proyek", "Makan", "Transportasi", "Internet & Software", "Peralatan", "Lainnya"];
const BELUM = "belum dibayar"; // status tagihan klien
const LUNAS = "lunas";

// Satu-satunya "sumber kebenaran". Contoh isi satu transaksi:
// { id: 1739251200000, tanggal: "2026-10-12", jenis: "pemasukan", kategori: "Proyek",
//   nominal: 500000, catatan: "Logo PT Maju", status: "belum dibayar" }
// (properti `status` hanya ada di pemasukan)
let transaksi = [];

/* ---------- 2. ELEMEN HTML ---------- */

const form = document.getElementById("form-transaksi");
const inputTanggal = document.getElementById("tanggal");
const inputJenis = document.getElementById("jenis");
const inputStatus = document.getElementById("status");
const barisStatus = document.getElementById("baris-status");
const inputKategori = document.getElementById("kategori");
const inputNominal = document.getElementById("nominal");
const inputCatatan = document.getElementById("catatan");
const pesanError = document.getElementById("pesan-error");

const daftar = document.getElementById("daftar");
const filterKata = document.getElementById("filter-kata");
const filterJenis = document.getElementById("filter-jenis");
const filterKategori = document.getElementById("filter-kategori");

const tombolEkspor = document.getElementById("tombol-ekspor");
const inputImpor = document.getElementById("input-impor");
const pesanImpor = document.getElementById("pesan-impor");

/* ---------- 3. LOCALSTORAGE (W4) ---------- */

function simpanData() {
  // array objek -> teks JSON
  localStorage.setItem(KUNCI_STORAGE, JSON.stringify(transaksi));
}

function muatData() {
  // teks JSON -> array objek (dipanggil sekali saat halaman dibuka)
  try {
    const teks = localStorage.getItem(KUNCI_STORAGE);
    transaksi = teks ? JSON.parse(teks) : [];
  } catch (err) {
    transaksi = []; // data rusak -> mulai kosong, tidak error
  }
}

/* ---------- 4. HELPER ---------- */

function formatRupiah(angka) {
  const tanda = angka < 0 ? "-" : "";
  return tanda + "Rp " + Math.abs(angka).toLocaleString("id-ID");
}

function hariIni() {
  const d = new Date();
  const bulan = String(d.getMonth() + 1).padStart(2, "0");
  const hari = String(d.getDate()).padStart(2, "0");
  return d.getFullYear() + "-" + bulan + "-" + hari;
}

// Supaya catatan dari user tidak dibaca browser sebagai kode HTML
function escapeHtml(teks) {
  const div = document.createElement("div");
  div.textContent = teks;
  return div.innerHTML;
}

/* ---------- 5. RINGKASAN (W5 + fitur khas piutang) ---------- */

function jumlahkan(daftarTransaksi) {
  return daftarTransaksi.reduce(function (total, t) {
    return total + t.nominal;
  }, 0);
}

function hitungRingkasan() {
  // Pemasukan hanya yang sudah lunas; tagihan belum dibayar = piutang
  const pemasukan = jumlahkan(
    transaksi.filter(function (t) {
      return t.jenis === "pemasukan" && t.status !== BELUM;
    })
  );
  const pengeluaran = jumlahkan(
    transaksi.filter(function (t) {
      return t.jenis === "pengeluaran";
    })
  );
  const piutang = jumlahkan(
    transaksi.filter(function (t) {
      return t.status === BELUM;
    })
  );

  return { pemasukan, pengeluaran, saldo: pemasukan - pengeluaran, piutang };
}

function renderRingkasan() {
  const r = hitungRingkasan();
  document.getElementById("saldo").textContent = formatRupiah(r.saldo);
  document.getElementById("total-pemasukan").textContent = formatRupiah(r.pemasukan);
  document.getElementById("total-pengeluaran").textContent = formatRupiah(r.pengeluaran);
  document.getElementById("total-piutang").textContent = formatRupiah(r.piutang);
}

/* ---------- 6. DAFTAR TRANSAKSI (W2 + filter) ---------- */

// Ambil transaksi yang lolos filter, urut dari terbaru
function ambilTransaksiTampil() {
  const kata = filterKata.value.trim().toLowerCase();

  return transaksi
    .filter(function (t) {
      return filterJenis.value === "semua" || t.jenis === filterJenis.value;
    })
    .filter(function (t) {
      return filterKategori.value === "semua" || t.kategori === filterKategori.value;
    })
    .filter(function (t) {
      return (t.catatan || "").toLowerCase().includes(kata);
    })
    .sort(function (a, b) {
      return b.tanggal.localeCompare(a.tanggal) || b.id - a.id;
    });
}

function renderDaftar() {
  const tampil = ambilTransaksiTampil();
  daftar.innerHTML = "";

  if (tampil.length === 0) {
    daftar.innerHTML = '<li class="kosong">Belum ada transaksi.</li>';
    return;
  }

  tampil.forEach(function (t) {
    const adalahPiutang = t.status === BELUM;
    const tanda = t.jenis === "pemasukan" ? "+" : "-";
    const lencana = adalahPiutang ? '<span class="lencana">Belum dibayar</span>' : "";
    const catatan = t.catatan ? " · " + escapeHtml(t.catatan) : "";
    const tombolLunas = adalahPiutang
      ? '<button data-aksi="lunas" data-id="' + t.id + '">Tandai lunas</button>'
      : "";

    const li = document.createElement("li");
    li.className = "item " + t.jenis + (adalahPiutang ? " belum" : "");
    li.innerHTML =
      "<div>" +
        "<strong>" + escapeHtml(t.kategori) + "</strong>" + lencana +
        "<small>" + t.tanggal + catatan + "</small>" +
      "</div>" +
      '<div class="kanan">' +
        '<span class="nominal">' + tanda + " " + formatRupiah(t.nominal) + "</span>" +
        tombolLunas +
        '<button data-aksi="hapus" data-id="' + t.id + '">Hapus</button>' +
      "</div>";

    daftar.appendChild(li);
  });
}

// Satu fungsi untuk memperbarui seluruh tampilan
function render() {
  renderRingkasan();
  renderDaftar();
}

/* ---------- 7. VALIDASI (W6) ---------- */

function validasi(data) {
  const error = [];
  if (!data.tanggal) error.push("Tanggal wajib diisi.");
  if (!data.kategori) error.push("Kategori wajib dipilih.");
  if (!(data.nominal > 0)) error.push("Nominal wajib diisi dan harus lebih dari 0.");
  return error;
}

function tampilkanError(daftarError) {
  pesanError.innerHTML = "";
  daftarError.forEach(function (pesan) {
    const li = document.createElement("li");
    li.textContent = pesan;
    pesanError.appendChild(li);
  });
}

/* ---------- 8. AKSI USER ---------- */

// W1: tambah transaksi
function tambahTransaksi(event) {
  event.preventDefault(); // cegah halaman reload

  const data = {
    id: Date.now(),
    tanggal: inputTanggal.value,
    jenis: inputJenis.value,
    kategori: inputKategori.value,
    nominal: Number(inputNominal.value), // disimpan sebagai ANGKA
    catatan: inputCatatan.value.trim()
  };
  if (data.jenis === "pemasukan") {
    data.status = inputStatus.value;
  }

  const error = validasi(data);
  tampilkanError(error);
  if (error.length > 0) return; // berhenti, data tidak disimpan

  transaksi.push(data);
  simpanData();
  resetForm();
  render();
}

function resetForm() {
  form.reset();
  inputTanggal.value = hariIni();
  aturBarisStatus();
}

// Pilihan status hanya relevan untuk pemasukan
function aturBarisStatus() {
  barisStatus.hidden = inputJenis.value !== "pemasukan";
}

// W3: hapus dengan konfirmasi
function hapusTransaksi(id) {
  if (!confirm("Yakin ingin menghapus transaksi ini?")) return;

  transaksi = transaksi.filter(function (t) {
    return t.id !== id;
  });
  simpanData();
  render();
}

// Fitur khas: tagihan lunas otomatis menjadi pemasukan
function tandaiLunas(id) {
  const t = transaksi.find(function (item) {
    return item.id === id;
  });
  if (!t) return;

  t.status = LUNAS;
  simpanData();
  render();
}

// Satu listener untuk semua tombol di daftar (event delegation)
function klikDaftar(event) {
  const aksi = event.target.dataset.aksi;
  const id = Number(event.target.dataset.id);

  if (aksi === "hapus") hapusTransaksi(id);
  if (aksi === "lunas") tandaiLunas(id);
}

/* ---------- 9. BONUS: EKSPOR & IMPOR JSON ---------- */

function ekspor() {
  const blob = new Blob([JSON.stringify(transaksi, null, 2)], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "backup-kaslepas.json";
  link.click();
  URL.revokeObjectURL(link.href);
}

function dataValid(t) {
  return (
    typeof t === "object" && t !== null &&
    typeof t.id === "number" &&
    typeof t.tanggal === "string" &&
    (t.jenis === "pemasukan" || t.jenis === "pengeluaran") &&
    typeof t.kategori === "string" &&
    typeof t.nominal === "number" && t.nominal > 0
  );
}

function impor() {
  const file = inputImpor.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function () {
    try {
      const data = JSON.parse(reader.result);
      if (!Array.isArray(data) || !data.every(dataValid)) {
        throw new Error("Format tidak sesuai");
      }
      if (!confirm("Data saat ini akan diganti " + data.length + " data dari file. Lanjutkan?")) return;

      transaksi = data;
      simpanData();
      render();
      pesanImpor.textContent = "";
    } catch (err) {
      pesanImpor.textContent = "File tidak valid: pastikan ini file backup KasLepas.";
    }
  };
  reader.readAsText(file);
  inputImpor.value = ""; // supaya file yang sama bisa dipilih lagi
}

/* ---------- 10. PASANG EVENT LISTENER ---------- */

form.addEventListener("submit", tambahTransaksi);
inputJenis.addEventListener("change", aturBarisStatus);
daftar.addEventListener("click", klikDaftar);

filterKata.addEventListener("input", renderDaftar);
filterJenis.addEventListener("change", renderDaftar);
filterKategori.addEventListener("change", renderDaftar);

tombolEkspor.addEventListener("click", ekspor);
inputImpor.addEventListener("change", impor);

/* ---------- 11. MULAI ---------- */

function isiPilihanKategori() {
  KATEGORI.forEach(function (nama) {
    inputKategori.add(new Option(nama, nama));
    filterKategori.add(new Option(nama, nama));
  });
}

muatData();
isiPilihanKategori();
inputTanggal.value = hariIni();
aturBarisStatus();
render();