/* Hide from Chucky — original canvas art. hfc-build-20261001-scarred */
'use strict';
const BUILD = 'hfc-build-20261001-scarred';
const TILE = 36;
const SHOT = new URLSearchParams(location.search).get('shot');
const DIFFS = {
  easy:   { id:'easy', name:'Easy', dawn:210, cSpeed:104, hear:0.72, sight:220, bat:0.5, openT:1.4, breakT:3.4, checkT:1.4, delay:8, stam:18, blurb:'Slower Charles, longer night, more gear.' },
  normal: { id:'normal', name:'Normal', dawn:150, cSpeed:132, hear:1, sight:300, bat:1.05, openT:0.85, breakT:2.15, checkT:1.05, delay:4, stam:23, blurb:'The real night.' },
  hard:   { id:'hard', name:'Hard', dawn:115, cSpeed:162, hear:1.3, sight:390, bat:1.75, openT:0.5, breakT:1.2, checkT:0.78, delay:1.1, stam:28, blurb:'He is not playing around.' }
};
const WALK = 122, SPRINT = 188;
const ACH = [
  { id:'hide', name:'In The Closet', desc:'Hide from Charles.' },
  { id:'breath', name:'Don\'t Pass Out', desc:'Hold your breath and he walks off.' },
  { id:'slam', name:'Door Meet Face', desc:'Slam a door on him.' },
  { id:'lure', name:'Over Here', desc:'Pull Charles with a noise maker.' },
  { id:'lock', name:'Try This Lock', desc:'Lock a door.' },
  { id:'juice', name:'Juice', desc:'Pick up a battery.' },
  { id:'charms', name:'Voodoo Pocket', desc:'Hold 3 charms.' },
  { id:'eyes', name:'Five Eyes', desc:'Collect every doll eye in a house.' },
  { id:'dawn', name:'See You At Dawn', desc:'Survive until dawn.' },
  { id:'escape', name:'Out The Front', desc:'Escape with 3 charms.' },
  { id:'hard', name:'Hardass Night', desc:'Win on Hard.' },
  { id:'ridge', name:'Ridge Survivor', desc:'Win at Ridge House.' },
  { id:'cabin', name:'Lake Night', desc:'Win at the cabin.' },
  { id:'both', name:'Two Houses', desc:'Win both houses.' },
  { id:'blackout', name:'Lights Out', desc:'Last 20s with the light off while he is on your floor.' },
  { id:'close', name:'Too Close, Pal', desc:'Survive him getting within arm\'s reach.' }
];
const LINES = {
  start: ['Nicky. Pal. Charles is in the house. Try not to sprint like a dumbass.', 'Rise and shine, Nicky. Hide-and-seek. I still like you.'],
  sprint: ['I hear those little feet, pal. Slow the hell down.', 'Quit running, Nicky. You are loud as shit.'],
  search: ['Come on out. I like you, but this closet crap is getting old.', 'I know you are close, pal. Quit playing cute.'],
  breath: ['Hold your breath all you want. I am still your guy.', 'Don\'t pass out in there, dumbass. I need you conscious.'],
  miss: ['Empty. Smart, Nicky. Annoying, but smart.', 'Nobody here. You lucky bastard.'],
  lock: ['A lock? Really, pal? I will kick the damn thing.', 'Cute lock, Nicky. Give me a second.'],
  slam: ['Goddamn door. That was rude, pal.', 'Slam it again. I am still gonna laugh.'],
  lure: ['The hell is that beeping? Alright, I will bite.', 'Noise maker. Classic. I am still checking, dumbass.'],
  charm: ['That is my charm, Nicky. Ballsy.', 'Voodoo in your pocket. Look at you, pal.'],
  lowbat: ['Light is dying, pal. Don\'t cry about it.'],
  catch: ['Gotcha, Nicky. That is one for me. Don\'t pout.', 'Too slow, pal. I still like you. Run it back.', 'Found you. Red flash, my point.'],
  dawn: ['Dawn already? You win, you lucky bastard.', 'Sun is up, Nicky. Charles is calling it. Nice work, pal.'],
  escape: ['Front door and three charms. Cold exit, but fair, pal.', 'You ditched me, Nicky. I am almost proud, you little shit.'],
  idle: ['Come on, Nicky. Don\'t be boring.', 'This house is ours tonight, pal. Move your ass.', 'I ain\'t mad. I am just looking.'],
  close: ['Right there, Nicky. I almost had you.', 'Too close, pal. I felt that.']
};
function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return ((t^t>>>14)>>>0)/4294967296;};}
const clamp=(v,a,b)=>v<a?a:v>b?b:v;
function dist(ax,ay,bx,by){return Math.hypot(ax-bx,ay-by);}
function pick(arr){return arr[(Math.random()*arr.length)|0];}
function loadSave(){
  const base={ach:{},best:{},cleared:{},settings:{vol:0.7,voiceVol:0.8,voice:true,captions:true,scare:false}};
  try{const s=JSON.parse(localStorage.getItem('hfc-meta')||'null'); if(!s) return base;
    s.settings=Object.assign(base.settings,s.settings||{}); s.ach=s.ach||{}; s.best=s.best||{}; s.cleared=s.cleared||{}; return s;
  }catch(e){return base;}
}
const save=loadSave();
function persist(){try{localStorage.setItem('hfc-meta',JSON.stringify(save));}catch(e){}}
let actx,master,droneGain,droneOn=false;
function ac(){
  if(!actx){const AC=window.AudioContext||window.webkitAudioContext; if(!AC) return null;
    actx=new AC(); master=actx.createGain(); master.gain.value=save.settings.vol; master.connect(actx.destination);}
  return actx;
}
function ensureAudio(){const a=ac(); if(!a||SHOT) return; if(a.state==='suspended') a.resume();}
function setVol(){if(master) master.gain.value=save.settings.vol; if(droneGain&&actx) droneGain.gain.value=0.028*save.settings.vol;}
function buzz(freq,dur,type,peak,slide){
  const a=ac(); if(!a||SHOT||save.settings.vol<=0.001) return;
  const t=a.currentTime,o=a.createOscillator(),g=a.createGain();
  o.type=type||'sine'; o.frequency.setValueAtTime(freq,t);
  if(slide) o.frequency.exponentialRampToValueAtTime(Math.max(30,freq+slide),t+dur);
  g.gain.setValueAtTime(0.0001,t);
  g.gain.exponentialRampToValueAtTime(Math.max(0.0002,peak*save.settings.vol),t+0.015);
  g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
  o.connect(g); g.connect(master); o.start(t); o.stop(t+dur+0.02);
}
function noiseBurst(dur,peak,freq){
  const a=ac(); if(!a||SHOT||save.settings.vol<=0.001) return;
  const t=a.currentTime, n=Math.floor(a.sampleRate*dur), buf=a.createBuffer(1,n,a.sampleRate), data=buf.getChannelData(0);
  for(let i=0;i<n;i++) data[i]=(Math.random()*2-1)*(1-i/n);
  const src=a.createBufferSource(); src.buffer=buf;
  const f=a.createBiquadFilter(); f.type='lowpass'; f.frequency.value=freq||400;
  const g=a.createGain(); g.gain.value=peak*save.settings.vol;
  src.connect(f); f.connect(g); g.connect(master); src.start(t);
}
function playStep(vol){noiseBurst(0.05,0.18*(vol||1),220); buzz(90,0.05,'sine',0.04*(vol||1));}
function playSlam(){noiseBurst(0.18,0.45,180); buzz(140,0.22,'sawtooth',0.08,-90);}
function playPickup(){buzz(520,0.08,'square',0.05); buzz(780,0.12,'square',0.04);}
function playBeep(){buzz(880,0.07,'square',0.05);}
function playHeart(){buzz(58,0.09,'sine',0.06);}
function playCatch(){noiseBurst(0.25,0.35,140); buzz(90,0.4,'sawtooth',0.07,-50); if(save.settings.scare){buzz(440,0.18,'square',0.08); buzz(180,0.3,'sawtooth',0.08,-80);}}
function playWin(){buzz(392,0.12,'triangle',0.06); buzz(523,0.18,'triangle',0.06); buzz(659,0.28,'triangle',0.05);}
function startDrone(){
  const a=ac(); if(!a||droneOn||SHOT) return; droneOn=true;
  const o1=a.createOscillator(), o2=a.createOscillator(); droneGain=a.createGain();
  o1.type='sine'; o2.type='triangle'; o1.frequency.value=49; o2.frequency.value=73.4;
  droneGain.gain.value=0.0001; o1.connect(droneGain); o2.connect(droneGain); droneGain.connect(master);
  o1.start(); o2.start(); droneGain.gain.linearRampToValueAtTime(0.028*save.settings.vol, a.currentTime+1.2);
}
let voices=[];
function loadVoices(){ if(!window.speechSynthesis) return; voices=speechSynthesis.getVoices()||[]; }
if(window.speechSynthesis){ loadVoices(); window.speechSynthesis.onvoiceschanged=loadVoices; }
let sayT=0, capT=0, capEl;
function caption(text){ if(!capEl) capEl=document.getElementById('caption'); if(!save.settings.captions){capEl.textContent=''; return;} capEl.textContent=text||''; capT=text?4.2:0; }
function speak(line){
  if(SHOT||!save.settings.voice||!window.speechSynthesis||save.settings.voiceVol<=0) return;
  try{
    const u=new SpeechSynthesisUtterance(line);
    u.rate=0.94; u.pitch=0.4; u.volume=save.settings.voiceVol;
    const v=voices.find(x=>/en/i.test(x.lang)&&/male|david|daniel|alex|fred|ralph|guy|aaron/i.test(x.name))||voices.find(x=>/^en/i.test(x.lang));
    if(v) u.voice=v; speechSynthesis.cancel(); speechSynthesis.speak(u);
  }catch(e){}
}
function bark(key, force){
  if(!force && sayT>0) return null;
  const arr=LINES[key]; if(!arr) return null;
  const line=pick(arr); sayT=force?2.2:8;
  if(save.settings.captions) caption(line);
  speak(line); return line;
}
const HAIR=['#c45512','#e07a28','#8a3a10','#f0a04a','#a34416','#d86a22'];

function yarn(ctx, ox, oy, n, spread, len, seed, width) {
  const rnd = mulberry32(seed);
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  for (let i = 0; i < n; i++) {
    const side = rnd() < 0.5 ? -1 : 1;
    const x0 = ox + (rnd() * 24 - 12), y0 = oy - 8 + rnd() * 16;
    const x1 = ox + side * (spread * (0.3 + rnd())), y1 = oy + len * (0.15 + rnd() * 0.4);
    const x2 = ox + side * (spread * (0.55 + rnd() * 0.7)), y2 = oy + len * (0.45 + rnd() * 0.7);
    ctx.strokeStyle = HAIR[i % HAIR.length];
    ctx.lineWidth = width * (0.65 + rnd() * 0.8);
    ctx.beginPath(); ctx.moveTo(x0, y0); ctx.quadraticCurveTo(x1, y1, x2, y2); ctx.stroke();
  }
}
function staple(ctx, x, y, ang, sc) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(ang); ctx.scale(sc || 1, sc || 1);
  ctx.strokeStyle = '#d5dbe2'; ctx.lineWidth = 1.6;
  ctx.strokeRect(-5, -3, 10, 6);
  ctx.beginPath();
  ctx.moveTo(-5, -3); ctx.lineTo(-5, -8);
  ctx.moveTo(5, -3); ctx.lineTo(5, -8);
  ctx.moveTo(-5, 3); ctx.lineTo(-5, 8);
  ctx.moveTo(5, 3); ctx.lineTo(5, 8);
  ctx.stroke(); ctx.restore();
}
function stitchesAlong(ctx, pts, sc) {
  ctx.save();
  ctx.strokeStyle = '#4a1c22'; ctx.lineWidth = 2.2 * sc; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
  ctx.stroke();
  ctx.strokeStyle = '#e6d2c4'; ctx.lineWidth = 1.3 * sc;
  for (let i = 0; i < pts.length - 1; i++) {
    const x0 = pts[i][0], y0 = pts[i][1], x1 = pts[i + 1][0], y1 = pts[i + 1][1];
    for (let s = 1; s <= 3; s++) {
      const t = s / 4, x = x0 + (x1 - x0) * t, y = y0 + (y1 - y0) * t;
      const dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy) || 1, px = -dy / L, py = dx / L;
      ctx.beginPath(); ctx.moveTo(x - px * 5 * sc, y - py * 5 * sc); ctx.lineTo(x + px * 5 * sc, y + py * 5 * sc); ctx.stroke();
    }
  }
  ctx.restore();
}
function paintFace(ctx, rage, sc) {
  ctx.save();
  const skin = ctx.createLinearGradient(0, -120 * sc, 0, 130 * sc);
  skin.addColorStop(0, '#e4d2be'); skin.addColorStop(0.45, '#c9ad92'); skin.addColorStop(0.75, '#b39078'); skin.addColorStop(1, '#8d6d5c');
  ctx.fillStyle = skin;
  ctx.beginPath();
  ctx.moveTo(-62 * sc, -88 * sc);
  ctx.bezierCurveTo(-78 * sc, -40 * sc, -74 * sc, 30 * sc, -36 * sc, 78 * sc);
  ctx.quadraticCurveTo(0, 128 * sc, 36 * sc, 78 * sc);
  ctx.bezierCurveTo(74 * sc, 30 * sc, 78 * sc, -40 * sc, 62 * sc, -88 * sc);
  ctx.quadraticCurveTo(0, -112 * sc, -62 * sc, -88 * sc);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = 'rgba(90,40,58,0.28)';
  ctx.beginPath(); ctx.ellipse(-38 * sc, 18 * sc, 18 * sc, 22 * sc, 0.2, 0, 7); ctx.fill();
  ctx.beginPath(); ctx.ellipse(34 * sc, 22 * sc, 16 * sc, 18 * sc, -0.3, 0, 7); ctx.fill();
  ctx.fillStyle = 'rgba(150,70,74,0.35)';
  ctx.beginPath();
  ctx.moveTo(-10 * sc, -78 * sc); ctx.quadraticCurveTo(-48 * sc, -20 * sc, -40 * sc, 36 * sc);
  ctx.quadraticCurveTo(-20 * sc, 20 * sc, -8 * sc, -40 * sc); ctx.fill();
  stitchesAlong(ctx, [[-6*sc,-84*sc],[-28*sc,-62*sc],[-46*sc,-28*sc],[-50*sc,4*sc],[-42*sc,36*sc],[-28*sc,58*sc]], sc);
  staple(ctx, -8*sc, -78*sc, -0.4, sc); staple(ctx, -36*sc, -36*sc, 0.6, sc);
  staple(ctx, -46*sc, 8*sc, 1.1, sc); staple(ctx, -30*sc, 48*sc, 0.3, sc);
  ctx.strokeStyle = 'rgba(70,40,36,0.7)'; ctx.lineWidth = 2 * sc;
  ctx.beginPath(); ctx.moveTo(-20*sc, -70*sc); ctx.quadraticCurveTo(0, -78*sc, 22*sc, -66*sc); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-10*sc, -60*sc); ctx.lineTo(8*sc, -52*sc); ctx.stroke();
  function eye(ex, ey, dir) {
    ctx.save(); ctx.translate(ex, ey); ctx.scale(1, 0.62);
    ctx.fillStyle = rage ? '#e7a8a4' : '#efc8c0';
    ctx.beginPath(); ctx.ellipse(0, 1 * sc, 15 * sc, 13 * sc, 0, 0, 7); ctx.fill(); ctx.restore();
    ctx.save(); ctx.translate(ex, ey);
    ctx.strokeStyle = 'rgba(160,24,24,0.85)'; ctx.lineWidth = 1.1 * sc;
    ctx.beginPath(); ctx.moveTo(-11*sc, 2*sc); ctx.lineTo(-1*sc, 0); ctx.lineTo(10*sc, 3*sc); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-8*sc, 4*sc); ctx.lineTo(7*sc, 5*sc); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-6*sc, -1*sc); ctx.lineTo(8*sc, -2*sc); ctx.stroke();
    ctx.fillStyle = '#c45a52'; ctx.beginPath(); ctx.ellipse(dir * 2 * sc, 1.5 * sc, 6.2 * sc, 5.2 * sc, 0, 0, 7); ctx.fill();
    ctx.fillStyle = '#6e7a40'; ctx.beginPath(); ctx.ellipse(dir * 2 * sc, 1.5 * sc, 3.6 * sc, 3.4 * sc, 0, 0, 7); ctx.fill();
    ctx.fillStyle = '#14080a'; ctx.beginPath(); ctx.ellipse(dir * 2.2 * sc, 1.6 * sc, 1.7 * sc, 2 * sc, 0, 0, 7); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.8)'; ctx.fillRect(dir * 0.2 * sc, -1 * sc, 2 * sc, 1.3 * sc);
    ctx.fillStyle = '#c9aa92';
    ctx.beginPath(); ctx.ellipse(0, -4.5 * sc, 15 * sc, 4.2 * sc, 0, Math.PI, 0); ctx.fill();
    ctx.strokeStyle = '#5c302c'; ctx.lineWidth = 1.5 * sc;
    ctx.beginPath(); ctx.moveTo(-14*sc, -1*sc); ctx.quadraticCurveTo(0, 7*sc, 14*sc, 0); ctx.stroke();
    ctx.restore();
  }
  eye(-26 * sc, -24 * sc, -1); eye(24 * sc, -22 * sc, 1);
  ctx.strokeStyle = '#4a2414'; ctx.lineWidth = 5 * sc; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-46*sc, -48*sc); ctx.quadraticCurveTo(-28*sc, -36*sc - rage * 6 * sc, -10*sc, -40*sc); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(46*sc, -46*sc); ctx.quadraticCurveTo(26*sc, -34*sc - rage * 6 * sc, 8*sc, -40*sc); ctx.stroke();
  ctx.strokeStyle = 'rgba(90,50,46,0.9)'; ctx.lineWidth = 1.6 * sc;
  ctx.beginPath(); ctx.moveTo(0, -18*sc); ctx.quadraticCurveTo(8*sc, 8*sc, 2*sc, 22*sc); ctx.stroke();
  ctx.fillStyle = 'rgba(80,40,40,0.45)';
  ctx.beginPath(); ctx.ellipse(-6*sc, 24*sc, 5*sc, 3.5*sc, 0.4, 0, 7); ctx.fill();
  ctx.beginPath(); ctx.ellipse(8*sc, 24*sc, 5*sc, 3.5*sc, -0.4, 0, 7); ctx.fill();
  const open = 16 * sc + rage * 10 * sc;
  ctx.fillStyle = '#2a0c10';
  ctx.beginPath();
  ctx.moveTo(-28*sc, 48*sc); ctx.quadraticCurveTo(0, 44*sc, 30*sc, 50*sc);
  ctx.lineTo(26*sc, 50*sc + open); ctx.quadraticCurveTo(0, 56*sc + open, -24*sc, 48*sc + open); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#8c3b42';
  ctx.fillRect(-22*sc, 48*sc, 44*sc, 4*sc);
  ctx.fillRect(-20*sc, 48*sc + open - 4*sc, 40*sc, 4*sc);
  ctx.fillStyle = '#f4f1ea';
  const up = [-18, -10, -2, 6, 14, 22];
  for (let i = 0; i < up.length; i++) {
    const h = (i === 2 ? 5 : 8) * sc;
    ctx.fillRect(up[i] * sc, 50 * sc, 4.2 * sc, h);
    if (i !== 3) ctx.fillRect((up[i] + 1) * sc, 48 * sc + open - 8 * sc, 3.6 * sc, 6 * sc);
  }
  ctx.restore();
}
function paintBody(ctx, sc, frame, side) {
  const bob = frame ? 3 * sc : 0;
  ctx.fillStyle = '#1e3a6e';
  ctx.fillRect(-22*sc, 78*sc, 16*sc, 70*sc + bob);
  ctx.fillRect(6*sc, 78*sc, 16*sc, 70*sc - bob);
  ctx.fillStyle = '#b42318';
  ctx.fillRect(-26*sc, 142*sc + bob, 24*sc, 12*sc);
  ctx.fillRect(4*sc, 142*sc - bob, 24*sc, 12*sc);
  ctx.fillStyle = '#f2f2f2';
  ctx.fillRect(-26*sc, 150*sc + bob, 24*sc, 4*sc);
  ctx.fillRect(4*sc, 150*sc - bob, 24*sc, 4*sc);
  ctx.fillStyle = '#ececec';
  ctx.fillRect(-22*sc, 144*sc + bob, 16*sc, 2*sc);
  ctx.fillRect(8*sc, 144*sc - bob, 16*sc, 2*sc);
  const stripes = ['#c23b2e','#f4f4f4','#2a6fbf','#f4f4f4','#2f8f4a','#e2c84b','#c23b2e','#f4f4f4','#2a6fbf'];
  for (let i = 0; i < stripes.length; i++) { ctx.fillStyle = stripes[i]; ctx.fillRect(-34*sc, (8 + i * 8)*sc, 68*sc, 8*sc); }
  ctx.fillStyle = '#243e86';
  ctx.fillRect(-30*sc, 48*sc, 60*sc, 40*sc);
  ctx.fillRect(-16*sc, 8*sc, 10*sc, 46*sc);
  ctx.fillRect(6*sc, 8*sc, 10*sc, 46*sc);
  ctx.fillStyle = '#e6c36a'; ctx.beginPath(); ctx.arc(0, 52*sc, 3.2*sc, 0, 7); ctx.fill();
  ctx.fillStyle = '#1a2e66'; ctx.fillRect(-22*sc, 62*sc, 16*sc, 12*sc);
  function arm(x, dir, knife) {
    ctx.save(); ctx.translate(x, 20 * sc);
    for (let i = 0; i < 6; i++) { ctx.fillStyle = stripes[i % stripes.length]; ctx.fillRect(0, i * 7 * sc, dir * 16 * sc, 7 * sc); }
    ctx.fillStyle = '#d7c3ae';
    const hx = dir * 16 * sc, hy = 40 * sc;
    ctx.fillRect(dir > 0 ? hx - 4 * sc : hx, hy, 12 * sc, 10 * sc);
    ctx.strokeStyle = '#6a4038'; ctx.lineWidth = 1 * sc;
    ctx.beginPath(); ctx.moveTo(dir > 0 ? hx - 2*sc : hx + 2*sc, hy); ctx.lineTo(dir > 0 ? hx - 2*sc : hx + 2*sc, hy + 10*sc); ctx.stroke();
    if (knife) {
      ctx.save(); ctx.translate(dir > 0 ? hx + 8*sc : hx - 4*sc, hy - 6*sc); ctx.rotate(dir > 0 ? -0.7 : 0.7);
      ctx.fillStyle = '#6b442c'; ctx.fillRect(-3*sc, 0, 6*sc, 16*sc);
      ctx.fillStyle = '#c5ccd4';
      ctx.beginPath(); ctx.moveTo(-3*sc, 0); ctx.lineTo(3*sc, 0); ctx.lineTo(1*sc, -46*sc); ctx.lineTo(-1*sc, -46*sc); ctx.closePath(); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.fillRect(-1*sc, -40*sc, 1.2*sc, 30*sc);
      ctx.restore();
    }
    ctx.restore();
  }
  if (side === 'E') arm(-8*sc, 1, true);
  else if (side === 'N') { arm(-36*sc, -1, false); arm(20*sc, 1, true); }
  else { arm(-40*sc, -1, false); arm(24*sc, 1, true); }
}
function drawPortrait(ctx, W, H, rage) {
  ctx.clearRect(0, 0, W, H);
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, '#16080c'); bg.addColorStop(0.5, '#2a1014'); bg.addColorStop(1, '#070406');
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
  const vg = ctx.createRadialGradient(W * 0.5, H * 0.42, 40, W * 0.5, H * 0.4, W * 0.75);
  vg.addColorStop(0, 'rgba(90,16,14,0.2)'); vg.addColorStop(1, 'rgba(0,0,0,0.82)');
  ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
  ctx.save();
  ctx.translate(W * 0.46, H * 0.48);
  const S = (W / 520) * 1.72;
  ctx.scale(S, S);
  ctx.fillStyle = '#cbb49a'; ctx.fillRect(-16, 108, 32, 28);
  stitchesAlong(ctx, [[-14, 118], [0, 124], [14, 116]], 0.8);
  ctx.fillStyle = '#8a3410';
  ctx.beginPath();
  ctx.moveTo(-70, -150); ctx.quadraticCurveTo(-120, -40, -100, 70);
  ctx.quadraticCurveTo(-40, 20, -8, 8);
  ctx.quadraticCurveTo(30, 36, 108, 78);
  ctx.quadraticCurveTo(120, -30, 64, -158);
  ctx.quadraticCurveTo(0, -128, -70, -150);
  ctx.closePath(); ctx.fill();
  yarn(ctx, 4, -80, 64, 96, 150, 7, 3.4);
  ctx.fillStyle = '#c9ad92';
  ctx.beginPath(); ctx.ellipse(-86, -18, 14, 22, 0.3, 0, 7); ctx.fill();
  ctx.beginPath(); ctx.ellipse(84, -12, 14, 22, -0.2, 0, 7); ctx.fill();
  ctx.save(); ctx.translate(2, 6); paintFace(ctx, rage ? 1 : 0.35, 1.08); ctx.restore();
  yarn(ctx, -6, -96, 18, 40, 48, 123, 2.4);
  yarn(ctx, 10, -92, 14, 36, 44, 77, 2.2);
  ctx.restore();
  const stripes = ['#c23b2e','#f4f4f4','#2a6fbf','#f4f4f4','#2f8f4a','#e2c84b'];
  const top = H * 0.78;
  for (let i = 0; i < stripes.length; i++) { ctx.fillStyle = stripes[i]; ctx.fillRect(W*0.18, top + i * (H*0.025), W*0.64, H*0.026); }
  ctx.fillStyle = '#243e86';
  ctx.fillRect(W*0.3, top + H*0.02, W*0.08, H*0.16);
  ctx.fillRect(W*0.58, top + H*0.02, W*0.08, H*0.16);
  ctx.fillRect(W*0.22, top + H*0.1, W*0.56, H*0.12);
  ctx.fillStyle = '#e6c36a'; ctx.beginPath(); ctx.arc(W*0.5, top + H*0.11, 5, 0, 7); ctx.fill();
  ctx.save(); ctx.translate(W * 0.78, H * 0.72); ctx.rotate(-0.55);
  ctx.fillStyle = '#4e3018'; ctx.fillRect(-11, 0, 22, 46);
  ctx.fillStyle = '#c9a06a'; ctx.fillRect(-12, -4, 24, 6);
  ctx.fillStyle = '#e7eef5';
  ctx.beginPath(); ctx.moveTo(-9, -4); ctx.lineTo(9, -4); ctx.lineTo(3, -168); ctx.lineTo(-3, -168); ctx.closePath(); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.9)'; ctx.fillRect(-2, -150, 3, 120);
  ctx.restore();
}
function drawSprite(ctx, facing, frame) {
  ctx.clearRect(0, 0, 240, 320);
  ctx.save(); ctx.translate(120, 168);
  const sc = 0.78;
  if (facing === 'N') {
    paintBody(ctx, sc, frame, 'N');
    ctx.fillStyle = '#9a3d12'; ctx.beginPath(); ctx.ellipse(0, -62, 46, 54, 0, 0, 7); ctx.fill();
    yarn(ctx, 0, -78, 26, 50, 80, 11 + frame, 4.5);
    ctx.restore(); return;
  }
  if (facing === 'E') {
    paintBody(ctx, sc, frame, 'E');
    ctx.fillStyle = '#9a3d12';
    ctx.beginPath();
    ctx.moveTo(-10, -120); ctx.lineTo(-30, -30); ctx.lineTo(8, -8); ctx.lineTo(36, -16);
    ctx.lineTo(48, -70); ctx.lineTo(8, -130); ctx.closePath(); ctx.fill();
    yarn(ctx, 6, -90, 16, 36, 70, 21, 4);
    ctx.save(); ctx.translate(8, -48); ctx.scale(0.62, 0.7);
    ctx.beginPath(); ctx.rect(-10, -140, 140, 280); ctx.clip();
    paintFace(ctx, 0.55, 1); ctx.restore();
    yarn(ctx, 10, -100, 8, 20, 36, 31, 3);
    ctx.restore(); return;
  }
  paintBody(ctx, sc, frame, 'S');
  ctx.fillStyle = '#8a3410';
  ctx.beginPath();
  ctx.moveTo(-52, -120); ctx.quadraticCurveTo(-70, -20, -48, 8);
  ctx.quadraticCurveTo(0, -16, 50, 6);
  ctx.quadraticCurveTo(72, -30, 50, -124);
  ctx.quadraticCurveTo(0, -100, -52, -120);
  ctx.closePath(); ctx.fill();
  yarn(ctx, 0, -70, 24, 58, 90, 5, 4);
  ctx.fillStyle = '#c9ad92';
  ctx.beginPath(); ctx.ellipse(-40, -36, 7, 10, 0.2, 0, 7); ctx.fill();
  ctx.beginPath(); ctx.ellipse(40, -34, 7, 10, -0.2, 0, 7); ctx.fill();
  ctx.save(); ctx.translate(0, -36); paintFace(ctx, 0.5, 0.62); ctx.restore();
  yarn(ctx, 0, -100, 14, 34, 40, 44, 3);
  ctx.restore();
}
let sprites = null;
function buildSprites() {
  sprites = { S: [], E: [], N: [] };
  for (const f of ['S', 'E', 'N']) for (let frame = 0; frame < 2; frame++) {
    const c = document.createElement('canvas'); c.width = 240; c.height = 320;
    drawSprite(c.getContext('2d'), f, frame); sprites[f][frame] = c;
  }
}
function roundRect(ctx, x, y, w, h, r) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath(); ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr); ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr); ctx.arcTo(x, y, x + w, y, rr); ctx.closePath();
}

function makeFloor(w, h, id, name, theme) {
  return { w, h, id, name, theme: theme || 'ridge', wall: new Uint8Array(w * h).fill(1), furn: new Uint8Array(w * h),
    kind: new Uint8Array(w * h), reserved: new Set(), rooms: [], doors: [], stairs: [], hides: [], decor: [],
    itemDefs: [], items: [], patrol: [], exit: null, cache: null };
}
function carve(f, x, y, w, h, kind, name) {
  for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) { const idx = j * f.w + i; f.wall[idx] = 0; f.kind[idx] = kind; }
  f.rooms.push({ x, y, w, h, name, seen: false });
  f.patrol.push({ x: (x + w / 2) * TILE, y: (y + h / 2) * TILE });
}
function neighborKind(f, x, y) {
  for (const [dx, dy] of [[1,0],[-1,0],[0,1],[0,-1]]) {
    const nx = x + dx, ny = y + dy;
    if (nx < 0 || ny < 0 || nx >= f.w || ny >= f.h) continue;
    const i = ny * f.w + nx; if (!f.wall[i]) return f.kind[i];
  }
  return 0;
}
function addDoor(f, x, y) { const i = y * f.w + x; f.wall[i] = 0; f.kind[i] = neighborKind(f, x, y); f.doors.push({ tx: x, ty: y, open: false, locked: false, timer: 0 }); f.reserved.add(i); }
function addStair(f, x, y, to, dx, dy) {
  const i = y * f.w + x; f.wall[i] = 0; if (!f.kind[i]) f.kind[i] = neighborKind(f, x, y);
  f.stairs.push({ tx: x, ty: y, to, dx, dy, x: x * TILE + TILE / 2, y: y * TILE + TILE / 2 }); f.reserved.add(i);
}
function addHide(f, x, y, kind) {
  const i = y * f.w + x; f.wall[i] = 0; if (!f.kind[i]) f.kind[i] = neighborKind(f, x, y);
  f.hides.push({ tx: x, ty: y, kind, x: x * TILE + TILE / 2, y: y * TILE + TILE / 2 }); f.reserved.add(i);
}
function addExit(f, x, y) {
  const i = y * f.w + x; f.wall[i] = 0; f.kind[i] = 0;
  f.exit = { tx: x, ty: y, x: x * TILE + TILE / 2, y: y * TILE + TILE / 2 }; f.reserved.add(i);
}
function addItem(f, x, y, kind) {
  const i = y * f.w + x;
  if (x < 0 || y < 0 || x >= f.w || y >= f.h || f.wall[i] || f.reserved.has(i)) return false;
  f.itemDefs.push({ tx: x, ty: y, kind, x: x * TILE + TILE / 2, y: y * TILE + TILE / 2, ph: (x * 3 + y) % 6 });
  f.reserved.add(i); return true;
}
function tryPut(f, tx, ty, tw, th, type, solid) {
  if (tw <= 0 || th <= 0) return false;
  for (let j = ty; j < ty + th; j++) for (let i = tx; i < tx + tw; i++) {
    if (i < 0 || j < 0 || i >= f.w || j >= f.h) return false;
    const idx = j * f.w + i;
    if (f.wall[idx] || f.reserved.has(idx)) return false;
    if (solid && f.furn[idx]) return false;
  }
  if (solid) for (let j = ty; j < ty + th; j++) for (let i = tx; i < tx + tw; i++) f.furn[j * f.w + i] = 1;
  f.decor.push({ x: tx * TILE, y: ty * TILE, w: tw * TILE, h: th * TILE, type });
  return true;
}
function furnish(f) {
  for (const r of f.rooms) {
    const n = r.name;
    if (n === 'Living Room') {
      tryPut(f, r.x + 1, r.y + 2, Math.min(6, r.w - 2), Math.min(4, r.h - 3), 'rug', false);
      tryPut(f, r.x + 1, r.y + 1, Math.min(4, r.w - 3), 2, 'couch', true);
      tryPut(f, r.x + 2, r.y + 4, Math.min(3, r.w - 4), 2, 'table', true);
      tryPut(f, r.x + 1, r.y + r.h - 2, 2, 1, 'tv', true);
    } else if (n === 'Kitchen') {
      tryPut(f, r.x + 1, r.y + 1, Math.min(4, r.w - 3), 1, 'counter', true);
      tryPut(f, r.x + r.w - 3, r.y + 1, 2, 2, 'fridge', true);
      tryPut(f, r.x + r.w - 3, r.y + 4, 2, 1, 'stove', true);
    } else if (n === 'Dining') tryPut(f, r.x + 2, r.y + 2, 3, 2, 'table', true);
    else if (n === 'Bathroom') {
      if (r.w <= 4 || r.h <= 5) tryPut(f, r.x + r.w - 2, r.y + 1, 1, 1, 'toilet', true);
      else { tryPut(f, r.x + 1, r.y + 1, 1, 1, 'toilet', true); tryPut(f, r.x + 1, r.y + 3, 2, 1, 'sink', true); tryPut(f, r.x + r.w - 3, r.y + r.h - 3, 2, 2, 'tub', true); }
    } else if (n === 'Bedroom' || n === 'Guest Room') {
      const bw = Math.min(4, r.w - 2), bh = Math.min(3, r.h - 2);
      tryPut(f, r.x + 1, r.y + 1, bw, bh, 'bed', true);
      tryPut(f, r.x + 1, r.y + bh + 2, 2, 1, 'dresser', true);
    } else if (n === 'Basement' || n === 'Cellar') {
      tryPut(f, r.x + 5, r.y + 3, 1, 1, 'pillar', true);
      tryPut(f, r.x + 9, r.y + 3, 1, 1, 'pillar', true);
      tryPut(f, r.x + 5, r.y + 8, 1, 1, 'pillar', true);
      tryPut(f, r.x + 9, r.y + 8, 1, 1, 'pillar', true);
      tryPut(f, r.x + r.w - 5, r.y + r.h - 5, 2, 2, 'boiler', true);
    } else if (n === 'Attic') {
      tryPut(f, r.x + 5, r.y + 3, 2, 2, 'crate', true);
      tryPut(f, r.x + 9, r.y + 6, 2, 2, 'crate', true);
    } else if (n === 'Hallway' || n === 'Upstairs Hall' || n === 'Entry') {
      tryPut(f, r.x + 1, r.y + 1, Math.min(3, r.w - 2), Math.min(2, r.h - 2), 'rug', false);
    }
  }
  f.decor.sort((a, b) => (a.type === 'rug' ? 0 : 1) - (b.type === 'rug' ? 0 : 1));
}
function buildHouses() {
  const ridge = { id: 'ridge', name: 'Ridge House', floors: [] };
  const g = makeFloor(28, 20, 'ground', 'Ground Floor', 'ridge');
  carve(g, 1, 1, 12, 8, 0, 'Living Room'); carve(g, 14, 1, 13, 8, 1, 'Kitchen');
  carve(g, 1, 10, 8, 8, 0, 'Hallway'); carve(g, 10, 10, 8, 8, 2, 'Dining'); carve(g, 19, 10, 8, 8, 1, 'Bathroom');
  addDoor(g, 13, 4); addDoor(g, 5, 9); addDoor(g, 15, 9); addDoor(g, 22, 9); addDoor(g, 9, 14); addDoor(g, 18, 13);
  addExit(g, 4, 18); addStair(g, 3, 15, 'upper', 3, 14); addStair(g, 25, 3, 'base', 3, 6);
  addHide(g, 11, 2, 'closet'); addHide(g, 25, 6, 'closet'); addHide(g, 16, 16, 'closet');
  addItem(g, 20, 5, 'charm'); addItem(g, 8, 6, 'battery'); addItem(g, 12, 14, 'battery'); addItem(g, 23, 15, 'battery');
  addItem(g, 15, 15, 'noise'); addItem(g, 6, 12, 'lock'); addItem(g, 8, 3, 'eye'); addItem(g, 21, 15, 'eye');
  const u = makeFloor(28, 20, 'upper', 'Upstairs', 'ridge');
  carve(u, 1, 1, 12, 9, 2, 'Bedroom'); carve(u, 14, 1, 6, 9, 1, 'Bathroom');
  carve(u, 21, 1, 6, 9, 2, 'Guest Room'); carve(u, 1, 11, 26, 7, 0, 'Upstairs Hall');
  addDoor(u, 6, 10); addDoor(u, 16, 10); addDoor(u, 23, 10);
  addStair(u, 3, 14, 'ground', 3, 15); addStair(u, 23, 14, 'attic', 3, 8);
  addHide(u, 4, 5, 'bed'); addHide(u, 10, 2, 'closet'); addHide(u, 23, 5, 'bed'); addHide(u, 25, 7, 'closet');
  addItem(u, 8, 4, 'charm'); addItem(u, 18, 4, 'eye'); addItem(u, 12, 14, 'eye');
  addItem(u, 8, 15, 'battery'); addItem(u, 20, 13, 'lock'); addItem(u, 24, 6, 'noise');
  const a = makeFloor(18, 12, 'attic', 'Attic', 'ridge');
  carve(a, 1, 1, 16, 10, 0, 'Attic'); addStair(a, 3, 8, 'upper', 23, 14); addHide(a, 14, 3, 'closet');
  addItem(a, 12, 8, 'battery'); addItem(a, 5, 4, 'noise');
  const b = makeFloor(20, 14, 'base', 'Basement', 'ridge');
  carve(b, 1, 1, 18, 12, 3, 'Basement'); addStair(b, 3, 6, 'ground', 25, 3); addHide(b, 16, 3, 'closet');
  addItem(b, 8, 10, 'charm'); addItem(b, 4, 10, 'battery'); addItem(b, 16, 8, 'eye'); addItem(b, 12, 6, 'lock');
  ridge.floors = [g, u, a, b];
  const cabin = { id: 'cabin', name: 'Lakeside Cabin', floors: [] };
  const m = makeFloor(24, 18, 'main', 'Cabin', 'cabin');
  carve(m, 1, 1, 8, 7, 1, 'Kitchen'); carve(m, 10, 1, 13, 10, 0, 'Living Room');
  carve(m, 1, 9, 8, 8, 0, 'Entry'); carve(m, 10, 12, 8, 5, 2, 'Bedroom'); carve(m, 19, 12, 4, 5, 1, 'Bathroom');
  addDoor(m, 9, 4); addDoor(m, 4, 8); addDoor(m, 9, 14); addDoor(m, 13, 11); addDoor(m, 18, 14);
  addExit(m, 3, 17); addStair(m, 2, 3, 'cellar', 2, 8);
  addHide(m, 20, 2, 'closet'); addHide(m, 12, 16, 'bed'); addHide(m, 15, 13, 'closet');
  addItem(m, 16, 5, 'charm'); addItem(m, 14, 15, 'charm'); addItem(m, 4, 4, 'battery'); addItem(m, 6, 12, 'battery');
  addItem(m, 18, 4, 'noise'); addItem(m, 4, 14, 'lock');
  addItem(m, 21, 3, 'eye'); addItem(m, 6, 2, 'eye'); addItem(m, 20, 14, 'eye'); addItem(m, 15, 6, 'eye'); addItem(m, 3, 11, 'eye');
  const c = makeFloor(16, 12, 'cellar', 'Cellar', 'cabin');
  carve(c, 1, 1, 14, 10, 3, 'Cellar'); addStair(c, 2, 8, 'main', 2, 3); addHide(c, 12, 2, 'closet');
  addItem(c, 10, 6, 'charm'); addItem(c, 5, 5, 'battery'); addItem(c, 8, 8, 'noise');
  cabin.floors = [m, c];
  for (const h of [ridge, cabin]) {
    h.byId = {};
    h.floors.forEach((f, i) => { f.index = i; f.house = h; h.byId[f.id] = f; furnish(f); bakeFloor(f); });
  }
  return [ridge, cabin];
}
function drawDecor(ctx, d) {
  const { x, y, w, h, type } = d;
  if (type !== 'rug') { ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.beginPath(); ctx.ellipse(x + w / 2, y + h - 3, Math.max(6, w * 0.38), 5, 0, 0, 7); ctx.fill(); }
  if (type === 'rug') { ctx.fillStyle = '#642433'; ctx.fillRect(x, y, w, h); ctx.strokeStyle = '#c4a574'; ctx.lineWidth = 3; ctx.strokeRect(x + 5, y + 5, w - 10, h - 10); }
  else if (type === 'couch') { ctx.fillStyle = '#4a2c38'; roundRect(ctx, x, y, w, h, 6); ctx.fill(); ctx.fillStyle = '#6a4050'; roundRect(ctx, x + 4, y + 4, w - 8, h * 0.42, 4); ctx.fill(); }
  else if (type === 'table') { ctx.fillStyle = '#6b4a2c'; roundRect(ctx, x + 3, y + 3, w - 6, h - 6, 3); ctx.fill(); ctx.strokeStyle = '#e2d0b0'; ctx.strokeRect(x + 7, y + 7, w - 14, h - 14); }
  else if (type === 'tv') { ctx.fillStyle = '#101014'; ctx.fillRect(x, y, w, h); ctx.fillStyle = '#163844'; ctx.fillRect(x + 3, y + 3, w - 6, h - 7); }
  else if (type === 'bed') { ctx.fillStyle = '#3a2a24'; ctx.fillRect(x, y, w, h); ctx.fillStyle = '#7a3044'; ctx.fillRect(x + 4, y + h * 0.38, w - 8, h * 0.55); ctx.fillStyle = '#e4dcd2'; ctx.fillRect(x + 6, y + 4, w - 12, Math.max(6, h * 0.26)); }
  else if (type === 'fridge') { ctx.fillStyle = '#d5dbe0'; ctx.fillRect(x, y, w, h); ctx.fillStyle = '#8e9aa2'; ctx.fillRect(x + 3, y + h * 0.4, w - 6, 3); }
  else if (type === 'counter') { ctx.fillStyle = '#8d9294'; ctx.fillRect(x, y, w, h); ctx.fillStyle = '#5a4030'; ctx.fillRect(x, y + h - 5, w, 5); }
  else if (type === 'stove') { ctx.fillStyle = '#2a2c2e'; ctx.fillRect(x, y, w, h); ctx.strokeStyle = '#9aa'; ctx.strokeRect(x + 3, y + 3, w / 2 - 6, h - 6); ctx.strokeRect(x + w / 2 + 2, y + 3, w / 2 - 6, h - 6); }
  else if (type === 'toilet') { ctx.fillStyle = '#e7eeec'; ctx.fillRect(x + w * 0.2, y, w * 0.6, h * 0.45); ctx.beginPath(); ctx.ellipse(x + w / 2, y + h * 0.65, w * 0.32, h * 0.22, 0, 0, 7); ctx.fill(); }
  else if (type === 'sink') { ctx.fillStyle = '#d5dbdb'; ctx.fillRect(x, y, w, h); ctx.fillStyle = '#8ecad2'; ctx.beginPath(); ctx.ellipse(x + w / 2, y + h / 2, w * 0.22, h * 0.28, 0, 0, 7); ctx.fill(); }
  else if (type === 'tub') { ctx.fillStyle = '#e3eaec'; roundRect(ctx, x, y, w, h, 8); ctx.fill(); ctx.fillStyle = '#9ed0d4'; roundRect(ctx, x + 4, y + 4, w - 8, h - 8, 6); ctx.fill(); }
  else if (type === 'dresser') { ctx.fillStyle = '#5a3a28'; ctx.fillRect(x, y, w, h); ctx.strokeStyle = '#d2c0a4'; ctx.strokeRect(x + 3, y + 3, w - 6, h / 2 - 5); ctx.strokeRect(x + 3, y + h / 2 + 1, w - 6, h / 2 - 5); }
  else if (type === 'crate') { ctx.fillStyle = '#7a5434'; ctx.fillRect(x, y, w, h); ctx.strokeStyle = '#3a2818'; ctx.lineWidth = 2; ctx.strokeRect(x + 2, y + 2, w - 4, h - 4); ctx.beginPath(); ctx.moveTo(x + 2, y + 2); ctx.lineTo(x + w - 2, y + h - 2); ctx.moveTo(x + w - 2, y + 2); ctx.lineTo(x + 2, y + h - 2); ctx.stroke(); }
  else if (type === 'boiler') { ctx.fillStyle = '#4a5056'; ctx.fillRect(x + w * 0.22, y, w * 0.56, h); ctx.fillStyle = '#2e3236'; ctx.fillRect(x, y + h * 0.25, w, h * 0.22); ctx.fillStyle = '#d4543c'; ctx.fillRect(x + w * 0.4, y + 5, w * 0.18, 7); }
  else if (type === 'pillar') { ctx.fillStyle = '#3c4148'; ctx.fillRect(x + 3, y + 3, w - 6, h - 6); ctx.fillStyle = '#6a7078'; ctx.fillRect(x + 5, y + 3, 3, h - 6); }
}
function bakeFloor(f) {
  const c = document.createElement('canvas'); c.width = f.w * TILE; c.height = f.h * TILE;
  const ctx = c.getContext('2d');
  for (let y = 0; y < f.h; y++) for (let x = 0; x < f.w; x++) {
    const i = y * f.w + x, px = x * TILE, py = y * TILE;
    const rnd = mulberry32((x + 1) * 92821 ^ (y + 3) * 68917 ^ (f.index + 1) * 17);
    if (f.wall[i]) {
      const cabin = f.theme === 'cabin';
      ctx.fillStyle = cabin ? (rnd() < 0.5 ? '#24302a' : '#2c3830') : (rnd() < 0.5 ? '#2a2428' : '#342c30');
      ctx.fillRect(px, py, TILE, TILE);
      ctx.fillStyle = 'rgba(255,255,255,0.045)'; ctx.fillRect(px, py, TILE, 3);
      ctx.fillStyle = 'rgba(0,0,0,0.4)'; ctx.fillRect(px, py + TILE - 5, TILE, 5);
      ctx.globalAlpha = 0.22; ctx.fillStyle = '#000'; ctx.fillRect(px, py + ((TILE * rnd()) | 0), TILE, 1); ctx.globalAlpha = 1;
    } else {
      const k = f.kind[i]; let base;
      if (k === 1) base = rnd() < 0.5 ? '#6e7e86' : '#61727a';
      else if (k === 2) base = rnd() < 0.5 ? '#5c2432' : '#4a1e2a';
      else if (k === 3) base = rnd() < 0.5 ? '#3a3e44' : '#31353b';
      else if (f.theme === 'cabin') base = rnd() < 0.5 ? '#6e5438' : '#5d4630';
      else base = rnd() < 0.34 ? '#6b4630' : rnd() < 0.5 ? '#7a5338' : '#5a3c2a';
      ctx.fillStyle = base; ctx.fillRect(px, py, TILE, TILE);
      ctx.globalAlpha = 0.22;
      if (k === 0) { ctx.fillStyle = '#24160e'; for (let p = 1; p < 4; p++) ctx.fillRect(px, py + p * (TILE / 4), TILE, 1); ctx.fillStyle = '#e6c8a4'; ctx.globalAlpha = 0.12; ctx.fillRect(px + 2 + (rnd() * 6), py + 3, 1, TILE - 6); }
      else if (k === 1) { ctx.strokeStyle = 'rgba(220,235,238,0.35)'; ctx.strokeRect(px + 1.5, py + 1.5, TILE - 3, TILE - 3); }
      else if (k === 3 && rnd() < 0.5) { ctx.fillStyle = '#1a1c1e'; ctx.fillRect(px + rnd() * TILE, py + rnd() * TILE, 4, 2); }
      ctx.globalAlpha = 1;
      ctx.fillStyle = 'rgba(0,0,0,0.32)';
      if (y > 0 && f.wall[i - f.w]) ctx.fillRect(px, py, TILE, 7);
      if (x > 0 && f.wall[i - 1]) ctx.fillRect(px, py, 7, TILE);
      if (x + 1 < f.w && f.wall[i + 1]) ctx.fillRect(px + TILE - 7, py, 7, TILE);
      if (y + 1 < f.h && f.wall[i + f.w]) ctx.fillRect(px, py + TILE - 8, TILE, 8);
    }
  }
  for (const d of f.decor) drawDecor(ctx, d);
  for (const h of f.hides) {
    const x = h.tx * TILE, y = h.ty * TILE;
    if (h.kind === 'closet') {
      ctx.fillStyle = '#2a211c'; ctx.fillRect(x + 4, y + 3, TILE - 8, TILE - 6);
      ctx.strokeStyle = '#a88868'; ctx.lineWidth = 2; ctx.strokeRect(x + 6, y + 5, TILE - 12, TILE - 10);
      ctx.beginPath(); ctx.moveTo(x + TILE / 2, y + 6); ctx.lineTo(x + TILE / 2, y + TILE - 6); ctx.stroke();
      ctx.fillStyle = '#e6c36a'; ctx.fillRect(x + TILE / 2 + 3, y + TILE / 2, 3, 3);
    } else {
      ctx.fillStyle = 'rgba(0,0,0,0.55)'; ctx.fillRect(x + 4, y + TILE - 12, TILE - 8, 8);
      ctx.fillStyle = '#3a2a24'; ctx.fillRect(x + 2, y + 4, TILE - 4, 8);
    }
  }
  f.cache = c;
}

let houses = [], house = null, diff = DIFFS.normal, mode = 'menu';
let player, chucky, beepers, run, explored = [], camX = 0, camY = 0;
const keys = {};
const input = { jx: 0, jy: 0, sprint: false, breath: false, aiming: false };
const dust = Array.from({ length: 42 }, (_, i) => ({ spread: (Math.random() - 0.5) * 0.9, dist: 24 + Math.random() * 210, sp: 0.6 + Math.random() * 1.6, t: Math.random() * 6, s: 1 + (i % 3) }));
let grainPat = null, fpsVal = 0, fpsFrames = 0, fpsAcc = 0, blackout = 0, scareCd = 0, heartT = 0, stepT = 0, idleT = 18;
let lowbatSaid = false, lured = false, mapFi = 0, lastTs = 0, dpr = 1, viewW = 1, viewH = 1, anim = 0, pointerAim = false;
const canvas = document.getElementById('view');
const ctx = canvas.getContext('2d', { alpha: false });
const lightC = document.createElement('canvas');
const lctx = lightC.getContext('2d');
function resetRunState() {
  for (const f of house.floors) {
    f.items = f.itemDefs.map(d => Object.assign({ alive: true }, d));
    for (const d of f.doors) { d.open = false; d.locked = false; d.timer = 0; }
    for (const r of f.rooms) r.seen = false;
  }
  explored = house.floors.map(f => new Uint8Array(f.w * f.h));
  const start = house.id === 'ridge' ? { fi: 0, x: 7 * TILE + TILE / 2, y: 6 * TILE + TILE / 2 } : { fi: 0, x: 4 * TILE + TILE / 2, y: 12 * TILE + TILE / 2 };
  const gear = diff.id === 'easy' ? { bat: 100, noise: 2, lock: 2 } : diff.id === 'hard' ? { bat: 58, noise: 1, lock: 0 } : { bat: 80, noise: 1, lock: 1 };
  player = { fi: start.fi, x: start.x, y: start.y, aim: -0.6, stamina: 100, battery: gear.bat, flash: true, charms: 0, eyes: 0, noise: gear.noise, locks: gear.lock, hidden: null, breath: false, moving: false, flicker: 0 };
  const cf = house.id === 'ridge' ? 3 : 1;
  const spot = house.floors[cf].patrol[0] || { x: 5 * TILE, y: 5 * TILE };
  chucky = { fi: cf, x: spot.x, y: spot.y, face: 'S', frame: 0, moving: false, state: 'wait', delay: diff.delay, path: [], repath: 0, wait: 0, goal: null, hear: null, stun: 0, checkT: 0, checkHide: null, lost: 0, stepT: 0.4 };
  beepers = [];
  run = { elapsed: 0, houseId: house.id, diff: diff.id, over: false };
  blackout = 0; scareCd = 0; lowbatSaid = false; lured = false; idleT = 16; sayT = 0; mapFi = 0;
}
function tileBlocks(f, tx, ty) {
  if (tx < 0 || ty < 0 || tx >= f.w || ty >= f.h) return true;
  const i = ty * f.w + tx;
  if (f.wall[i] || f.furn[i]) return true;
  const d = doorAt(f, tx, ty); if (d && !d.open) return true;
  return false;
}
function pathBlocked(f, tx, ty) { if (tx < 0 || ty < 0 || tx >= f.w || ty >= f.h) return true; const i = ty * f.w + tx; return !!(f.wall[i] || f.furn[i]); }
function doorAt(f, tx, ty) { for (const d of f.doors) if (d.tx === tx && d.ty === ty) return d; return null; }
function blockedPx(f, x, y) {
  const r = 10;
  for (const [dx, dy] of [[0,0],[r,0],[-r,0],[0,r],[0,-r]]) if (tileBlocks(f, Math.floor((x + dx) / TILE), Math.floor((y + dy) / TILE))) return true;
  return false;
}
function moveCircle(f, ent, dx, dy) {
  if (!blockedPx(f, ent.x + dx, ent.y)) ent.x += dx;
  if (!blockedPx(f, ent.x, ent.y + dy)) ent.y += dy;
}
function roomAt(f, x, y) {
  const tx = Math.floor(x / TILE), ty = Math.floor(y / TILE);
  for (const r of f.rooms) if (tx >= r.x && ty >= r.y && tx < r.x + r.w && ty < r.y + r.h) return r;
  return null;
}
function los(f, x0, y0, x1, y1) {
  const d = Math.hypot(x1 - x0, y1 - y0), n = Math.max(1, Math.ceil(d / 8));
  for (let i = 1; i < n; i++) {
    const t = i / n, x = x0 + (x1 - x0) * t, y = y0 + (y1 - y0) * t;
    if (tileBlocks(f, Math.floor(x / TILE), Math.floor(y / TILE))) return false;
  }
  return true;
}
function bfs(f, sx, sy, tx, ty) {
  const w = f.w, h = f.h, N = w * h;
  if (sx === tx && sy === ty) return [];
  const prev = new Int32Array(N); prev.fill(-1);
  const q = new Int32Array(N); let qs = 0, qe = 0;
  const s = sy * w + sx, g = ty * w + tx;
  if (s < 0 || g < 0 || s >= N || g >= N) return null;
  q[qe++] = s; prev[s] = s;
  while (qs < qe) {
    const cur = q[qs++]; if (cur === g) break;
    const cx = cur % w; const dirs = [1, -1, w, -w];
    for (let k = 0; k < 4; k++) {
      const nb = cur + dirs[k];
      if (nb < 0 || nb >= N || prev[nb] !== -1) continue;
      const nx = nb % w;
      if (k === 0 && nx !== cx + 1) continue;
      if (k === 1 && nx !== cx - 1) continue;
      if (pathBlocked(f, nx, (nb / w) | 0)) continue;
      prev[nb] = cur; q[qe++] = nb;
    }
  }
  if (prev[g] === -1) return null;
  const cells = []; let c = g, guard = 0;
  while (c !== s && guard++ < N) { cells.push({ x: (c % w) * TILE + TILE / 2, y: ((c / w) | 0) * TILE + TILE / 2, tx: c % w, ty: (c / w) | 0 }); c = prev[c]; }
  cells.reverse(); return cells;
}
function floorHop(fromFi, toFi) {
  if (fromFi === toFi) return null;
  const floors = house.floors, prev = new Array(floors.length).fill(null), q = [fromFi];
  prev[fromFi] = { parent: -1, stair: null };
  while (q.length) {
    const c = q.shift();
    for (const s of floors[c].stairs) {
      const ni = floors.findIndex(fl => fl.id === s.to);
      if (ni < 0 || prev[ni]) continue;
      prev[ni] = { parent: c, stair: s }; q.push(ni);
    }
  }
  if (!prev[toFi]) return null;
  let cursor = toFi, first = null;
  while (cursor !== fromFi) { const p = prev[cursor]; if (!p) return null; first = p.stair; cursor = p.parent; }
  return first;
}
function hearNoise(n) {
  if (!chucky || !run || run.over) return;
  let d = n.fi === chucky.fi ? dist(chucky.x, chucky.y, n.x, n.y) : (n.radius < 300 ? 9999 : 240);
  if (d <= n.radius * diff.hear) {
    chucky.hear = { fi: n.fi, x: n.x, y: n.y }; chucky.state = 'investigate'; chucky.delay = 0;
    if (n.lure && !lured) { lured = true; unlock('lure'); bark('lure'); }
  }
}
function seesPlayer() {
  if (chucky.fi !== player.fi || player.hidden) return false;
  const d = dist(chucky.x, chucky.y, player.x, player.y);
  let sight = diff.sight; if (!player.flash) sight *= 0.42;
  if (player.moving && (input.sprint || keys.ShiftLeft || keys.ShiftRight)) sight *= 1.12;
  if (d > sight) return false;
  return los(house.floors[player.fi], chucky.x, chucky.y, player.x, player.y);
}
function updateChucky(dt) {
  const f = house.floors[chucky.fi];
  if (chucky.stun > 0) { chucky.stun -= dt; chucky.moving = false; return; }
  if (chucky.delay > 0) { chucky.delay -= dt; chucky.state = 'wait'; return; }
  if (seesPlayer()) { chucky.state = 'chase'; chucky.goal = { fi: player.fi, x: player.x, y: player.y }; chucky.lost = 0; }
  else if (chucky.state === 'chase') { chucky.lost += dt; if (chucky.lost > 2.1) { chucky.state = 'search'; chucky.wait = 2.4; bark('search'); } }
  if (chucky.hear && chucky.state !== 'chase') {
    chucky.state = 'investigate'; chucky.goal = chucky.hear;
    if (chucky.fi === chucky.hear.fi && dist(chucky.x, chucky.y, chucky.hear.x, chucky.hear.y) < 22) { chucky.hear = null; chucky.state = 'search'; chucky.wait = 2.2; }
  }
  if (chucky.state === 'search') {
    chucky.wait -= dt;
    const near = f.hides.find(h => dist(chucky.x, chucky.y, h.x, h.y) < 52);
    if (near) {
      if (chucky.checkHide !== near) { chucky.checkHide = near; chucky.checkT = 0; }
      chucky.checkT += dt;
      if (player.hidden === near) {
        if (chucky.checkT > diff.checkT * 0.45 && player.breath) bark('breath');
        if (chucky.checkT >= diff.checkT) {
          if (player.breath && player.stamina > 0) {
            unlock('breath'); bark('miss', true); chucky.state = 'patrol'; chucky.checkHide = null; chucky.checkT = 0;
            const p = f.patrol[(Math.random() * f.patrol.length) | 0]; chucky.goal = { fi: chucky.fi, x: p.x, y: p.y };
          } else doCatch();
          return;
        }
      } else if (chucky.checkT > 0.45) { chucky.checkHide = null; chucky.checkT = 0; }
    } else { chucky.checkHide = null; chucky.checkT = 0; }
    if (chucky.wait <= 0 && chucky.state === 'search') chucky.state = 'patrol';
  }
  const atGoal = chucky.goal && chucky.goal.fi === chucky.fi && dist(chucky.x, chucky.y, chucky.goal.x, chucky.goal.y) < 16;
  if (chucky.state === 'patrol' && (!chucky.goal || atGoal)) {
    if (atGoal) chucky.wait -= dt;
    if (!chucky.goal || chucky.wait <= 0) {
      let fi = Math.random() < 0.35 ? (Math.random() * house.floors.length) | 0 : chucky.fi;
      const pf = house.floors[fi], p = pf.patrol[(Math.random() * pf.patrol.length) | 0];
      chucky.goal = { fi, x: p.x, y: p.y }; chucky.wait = 0.8 + Math.random() * 1.4; chucky.path = [];
    } else if (atGoal) { chucky.moving = false; return; }
  }
  if (!chucky.goal) return;
  let target = chucky.goal;
  if (target.fi !== chucky.fi) {
    const stair = floorHop(chucky.fi, target.fi);
    if (!stair) { chucky.goal = null; return; }
    target = { fi: chucky.fi, x: stair.x, y: stair.y, stair };
  }
  chucky.repath -= dt;
  if (chucky.repath <= 0 || !chucky.path) {
    const sx = clamp(Math.floor(chucky.x / TILE), 0, f.w - 1), sy = clamp(Math.floor(chucky.y / TILE), 0, f.h - 1);
    const tx = clamp(Math.floor(target.x / TILE), 0, f.w - 1), ty = clamp(Math.floor(target.y / TILE), 0, f.h - 1);
    chucky.path = bfs(f, sx, sy, tx, ty) || [];
    chucky.repath = chucky.state === 'chase' ? 0.32 : 0.55;
  }
  const wp = chucky.path[0];
  if (!wp) {
    if (target.stair && dist(chucky.x, chucky.y, target.x, target.y) < 22) {
      const dest = house.byId[target.stair.to];
      chucky.fi = dest.index; chucky.x = target.stair.dx * TILE + TILE / 2; chucky.y = target.stair.dy * TILE + TILE / 2;
      chucky.path = []; chucky.repath = 0;
    }
    chucky.moving = false; return;
  }
  const door = doorAt(f, wp.tx, wp.ty);
  if (door && !door.open && dist(chucky.x, chucky.y, wp.x, wp.y) < TILE * 1.15) {
    door.timer += dt;
    if (door.timer >= (door.locked ? diff.breakT : diff.openT)) {
      if (door.locked) bark('lock');
      door.locked = false; door.open = true; door.timer = 0;
      hearNoise({ fi: chucky.fi, x: wp.x, y: wp.y, radius: 220 });
    }
    chucky.moving = false; return;
  }
  const dx = wp.x - chucky.x, dy = wp.y - chucky.y, L = Math.hypot(dx, dy) || 1;
  const sp = chucky.state === 'chase' ? diff.cSpeed * 1.08 : diff.cSpeed;
  if (L < 6) chucky.path.shift();
  else {
    moveCircle(f, chucky, dx / L * sp * dt, dy / L * sp * dt);
    chucky.moving = true;
    if (Math.abs(dx) > Math.abs(dy)) chucky.face = dx > 0 ? 'E' : 'W'; else chucky.face = dy > 0 ? 'S' : 'N';
  }
  if (chucky.fi === player.fi && !player.hidden) {
    const d = dist(chucky.x, chucky.y, player.x, player.y);
    if (d < 30 && los(f, chucky.x, chucky.y, player.x, player.y)) doCatch();
    else if (d < 64 && los(f, chucky.x, chucky.y, player.x, player.y) && scareCd <= 0) {
      bark('close'); unlock('close'); if (save.settings.scare) showScare(); scareCd = 16;
    }
  }
  if (chucky.moving && chucky.fi === player.fi) {
    const d = dist(chucky.x, chucky.y, player.x, player.y);
    if (d < 340) { chucky.stepT -= dt; if (chucky.stepT <= 0) { chucky.stepT = 0.46; playStep(clamp(1 - d / 340, 0.05, 1) * 0.7); } }
  }
}
function updatePlayer(dt) {
  const f = house.floors[player.fi];
  let mx = 0, my = 0;
  if (keys.KeyW || keys.ArrowUp) my -= 1;
  if (keys.KeyS || keys.ArrowDown) my += 1;
  if (keys.KeyA || keys.ArrowLeft) mx -= 1;
  if (keys.KeyD || keys.ArrowRight) mx += 1;
  if (mx || my) { const L = Math.hypot(mx, my) || 1; mx /= L; my /= L; }
  else if (input.jx || input.jy) { mx = input.jx; my = input.jy; const L = Math.hypot(mx, my) || 1; if (L > 1) { mx /= L; my /= L; } }
  const sprinting = (keys.ShiftLeft || keys.ShiftRight || input.sprint) && player.stamina > 1 && !player.hidden;
  player.breath = !!(input.breath || keys.Space) && !!player.hidden && player.stamina > 0;
  if (player.hidden) { mx = 0; my = 0; }
  const moving = !!(mx || my); player.moving = moving;
  const sp = sprinting && moving ? SPRINT : WALK;
  if (moving) { moveCircle(f, player, mx * sp * dt, my * sp * dt); if (!input.aiming && !pointerAim) player.aim = Math.atan2(my, mx); }
  if (sprinting && moving) player.stamina -= diff.stam * dt;
  else if (player.breath) player.stamina -= 30 * dt;
  else player.stamina = Math.min(100, player.stamina + 18 * dt);
  if (player.stamina <= 0) { player.stamina = 0; if (player.breath) { player.breath = false; hearNoise({ fi: player.fi, x: player.x, y: player.y, radius: 170 }); } }
  if (player.flash) { player.battery -= diff.bat * dt; if (player.battery <= 0) { player.battery = 0; player.flash = false; if (!lowbatSaid) { lowbatSaid = true; bark('lowbat'); } } }
  if (!player.flash && chucky.fi === player.fi) { blackout += dt; if (blackout > 20) unlock('blackout'); } else if (player.flash) blackout = 0;
  if (sprinting && moving && !player.breath) { stepT -= dt; if (stepT <= 0) { stepT = 0.28; playStep(0.8); hearNoise({ fi: player.fi, x: player.x, y: player.y, radius: 230 }); bark('sprint'); } }
  else if (moving) { stepT -= dt; if (stepT <= 0) { stepT = 0.42; playStep(0.45); } }
  const tx = Math.floor(player.x / TILE), ty = Math.floor(player.y / TILE), rad = player.flash ? 5 : 2, ex = explored[player.fi];
  for (let j = -rad; j <= rad; j++) for (let i = -rad; i <= rad; i++) {
    if (i * i + j * j > rad * rad) continue;
    const x = tx + i, y = ty + j; if (x < 0 || y < 0 || x >= f.w || y >= f.h) continue; ex[y * f.w + x] = 1;
  }
  const rm = roomAt(f, player.x, player.y);
  if (rm && !rm.seen) { rm.seen = true; for (let j = rm.y; j < rm.y + rm.h; j++) for (let i = rm.x; i < rm.x + rm.w; i++) ex[j * f.w + i] = 1; }
  for (const it of f.items) if (it.alive && dist(player.x, player.y, it.x, it.y) < 22) pickup(it);
  if (player.battery < 22 && player.battery > 0 && player.flash && Math.random() < dt * 8) player.flicker = 0.12;
  if (player.flicker > 0) player.flicker -= dt;
  scareCd = Math.max(0, scareCd - dt); idleT -= dt;
  if (idleT <= 0) { idleT = 24 + Math.random() * 8; if (chucky.state === 'patrol') bark('idle'); }
}
function pickup(it) {
  it.alive = false; playPickup();
  if (it.kind === 'charm') { player.charms++; bark('charm'); if (player.charms >= 3) unlock('charms'); }
  else if (it.kind === 'eye') { player.eyes++; const total = house.floors.reduce((n, f) => n + f.itemDefs.filter(d => d.kind === 'eye').length, 0); if (player.eyes >= total) unlock('eyes'); }
  else if (it.kind === 'battery') { player.battery = Math.min(100, player.battery + 46); player.flash = true; unlock('juice'); }
  else if (it.kind === 'noise') player.noise = Math.min(4, player.noise + 1);
  else if (it.kind === 'lock') player.locks = Math.min(4, player.locks + 1);
}
function nearestDoor() {
  const f = house.floors[player.fi]; let best = null, bd = 48;
  for (const d of f.doors) { const dd = dist(player.x, player.y, d.tx * TILE + TILE / 2, d.ty * TILE + TILE / 2); if (dd < bd) { bd = dd; best = d; } }
  return best;
}
function nearestHide() {
  const f = house.floors[player.fi]; let best = null, bd = 34;
  for (const h of f.hides) { const dd = dist(player.x, player.y, h.x, h.y); if (dd < bd) { bd = dd; best = h; } }
  return best;
}
function nearestStair() {
  const f = house.floors[player.fi]; let best = null, bd = 34;
  for (const s of f.stairs) { const dd = dist(player.x, player.y, s.x, s.y); if (dd < bd) { bd = dd; best = s; } }
  return best;
}
function contextLabel() {
  if (!player) return '';
  if (player.hidden) return 'USE  leave hiding';
  const f = house.floors[player.fi]; let bd = 36, label = '';
  for (const it of f.items) if (it.alive) { const dd = dist(player.x, player.y, it.x, it.y); if (dd < bd) { bd = dd; label = 'USE  take ' + it.kind; } }
  const h = nearestHide();
  if (h) { const dd = dist(player.x, player.y, h.x, h.y); if (dd < bd) { label = h.kind === 'bed' ? 'USE  under the bed' : 'USE  closet'; bd = dd; } }
  const d = nearestDoor();
  if (d) { const dd = dist(player.x, player.y, d.tx * TILE + TILE / 2, d.ty * TILE + TILE / 2); if (dd < 42 && dd < bd + 8) label = d.open ? 'USE  slam door' : 'USE  open door'; }
  const s = nearestStair(); if (s && dist(player.x, player.y, s.x, s.y) <= 32) label = 'USE  stairs';
  if (f.exit && dist(player.x, player.y, f.exit.x, f.exit.y) < 40) label = player.charms >= 3 ? 'USE  escape' : 'Front door needs 3 charms';
  return label;
}
function useAction() {
  if (!run || run.over) return;
  const f = house.floors[player.fi];
  if (player.hidden) { player.hidden = null; return; }
  if (f.exit && dist(player.x, player.y, f.exit.x, f.exit.y) < 40) {
    if (player.charms >= 3) doWin('escape'); else caption('The front door will not budge. Charms ' + player.charms + '/3.');
    return;
  }
  for (const it of f.items) if (it.alive && dist(player.x, player.y, it.x, it.y) < 28) { pickup(it); return; }
  const h = nearestHide();
  if (h) {
    if (chucky.fi === player.fi && dist(chucky.x, chucky.y, player.x, player.y) < 34) { doCatch(); return; }
    player.hidden = h; player.x = h.x; player.y = h.y; unlock('hide'); return;
  }
  const s = nearestStair();
  if (s) { const dest = house.byId[s.to]; player.fi = dest.index; player.x = s.dx * TILE + TILE / 2; player.y = s.dy * TILE + TILE / 2; hearNoise({ fi: player.fi, x: player.x, y: player.y, radius: 180 }); mapFi = player.fi; return; }
  const d = nearestDoor();
  if (d) {
    if (d.open) {
      d.open = false; d.timer = 0; playSlam();
      hearNoise({ fi: player.fi, x: d.tx * TILE + TILE / 2, y: d.ty * TILE + TILE / 2, radius: 460 });
      if (chucky.fi === player.fi && dist(chucky.x, chucky.y, d.tx * TILE + TILE / 2, d.ty * TILE + TILE / 2) < 78) { chucky.stun = 1.25; bark('slam', true); unlock('slam'); }
    } else { d.open = true; d.locked = false; d.timer = 0; noiseBurst(0.05, 0.12, 500); }
  }
}
function throwNoise() {
  if (player.noise <= 0 || player.hidden) { caption('No noise makers.'); return; }
  player.noise--;
  const f = house.floors[player.fi]; let x = player.x, y = player.y;
  for (let i = 1; i <= 8; i++) { const nx = player.x + Math.cos(player.aim) * 12 * i, ny = player.y + Math.sin(player.aim) * 12 * i; if (blockedPx(f, nx, ny)) break; x = nx; y = ny; }
  beepers.push({ fi: player.fi, x, y, t: 7, beep: 0.2 }); playBeep();
}
function lockDoor() {
  if (player.locks <= 0) { caption('No locks on you.'); return; }
  const d = nearestDoor(); if (!d) { caption('No door close enough.'); return; }
  player.locks--; d.locked = true; d.open = false; d.timer = 0; playSlam(); unlock('lock'); caption('Locked. He will have to kick it.');
}
function doCatch() {
  if (run.over) return; run.over = true;
  const line = pick(LINES.catch);
  document.getElementById('caughtLine').textContent = '\u201C' + line + '\u201D';
  speak(line); playCatch(); caption('');
  if (!SHOT) commitScore(false);
  try { if (!SHOT && navigator.vibrate) navigator.vibrate(60); } catch (e) {}
  setMode('caught');
}
function doWin(kind) {
  if (run.over) return; run.over = true;
  const line = pick(kind === 'escape' ? LINES.escape : LINES.dawn);
  document.getElementById('winTitle').textContent = kind === 'escape' ? 'OUT' : 'DAWN';
  document.getElementById('winLine').textContent = '\u201C' + line + '\u201D';
  document.getElementById('winStats').textContent = house.name + ' \u00b7 ' + diff.name + ' \u00b7 ' + fmt(run.elapsed) + ' \u00b7 charms ' + player.charms + '/3';
  speak(line); playWin(); caption('');
  if (kind === 'escape') unlock('escape'); else unlock('dawn');
  if (diff.id === 'hard') unlock('hard');
  if (house.id === 'ridge') unlock('ridge'); else unlock('cabin');
  save.cleared[house.id] = true; if (save.cleared.ridge && save.cleared.cabin) unlock('both');
  if (!SHOT) commitScore(kind === 'escape');
  setMode('win');
}
function fmt(sec) { sec = Math.max(0, Math.floor(sec)); return Math.floor(sec / 60) + ':' + String(sec % 60).padStart(2, '0'); }
function commitScore(escaped) {
  const key = house.id + '|' + diff.id; const b = save.best[key] || { survive: 0, escape: null };
  if (run.elapsed > b.survive) b.survive = run.elapsed;
  if (escaped && (b.escape == null || run.elapsed < b.escape)) b.escape = run.elapsed;
  save.best[key] = b; persist(); refreshScores();
}
function unlock(id) {
  if (save.ach[id]) return; save.ach[id] = Date.now(); persist();
  const a = ACH.find(x => x.id === id), toast = document.getElementById('toast');
  toast.textContent = 'Achievement \u00b7 ' + (a ? a.name : id); toast.classList.add('show');
  clearTimeout(unlock._t); unlock._t = setTimeout(() => toast.classList.remove('show'), 2200); renderAch();
}
function step(dt) {
  if (mode !== 'play' || !player || run.over) return;
  sayT = Math.max(0, sayT - dt);
  if (capT > 0) { capT -= dt; if (capT <= 0) caption(''); }
  run.elapsed += dt; anim += dt; updatePlayer(dt); if (run.over) return; updateChucky(dt);
  for (let i = beepers.length - 1; i >= 0; i--) {
    const b = beepers[i]; b.t -= dt; b.beep -= dt;
    if (b.beep <= 0) { b.beep = 0.55; playBeep(); hearNoise({ fi: b.fi, x: b.x, y: b.y, radius: 380, lure: true }); }
    if (b.t <= 0) beepers.splice(i, 1);
  }
  heartT -= dt;
  if (chucky && chucky.fi === player.fi) { const d = dist(player.x, player.y, chucky.x, chucky.y); if (d < 200 && heartT <= 0) { heartT = d < 80 ? 0.38 : 0.7; playHeart(); } }
  if (!run.over && run.elapsed >= diff.dawn) doWin('dawn');
}

function ensureSize() {
  const w = canvas.clientWidth | 0, h = canvas.clientHeight | 0;
  if (w < 2 || h < 2) return false;
  const coarse = matchMedia('(pointer: coarse)').matches;
  const r = Math.min(coarse ? 1.75 : 2, window.devicePixelRatio || 1);
  const W = Math.round(w * r), H = Math.round(h * r);
  if (canvas.width !== W || canvas.height !== H) { canvas.width = W; canvas.height = H; lightC.width = W; lightC.height = H; dpr = r; }
  viewW = w; viewH = h; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); return true;
}
function lightOf() {
  if ((mode === 'play' || mode === 'pause' || mode === 'map' || mode === 'caught' || mode === 'win') && player) {
    return { fi: player.fi, x: player.x, y: player.y, aim: player.aim, on: player.flash && !(player.flicker > 0), battery: player.battery };
  }
  const t = performance.now() / 1000;
  return { fi: 0, x: 7 * TILE + Math.sin(t * 0.32) * 90, y: 5 * TILE + Math.cos(t * 0.27) * 50, aim: Math.sin(t * 0.4) * 0.9 + 0.15, on: true, battery: 80,
    floor: houses[0].floors[0], fakeChucky: { fi: 0, x: 11 * TILE, y: 4.2 * TILE, face: 'W', frame: (t * 2) % 2 | 0, moving: false } };
}
function render() {
  if (!ensureSize() || !houses.length) return;
  const light = lightOf(); if (!light) return;
  const f = light.floor || (house ? house.floors[light.fi] : houses[0].floors[0]);
  const worldW = f.w * TILE, worldH = f.h * TILE;
  let desX = light.x - viewW / 2, desY = light.y - viewH / 2;
  if (worldW <= viewW) desX = (worldW - viewW) / 2; else desX = clamp(desX, 0, worldW - viewW);
  if (worldH <= viewH) desY = (worldH - viewH) / 2; else desY = clamp(desY, 0, worldH - viewH);
  if (!Number.isFinite(camX)) { camX = desX; camY = desY; }
  camX += (desX - camX) * 0.18; camY += (desY - camY) * 0.18;
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, viewW, viewH);
  ctx.drawImage(f.cache, camX, camY, viewW, viewH, 0, 0, viewW, viewH);
  const playing = mode === 'play' || mode === 'pause' || mode === 'map' || mode === 'caught' || mode === 'win';
  ctx.save(); ctx.translate(-camX, -camY);
  for (const d of f.doors) drawDoor(ctx, d);
  for (const s of f.stairs) drawStair(ctx, s);
  if (f.exit) drawExit(ctx, f.exit);
  for (const it of (f.items || [])) if (it.alive) drawItem(ctx, it);
  for (const b of (beepers || [])) if (b.fi === f.index) { ctx.fillStyle = '#e6c36a'; ctx.beginPath(); ctx.arc(b.x, b.y, 5, 0, 7); ctx.fill(); }
  if (player && f.index === player.fi && !player.hidden && playing) drawPlayer(ctx, player.x, player.y, player.aim);
  else if (!playing) drawPlayer(ctx, light.x, light.y, light.aim);
  const ch = playing && chucky && chucky.fi === f.index ? chucky : (!playing && light.fakeChucky ? light.fakeChucky : null);
  if (ch) drawChucky(ctx, ch);
  if (light.on) {
    ctx.fillStyle = 'rgba(255,226,180,0.45)'; ctx.beginPath();
    for (const p of dust) {
      p.t += 0.016; const ang = light.aim + p.spread;
      const x = light.x + Math.cos(ang) * p.dist + Math.sin(p.t * p.sp) * 5;
      const y = light.y + Math.sin(ang) * p.dist + Math.cos(p.t * p.sp * 0.8) * 5;
      ctx.rect(x, y, p.s, p.s);
    }
    ctx.fill();
  }
  if (grainPat) { ctx.globalAlpha = 0.05; ctx.fillStyle = grainPat; ctx.fillRect(camX, camY, viewW, viewH); ctx.globalAlpha = 1; }
  ctx.restore();
  const dawn = player && house && playing ? clamp(run.elapsed / diff.dawn, 0, 1) : 0;
  const darkA = light.on ? 0.9 - dawn * 0.16 : 0.975;
  lctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  lctx.globalCompositeOperation = 'source-over';
  lctx.clearRect(0, 0, viewW, viewH);
  lctx.fillStyle = 'rgba(0,0,0,' + darkA + ')'; lctx.fillRect(0, 0, viewW, viewH);
  lctx.globalCompositeOperation = 'destination-out';
  const px = light.x - camX, py = light.y - camY, amb = light.on ? 62 : 28;
  let g = lctx.createRadialGradient(px, py, 6, px, py, amb);
  g.addColorStop(0, 'rgba(0,0,0,1)'); g.addColorStop(1, 'rgba(0,0,0,0)');
  lctx.fillStyle = g; lctx.beginPath(); lctx.arc(px, py, amb, 0, Math.PI * 2); lctx.fill();
  let cone = light.on ? 290 : 0;
  if (light.on && light.battery < 18 && ((anim * 17) | 0) % 7 === 0) cone *= 0.45;
  const spread = 0.58;
  if (cone > 20) {
    lctx.save(); lctx.translate(px, py); lctx.rotate(light.aim);
    const cg = lctx.createRadialGradient(0, 0, 8, 0, 0, cone);
    cg.addColorStop(0, 'rgba(0,0,0,1)'); cg.addColorStop(0.55, 'rgba(0,0,0,0.9)'); cg.addColorStop(1, 'rgba(0,0,0,0)');
    lctx.fillStyle = cg; lctx.beginPath(); lctx.moveTo(0, 0); lctx.arc(0, 0, cone, -spread, spread); lctx.closePath(); lctx.fill();
    lctx.restore();
  }
  lctx.globalCompositeOperation = 'source-over';
  ctx.drawImage(lightC, 0, 0, viewW, viewH);
  if (light.on && cone > 20) {
    const tg = ctx.createRadialGradient(px, py, 10, px, py, cone);
    tg.addColorStop(0, 'rgba(255,214,150,0.16)'); tg.addColorStop(1, 'rgba(255,170,70,0)');
    ctx.fillStyle = tg; ctx.beginPath(); ctx.moveTo(px, py); ctx.arc(px, py, cone, light.aim - spread, light.aim + spread); ctx.closePath(); ctx.fill();
  }
  const vg = ctx.createRadialGradient(viewW / 2, viewH / 2, viewH * 0.25, viewW / 2, viewH / 2, viewH * 0.75);
  vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,12,' + (0.38 - dawn * 0.15) + ')');
  ctx.fillStyle = vg; ctx.fillRect(0, 0, viewW, viewH);
  if (dawn > 0.65) { ctx.fillStyle = 'rgba(180,200,230,' + ((dawn - 0.65) * 0.18) + ')'; ctx.fillRect(0, 0, viewW, 18); }
  if (ch && player && ch === chucky && !inCone(ch.x, ch.y, light, cone, spread) && dist(player.x, player.y, ch.x, ch.y) < 190) {
    ctx.fillStyle = 'rgba(180,20,20,0.8)'; const ex = ch.x - camX, ey = ch.y - camY - 28;
    ctx.fillRect(ex - 6, ey, 3, 2); ctx.fillRect(ex + 3, ey, 3, 2);
  }
}
function inCone(x, y, light, cone, spread) {
  if (!light.on) return dist(x, y, light.x, light.y) < 30;
  const dx = x - light.x, dy = y - light.y, d = Math.hypot(dx, dy);
  if (d < 48) return true; if (d > cone) return false;
  let a = Math.atan2(dy, dx) - light.aim; while (a > Math.PI) a -= Math.PI * 2; while (a < -Math.PI) a += Math.PI * 2;
  return Math.abs(a) < spread;
}
function drawDoor(ctx, d) {
  const x = d.tx * TILE, y = d.ty * TILE;
  if (!d.open) { ctx.fillStyle = d.locked ? '#6a2428' : '#6e4a30'; ctx.fillRect(x + 4, y + 4, TILE - 8, TILE - 8); ctx.fillStyle = '#e2c27a'; ctx.fillRect(x + TILE * 0.62, y + TILE * 0.46, 4, 4);
    if (d.locked) { ctx.strokeStyle = '#ddd'; ctx.strokeRect(x + TILE * 0.4, y + 8, 8, 8); } }
  else { ctx.fillStyle = '#6e4a30'; ctx.fillRect(x + 4, y + 4, 7, TILE - 8); }
}
function drawStair(ctx, s) {
  const x = s.tx * TILE, y = s.ty * TILE;
  ctx.fillStyle = '#241c18'; ctx.fillRect(x + 3, y + 3, TILE - 6, TILE - 6);
  ctx.fillStyle = '#8a7560'; for (let i = 0; i < 4; i++) ctx.fillRect(x + 7, y + 7 + i * 7, TILE - 14, 3);
  ctx.fillStyle = '#f0e6dc'; ctx.font = '10px sans-serif'; ctx.fillText('STAIR', x + 2, y + 14);
}
function drawExit(ctx, e) {
  const x = e.tx * TILE, y = e.ty * TILE;
  ctx.fillStyle = '#4a1818'; ctx.fillRect(x + 3, y + 3, TILE - 6, TILE - 6);
  ctx.fillStyle = '#2a0c0c'; ctx.fillRect(x + 7, y + 6, TILE / 2 - 8, TILE - 14); ctx.fillRect(x + TILE / 2 + 1, y + 6, TILE / 2 - 10, TILE - 14);
  ctx.fillStyle = '#e6c36a'; ctx.fillRect(x + TILE / 2 - 2, y + TILE / 2, 4, 4);
}
function drawItem(ctx, it) {
  const bob = Math.sin(anim * 3 + it.ph) * 2.5, x = it.x, y = it.y + bob;
  ctx.fillStyle = 'rgba(255,210,140,0.18)'; ctx.beginPath(); ctx.arc(x, y, 12, 0, 7); ctx.fill();
  if (it.kind === 'charm') { ctx.fillStyle = '#8c1e24'; ctx.beginPath(); ctx.arc(x, y, 6, 0, 7); ctx.fill(); ctx.strokeStyle = '#e6c36a'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(x, y, 8, 0.2, 2.4); ctx.stroke(); ctx.fillStyle = '#f2e6c8'; ctx.fillRect(x - 1, y - 8, 2, 4); }
  else if (it.kind === 'battery') { ctx.fillStyle = '#3a8f4a'; ctx.fillRect(x - 5, y - 7, 10, 14); ctx.fillStyle = '#d8d8d8'; ctx.fillRect(x - 2, y - 10, 4, 3); }
  else if (it.kind === 'eye') { ctx.fillStyle = '#f4efe8'; ctx.beginPath(); ctx.ellipse(x, y, 7, 5, 0, 0, 7); ctx.fill(); ctx.fillStyle = '#6d7a48'; ctx.beginPath(); ctx.arc(x, y, 2.4, 0, 7); ctx.fill(); ctx.fillStyle = '#1a0808'; ctx.beginPath(); ctx.arc(x, y, 1.1, 0, 7); ctx.fill(); }
  else if (it.kind === 'noise') { ctx.fillStyle = '#2a2e32'; ctx.fillRect(x - 6, y - 5, 12, 10); ctx.fillStyle = '#e6c36a'; ctx.beginPath(); ctx.arc(x + 2, y, 3, 0, 7); ctx.fill(); }
  else if (it.kind === 'lock') { ctx.strokeStyle = '#d8dde2'; ctx.lineWidth = 2; ctx.strokeRect(x - 5, y - 2, 10, 8); ctx.beginPath(); ctx.arc(x, y - 2, 3.5, Math.PI, 0); ctx.stroke(); }
}
function drawPlayer(ctx, x, y, aim) {
  ctx.fillStyle = 'rgba(0,0,0,0.45)'; ctx.beginPath(); ctx.ellipse(x, y + 6, 11, 5, 0, 0, 7); ctx.fill();
  ctx.save(); ctx.translate(x, y); ctx.rotate(aim);
  ctx.fillStyle = '#1a1618'; ctx.beginPath(); ctx.ellipse(-2, 0, 8, 10, 0, 0, 7); ctx.fill();
  ctx.fillStyle = '#c8c2b4'; ctx.fillRect(4, -3, 14, 6); ctx.fillStyle = '#f3e2a2'; ctx.fillRect(17, -2, 4, 4); ctx.restore();
}
function drawChucky(ctx, ch) {
  if (!sprites) return;
  const frame = ch.moving ? ((anim * 8) | 0) % 2 : 0;
  let face = ch.face || 'S', flip = false;
  if (face === 'W') { face = 'E'; flip = true; }
  const spr = sprites[face][frame] || sprites.S[0], w = 118, h = 148;
  ctx.fillStyle = 'rgba(0,0,0,0.45)'; ctx.beginPath(); ctx.ellipse(ch.x, ch.y + 4, 16, 6, 0, 0, 7); ctx.fill();
  ctx.save(); ctx.translate(ch.x, ch.y); if (flip) ctx.scale(-1, 1); ctx.drawImage(spr, -w / 2, -h + 10, w, h); ctx.restore();
}
function bindInput() {
  const stick = document.getElementById('stick'), knob = document.getElementById('knob');
  function stickPointer(e) {
    const r = stick.getBoundingClientRect(); let x = e.clientX - (r.left + r.width / 2), y = e.clientY - (r.top + r.height / 2);
    const m = Math.hypot(x, y), max = r.width * 0.36;
    if (m > max && m > 0) { x = x / m * max; y = y / m * max; }
    knob.style.transform = 'translate(' + x + 'px,' + y + 'px)'; input.jx = max ? x / max : 0; input.jy = max ? y / max : 0;
  }
  stick.addEventListener('pointerdown', e => { stick.setPointerCapture(e.pointerId); stickPointer(e); });
  stick.addEventListener('pointermove', e => { if (e.buttons) stickPointer(e); });
  const stickEnd = () => { input.jx = 0; input.jy = 0; knob.style.transform = 'translate(0px,0px)'; };
  stick.addEventListener('pointerup', stickEnd); stick.addEventListener('pointercancel', stickEnd);
  function setAim(e) {
    const r = canvas.getBoundingClientRect(); if (!player) return;
    player.aim = Math.atan2((e.clientY - r.top) + camY - player.y, (e.clientX - r.left) + camX - player.x); pointerAim = true;
  }
  canvas.addEventListener('pointerdown', e => { if (mode !== 'play') return; input.aiming = true; setAim(e); });
  canvas.addEventListener('pointermove', e => { if (mode !== 'play' || !player) return; if (e.pointerType === 'mouse' || input.aiming) setAim(e); });
  canvas.addEventListener('pointerup', () => { input.aiming = false; });
  canvas.addEventListener('pointercancel', () => { input.aiming = false; });
  addEventListener('keydown', e => {
    if (e.target && e.target.closest && e.target.closest('input, textarea')) return;
    keys[e.code] = true;
    if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) e.preventDefault();
    if (e.repeat) return;
    if (e.code === 'KeyE' && mode === 'play') useAction();
    if (e.code === 'KeyQ' && mode === 'play') throwNoise();
    if (e.code === 'KeyR' && mode === 'play') lockDoor();
    if (e.code === 'KeyF' && mode === 'play' && player) player.flash = player.battery > 0 ? !player.flash : false;
    if (e.code === 'KeyM') { if (mode === 'play') openMap(); else if (mode === 'map') setMode('play'); }
    if (e.code === 'Escape') { if (mode === 'play') setMode('pause'); else if (mode === 'pause' || mode === 'map') setMode('play'); }
  });
  addEventListener('keyup', e => { keys[e.code] = false; });
  const hold = (id, down, up) => {
    const el = document.getElementById(id);
    el.addEventListener('pointerdown', e => { e.preventDefault(); down(); });
    el.addEventListener('pointerup', up); el.addEventListener('pointerleave', up); el.addEventListener('pointercancel', up);
  };
  hold('btnRun', () => { input.sprint = true; document.getElementById('btnRun').classList.add('on'); }, () => { input.sprint = false; document.getElementById('btnRun').classList.remove('on'); });
  hold('btnBreath', () => { input.breath = true; document.getElementById('btnBreath').classList.add('on'); }, () => { input.breath = false; document.getElementById('btnBreath').classList.remove('on'); });
  document.getElementById('btnUse').addEventListener('pointerdown', e => { e.preventDefault(); if (mode === 'play') useAction(); });
  document.getElementById('btnNoise').addEventListener('pointerdown', e => { e.preventDefault(); if (mode === 'play') throwNoise(); });
  document.getElementById('btnLock').addEventListener('pointerdown', e => { e.preventDefault(); if (mode === 'play') lockDoor(); });
  document.getElementById('btnLight').addEventListener('pointerdown', e => { e.preventDefault(); if (mode === 'play' && player && player.battery > 0) player.flash = !player.flash; });
}
function setMode(m) {
  mode = m;
  const ids = ['menu', 'howto', 'settings', 'achs', 'pick', 'pause', 'caught', 'win', 'mapov'];
  for (const id of ids) document.getElementById(id).classList.toggle('show', id === m || (m === 'map' && id === 'mapov'));
  const playing = m === 'play' || m === 'pause' || m === 'map';
  document.getElementById('hud').hidden = !playing;
  document.getElementById('controls').hidden = m !== 'play';
  document.getElementById('prompt').hidden = m !== 'play';
  if (m === 'menu') refreshScores();
  if (m === 'achs') renderAch();
  if (m === 'map') buildMapTabs();
}
function openMap() { mapFi = player.fi; setMode('map'); }
function buildMapTabs() {
  const box = document.getElementById('mapTabs'); box.innerHTML = '';
  house.floors.forEach((f, i) => {
    const b = document.createElement('button'); b.type = 'button'; b.textContent = f.name; b.className = i === mapFi ? 'sel' : '';
    b.addEventListener('click', () => { mapFi = i; buildMapTabs(); }); box.appendChild(b);
  });
}
function drawMap() {
  if (mode !== 'map' || !house) return;
  const f = house.floors[mapFi], sc = 8, c = document.getElementById('mapc');
  c.width = f.w * sc; c.height = f.h * sc;
  const g = c.getContext('2d'); g.imageSmoothingEnabled = false;
  const ex = explored[mapFi];
  for (let y = 0; y < f.h; y++) for (let x = 0; x < f.w; x++) {
    const i = y * f.w + x;
    if (!ex || !ex[i]) { g.fillStyle = '#070608'; g.fillRect(x * sc, y * sc, sc, sc); continue; }
    g.fillStyle = f.wall[i] ? '#3a3438' : f.furn[i] ? '#5a4038' : f.kind[i] === 1 ? '#3e4c52' : f.kind[i] === 3 ? '#2c3036' : '#6a5344';
    g.fillRect(x * sc, y * sc, sc, sc);
  }
  g.fillStyle = '#e6c36a'; for (const s of f.stairs) g.fillRect(s.tx * sc + 2, s.ty * sc + 2, sc - 4, sc - 4);
  if (f.exit) { g.fillStyle = '#d4543c'; g.fillRect(f.exit.tx * sc, f.exit.ty * sc, sc, sc); }
  for (const it of f.items) if (it.alive && ex[it.ty * f.w + it.tx]) { g.fillStyle = it.kind === 'charm' ? '#ffd36a' : it.kind === 'eye' ? '#f4efe8' : '#9dffb0'; g.fillRect(it.tx * sc + 2, it.ty * sc + 2, sc - 4, sc - 4); }
  if (player && player.fi === mapFi) { g.fillStyle = '#f4f4f4'; g.beginPath(); g.arc(player.x / TILE * sc, player.y / TILE * sc, 3.2, 0, 7); g.fill(); }
  if (chucky && chucky.fi === mapFi && player && player.fi === mapFi && dist(player.x, player.y, chucky.x, chucky.y) < 150) { g.fillStyle = '#ff2a2a'; g.fillRect(chucky.x / TILE * sc - 2, chucky.y / TILE * sc - 2, 4, 4); }
}
function renderAch() {
  const ul = document.getElementById('achList'); ul.innerHTML = '';
  for (const a of ACH) { const li = document.createElement('li'); if (!save.ach[a.id]) li.className = 'lock'; li.innerHTML = '<b>' + (save.ach[a.id] ? '\u2605 ' : '\u2606 ') + a.name + '</b><br>' + a.desc; ul.appendChild(li); }
}
function refreshScores() {
  let bestS = null, bestE = null;
  for (const k of Object.keys(save.best)) { const b = save.best[k]; if (!bestS || b.survive > bestS.sec) bestS = { sec: b.survive, key: k }; if (b.escape != null && (!bestE || b.escape < bestE.sec)) bestE = { sec: b.escape, key: k }; }
  const nice = k => { if (!k) return ''; const [h, d] = k.split('|'); return (h === 'ridge' ? 'Ridge' : 'Cabin') + ' \u00b7 ' + d; };
  document.getElementById('scoreLine').textContent = bestS ? 'Best night ' + fmt(bestS.sec) + ' \u00b7 ' + nice(bestS.key) : 'No score yet.';
  document.getElementById('escapeLine').textContent = bestE ? 'Fastest escape ' + fmt(bestE.sec) + ' \u00b7 ' + nice(bestE.key) : '';
}
function syncSettings() {
  document.getElementById('vol').value = Math.round(save.settings.vol * 100);
  document.getElementById('voiceVol').value = Math.round(save.settings.voiceVol * 100);
  document.getElementById('voiceOn').checked = !!save.settings.voice;
  document.getElementById('capOn').checked = !!save.settings.captions;
  document.getElementById('scareOn').checked = !!save.settings.scare;
}
function ui() {
  if (!player || (mode !== 'play' && mode !== 'pause' && mode !== 'map')) return;
  const f = house.floors[player.fi], rm = roomAt(f, player.x, player.y);
  document.getElementById('roomName').textContent = (rm ? rm.name : f.name) + ' \u00b7 ' + f.name;
  const left = Math.max(0, diff.dawn - run.elapsed), clock = document.getElementById('clock');
  clock.textContent = fmt(left); clock.classList.toggle('dawn', left < 30);
  const charms = document.getElementById('charms'); charms.innerHTML = '';
  for (let i = 0; i < 3; i++) { const s = document.createElement('i'); s.className = 'pip' + (i < player.charms ? ' on' : ''); charms.appendChild(s); }
  const eyesTotal = house.floors.reduce((n, fl) => n + fl.itemDefs.filter(d => d.kind === 'eye').length, 0);
  document.getElementById('eyes').textContent = 'EYES ' + player.eyes + '/' + eyesTotal;
  document.querySelector('#batBar > i').style.width = player.battery + '%';
  const st = document.getElementById('stamBar'); st.querySelector('i').style.width = player.stamina + '%'; st.classList.toggle('low', player.stamina < 25);
  const d = chucky && chucky.fi === player.fi ? dist(player.x, player.y, chucky.x, chucky.y) : 999;
  const bpm = d < 70 ? 146 : d < 140 ? 108 : d < 260 ? 76 : 54;
  document.getElementById('bpm').textContent = String(bpm);
  const heart = document.getElementById('heart');
  heart.style.transform = 'scale(' + (1 + 0.16 * Math.sin(anim * (bpm / 60) * Math.PI * 2)).toFixed(3) + ')';
  heart.style.color = d < 100 ? '#ff3030' : '#c43838';
  document.getElementById('nNoise').textContent = player.noise;
  document.getElementById('nLock').textContent = player.locks;
  document.getElementById('btnLight').classList.toggle('on', player.flash);
  document.getElementById('btnBreath').classList.toggle('on', player.breath);
  const pr = document.getElementById('prompt'), label = contextLabel();
  pr.hidden = !label; pr.textContent = label;
  if (mode === 'map') drawMap();
}
function beginRun(houseIndex, diffId) {
  house = houses[houseIndex]; diff = DIFFS[diffId] || DIFFS.normal; resetRunState();
  camX = NaN; ensureAudio(); startDrone(); setMode('play'); if (!SHOT) bark('start', true);
}
function floodOk(f) {
  let total = 0, start = -1;
  for (let i = 0; i < f.wall.length; i++) if (!f.wall[i] && !f.furn[i]) { total++; if (start < 0) start = i; }
  if (start < 0) return { id: f.id, total: 0, reach: 0 };
  const w = f.w, N = f.wall.length, seen = new Uint8Array(N), q = [start]; seen[start] = 1; let reach = 0;
  while (q.length) {
    const cur = q.pop(); reach++; const cx = cur % w;
    for (const [k, dir] of [[0, 1], [1, -1], [2, w], [3, -w]]) {
      const nb = cur + dir; if (nb < 0 || nb >= N || seen[nb]) continue;
      const nx = nb % w; if (k === 0 && nx !== cx + 1) continue; if (k === 1 && nx !== cx - 1) continue;
      if (f.wall[nb] || f.furn[nb]) continue; seen[nb] = 1; q.push(nb);
    }
  }
  return { id: f.id, total, reach };
}
function sanity() {
  const problems = [];
  for (const h of houses) {
    let charms = 0, eyes = 0;
    for (const f of h.floors) {
      charms += f.itemDefs.filter(i => i.kind === 'charm').length;
      eyes += f.itemDefs.filter(i => i.kind === 'eye').length;
      const fl = floodOk(f); if (fl.reach !== fl.total) problems.push(h.id + ':' + f.id + ' reach ' + fl.reach + '/' + fl.total);
      for (const s of f.stairs) {
        if (!h.byId[s.to]) problems.push('missing stair dest ' + s.to);
        else { const df = h.byId[s.to]; if (df.wall[s.dy * df.w + s.dx]) problems.push('stair lands in wall ' + f.id); }
      }
    }
    if (charms !== 3) problems.push(h.id + ' charms ' + charms);
    if (eyes !== 5) problems.push(h.id + ' eyes ' + eyes);
  }
  return problems;
}
function paintAllPortraits() {
  drawPortrait(document.getElementById('portrait').getContext('2d'), 520, 680, 0.2);
  drawPortrait(document.getElementById('caughtPic').getContext('2d'), 520, 680, 1);
  drawPortrait(document.getElementById('winPic').getContext('2d'), 520, 680, 0.55);
  drawPortrait(document.getElementById('scarePic').getContext('2d'), 520, 680, 1);
}
function showScare() {
  const el = document.getElementById('scareLayer'); el.classList.add('show');
  clearTimeout(showScare._t); showScare._t = setTimeout(() => el.classList.remove('show'), 420);
  if (save.settings.scare) { noiseBurst(0.2, 0.5, 900); buzz(520, 0.15, 'square', 0.07); }
}
function makeGrain() {
  const c = document.createElement('canvas'); c.width = 128; c.height = 128;
  const g = c.getContext('2d'), img = g.createImageData(128, 128), rnd = mulberry32(99);
  for (let i = 0; i < img.data.length; i += 4) { const v = rnd() * 255; img.data[i] = img.data[i + 1] = img.data[i + 2] = v; img.data[i + 3] = 255; }
  g.putImageData(img, 0, 0); grainPat = ctx.createPattern(c, 'repeat');
}
function frame(ts) {
  requestAnimationFrame(frame);
  if (!lastTs) lastTs = ts;
  let dt = (ts - lastTs) / 1000; lastTs = ts; if (dt < 0) dt = 0; if (dt > 0.05) dt = 0.05;
  fpsAcc += dt; fpsFrames++; if (fpsAcc >= 0.5) { fpsVal = fpsFrames / fpsAcc; fpsFrames = 0; fpsAcc = 0; }
  step(dt); render(); ui();
}
function boot() {
  houses = buildHouses(); buildSprites(); paintAllPortraits(); makeGrain(); bindInput(); syncSettings(); refreshScores(); renderAch();
  window.__hfcProblems = sanity();
  document.getElementById('playBtn').onclick = () => setMode('pick');
  document.getElementById('howBtn').onclick = () => setMode('howto');
  document.getElementById('setBtn').onclick = () => { syncSettings(); setMode('settings'); };
  document.getElementById('achBtn').onclick = () => setMode('achs');
  document.querySelectorAll('[data-back]').forEach(b => b.onclick = () => setMode('menu'));
  document.getElementById('pauseSet').onclick = () => setMode('settings');
  let pickH = 0, pickD = 'normal';
  const selHouse = i => { pickH = i; document.getElementById('houseRidge').classList.toggle('sel', i === 0); document.getElementById('houseCabin').classList.toggle('sel', i === 1); };
  const selDiff = id => { pickD = id; for (const k of ['easy', 'normal', 'hard']) document.getElementById('diff' + k[0].toUpperCase() + k.slice(1)).classList.toggle('sel', k === id); document.getElementById('diffBlurb').textContent = DIFFS[id].blurb; };
  document.getElementById('houseRidge').onclick = () => selHouse(0);
  document.getElementById('houseCabin').onclick = () => selHouse(1);
  document.getElementById('diffEasy').onclick = () => selDiff('easy');
  document.getElementById('diffNormal').onclick = () => selDiff('normal');
  document.getElementById('diffHard').onclick = () => selDiff('hard');
  document.getElementById('startBtn').onclick = () => beginRun(pickH, pickD);
  document.getElementById('resumeBtn').onclick = () => setMode('play');
  document.getElementById('quitBtn').onclick = () => { if (run) run.over = true; setMode('menu'); };
  document.getElementById('againBtn').onclick = () => beginRun(houses.indexOf(house), diff.id);
  document.getElementById('caughtMenu').onclick = () => setMode('menu');
  document.getElementById('winAgain').onclick = () => beginRun(houses.indexOf(house), diff.id);
  document.getElementById('winMenu').onclick = () => setMode('menu');
  document.getElementById('mapBtn').onclick = () => { if (mode === 'play') openMap(); };
  document.getElementById('mapClose').onclick = () => setMode('play');
  document.getElementById('vol').oninput = e => { save.settings.vol = e.target.value / 100; setVol(); persist(); };
  document.getElementById('voiceVol').oninput = e => { save.settings.voiceVol = e.target.value / 100; persist(); };
  document.getElementById('voiceOn').onchange = e => { save.settings.voice = e.target.checked; persist(); };
  document.getElementById('capOn').onchange = e => { save.settings.captions = e.target.checked; persist(); };
  document.getElementById('scareOn').onchange = e => { save.settings.scare = e.target.checked; persist(); };
  document.getElementById('resetBtn').onclick = () => { save.best = {}; save.ach = {}; save.cleared = {}; persist(); refreshScores(); renderAch(); };
  document.body.addEventListener('pointerdown', () => ensureAudio(), { passive: true });
  addEventListener('resize', () => { camX = NaN; });
  document.addEventListener('visibilitychange', () => { if (document.hidden && mode === 'play') setMode('pause'); });
  window.HFC = {
    BUILD, sanity, beginRun,
    get fps() { return fpsVal; },
    get problems() { return window.__hfcProblems; },
    get mode() { return mode; },
    state() { return player ? { mode, x: player.x, y: player.y, fi: player.fi, charms: player.charms, battery: player.battery, elapsed: run.elapsed, cx: chucky.x, cy: chucky.y, cfi: chucky.fi, flash: player.flash } : { mode }; },
    debugPose(kind) {
      beginRun(0, 'normal');
      player.x = 7 * TILE + TILE / 2; player.y = 5 * TILE + TILE / 2; player.aim = 0.05; player.flash = true; player.battery = 84; player.stamina = 70; player.charms = 1; player.eyes = 2;
      chucky.fi = 0; chucky.x = player.x + 158; chucky.y = player.y + 8; chucky.face = 'W'; chucky.delay = 9999; chucky.state = 'wait';
      camX = NaN; run.elapsed = 12;
      if (kind === 'caught') doCatch();
      else if (kind === 'win') { run.elapsed = 150; doWin('dawn'); }
      else setMode('play');
    }
  };
  if (SHOT === 'play' || SHOT === 'caught' || SHOT === 'win') requestAnimationFrame(() => window.HFC.debugPose(SHOT === 'play' ? 'play' : SHOT));
  requestAnimationFrame(frame);
}
boot();
