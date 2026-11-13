"""Compile factual table cells from audited PDFs. No prose is copied into runtime data."""
import sys, os, json, re, unicodedata
from pathlib import Path
sys.path.insert(0,str(Path(os.environ['TEMP'])/'liu-text-reader'))
from pypdf import PdfReader
from pypdf.generic import ContentStream
ROOT=Path(__file__).resolve().parents[1]
audit=json.loads((ROOT/'docs/academic-document-audit.json').read_text(encoding='utf-8'))
catalog={p['id']:p for p in json.loads((ROOT/'docs/research-programs.json').read_text(encoding='utf-8'))}
def clean(value): return re.sub(r'\s+',' ',unicodedata.normalize('NFKC',str(value))).strip()
def rows_from_pdf(path):
    doc=PdfReader(path)
    for page in doc.pages:
        chunks=[]; lines=[]; x=y=0; last=None; leading=0
        matrix=[1,0,0,1,0,0];stack=[];font=None;maps={}
        for name,resource in page['/Resources'].get('/Font',{}).items():
            unicode_map=resource.get_object().get('/ToUnicode')
            if unicode_map:
                content=unicode_map.get_object().get_data().decode('latin1');mapping={}
                for block in re.findall(r'beginbfchar(.*?)endbfchar',content,re.S):
                    for source,destination in re.findall(r'<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>',block):
                        mapping[bytes.fromhex(source)]=bytes.fromhex(destination).decode('utf-16-be')
                if mapping:maps[name]=mapping
        def decode(value):
            mapping=maps.get(font)
            if not mapping:return str(value)
            try:raw=value.original_bytes
            except AttributeError:raw=bytes(value) if isinstance(value,bytes) else str(value).encode('latin1',errors='replace')
            width=len(next(iter(mapping)))
            return unicodedata.normalize('NFKC',''.join(mapping.get(raw[i:i+width],'�') for i in range(0,len(raw),width)))
        def point(px,py):return (matrix[0]*px+matrix[2]*py+matrix[4],matrix[1]*px+matrix[3]*py+matrix[5])
        for args,op in ContentStream(page.get_contents(),doc).operations:
            if op==b'q':stack.append((matrix[:],font,leading))
            elif op==b'Q':matrix,font,leading=stack.pop() if stack else ([1,0,0,1,0,0],None,0)
            elif op==b'cm':
                a,b,c,d,e,f=map(float,args);m=matrix
                matrix=[m[0]*a+m[2]*b,m[1]*a+m[3]*b,m[0]*c+m[2]*d,m[1]*c+m[3]*d,m[0]*e+m[2]*f+m[4],m[1]*e+m[3]*f+m[5]]
            elif op==b'BT': x=y=0
            elif op==b'Tf':font=args[0]
            elif op==b'TL':leading=float(args[0])
            elif op==b'T*':y-=leading
            elif op==b'Td' or op==b'TD': x+=float(args[0]); y+=float(args[1])
            elif op==b'Tm': x=float(args[4]); y=float(args[5])
            elif op==b'Tj': chunks.append((*point(x,y),clean(decode(args[0]))))
            elif op==b'TJ': chunks.append((*point(x,y),clean(''.join(decode(a) for a in args[0] if isinstance(a,(str,bytes))))))
            elif op==b'm': last=point(float(args[0]),float(args[1]))
            elif op==b're':
                rx,ry,rw,rh=map(float,args)
                if abs(rw)>20 and abs(rh)>2:lines.extend([point(rx,ry)[1],point(rx+rw,ry+rh)[1]])
            elif op==b'l' and last:
                nx,ny=point(*map(float,args))
                if abs(ny-last[1])<.01 and abs(nx-last[0])>20: lines.append(ny)
                last=(nx,ny)
        grouped=[]
        for value in sorted(set(lines),reverse=True):
            if not grouped or abs(grouped[-1][-1]-value)>1: grouped.append([value])
            else: grouped[-1].append(value)
        boundaries=[sum(group)/len(group) for group in grouped]
        columns=None
        # Columns can be recovered from header cells or identical page geometry.
        headers=[(c[0],c[1],'Credits' if c[2]=='Credit' else c[2]) for c in chunks if c[2] in ['Code','Title','Credit','Credits','Prerequisites','Corequisites']]
        if len(set(c[2] for c in headers))==5:
            columns=[min(c[0] for c in headers if c[2]==name) for name in ['Code','Title','Credits','Prerequisites','Corequisites']]
            if columns!=sorted(columns): columns=None
        if not columns: yield {'unparsedPage':True}; continue
        for upper,lower in zip(boundaries,boundaries[1:]):
            cells=['']*5
            for cx,cy,text in sorted(chunks,key=lambda c:(-c[1],c[0])):
                if not text or not lower < cy <= upper: continue
                index=max([i for i,left in enumerate(columns) if cx>=left-2] or [0])
                cells[index]+=' '+text
            cells=[clean(c) for c in cells]
            if any(cells): yield {'cells':cells}
output={}; report=[]
summaries=json.loads((ROOT/'docs/course-description-summaries.json').read_text(encoding='utf-8'))
for item in audit:
    if item['kind'] not in ['contract','plan'] or item['status']!='read': continue
    pid=item['programId']; p=catalog[pid]; target=ROOT/'tmp/pdfs'/f"{pid}-{item['kind']}.pdf"
    parsed=list(rows_from_pdf(target)); courses=[]; terms=[]; year=''; term=None; category=''; skipped=0
    for row in parsed:
        if row.get('unparsedPage'): skipped+=1; continue
        cells=row['cells']; joined=' '.join(cells).strip()
        cells[0]=re.sub(r'(?<=[0-9])\s+(?=[A-Z]$)','',cells[0])
        if re.search(r'\b(?:First|Second|Third|Fourth|Fifth|Sixth) Year\b',joined):
            year=re.search(r'(?:First|Second|Third|Fourth|Fifth|Sixth) Year',joined).group(); continue
        if re.fullmatch(r'(Fall|Spring|Summer) Semester',joined):
            term={'year':year,'semester':joined,'courses':[],'totalCredits':0};terms.append(term);continue
        if cells[0]=='Code' or 'Major Title:' in joined: continue
        if re.fullmatch(r'(?:[A-Z]{3,5}\d{3,4}[A-Z]?)',cells[0]) and re.fullmatch(r'\d+',cells[2]):
            course={'code':cells[0],'name':cells[1],'credits':int(cells[2]),'prerequisites':cells[3],'corequisites':cells[4],'category':category,'description':None}
            if course['name'] and 0<course['credits']<=30:
                courses.append(course)
                if term:term['courses'].append(course)
        elif not cells[0] and 'Elective' in cells[1] and re.fullmatch(r'\d+',cells[2]):
            elective={'code':None,'name':cells[1],'credits':int(cells[2]),'prerequisites':'','corequisites':'','category':category}
            if term:term['courses'].append(elective)
        elif 'Total' in cells[0] or 'Total' in cells[1]:
            if term and cells[2].isdigit():term['totalCredits']=int(cells[2])
        elif len([c for c in cells if c])==1 and re.search(r'Requirements|Electives|Courses',joined):
            category=joined
            if item['kind']=='plan':term=None
    entry=output.setdefault(pid,{'degree':None,'description':None,'courses':[],'plan':[]})
    degree=re.search(r'^\s*((?:Bachelor|Master|Doctor)[^\n]+?\([A-Z0-9]+\))\s*$',item['text'],re.M)
    if degree:entry['degree']=clean(degree.group(1))
    if not entry['degree']:
        for row in parsed:
            heading=clean(' '.join(row.get('cells',[])))
            if re.fullmatch(r'(Bachelor|Master|Doctor|Teaching Diploma).+\([A-Z0-9]+\)',heading):entry['degree']=heading;break
    if item['kind']=='contract':
        for course in courses:course['description']=summaries.get(pid,{}).get(course['code'])
        entry['courses']=courses
    # Publish semester ordering only when every term subtotal and total reconcile.
    valid=bool(terms) and not skipped and all(t['year'] and t['courses'] and sum(c['credits'] for c in t['courses'])==t['totalCredits'] for t in terms) and sum(t['totalCredits'] for t in terms)==p['credits']
    if item['kind']=='plan' and valid:entry['plan']=terms
    report.append({'programId':pid,'kind':item['kind'],'courseRows':len(courses),'unparsedPages':skipped,'semesterPlanValidated':valid if item['kind']=='plan' else None,'terms':[{'year':t['year'],'semester':t['semester'],'published':t['totalCredits'],'extracted':sum(c['credits'] for c in t['courses'])} for t in terms]})
for pid,entry in output.items():
    p=catalog[pid]
    if not entry['courses'] and entry['plan']:
        entry['courses']=list({c['code']:c for term in entry['plan'] for c in term['courses'] if c['code']}.values())
    if not entry['degree'] and re.match(r'Bachelor|Master|Doctor',p['name']):entry['degree']=p['name']
    if entry['courses']:
        subjects=', '.join(c['name'] for c in entry['courses'][:3])
        entry['description']=f"The {p['credits']}-credit curriculum includes {subjects}."
(ROOT/'src/data/publicCurricula.json').write_text(json.dumps(output,ensure_ascii=False,indent=2),encoding='utf-8')
(ROOT/'docs/curriculum-extraction-review.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
print(json.dumps({'programs':len(output),'courses':sum(len(p['courses']) for p in output.values()),'plans':sum(bool(p['plan']) for p in output.values())}))
