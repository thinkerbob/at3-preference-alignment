import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import assert from 'node:assert/strict';
const out=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../results');
fs.mkdirSync(out,{recursive:true});
const sig=x=>1/(1+Math.exp(-x)), sp=x=>Math.max(x,0)+Math.log1p(Math.exp(-Math.abs(x)));
const rows=[], curves=[];
for(const beta of [0,0.1,0.5,1]) for(const q of [0,0.1,0.3]) {
 const refs=[.3,.4,.6,.7].map(p=>Math.log(p/(1-p)));
 let d=[...refs];
 for(let step=0;step<=200;step++) {
  const m=d.map((x,i)=>beta*(x-refs[i]));
  const mean=a=>a.reduce((x,y)=>x+y,0)/a.length;
  const r={beta,q,step,loss:mean(m.map(x=>(1-q)*sp(-x)+q*sp(x))),mean_margin:mean(m),mean_chosen_probability:mean(d.map(sig)),mean_kl:mean(d.map((x,i)=>{const p=sig(x),r=sig(refs[i]);return p*Math.log(p/r)+(1-p)*Math.log((1-p)/(1-r));}))};
  curves.push(r); if(step===200) rows.push(r);
  if(step<200) d=d.map((x,i)=>x+2*beta*(1-q-sig(m[i]))/4);
 }
}
assert(rows.every(x=>Number.isFinite(x.loss)));
assert(rows.filter(x=>x.beta===0).every(x=>Math.abs(x.loss-Math.log(2))<1e-12));
assert(Math.abs(rows.find(x=>x.beta===.5&&x.q===0).loss-.042523910587)<1e-10);
for(const [name,data] of [['sensitivity.csv',rows],['sensitivity-curves.csv',curves]]) fs.writeFileSync(path.join(out,name),Object.keys(data[0]).join(',')+'\n'+data.map(x=>Object.values(x).join(',')).join('\n')+'\n');
fs.writeFileSync(path.join(out,'sensitivity-provenance.json'),JSON.stringify({runtime:process.version,steps:200,learning_rate:1,n:4,q:'deterministic fractional reversed-label weight, not sampled human annotations',randomness:false,checks_passed:true},null,2));
console.log(JSON.stringify(rows,null,2));
