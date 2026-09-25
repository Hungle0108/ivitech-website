import PublicSite from '@/components/public-site';import {loadPublic,pageMetadata} from '@/lib/public.mjs';import {notFound} from 'next/navigation';
export const dynamic='force-dynamic';
export async function generateMetadata({params}){const {lang,slug}=await params;return pageMetadata(lang,slug)}
export default async function Page({params,searchParams}){const {lang,slug}=await params;const data=loadPublic(lang,slug);if(!data)notFound();const s=await searchParams;return <PublicSite {...data} selected={typeof s.solution==='string'?s.solution:''}/>}
