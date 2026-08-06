// File: export_excel_pengeluaran.js

function downloadExcelJurnalPengeluaran(filteredData) {
    if (!filteredData || filteredData.length === 0) {
        alert("Tidak ada data untuk diexport!");
        return;
    }

    // 1. URUTKAN DATA BERDASARKAN TANGGAL (Kronologis)
    // Di pengeluaran, format tanggal adalah YYYY-MM-DD, sehingga bisa disort secara abjad (string)
    const sortedData = [...filteredData].sort((a, b) => {
        const dateA = a.tanggal || "";
        const dateB = b.tanggal || "";
        return dateA.localeCompare(dateB);
    });

    const ws_data = [];

    // 2. Header
    ws_data.push([
        "Tanggal", 
        "Uraian Jurnal", 
        "Kode Akun", 
        "Nama Akun", 
        "Posisi", 
        "Debit", 
        "Kredit"
    ]);

    // Fungsi Bantuan: Memecah "Kode - Nama"
    function splitAkun(akunStr) {
        if (!akunStr) return { kode: "", nama: "" };
        const parts = akunStr.split(" - ");
        if (parts.length > 1) {
            const kode = parts[0].trim();
            const nama = parts.slice(1).join(" - ").trim();
            return { kode, nama };
        }
        return { kode: "", nama: akunStr.trim() };
    }

    // Fungsi Bantuan: Ubah YYYY-MM-DD menjadi DD-MM-YYYY agar seragam di Excel
    function formatTglExcel(tglStr) {
        if (!tglStr) return "";
        if (tglStr.includes("-")) {
            const parts = tglStr.split("-");
            if (parts.length === 3) return `${parts[2]}-${parts[1]}-${parts[0]}`;
        }
        return tglStr;
    }

    // 3. Mapping Hardcode Kas/Bank (Sesuai normalisasi di HTML Pengeluaran)
    const bankMapping = {
        "Kas Kecil":      { kode: "111010201", nama: "Kas Kecil Mahad Ibnu Taimiyah" },
        "Kas Besar":      { kode: "111010202", nama: "Kas Besar Mahad Ibnu Taimiyah" },
        "Bank BSI":       { kode: "111020201", nama: "BSI" },
        "Bank Muamalat":  { kode: "111020202", nama: "Muamalat" }
    };

    // 4. Looping Eksekusi Baris
    sortedData.forEach(item => {
        
        // Ambil nominal dari item.kredit (atau item.debet jika kredit 0)
        const rawNominal = (item.kredit !== 0) ? item.kredit : item.debet;
        const nominal = Math.abs(rawNominal);
        
        const isMinus = rawNominal < 0;
        
        const akunBank = bankMapping[item.kasBank] ? bankMapping[item.kasBank] : splitAkun(item.kasBank);
        
        // Jika COA barunya kosong (belum dimapping), beri tanda
        const coaTeks = item.posBaru ? item.posBaru : "(COA BELUM DITENTUKAN)";
        const akunCOA = splitAkun(coaTeks);
        
        const tgl = formatTglExcel(item.tanggal);
        const uraian = item.uraian || "-";

        // TRANSAKSI NORMAL (Pengeluaran Positif)
        if (!isMinus) {
            // Baris 1: COA PENGELUARAN di DEBIT
            ws_data.push([
                tgl, uraian, 
                akunCOA.kode, akunCOA.nama, "DEBIT", nominal, 0
            ]);

            // Baris 2: BANK / KAS di KREDIT (Uang Keluar)
            ws_data.push([
                tgl, uraian, 
                akunBank.kode, akunBank.nama, "KREDIT", 0, nominal
            ]);
        } 
        // TRANSAKSI KOREKSI (Pengeluaran Minus)
        else {
            // Baris 1: BANK / KAS pindah ke DEBIT (Uang Masuk/Kembali)
            ws_data.push([
                tgl, uraian + " (Koreksi)", 
                akunBank.kode, akunBank.nama, "DEBIT", nominal, 0
            ]);

            // Baris 2: COA PENGELUARAN pindah ke KREDIT
            ws_data.push([
                tgl, uraian + " (Koreksi)", 
                akunCOA.kode, akunCOA.nama, "KREDIT", 0, nominal
            ]);
        }
    });

    const ws = XLSX.utils.aoa_to_sheet(ws_data);

    ws['!cols'] = [
        { wch: 12 }, { wch: 55 }, { wch: 15 }, { wch: 35 }, { wch: 10 }, { wch: 15 }, { wch: 15 }
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Jurnal Pengeluaran");

    const dateStr = new Date().toISOString().split('T')[0];
    XLSX.writeFile(wb, `Format_Upload_Pengeluaran_${dateStr}.xlsx`);
}