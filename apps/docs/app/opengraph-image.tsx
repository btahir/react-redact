import { ImageResponse } from 'next/og';
export const alt = 'react-redact — A better day to demo. Local synthetic data and visual field authoring.';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export default function Image() {
  return new ImageResponse(<div style={{width:'100%',height:'100%',display:'flex',flexDirection:'column',background:'#f7f8ef',padding:'55px 70px',color:'#23472f'}}><div style={{display:'flex',justifyContent:'space-between',fontSize:23}}><span>react-redact</span><span style={{fontSize:17,color:'#718767'}}>Free · Open source · Local</span></div><div style={{display:'flex',flexDirection:'column',marginTop:75,fontSize:89,letterSpacing:-5,lineHeight:1.03}}><span>A better day</span><span style={{color:'#66855a'}}>to demo.</span></div><div style={{display:'flex',marginTop:38,fontSize:25,color:'#718168'}}>Synthetic data. Visual policies. Your real React app.</div><div style={{display:'flex',marginTop:'auto',fontSize:16,color:'#819171'}}>react-redact.vercel.app</div></div>, size);
}
