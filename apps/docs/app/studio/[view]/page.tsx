import { notFound } from "next/navigation";
import type { Metadata } from "next";
const views = ['overview','customers','invoices'];
export function generateStaticParams() { return views.map(view => ({ view })); }
export async function generateMetadata({params}: {params: Promise<{view:string}>}): Promise<Metadata> { const {view}=await params; return {title:`${view[0]?.toUpperCase()}${view.slice(1)} demo · Redact Studio`,alternates:{canonical:`/studio/${view}`},description:'A synthetic customer workspace with the live local Redact Studio editor.'}; }
export default async function StudioView({params}: {params: Promise<{view:string}>}) { const {view}=await params; if(!views.includes(view)) notFound(); return null; }
