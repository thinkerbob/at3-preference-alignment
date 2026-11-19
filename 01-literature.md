# ① 文獻綜述：從 RLHF 到直接偏好優化

研究問題：有限計算資源下，如何以可追溯的偏好訊號調整策略，並避免把偏好分數當成事實正確性？選題屬教師池的「LLM 對齊方法」。

## 結構化知識表

| 文獻與會議 | 訓練訊號與方法 | 參考／獎勵模型 | 主要證據 | 批判性判斷與本作業關聯 |
|---|---|---|---|---|
| [1] InstructGPT，NeurIPS 2022 | 示範 SFT、排序學習 reward、PPO 優化 | 使用獎勵與參考約束 | 在論文的人評提示分布上，小型對齊模型可勝過較大未對齊模型 | 標註群體與提示分布限制外推；作為多階段流程基線 |
| [2] DPO，NeurIPS 2023 | chosen/rejected 成對資料；對策略／參考 log-ratio 差做 logistic loss | 固定參考，不另訓 reward | 情感控制、摘要及單輪對話實驗 | 降低訓練流程複雜度不等於消除標註偏差；本次復現其核心損失 |
| [3] ORPO，EMNLP 2024 | 將 SFT 與 odds-ratio 偏好項結合 | 不需參考模型 | 多種尺寸模型與對話評估 | 無參考可減少相關成本，但不能直接推斷所有設定品質更高 |
| [4] KTO，ICML 2024 | desirable/undesirable 二元回饋；前景理論效用 | 原方法仍使用參考分布相關量 | 論文報告 1B–30B 實驗 | 不要求配對可降低資料取得限制，但正負樣本比例與效用設定仍重要 |
| [5] SimPO，NeurIPS 2024 | 長度正規化平均 log-prob 作 reward，加入目標 margin | 不需參考模型 | AlpacaEval 2、MT-Bench、Arena-Hard | 長度控制值得單獨評估；不同資料與模型結果不能直接橫比 |

知識關係：RLHF 多階段優化 → DPO 直接偏好目標 → ORPO／SimPO 探索移除參考；KTO 從另一軸線改變回饋格式。分類軸為「訊號格式、目標函數、參考依賴、評估方式」，不是單一性能排名。

## 一頁摘要正文

語言模型對齊的核心問題，是預測文字的訓練目標與使用者期望並不完全一致。InstructGPT 將示範、偏好排序與強化學習連接起來，說明參數規模之外，回饋和優化方式也會影響指令遵循 [1]。這條路徑涉及多個訓練環節，因此本研究關注後續如何簡化對齊流程。

DPO 利用策略與獎勵之間的關係，把偏好學習轉成基於策略與固定參考分布的分類損失 [2]。本次選它作簡化復現，因為其 margin、損失與梯度可以直接核對，也能承接 W09 已完成的 margin 計算。復現重點是目標是否被正確優化，不將小型數值實驗包裝為語言能力提升。

2024 年的研究沿不同方向推進：ORPO 將偏好項融入 SFT，SimPO 改用長度正規化的策略 log-prob 並設置目標 margin，兩者均不依賴參考模型 [3,5]；KTO 則探索不必配對的二元回饋 [4]。這表明「簡化」既可能指降低模型依賴，也可能指放寬資料格式，不能只用單一排行榜理解其價值。

本文的判斷是，對齊品質必須與證據正確性分開驗證。偏好提升可能反映表達風格，並不自動代表引用可靠。因而三部分以同一問題串連：先整理對齊方法，再驗證 DPO 數學核心，最後用離線來源整理任務檢查簡報、引用與執行軌跡。後續應增加噪聲偏好、未見任務和人工事實審核，而非僅以訓練 loss 下降宣告成功。

## 原始文獻

1. Ouyang et al. (2022). *Training language models to follow instructions with human feedback*. [NeurIPS 原文](https://proceedings.neurips.cc/paper_files/paper/2022/file/b1efde53be364a73914f58805a001731-Paper-Conference.pdf)。定位：§3 訓練流程、§4 評估。
2. Rafailov et al. (2023). *Direct Preference Optimization: Your Language Model is Secretly a Reward Model*. [全文](https://arxiv.org/html/2305.18290v2)。定位：§4 DPO 推導與目標、§5 實驗。
3. Hong, Lee & Thorne (2024). *ORPO: Monolithic Preference Optimization without Reference Model*. [EMNLP 原文](https://aclanthology.org/2024.emnlp-main.626/)。定位：方法中的 odds ratio、聯合損失與實驗。
4. Ethayarajh et al. (2024). *Model Alignment as Prospect Theoretic Optimization*. [ICML 原始出版頁](https://proceedings.mlr.press/v235/ethayarajh24a.html)。本輪已核驗摘要與出版資訊；全文 PDF 讀取失敗，深入閱讀仍待補充，不能視為已完成全文精讀。
5. Meng, Xia & Chen (2024). *SimPO: Simple Preference Optimization with a Reference-Free Reward*. [NeurIPS 原文](https://proceedings.neurips.cc/paper_files/paper/2024/file/e099c1c9699814af0be873a175361713-Paper-Conference.pdf)。定位：§2 長度正規化與 margin、實驗表格。

檢索日期：2026-11-19；以原始會議出版頁／作者論文為依據。各論文的數字不作跨資料集性能排名。
