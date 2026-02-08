'use client';

import { useState, useCallback } from 'react';
import { parseExcelFile } from '@/lib/excelParser';
import { processErrors } from '@/lib/errorProcessor';
import { exportToExcel } from '@/lib/excelExporter';

export default function Home() {
  const [expData, setExpData] = useState(null);
  const [errorData, setErrorData] = useState(null);
  const [expFileName, setExpFileName] = useState('');
  const [errorFileName, setErrorFileName] = useState('');
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [processedData, setProcessedData] = useState(null);

  const handleExpUpload = useCallback(async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setExpFileName(file.name);
    const data = await parseExcelFile(file);
    setExpData(data);
  }, []);

  const handleErrorUpload = useCallback(async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setErrorFileName(file.name);
    const data = await parseExcelFile(file);
    setErrorData(data);
  }, []);

  const handleProcess = useCallback(async () => {
    if (!expData || !errorData) return;
    
    setProcessing(true);
    setResult(null);
    
    try {
      const { processedData: newData, stats } = processErrors(errorData, expData);
      setProcessedData(newData);
      setResult({
        success: true,
        stats
      });
    } catch (error) {
      setResult({
        success: false,
        error: error.message
      });
    } finally {
      setProcessing(false);
    }
  }, [expData, errorData]);

  const handleDownload = useCallback(() => {
    if (!processedData) return;
    
    const timestamp = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);
    const filename = `error_${timestamp}.xlsx`;
    exportToExcel(processedData, filename);
  }, [processedData]);

  const getStep = () => {
    if (result?.success) return 4;
    if (processing) return 3;
    if (expData && errorData) return 3;
    if (expData) return 2;
    return 1;
  };

  const currentStep = getStep();

  return (
    <>
      <header className="page-header">
        <h1>ジョブオプ エラー解消ツール</h1>
        <div className="subtitle">ホットスタッフ向け エラー自動修正ツール</div>
      </header>

      <main className="container">
        {/* ステップ表示 */}
        <div className="steps">
          <div className={`step ${currentStep >= 1 ? 'active' : ''} ${currentStep > 1 ? 'completed' : ''}`}>
            <div className="step-number">1</div>
            <div className="step-title">expインポート</div>
          </div>
          <div className={`step ${currentStep >= 2 ? 'active' : ''} ${currentStep > 2 ? 'completed' : ''}`}>
            <div className="step-number">2</div>
            <div className="step-title">エラーインポート</div>
          </div>
          <div className={`step ${currentStep >= 3 ? 'active' : ''} ${currentStep > 3 ? 'completed' : ''}`}>
            <div className="step-number">3</div>
            <div className="step-title">処理実行</div>
          </div>
          <div className={`step ${currentStep >= 4 ? 'active' : ''}`}>
            <div className="step-number">4</div>
            <div className="step-title">ダウンロード</div>
          </div>
        </div>

        {/* ファイルアップロード */}
        <div className="card">
          <div className="card-title">1. 求人一覧ファイル（exp）をアップロード</div>
          <div 
            className={`upload-area ${expData ? 'has-file' : ''}`}
            onClick={() => document.getElementById('exp-input').click()}
          >
            <input 
              type="file" 
              id="exp-input" 
              accept=".xlsx,.xls,.xlsm"
              onChange={handleExpUpload}
            />
            <div className="upload-label">
              <strong>クリックしてファイルを選択</strong><br />
              またはドラッグ＆ドロップ（.xlsx, .xls, .xlsm）
            </div>
            {expFileName && <div className="file-name">{expFileName}</div>}
          </div>
        </div>

        <div className="card">
          <div className="card-title">2. エラーファイルをアップロード</div>
          <div 
            className={`upload-area ${errorData ? 'has-file' : ''}`}
            onClick={() => document.getElementById('error-input').click()}
          >
            <input 
              type="file" 
              id="error-input" 
              accept=".xlsx,.xls,.xlsm"
              onChange={handleErrorUpload}
            />
            <div className="upload-label">
              <strong>クリックしてファイルを選択</strong><br />
              またはドラッグ＆ドロップ（.xlsx, .xls, .xlsm）
            </div>
            {errorFileName && <div className="file-name">{errorFileName}</div>}
          </div>
        </div>

        {/* 処理ボタン */}
        <div className="button-group">
          <button 
            className="button button-primary"
            onClick={handleProcess}
            disabled={!expData || !errorData || processing}
          >
            {processing ? (
              <>
                <span className="loading"></span>
                処理中...
              </>
            ) : (
              '処理開始'
            )}
          </button>
        </div>

        {/* 結果表示 */}
        {result && (
          <div className="result-area">
            {result.success ? (
              <>
                <div className="message message-success">
                  処理が完了しました。
                </div>
                <div className="result-summary">
                  <div className="result-item">
                    <span className="result-label">処理対象行数</span>
                    <span className="result-value">{result.stats.totalRows}件</span>
                  </div>
                  <div className="result-item">
                    <span className="result-label">住所エラー修正</span>
                    <span className="result-value success">{result.stats.addressFixed}件</span>
                  </div>
                  <div className="result-item">
                    <span className="result-label">紹介先住所修正</span>
                    <span className="result-value success">{result.stats.referralAddressFixed}件</span>
                  </div>
                  <div className="result-item">
                    <span className="result-label">最低賃金修正</span>
                    <span className="result-value success">{result.stats.wageFixed}件</span>
                  </div>
                  <div className="result-item">
                    <span className="result-label">未対応エラー</span>
                    <span className="result-value error">{result.stats.unhandled}件</span>
                  </div>
                </div>
                <div className="button-group">
                  <button 
                    className="button button-primary"
                    onClick={handleDownload}
                  >
                    Excelをダウンロード
                  </button>
                </div>
              </>
            ) : (
              <div className="message message-error">
                エラー: {result.error}
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="page-footer">
        ジョブオプ エラー解消ツール v1.0
      </footer>
    </>
  );
}
