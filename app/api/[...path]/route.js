import {all,one,run,transaction,adminDocuments,documents,audit,now,uid,limited,mediaDir} from '@/lib/db.mjs';
import {sessionFromCookie,allowed,passwordMatches,createSession,cookie,cookieName,hash,createUser} from '@/lib/auth.mjs';
import {validateContent,kinds} from '@/lib/validation.mjs';
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
export const runtime='nodejs';
export const dynamic='force-dynamic';
const fail=(message,status=400)=>{throw Object.assign(new Error(message),{status})};
const json=(data,status=200,headers={})=>Response.json(data,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff',...headers}});
async function body(req){if(Number(req.headers.get('content-length'))>524288)fail('Nội dung quá lớn.',413);const s=await req.text();if(Buffer.byteLength(s)>524288)fail('Nội dung quá lớn.',413);try{return JSON.parse(s)}catch{fail('Dữ liệu không hợp lệ.')}}
function requireCap(user,cap){if(!user)fail('Vui lòng đăng nhập.',401);if(!allowed(user,cap))fail('Tài khoản không có quyền thực hiện thao tác này.',403);}
function originCheck(req){const origin=req.headers.get('origin');const expected=process.env.SITE_URL||'http://127.0.0.1:3187';if(origin!==expected)fail('Nguồn yêu cầu không hợp lệ.',403);}
function csrfCheck(req,user){if(!user||req.headers.get('x-csrf-token')!==user.csrf)fail('Phiên thao tác hết hạn. Vui lòng tải lại trang.',403);}
function snapshot(id){return adminDocuments().find(d=>d.id===id)}
function collision(id,lang,data,kind){if(!data.slug)return;for(const x of all('SELECT d.id,d.kind,t.draft,t.published FROM documents d JOIN translations t ON d.id=t.document_id WHERE t.lang=? AND d.deleted=0 AND d.id<>?',lang,id)){if(x.kind!==kind)continue;if([x.draft,x.published].filter(Boolean).some(j=>JSON.parse(j).slug===data.slug))fail('Đường dẫn đã được sử dụng.');}}
function mediaReferences(id){const needle='/api/media/'+id;return all('SELECT d.id,t.lang,t.draft,t.published FROM documents d JOIN translations t ON d.id=t.document_id').filter(x=>[x.draft,x.published].some(v=>v&&v.includes(needle))).map(x=>({id:x.id,lang:x.lang}));}
function validateSection(id,data,publish=false,lang='vi'){
for(const ref of data.sourceRefs||[])if(!one('SELECT id FROM source_catalog WHERE id=?',ref.sourceId))fail('Mã nguồn chưa có trong danh mục.');
const count={H02:4,H03:5,H05:6,H07:5,H08:5}[id];if(count&&data.nodes?.length!==count)fail('Phân đoạn này cần giữ '+count+' yếu tố đã xác định.');
if(['H01','H02','H03','H04','H13'].includes(id)&&data.enabled===false)fail('Phần nền tảng không thể tắt.');
if(['H02','H03'].includes(id)&&data.actions?.length)fail('H02 và H03 không có CTA.');
for(const a of data.actions||[]){if(a.targetSectionId&&publish){const target=documents(lang).find(x=>x.id===a.targetSectionId);if(!target||!target.data.enabled)fail('Phân đoạn đích chưa được xuất bản và bật.');const collection={H09:'project',H10:'partner',H12:'certificate',H12B:'news'}[target.id];if(collection&&!documents(lang).some(x=>x.kind===collection))fail('Phân đoạn đích chưa có nội dung công khai.');if(target.id==='H11'&&!target.data.body&&!target.data.description&&!target.data.image)fail('Phân đoạn đích còn trống.');}if(Boolean(a.targetContentId)===Boolean(a.targetSectionId))fail('Chọn một đích liên kết.');if(a.targetContentId){const target=one('SELECT kind FROM documents WHERE id=? AND deleted=0',a.targetContentId);if(!target||!['home','about','contact','product','project','news','index'].includes(target.kind))fail('Trang đích không tồn tại.');if(publish&&!one("SELECT document_id FROM translations WHERE document_id=? AND lang=? AND status='published' AND published IS NOT NULL",a.targetContentId,lang))fail('Trang đích chưa được xuất bản ở ngôn ngữ này.');}}
if(data.mobileImage&&!data.image)fail('Chọn ảnh desktop trước khi chọn ảnh mobile.');
if(data.backdropMobileImage&&!data.backdropImage)fail('Chọn backdrop desktop trước khi chọn ảnh mobile.');
if(data.backdropEnabled&&!['H01','about','ivivi'].includes(id))fail('Backdrop chỉ hỗ trợ ba hero đã chỉ định.');
for(const key of ['image','mobileImage','logo','documentUrl','backdropImage','backdropMobileImage'])if(data[key]?.startsWith('/api/media/')){const m=one('SELECT mime FROM media WHERE id=? AND deleted=0',data[key].split('/').pop());if(!m)fail('Tài sản không tồn tại.');if((key==='documentUrl')!==(m.mime==='application/pdf'))fail('Chọn đúng loại ảnh hoặc PDF cho trường này.');}
if(publish&&data.image&&!data.alt?.trim())fail('Nhập văn bản thay thế cho ảnh.');
}
async function handler(req,ctx){try{
const {path:parts=[]}=await ctx.params;const [area,id,action]=parts;const method=req.method;const user=sessionFromCookie(req.headers.get('cookie')||'');
if(area==='analytics'&&method==='POST'){originCheck(req);if(!process.env.ANALYTICS_WEBHOOK_URL)return json({enabled:false},202);const b=await body(req);const events=/^(homepage_h(?:0[1-9]|1[0-3]|12b)_view|header_ecosystem_open|header_contact_click|hero_ecosystem_click|hero_contact_click|mobile_menu_open|ecosystem_layer_0[1-4](?:_ivier|_ivihrm)?_click|ecosystem_solutions_click|digitization_detail_click|smart_ivier_detail_click|ivihrm_detail_click|learning_solution_click|ivivi_detail_click|case_study_click|partner_detail_click|team_about_click|credential_open|credential_download|footer_contact_click|news_detail_click)$/;if(!events.test(b.event)||!['vi','en'].includes(b.locale)||!['click','view'].includes(b.action))fail('Sự kiện không hợp lệ.');for(const k of ['sectionId','productId','contentId'])if(b[k]&&!/^[a-zA-Z0-9-]{1,80}$/.test(b[k]))fail('Mã nội dung không hợp lệ.');if(limited('analytics-global',600,60))return json({ok:false},429);const url=new URL(process.env.ANALYTICS_WEBHOOK_URL);if(url.protocol!=='https:')return json({ok:false},503);await fetch(url,{method:'POST',redirect:'error',signal:AbortSignal.timeout(3000),headers:{'Content-Type':'application/json'},body:JSON.stringify(Object.fromEntries(['event','locale','action','sectionId','productId','contentId'].map(k=>[k,b[k]||''])))});return json({ok:true});}
if(area==='contact'&&method==='POST'){
originCheck(req);
if(!process.env.CONTACT_WEBHOOK_URL)return json({error:'Biểu mẫu chưa kết nối nơi nhận. Chưa có dữ liệu nào được gửi hoặc lưu.',code:'NOT_CONNECTED'},503);
const b=await body(req);if(b.website)return json({error:'Không thể gửi yêu cầu.'},400);
if(limited('contact-global',30,600))fail('Vui lòng thử lại sau.',429);
if(typeof b.name!=='string'||!b.name.trim()||b.name.length>150||(!/^\S+@\S+\.\S+$/.test(b.email||'')&&!/^[+\d ()-]{8,20}$/.test(b.phone||'')))fail('Vui lòng nhập họ tên và email hoặc số điện thoại hợp lệ.');
const payload=Object.fromEntries(['name','organization','email','phone','solution','message','lang'].map(k=>[k,String(b[k]||'').slice(0,k==='message'?5000:200)]));
if(limited('contact-'+hash((payload.email||payload.phone).toLowerCase()),3,600))fail('Yêu cầu đã được gửi gần đây. Vui lòng thử lại sau.',429);
const url=new URL(process.env.CONTACT_WEBHOOK_URL);if(url.protocol!=='https:')fail('Kênh tiếp nhận chưa được cấu hình hợp lệ.',503);
const response=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json',...(process.env.CONTACT_WEBHOOK_TOKEN?{Authorization:'Bearer '+process.env.CONTACT_WEBHOOK_TOKEN}:{})},body:JSON.stringify(payload),signal:AbortSignal.timeout(10000),redirect:'error'});
if(!response.ok)fail('Nơi nhận chưa xác nhận tiếp nhận. Vui lòng thử lại sau.',502);
return json({ok:true});
}
if(area==='auth'&&id==='login'&&method==='POST'){
originCheck(req);const b=await body(req);const email=String(b.email||'').trim().toLowerCase();if(email.length>200||String(b.password||'').length>256)fail('Thông tin đăng nhập chưa hợp lệ.');
if(limited('login-'+hash(email),8,900)||limited('login-global',100,900))fail('Đã thử đăng nhập nhiều lần. Vui lòng thử lại sau 15 phút.',429);
const u=one('SELECT * FROM users WHERE email=? AND active=1',email);if(!u||!passwordMatches(String(b.password||''),u.password))fail('Email hoặc mật khẩu không đúng.',401);
const s=createSession(u.id);return json({ok:true},200,{'Set-Cookie':cookie(s.token)});
}
if(area==='auth'&&id==='me'&&method==='GET'){requireCap(user,'read');return json({user:{id:user.id,email:user.email,name:user.name,role:user.role},csrf:user.csrf});}
if(area==='media'&&id&&method==='GET'){
const m=one('SELECT * FROM media WHERE id=? AND deleted=0',id);if(!m)fail('Không tìm thấy ảnh.',404);
const publicUse=documents('vi').concat(documents('en')).some(x=>JSON.stringify(x.data).includes('/api/media/'+id));
if(!publicUse)requireCap(user,'read');
const bytes=await fs.readFile(path.join(mediaDir,m.filename));return new Response(bytes,{headers:{'Content-Type':m.mime,...(m.mime==='application/pdf'?{'Content-Security-Policy':"sandbox; frame-ancestors 'self'",'X-Frame-Options':'SAMEORIGIN','Content-Disposition':new URL(req.url).searchParams.has('download')?'attachment; filename=ivitech-document.pdf':'inline'}:{}),'Cache-Control':publicUse?'public, max-age=300':'private, no-store','X-Content-Type-Options':'nosniff'}});
}
requireCap(user,'read');
if(method!=='GET'){originCheck(req);csrfCheck(req,user);}
if(area==='auth'&&id==='logout'&&method==='POST'){run('DELETE FROM sessions WHERE token=?',user.token);return json({ok:true},200,{'Set-Cookie':cookie('',true)});}
if(area==='sources'){
 requireCap(user,'admin');
 if(method==='GET')return json(all('SELECT * FROM source_catalog ORDER BY id').map(r=>({...JSON.parse(r.data),version:r.version,updated:r.updated})));
 if(method==='PUT'&&id){const b=await body(req);if(!b.data||typeof b.data!=='object'||Array.isArray(b.data))fail('Thông tin nguồn không hợp lệ.');const old=one('SELECT * FROM source_catalog WHERE id=?',id);if(!old)fail('Không tìm thấy nguồn.',404);
 const data=JSON.parse(old.data);for(const key of ['resolvedUrl','canonicalDocumentId','documentType','sourceDate','notes','findings'])if(key in b.data){if(typeof b.data[key]!=='string'||b.data[key].length>12000)fail('Trường nguồn không hợp lệ.');data[key]=b.data[key];}
 if(data.resolvedUrl&&!/^https:\/\//.test(data.resolvedUrl))fail('URL nguồn cần dùng HTTPS.');
 if(!['unread','partial','read','inaccessible','missing_link'].includes(b.data.readStatus)||!['editorial','internal','public_asset'].includes(b.data.scope))fail('Trạng thái nguồn không hợp lệ.');
 data.readStatus=b.data.readStatus;data.scope=b.data.scope;
 transaction(()=>{const r=run('UPDATE source_catalog SET data=?,version=version+1,updated=? WHERE id=? AND version=?',JSON.stringify(data),now(),id,b.version);if(!r.changes)fail('Nguồn đã thay đổi, tải lại trước khi lưu.',409);run('INSERT INTO source_history(source_id,data,actor,created) VALUES(?,?,?,?)',id,old.data,user.id,now());});return json({ok:true});}
 fail('Không hỗ trợ thao tác.',405);
}
if(area==='documents'){
if(method==='GET')return json(id?snapshot(id)||fail('Không tìm thấy nội dung.',404):adminDocuments());
requireCap(user,'content');
if(method==='POST'&&!id){const b=await body(req);if(!kinds.includes(b.kind)||['group','section','home','about','contact','settings','index'].includes(b.kind))fail('Loại nội dung không hợp lệ.');const newId=uid();transaction(()=>{run('INSERT INTO documents(id,kind,created) VALUES(?,?,?)',newId,b.kind,now());for(const l of ['vi','en'])run('INSERT INTO translations(document_id,lang,draft,updated) VALUES(?,?,?,?)',newId,l,JSON.stringify({title:'',slug:'',description:'',body:'',blocks:[],image:'',alt:'',order:0}),now());audit(newId,'vi',{},'create',user.id);});return json(snapshot(newId),201);}
const doc=snapshot(id);if(!doc)fail('Không tìm thấy nội dung.',404);
if(method==='PUT'&&!action){const b=await body(req);if(!['vi','en'].includes(b.lang))fail('Ngôn ngữ không hợp lệ.');const d=validateContent(b.data,doc.kind);validateSection(id,d);collision(id,b.lang,d,doc.kind);transaction(()=>{const r=run('UPDATE translations SET draft=?,version=version+1,updated=? WHERE document_id=? AND lang=? AND version=?',JSON.stringify(d),now(),id,b.lang,b.version);if(!r.changes)fail('Nội dung đã thay đổi ở phiên khác. Tải lại trước khi lưu.',409);audit(id,b.lang,d,'save',user.id);});return json(snapshot(id));}
if(method==='POST'&&['publish','hide','trash','restore','revision'].includes(action)){
const b=await body(req);const l=b.lang;if(!['vi','en'].includes(l))fail('Ngôn ngữ không hợp lệ.');
if((['group','home','settings','about','contact','index'].includes(doc.kind)||(doc.kind==='section'&&(action==='trash'||['H01','H02','H03','H04','H13'].includes(id))))&&['trash','hide'].includes(action))fail('Trang nền tảng không thể xóa hoặc ẩn. Bạn có thể sửa các khối nội dung.');
transaction(()=>{
const t=one('SELECT * FROM translations WHERE document_id=? AND lang=?',id,l);if(b.version!==t.version)fail('Nội dung đã thay đổi. Vui lòng tải lại.',409);
if(action==='publish'){if(doc.deleted)fail('Khôi phục nội dung trước khi xuất bản.');const data=validateContent(JSON.parse(t.draft),doc.kind,true);validateSection(id,data,true,l);collision(id,l,data,doc.kind);if(data.groupId&&!one("SELECT id FROM documents WHERE id=? AND kind='group' AND deleted=0",data.groupId))fail('Nhóm giải pháp không tồn tại.');
run("UPDATE translations SET published=draft,status='published',published_at=?,version=version+1,updated=? WHERE document_id=? AND lang=?",now(),now(),id,l);}
if(action==='hide')run("UPDATE translations SET status='hidden',version=version+1,updated=? WHERE document_id=? AND lang=?",now(),id,l);
if(action==='trash'){run('UPDATE documents SET deleted=1 WHERE id=?',id);run('UPDATE translations SET version=version+1 WHERE document_id=?',id);}
if(action==='restore'){run('UPDATE documents SET deleted=0 WHERE id=?',id);run("UPDATE translations SET status='hidden',version=version+1 WHERE document_id=?",id);}
if(action==='revision'){const r=one('SELECT data FROM revisions WHERE id=? AND document_id=? AND lang=?',b.revision,id,l);if(!r)fail('Không tìm thấy phiên bản.');run('UPDATE translations SET draft=?,version=version+1,updated=? WHERE document_id=? AND lang=?',r.data,now(),id,l);}
audit(id,l,JSON.parse(t.draft),action,user.id);
});return json(snapshot(id));
}
}
if(area==='revisions'&&method==='GET')return json(all('SELECT id,lang,action,created FROM revisions WHERE document_id=? ORDER BY id DESC LIMIT 40',id));
if(area==='media'){
if(method==='GET')return json(all('SELECT * FROM media ORDER BY created DESC').map(m=>({...m,url:'/api/media/'+m.id,uses:mediaReferences(m.id)})));
requireCap(user,'media');
if(method==='POST'&&!id){
if(Number(req.headers.get('content-length'))>6*1024*1024)fail('Ảnh tối đa 5 MB.',413);
const form=await req.formData();const file=form.get('file');if(!file||typeof file.arrayBuffer!=='function')fail('Chọn ảnh PNG, JPEG hoặc WebP.');if(file.size>5*1024*1024)fail('Ảnh tối đa 5 MB.',413);
const bytes=Buffer.from(await file.arrayBuffer());const png=bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]));const jpg=bytes[0]===255&&bytes[1]===216&&bytes[2]===255;const webp=bytes.toString('ascii',0,4)==='RIFF'&&bytes.toString('ascii',8,12)==='WEBP';const pdf=bytes.subarray(0,5).toString()==='%PDF-';if(!png&&!jpg&&!webp&&!pdf)fail('Chỉ nhận ảnh PNG, JPEG hoặc WebP hợp lệ.');
if(pdf){const mediaId=uid();await fs.writeFile(path.join(mediaDir,mediaId+'.pdf'),bytes,{flag:'wx'});try{run('INSERT INTO media(id,filename,mime,title,width,height,created) VALUES(?,?,?,?,?,?,?)',mediaId,mediaId+'.pdf','application/pdf',file.name.slice(0,200),0,0,now());}catch(e){await fs.unlink(path.join(mediaDir,mediaId+'.pdf'));throw e;}return json({id:mediaId,url:'/api/media/'+mediaId},201);}
let result;try{result=await sharp(bytes,{limitInputPixels:24000000}).rotate().resize({width:1920,height:1920,fit:'inside',withoutEnlargement:true}).webp({quality:85}).toBuffer({resolveWithObject:true});}catch{fail('Không đọc được ảnh. Vui lòng chọn ảnh khác.');}
const mediaId=uid();await fs.writeFile(path.join(mediaDir,mediaId+'.webp'),result.data,{flag:'wx'});
try{run('INSERT INTO media(id,filename,mime,title,width,height,created) VALUES(?,?,?,?,?,?,?)',mediaId,mediaId+'.webp','image/webp',file.name.slice(0,200),result.info.width,result.info.height,now());}catch(e){await fs.unlink(path.join(mediaDir,mediaId+'.webp'));throw e;}
return json({id:mediaId,url:'/api/media/'+mediaId},201);
}
if(method==='PUT'&&id){const b=await body(req);run('UPDATE media SET title=?,alt_vi=?,alt_en=?,source=?,focus_x=?,focus_y=? WHERE id=?',String(b.title||'').slice(0,200),String(b.alt_vi||'').slice(0,500),String(b.alt_en||'').slice(0,500),String(b.source||'').slice(0,1000),Math.min(100,Math.max(0,Number.isFinite(Number(b.focus_x))?Number(b.focus_x):50)),Math.min(100,Math.max(0,Number.isFinite(Number(b.focus_y))?Number(b.focus_y):50)),id);return json({ok:true});}
if(method==='POST'&&id&&['trash','restore'].includes(action)){if(action==='trash'&&mediaReferences(id).length)fail('Ảnh đang được sử dụng. Gỡ ảnh khỏi nội dung trước khi chuyển vào thùng rác.');run('UPDATE media SET deleted=? WHERE id=?',action==='trash'?1:0,id);return json({ok:true});}
}
if(area==='users'){requireCap(user,'admin');if(method==='GET')return json(all('SELECT id,email,name,role,active FROM users'));if(method==='POST'){const b=await body(req);return json({id:createUser(b.email,b.name,b.password,b.role)},201);}if(method==='PUT'){const b=await body(req);if(id===user.id)fail('Không thể tự thay đổi quyền hoặc khóa tài khoản đang sử dụng.');if(!['admin','editor','media','viewer'].includes(b.role))fail('Vai trò không hợp lệ.');run('UPDATE users SET role=?,active=? WHERE id=?',b.role,b.active?1:0,id);run('DELETE FROM sessions WHERE user_id=?',id);return json({ok:true});}}
if(area==='export'&&method==='GET'){requireCap(user,'admin');return json({format:'ivitech-content-v1',created:now(),documents:adminDocuments(),media:all('SELECT * FROM media'),sources:all('SELECT * FROM source_catalog')},200,{'Content-Disposition':'attachment; filename="ivitech-content.json"'});}
fail('Không tìm thấy chức năng.',404);
}catch(e){const status=e.status||500;if(status===500)console.error('iViTech API operation failed:',e.message);return json({error:status===500?'Không thể hoàn tất thao tác. Dữ liệu chưa được lưu; vui lòng thử lại.':e.message},status);}}
export {handler as GET,handler as POST,handler as PUT,handler as DELETE};

