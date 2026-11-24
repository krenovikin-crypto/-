importScripts("endpoint.js","profiles.js");
chrome.action.onClicked.addListener(()=>chrome.runtime.openOptionsPage());
let pendingRefresh,lastRefresh=0;
const installs=new Map();
async function bytes(path,sha){
  const r=await fetch(new URL(path,catalogURL),{cache:"no-cache",credentials:"omit",redirect:"error",signal:AbortSignal.timeout(45000)});
  if(!r.ok)throw Error("Сервер каталога: "+r.status);
  const data=new Uint8Array(await r.arrayBuffer());
  if(sha){
    const hash=Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256",data)),v=>v.toString(16).padStart(2,"0")).join("");
    if(hash!==sha)throw Error("Файл обновляется. Повтори загрузку.");
  }
  return data;
}
async function refresh(force){
  if(!pendingRefresh && (!lastRefresh||force||Date.now()-lastRefresh>60000)){
    pendingRefresh=(async()=>{
      const data=JSON.parse(new TextDecoder().decode(await bytes(catalogURL)));
      if(data.version!==1||!Array.isArray(data.pets)||!data.pets.every(p=>typeof p.name==="string"&&/^[a-z0-9_-]+$/.test(p.id)&&/^[a-z0-9_]{1,25}$/.test(p.channel)&&/^[0-9a-f]{64}$/.test(p.rev)))throw Error("Ошибка формата каталога.");
      const old=(await chrome.storage.local.get(indexKey))[indexKey];
      if(JSON.stringify(old)!==JSON.stringify(data.pets))await chrome.storage.local.set({[indexKey]:data.pets});
      lastRefresh=Date.now();return data.pets;
    })().finally(()=>pendingRefresh=null);
  }
  return pendingRefresh || (await chrome.storage.local.get(indexKey))[indexKey] || [];
}
async function install(id){
  const list=(await chrome.storage.local.get(indexKey))[indexKey]||[];
  const pet=list.find(p=>p.id===id);
  if(!pet)throw Error("Персонаж отсутствует в каталоге.");
  const key="pack/"+pet.rev;
  if(installs.has(key))return installs.get(key);
  const task=(async()=>{
    const saved=(await chrome.storage.local.get(key))[key];
    if(saved)return saved;
    const moves=JSON.parse(new TextDecoder().decode(await bytes("files/"+pet.rev+".json",pet.rev)));
    if(!moves.idle)throw Error("Нет стойки персонажа.");
    for(const move of Object.values(moves)){
      const m=/^([a-f0-9]{64})\.(gif|png|webp)$/.exec(move.file);
      if(!m || !Number.isFinite(move.ms))throw Error("Ошибка описания анимации.");
      const asset="asset/"+move.file;
      if((await chrome.storage.local.getBytesInUse(asset))>0)continue;
      const raw=await bytes("files/"+move.file,m[1]);
      const parts=[];
      for(let i=0;i<raw.length;i+=16384)parts.push(String.fromCharCode(...raw.subarray(i,i+16384)));
      await chrome.storage.local.set({[asset]:"data:image/"+m[2]+";base64,"+btoa(parts.join(""))});
    }
    await chrome.storage.local.set({[key]:moves});return moves;
  })().finally(()=>installs.delete(key));
  installs.set(key,task);return task;
}
chrome.runtime.onMessage.addListener((msg,sender,reply)=>{
  if(sender.id!==chrome.runtime.id||!["refresh","install"].includes(msg?.type))return;
  (msg.type==="refresh"?refresh(false):install(msg.id)).then(value=>reply({ok:true,value}),e=>reply({ok:false,error:e.message}));return true;
});
function schedule(){chrome.alarms.create("catalog-refresh",{periodInMinutes:5});refresh(true).catch(()=>{});}
chrome.runtime.onInstalled.addListener(schedule);
chrome.runtime.onStartup.addListener(schedule);
chrome.alarms.onAlarm.addListener(a=>{if(a.name==="catalog-refresh")refresh(true).catch(()=>{});});
