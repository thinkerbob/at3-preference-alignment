/** Deterministic reactive tool controller; no model/API calls or claimed hidden reasoning. */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {validate} from './validator.mjs';
const root=path.dirname(fileURLToPath(import.meta.url));
const load=name=>JSON.parse(fs.readFileSync(path.join(root,name),'utf8'));
const contract=load('task-contract.json');
const hash=file=>crypto.createHash('sha256').update(fs.readFileSync(path.join(root,file))).digest('hex');
const hashes=Object.fromEntries(['sources.json','task-contract.json','tool-schema.json','validator.mjs','run-agent.mjs'].map(f=>[f,hash(f)]));
const save=(file,value)=>fs.writeFileSync(file,typeof value==='string'?value:JSON.stringify(value,null,2));
function run(maxSteps){
  const dir=path.join(root,'runs',`max_steps_${maxSteps}`);fs.mkdirSync(dir,{recursive:true});
  // Clear only this runner's named outputs to prevent stale results on reruns.
  for(const name of ['final-brief.md','trajectory.jsonl','tool-results.jsonl']){const p=path.join(dir,name);if(fs.existsSync(p))fs.unlinkSync(p);}
  const append=(name,obj)=>fs.appendFileSync(path.join(dir,name),JSON.stringify(obj)+'\n');
  let found=null,read=[],written=false,completed=false,calls=0;
  while(calls<maxSteps&&!completed){
    // The next action depends on prior observations, with a fixed deterministic policy.
    const action=!found?{tool:'search',args:{query:contract.query}}:read.length<3?{tool:'read_source',args:{id:found.find(s=>!read.some(r=>r.id===s.id))?.id}}:!written?{tool:'write_brief',args:{}}:{tool:'validate',args:{}};
    const id=`call-${++calls}`;
    append('trajectory.jsonl',{call_id:id,step:calls,...action,controller:'deterministic_state_machine'});
    let result,ok=true;
    try{
      if(action.tool==='search'){
        found=load('sources.json').filter(s=>s.keywords.includes(action.args.query)).map(({id,title})=>({id,title}));result=found;
      }else if(action.tool==='read_source'){
        if(!found.some(s=>s.id===action.args.id))throw new Error('Source id not in search observation');
        result=load('sources.json').find(s=>s.id===action.args.id);if(!result)throw new Error('Missing source');read.push(result);
      }else if(action.tool==='write_brief'){
        if(read.length!==3)throw new Error('Three source observations required');
        const brief='# 研究簡報：偏好對齊中的參考模型依賴\n\n'+
          '目的：整理三種直接偏好方法，為低資源復現選擇可核對的切入點。\n\n'+
          read.map(s=>`- ${s.claims[0].text} [${s.id}:${s.claims[0].id}]`).join('\n')+
          '\n\n## 建議（本作業的分析）\n先復現 DPO 核心目標並核對梯度，再比較其他目標。這是基於可驗證性的實驗選擇，不代表 DPO 在所有任務最佳。偏好訓練與來源證據校驗應分開評估。\n\n## 限制\n來源為 AI 輔助整理的離線中文摘要卡，並非原論文全文。此簡報由固定模板與規則控制器產生，沒有執行 LLM 推理或比較模型性能。\n\n## 引用定位\n'+
          read.map(s=>`- ${s.id}: ${s.title}；${s.locator}；[原文](${s.url})。`).join('\n')+'\n';
        save(path.join(dir,'final-brief.md'),brief);written=true;result={path:'final-brief.md',characters:brief.length};
      }else {result=validate(dir);completed=result.pass;}
    }catch(error){ok=false;result={error:error.message};}
    append('tool-results.jsonl',{call_id:id,tool:action.tool,ok,result});
    if(!ok)break;
  }
  const audit=validate(dir);
  save(path.join(dir,'validation.json'),{...audit,agent_called_validator:completed,external_audit:true});
  save(path.join(dir,'provenance.json'),{runtime:process.version,controller:'self-authored deterministic tool loop',source_pack:'AI-assisted paraphrase cards verified against original publications in prior research',teacher_fixture:false,model_used:false,api_used:false,network_used_during_run:false,ai_assisted_authoring:true,max_steps:maxSteps,hashes});
  save(path.join(dir,'error-note.md'),audit.pass?'# Error note\n本地結構校驗通過；尚未經教師 validator 或人工語義審核。\n':'# Error note\n預算在 search 與兩次 read_source 後耗盡；第三來源未讀，簡報未寫，Agent 未呼叫 validator。不得把外部審核記為 Agent 工具調用。\n');
  return {max_steps:maxSteps,tool_calls:calls,read_sources:audit.read_sources.length,score:audit.score,final_state_pass:audit.pass,agent_called_validator:completed};
}
const rows=[run(3),run(6)];
save(path.join(root,'evaluation.csv'),Object.keys(rows[0]).join(',')+'\n'+rows.map(r=>Object.values(r).join(',')).join('\n')+'\n');
// Publish the complete run as the top-level deliverable; retain both original runs.
for(const name of ['final-brief.md','trajectory.jsonl','tool-results.jsonl','provenance.json','error-note.md'])fs.copyFileSync(path.join(root,'runs','max_steps_6',name),path.join(root,name));
// Negative controls ensure invalid final evidence is not accepted.
const checkDir=path.join(root,'runs','validator-tests');fs.mkdirSync(checkDir,{recursive:true});
fs.copyFileSync(path.join(root,'tool-results.jsonl'),path.join(checkDir,'tool-results.jsonl'));
const good=fs.readFileSync(path.join(root,'final-brief.md'),'utf8');
save(path.join(checkDir,'final-brief.md'),good.replace('[S1:C1]','[S9:C1]'));assert.equal(validate(checkDir).pass,false);
save(path.join(checkDir,'final-brief.md'),good);save(path.join(checkDir,'tool-results.jsonl'),'');assert.equal(validate(checkDir).pass,false);
save(path.join(root,'validator-tests.json'),{invalid_citation_rejected:true,unread_sources_rejected:true});
console.log(JSON.stringify({runs:rows,negative_controls:'PASS'},null,2));
