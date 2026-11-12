'use strict';
const $ = id => document.getElementById(id);
const params = new URLSearchParams(location.search);
const room = (params.get('room')||'STAFF1').toUpperCase().replace(/[^A-Z0-9_-]/g,'').slice(0,24)||'STAFF1';
const ANIMALS=[
 {id:'otter',name:'Otter',emoji:'🦦'}, {id:'cat',name:'Cat',emoji:'🐱'},
 {id:'dog',name:'Dog',emoji:'🐶'}, {id:'rabbit',name:'Rabbit',emoji:'🐰'},
 {id:'frog',name:'Frog',emoji:'🐸'}, {id:'raccoon',name:'Raccoon',emoji:'🦝'},
 {id:'duck',name:'Duck',emoji:'🦆'}, {id:'snail',name:'Snail',emoji:'🐌'},
 {id:'fox',name:'Fox',emoji:'🦊'}, {id:'penguin',name:'Penguin',emoji:'🐧'}
];
const HOBBIES=[
 {id:'wine',name:'Wine & unwind',emoji:'🍷'}, {id:'yarn',name:'Knitting & crochet',emoji:'🧶'},
 {id:'running',name:'Running',emoji:'👟'}, {id:'garden',name:'Gardening',emoji:'🌻'},
 {id:'snorkel',name:'Snorkelling',emoji:'🤿'}, {id:'gaming',name:'Gaming',emoji:'🎮'},
 {id:'dancing',name:'Dancing',emoji:'🪩'}, {id:'singing',name:'Singing',emoji:'🎤'},
 {id:'snails',name:'Snail watching',emoji:'🐌'}, {id:'reading',name:'Reading',emoji:'📚'},
 {id:'napping',name:'Napping',emoji:'💤'}
];
const SNACKS=[
 {id:'crisps',name:'Crisps',emoji:'🥔'}, {id:'biscuits',name:'Biscuits',emoji:'🍪'},
 {id:'chocolate',name:'Chocolate',emoji:'🍫'}, {id:'cake',name:'Cake',emoji:'🍰'},
 {id:'cheese',name:'Cheese',emoji:'🧀'}, {id:'popcorn',name:'Popcorn',emoji:'🍿'},
 {id:'fruit',name:'Fruit',emoji:'🍓'}, {id:'pizza',name:'Pizza',emoji:'🍕'},
 {id:'sweets',name:'Sweets',emoji:'🍬'}, {id:'nuts',name:'Nuts',emoji:'🥜'}
];
const MOODS=[['glowing','🌞 Brilliant'],['good','😊 Pretty good'],['okay','🌤️ Getting there'],['tired','🥱 Running low'],['frazzled','🌪️ A bit frazzled'],['quiet','🐌 Taking it slow']];
const COLORS={coral:'#fa8c85',lilac:'#a995e6',mint:'#86d7b6',sky:'#7ac9eb',butter:'#f8c960',rose:'#ef92be',navy:'#6188ba'};
const names={glowing:'Brilliant',good:'Pretty good',okay:'Getting there',tired:'Running low',frazzled:'Frazzled',quiet:'Taking it slow'};
let choice='otter',hobby='yarn',snack='biscuits',mood='good',color='rose',boats=[],myId=null;
try{myId=localStorage.getItem('moodpond-id-'+room)||null;}catch(e){}
const safe=s=>String(s).replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));
const seed=s=>{let h=2166136261;for(let i=0;i<s.length;i++)h=Math.imul(h^s.charCodeAt(i),16777619);return h>>>0};
function boatSvg(t,c,label='',small=false,h='yarn',s='biscuits'){
 const animal=ANIMALS.find(x=>x.id===t)||ANIMALS[0];
 const activity=HOBBIES.find(x=>x.id===h)||HOBBIES[0];
 const treat=SNACKS.find(x=>x.id===s)||SNACKS[0];
 const fill=COLORS[c]||COLORS.rose;
 return `<svg class="boat-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 250 188" role="img" aria-label="${safe(animal.name)} boat with ${safe(activity.name)} and ${safe(treat.name)}">
 <ellipse cx="125" cy="172" rx="105" ry="10" fill="#fff" opacity=".5"/>
 <path d="M25 137Q125 146 225 137L209 164Q126 183 41 164Z" fill="${fill}" stroke="#3b6b7b" stroke-width="3"/>
 <path d="M32 144Q129 151 218 144" stroke="#fff" stroke-width="4" fill="none" opacity=".55"/>
 <ellipse cx="125" cy="136" rx="101" ry="17" fill="#426a80"/><ellipse cx="125" cy="135" rx="94" ry="12" fill="#e6f2dc"/>
 <text x="122" y="116" font-size="79" text-anchor="middle">${animal.emoji}</text>
 <text x="195" y="104" font-size="43" text-anchor="middle" transform="rotate(8 195 104)">${activity.emoji}</text>
 <text x="57" y="106" font-size="36" text-anchor="middle" transform="rotate(-9 57 106)">${treat.emoji}</text>
 <rect x="49" y="143" width="152" height="22" rx="11" fill="#fff7e8" stroke="#e9d8c8" stroke-width="1"/>
 <text x="125" y="158.5" text-anchor="middle" font-size="${label.length>16?12:14}" fill="#31516a" font-weight="bold">${safe(label||animal.name+' boat')}</text>
 </svg>`;
}
function choose(t){choice=t;document.querySelectorAll('[data-choice]').forEach(el=>{let checked=el.dataset.choice===t;el.classList.toggle('selected-choice',checked);el.setAttribute('aria-pressed',checked)});preview()}
function chooseHobby(h){hobby=h;document.querySelectorAll('[data-hobby]').forEach(el=>{let checked=el.dataset.hobby===h;el.classList.toggle('selected-choice',checked);el.setAttribute('aria-pressed',checked)});preview()}
function chooseSnack(s){snack=s;document.querySelectorAll('[data-snack]').forEach(el=>{let checked=el.dataset.snack===s;el.classList.toggle('selected-choice',checked);el.setAttribute('aria-pressed',checked)});preview()}
function chooseMood(m){mood=m;document.querySelectorAll('[data-mood]').forEach(el=>{let checked=el.dataset.mood===m;el.classList.toggle('selected-mood',checked);el.setAttribute('aria-pressed',checked)});preview()}
function chooseColor(c){color=c;document.querySelectorAll('[data-color]').forEach(el=>{let checked=el.dataset.color===c;el.classList.toggle('selected-color',checked);el.setAttribute('aria-pressed',checked)});preview()}
function preview(){$('preview').innerHTML=boatSvg(choice,color,'',false,hobby,snack)}
function setup(){
  $('room-label').textContent=room;$('pond-room').textContent=room;
  $('choices').innerHTML=ANIMALS.map(t=>`<button class="choice" data-choice="${t.id}" aria-pressed="false"><div class="option-emoji">${t.emoji}</div><div class="choice-title">${safe(t.name)}</div></button>`).join('');
  document.querySelectorAll('[data-choice]').forEach(b=>b.addEventListener('click',()=>choose(b.dataset.choice)));
  $('hobbies').innerHTML=HOBBIES.map(t=>`<button class="mini-option" data-hobby="${t.id}" aria-pressed="false"><span>${t.emoji}</span>${safe(t.name)}</button>`).join('');
  document.querySelectorAll('[data-hobby]').forEach(b=>b.addEventListener('click',()=>chooseHobby(b.dataset.hobby)));
  $('snacks').innerHTML=SNACKS.map(t=>`<button class="mini-option" data-snack="${t.id}" aria-pressed="false"><span>${t.emoji}</span>${safe(t.name)}</button>`).join('');
  document.querySelectorAll('[data-snack]').forEach(b=>b.addEventListener('click',()=>chooseSnack(b.dataset.snack)));
  $('moods').innerHTML=MOODS.map(([m,s])=>`<button class="mood" data-mood="${m}" aria-pressed="false">${s}</button>`).join('');
  document.querySelectorAll('[data-mood]').forEach(b=>b.addEventListener('click',()=>chooseMood(b.dataset.mood)));
  $('colors').innerHTML=Object.entries(COLORS).map(([c,hex])=>`<button class="color-dot" style="background:${hex}" data-color="${c}" aria-label="${c}" title="${c}" aria-pressed="false"></button>`).join('');
  document.querySelectorAll('[data-color]').forEach(b=>b.addEventListener('click',()=>chooseColor(b.dataset.color)));
  choose('otter');chooseHobby('yarn');chooseSnack('biscuits');chooseMood('good');chooseColor('rose');
  let root=location.origin+location.pathname;const student=`${root}?view=student&room=${encodeURIComponent(room)}`,host=`${root}?view=host&room=${encodeURIComponent(room)}`;
  $('student-link').value=student;$('host-link').value=host;
  $('copy-student').onclick=()=>copy(student,'copy-student');$('copy-host').onclick=()=>copy(host,'copy-host');
  $('open-pond').onclick=()=>location.href=host;
  $('launch').onclick=join;
  $('fullscreen').onclick=async()=>{try{if(!document.fullscreenElement)await $('pond-frame').requestFullscreen();else await document.exitFullscreen();}catch(e){}};
  $('reset').onclick=async()=>{if(!confirm('Empty every boat from room '+room+'? This cannot be undone.'))return;let response=await fetch('/api/reset?room='+encodeURIComponent(room),{method:'POST'});if(response.ok){$('selected').textContent='The pond is ready for a new crew!';myId=null;try{localStorage.removeItem('moodpond-id-'+room)}catch(e){}}};
  $('tab-join').onclick=()=>show('join');$('tab-pond').onclick=()=>show('pond');$('tab-host').onclick=()=>show('host');
  show((params.get('view')==='host')?'pond':(params.get('view')==='teacher')?'host':'join');
  connect();
}
function show(v){['join','pond','host'].forEach(x=>{$(x+'-view').classList.toggle('hidden',x!==v);$('tab-'+x).classList.toggle('active',x===v)});if(v==='pond')drawBoats()}
async function copy(s,id){try{await navigator.clipboard.writeText(s);$(id).textContent='Copied!';setTimeout(()=>$(id).textContent='Copy',1800)}catch(e){$(id).textContent='Select & copy';$(id).previousElementSibling.select()}}
async function join(){
  const name=$('nickname').value.trim();if(!name){$('feedback').textContent='Pop in a name or nickname first 💛';$('nickname').focus();return}
  $('launch').disabled=true;$('feedback').textContent='Launching…';
  try{const response=await fetch('/api/join?room='+encodeURIComponent(room),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:myId,type:choice,hobby,snack,mood,color,name})});const result=await response.json();if(!response.ok)throw new Error(result.error||'Could not launch');myId=result.id;try{localStorage.setItem('moodpond-id-'+room,myId)}catch(e){}$('feedback').textContent='You’re afloat! 🛶 Your boat is now in the pond.';show('pond')}catch(e){$('feedback').textContent='Oops: '+e.message}finally{$('launch').disabled=false}
}
function connect(){
  if(!('EventSource' in window)){poll();return}
  const es=new EventSource('/api/events?room='+encodeURIComponent(room));
  es.onopen=()=>{$('status').textContent='Pond is live'};
  es.onmessage=e=>{try{const b=JSON.parse(e.data);if(Array.isArray(b.boats))update(b.boats)}catch(x){}};
  es.onerror=()=>{$('status').textContent='Reconnecting…'};
}
async function poll(){try{const r=await fetch('/api/boats?room='+encodeURIComponent(room));if(r.ok){const d=await r.json();update(d.boats);$('status').textContent='Pond is live'}}catch(e){$('status').textContent='Reconnecting…'}setTimeout(poll,4000)}
function update(b){boats=b;$('count').textContent=b.length;drawBoats()}
function drawBoats(){const layer=$('boat-layer');$('empty').style.display=boats.length?'none':'flex';if(!boats.length){layer.innerHTML='';return}
  const areas=[];const width=$('water').clientWidth||1000;const height=$('water').clientHeight||350;
  const cols=Math.max(2,Math.floor(width/155));const rows=Math.max(2,Math.ceil(boats.length/cols));
  const cellW=width/cols,cellH=height/rows;
  const listed=[...boats].sort((a,b)=>a.joined-b.joined);
  layer.innerHTML=listed.map((b,i)=>{const h=seed(b.id),x=(i%cols+.5)*cellW+((h%13)-6)*Math.min(1.9,cellW/70),y=(Math.floor(i/cols)+.5)*cellH+((h%17)-8)*Math.min(1.2,cellH/65);
    return `<button class="boat" data-id="${safe(b.id)}" style="left:${x}px;top:${y}px;--dur:${2.5+(h%17)/10}s" title="${safe(b.name)} — ${safe(names[b.mood]||'')}" aria-label="${safe(b.name)} — ${safe(names[b.mood]||'')}">${boatSvg(b.type,b.color,b.name,false,b.hobby,b.snack)}</button>`}).join('');
  layer.querySelectorAll('[data-id]').forEach(b=>b.onclick=()=>{const p=boats.find(x=>x.id===b.dataset.id);if(p){const t=ANIMALS.find(x=>x.id===p.type),h=HOBBIES.find(x=>x.id===p.hobby),s=SNACKS.find(x=>x.id===p.snack);$('selected').textContent=`${t?.emoji||'🛶'} ${p.name}: ${t?.name||'Animal'} enjoying ${h?.name||'a hobby'} with ${s?.name||'a snack'} — feeling ${names[p.mood]||'good'}!`}})
}
window.addEventListener('resize',()=>{if(!$('pond-view').classList.contains('hidden'))drawBoats()});
setup();
