// File: export_excel_pengeluaran.js

function downloadExcelJurnalPengeluaran(filteredData) {
    if (!filteredData || filteredData.length === 0) {
        alert("Tidak ada data untuk diexport!");
        return;
    }

    // 1. URUTKAN DATA BERDASARKAN TANGGAL (Kronologis)
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

    // 3. Mapping Hardcode Kas/Bank
    const bankMapping = {
        "Kas Kecil":      { kode: "111010201", nama: "Kas Kecil Mahad Ibnu Taimiyah" },
        "Kas Besar":      { kode: "111010202", nama: "Kas Besar Mahad Ibnu Taimiyah" },
        "Bank BSI":       { kode: "111020201", nama: "BSI" },
        "Bank Muamalat":  { kode: "111020202", nama: "Muamalat" }
    };

    // Set untuk melacak ID Group LPJ mana saja yang sudah diproses agar tidak ganda
    const processedGroups = new Set();

    // 4. Looping Eksekusi Baris
    sortedData.forEach(item => {
        
        // ===============================================================
        // SKENARIO A: TRANSAKSI TUNGGAL (Tidak Diikat / Normal)
        // ===============================================================
        if (!item.groupId) {
            const rawNominal = (item.kredit !== 0) ? item.kredit : item.debet;
            const nominal = Math.abs(rawNominal);
            const isMinus = rawNominal < 0;
            
            const akunBank = bankMapping[item.kasBank] ? bankMapping[item.kasBank] : splitAkun(item.kasBank);
            const coaTeks = item.posBaru ? item.posBaru : "(COA BELUM DITENTUKAN)";
            const akunCOA = splitAkun(coaTeks);
            
            const tgl = formatTglExcel(item.tanggal);
            const uraian = item.uraian || "-";

            if (!isMinus) {
                // Pengeluaran Normal
                ws_data.push([tgl, uraian, akunCOA.kode, akunCOA.nama, "DEBIT", nominal, 0]);
                ws_data.push([tgl, uraian, akunBank.kode, akunBank.nama, "KREDIT", 0, nominal]);
            } else {
                // Transaksi Minus / Koreksi
                ws_data.push([tgl, uraian + " (Koreksi)", akunBank.kode, akunBank.nama, "DEBIT", nominal, 0]);
                ws_data.push([tgl, uraian + " (Koreksi)", akunCOA.kode, akunCOA.nama, "KREDIT", 0, nominal]);
            }
        } 
        // ===============================================================
        // SKENARIO B: TRANSAKSI MAJEMUK (LPJ Kasbon yang Diikat)
        // ===============================================================
        else {
            // Jika grup ini sudah diproses di putaran sebelumnya, lewati
            if (processedGroups.has(item.groupId)) return; 
            processedGroups.add(item.groupId);

            // Ambil semua baris yang terikat di Grup yang sama
            const groupItems = sortedData.filter(x => x.groupId === item.groupId);
            
            const tgl = formatTglExcel(groupItems[0].tanggal);
            const akunBank = bankMapping[groupItems[0].kasBank] ? bankMapping[groupItems[0].kasBank] : splitAkun(groupItems[0].kasBank);
            
            let totalKasbon = 0;
            let totalBeban = 0;
            let groupRows = [];

            // Evaluasi setiap item dalam grup tersebut
            groupItems.forEach(gItem => {
                const rawNominal = (gItem.kredit !== 0) ? gItem.kredit : gItem.debet;
                const nominal = Math.abs(rawNominal);
                
                const coaTeks = gItem.posBaru ? gItem.posBaru : "(COA BELUM DITENTUKAN)";
                const akunCOA = splitAkun(coaTeks);
                const uraian = gItem.uraian || "-";

                if (rawNominal < 0) {
                    // Kasbon Minus -> KREDIT (Uang Muka kembali)
                    groupRows.push([tgl, uraian, akunCOA.kode, akunCOA.nama, "KREDIT", 0, nominal]);
                    totalKasbon += nominal;
                } else {
                    // Belanja Positif -> DEBIT (Beban bertambah)
                    groupRows.push([tgl, uraian, akunCOA.kode, akunCOA.nama, "DEBIT", nominal, 0]);
                    totalBeban += nominal;
                }
            });

            // Hitung Selisih untuk menentukan sisa Kas
            const selisih = totalKasbon - totalBeban;
            const ketSelisih = `Penyelesaian Kasbon (${item.groupId})`;

            if (selisih > 0) {
                // Sisa Kembalian Uang Fisik -> DEBIT Kas
                groupRows.push([tgl, ketSelisih, akunBank.kode, akunBank.nama, "DEBIT", Math.abs(selisih), 0]);
            } else if (selisih < 0) {
                // Reimburse (Kasir nombok/keluar uang lagi) -> KREDIT Kas
                groupRows.push([tgl, ketSelisih, akunBank.kode, akunBank.nama, "KREDIT", 0, Math.abs(selisih)]);
            }

            // Susun Rapi: Pastikan baris DEBIT selalu ada di atas KREDIT di dalam Excel
            groupRows.sort((a, b) => {
                if (a[4] === "DEBIT" && b[4] === "KREDIT") return -1;
                if (a[4] === "KREDIT" && b[4] === "DEBIT") return 1;
                return 0;
            });

            // Masukkan ke lembar kerja utama
            groupRows.forEach(row => ws_data.push(row));
        }
    });

    const ws = XLSX.utils.aoa_to_sheet(ws_data);

    ws['!cols'] = [
        { wch: 12 }, // A: Tanggal
        { wch: 55 }, // B: Uraian Jurnal
        { wch: 15 }, // C: Kode Akun
        { wch: 35 }, // D: Nama Akun
        { wch: 10 }, // E: Posisi
        { wch: 15 }, // F: Debit
        { wch: 15 }  // G: Kredit
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Jurnal Pengeluaran");

    const dateStr = new Date().toISOString().split('T')[0];
    XLSX.writeFile(wb, `Format_Upload_Pengeluaran_${dateStr}.xlsx`);
}