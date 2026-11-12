'use strict';
const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const PORT = Number(process.env.PORT || 3000);
const HOME = path.join(__dirname, 'public');
const MAX_BODY = 16384;
const rooms = new Map();
const types = new Set(['otter','cat','dog','rabbit','frog','raccoon','duck','snail','fox','penguin']);
const hobbies = new Set(['wine','yarn','running','garden','snorkel','gaming','dancing','singing','snails','reading','napping']);
const snacks = new Set(['crisps','biscuits','chocolate','cake','cheese','popcorn','fruit','pizza','sweets','nuts']);
const moods = new Set(['glowing','good','okay','tired','frazzled','quiet']);
const colors = new Set(['coral','lilac','mint','sky','butter','rose','navy']);
const mime = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'application/javascript; charset=utf-8','.png':'image/png','.svg':'image/svg+xml','.ico':'image/x-icon'};
function roomId(raw){return String(raw||'STAFF1').toUpperCase().replace(/[^A-Z0-9_-]/g,'').slice(0,24)||'STAFF1';}
function getRoom(id){if(!rooms.has(id))rooms.set(id,{boats:[],listeners:new Set()});return rooms.get(id);}
function send(res,status,body){res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','Access-Control-Allow-Origin':'same-origin'});res.end(JSON.stringify(body));}
function readBody(req){return new Promise((resolve,reject)=>{let s='';req.on('data',c=>{s+=c;if(s.length>MAX_BODY){reject(new Error('Request too large'));req.destroy();}});req.on('end',()=>{try{resolve(JSON.parse(s||'{}'));}catch(e){reject(new Error('Invalid JSON'));}});req.on('error',reject);});}
function announce(room){const out=`data: ${JSON.stringify({boats:room.boats})}\n\n`;for(const client of room.listeners){try{client.write(out);}catch(e){room.listeners.delete(client);}}}
const server=http.createServer(async(req,res)=>{
  let url;try{url=new URL(req.url,'http://localhost');}catch(e){return send(res,400,{error:'Invalid URL'});}
  const id=roomId(url.searchParams.get('room'));
  if(url.pathname==='/api/boats' && req.method==='GET')return send(res,200,{boats:getRoom(id).boats});
  if(url.pathname==='/api/events' && req.method==='GET'){
    const room=getRoom(id);
    res.writeHead(200,{'Content-Type':'text/event-stream; charset=utf-8','Cache-Control':'no-cache, no-transform','Connection':'keep-alive','X-Accel-Buffering':'no'});
    res.write(': connected\n\n');
    room.listeners.add(res);
    res.write(`data: ${JSON.stringify({boats:room.boats})}\n\n`);
    const heartbeat=setInterval(()=>{try{res.write(': heartbeat\n\n');}catch(e){}},20000);
    req.on('close',()=>{clearInterval(heartbeat);room.listeners.delete(res);});return;
  }
  if(url.pathname==='/api/join' && req.method==='POST'){
    try{
      const data=await readBody(req);const room=getRoom(id);
      const type=String(data.type||'');const hobby=String(data.hobby||'');const snack=String(data.snack||'');const mood=String(data.mood||'');const color=String(data.color||'');
      const name=String(data.name||'Anonymous').trim().slice(0,24).replace(/[<>]/g,'');
      if(!types.has(type)||!hobbies.has(hobby)||!snacks.has(snack)||!moods.has(mood)||!colors.has(color)||!name)return send(res,400,{error:'Please choose an animal, hobby, snack, boat colour and mood.'});
      const existing=typeof data.id==='string'?room.boats.find(b=>b.id===data.id):null;
      if(!existing && room.boats.length>=300)return send(res,403,{error:'The pond is full (300 boats).'});
      const boat={id:existing?.id||crypto.randomUUID(),type,hobby,snack,mood,color,name,joined:existing?.joined||Date.now(),updated:Date.now()};
      if(existing)Object.assign(existing,boat);else room.boats.push(boat);
      announce(room);return send(res,200,{ok:true,id:boat.id,count:room.boats.length});
    }catch(e){return send(res,400,{error:e.message});}
  }
  if(url.pathname==='/api/reset' && req.method==='POST'){
    // Facilitator controls are convenient but not secured: do not use for sensitive information.
    const room=getRoom(id);room.boats=[];announce(room);return send(res,200,{ok:true});
  }
  if(req.method!=='GET')return send(res,405,{error:'Method not allowed'});
  let file=path.resolve(HOME,'.'+decodeURIComponent(url.pathname==='/'?'/index.html':url.pathname));
  if(!(file===HOME||file.startsWith(HOME+path.sep)))return send(res,403,{error:'Forbidden'});
  fs.readFile(file,(error,bytes)=>{if(error){res.writeHead(404);return res.end('Not found');}res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','Cache-Control':'public, max-age=300'});res.end(bytes);});
});
server.listen(PORT,'0.0.0.0',()=>console.log(`Colleague Mood Pond running on port ${PORT}`));
