// Apply the requested menu labels once; later CMS edits remain authoritative.
export function migrateNavigation(db) {
  if (db.prepare("SELECT value FROM meta WHERE key='navigation-v3'").get()) return;
  db.exec('BEGIN IMMEDIATE');
  try {
    for (const lang of ['vi', 'en']) {
      const row = db.prepare("SELECT draft,published FROM translations WHERE document_id='site' AND lang=?").get(lang);
      if (!row) continue;
      const patch = lang === 'vi'
        ? {navSolutions:'Sản phẩm',navProjects:'Khách hàng',navResources:'Tài nguyên',navAbout:'Về chúng tôi'}
        : {navSolutions:'Products',navProjects:'Customers',navResources:'Resources',navAbout:'About us'};
      const updated = new Date().toISOString();
      db.prepare('INSERT INTO revisions(document_id,lang,data,action,actor,created) VALUES(?,?,?,?,?,?)').run('site',lang,row.draft,'before-navigation-v3','system',updated);
      const merge = value => value ? JSON.stringify({...JSON.parse(value),...patch}) : null;
      db.prepare("UPDATE translations SET draft=?,published=?,version=version+1,updated=? WHERE document_id='site' AND lang=?").run(merge(row.draft),merge(row.published),updated,lang);
    }
    db.prepare("INSERT INTO meta(key,value) VALUES('navigation-v3','1')").run();
    db.exec('COMMIT');
  } catch (error) { db.exec('ROLLBACK'); throw error; }
}
