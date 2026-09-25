import updates from './local-reference.seed.json' with {type:'json'};
export function migrateLocalReferences(db){
 const key='local-reference-v1';
 if(db.prepare('SELECT value FROM meta WHERE key=?').get(key))return;
 const now=new Date().toISOString();db.exec('BEGIN IMMEDIATE');
 try{
  for(const patch of updates){
   const row=db.prepare('SELECT data FROM source_catalog WHERE id=?').get(patch.sourceId);
   if(!row)throw new Error('Missing source '+patch.sourceId);
   const data=JSON.parse(row.data);
   db.prepare('INSERT INTO source_history(source_id,data,actor,created) VALUES(?,?,?,?)').run(patch.sourceId,row.data,'local-reference-v1',now);
   const merged={...data,readStatus:'partial',notes:[data.notes,patch.notes].filter(Boolean).join('\n\n'),findings:[data.findings,patch.findings].filter(Boolean).join('\n\n')};
   db.prepare('UPDATE source_catalog SET data=?,version=version+1,updated=? WHERE id=?').run(JSON.stringify(merged),now,patch.sourceId);
  }
  const entries=[
   {id:'smart-ivier',sourceId:'A01',locator:'B.4 — Quy trình triển khai iVier, dòng 91–93 bản TXT; đối chiếu B03 slide 8',vi:['Các bước triển khai','Khảo sát nghiệp vụ; chuẩn hóa dữ liệu và kho tri thức; thiết lập kịch bản và phân quyền; vận hành thử; đánh giá và mở rộng. Phạm vi từng bước được xác định theo nhu cầu và điều kiện của đơn vị.'],en:['Deployment steps','Assess operational needs; standardize data and the knowledge base; configure scenarios and permissions; run a pilot; evaluate and expand. The scope of each step is defined according to the organization’s needs and circumstances.']},
   {id:'ivivi',sourceId:'C01',locator:'III.1 và B.2 — Tiếng Anh Toán – Khoa, dòng 22–37 và 260–295 bản TXT; diễn đạt mục tiêu, không cam kết đầu ra',vi:['Kết nối tiếng Anh với Toán và Khoa học','Hướng học tập này giúp học sinh dùng tiếng Anh để khám phá kiến thức Toán và Khoa học, luyện đọc hiểu, giải thích hiện tượng và trình bày ý tưởng. Hoạt động dự án, thí nghiệm đơn giản và xây dựng mô hình hướng tới phát triển tư duy logic và khả năng ứng dụng ngôn ngữ.'],en:['Connecting English with Mathematics and Science','This learning approach helps students use English to explore Mathematics and Science, practise reading comprehension, explain phenomena and present ideas. Projects, simple experiments and model building aim to develop logical thinking and practical language use.']}
  ];
  for(const entry of entries)for(const lang of ['vi','en']){
   const row=db.prepare('SELECT draft,published FROM translations WHERE document_id=? AND lang=?').get(entry.id,lang);if(!row)continue;
   const apply=raw=>{if(!raw)return null;const d=JSON.parse(raw);const [title,text]=entry[lang];d.blocks=[...(d.blocks||[]),{title,text}];d.sourceRefs=[...(d.sourceRefs||[]),{sourceId:entry.sourceId,locator:entry.locator}];return JSON.stringify(d);};
   db.prepare('INSERT INTO revisions(document_id,lang,data,action,actor,created) VALUES(?,?,?,?,?,?)').run(entry.id,lang,row.draft,'before-local-reference-v1','system',now);
   db.prepare('UPDATE translations SET draft=?,published=?,version=version+1,updated=? WHERE document_id=? AND lang=?').run(apply(row.draft),apply(row.published),now,entry.id,lang);
  }
  db.prepare('INSERT INTO meta(key,value) VALUES(?,?)').run(key,'1');db.exec('COMMIT');
 }catch(error){db.exec('ROLLBACK');throw error;}
}
