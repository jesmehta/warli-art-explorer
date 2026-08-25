const express = require('express');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const app = express();
const PORT = process.env.PORT || 3000;
const ROOT = __dirname;
const PROJECT = path.join(ROOT, 'project');
const SOURCE = path.join(PROJECT, 'source');
const CROPS = path.join(PROJECT, 'crops');
const DATA = path.join(PROJECT, 'data');
const CROPS_JSON = path.join(DATA, 'crops.json');
const LABELS_JSON = path.join(DATA, 'labels.json');
const PROJECT_JSON = path.join(DATA, 'project.json');
for (const d of [SOURCE,CROPS,DATA]) fs.mkdirSync(d,{recursive:true});
function readJSON(f, fallback){ try{return JSON.parse(fs.readFileSync(f,'utf8'))}catch{return fallback} }
function writeJSON(f, obj){ fs.writeFileSync(f, JSON.stringify(obj,null,2)); }
if(!fs.existsSync(CROPS_JSON)) writeJSON(CROPS_JSON, []);
if(!fs.existsSync(LABELS_JSON)) writeJSON(LABELS_JSON, {animal:['fish','cow','bird'],activity:['harvest','sleep','selling'],object:[]});
if(!fs.existsSync(PROJECT_JSON)) writeJSON(PROJECT_JSON, {projectName:'Image Atlas',defaultGrid:10});
app.use(express.json({limit:'2mb'}));
app.use(express.static(path.join(ROOT,'public')));
app.use('/source', express.static(SOURCE));
app.use('/crops', express.static(CROPS));
app.get('/api/state', async (req,res)=>{
  const images = fs.readdirSync(SOURCE).filter(f=>/\.jpe?g$/i.test(f));
  const imageData=[];
  for(const filename of images){ try{const m=await sharp(path.join(SOURCE,filename)).metadata(); imageData.push({filename,width:m.width,height:m.height});}catch{} }
  res.json({images:imageData,crops:readJSON(CROPS_JSON,[]),labels:readJSON(LABELS_JSON,{}),project:readJSON(PROJECT_JSON,{defaultGrid:10})});
});
app.post('/api/labels',(req,res)=>{ writeJSON(LABELS_JSON,req.body); res.json({ok:true}); });
app.post('/api/project',(req,res)=>{ writeJSON(PROJECT_JSON,req.body); res.json({ok:true}); });
function clean(s){return String(s||'untagged').trim().toLowerCase().replace(/[^a-z0-9_-]+/g,'-').replace(/^-+|-+$/g,'')||'untagged'}
app.post('/api/crop', async (req,res)=>{
 try{
  const {source,bounds,grid,primaryLabel,labels=[]}=req.body;
  const src=path.join(SOURCE,path.basename(source)); if(!fs.existsSync(src)) return res.status(404).json({error:'Source not found'});
  const meta=await sharp(src).metadata();
  const left=Math.max(0,Math.round(bounds.x*meta.width)), top=Math.max(0,Math.round(bounds.y*meta.height));
  const width=Math.max(1,Math.min(meta.width-left,Math.round(bounds.width*meta.width))), height=Math.max(1,Math.min(meta.height-top,Math.round(bounds.height*meta.height)));
  const records=readJSON(CROPS_JSON,[]); const sourceStem=clean(path.parse(source).name);
  const serial=records.filter(r=>r.source===source).reduce((m,r)=>Math.max(m,r.serial||0),0)+1;
  const id=`${sourceStem}_${String(serial).padStart(3,'0')}`;
  const filename=`${id}_${clean(grid.centre)}_${clean(primaryLabel.category)}_${clean(primaryLabel.tag)}.jpg`;
  await sharp(src).extract({left,top,width,height}).jpeg({quality:95}).toFile(path.join(CROPS,filename));
  const record={id,source,serial,grid,bounds,primaryLabel,labels,filename,createdAt:new Date().toISOString()};
  records.push(record); writeJSON(CROPS_JSON,records); res.json(record);
 }catch(e){res.status(500).json({error:e.message})}
});
app.put('/api/crop/:id',(req,res)=>{ const records=readJSON(CROPS_JSON,[]); const i=records.findIndex(r=>r.id===req.params.id); if(i<0)return res.status(404).json({error:'Not found'}); records[i]={...records[i],...req.body,id:records[i].id}; writeJSON(CROPS_JSON,records); res.json(records[i]); });
app.delete('/api/crop/:id',(req,res)=>{ let records=readJSON(CROPS_JSON,[]); const r=records.find(x=>x.id===req.params.id); if(!r)return res.status(404).json({error:'Not found'}); try{fs.unlinkSync(path.join(CROPS,r.filename))}catch{} records=records.filter(x=>x.id!==req.params.id); writeJSON(CROPS_JSON,records); res.json({ok:true}); });
app.listen(PORT,()=>console.log(`Image Atlas Cropper: http://localhost:${PORT}`));
