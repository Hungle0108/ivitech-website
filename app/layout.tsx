import './globals.css';
import './site.css';
import FocusMode from '@/components/focus-mode';
import { headers } from 'next/headers';
export const metadata = {title:'iViTech',description:'Biến tri thức thành năng lực số',icons:{icon:'/favicon.png'},robots:{index:false,follow:false}};
export default async function RootLayout({children}:{children:React.ReactNode}) {const h=await headers(); return <html lang={h.get('x-site-lang')==='en'?'en':'vi'}><body><FocusMode/>{children}</body></html>}
