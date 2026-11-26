const choice=document.querySelector("#choice"),status=document.querySelector("#status");
let entries=[],busy=false;
function label(id){const p=entries.find(e=>e.id===id);return p?p.name+" · "+p.channel:"";}
async function paint(){
  const state=await chrome.storage.local.get([indexKey,selectionKey]);
  entries=state[indexKey]||[];
  choice.replaceChildren(new Option("Питомец канала","auto"));
  for(const p of entries)choice.add(new Option(label(p.id),p.id));
  choice.add(new Option("Выключить питомцев","off"));
  const selected=state[selectionKey];choice.value=selected==="off"||entries.some(p=>p.id===selected)?selected:"auto";
  choice.disabled=busy||!entries.length;
  const links=document.querySelector("#channels");links.replaceChildren();
  for(const p of entries){const li=document.createElement("li"),a=document.createElement("a");a.href="https://www.twitch.tv/"+p.channel;a.textContent=p.channel;li.append(a," — "+p.name);links.append(li);}
}
async function sync(){
  await paint();
  try{await requestWorker("refresh");await paint();if(!busy)status.textContent="Каталог актуален.";}
  catch(e){status.textContent="Не удалось обновить список. "+(entries.length?"Показан сохранённый каталог.":e.message);}
}
choice.onchange=async()=>{
  const id=choice.value;busy=true;choice.disabled=true;
  try{
    if(entries.some(p=>p.id===id)){status.textContent="Загружаю комплект "+label(id)+"…";await requestWorker("install",id);}
    await chrome.storage.local.set({[selectionKey]:id});status.textContent="Готово. Выбор сохранён.";
  }catch(e){status.textContent="Загрузка не завершена. "+e.message;}
  finally{busy=false;await paint();}
};
chrome.storage.onChanged.addListener((changes,area)=>{if(area==="local"&&(indexKey in changes||selectionKey in changes))paint();});
sync();
async function showPreferences(){
  const prefs=await chrome.storage.local.get(preferenceKeys);
  const slider=document.querySelector("#size"),pixels=document.querySelector("#pixels");
  slider.value=petSize(prefs[sizeKey]);pixels.value=slider.value+" пикс.";
  slider.oninput=()=>{pixels.value=slider.value+" пикс.";chrome.storage.local.set({[sizeKey]:Number(slider.value)});};
  for(const [title,items] of Object.entries(motionGroups)){
    const group=document.createElement("details"),summary=document.createElement("summary");
    summary.textContent=title;group.append(summary);
    for(const [key,name] of Object.entries(items)){
      const label=document.createElement("label"),box=document.createElement("input"),setting=motionPrefix+key;
      box.type="checkbox";box.checked=prefs[setting]!==false;
      box.onchange=()=>chrome.storage.local.set({[setting]:box.checked});
      label.append(box," "+name);group.append(label);
    }
    document.querySelector("#motions").append(group);
  }
}
showPreferences();
