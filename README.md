# AT4: 偏好對齊的可重現機制分析與研究簡報 Agent 審計

課程：數據科學前沿分析研究。前沿方向：大型語言模型偏好對齊。

`paper.pdf` 為期末整合論文。研究包括五篇核心方法比較、DPO 目標函數簡化復現、十二組 β/反向標籤權重敏感度實驗，以及研究簡報工具流程的三步／六步比較。十篇文獻見論文。

## 環境與重跑
實測 Windows + Node.js v24.22.3；Node.js 18+，無 npm 依賴、GPU 或 API 金鑰。從倉庫根目錄執行：

```sh
node src/dpo.mjs
node src/sensitivity.mjs
node src/agent/run-agent.mjs
node src/agent/validator.mjs src/agent/runs/max_steps_6
```

前兩項寫入 `results/`；Agent 軌跡、評分及負向測試寫入 `src/agent/runs/` 和 `src/agent/evaluation.csv`。重跑 Agent 會覆寫自己管理的已知結果檔案。無隨機採樣，無需種子。

## 結果與檢查
- DPO：200 更新，β=0.5；loss 0.693147 → 0.042524；梯度誤差約 5.87e-11。
- 敏感度：β={0,0.1,0.5,1}，q={0,0.1,0.3}，共12組。q 是反向偏好的確定性權重；不是抽樣噪聲。CSV 保存每步結果及平均 KL。
- Agent：3步讀2源、1/5分、未產出簡報；6步讀3源、5/5分、完成預算內校驗。兩個破壞性引用／血緣反例被拒絕。

## 範圍與限制
這是四個獨立雙動作 softmax 的目標函數復現，不是 LLM 微調或原論文 benchmark。Agent 是確定性規則控制器與固定模板，不是 LLM Agent；三步／六步對照有構造性。自建來源卡、契約與 validator 不是教師提供材料。驗證器只檢查固定命題及引用血緣，不能保證任意文字真實。不得將本文數字描述為人類偏好勝率。

## 檔案
- `src/dpo.mjs`：手算 margin、有限差分梯度及 DPO 更新。
- `src/sensitivity.mjs`：參數與標籤權重對照。
- `src/agent/`：來源卡、契約、工具、控制器與完整紀錄。
- `results/`：原始 CSV/JSON 與圖表。
- `paper-content.json`：論文可編輯內容。
- `src/build_paper.py`：PDF 生成與版面檢查。
- `presentation-notes.md`：10分鐘展示與5分鐘答辯提綱。

重建 PDF（可選）：Windows 安裝 Microsoft JhengHei 字型，`python -m pip install -r requirements.txt` 後執行 `python src/build_paper.py`。此步才需要 Python 套件；實驗不需要 Python。

倉庫保留原 AT3 材料作歷史證據，AT4 以本 README 的 `src/` 與 `paper.pdf` 為準。倉庫為私有，提交時須給教師存取權。成果使用 AI 協助整理與製作，數值來自實際執行。
