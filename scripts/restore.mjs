import fs from 'node:fs';import path from 'node:path';import {DatabaseSync} from 'node:sqlite';import {createHash} from 'node:crypto';
const source=path.resolve(process.argv[2]||'');if(!process.argv[2])throw new Error('Cần đường dẫn thư mục sao lưu. Hãy dừng ứng dụng trước.');
const target=path.resolve(process.env.IVITECH_DATA_DIR||path.join(process.cwd(),'data'));
if(source===target||source.startsWith(target+path.sep)||target.startsWith(source+path.sep))throw new Error('Thư mục nguồn và đích phải tách biệt.');
if(!process.argv.includes('--app-stopped'))throw new Error('Dừng ứng dụng rồi thêm --app-stopped để xác nhận.');
const manifest=JSON.parse(fs.readFileSync(path.join(source,'manifest.json'),'utf8'));if(manifest.format!=='ivitech-backup-v1')throw new Error('Định dạng sao lưu không hợp lệ.');
for(const f of manifest.files){if(!/^(ivitech\.sqlite|media\/[a-f0-9-]+\.webp)$/.test(f.path))throw new Error('Đường dẫn không hợp lệ.');const p=path.join(source,f.path);if(createHash('sha256').update(fs.readFileSync(p)).digest('hex')!==f.sha256)throw new Error('Sai kiểm tra toàn vẹn: '+f.path);}
const check=new DatabaseSync(path.join(source,'ivitech.sqlite'),{readOnly:true});if(check.prepare('PRAGMA integrity_check').get().integrity_check!=='ok')throw new Error('Cơ sở dữ liệu sao lưu bị lỗi.');check.close();
const stamp=Date.now();const staging=target+'-restore-'+stamp;fs.mkdirSync(staging,{recursive:true});fs.copyFileSync(path.join(source,'ivitech.sqlite'),path.join(staging,'ivitech.sqlite'));fs.mkdirSync(path.join(staging,'media'));for(const f of manifest.files.filter(x=>x.path.startsWith('media/')))fs.copyFileSync(path.join(source,f.path),path.join(staging,f.path));const clean=new DatabaseSync(path.join(staging,'ivitech.sqlite'));clean.exec('DELETE FROM sessions; DELETE FROM limits;');clean.close();
let previous='';if(fs.existsSync(target)){previous=target+'-before-restore-'+stamp;fs.renameSync(target,previous);}try{fs.renameSync(staging,target);}catch(e){if(previous)fs.renameSync(previous,target);throw e;}console.log('Đã khôi phục. Các phiên đăng nhập cũ đã hết hiệu lực.');if(previous)console.log('Bản dữ liệu trước khôi phục: '+previous);

