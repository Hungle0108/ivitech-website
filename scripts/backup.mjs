import {getDB,dataDir,mediaDir} from '../lib/db.mjs';
import fs from 'node:fs';import path from 'node:path';import {createHash} from 'node:crypto';
const output=path.resolve(process.argv[2]||path.join(process.cwd(),'backups','ivitech-'+new Date().toISOString().replace(/[:.]/g,'-')));
if(output===dataDir||output.startsWith(dataDir+path.sep))throw new Error('Thư mục sao lưu phải nằm ngoài thư mục dữ liệu.');
if(fs.existsSync(output))throw new Error('Đích sao lưu đã tồn tại. Chọn một thư mục mới.');
fs.mkdirSync(output,{recursive:true});const dbFile=path.join(output,'ivitech.sqlite');
getDB().prepare('VACUUM INTO ?').run(dbFile);
fs.cpSync(mediaDir,path.join(output,'media'),{recursive:true});
const files=[];for(const name of ['ivitech.sqlite',...fs.readdirSync(path.join(output,'media')).map(n=>'media/'+n)]){files.push({path:name,sha256:createHash('sha256').update(fs.readFileSync(path.join(output,name))).digest('hex')});}
fs.writeFileSync(path.join(output,'manifest.json'),JSON.stringify({format:'ivitech-backup-v1',created:new Date().toISOString(),files},null,2));console.log('Đã sao lưu đầy đủ: '+output);

