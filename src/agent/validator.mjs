/** Shared final-state audit. Can be run independently: node validator.mjs runs/max_steps_6 */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.dirname(fileURLToPath(import.meta.url));
export function validate(dir){
  const contract=JSON.parse(fs.readFileSync(path.join(root,'task-contract.json'),'utf8'));
  const sources=JSON.parse(fs.readFileSync(path.join(root,'sources.json'),'utf8'));
  const log=path.join(dir,'tool-results.jsonl');
  const observations=fs.existsSync(log)?fs.readFileSync(log,'utf8').trim().split('\n').filter(Boolean).map(JSON.parse):[];
  const reads=new Set(observations.filter(o=>o.tool==='read_source'&&o.ok).map(o=>o.result.id));
  const file=path.join(dir,contract.output);
  const brief=fs.existsSync(file)?fs.readFileSync(file,'utf8'):'';
  const citations=[...brief.matchAll(/\[(S\d+):(C\d+)\]/g)];
  const required=contract.required_source_ids;
  const supported=citations.length===3&&required.every(id=>citations.some(c=>c[1]===id))&&citations.every(c=>{
    const s=sources.find(s=>s.id===c[1]);
    const claim=s?.claims.find(x=>x.id===c[2]);
    return reads.has(c[1])&&claim&&brief.includes(`${claim.text} [${c[1]}:${c[2]}]`)&&brief.includes(s.url);
  });
  const criteria={searched_pack:observations.some(o=>o.tool==='search'&&o.ok&&o.result.length>=3),read_three:required.every(id=>reads.has(id)),brief_present:brief.length>0,citations_supported_by_read_sources:supported,scope_and_length:brief.length>0&&brief.length<=contract.length_limit_characters&&brief.includes('限制')&&brief.includes('建議')};
  return {criteria,score:Object.values(criteria).filter(Boolean).length,max_score:5,pass:Object.values(criteria).every(Boolean),read_sources:[...reads],characters:brief.length,audit_type:'structural; not a semantic or teacher validator'};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  if(!process.argv[2]) throw new Error('Usage: node validator.mjs <run-directory>');
  const result=validate(path.resolve(process.argv[2]));console.log(JSON.stringify(result,null,2));process.exitCode=result.pass?0:1;
}
