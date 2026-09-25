 'use client';
// Decorative layers remain independent of content and never receive pointer events.
export default function Backdrop({data:d,priority=true}) {
  if(!d.backdropEnabled) return null;
  const color=d.backdropOverlay||'#FFFFFF';
  const rgba=(opacity)=>color+Math.round(opacity*2.55).toString(16).padStart(2,'0');
  return <div className="section-backdrop" aria-hidden="true" style={{backgroundColor:d.backdropFallback||'#F8F9FC','--backdrop-position':`${d.backdropX??80}% ${d.backdropY??50}%`,'--backdrop-mobile-position':`${d.backdropMobileX??80}% ${d.backdropMobileY??80}%`,'--backdrop-overlay':`linear-gradient(90deg,${rgba(d.backdropLeft??96)} 0%,${rgba(d.backdropMiddle??85)} 60%,${rgba(d.backdropRight??40)} 100%)`,'--backdrop-mobile-overlay':`linear-gradient(180deg,${rgba(98)} 0%,${rgba(94)} 65%,${rgba(75)} 100%)`}}>
    {d.backdropImage&&<picture>{d.backdropMobileImage&&<source media="(max-width:767px)" srcSet={d.backdropMobileImage}/>}<img key={d.backdropImage+'|'+d.backdropMobileImage} src={d.backdropImage} alt="" width="1920" height="1080" loading={priority?'eager':'lazy'} fetchPriority={priority?'high':'auto'} ref={el=>{if(el?.complete&&!el.naturalWidth)el.style.visibility='hidden'}} onError={e=>{e.currentTarget.style.visibility='hidden'}}/></picture>}
    <div className="backdrop-tint"/><div className="backdrop-overlay"/>
  </div>;
}
