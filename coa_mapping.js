/**
 * ======================================================================
 * FILE: coa_mapping.js
 * PUSAT PENGATURAN MAPPING COA (CHART OF ACCOUNTS)
 * ======================================================================
 * 
 * ATURAN MAIN PENCARIAN & PRIORITAS:
 * 1. Sistem akan menggabungkan teks "Pos Penerimaan" & "Keterangan Item".
 * 2. Sistem mencari KATA KUNCI (keys) dari urutan PALING ATAS ke BAWAH.
 * 3. Pastikan 'keys' ditulis dengan HURUF KAPITAL.
 * ======================================================================
 */

const COA_REVENUE_MAP = [
    { 
        // SPP diprioritaskan di atas
        keys: ["SPP", "PONDOKAN", "IWS"], 
        coa: "421010101 - Pendapatan IWS (Infaq Wali-Santri/Murid)" 
    },
    { 
        keys: ["PSB", "PENDAFTARAN"], 
        coa: "421010102 - Pendapatan Pendaftaran PSB" 
    },
    { 
        keys: ["WAKAF BANGUNAN", "DANA PENGEMBANGAN", "UANG PANGKAL RA IT"], 
        coa: "421010103 - Pendapatan Pembangunan-DU PSB" 
    },
    { 
        keys: ["DAFTAR ULANG", "KESEHATAN", "BUKU", "UJIAN", "PERPUSTAKAAN"], 
        coa: "421010104 - Pendapatan Tahunan-DU PSB" 
    },
    { 
        keys: ["SERAGAM", "PERLENGKAPAN"], 
        coa: "421010105 - Pendapatan Perlengkapan-DU PSB" 
    },
    { 
        keys: ["EKSTRAKURIKULER"], 
        coa: "213010106 - Dana Titipan Santri" 
    },
    { 
        keys: ["KEGIATAN"], 
        coa: "Penerimaan Kegiatan-Program" 
    },
    { 
        keys: ["YATIM", "SUMBANGAN", "KAFALAH", "TPG", "CALISTUNG"], 
        coa: "423010102 - Pendapatan Bantuan-Sumbangan dan Lainnya" 
    },
    { 
        keys: ["TPA"], 
        coa: "423010103 - Penerimaan Kegiatan-Program" 
    },
    { 
        keys: ["LAUNDRY"], 
        coa: "213010199 - Utang Jangka Pendek Lainnya" 
    }, 
    { 
        keys: ["HUTANG", "PIUTANG"], 
        coa: "112030102 - Piutang Pegawai" 
    },
    { 
        keys: ["PENDAPATAN BIAYA ADMIN",], 
        coa: "611010104 - Pendapatan Administrasi Bank" 
    },
    { 
        keys: ["PARKIR"], 
        coa: "213010199 - Utang Jangka Pendek Lainnya" 
    },
    { 
        keys: ["WISUDA"], 
        coa: "213010106 - Dana Titipan Santri" 
    },
    { 
        keys: ["TABUNGAN"], 
        coa: "213010108 - Dana Titipan Tabungan Santri" 
    },
    { 
        keys: ["IFTHOR"], 
        coa: "213010199 - Utang Jangka Pendek Lainnya" 
    },
    { 
        keys: ["XENDIT"], 
        coa: "213010199 - Utang Jangka Pendek Lainnya" 
    },

];

/**
 * FUNGSI UTAMA PENENTUAN COA
 * Fungsi ini dipanggil dari index.html dengan membawa 3 parameter:
 * - posAsli : Kolom "POS PENERIMAAN"
 * - ketItem : Kolom "KETERANGAN ITEM" / "JENIS BIAYA"
 * - kategoriAkrual : Status (Tapel Sekarang / Lalu / Akan Datang)
 */
function determineCOA(posAsli, ketItem, kategoriAkrual) {
    // 1. ATURAN PENDAPATAN DITERIMA DI MUKA (Bayar di Awal)
    if (kategoriAkrual === "TAPEL AKAN DATANG") {
        return "213010190 - Pendapatan diterima Dimuka";
    }
    
    // 2. GABUNGKAN TEKS POS DAN KETERANGAN (Untuk Tapel Sekarang / Tapel Lalu)
    // Jika pos-nya "Lain-lain" tapi keterangannya "Bayar Seragam", maka akan terdeteksi "SERAGAM"
    const posText = String(posAsli).toUpperCase();
    const ketText = String(ketItem).toUpperCase();
    const combinedSearchText = `${posText} ${ketText}`; // Digabungkan jadi 1 kalimat

    // Looping mencari kata kunci dari atas ke bawah
    for (let rule of COA_REVENUE_MAP) {
        for (let key of rule.keys) {
            if (combinedSearchText.includes(key)) {
                return rule.coa;
            }
        }
    }
    
    // 3. FALLBACK DEFAULT (Jika tidak ada satupun kata yang cocok)
    return "423010105 - Pendapatan Lain";
}