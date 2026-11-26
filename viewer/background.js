importScripts("endpoint.js","profiles.js");
chrome.action.onClicked.addListener(()=>chrome.runtime.openOptionsPage());
const legacyArt={
  "6dc9fdf5af26b668641d34b2d32849f8b41b69dae1fe7c21e71d8aeaadc3f7f4.gif": {
    "file": "9a8fe52423f694020e3368cf58e0fa060a6a9539e60c131b7f1cbb40339d614b.gif",
    "path": "art/idle.gif"
  },
  "326d3239311c3fe947744d08a4d44ff03318da439bbcdc22b02805506a0e2a77.gif": {
    "file": "3e8eea6946a867e568039fccf5c76637eaae88f54d6f3d6753635051a94befa0.gif",
    "path": "art/caught-left.gif",
    "anchors": [
      [
        0.4115,
        0.6635,
        130
      ],
      [
        0.4115,
        0.6635,
        220
      ],
      [
        0.4115,
        0.6635,
        360
      ],
      [
        0.4115,
        0.6635,
        1360
      ],
      [
        0.4115,
        0.6635,
        1500
      ],
      [
        0.4115,
        0.6635,
        1590
      ]
    ]
  },
  "04381d7d245265e6280c94c8dade9e564c82783b9d4a5d8d329a76dd5d10607b.gif": {
    "file": "cbe918cd3ac64e05eac8e3750215e4001da38c6cc2b6f69fcbff1062fbec5552.gif",
    "path": "art/caught-right.gif",
    "anchors": [
      [
        0.5833,
        0.6635,
        130
      ],
      [
        0.5833,
        0.6635,
        220
      ],
      [
        0.5833,
        0.6635,
        360
      ],
      [
        0.5833,
        0.6635,
        1360
      ],
      [
        0.5833,
        0.6635,
        1500
      ],
      [
        0.5833,
        0.6635,
        1590
      ]
    ]
  },
  "aa6c49b7637be08b82c6996f1cf6b7fdb2607dd426e9f493ff344e46187be2f8.gif": {
    "file": "c090ac34b5b1c8462b1295f0693c0bc654b367281b8e18313add3a41a7d717e9.gif",
    "path": "art/open.gif",
    "ms": 800
  },
  "15257199a64c4ac10b4686982475a7416ccd450a4949466b8d4c369b25b1c4ba.gif": {
    "file": "54b1d11239dd9493e8de1f09eede76b5756c04242776fcccb82cfb79d3f93cda.gif",
    "path": "art/typing.gif"
  },
  "6823c013dfa128f9a37a6757998b78b66c8a28501b4f9137364764d59df14c03.gif": {
    "file": "7e7124fc8004a7a32292d9c14fd27db1617cb9d42b7981aa1f4041b17a77fea2.gif",
    "path": "art/close.gif",
    "ms": 800
  },
  "3d310d51c00121261d15c7b9f16e87f4d6631876b79dfbb07e0ca2ef0342d15d.gif": {
    "file": "cbe918cd3ac64e05eac8e3750215e4001da38c6cc2b6f69fcbff1062fbec5552.gif",
    "path": "art/caught-right.gif",
    "anchors": [
      [
        0.5833,
        0.6635,
        130
      ],
      [
        0.5833,
        0.6635,
        220
      ],
      [
        0.5833,
        0.6635,
        360
      ],
      [
        0.5833,
        0.6635,
        1360
      ],
      [
        0.5833,
        0.6635,
        1500
      ],
      [
        0.5833,
        0.6635,
        1590
      ]
    ]
  },
  "e574cb2ece691c2ae3d5e4688421316d01d2066a3e4e969ead4f0864f8010f93.gif": {
    "file": "3e8eea6946a867e568039fccf5c76637eaae88f54d6f3d6753635051a94befa0.gif",
    "path": "art/caught-left.gif",
    "anchors": [
      [
        0.4115,
        0.6635,
        130
      ],
      [
        0.4115,
        0.6635,
        220
      ],
      [
        0.4115,
        0.6635,
        360
      ],
      [
        0.4115,
        0.6635,
        1360
      ],
      [
        0.4115,
        0.6635,
        1500
      ],
      [
        0.4115,
        0.6635,
        1590
      ]
    ]
  },
  "393a5d9ff8c21765a42ae02ef0d7f657e8bfe6f967f60764d7ceb887e421cbcc.gif": { "file": "c090ac34b5b1c8462b1295f0693c0bc654b367281b8e18313add3a41a7d717e9.gif", "path": "art/open.gif", "ms": 800 },
  "f9a68ff13fb3ad32abd48f825d8f9becb7b90f0759b3e54f943fc1cdfe45a5b2.gif": { "file": "54b1d11239dd9493e8de1f09eede76b5756c04242776fcccb82cfb79d3f93cda.gif", "path": "art/typing.gif" },
  "c7107bb809713295aad3f2f169aaa5c9c23d309ce8f4a736f7b8215fba2e8368.gif": { "file": "7e7124fc8004a7a32292d9c14fd27db1617cb9d42b7981aa1f4041b17a77fea2.gif", "path": "art/close.gif", "ms": 800 },
  "c0bb37860b1438a89c18758e90b406615c1787595fed6f4c6f1ba626eb8b2676.gif": { "file": "3e8eea6946a867e568039fccf5c76637eaae88f54d6f3d6753635051a94befa0.gif", "path": "art/caught-left.gif" },
  "4a6ab8829cf48711c2bdddc47c3a3051d6b34265f8299b7d7e6fab0ae6948dab.gif": { "file": "cbe918cd3ac64e05eac8e3750215e4001da38c6cc2b6f69fcbff1062fbec5552.gif", "path": "art/caught-right.gif" }
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
  const key="pack-v161/"+pet.rev;
  if(installs.has(key))return installs.get(key);
  const task=(async()=>{
    const saved=(await chrome.storage.local.get(key))[key];
    if(saved)return saved;
    const cachedKeys=["pack-v16/","pack-v14/","pack/"].map(prefix=>prefix+pet.rev);
    const previous=await chrome.storage.local.get(cachedKeys);
    const moves=cachedKeys.map(key=>previous[key]).find(Boolean) || JSON.parse(new TextDecoder().decode(await bytes("files/"+pet.rev+".json",pet.rev)));
    delete moves.talking;
    const bundled=new Map();
    for(const move of Object.values(moves)){
      const fix=legacyArt[move.file];
      if(fix){move.file=fix.file;if(fix.anchors)move.anchors=fix.anchors;if(fix.ms)move.ms=fix.ms;}
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
