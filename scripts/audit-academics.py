"""Read official curriculum PDFs; retain research evidence outside runtime data."""
import sys, os, json, re, urllib.request, concurrent.futures
from pathlib import Path
sys.path.insert(0, str(Path(os.environ['TEMP']) / 'liu-text-reader'))
from pypdf import PdfReader
from pypdf.generic import ContentStream
ROOT = Path(__file__).resolve().parents[1]
CACHE = ROOT / 'tmp' / 'pdfs'
CACHE.mkdir(parents=True, exist_ok=True)
catalog = json.loads((ROOT / 'docs/research-programs.json').read_text(encoding='utf-8'))
def extract(item):
    p, kind, url = item
    result = {'programId': p['id'], 'kind': kind, 'url': url, 'tables': [], 'text': ''}
    try:
        target = CACHE / (p['id'] + '-' + kind + '.pdf')
        if not target.exists():
            req = urllib.request.Request(url, headers={'User-Agent':'Mozilla/5.0'})
            with urllib.request.urlopen(req, timeout=20) as response:
                content = response.read()
            if not content.startswith(b'%PDF'): raise ValueError('Response is not a PDF')
            target.write_bytes(content)
        document = PdfReader(target)
        for page in document.pages:
            tokens=[]
            for args,op in ContentStream(page.get_contents(),document).operations:
                if op==b'Tj':tokens.append(str(args[0]))
                elif op==b'TJ':tokens.append(''.join(str(a) for a in args[0] if isinstance(a,str)))
            result['text'] += '\n'.join(tokens)+'\n'
        result['pages'] = len(document.pages)
        result['status'] = 'read'
    except Exception as error:
        result['status'] = 'unavailable'
        result['error'] = str(error)
    return result
items = [(p,kind,p[kind]) for p in catalog for kind in ['contract','plan','courses'] if p.get(kind)]
if '--one' in sys.argv: items = [i for i in items if i[0]['id'] == 'engineering-computer-engineering']
results=[]
with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:
    for future in concurrent.futures.as_completed([pool.submit(extract,item) for item in items]):
        results.append(future.result())
        if len(results)%10==0:
            (ROOT/'docs/academic-document-audit.json').write_text(json.dumps(results,ensure_ascii=False,indent=2),encoding='utf-8')
            print(f'Reviewed {len(results)}/{len(items)} documents',flush=True)
(ROOT/'docs/academic-document-audit.json').write_text(json.dumps(results,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps({'documents':len(results),'read':sum(r['status']=='read' for r in results),'tables':sum(len(r['tables']) for r in results)}))
