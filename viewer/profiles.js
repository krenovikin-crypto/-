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

const motionGroups={
  "Основные": {
    "idle": "Стойка",
    "greeting": "Приветствие",
    "wait": "Ожидание",
    "sad": "Грусть",
    "check-result": "Проверка результата",
    "jump": "Прыжок",
    "run-left": "Бег влево",
    "run-right": "Бег вправо"
  },
  "Реакции": {
    "head-pet": "Поглаживание",
    "tail-reaction": "Реакция на хвост"
  },
  "Ноутбук": {
    "open": "Открыть ноутбук",
    "typing": "Печатать",
    "close": "Закрыть ноутбук"
  },
  "Охота": {
    "notice-left": "Заметить курсор слева",
    "stalk-left": "Охота влево",
    "pounce-left": "Поймать курсор слева",
    "caught-left": "Удержание слева",
    "notice-right": "Заметить курсор справа",
    "stalk-right": "Охота вправо",
    "pounce-right": "Поймать курсор справа",
    "caught-right": "Удержание справа"
  },
  "Отдых": {
    "fall-asleep": "Засыпание",
    "sleep": "Сон"
  },
  "Взгляд за курсором": {
    "gaze-00": "Взгляд 0.0°",
    "gaze-01": "Взгляд 22.5°",
    "gaze-02": "Взгляд 45.0°",
    "gaze-03": "Взгляд 67.5°",
    "gaze-04": "Взгляд 90.0°",
    "gaze-05": "Взгляд 112.5°",
    "gaze-06": "Взгляд 135.0°",
    "gaze-07": "Взгляд 157.5°",
    "gaze-08": "Взгляд 180.0°",
    "gaze-09": "Взгляд 202.5°",
    "gaze-10": "Взгляд 225.0°",
    "gaze-11": "Взгляд 247.5°",
    "gaze-12": "Взгляд 270.0°",
    "gaze-13": "Взгляд 292.5°",
    "gaze-14": "Взгляд 315.0°",
    "gaze-15": "Взгляд 337.5°"
  }
};
const sizeKey="viewer/size", motionPrefix="viewer/motion/";
const preferenceKeys=[sizeKey,...Object.values(motionGroups).flatMap(group=>Object.keys(group).map(key=>motionPrefix+key))];
function petSize(value){return Number.isFinite(value)?Math.min(256,Math.max(48,value)):128;}
