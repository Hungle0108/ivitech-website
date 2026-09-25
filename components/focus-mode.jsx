 'use client';
import {useEffect} from 'react';
export default function FocusMode(){
  useEffect(()=>{
    const root=document.documentElement;
    const pointer=()=>{root.dataset.focusInput='pointer'};
    const keyboard=e=>{if(['Tab','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key))root.dataset.focusInput='keyboard'};
    document.addEventListener('pointerdown',pointer,true);
    document.addEventListener('keydown',keyboard,true);
    return()=>{document.removeEventListener('pointerdown',pointer,true);document.removeEventListener('keydown',keyboard,true);delete root.dataset.focusInput};
  },[]);
  return null;
}
