(() => {
  const preview=location.href.split(/[?#]/)[0]===chrome.runtime.getURL("preview.html");
  const status=preview ? document.querySelector("#preview-status") : null;
  let login, pet, generation=0, host, stop, loading=false,retry=0;
  let prefs=null;
  function removePet(){
    stop?.();stop=null;host?.remove();host=null;
  }
  function isLive(channel) {
    // Scope evidence to the channel information; sidebar live badges refer to other streamers.
    const panel = document.querySelector('[data-target="channel-header-right"], [data-a-target="channel-header-right"]');
    const info = document.querySelector('.channel-info-content, [data-target="channel-info-content"], [data-a-target="channel-info-content"]');
    const main = document.querySelector('main, [role="main"]');
    if (!main || !main.querySelector('video')) return false;
    const identity = [...main.querySelectorAll('a[href]')].some(a =>
      channelPath(a.pathname)===channel && (a.querySelector('h1') || a.closest('h1, .channel-info-content, [data-target="channel-info-content"], [data-a-target="channel-info-content"]')));
    if (!identity) return false;
    const uptime = main.querySelector('.live-time, [data-a-target="stream-time"]');
    if (uptime && uptime.getClientRects().length) return true;
    const badge = (info || panel)?.querySelector('[data-a-target="live-indicator"], [data-a-target="channel-status-text-indicator"]');
    return !!badge?.getClientRects().length && /^(live|в эфире|en directo|ao vivo|in diretta|en direct)$/i.test(badge.textContent.trim());
  }
  function update() {
    const channel = preview ? "preview" : channelPath(location.pathname);
    if(channel!==login){removePet();login=channel;pet=null;generation++;loading=false;retry=0;}
    if(!prefs||!channel||document.hidden||(!preview&&!isLive(channel))){removePet();return;}
    if(!pet){
      if(loading || Date.now()<retry)return;
      const epoch=generation;loading=true;
      if(status)status.textContent="Загружаю питомца…";
      (async()=>{
        let state=await chrome.storage.local.get([indexKey,selectionKey]);
        if(!state[indexKey]){await requestWorker("refresh");state=await chrome.storage.local.get([indexKey,selectionKey]);}
        const list=state[indexKey]||[],home=preview ? list[0] : list.find(p=>p.channel===channel), choice=state[selectionKey];
        if(!home||choice==="off"){
          if(status&&epoch===generation)status.textContent=choice==="off"?"Питомцы выключены. Выбери персонажа в настройках.":"В каталоге пока нет персонажей.";
          return;
        }
        const loaded=await readPet(list.find(p=>p.id===choice)||home);
        if(epoch===generation){pet=loaded;if(status)status.textContent="На площадке — "+pet.name+".";}
      })().catch(error=>{if(status&&epoch===generation)status.textContent="Не удалось загрузить питомца. "+error.message;}).finally(()=>{if(epoch===generation){loading=false;retry=Date.now()+30000;if(pet)update();}});
      return;
    }
    const parent = document.fullscreenElement || document.documentElement;
    if (host?.parentNode===parent) return;
    removePet();
    host = document.createElement("div");
    host.setAttribute("aria-hidden","true");
    host.style.cssText="all:initial;position:fixed!important;left:0!important;top:0!important;width:min(128px,25vw)!important;aspect-ratio:192/208!important;pointer-events:none!important;z-index:2147483647!important;";
    const sprite=document.createElement("img");sprite.src=pet.idle;
    sprite.style.cssText="display:block;width:100%;height:100%;object-fit:contain;pointer-events:none";
    host.attachShadow({mode:"closed"}).append(sprite);
    parent.append(host);
    setSize();
    stop=startCompanion(host,sprite,pet,prefs);
  }
  function setSize(){ host?.style.setProperty("width",`min(${petSize(prefs[sizeKey])}px,100vw,92vh)`,"important"); }
  chrome.storage.onChanged.addListener((changes,area) => {
    if(area==="local" && prefs){
      for(const k of Object.keys(changes))if(k===sizeKey||k.startsWith(motionPrefix))prefs[k]=changes[k].newValue;
      if(sizeKey in changes){setSize();stop?.position();}
      if(Object.keys(changes).some(k=>k.startsWith(motionPrefix)))stop?.refresh();
    }
    if (area==="local" && (selectionKey in changes || indexKey in changes)) {login=undefined;update();}
  });
  document.addEventListener("visibilitychange",update);
  document.addEventListener("fullscreenchange",update);
  window.addEventListener("popstate",update);
  setInterval(update,900);
  chrome.storage.local.get(preferenceKeys).then(values=>{prefs=values;update()});
})();
