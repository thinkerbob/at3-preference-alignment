# 研究簡報：偏好對齊中的參考模型依賴

目的：整理三種直接偏好方法，為低資源復現選擇可核對的切入點。

- DPO 使用偏好對與固定參考策略，直接優化策略的偏好損失，不需另外訓練顯式獎勵模型。 [S1:C1]
- ORPO 將監督微調與 odds-ratio 偏好項結合，不需要額外的參考模型。 [S2:C1]
- SimPO 以回應的平均 token log-probability 作為隱式獎勵，加入目標間隔，且不需參考模型。 [S3:C1]

## 建議（本作業的分析）
先復現 DPO 核心目標並核對梯度，再比較其他目標。這是基於可驗證性的實驗選擇，不代表 DPO 在所有任務最佳。偏好訓練與來源證據校驗應分開評估。

## 限制
來源為 AI 輔助整理的離線中文摘要卡，並非原論文全文。此簡報由固定模板與規則控制器產生，沒有執行 LLM 推理或比較模型性能。

## 引用定位
- S1: DPO：直接偏好優化；Section 4, DPO objective；[原文](https://arxiv.org/html/2305.18290v2)。
- S2: ORPO：無參考模型的聯合偏好優化；Abstract and method: odds-ratio preference objective；[原文](https://aclanthology.org/2024.emnlp-main.626/)。
- S3: SimPO：長度正規化與目標間隔；Section 2, length-normalized reward and target reward margin；[原文](https://proceedings.neurips.cc/paper_files/paper/2024/file/e099c1c9699814af0be873a175361713-Paper-Conference.pdf)。
