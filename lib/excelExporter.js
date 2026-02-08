import * as XLSX from 'xlsx';

/**
 * 処理済みデータをExcelファイルとしてエクスポートする
 * VBAのModule1.タブ出力() + データ保存()に相当
 * 
 * @param {Object} data - 処理済みデータ
 * @param {string} filename - 出力ファイル名
 */
export function exportToExcel(data, filename) {
  // ワークシートを作成
  const worksheet = XLSX.utils.aoa_to_sheet(data.raw);
  
  // ワークブックを作成
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'DATA');
  
  // Excelファイルとしてダウンロード
  XLSX.writeFile(workbook, filename, {
    bookType: 'xlsx',
    type: 'binary'
  });
}
