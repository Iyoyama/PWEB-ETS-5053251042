const KUNCI = "kasFreelanceTransaksi";
let transaksi = [];
const $ = (id) => document.getElementById(id);

function muatData() {
  try {
    const mentah = localStorage.getItem(KUNCI);
    transaksi = mentah ? JSON.parse(mentah) : [];
    if (!Array.isArray(transaksi)) transaksi = [];
  } catch (e) { transaksi = []; }
}
function simpanData() { localStorage.setItem(KUNCI, JSON.stringify(transaksi)); }

function formatRupiah(n) { return "Rp" + Number(n).toLocaleString("id-ID"); }
function formatTanggal(t) {
  const [y, m, d] = t.split("-");
  return `${d}/${m}/${y}`;
}
function hariIni() {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
}

// Pemasukan hanya dihitung jika lunas; yang belum dibayar masuk piutang.
function hitungRingkasan() {
  let masuk = 0, keluar = 0, piutang = 0, jumlahPiutang = 0;
  transaksi.forEach((t) => {
    if (t.jenis === "pengeluaran") keluar += t.nominal;
    else if (t.status === "belum dibayar") { piutang += t.nominal; jumlahPiutang++; }
    else masuk += t.nominal;
  });
  return { masuk, keluar, saldo: masuk - keluar, piutang, jumlahPiutang };
}
function renderRingkasan() {
  const r = hitungRingkasan();
  $("totalMasuk").textContent = formatRupiah(r.masuk);
  $("totalKeluar").textContent = formatRupiah(r.keluar);
  $("saldo").textContent = formatRupiah(r.saldo);
  $("totalPiutang").textContent = formatRupiah(r.piutang);
  $("jumlahPiutang").textContent = r.jumlahPiutang ? `${r.jumlahPiutang} tagihan belum dibayar` : "Tidak ada tagihan tertunda";
}

function buatItem(t) {
  const li = document.createElement("li");
  const kiri = document.createElement("div");
  const judul = document.createElement("div");
  judul.textContent = t.kategori;
  if (t.jenis === "pemasukan" && t.klien) judul.textContent += " · " + t.klien;
  if (t.jenis === "pemasukan") {
    const b = document.createElement("span");
    const belum = t.status === "belum dibayar";
    b.className = "badge" + (belum ? "" : " ok");
    b.textContent = belum ? "Belum dibayar" : "Lunas";
    judul.appendChild(b);
  }
  const meta = document.createElement("div");
  meta.className = "meta";
  meta.textContent = formatTanggal(t.tanggal) + (t.catatan ? " — " + t.catatan : "");
  kiri.append(judul, meta);

  const nom = document.createElement("div");
  const belum = t.status === "belum dibayar";
  nom.className = "nom " + (t.jenis === "pengeluaran" ? "keluar" : belum ? "tunggu" : "masuk");
  nom.textContent = (t.jenis === "pengeluaran" ? "-" : "+") + formatRupiah(t.nominal);

  const aksi = document.createElement("div");
  aksi.className = "aksi";
  if (belum) {
    const l = document.createElement("button");
    l.textContent = "Tandai lunas";
    l.onclick = () => tandaiLunas(t.id);
    aksi.appendChild(l);
  }
  const h = document.createElement("button");
  h.className = "hapus";
  h.textContent = "Hapus";
  h.onclick = () => hapusTransaksi(t.id);
  aksi.appendChild(h);

  li.append(kiri, nom, aksi);
  return li;
}
function renderDaftar() {
  const ul = $("daftar");
  ul.replaceChildren();
  if (!transaksi.length) {
    const li = document.createElement("li");
    li.className = "kosong";
    li.textContent = "Belum ada transaksi. Tambahkan tagihan klien pertama Anda di atas.";
    ul.appendChild(li);
    return;
  }
  const urut = [...transaksi].sort((a, b) => b.tanggal.localeCompare(a.tanggal) || b.id - a.id);
  urut.forEach((t) => ul.appendChild(buatItem(t)));
}
function renderSemua() { renderRingkasan(); renderDaftar(); }

function validasiForm(v) {
  const salah = [];
  if (!v.tanggal) salah.push(["tanggal", "Tanggal wajib diisi."]);
  if (!v.nominal || v.nominal <= 0) salah.push(["nominal", "Nominal harus lebih dari 0."]);
  if (v.jenis === "pemasukan" && !v.klien) salah.push(["klien", "Nama klien wajib diisi untuk pemasukan."]);
  return salah;
}
function aturBlokTagihan() { $("blokTagihan").hidden = $("jenis").value !== "pemasukan"; }

function tambahTransaksi(e) {
  e.preventDefault();
  document.querySelectorAll(".salah").forEach((el) => el.classList.remove("salah"));
  const v = {
    tanggal: $("tanggal").value,
    jenis: $("jenis").value,
    kategori: $("kategori").value,
    nominal: Number($("nominal").value),
    klien: $("klien").value.trim(),
    catatan: $("catatan").value.trim(),
  };
  const salah = validasiForm(v);
  $("error").textContent = salah.map((s) => s[1]).join(" ");
  if (salah.length) { salah.forEach((s) => $(s[0]).classList.add("salah")); $(salah[0][0]).focus(); return; }

  const baru = { id: Date.now(), tanggal: v.tanggal, jenis: v.jenis, kategori: v.kategori, nominal: v.nominal, catatan: v.catatan };
  if (v.jenis === "pemasukan") { baru.klien = v.klien; baru.status = $("status").value; }
  transaksi.push(baru);
  simpanData();
  renderSemua();
  $("form").reset();
  $("tanggal").value = hariIni();
  aturBlokTagihan();
}
function tandaiLunas(id) {
  const t = transaksi.find((x) => x.id === id);
  if (!t) return;
  t.status = "lunas";
  simpanData();
  renderSemua();
}
function hapusTransaksi(id) {
  if (!confirm("Hapus transaksi ini? Data tidak bisa dikembalikan.")) return;
  transaksi = transaksi.filter((t) => t.id !== id);
  simpanData();
  renderSemua();
}

muatData();
$("tanggal").value = hariIni();
$("jenis").addEventListener("change", aturBlokTagihan);
$("form").addEventListener("submit", tambahTransaksi);
aturBlokTagihan();
renderSemua();
