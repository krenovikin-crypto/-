importScripts("endpoint.js","profiles.js");
chrome.action.onClicked.addListener(()=>chrome.runtime.openOptionsPage());
const legacyArt={
  "6dc9fdf5af26b668641d34b2d32849f8b41b69dae1fe7c21e71d8aeaadc3f7f4.gif": {
    "file": "9a8fe52423f694020e3368cf58e0fa060a6a9539e60c131b7f1cbb40339d614b.gif",
    "path": "art/idle.gif"
  },
  "326d3239311c3fe947744d08a4d44ff03318da439bbcdc22b02805506a0e2a77.gif": {
    "file": "e574cb2ece691c2ae3d5e4688421316d01d2066a3e4e969ead4f0864f8010f93.gif",
    "path": "art/caught-left.gif",
    "anchors": [
      [
        0.4115,
        0.6635,
        130
      ],
      [
        0.4062,
        0.6635,
        220
      ],
      [
        0.4062,
        0.6635,
        360
      ],
      [
        0.349,
        0.6683,
        1360
      ],
      [
        0.4062,
        0.6587,
        1500
      ],
      [
        0.4062,
        0.6635,
        1590
      ]
    ]
  },
  "04381d7d245265e6280c94c8dade9e564c82783b9d4a5d8d329a76dd5d10607b.gif": {
    "file": "3d310d51c00121261d15c7b9f16e87f4d6631876b79dfbb07e0ca2ef0342d15d.gif",
    "path": "art/caught-right.gif",
    "anchors": [
      [
        0.5833,
        0.6635,
        130
      ],
      [
        0.5885,
        0.6635,
        220
      ],
      [
        0.5885,
        0.6635,
        360
      ],
      [
        0.6458,
        0.6683,
        1360
      ],
      [
        0.5885,
        0.6587,
        1500
      ],
      [
        0.5885,
        0.6635,
        1590
      ]
    ]
  }
};
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
  const key="pack-v14/"+pet.rev;
  if(installs.has(key))return installs.get(key);
  const task=(async()=>{
    const saved=(await chrome.storage.local.get(key))[key];
    if(saved)return saved;
    const legacyKey="pack/"+pet.rev;
    const moves=(await chrome.storage.local.get(legacyKey))[legacyKey] || JSON.parse(new TextDecoder().decode(await bytes("files/"+pet.rev+".json",pet.rev)));
    delete moves.talking;
    const bundled=new Map();
    for(const move of Object.values(moves)){
      const fix=legacyArt[move.file];
      if(fix){move.file=fix.file;if(fix.anchors)move.anchors=fix.anchors;}
    }
    for(const fix of Object.values(legacyArt))bundled.set(fix.file,fix.path);
    if(!moves.idle)throw Error("Нет стойки персонажа.");
    for(const move of Object.values(moves)){
      const m=/^([a-f0-9]{64})\.(gif|png|webp)$/.exec(move.file);
      if(!m || !Number.isFinite(move.ms))throw Error("Ошибка описания анимации.");
      const asset="asset/"+move.file;
      if((await chrome.storage.local.getBytesInUse(asset))>0)continue;
      const raw=await bytes(bundled.has(move.file)?chrome.runtime.getURL(bundled.get(move.file)):"files/"+move.file,m[1]);
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
