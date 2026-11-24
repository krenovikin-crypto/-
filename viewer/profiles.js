const selectionKey="viewer/catalog-choice", indexKey="catalog/list";
function channelPath(path){return /^\/([a-z0-9_]{1,25})\/?$/i.exec(path)?.[1].toLowerCase()||"";}
async function requestWorker(type, id) {
  const result=await chrome.runtime.sendMessage({type,id});
  if(!result?.ok)throw Error(result?.error||"Каталог временно недоступен.");
  return result.value;
}
async function readPet(entry) {
  const moves=await requestWorker("install",entry.id);
  const animations={};
  for(const [key,move] of Object.entries(moves)){
    const k="asset/"+move.file;
    const src=(await chrome.storage.local.get(k))[k];
    if(!src)throw Error("Не удалось прочитать анимацию.");
    animations[key]={...move,src};
  }
  return {name:entry.name,animations,idle:animations.idle.src};
}
