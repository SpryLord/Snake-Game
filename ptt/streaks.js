const shift=(date,n)=>{const d=new Date(date+'T12:00:00Z');d.setUTCDate(d.getUTCDate()+n);return d.toISOString().slice(0,10)};
export function streakStats(h,checkins,restorations,today){
 const logs=checkins.filter(c=>c.habit_id===h.id),map=new Map(logs.map(c=>[c.date,c.status])),saved=new Set(restorations.filter(r=>r.habit_id===h.id&&!map.has(r.date)).map(r=>r.date));
 let current=0,key=map.get(today)==='success'?today:shift(today,-1);if(map.get(today)==='missed')key=today;
 while(key>=h.created){if(map.get(key)==='success')current++;else if(!saved.has(key))break;key=shift(key,-1)}
 let best=0,run=0,last='';for(const c of logs.filter(c=>c.status==='success'&&c.date<=today).sort((a,b)=>a.date.localeCompare(b.date))){let connected=!!last;if(last){for(let d=shift(last,1);d<c.date;d=shift(d,1))if(!saved.has(d)){connected=false;break}}run=connected?run+1:1;best=Math.max(best,run);last=c.date}
 const days=Array.from({length:7},(_,i)=>shift(today,i-6)).filter(d=>d>=h.created);return{current,best,total:logs.filter(c=>c.status==='success'&&c.date<=today).length,rate:days.length?Math.round(days.filter(d=>map.get(d)==='success').length/days.length*100):0};
}
export function restoreGap(h,checkins,restorations,today){
 const map=new Map(checkins.filter(c=>c.habit_id===h.id).map(c=>[c.date,c.status])),saved=new Set(restorations.filter(r=>r.habit_id===h.id&&!map.has(r.date)).map(r=>r.date));if(map.get(today)==='missed')return null;
 let key=shift(today,-1),dates=[];const oldest=shift(today,-7);
 while(key>=h.created&&key>=oldest){const status=map.get(key);if(status==='missed')return null;if(status==='success'){if(dates.length)return{dates:dates.sort(),cost:dates.length};}else if(!saved.has(key)){dates.push(key);if(dates.length>2)return null}key=shift(key,-1)}return null;
}
export const previousDay=date=>shift(date,-1);
