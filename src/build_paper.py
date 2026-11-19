from pathlib import Path
import json,csv
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib import colors
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import SimpleDocTemplate,Paragraph,Spacer,PageBreak,Table,TableStyle,Flowable
from reportlab.lib.enums import TA_JUSTIFY
root=Path(__file__).resolve().parents[1]
font=Path('C:/Windows/Fonts/msjh.ttc')
pdfmetrics.registerFont(TTFont('CJK',str(font),subfontIndex=0))
pdfmetrics.registerFont(TTFont('CJKB','C:/Windows/Fonts/msjhbd.ttc',subfontIndex=0))
styles={
'p':ParagraphStyle('p',fontName='CJK',fontSize=10.5,leading=17,spaceAfter=9,wordWrap='CJK'),
'h':ParagraphStyle('h',fontName='CJKB',fontSize=12,leading=19,spaceBefore=9,spaceAfter=7),
'ref':ParagraphStyle('ref',fontName='CJK',fontSize=9.5,leading=15,spaceAfter=13,wordWrap='CJK'),
'eq':ParagraphStyle('eq',fontName='CJK',fontSize=11,leading=20,spaceAfter=10,leftIndent=12),
'title':ParagraphStyle('title',fontName='CJKB',fontSize=17,leading=25,spaceAfter=14),
'small':ParagraphStyle('small',fontName='CJK',fontSize=9,leading=14,spaceAfter=8,wordWrap='CJK')}
def para(t,style='p'):
 t=t.replace('10⁻¹¹','10^(-11)').replace('10⁻⁶','10^(-6)').replace('10⁻⁸','10^(-8)')
 t=t.translate(str.maketrans({'−':'-','∂':'d','ℓ':'L','ᵢ':'_i','⁻':'-','¹':'1','⁶':'6','⁸':'8','⁰':'0','∈':' in '}))
 return Paragraph(t.replace('&','&amp;').replace('<','&lt;').replace('>','&gt;'),styles[style])
def table(rows,widths=None):
 t=Table([[para(str(c),'small') for c in r] for r in rows],colWidths=widths or [475/len(rows[0])]*len(rows[0]),hAlign='LEFT')
 t.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,0),colors.HexColor('#e7eef5')),('VALIGN',(0,0),(-1,-1),'TOP'),('LINEBELOW',(0,0),(-1,0),.7,colors.HexColor('#53718b')),('LINEBELOW',(0,1),(-1,-1),.25,colors.lightgrey),('TOPPADDING',(0,0),(-1,-1),6),('BOTTOMPADDING',(0,0),(-1,-1),3)]))
 return t
class Chart(Flowable):
 def __init__(self): Flowable.__init__(self); self.width=475; self.height=160
 def draw(self):
  c=self.canv; x,y,w,h=40,24,420,118
  rows=list(csv.DictReader((root/'results/training.csv').open()))
  c.setStrokeColor(colors.lightgrey)
  c.setFont('CJK',8)
  for v in [0,.2,.4,.6]:
   yy=y+h*v/.7;c.line(x,yy,x+w,yy);c.drawRightString(x-5,yy-2,str(v))
  c.setStrokeColor(colors.HexColor('#236c9c'));c.setLineWidth(1.7)
  p=c.beginPath()
  for i,r in enumerate(rows):
   xx=x+w*int(r['step'])/200; yy=y+h*float(r['loss'])/.7
   if i==0:p.moveTo(xx,yy)
   else:p.lineTo(xx,yy)
  c.drawPath(p)
  c.setFillColor(colors.black)
  for v in [0,50,100,150,200]:c.drawCentredString(x+w*v/200,y-13,str(v))
  c.drawString(x,148,'平均 DPO loss');c.drawRightString(x+w,0,'更新步數')
def footer(c,doc):
 c.setFont('CJK',8);c.setFillColor(colors.HexColor('#536779'))
 c.drawString(60,814,'數據科學前沿分析研究 | AT4')
 c.drawRightString(535,28,str(doc.page))
 c.setStrokeColor(colors.lightgrey);c.line(60,803,535,803)
story=[]
for n,page in enumerate(json.loads((root/'paper-content.json').read_text(encoding='utf8'))):
 if n:story.append(PageBreak())
 story.append(para(page['title'],'title'))
 if page.get('subtitle'):story.append(para(page['subtitle'],'small'))
 for typ,value in page['blocks']:
  if typ=='table':story.extend([table(value),Spacer(1,9)])
  elif typ=='chart':story.append(Chart())
  elif typ=='sensitivity':
   rows=list(csv.DictReader((root/'results/sensitivity.csv').open()))
   data=[['β','q','loss','平均 p+','平均 KL']]
   for r in rows:
    if r['beta']=='0' and r['q']!='0':continue
    data.append([r['beta'],'全部' if r['beta']=='0' else r['q']]+[f"{float(r[k]):.4f}" for k in ['loss','mean_chosen_probability','mean_kl']])
   story.extend([table(data),Spacer(1,8)])
  else:story.append(para(value,typ))
SimpleDocTemplate(str(root/'paper.pdf'),pagesize=(595.28,841.89),leftMargin=60,rightMargin=60,topMargin=56,bottomMargin=43,title='偏好對齊的可重現機制分析與研究簡報 Agent 審計',author='數據科學前沿分析研究').build(story,onFirstPage=footer,onLaterPages=footer)
import pypdfium2 as pdfium
from PIL import Image,ImageOps,ImageDraw
pdf=pdfium.PdfDocument(str(root/'paper.pdf'))
qa=root/'qa';qa.mkdir(exist_ok=True)
thumbs=[]
for i,p in enumerate(pdf):
 im=p.render(scale=1.3).to_pil();im.save(qa/f'page-{i+1}.png')
 im.thumbnail((298,421));thumbs.append(im.copy())
sheet=Image.new('RGB',(298*3,445*((len(thumbs)+2)//3)),'#cccccc')
for i,im in enumerate(thumbs):sheet.paste(im,((i%3)*298,(i//3)*445))
sheet.save(qa/'contact.png')
print('pages',len(pdf))
assert 8<=len(pdf)<=10
