export const ZONE='America/New_York';
export function editionDate(now=new Date()){
 const p=Object.fromEntries(new Intl.DateTimeFormat('en-CA',{timeZone:ZONE,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',hourCycle:'h23'}).formatToParts(now).map(p=>[p.type,p.value]));
 return `${p.year}-${p.month}-${p.day}`;
}
export const niceDate=date=>new Intl.DateTimeFormat('en-US',{month:'short',day:'numeric',year:'numeric',timeZone:'UTC'}).format(new Date(`${date}T12:00:00Z`));
export function correct(q,a){return a.length===q.answer.length&&[...a].sort((x,y)=>x-y).every((v,i)=>v===[...q.answer].sort((x,y)=>x-y)[i]);}
export function validateQuiz(qz){
 if(!qz||!/^\d{4}-\d{2}-\d{2}$/.test(qz.date)||!Number.isInteger(qz.edition)||!Array.isArray(qz.questions)||qz.questions.length!==10)throw Error('Invalid daily edition');
 const ids=new Set();for(const q of qz.questions){
  if(!q.id||ids.has(q.id)||!['single','multiple'].includes(q.kind)||!Array.isArray(q.options)||q.options.length<4||q.options.length>5||new Set(q.options).size!==q.options.length||!Array.isArray(q.answer)||q.answer.length!==(q.kind==='multiple'?2:1)||new Set(q.answer).size!==q.answer.length||!q.answer.every(a=>Number.isInteger(a)&&a>=0&&a<q.options.length)||!q.receipts?.length||![q.title,q.prompt,q.explanation,q.category,...q.options].every(s=>typeof s==='string'&&s.length))throw Error('Invalid question');ids.add(q.id);
 }return qz;
}
export function newRecord(q){return {date:q.date,ids:q.questions.map(q=>q.id),answers:[],finishedAt:null};}
export function validRecord(q,r){
 if(!r||r.date!==q.date||JSON.stringify(r.ids)!==JSON.stringify(q.questions.map(q=>q.id))||!Array.isArray(r.answers)||r.answers.length>10)return false;
 return r.answers.every((a,i)=>Array.isArray(a)&&new Set(a).size===a.length&&a.length===q.questions[i].answer.length&&a.every(v=>Number.isInteger(v)&&v>=0&&v<q.questions[i].options.length));
}
export function points(q,r){return r.answers.reduce((n,a,i)=>n+Number(correct(q.questions[i],a)),0);}
export function statistics(history,today){
 const candidates=Object.values(history).filter(r=>r&&r.completed&&Number.isInteger(r.score)&&r.score>=0&&r.score<=10&&/^\d{4}-\d{2}-\d{2}$/.test(r.date)),all=[...new Map(candidates.map(r=>[r.date,r])).values()];
 const days=new Set(all.map(r=>r.date)),cursor=new Date(`${today}T12:00:00Z`);if(!days.has(today))cursor.setUTCDate(cursor.getUTCDate()-1);let streak=0;while(days.has(cursor.toISOString().slice(0,10))){streak++;cursor.setUTCDate(cursor.getUTCDate()-1);}return {played:all.length,best:all.length?Math.max(...all.map(r=>r.score)):null,streak};
}
export function shareDate(date){const d=new Date(`${date}T12:00:00Z`),day=d.getUTCDate(),month=new Intl.DateTimeFormat('en-US',{month:'short',timeZone:'UTC'}).format(d),suffix=day%100>=11&&day%100<=13?'th':({1:'st',2:'nd',3:'rd'}[day%10]||'th');return `${month.replace(/\.$/,'')}. ${day}${suffix}`;}
export function shareScore(q,r,url){const cells=r.answers.map((a,i)=>correct(q.questions[i],a)?'🟩':'⬜'),parsed=new URL(url),address=['is.gd','www.is.gd','v.gd','www.v.gd','tinyurl.com','www.tinyurl.com'].includes(parsed.hostname)?`www.${parsed.hostname.replace(/^www\./,'')}${parsed.pathname}`:url;return `Noodle · DailyCong\n${shareDate(q.date)} · ${points(q,r)}/10\n${cells.slice(0,5).join('')}\n${cells.slice(5,10).join('')}\n${address}`;}
