"""Build static catalog and viewer for a persistent Pages or HTTPS site URL."""
import hashlib
import json
import re
import sys
from pathlib import Path
from urllib.parse import urlsplit
from zipfile import ZipFile, ZIP_DEFLATED

def encode(value):
    return json.dumps(value, ensure_ascii=False, separators=(',', ':')).encode()

def build(root, out, url):
    url=url.rstrip('/')+'/'
    host=urlsplit(url)
    if host.scheme!='https' or not host.hostname or host.username or host.query or host.fragment:
        raise ValueError('Нужен постоянный HTTPS-адрес сайта.')
    objects=out/'files'
    objects.mkdir(parents=True,exist_ok=True)
    catalog=[]
    used=set()
    for folder in sorted((root/'pets').iterdir()):
        if not folder.is_dir(): continue
        with (folder/'pet.json').open(encoding='utf-8-sig') as f: data=json.load(f)
        ident=folder.name
        channel=data['channel'].strip().lower()
        if not re.fullmatch('[a-z0-9_-]+',ident) or ident in ('auto','off') or not re.fullmatch('[a-z0-9_]{1,25}',channel) or channel in used:
            raise ValueError(f'Проверь идентификатор папки и уникальность канала: {ident}, {channel}')
        used.add(channel)
        moves={}
        for key,entry in data['animations'].items():
            asset=(folder/entry['file']).resolve()
            if folder.resolve() not in asset.parents:raise ValueError('Путь вне папки персонажа')
            raw=asset.read_bytes()
            ext=asset.suffix.lower()
            if not (ext=='.gif' and raw[:6] in (b'GIF89a',b'GIF87a') or ext=='.png' and raw.startswith(b'\x89PNG\r\n\x1a\n') or ext=='.webp' and raw[:4]==b'RIFF' and raw[8:12]==b'WEBP'):raise ValueError(f'Ожидается изображение: {asset.name}')
            if not isinstance(entry['ms'],(float,int)) or not 10<=entry['ms']<=3600000:raise ValueError('Проверь ms: '+key)
            digest=hashlib.sha256(raw).hexdigest()
            (objects/(digest+ext)).write_bytes(raw)
            moves[key]={'file':digest+ext,'ms':entry['ms']}
            if 'anchors' in entry:moves[key]['anchors']=entry['anchors']
        if 'idle' not in moves or not data['name'].strip():raise ValueError(f'Нужны имя и idle: {ident}')
        pack=encode(moves)
        rev=hashlib.sha256(pack).hexdigest();(objects/(rev+'.json')).write_bytes(pack)
        catalog.append(dict(id=ident,name=data['name'],channel=channel,rev=rev))
    archive=out/'Twitch-Chibi-Pets-Viewer.zip'
    with ZipFile(archive,'w',ZIP_DEFLATED) as z:
        for f in sorted((root/'viewer').rglob('*')):
            if f.is_file() and f.name!='manifest.json':z.write(f,f.relative_to(root/'viewer'))
        manifest=json.loads((root/'viewer/manifest.json').read_text(encoding='utf-8'))
        manifest['host_permissions']=[f'https://{host.netloc}/*']
        z.writestr('manifest.json',encode(manifest))
        z.writestr('endpoint.js','const catalogURL = '+json.dumps(url+'catalog.json')+';')
    (out/'catalog.json').write_bytes(encode({'version':1,'pets':catalog}))
    (out/'index.html').write_text('<!doctype html><html lang="ru"><meta charset="utf-8"><title>Питомцы Twitch</title><h1>Питомцы Twitch</h1><a href="Twitch-Chibi-Pets-Viewer.zip">Скачать расширение для зрителей</a></html>',encoding='utf-8')
    (out/'.nojekyll').touch()
if __name__=='__main__':
    build(Path(__file__).resolve().parent,Path(sys.argv[1]),sys.argv[2])
