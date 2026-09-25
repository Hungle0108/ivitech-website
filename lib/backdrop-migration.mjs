import fs from 'node:fs';
import path from 'node:path';
export function migrateBackdrops(db,mediaDir){
  if(db.prepare("SELECT value FROM meta WHERE key='backdrop-v1'").get())return;
  const id='44444444-4444-4444-8444-444444444444';
  fs.copyFileSync(path.join(process.cwd(),'public/brand/backdrop-glass-mobile.webp'),path.join(mediaDir,id+'.webp'));
  db.exec('BEGIN IMMEDIATE');
  try{
    const now=new Date().toISOString();
    db.prepare('INSERT OR IGNORE INTO media(id,filename,mime,title,source,width,height,created) VALUES(?,?,?,?,?,?,?,?)').run(id,id+'.webp','image/webp','Backdrop kính mờ — mobile','Ảnh trang trí trừu tượng được tạo cho website, bản tối ưu mobile; không phải ảnh hoạt động thực tế.',720,960,now);
    for(const doc of ['H01','about','ivivi'])for(const lang of ['vi','en']){
      const row=db.prepare('SELECT draft,published FROM translations WHERE document_id=? AND lang=?').get(doc,lang);if(!row)continue;
      const config={backdropEnabled:true,backdropImage:doc==='about'?'':'/api/media/22222222-2222-4222-8222-222222222222',backdropMobileImage:doc==='about'?'':'/api/media/'+id,backdropFallback:doc==='ivivi'?'#F1EEFA':'#F8F9FC',backdropOverlay:'#FFFFFF',backdropX:85,backdropY:50,backdropMobileX:85,backdropMobileY:90,backdropLeft:98,backdropMiddle:92,backdropRight:doc==='ivivi'?75:40};
      const merge=v=>v?JSON.stringify({...config,...JSON.parse(v)}):null;
      db.prepare('INSERT INTO revisions(document_id,lang,data,action,actor,created) VALUES(?,?,?,?,?,?)').run(doc,lang,row.draft,'before-backdrop-v1','system',now);
      db.prepare('UPDATE translations SET draft=?,published=?,version=version+1,updated=? WHERE document_id=? AND lang=?').run(merge(row.draft),merge(row.published),now,doc,lang);
    }
    db.prepare("INSERT INTO meta(key,value) VALUES('backdrop-v1','1')").run();db.exec('COMMIT');
  }catch(e){db.exec('ROLLBACK');throw e;}
}
