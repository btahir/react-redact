import Link from "next/link";
import type { ReactNode } from "react";
import { createDemoDocument } from "react-redact/data";
import { DemoWorkspace } from "@/components/studio/workspace";
export default function StudioLayout({children}:{children:ReactNode}) {
 return <main style={{background:'#f7f8ef',minHeight:'100vh',padding:'30px clamp(16px,3vw,50px)',color:'#243c30'}}><div style={{maxWidth:1280,margin:'0 auto'}}><nav style={{display:'flex',justifyContent:'space-between',marginBottom:28,fontSize:12}}><Link href="/">← react-redact</Link><Link href="/docs/studio">Studio guide ↗</Link></nav>{children}<DemoWorkspace initialDocument={createDemoDocument()} /></div></main>;
}
