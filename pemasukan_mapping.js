/**
 * ======================================================================
 * FILE: coa_mapping.js
 * PUSAT PENGATURAN MAPPING COA (CHART OF ACCOUNTS)
 * ======================================================================
 */

// Kata kunci yang HARUS SELALU masuk ke Utang Jangka Pendek Lainnya,
// apapun status akrualnya (sekarang / bulan lalu / bulan depan / tapel lalu / tapel akan datang).
const FORCE_UTANG_JANGKA_PENDEK_KEYS = ["LAUNDRY", "HASIL USAHA", "PARKIR", ];

const COA_REVENUE_MAP = [
    { 
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
        keys: ["LAUNDRY", "HASIL USAHA"], 
        coa: "213010199 - Utang Jangka Pendek Lainnya" 
    }, 
    { 
        keys: ["HUTANG", "PIUTANG"], 
        coa: "112030102 - Piutang Pegawai" 
    },
    { 
        keys: ["PENDAPATAN BIAYA ADMIN"], 
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
    { 
        keys: ["TITIP TRANSFER"], 
        coa: "213010199 - Utang Jangka Pendek Lainnya" 
    },
];

/**
 * FUNGSI UTAMA PENENTUAN COA
 */
function determineCOA(posAsli, ketItem, kategoriAkrual) {
    const posText = String(posAsli).toUpperCase();
    const ketText = String(ketItem).toUpperCase();
    const combinedSearchText = `${posText} ${ketText}`;

    // 0. PENGECUALIAN MUTLAK: LAUNDRY & HASIL USAHA
    // Selalu masuk ke Utang Jangka Pendek Lainnya, TIDAK PEDULI status akrualnya
    // (sekarang / bulan lalu / bulan depan / tapel lalu / tapel akan datang).
    // Dicek di paling atas SEBELUM logika akrual, supaya tidak bisa "ketiban"
    // aturan diterima-dimuka atau piutang di bawah.
    for (let key of FORCE_UTANG_JANGKA_PENDEK_KEYS) {
        if (combinedSearchText.includes(key)) {
            return "213010199 - Utang Jangka Pendek Lainnya";
        }
    }

    // 1. PENDAPATAN DITERIMA DI MUKA (Bulan Depan ATAU Tapel Mendatang)
    if (kategoriAkrual === "TAPEL AKAN DATANG" || kategoriAkrual === "BULAN DEPAN") {
        return "213010190 - Pendapatan diterima Dimuka";
    }
    
    // 2. PEMBAYARAN TUNGGAKAN / PELUNASAN PIUTANG (Bulan Lalu ATAU Tapel Lalu)
    if (kategoriAkrual === "TAPEL LALU" || kategoriAkrual === "BULAN LALU") {
        if (combinedSearchText.includes("SPP") || combinedSearchText.includes("PONDOKAN") || combinedSearchText.includes("IWS")) {
            return "112010101 - Piutang SPP";
        }
    }
    

    // 3. PENDAPATAN SEKARANG / REGULER
    for (let rule of COA_REVENUE_MAP) {
        for (let key of rule.keys) {
            if (combinedSearchText.includes(key)) {
                return rule.coa;
            }
        }
    }
    
    // 4. FALLBACK DEFAULT
    return "423010105 - Pendapatan Lain";
}