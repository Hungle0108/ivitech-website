import {z} from 'zod';
import {safeUrl} from './routes.mjs';
const text=z.string().max(20000);
const short=z.string().max(500);
export const kinds=['section','home','about','group','product','project','partner','testimonial','certificate','recognition','news','contact','settings','index'];
export const contentSchema=z.object({
sourceRefs:z.array(z.object({sourceId:z.string().regex(/^[A-Z]\d{2}$/),locator:short,notes:short.optional()})).max(30).optional(),
backdropEnabled:z.boolean().optional(),backdropImage:short.optional(),backdropMobileImage:short.optional(),
backdropFallback:z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),backdropOverlay:z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
backdropX:z.number().min(0).max(100).optional(),backdropY:z.number().min(0).max(100).optional(),backdropMobileX:z.number().min(0).max(100).optional(),backdropMobileY:z.number().min(0).max(100).optional(),
backdropLeft:z.number().min(0).max(100).optional(),backdropMiddle:z.number().min(0).max(100).optional(),backdropRight:z.number().min(0).max(100).optional(),
enabled:z.boolean().optional(),heroHeadline:short.optional(),valueProposition:short.optional(),supportNote:short.optional(),outcome:short.optional(),classroomLabel:short.optional(),navHome:short.optional(),ecosystemOverview:short.optional(),mobileImage:short.optional(),documentUrl:short.optional(),highlights:z.array(short).max(12).optional(),
nodes:z.array(z.object({title:short,text:text.optional(),label:short.optional()})).max(20).optional(),
actions:z.array(z.object({label:short,targetContentId:short.optional(),targetSectionId:z.enum(['H01','H02','H03','H04','H05','H06','H07','H08','H09','H10','H11','H12','H12B','H13']).optional()})).max(4).optional(),
method:z.object({foundationPercent:z.number().min(0).max(100),practicePercent:z.number().min(0).max(100),programScope:short,description:text,status:z.enum(['draft','published'])}).optional(),
title:short,slug:z.string().max(100).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).or(z.literal('')).optional(),
description:z.string().max(2000).optional(),body:text.optional(),audience:text.optional(),
eyebrow:short.optional(),accent:short.optional(),image:short.optional(),alt:short.optional(),logo:short.optional(),source:short.optional(),
seoTitle:z.string().max(160).optional(),seoDescription:z.string().max(350).optional(),ctaLabel:short.optional(),ctaUrl:short.optional(),secondaryLabel:short.optional(),secondaryUrl:short.optional(),
groupId:short.optional(),icon:short.optional(),category:short.optional(),date:z.string().max(10).optional(),order:z.number().int().min(0).max(9999).optional(),
email:short.optional(),phone:short.optional(),address:z.string().max(2000).optional(),facebook:short.optional(),youtube:short.optional(),zalo:short.optional(),footerText:text.optional(),copyright:short.optional(),
navAbout:short.optional(),navSolutions:short.optional(),navProjects:short.optional(),navNews:short.optional(),navResources:short.optional(),navContact:short.optional(),collection:short.optional(),
blocks:z.array(z.object({title:short,text})).max(40).optional(),
modules:z.array(z.object({type:z.enum(['hero','recognition','solutions','consult','project','testimonial','partner','certificate','news','contact']),title:short,text:text.optional(),enabled:z.boolean()})).max(10).optional()
}).strict().superRefine((v,c)=>{
for(const k of ['image','logo','mobileImage','documentUrl','backdropImage','backdropMobileImage'])if(v[k]&&!/^\/(brand\/[a-zA-Z0-9._-]+|api\/media\/[a-f0-9-]+)$/.test(v[k]))c.addIssue({code:'custom',path:[k],message:'Chọn ảnh từ thư viện.'});
for(const k of ['ctaUrl','secondaryUrl','facebook','youtube','zalo'])if(v[k]&&!safeUrl(v[k]))c.addIssue({code:'custom',path:[k],message:'Đường dẫn phải là đường dẫn nội bộ hoặc HTTPS hợp lệ.'});
if(v.email&&!/^\S+@\S+\.\S+$/.test(v.email))c.addIssue({code:'custom',path:['email'],message:'Email chưa hợp lệ.'});
if(v.method){if(v.method.foundationPercent+v.method.practicePercent!==100)c.addIssue({code:'custom',path:['method'],message:'Tổng tỷ lệ phải bằng 100.'});if(v.method.status==='published'&&!v.method.programScope.trim())c.addIssue({code:'custom',path:['method'],message:'Nhập phạm vi chương trình trước khi công bố tỷ lệ.'});}
if(v.modules&&new Set(v.modules.map(x=>x.type)).size!==v.modules.length)c.addIssue({code:'custom',path:['modules'],message:'Mỗi khối chỉ xuất hiện một lần.'});
});
export function validateContent(value,kind,publish=false){const r=contentSchema.safeParse(value);if(!r.success)throw Object.assign(new Error(r.error.issues.map(i=>i.path.join('.')+': '+i.message).join('; ')),{status:400});const d=r.data;if(publish){if(!d.title?.trim())throw Object.assign(new Error('Cần nhập tiêu đề trước khi xuất bản.'),{status:400});if(['product','project','news','group'].includes(kind)&&(!d.description?.trim()||!d.slug))throw Object.assign(new Error('Cần tiêu đề, mô tả và đường dẫn cho ngôn ngữ đang xuất bản.'),{status:400});if(['product','news','project'].includes(kind)&&!d.body?.trim())throw Object.assign(new Error('Cần nội dung chi tiết trước khi xuất bản.'),{status:400});if(d.image&&!d.alt?.trim()&&kind!=='home')throw Object.assign(new Error('Nhập văn bản thay thế cho ảnh.'),{status:400});}return d;}

