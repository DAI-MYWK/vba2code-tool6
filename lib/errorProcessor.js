import { COLUMNS } from './excelParser';
import { extractPrefecture, getMinimumWage } from './minimumWage';

/**
 * エラーデータを処理して修正を適用する
 * VBAのModule2.main()に相当
 * 
 * @param {Object} errorData - エラーファイルのデータ
 * @param {Object} expData - 求人一覧データ
 * @returns {{processedData: Object, stats: Object}}
 */
export function processErrors(errorData, expData) {
  const stats = {
    totalRows: 0,
    addressFixed: 0,
    referralAddressFixed: 0,
    wageFixed: 0,
    unhandled: 0
  };

  // expデータを求人案件IDでインデックス化（高速検索用）
  const expIndex = {};
  for (const row of expData.rows) {
    const jobId = row[COLUMNS.JOB_ID];
    if (jobId) {
      expIndex[jobId] = row;
    }
  }

  // エラーデータをコピーして修正
  const processedRows = errorData.rows.map((row, index) => {
    const newRow = [...row]; // 配列をコピー
    const errorMessage = newRow[COLUMNS.ERROR_MESSAGE] || '';
    const jobId = newRow[COLUMNS.JOB_ID];

    if (!errorMessage) {
      return newRow;
    }

    stats.totalRows++;

    // エラー種別を判定して修正を適用
    if (errorMessage.includes('紹介先企業の住所と郵便番号が一致しません')) {
      // 紹介先住所修正
      if (fixReferralAddress(newRow, expIndex, jobId)) {
        stats.referralAddressFixed++;
      } else {
        stats.unhandled++;
      }
    } else if (errorMessage.includes('住所と郵便番号が一致しません')) {
      // 勤務地住所修正
      if (fixWorkplaceAddress(newRow, expIndex, jobId, errorMessage)) {
        stats.addressFixed++;
      } else {
        stats.unhandled++;
      }
    } else if (errorMessage.includes('(郵便番号)は存在しません')) {
      // 郵便番号修正
      if (fixWorkplaceAddress(newRow, expIndex, jobId, errorMessage)) {
        stats.addressFixed++;
      } else {
        stats.unhandled++;
      }
    } else if (errorMessage.includes('(給与金額（最低）)は最低賃金未満')) {
      // 最低賃金修正
      if (fixMinimumWage(newRow)) {
        stats.wageFixed++;
      } else {
        stats.unhandled++;
      }
    } else {
      stats.unhandled++;
    }

    return newRow;
  });

  return {
    processedData: {
      headers: errorData.headers,
      rows: processedRows,
      raw: [errorData.raw[0], errorData.headers, ...processedRows]
    },
    stats
  };
}

/**
 * 紹介先住所を修正する
 * VBAのModule2.紹介先住所取得()に相当
 */
function fixReferralAddress(row, expIndex, jobId) {
  const expRow = expIndex[jobId];
  if (!expRow) return false;

  // 紹介先住所情報をexpからコピー
  row[COLUMNS.REFERRAL_POSTAL] = expRow[COLUMNS.REFERRAL_POSTAL] || '';
  row[COLUMNS.REFERRAL_ADDRESS] = expRow[COLUMNS.REFERRAL_ADDRESS] || '';
  row[COLUMNS.REFERRAL_STREET] = expRow[COLUMNS.REFERRAL_STREET] || '';

  return true;
}

/**
 * 勤務地住所を修正する
 * VBAのModule2.勤務地住所取得()に相当
 */
function fixWorkplaceAddress(row, expIndex, jobId, errorMessage) {
  // 求人案件IDが空の場合の特殊処理
  if (!jobId) {
    // 都道府県と市区町村を結合
    const address = (row[COLUMNS.ADDRESS] || '') + (row[COLUMNS.STREET] || '');
    
    // エラーメッセージの中に結合した住所が含まれていたらそのまま入力
    if (errorMessage.includes(address)) {
      row[COLUMNS.ADDRESS] = address;
      row[COLUMNS.STREET] = '';
      return true;
    }
    
    // 含まれていない場合は修正不可
    return false;
  }

  const expRow = expIndex[jobId];
  if (!expRow) return false;

  // 住所情報をexpからコピー
  row[COLUMNS.POSTAL_CODE] = expRow[COLUMNS.POSTAL_CODE] || '';
  row[COLUMNS.ADDRESS] = expRow[COLUMNS.ADDRESS] || '';
  row[COLUMNS.STREET] = expRow[COLUMNS.STREET] || '';

  // 雇用形態が8（有職）の場合、紹介先住所も同時に更新
  const employmentType = expRow[COLUMNS.EMPLOYMENT_TYPE];
  if (employmentType === 8 || employmentType === '8') {
    row[COLUMNS.REFERRAL_POSTAL] = expRow[COLUMNS.POSTAL_CODE] || '';
    row[COLUMNS.REFERRAL_ADDRESS] = expRow[COLUMNS.ADDRESS] || '';
    row[COLUMNS.REFERRAL_STREET] = expRow[COLUMNS.STREET] || '';
  }

  return true;
}

/**
 * 最低賃金を修正する
 * VBAのModule2.最低賃金取得()に相当
 */
function fixMinimumWage(row) {
  const address = row[COLUMNS.ADDRESS] || '';
  const prefecture = extractPrefecture(address);
  
  if (!prefecture) return false;
  
  const minWage = getMinimumWage(prefecture);
  if (!minWage) return false;

  // 最低賃金を設定
  row[COLUMNS.SALARY_MIN] = minWage;
  row[COLUMNS.SALARY_MAX] = minWage;

  return true;
}
