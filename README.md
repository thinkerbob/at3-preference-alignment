# Preference Alignment Experiments

研究偏好优化的数值机制与离线工具流程的证据完整性。

## 实验

- DPO：四个独立双动作 softmax 策略，包含 margin、有限差分梯度检查及200步优化。
- 敏感度：β={0,0.1,0.5,1}，反向偏好权重 q={0,0.1,0.3}，共12组。
- 工具流程：比较3步和6步预算，保存来源读取、简报、校验与负向测试记录。

## 环境与运行

Node.js 18+，实测 v24.22.3。只使用标准库，无 npm/Python 依赖、GPU 或模型 API。

```sh
node src/dpo.mjs
node src/sensitivity.mjs
node src/agent/run-agent.mjs
node src/agent/validator.mjs src/agent/runs/max_steps_6
```

DPO 和敏感度结果保存在 `results/`。工具轨迹保存在 `src/agent/runs/`，比较汇总见 `src/agent/evaluation.csv`。重跑会覆盖程序管理的结果文件。所有实验均为确定性计算。

## 结果

基准损失由0.693147降至0.042524，梯度误差约5.87e-11。三步流程读取2源、评分1/5；六步流程读取3源并完成简报与校验、评分5/5。

## 方法范围

本项目复现有限动作策略的 DPO 目标函数，不包含语言模型微调。q 为确定性反向偏好权重，不是实测标注错误率。工具控制器采用规则与固定模板，不执行 LLM 推理。校验器检查结构与引用血缘，不保证任意自然语言命题的真实性。来源卡保留原论文链接与 AI 辅助整理的来源记录。

## 目录

- `src/dpo.mjs`：DPO 优化与数值检查。
- `src/sensitivity.mjs`：参数与偏好权重对照。
- `src/agent/`：工具流程、来源和完整运行记录。
- `results/`：CSV、JSON与结果图。

论文与 PDF 文件不纳入仓库。
