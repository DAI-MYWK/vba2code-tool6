/**
 * 47都道府県の最低賃金マスタ（2025年10月版）
 * VBAの「最賃」シートの内容をJSON化
 */
const minimumWageData = {
  "北海道": 1075,
  "青森県": 1023,
  "岩手県": 1023,
  "宮城県": 1050,
  "秋田県": 1023,
  "山形県": 1023,
  "福島県": 1023,
  "茨城県": 1080,
  "栃木県": 1070,
  "群馬県": 1060,
  "埼玉県": 1141,
  "千葉県": 1140,
  "東京都": 1226,
  "神奈川県": 1225,
  "新潟県": 1040,
  "富山県": 1050,
  "石川県": 1050,
  "福井県": 1040,
  "山梨県": 1040,
  "長野県": 1060,
  "岐阜県": 1060,
  "静岡県": 1090,
  "愛知県": 1140,
  "三重県": 1070,
  "滋賀県": 1070,
  "京都府": 1108,
  "大阪府": 1177,
  "兵庫県": 1110,
  "奈良県": 1040,
  "和歌山県": 1040,
  "鳥取県": 1023,
  "島根県": 1023,
  "岡山県": 1060,
  "広島県": 1100,
  "山口県": 1040,
  "徳島県": 1023,
  "香川県": 1040,
  "愛媛県": 1023,
  "高知県": 1023,
  "福岡県": 1080,
  "佐賀県": 1023,
  "長崎県": 1023,
  "熊本県": 1023,
  "大分県": 1023,
  "宮崎県": 1023,
  "鹿児島県": 1023,
  "沖縄県": 1023
};

/**
 * 住所から都道府県を抽出する
 * @param {string} address - 住所文字列
 * @returns {string|null} 都道府県名
 */
export function extractPrefecture(address) {
  if (!address) return null;
  
  const prefectures = Object.keys(minimumWageData);
  for (const pref of prefectures) {
    if (address.includes(pref)) {
      return pref;
    }
  }
  return null;
}

/**
 * 都道府県から最低賃金を取得する
 * @param {string} prefecture - 都道府県名
 * @returns {number|null} 最低賃金
 */
export function getMinimumWage(prefecture) {
  return minimumWageData[prefecture] || null;
}

export default minimumWageData;
