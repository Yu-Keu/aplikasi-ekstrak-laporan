/**
 * ======================================================================
 * FILE: pos_mapping.js
 * PUSAT PENGATURAN MAPPING POS LAMA -> COA BARU (Dashboard Jurnal)
 * INI KHUSUS UNTUK PENGELUARAN
 * ======================================================================
 *
 * ATURAN MAIN PENCARIAN & PRIORITAS:
 * 1. Sistem akan menggabungkan teks "Pos Lama" & "Uraian".
 * 2. Sistem mencari KATA KUNCI (keys) dari urutan PALING ATAS ke BAWAH.
 * 3. Pastikan 'keys' ditulis dengan HURUF KAPITAL.
 * 4. Aturan yang lebih SPESIFIK harus diletakkan LEBIH ATAS supaya tidak
 *    "kalah" tertangkap oleh keyword yang lebih umum di bawahnya.
 * ======================================================================
 */

const POS_MAPPING_RULES = [
  // --- PENDAPATAN (Penerimaan) ---
  { keys: ["SPP SANTRI", "SPP NON YATIM", "PONDOKAN", "IWS"], coa: "421010101 - Pendapatan IWS (Infaq Wali-Santri/Murid)" },
  { keys: ["UANG UJIAN"], coa: "421010104 - Pendapatan Tahunan-DU PSB" },
  { keys: ["PELAKSANAAN DANA AMANAH", "PELAKSANAAN PEMBANGUNAN"], coa: "122010102 - Bangunan" },
  { keys: ["DANA AMANAH PEMBANGUNAN"], coa: "117010101 - RAK Yayasan" },
  { keys: ["PENERIMAAN BOS"], coa: "422010101 - Pendapatan Dana BOS" },
  { keys: ["MINIMARKET", "USAHA PESANTREN"], coa: "213010199 - Utang Jangka Pendek Lainnya" },
  { keys: ["BAGI HASIL BANK"], coa: "611010104 - Pendapatan Administrasi Bank" },
  { keys: ["AYAT SILANG"], coa: "AYAT_SILANG" },
  { keys: ["ZAKAT", "INFAQ", "SHODAQOH", "SUMBANGAN", "KAFALAH", "YYS LAJNAH", "YATIM"], coa: "423010102 - Pendapatan Bantuan-Sumbangan dan Lainnya" },
  { keys: ["SISA DARI ANGGARAN"], coa: "423010105 - Pendapatan Lain" },
  { keys: ["UANG TAHUNAN"], coa: "DYNAMIC_UANG_TAHUNAN" },
  { keys: ["PIUTANG GURU", "PIUTANG KARYAWAN", "PIUTANG PEGAWAI"], coa: "112030102 - Piutang Pegawai" },
  { keys: ["DANA TITIP"], coa: "DYNAMIC_DANA_TITIP" },

  // --- BEBAN / PENGELUARAN ---
  { keys: ["MUKAFAAH"], coa: "521010101 - Beban Mukafaah Markaz" },
  { keys: ["KONSUMSI"], coa: "521010113 - Beban Belanja Dapur Markaz" },
  { keys: ["LISTRIK"], coa: "521010107 - Beban Listrik-Air-Gas Markaz" },
  { keys: ["TELEPON", "INTERNET"], coa: "521010115 - Beban Telepon-HP Markaz" },
  { keys: ["OPERASIONAL KLINIK", "KESEHATAN"], coa: "522010104 - Beban Tunjangan Kesehatan" },
  { keys: ["LAUNDRY"], coa: "213010199 - Utang Jangka Pendek Lainnya" },
  { keys: ["PELAKSANAAN ACARA", "KEGIATAN"], coa: "521010126 - Beban Kegiatan-Program" },
  { keys: ["UANG MUKA", "KAS BON"], coa: "113020102 - Uang Muka Markaz" },
  { keys: [
      "SEKRETARIAT", "PENDIDIKAN", "KESANTRIAN PUTRI", "KESANTRIAN",
      "BIDANG UMUM", "BIDANG KEUANGAN", "BIDANG RUMAH TANGGA",
      "BIDANG USAHA", "BIDANG MARHALAH", "BIDANG KHIDMAH", "BIDANG MULTIMEDIA"
    ], coa: "521010110 - Beban Operasional Markaz" },

  { keys: ["MUKAFAAH"], coa: "521010101 - Beban Mukafaah Markaz" },
  { keys: ["REFUND DANA GH"], coa: "213010199 - Utang Jangka Pendek Lainnya" },
  { keys: ["PENGAMBILAN UANG SAKU"], coa: "213010108 - Dana Titipan Tabungan Santri" },
  { keys: ["TITIP TRANSFER"], coa: "213010199 - Utang Jangka Pendek Lainnya" },
  // --- FALLBACK KOSONG (sengaja tidak dipetakan otomatis) ---
  { keys: ["PENERIMAAN LAIN-LAIN", "BEA RUTIN LAINNYA", "BEBAN BIAYA TAHUNAN"], coa: "" },
];

/**
 * FUNGSI BANTU: Resolve target dinamis (Uang Tahunan / Dana Titip / Ayat Silang)
 */
function resolvePosTarget(target, uraian, fallbackPos) {
  if (target === "DYNAMIC_UANG_TAHUNAN") return processUangTahunan(uraian);
  if (target === "DYNAMIC_DANA_TITIP") return processDanaTitip(uraian);
  if (target === "AYAT_SILANG") return fallbackPos;
  return target;
}

function processUangTahunan(ur) {
  const u = String(ur).toUpperCase();
  if (u.includes("BANGUNAN") || u.includes("WAKAF BANGUNAN"))
    return "421010103 - Pendapatan Pembangunan-DU PSB";
  if (u.includes("PENDAFTARAN") || u.includes("PSB"))
    return "421010102 - Pendapatan Pendaftaran PSB";
  if (u.includes("SERAGAM") || u.includes("PERLENGKAPAN"))
    return "421010105 - Pendapatan Perlengkapan-DU PSB";
  return "421010104 - Pendapatan Tahunan-DU PSB";
}

function processDanaTitip(ur) {
  const u = String(ur).toUpperCase();
  if (u.includes("PEGAWAI")) return "213010103 - Dana Titipan Tabungan Pegawai";
  if (u.includes("TABUNGAN SISWA")) return "213010108 - Dana Titipan Tabungan Santri";
  if (u.includes("SANTRI") || u.includes("SISWA") || u.includes("SAKU") || u.includes("EKSKUL"))
    return "213010106 - Dana Titipan Santri";
  return "213010108 - Dana Titipan Tabungan Santri";
}

/**
 * FUNGSI UTAMA PENENTUAN POS BARU (COA)
 * Dipanggil dari index.html dengan membawa parameter:
 * - kasBank : Hasil normalisasi Kas/Bank (Bank BSI, Bank Muamalat, dst)
 * - posLama : Kolom "POS LAMA"
 * - uraian  : Kolom "URAIAN"
 * - debet   : Nominal Debet
 * - kredit  : Nominal Kredit
 * - nama    : Kolom "NAMA" (opsional, untuk aturan khusus)
 */
function determinePosBaru(kasBank, posLama, uraian, debet, kredit, nama = "") {
  const posText = String(posLama).toUpperCase();
  const urText = String(uraian).toUpperCase();
  const kb = String(kasBank).toUpperCase();
  const nm = String(nama).toUpperCase();

  // Gabungkan Pos Lama + Uraian menjadi satu kalimat pencarian
  const combinedSearchText = `${posText} ${urText}`;

  // 1. ATURAN BSI & MUAMALAT: BEBAN ADMINISTRASI BANK (Kredit > 0 = Pengeluaran)
  const isBsiOrMuamalat = kb.includes("BSI") || kb.includes("MUAMALAT");
  const isAdminUraian =
    urText.includes("BIAYA ADMIN") || urText.includes("ADM BANK") ||
    urText.includes("ADMINISTRASI") || urText.includes("ADMIN");

  if (isBsiOrMuamalat && isAdminUraian && kredit > 0) {
    return "621010101 - Beban Administrasi Bank";
  }

  // 2. ATURAN MUAMALAT: PENDAPATAN FEE VA BANK (Debet > 0 = Penerimaan)
  if (kb.includes("MUAMALAT") && isAdminUraian && debet > 0) {
    return "611010103 - Pendapatan Fee VA Bank";
  }

  // 3. ATURAN KHUSUS: Kas Kecil + Tabungan Santri atas nama tertentu
  const isUangMuka = posText.includes("UANG MUKA") || posText.includes("KAS BON");
  if (!isUangMuka && kb.includes("KAS KECIL") && urText.includes("TABUNGAN SISWA") &&
      (nm.includes("ADITYA") || nm.includes("ADIYA"))) {
    return "213010108 - Dana Titipan Tabungan Santri";
  }

  // 4. ATURAN KHUSUS: Tabungan Siswa (Umum)
  if (urText.includes("TABUNGAN SISWA")) {
    return "213010108 - Dana Titipan Tabungan Santri";
  }

  // 5. ATURAN KHUSUS: Biaya Kegiatan (di Uraian, prioritas di atas keyword umum)
  if (urText.includes("BIAYA KEGIATAN")) {
    return "423010103 - Penerimaan Kegiatan-Program";
  }

  // 6. LOOPING MENCARI KATA KUNCI DARI ATAS KE BAWAH (Pos Lama + Uraian gabungan)
  for (let rule of POS_MAPPING_RULES) {
    for (let key of rule.keys) {
      if (combinedSearchText.includes(key)) {
        return resolvePosTarget(rule.coa, urText, posLama);
      }
    }
  }

  // 7. FALLBACK TERAKHIR: kembalikan Pos Lama apa adanya
  return posLama;
}