function startCompanion(host,sprite,pet) {
  const moves=pet.animations, now=()=>performance.now(), clamp=(v,max)=>Math.max(0,Math.min(v,max));
  let x=innerWidth*.23,y=innerHeight-56-host.offsetHeight, cursor=null, caught=null;
  let stillHunt=false;
  let activity=now(), next=activity+1500, typing=0, hunting=0, side="right", action="", until=0, began=0, last=now();
  const events=new AbortController(), opts={signal:events.signal,passive:true,capture:true};
  function play(key,t=now(),length) {
    const m=moves[key];if(!m)return false;
    action=key;began=t;until=t+(length??m.ms);sprite.src=m.src;return true;
  }
  function idle(t){play("idle",t,Infinity);next=t+3000+Math.random()*4000}
  function position(){
    x=clamp(x,innerWidth-host.offsetWidth);y=clamp(y,innerHeight-host.offsetHeight);
    host.style.transform='translate('+x+'px,'+y+'px)';
  }
  function walk(t,dt){
    if(!cursor)return false;
    const dx=cursor.x-(x+host.offsetWidth*.5),dy=cursor.y-(y+host.offsetHeight*.62);
    const dist=Math.hypot(dx,dy);
    if(dist<20){return play("pounce-"+side,t)}
    if(t-hunting>4500)return false;
    const step=Math.min(dist,dt*.27);x+=dx/dist*step;y+=dy/dist*step;position();
    return true;
  }
  function startHunt(t){
    if(!cursor)return false;
    side=cursor.x<x+host.offsetWidth/2?"left":"right";
    if(!moves["stalk-"+side]||!moves["pounce-"+side])return false;
    hunting=t;
    return play("notice-"+side,t)||play("stalk-"+side,t,Infinity);
  }
  function tick(){
    const t=now(),dt=Math.min(140,t-last);last=t;
    if(action.startsWith("caught-")){
      if(!cursor||Math.hypot(cursor.x-caught.x,cursor.y-caught.y)>38){idle(t);return}
      const m=moves[action],a=m.anchors?.find(p=>p[2]>(t-began)%m.ms)||[.55,.66];
      x=cursor.x-a[0]*host.offsetWidth;y=cursor.y-a[1]*host.offsetHeight;position();return;
    }
    if(typing>t && moves.typing && !["open","typing"].includes(action)){
      if(!play("open",t))play("typing",t,Infinity);
    }
    if(action==="typing"){
      if(typing<=t&&!play("close",t))idle(t);return;
    }
    if(action.startsWith("stalk-")){if(!walk(t,dt))idle(t);return}
    if(action.startsWith("run-")||action==="jump"){
      x+=(side==="right"?1:-1)*dt*.085;position();
    }
    if(t>=until){
      if(action==="open"&&typing>t&&play("typing",t,Infinity))return;
      if(action==="open"&&play("close",t))return;
      if(action==="fall-asleep"&&play("sleep",t,Infinity))return;
      if(action.startsWith("notice-")&&play("stalk-"+side,t,Infinity))return;
      if(action.startsWith("pounce-")&&cursor){caught={...cursor};if(play("caught-"+side,t,Infinity))return}
      idle(t);
    }
    if(action!=="idle"&&!action.startsWith("gaze-"))return;
    if(cursor&&!stillHunt&&t-activity>=20000&&t-activity<45000){stillHunt=true;if(startHunt(t))return}
    if(t-activity>45000 && (play("fall-asleep",t)||play("sleep",t,Infinity)))return;
    if(t>=next){
      side=x<innerWidth*.5?"right":"left";
      const choices=["jump","run-"+side,"greeting","wait","sad","check-result","talking"].filter(k=>moves[k]);
      if(!choices.length||Math.random()<.23){
        if(cursor&&startHunt(t))return;
      }
      if(choices.length)play(choices[Math.floor(Math.random()*choices.length)],t);
      else {
        // A single still image is also a usable pet.
        sprite.animate([{transform:"translateY(0)"},{transform:"translateY(-40px)"},{transform:"translateY(0)"}],{duration:800});
      }
      next=t+5000;return;
    }
    if(cursor){
      const dx=cursor.x-x-host.offsetWidth/2,dy=cursor.y-y-host.offsetHeight/2;
      const dir=(Math.round(Math.atan2(dx,-dy)*8/Math.PI)+16)%16;
      const key="gaze-"+String(dir).padStart(2,"0");
      if(Math.hypot(dx,dy)<220&&moves[key]){if(action!==key)play(key,t,Infinity)}
      else if(action.startsWith("gaze-"))play("idle",t,Infinity);
    }
  }
  function wake(){stillHunt=false;activity=now();if(["fall-asleep","sleep"].includes(action))idle(activity)}
  document.addEventListener("pointermove",e=>{cursor={x:e.clientX,y:e.clientY};wake()},opts);
  document.addEventListener("pointerdown",e=>{
    wake();const rect=host.getBoundingClientRect();
    if(e.clientX<rect.left||e.clientX>rect.right||e.clientY<rect.top||e.clientY>rect.bottom)return;
    const fx=(e.clientX-rect.left)/rect.width,fy=(e.clientY-rect.top)/rect.height;
    play(fy<.46?"head-pet":fx>.69?"tail-reaction":"greeting");
  },opts);
  document.addEventListener("input",e=>{if(e.target?.isContentEditable||e.target?.matches?.("textarea,input:not([type=password])")){wake();typing=activity+2500}},opts);
  window.addEventListener("resize",position,opts);
  idle(now());next=now()+1500;position();
  // Keep a single scheduler per visible pet.
  const clock=setInterval(tick,50);
  return ()=>{clearInterval(clock);events.abort()};
}
