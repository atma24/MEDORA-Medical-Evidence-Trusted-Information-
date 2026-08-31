'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
export default function AdminIndex(){ const r=useRouter(); useEffect(()=>{r.replace('/dashboard');},[r]); return null; }
