# ② DPO 核心方法簡化復現

## 方法與範圍
復現 [DPO 原文](https://arxiv.org/html/2305.18290v2) 的直接偏好目標：

`m = beta * (log pi(chosen)/pi(rejected) - log ref(chosen)/ref(rejected))`

`L = log(1 + exp(-m))`

每個 prompt 有兩個候選動作，策略以兩個可訓練 logits 的 softmax 表示。chosen 的 logit 梯度為 `-beta*sigmoid(-m)`，rejected 梯度相反。使用完整批次平均梯度，固定 reference，學習率 1、beta 0.5、200 次更新。四個人工偏好對與 reference 概率寫入 results/data.json，初始化策略等於 reference。

這是真實執行的有限動作策略優化；不是僅代入三個 margin，也不是 LLM 訓練。資料為作者自建，無人類標註實驗。每對獨立參數，因此不能測泛化；所有指標都是訓練集指標。

## 驗證
程式獨立檢查 预设 三例 margin 0.05、-0.04、0.45；以中心有限差分核對解析梯度；檢查 loss 降低。輸出每步 loss、margin、平均 chosen 概率與訓練偏好準確率。準確率定義為 chosen 概率嚴格大於 rejected；平手不算正確。results/summary.json 保存初末值，results/training.csv 保存全程。

## 與原論文比較
| 項目 | 原論文 | 本復現 |
|---|---|---|
| 核心損失 | reference-adjusted preference logistic loss | 保留 |
| 策略 | 自回歸語言模型 | 四個獨立兩動作 softmax |
| 資料 | 情感、摘要、對話等任務 | 四個合成偏好對 |
| 評估 | 任務表現與偏好比較 | 損失、margin、概率、梯度正確性 |
| 可比性 | 語言生成結果 | 僅比較優化機制；不計算相對論文性能提升 |

## 結果解讀與限制
本地 Node.js v24.22.3 實測：loss 從 0.693147 降至 0.042524；平均 margin 從約 0 升至 3.136351；平均 chosen 概率從 0.5 升至 0.997682；訓練偏好準確率從 0.5 升至 1.0。有限差分與解析梯度絕對誤差為 5.87e-11。完整數據見 results/summary.json。

當策略等於 reference，所有 pair 的 DPO margin 都是零，loss 為 ln(2)，即使 reference 已更偏向 chosen 也成立。更新提升相對 log-odds，驗證梯度方向與方法預期一致。乾淨、獨立、可分離偏好會使概率持續趨近 chosen，不能據此證明對齊安全性或實際問答品質。

後續應使用固定小型語言模型與公開偏好資料，分開訓練及測試，納入 SFT baseline、長度與事實性評估。程式與數據收錄於本倉庫。results/evidence 保存原始執行輸出與結果呈現圖；圖片不是桌面終端截圖。


