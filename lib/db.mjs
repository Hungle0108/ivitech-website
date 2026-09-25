import {migrateSourceContent} from './source-content-migration.mjs';
import {migrateLocalReferences} from './local-reference-migration.mjs';
import sourceCatalog from './source-catalog.seed.json' with {type:'json'};
import {migrateBackdrops} from './backdrop-migration.mjs';
import {DatabaseSync} from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';
import {randomUUID} from 'node:crypto';
import {migrateNavigation} from './navigation-migration.mjs';
import {migrateSupplement} from './supplement.mjs';
import {initialRecords} from './initial-content.mjs';
export const dataDir=path.resolve(process.env.IVITECH_DATA_DIR||path.join(process.cwd(),'data'));
export const mediaDir=path.join(dataDir,'media');
let db;
export function getDB(){
if(db)return db;
fs.mkdirSync(mediaDir,{recursive:true});
db=new DatabaseSync(path.join(dataDir,'ivitech.sqlite'));
db.exec(`PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON; PRAGMA busy_timeout=5000;
CREATE TABLE IF NOT EXISTS documents(id TEXT PRIMARY KEY,kind TEXT NOT NULL,sort INTEGER NOT NULL DEFAULT 0,group_id TEXT NOT NULL DEFAULT '',deleted INTEGER NOT NULL DEFAULT 0,created TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS translations(document_id TEXT NOT NULL REFERENCES documents(id),lang TEXT NOT NULL CHECK(lang IN ('vi','en')),draft TEXT NOT NULL,published TEXT,status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','published','hidden')),version INTEGER NOT NULL DEFAULT 1,updated TEXT NOT NULL,published_at TEXT,PRIMARY KEY(document_id,lang));
CREATE TABLE IF NOT EXISTS revisions(id INTEGER PRIMARY KEY AUTOINCREMENT,document_id TEXT NOT NULL,lang TEXT NOT NULL,data TEXT NOT NULL,action TEXT NOT NULL,actor TEXT NOT NULL,created TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS users(id TEXT PRIMARY KEY,email TEXT NOT NULL UNIQUE,name TEXT NOT NULL,role TEXT NOT NULL CHECK(role IN ('admin','editor','media','viewer')),password TEXT NOT NULL,active INTEGER NOT NULL DEFAULT 1);
CREATE TABLE IF NOT EXISTS sessions(token TEXT PRIMARY KEY,user_id TEXT NOT NULL REFERENCES users(id),csrf TEXT NOT NULL,expires INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS media(id TEXT PRIMARY KEY,filename TEXT NOT NULL,mime TEXT NOT NULL,title TEXT NOT NULL,alt_vi TEXT NOT NULL DEFAULT '',alt_en TEXT NOT NULL DEFAULT '',source TEXT NOT NULL DEFAULT '',focus_x INTEGER DEFAULT 50,focus_y INTEGER DEFAULT 50,width INTEGER,height INTEGER,deleted INTEGER DEFAULT 0,created TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS limits(key TEXT PRIMARY KEY,count INTEGER NOT NULL,until INTEGER NOT NULL);
CREATE INDEX IF NOT EXISTS idx_documents_kind_sort ON documents(kind,deleted,sort);
CREATE INDEX IF NOT EXISTS idx_revisions_document ON revisions(document_id,lang,id);
CREATE TABLE IF NOT EXISTS meta(key TEXT PRIMARY KEY,value TEXT NOT NULL);`);
if(!db.prepare("SELECT value FROM meta WHERE key='seed-v1'").get()){
transaction(()=>{for(const r of initialRecords()){
db.prepare('INSERT OR IGNORE INTO documents(id,kind,sort,group_id,created) VALUES(?,?,?,?,?)').run(r.id,r.kind,r.sort,r.groupId,new Date().toISOString());
const j=JSON.stringify(r.data);db.prepare("INSERT OR IGNORE INTO translations(document_id,lang,draft,published,status,updated,published_at) VALUES(?,?,?,?,'published',?,?)").run(r.id,r.lang,j,j,new Date().toISOString(),new Date().toISOString());
}db.prepare("INSERT INTO meta(key,value) VALUES('seed-v1','1')").run();});
}

if(!db.prepare("SELECT value FROM meta WHERE key='assets-v1'").get()){
const assets=[
{id:'11111111-1111-4111-8111-111111111111',file:'logo-primary.webp',title:'Logo iViTech',vi:'Logo iViTech',en:'iViTech logo',source:'Bộ nhận diện do chủ website cung cấp',width:1200,height:400},
{id:'22222222-2222-4222-8222-222222222222',file:'hero-glass.webp',title:'Nền hero iViTech',vi:'',en:'',source:'Minh họa mới tạo cho website iViTech; không sử dụng tài sản MPT',width:1920,height:1080},
{id:'33333333-3333-4333-8333-333333333333',file:'team-profile.webp',title:'Ảnh đội ngũ từ hồ sơ',vi:'Ảnh đội ngũ trong hồ sơ iViTech',en:'Team image from the iViTech company profile',source:'iViTech Profile 20260905 (11).pdf, trang 17, ảnh X33; không suy đoán danh tính',width:625,height:629}
];
for(const a of assets){const source=path.join(process.cwd(),'public','brand',a.file);if(!fs.existsSync(source))throw new Error('Thiếu tài sản khởi tạo: '+a.file);fs.copyFileSync(source,path.join(mediaDir,a.id+'.webp'));}
transaction(()=>{for(const a of assets)db.prepare('INSERT OR IGNORE INTO media(id,filename,mime,title,alt_vi,alt_en,source,width,height,created) VALUES(?,?,?,?,?,?,?,?,?,?)').run(a.id,a.id+'.webp','image/webp',a.title,a.vi,a.en,a.source,a.width,a.height,new Date().toISOString());
for(const lang of ['vi','en'])for(const [id,key,val,alt] of [
['site','logo','/api/media/'+assets[0].id,''],
['home','image','/api/media/'+assets[1].id,''],
['about','image','/api/media/'+assets[2].id,lang==='vi'?assets[2].vi:assets[2].en]
]){const row=db.prepare('SELECT draft,published FROM translations WHERE document_id=? AND lang=?').get(id,lang);if(!row)continue;const draft=JSON.parse(row.draft),pub=JSON.parse(row.published);draft[key]=val;pub[key]=val;if(key==='image'){draft.alt=alt;pub.alt=alt;}db.prepare('UPDATE translations SET draft=?,published=? WHERE document_id=? AND lang=?').run(JSON.stringify(draft),JSON.stringify(pub),id,lang);}
db.prepare("INSERT INTO meta(key,value) VALUES('assets-v1','1')").run();});
}

migrateSupplement(db);
migrateNavigation(db);
migrateBackdrops(db,mediaDir);
db.exec(`CREATE TABLE IF NOT EXISTS source_catalog(id TEXT PRIMARY KEY,data TEXT NOT NULL,version INTEGER NOT NULL DEFAULT 1,updated TEXT NOT NULL);CREATE TABLE IF NOT EXISTS source_history(id INTEGER PRIMARY KEY AUTOINCREMENT,source_id TEXT NOT NULL,data TEXT NOT NULL,actor TEXT NOT NULL,created TEXT NOT NULL);`);
for(const source of sourceCatalog)db.prepare('INSERT OR IGNORE INTO source_catalog(id,data,updated) VALUES(?,?,?)').run(source.sourceId,JSON.stringify(source),new Date().toISOString());
migrateSourceContent(db);
migrateLocalReferences(db);
return db;
}
export function transaction(fn){const d=db||getDB();d.exec('BEGIN IMMEDIATE');try{const result=fn();d.exec('COMMIT');return result;}catch(e){d.exec('ROLLBACK');throw e;}}
export function all(sql,...p){return getDB().prepare(sql).all(...p);}
export function one(sql,...p){return getDB().prepare(sql).get(...p);}
export function run(sql,...p){return getDB().prepare(sql).run(...p);}
export const now=()=>new Date().toISOString();
export const uid=()=>randomUUID();
export function documents(lang,preview=false){return all(`SELECT d.*,t.lang,t.${preview?'draft':'published'} as data,t.status,t.version,t.updated,t.published_at FROM documents d JOIN translations t ON t.document_id=d.id WHERE d.deleted=0 AND t.lang=? ${preview?'':"AND t.status='published' AND t.published IS NOT NULL"} ORDER BY d.sort,d.created`,lang).map(x=>{const data=JSON.parse(x.data);if(!preview){delete data.source;delete data.sourceRefs;if(data.method&&(data.method.status!=='published'||!data.method.programScope?.trim()))delete data.method;}const imageId=data.image?.split('/').pop();const media=imageId?one('SELECT focus_x,focus_y FROM media WHERE id=?',imageId):null;if(media)data.imageFocus=media.focus_x+'% '+media.focus_y+'%';return {...x,data};});}
export function adminDocuments(){return all('SELECT * FROM documents ORDER BY sort,created').map(d=>({...d,translations:Object.fromEntries(all('SELECT * FROM translations WHERE document_id=?',d.id).map(t=>[t.lang,{...t,draft:JSON.parse(t.draft),published:t.published?JSON.parse(t.published):null}]))}));}
export function record(id,lang,preview=false){return documents(lang,preview).find(x=>x.id===id);}
export function audit(id,lang,data,action,actor){run('INSERT INTO revisions(document_id,lang,data,action,actor,created) VALUES(?,?,?,?,?,?)',id,lang,JSON.stringify(data),action,actor,now());}
export function limited(key,max,seconds){const t=Date.now();return transaction(()=>{const old=one('SELECT * FROM limits WHERE key=?',key);if(!old||old.until<t){run('INSERT OR REPLACE INTO limits(key,count,until) VALUES(?,1,?)',key,t+seconds*1000);return false;}run('UPDATE limits SET count=count+1 WHERE key=?',key);return old.count>=max;});}

