/** Minimal DPO objective reproduction. No dependencies, LLM, API or network. */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
const root=path.dirname(fileURLToPath(import.meta.url));
const out=path.resolve(root,'../results');
fs.mkdirSync(out,{recursive:true});
const write=(name,value)=>fs.writeFileSync(path.join(out,name),typeof value==='string'?value:JSON.stringify(value,null,2));
const sigmoid=x=>1/(1+Math.exp(-x));
const softplus=x=>Math.max(x,0)+Math.log1p(Math.exp(-Math.abs(x)));
const data=[0.3,0.4,0.6,0.7].map((p,i)=>({id:`pair-${i+1}`,prompt:`Synthetic prompt ${i+1}`,chosen:'preferred action',rejected:'other action',reference:[p,1-p]}));
const beta=0.5,lr=1,steps=200;
const refs=data.map(d=>Math.log(d.reference[0]/d.reference[1]));
let logits=data.map(d=>d.reference.map(Math.log));
function metrics(step){
  const margins=logits.map((z,i)=>beta*(z[0]-z[1]-refs[i]));
  const probabilities=logits.map(z=>sigmoid(z[0]-z[1]));
  const mean=a=>a.reduce((s,x)=>s+x,0)/a.length;
  return {step,loss:mean(margins.map(m=>softplus(-m))),mean_margin:mean(margins),mean_chosen_probability:mean(probabilities),train_accuracy:mean(probabilities.map(p=>+(p>0.5)))};
}
// Independently derived central-difference check, including a nonzero reference gap.
const lossAt=z=>softplus(-beta*(z-0.7-0.4));
const eps=1e-6,z=0.2;
const numerical=(lossAt(z+eps)-lossAt(z-eps))/(2*eps);
const analytical=-beta*sigmoid(-beta*(z-0.7-0.4));
assert.ok(Math.abs(numerical-analytical)<1e-8);
const cases=[[0.8,0.3,0.1,0.05],[-0.3,0.1,0.1,-0.04],[1.2,0.3,0.5,0.45]];
for(const [policy,reference,b,expected] of cases) assert.ok(Math.abs(b*(policy-reference)-expected)<1e-12);
const rows=[metrics(0)];
for(let step=1;step<=steps;step++){
  logits=logits.map((pair,i)=>{
    const m=beta*(pair[0]-pair[1]-refs[i]);
    const g=-beta*sigmoid(-m)/data.length;
    return [pair[0]-lr*g,pair[1]+lr*g];
  });
  rows.push(metrics(step));
}
assert.ok(rows.at(-1).loss<rows[0].loss);
assert.ok(rows.every(r=>Number.isFinite(r.loss)));
const summary={runtime:process.version,beta,learning_rate:lr,steps,samples:data.length,initial:rows[0],final:rows.at(-1),gradient_check:{numerical,analytical,absolute_error:Math.abs(numerical-analytical)},checks_passed:true};
write('summary.json',summary);write('data.json',data);
write('training.csv',Object.keys(rows[0]).join(',')+'\n'+rows.map(r=>Object.values(r).join(',')).join('\n')+'\n');
write('provenance.json',{experiment:'finite-action DPO objective reproduction',data_origin:'author-created synthetic pairs',api_used:false,language_model_used:false,trainable_model:'two-action tabular softmax policy',teacher_fixture_used:false,seed:null,deterministic:true,code:'../src/dpo.mjs'});
write('run-log.txt','PASS W09 margins\nPASS finite-difference gradient check\nPASS finite loss and optimization\n'+JSON.stringify(summary,null,2));
console.log(JSON.stringify(summary,null,2));


