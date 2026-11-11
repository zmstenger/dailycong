export const FEEDBACK_URL='https://dailycong-feedback.zmstenger.chatgpt.site/vote';
export async function questionKey(q){
 const bytes=new TextEncoder().encode(JSON.stringify([q.title,q.prompt,q.options]));
 return 'q_'+[...new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))].map(b=>b.toString(16).padStart(2,'0')).join('');
}
export async function submitVote(edition,question,voter,vote){
 const response=await fetch(FEEDBACK_URL,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({edition,question,voter,vote}),signal:AbortSignal.timeout(12000)});
 if(!response.ok)throw Error('Vote could not be saved');
 const result=await response.json();
 if(!result.ok||!['like','meh','dislike'].includes(result.vote))throw Error('Invalid vote confirmation');
 return result.vote;
}
