import {randomBytes,scryptSync,timingSafeEqual,createHash} from 'node:crypto';
import {one,run,uid} from './db.mjs';
export const cookieName='ivitech_session';
export const hash=v=>createHash('sha256').update(v).digest('hex');
export function passwordHash(password){const salt=randomBytes(16).toString('hex');return salt+':'+scryptSync(password,salt,64).toString('hex');}
export function passwordMatches(password,value){try{const [s,h]=value.split(':');const a=scryptSync(password,s,64);const b=Buffer.from(h,'hex');return a.length===b.length&&timingSafeEqual(a,b);}catch{return false;}}
export function createUser(email,name,password,role='admin'){if(typeof email!=='string'||typeof password!=='string'||!/^\S+@\S+\.\S+$/.test(email)||password.length<12||password.length>256)throw new Error('Email hợp lệ và mật khẩu tối thiểu 12 ký tự.');if(!['admin','editor','media','viewer'].includes(role))throw new Error('Vai trò không hợp lệ.');const id=uid();run('INSERT INTO users(id,email,name,role,password) VALUES(?,?,?,?,?)',id,email.trim().toLowerCase(),name,role,passwordHash(password));return id;}
export function sessionFromCookie(cookie=''){const value=cookie.split(';').map(x=>x.trim()).find(x=>x.startsWith(cookieName+'='))?.slice(cookieName.length+1);if(!value)return null;return one('SELECT u.id,u.email,u.name,u.role,s.csrf,s.token FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token=? AND s.expires>? AND u.active=1',hash(value),Date.now())||null;}
export function createSession(userId){const token=randomBytes(32).toString('hex');const csrf=randomBytes(32).toString('hex');run('DELETE FROM sessions WHERE expires<?',Date.now());run('INSERT INTO sessions(token,user_id,csrf,expires) VALUES(?,?,?,?)',hash(token),userId,csrf,Date.now()+8*60*60*1000);return {token,csrf};}
export function cookie(token,clear=false){return cookieName+'='+token+'; HttpOnly; SameSite=Strict; Path=/; Max-Age='+(clear?'0':'28800')+(process.env.SITE_URL?.startsWith('https:')?'; Secure':'');}
export function allowed(user,cap){if(!user)return false;if(user.role==='admin')return true;if(cap==='read')return true;if(cap==='content')return user.role==='editor';if(cap==='media')return ['editor','media'].includes(user.role);return false;}

