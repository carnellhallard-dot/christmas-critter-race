'use strict';
const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const PORT = process.env.PORT || 3000;
const ROOT = path.join(__dirname,'public');
const rooms = new Map();
const MAX_RACERS = 80;
const DEFAULT_DURATION_MS = 30000;
const ANIMALS = ['otter','cat','dog','rabbit','frog','raccoon','duck','snail','penguin','fox','reindeer','bear'];
const OUTFITS = ['santa','elf','tinsel','jumper','antlers','party','scarf','snowman'];
const SNACKS = ['mince pie','cheese','crisps','chocolate','biscuits','pizza','popcorn','cake'];
const VEHICLES = ['sleigh','boat','shopping trolley','skateboard','office chair','teacup','rocket','snailmobile'];
const COLOURS = ['red','green','blue','purple','pink','gold','teal','orange'];
const EVENTS = [
  {title:'💻 BLACKBOARD IS DOWN!',detail:'Have you tried clearing your cache?',kind:'freeze-all'},
  {title:'🚨 FIRE ALARM — CAN YOU PLEASE EXIT THE BUILDING!',detail:'Everyone heads for the nearest available exit! (Fictional game event.)',kind:'reverse-all'},
  {title:'🧶 TINSEL TROUBLE!',detail:'Someone is wrapped up in festive admin.',kind:'slow'},
  {title:'🎁 SECRET SANTA BOOST!',detail:'An unexpected present provides rocket power.',kind:'boost'},
  {title:'☕ THE KETTLE IS BROKEN!',detail:'Emergency tea break.',kind:'slow'},
  {title:'📧 REPLY ALL DISASTER!',detail:'A 47-person email chain strikes again.',kind:'slow'},
  {title:'🖨️ PRINTER JAM!',detail:'A racer is buried in worksheets.',kind:'slow'},
  {title:'📅 SURPRISE TEAMS MEETING!',detail:'You are on mute. Again.',kind:'slow'},
  {title:'🎄 MANDATORY CHRISTMAS FUN!',detail:'Everybody stop and dance!',kind:'freeze-all'},
  {title:'🍪 EMERGENCY SNACK STOP!',detail:'A very important biscuit has appeared.',kind:'slow'},
  {title:'🦌 RUDOLPH ROCKET MODE!',detail:'Reindeer-powered acceleration!',kind:'boost'},
  {title:'❄️ SLIPPERY SITUATION!',detail:'An unexpected icy shortcut!',kind:'boost'},
];
function roomCode(s){return /^[A-Z0-9_-]{1,24}$/.test(s||'')?s:'STAFF1'}
function getRoom(code){code=roomCode(code);if(!rooms.has(code))rooms.set(code,{code,players:[],race:null,created:Date.now()});return rooms.get(code)}
function json(res,status,data){res.writeHead(status,{'content-type':'application/json; charset=utf-8','cache-control':'no-store','access-control-allow-origin':'same-origin'});res.end(JSON.stringify(data))}
function readBody(req){return new Promise((resolve,reject)=>{let s='';req.on('data',c=>{s+=c;if(s.length>12000){reject(new Error('Too large'));req.destroy()}});req.on('end',()=>{try{resolve(JSON.parse(s||'{}'))}catch(e){reject(e)}});req.on('error',reject)})}
function pick(a){return a[Math.floor(Math.random()*a.length)]}
function clamp(n,a,b){return Math.min(b,Math.max(a,n))}
function state(room){let r=room.race;return {room:room.code,players:room.players,race:r?{startAt:r.startAt,durationMs:r.durationMs,events:r.events,frames:r.frames,winner:r.winner,order:r.order}:null,phase:!r?'lobby':Date.now()<r.startAt+r.durationMs?'racing':'finished',serverNow:Date.now(),limit:MAX_RACERS}}
function prepareRace(room,durationMs){
 const players=room.players; const step=500; const ticks=durationMs/step;
 const events=[]; const scheduled=[.16,.33,.5,.67,.84].map(x=>Math.round(durationMs*x/500)*500);
 for(const at of scheduled){let evt=pick(EVENTS);let target=evt.kind.endsWith('all')?null:pick(players).id;events.push({...evt,at,target,targetName:target?players.find(p=>p.id===target).name:null})}
 const frames={}; const factors={}; for(const p of players){frames[p.id]=[0];factors[p.id]=0.75+Math.random()*0.5}
 for(let t=1;t<=ticks;t++){
  const ms=t*step;
  for(const p of players){let speed=factors[p.id]*(0.72+Math.random()*0.62);for(const evt of events){if(ms>=evt.at&&ms<evt.at+Math.min(2700,durationMs*.13)){if(evt.kind==='freeze-all')speed*=0.12;else if(evt.kind==='reverse-all')speed*=0.32;else if(evt.target===p.id&&evt.kind==='slow')speed*=0.12;else if(evt.target===p.id&&evt.kind==='boost')speed*=2.5}}
  frames[p.id].push(frames[p.id][t-1]+Math.max(.02,speed));
  }
 }
 let standings=players.map(p=>({id:p.id,total:frames[p.id][ticks]})).sort((a,b)=>b.total-a.total);let max=standings[0].total;
 // Visually finish together at the bell; standings reflect accumulated travel.
 for(const p of players)frames[p.id]=frames[p.id].map((v,i)=>clamp(100*v/max,0,100));
 return {startAt:Date.now()+3500,durationMs,events,frames,winner:standings[0].id,order:standings.map(x=>x.id)}
}
const MIME={'.html':'text/html; charset=utf-8','.js':'application/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.png':'image/png'};
const server=http.createServer(async(req,res)=>{
 try{
 const u=new URL(req.url,'http://localhost');const route=u.pathname;const room=getRoom(roomCode((u.searchParams.get('room')||'STAFF1').toUpperCase()));
 if(route==='/api/state'&&req.method==='GET')return json(res,200,state(room));
 if(route==='/api/join'&&req.method==='POST'){
  const data=await readBody(req);if(room.race)return json(res,409,{error:'The race is already underway. Ask the host to reset for a new race.'});
  if(room.players.length>=MAX_RACERS)return json(res,409,{error:'The race is full.'});
  let name=String(data.name||'').trim().slice(0,24);if(!name)return json(res,400,{error:'Please enter a nickname.'});
  const valid=(value,arr)=>arr.includes(value)?value:arr[0];
  const p={id:crypto.randomUUID(),name,animal:valid(data.animal,ANIMALS),outfit:valid(data.outfit,OUTFITS),snack:valid(data.snack,SNACKS),vehicle:valid(data.vehicle,VEHICLES),colour:valid(data.colour,COLOURS)};
  room.players.push(p);return json(res,200,{ok:true,player:p});
 }
 if(route==='/api/start'&&req.method==='POST'){
  if(room.race)return json(res,409,{error:'Race already started. Reset first.'});if(room.players.length<2)return json(res,400,{error:'At least two racers are needed.'});
  const seconds=Number((await readBody(req)).durationSeconds);if(!Number.isInteger(seconds)||seconds<15||seconds>120)return json(res,400,{error:'Choose a race duration between 15 and 120 seconds.'});
  room.race=prepareRace(room,seconds*1000);return json(res,200,{ok:true});
 }
 if(route==='/api/reset'&&req.method==='POST'){room.players=[];room.race=null;return json(res,200,{ok:true})}
 if(route.startsWith('/api/'))return json(res,404,{error:'Not found'});
 const file=route==='/'?'index.html':route.slice(1);const full=path.resolve(ROOT,file);if(!full.startsWith(ROOT+path.sep)&&full!==path.join(ROOT,'index.html'))return json(res,403,{error:'Forbidden'});
 fs.readFile(full,(err,contents)=>{if(err){res.writeHead(404);return res.end('Not found')}res.writeHead(200,{'content-type':MIME[path.extname(full)]||'application/octet-stream','cache-control':'no-cache'});res.end(contents)});
 }catch(e){json(res,400,{error:'Could not process request'})}
});
server.listen(PORT,()=>console.log('Christmas Critter Race listening on '+PORT));
