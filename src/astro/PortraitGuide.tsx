import { useEffect, useRef, useState, type RefObject } from "react";
import type { GuideMotion } from "./guideMotion";
import "./portrait-guide.css";

// The texture is projected onto a shallow 3D face/shoulder mesh. This is a
// portrait rig, not a reconstructed full-body human or a video-generation model.
const vertexShader = `
attribute vec2 a_uv;
uniform vec2 u_scale;
uniform vec2 u_turn;
uniform vec4 u_face;
uniform float u_open;
uniform float u_round;
uniform float u_blink;
uniform float u_breathe;
varying vec2 v_uv;
float bell(vec2 p, vec2 c, vec2 s) { vec2 d=(p-c)/s; return exp(-dot(d,d)*2.0); }
void main(){
  v_uv=a_uv;
  vec2 uv=a_uv;
  float head=bell(a_uv,vec2(u_face.x,.33),vec2(.32,.32));
  float shoulder=bell(a_uv,vec2(.5,.78),vec2(.6,.33));
  vec3 p=vec3(uv.x*2.0-1.0,1.0-uv.y*2.0,head*.19+shoulder*.035);
  p.z+=bell(a_uv,vec2(u_face.x,u_face.y-.05),vec2(.05,.06))*.06;
  p.y+=shoulder*u_breathe*.003;
  float rx=u_turn.x*head; float ry=u_turn.y*head;
  p.x=p.x*cos(rx)+p.z*sin(rx);
  p.y=p.y*cos(ry)-p.z*sin(ry);
  gl_Position=vec4(p.xy*u_scale,p.z*.1,1.0);
}`;
// Separate the lower lip from the anchored upper teeth. The old vertex stretch
// enlarged the teeth and surrounding skin instead of opening a mouth.
const fragmentShader = `
precision mediump float;
uniform sampler2D u_image;
uniform vec4 u_face;
uniform float u_open;
uniform float u_round;
varying vec2 v_uv;
void main(){
  vec2 uv=v_uv;
  float halfWidth=u_face.w;
  float x=(uv.x-u_face.x)/halfWidth;
  float shape=pow(max(0.0,1.0-x*x),.7);
  float gap=u_open*.024*shape;
  float seam=u_face.y+.003*x*x;
  float below=uv.y-seam;
  // Preserve lip texture and teeth size, translating the lower lip and easing
  // the movement out over the chin. Corners stay anchored.
  float falloff=1.0-smoothstep(.025,.105,max(0.0,below-gap));
  if(below>=gap) uv.y-=gap*falloff;
  vec3 color=texture2D(u_image,uv).rgb;
  if(abs(x)<1.0 && below>0.0 && below<gap && gap>.0001){
    float depth=below/max(gap,.0001);
    vec3 cavity=mix(vec3(.105,.022,.025),vec3(.035,.007,.011),smoothstep(0.0,.65,depth));
    // Restrained lower mouth warmth; upper teeth remain in the original image.
    float tongue=smoothstep(.58,.95,depth)*(1.0-x*x)*.34;
    cavity=mix(cavity,vec3(.26,.085,.09),tongue);
    float edge=smoothstep(0.0,.0012,below)*smoothstep(0.0,.0012,gap-below);
    color=mix(texture2D(u_image,vec2(v_uv.x,seam)).rgb,cavity,edge);
  }
  gl_FragColor=vec4(color,1.0);
}`;

export default function PortraitGuide({ gender, motion }: {
  gender: "female" | "male"; motion: RefObject<GuideMotion>;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const src = `/art/guide-${gender}.png`;
  useEffect(() => {
    const element=canvas.current;
    if(!element) return;
    setReady(false); setFailed(false);
    const gl=element.getContext("webgl",{alpha:false,antialias:true,powerPreference:"low-power"});
    if(!gl){setFailed(true);return;}
    let disposed=false, frame=0;
    const shader=(type:number,source:string)=>{
      const result=gl.createShader(type)!; gl.shaderSource(result,source);gl.compileShader(result);
      if(!gl.getShaderParameter(result,gl.COMPILE_STATUS)){gl.deleteShader(result);throw new Error("Avatar shader unavailable");}return result;
    };
    let program:WebGLProgram; let vs:WebGLShader; let fs:WebGLShader;
    try {vs=shader(gl.VERTEX_SHADER,vertexShader);fs=shader(gl.FRAGMENT_SHADER,fragmentShader);program=gl.createProgram()!;gl.attachShader(program,vs);gl.attachShader(program,fs);gl.linkProgram(program);
      if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw new Error("Avatar renderer unavailable");
    } catch {setFailed(true);return;}
    gl.useProgram(program);
    const vertices:number[]=[];
    const cols=100,rows=150;
    for(let y=0;y<rows;y++)for(let x=0;x<cols;x++){
      const a=x/cols,b=y/rows,c=(x+1)/cols,d=(y+1)/rows;
      vertices.push(a,b,c,b,a,d,c,b,c,d,a,d);
    }
    const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(vertices),gl.STATIC_DRAW);
    const attribute=gl.getAttribLocation(program,"a_uv");gl.enableVertexAttribArray(attribute);gl.vertexAttribPointer(attribute,2,gl.FLOAT,false,0,0);
    const locations=Object.fromEntries(["u_scale","u_turn","u_face","u_open","u_round","u_blink","u_breathe"].map(k=>[k,gl.getUniformLocation(program,k)]));
    const texture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,texture);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
    const resize=()=>{
      const width=element.clientWidth,height=element.clientHeight,dpr=Math.min(devicePixelRatio||1,1.5);
      element.width=Math.max(1,Math.round(width*dpr));element.height=Math.max(1,Math.round(height*dpr));gl.viewport(0,0,element.width,element.height);
      const ratio=width/Math.max(1,height),imageRatio=2/3;
      gl.uniform2f(locations.u_scale,Math.max(1,imageRatio/ratio),Math.max(1,ratio/imageRatio));
    };
    const observer=new ResizeObserver(resize);observer.observe(element);
    const preference=matchMedia("(prefers-reduced-motion: reduce)");
    let open=0,round=0,last=0;
    const render=(now:number)=>{
      if(disposed)return;
      if(now-last>32 && !document.hidden){
        last=now;const t=now/1000;const state=motion.current;
        const target=state.speaking && state.energy>.025 ? Math.max(.16,state.open) : 0;
        open+=(target-open)*(target>open?.28:.18);
        round+=(state.round-round)*.25;
        const blinkTime=(t+1.4)%5.2;
        const blink=blinkTime<.17?Math.sin(blinkTime/.17*Math.PI):0;
        // Coordinates are calibrated to the generated portraits, in image UV space.
        const mouthY=gender==="female"?.420:.407;
        const eyesY=gender==="female"?.296:.281;
        gl.uniform4f(locations.u_face,gender==="female"?.502:.483,mouthY,eyesY,gender==="female"?.062:.063);
        gl.uniform1f(locations.u_open,Math.max(0,Math.min(.72,open)));
        gl.uniform1f(locations.u_round,round);
        gl.uniform1f(locations.u_blink,preference.matches?0:blink);
        gl.uniform1f(locations.u_breathe,preference.matches?0:Math.sin(t*1.2));
        gl.uniform2f(locations.u_turn,preference.matches?0:Math.sin(t*.54)*.028,preference.matches?0:Math.sin(t*.79)*.021);
        gl.drawArrays(gl.TRIANGLES,0,vertices.length/2);
      }
      frame=requestAnimationFrame(render);
    };
    const picture=new Image();
    picture.onload=()=>{if(disposed)return;gl.bindTexture(gl.TEXTURE_2D,texture);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB,gl.RGB,gl.UNSIGNED_BYTE,picture);resize();setReady(true);frame=requestAnimationFrame(render);};
    picture.onerror=()=>{if(!disposed)setFailed(true);};picture.src=src;
    const lost=(e:Event)=>{e.preventDefault();cancelAnimationFrame(frame);setFailed(true);};element.addEventListener("webglcontextlost",lost);
    return()=>{disposed=true;cancelAnimationFrame(frame);observer.disconnect();picture.onload=null;picture.onerror=null;element.removeEventListener("webglcontextlost",lost);gl.deleteTexture(texture);gl.deleteBuffer(buffer);gl.deleteProgram(program);gl.deleteShader(vs);gl.deleteShader(fs);};
  },[gender,motion,src]);
  return <aside className="portrait-companion" aria-label={`${gender === "female" ? "Aarya" : "Aarav"}, your cosmic guide`}>
    <div className="portrait-stage">
      <img className="portrait-fallback" src={src} alt={`${gender === "female" ? "Female guide Aarya" : "Male guide Aarav"} in emerald and gold`} />
      <canvas ref={canvas} className={`portrait-canvas ${ready&&!failed?"is-ready":""}`} aria-hidden="true" />
      <div className="portrait-shade" />
    </div>
  </aside>;
}
