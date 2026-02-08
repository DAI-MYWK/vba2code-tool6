import './globals.css';

export const metadata = {
  title: 'ジョブオプ エラー解消ツール',
  description: 'ジョブオプのエラーファイルを自動修正するWebツール',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
