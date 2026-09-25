import PublicSite from '@/components/public-site';import {loadPublic,pageMetadata} from '@/lib/public.mjs';import {notFound} from 'next/navigation';
export const dynamic='force-dynamic';
export async function generateMetadata({params}){return pageMetadata((await params).lang)}
export default async function Page({params}){const data=loadPublic((await params).lang);if(!data)notFound();return <PublicSite {...data}/>}
