import {createUser} from '../lib/auth.mjs';
import {one} from '../lib/db.mjs';
import readline from 'node:readline/promises';
const ui=readline.createInterface({input:process.stdin,output:process.stdout});
try{
if(one('SELECT id FROM users LIMIT 1'))throw new Error('Đã có tài khoản. Dùng mục Tài khoản trong quản trị để tạo thêm.');
const email=process.env.ADMIN_EMAIL||await ui.question('Email quản trị: ');
const name=process.env.ADMIN_NAME||await ui.question('Tên hiển thị: ');
const password=process.env.ADMIN_PASSWORD;
if(!password)throw new Error('Đặt ADMIN_PASSWORD (ít nhất 12 ký tự) trong biến môi trường của phiên terminal, rồi chạy lại. Mật khẩu không được in ra hoặc ghi vào mã nguồn.');
createUser(email,name||'Quản trị viên',password,'admin');
console.log('Đã tạo quản trị viên đầu tiên. Đăng nhập tại /admin.');
}catch(e){console.error(e.message);process.exitCode=1;}finally{ui.close();}

