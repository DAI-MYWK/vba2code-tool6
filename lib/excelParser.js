import * as XLSX from 'xlsx';

/**
 * Excelファイルを解析してデータを抽出する
 * @param {File} file - アップロードされたExcelファイル
 * @returns {Promise<{headers: string[], rows: any[][]}>}
 */
export async function parseExcelFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // 最初のシートを取得
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // シートをJSON配列に変換（ヘッダーなし、全て配列形式）
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
          header: 1,
          defval: ''
        });
        
        // 最初の2行を除外（1行目: 会社名, 2行目: ヘッダー）
        // 2行目をヘッダーとして抽出
        const headers = jsonData[1] || [];
        const rows = jsonData.slice(2);
        
        resolve({
          headers,
          rows,
          raw: jsonData
        });
      } catch (error) {
        reject(new Error('ファイルの解析に失敗しました: ' + error.message));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('ファイルの読み込みに失敗しました'));
    };
    
    reader.readAsArrayBuffer(file);
  });
}

/**
 * 列インデックスを取得（A=0, B=1, ..., Z=25, AA=26, ...）
 * @param {string} colName - 列名（例: "A", "IR"）
 * @returns {number}
 */
export function getColumnIndex(colName) {
  let index = 0;
  for (let i = 0; i < colName.length; i++) {
    index = index * 26 + (colName.charCodeAt(i) - 64);
  }
  return index - 1; // 0-indexed
}

// 主要列のインデックス定義（VBAの列番号をJSインデックスに変換）
export const COLUMNS = {
  // 基本情報
  JOB_ID: 3,        // D列 - 求人案件ID
  
  // 住所関連
  POSTAL_CODE: 10,   // K列 - 郵便番号
  ADDRESS: 11,       // L列 - 都道府県市区町村
  STREET: 12,        // M列 - 番地
  
  // 雇用形態
  EMPLOYMENT_TYPE: 23, // X列 - 雇用形態コード
  
  // 給与関連
  SALARY_MIN: 51,    // AZ列 - 給与金額（最低）
  SALARY_MAX: 52,    // BA列 - 給与金額（最高）
  
  // 紹介先企業情報
  REFERRAL_POSTAL: 246,    // IM列 - 紹介先郵便番号
  REFERRAL_ADDRESS: 247,   // IN列 - 紹介先住所
  REFERRAL_STREET: 248,    // IO列 - 紹介先番地
  
  // エラーメッセージ
  ERROR_MESSAGE: 251       // IR列 - エラーメッセージ
};
