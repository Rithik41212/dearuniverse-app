import { useEffect, useRef, type RefObject } from "react";
import type { GuideMotion } from "./guideMotion";

export default function ParticlePlanet({ motion, quiet = false }: { motion: RefObject<GuideMotion>; quiet?: boolean }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const element = canvas.current, ctx = element?.getContext("2d");
    if (!element || !ctx) return;
    let width=1,height=1,frame=0,last=0,angle=0,pulse=0;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const resize=()=>{ width=element.clientWidth; height=element.clientHeight; const dpr=Math.min(devicePixelRatio||1,1.7); element.width=width*dpr;element.height=height*dpr;ctx.setTransform(dpr,0,0,dpr,0,0); };
    const observer=new ResizeObserver(resize);observer.observe(element);resize();
    const count=1600;
    const sphere=Array.from({length:count},(_,i)=>{
      const y=1-2*(i+.5)/count,r=Math.sqrt(1-y*y),a=i*2.39996323;
      return {x:Math.cos(a)*r,y,z:Math.sin(a)*r,seed:i/count};
    });
    const stars=Array.from({length:150},(_,i)=>({x:((i*127.31)%997)/997,y:((i*83.73)%991)/991,r:.35+(i%5)*.19}));
    const draw=(now:number)=>{
      frame=requestAnimationFrame(draw);
      if(document.hidden || now-last<32)return;
      const dt=Math.min((now-last)/1000,.08);last=now;
      if(!reduced.matches)angle+=dt*.105;
      const energy=motion.current.speaking ? motion.current.energy : 0;
      pulse+=(energy-pulse)*.12;
      const radius=Math.min(width*.32,height*.225,205)*(1+(reduced.matches?0:pulse*.035));
      const cx=width/2,cy=height*.46,t=now/1000;
      ctx.clearRect(0,0,width,height);
      for(const star of stars){
        const x=star.x*width+(reduced.matches?0:Math.sin(t*.07+star.y*20)*11);
        const y=(star.y*height+(reduced.matches?0:t*(.3+star.r*.3)))%height;
        ctx.fillStyle=`rgba(229,219,174,${.2+.25*Math.sin(star.x*18+t*.3)**2})`;ctx.beginPath();ctx.arc(x,y,star.r,0,Math.PI*2);ctx.fill();
      }
      ctx.save();ctx.globalAlpha=quiet?.2:1;
      const glow=ctx.createRadialGradient(cx,cy,radius*.15,cx,cy,radius*1.65);
      glow.addColorStop(0,`rgba(130,193,140,${.09+pulse*.04})`);glow.addColorStop(.6,"rgba(122,172,112,.07)");glow.addColorStop(1,"transparent");
      ctx.fillStyle=glow;ctx.fillRect(cx-radius*1.7,cy-radius*1.7,radius*3.4,radius*3.4);
      const points=sphere.map(p=>{const x=p.x*Math.cos(angle)+p.z*Math.sin(angle),z=-p.x*Math.sin(angle)+p.z*Math.cos(angle);return {...p,x,z};}).sort((a,b)=>a.z-b.z);
      for(const p of points){
        const ribbon=Math.sin(p.y*14+p.seed*5+angle*.5)>.35;
        const perspective=1+p.z*.10;
        const x=cx+p.x*radius*perspective,y=cy+p.y*radius*perspective;
        const alpha=.12+(p.z+1)*.34;
        ctx.fillStyle=ribbon?`rgba(227,202,135,${alpha})`:`rgba(135,213,170,${alpha*.85})`;
        ctx.beginPath();ctx.arc(x,y,(.6+(p.z+1)*.48)*(1+pulse*.10),0,Math.PI*2);ctx.fill();
      }
      // A tilted, orbiting dust ring gives the globe depth without a solid shell.
      for(let i=0;i<480;i++){
        const a=i/480*Math.PI*2+angle*.5,r=radius*(1.35+(i%7)*.013);
        const x=Math.cos(a)*r,y=Math.sin(a)*r*.25;
        ctx.fillStyle=`rgba(222,195,126,${.12+(Math.sin(a)+1)*.17})`;
        ctx.beginPath();ctx.arc(cx+x*.94-y*.34,cy+x*.34+y*.94,.6+(i%3)*.2,0,Math.PI*2);ctx.fill();
      }
      ctx.restore();
    };
    frame=requestAnimationFrame(draw);
    return()=>{cancelAnimationFrame(frame);observer.disconnect();};
  },[motion,quiet]);
  return <canvas ref={canvas} className="particle-planet" role="img" aria-label="A rotating planet of emerald and gold particles, gently responding to the guide’s voice" />;
}
