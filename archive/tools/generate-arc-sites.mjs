/**
 * Generate 3 arc-zone prototypes with actual site camera profiles applied.
 * Each shows arcs warped by the isometric perspective of a real site.
 *
 * A = Shire (site 1) — low horizon, gentle tilt, wide open
 * B = Khazad-dûm (site 5) — high horizon, steep tilt, claustrophobic
 * C = Rivendell (site 3) — medium horizon, moderate tilt, vertical features
 */
import puppeteer from 'puppeteer';
import path from 'path';
import { fileURLToPath } from 'url';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { setTimeout as sleep } from 'timers/promises';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, '..', 'data', 'layouts');
if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

const SITES = [
  {
    file: 'arc-site-shire.html',
    screenshot: 'arc-site-shire.png',
    name: 'THE SHIRE (Site 1) — Layout A',
    layout: 'A',
    horizon: 25,
    tiltX: 15,
    depth: 1200,
    mood: 'warm',
    vignette: 0.15,
    bgGrad: ['#0a0818', '#12102a', '#1a1a0a', '#0f0e04'],
    mountainColor: '#0c091a',
    groundColor: '#1a1808',
    desc: 'Low horizon, gentle tilt. Big sky. Rolling hills. The world is kind.',
  },
  {
    file: 'arc-site-khazaddum.html',
    screenshot: 'arc-site-khazaddum.png',
    name: 'KHAZAD-DÛM (Site 5) — Layout B',
    layout: 'B',
    horizon: 65,
    tiltX: 35,
    depth: 700,
    mood: 'oppressive',
    vignette: 0.5,
    bgGrad: ['#060408', '#0a0810', '#100808', '#080404'],
    mountainColor: '#080610',
    groundColor: '#0a0604',
    desc: 'High horizon, steep tilt. Underground. Lava below. No sky. Claustrophobic.',
  },
  {
    file: 'arc-site-rivendell.html',
    screenshot: 'arc-site-rivendell.png',
    name: 'RIVENDELL (Site 3) — Layout C',
    layout: 'C',
    horizon: 30,
    tiltX: 18,
    depth: 1100,
    mood: 'ethereal',
    vignette: 0.2,
    bgGrad: ['#080a18', '#0e1228', '#101a10', '#0a0e06'],
    mountainColor: '#0a0e20',
    groundColor: '#101808',
    desc: 'Medium horizon, moderate tilt. Vertical waterfalls. Ethereal, majestic.',
  },
];

function generateHTML(site) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>${site.name}</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:#060610;font-family:Georgia,serif;overflow:hidden;width:100vw;height:100vh;display:flex;flex-direction:column}
.topbar{height:32px;background:#08080f;border-bottom:1px solid rgba(255,255,255,0.06);display:flex;align-items:center;padding:0 14px;gap:10px;flex-shrink:0}
.topbar h1{font-size:11px;color:rgba(186,140,30,0.65);letter-spacing:2px}
.topbar span{font-size:9px;color:rgba(255,255,255,0.25)}
#scene{flex:1;position:relative;overflow:hidden;perspective:${site.depth}px;perspective-origin:85% 90%}
#board{position:absolute;width:160%;height:160%;left:-30%;top:-30%;transform-style:preserve-3d;transform:rotateX(${site.tiltX}deg) rotateZ(-3deg)}
canvas{position:absolute;inset:0;width:100%;height:100%}
.legend{position:fixed;bottom:8px;left:50%;transform:translateX(-50%);display:flex;gap:12px;z-index:10}
.legend-item{display:flex;align-items:center;gap:4px}
.legend-swatch{width:10px;height:10px;border-radius:2px;border:1px solid rgba(255,255,255,0.12)}
.legend-label{font-size:8px;color:rgba(255,255,255,0.3)}
.site-info{position:fixed;bottom:28px;left:50%;transform:translateX(-50%);font-size:9px;color:rgba(255,255,255,0.2);text-align:center;z-index:10}
.vignette{position:fixed;inset:0;pointer-events:none;z-index:5;background:radial-gradient(ellipse at 85% 90%,transparent 30%,rgba(0,0,0,${site.vignette}) 100%)}
.horizon-line{position:fixed;left:0;right:0;top:${site.horizon}%;height:1px;background:rgba(186,140,30,0.12);z-index:4;pointer-events:none}
.horizon-label{position:fixed;right:8px;top:calc(${site.horizon}% - 10px);font-size:7px;color:rgba(186,140,30,0.25);z-index:4;letter-spacing:1px}
</style>
</head>
<body>
<div class="topbar">
  <h1>${site.name}</h1>
  <span>Horizon: ${site.horizon}% · Tilt: ${site.tiltX}° · Depth: ${site.depth}px · Layout ${site.layout}</span>
</div>
<div id="scene">
  <div id="board">
    <canvas id="c"></canvas>
  </div>
</div>
<div class="vignette"></div>
<div class="horizon-line"></div>
<div class="horizon-label">HORIZON ${site.horizon}%</div>
<div class="site-info">${site.desc}</div>
<div class="legend">
  <div class="legend-item"><div class="legend-swatch" style="background:rgba(186,140,30,0.35)"></div><span class="legend-label">Fellowship</span></div>
  <div class="legend-item"><div class="legend-swatch" style="background:rgba(200,60,60,0.3)"></div><span class="legend-label">Skirmish</span></div>
  <div class="legend-item"><div class="legend-swatch" style="background:rgba(80,50,120,0.35)"></div><span class="legend-label">Shadow</span></div>
  <div class="legend-item"><div class="legend-swatch" style="background:rgba(120,80,30,0.35)"></div><span class="legend-label">Adv. Path</span></div>
  <div class="legend-item"><div class="legend-swatch" style="background:rgba(80,180,80,0.25)"></div><span class="legend-label">Flat Ground</span></div>
</div>
<script>
const canvas = document.getElementById('c');
const ctx = canvas.getContext('2d');
const board = document.getElementById('board');

function resize() {
  canvas.width = board.clientWidth;
  canvas.height = board.clientHeight;
  draw();
}

const LAYOUTS = {
  A: {
    fellowship: { rInner: 0.22, rOuter: 0.38, spread: 1.0 },
    skirmish:   { rInner: 0.42, rOuter: 0.60, spread: 0.85 },
    shadow:     { rInner: 0.64, rOuter: 0.82, spread: 0.75 },
    adventure:  { rInner: 0.15, rOuter: 0.19, spread: 0.9 },
  },
  B: {
    fellowship: { rInner: 0.20, rOuter: 0.42, spread: 0.55 },
    skirmish:   { rInner: 0.44, rOuter: 0.65, spread: 0.50 },
    shadow:     { rInner: 0.67, rOuter: 0.88, spread: 0.50 },
    adventure:  { rInner: 0.14, rOuter: 0.18, spread: 0.85 },
  },
  C: {
    fellowship: { rInner: 0.18, rOuter: 0.36, spread: 0.75, shift: 0.12 },
    skirmish:   { rInner: 0.38, rOuter: 0.58, spread: 0.65, shift: -0.05 },
    shadow:     { rInner: 0.62, rOuter: 0.85, spread: 0.60, shift: -0.18 },
    adventure:  { rInner: 0.13, rOuter: 0.17, spread: 0.85 },
  },
};

function draw() {
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0, 0, W, H);

  // Landscape
  const bgColors = ${JSON.stringify(site.bgGrad)};
  const grad = ctx.createLinearGradient(0, 0, W*0.3, H);
  grad.addColorStop(0, bgColors[0]);
  grad.addColorStop(0.35, bgColors[1]);
  grad.addColorStop(0.65, bgColors[2]);
  grad.addColorStop(1, bgColors[3]);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // Mountains
  ctx.beginPath();
  ctx.moveTo(0,H); ctx.lineTo(0,H*0.3);
  for(let x=0;x<=W;x+=W/8) ctx.lineTo(x, H*(0.15+Math.sin(x/200)*0.1+Math.random()*0.03));
  ctx.lineTo(W,H); ctx.closePath();
  ctx.fillStyle = '${site.mountainColor}'; ctx.globalAlpha=0.9; ctx.fill(); ctx.globalAlpha=1;

  ctx.beginPath();
  ctx.moveTo(0,H); ctx.lineTo(0,H*0.5);
  for(let x=0;x<=W;x+=W/6) ctx.lineTo(x, H*(0.4+Math.sin(x/300)*0.08));
  ctx.lineTo(W,H); ctx.closePath();
  ctx.fillStyle = '${site.groundColor}'; ctx.globalAlpha=0.9; ctx.fill(); ctx.globalAlpha=1;

  // Player & arcs
  const pX = W * 0.62, pY = H * 0.68;
  const fX = W * 0.35, fY = H * 0.35;
  const lookAngle = Math.atan2(fY - pY, fX - pX);
  const halfSpread = 38 * Math.PI / 180;
  const maxReach = Math.sqrt(W*W+H*H) * 0.45;

  const layout = LAYOUTS['${site.layout}'];

  function drawArc(zone, fill, stroke, label) {
    const rI = zone.rInner * maxReach, rO = zone.rOuter * maxReach;
    const sp = halfSpread * (zone.spread||1);
    const sh = (zone.shift||0) * halfSpread;
    const ca = lookAngle + sh;
    ctx.beginPath();
    ctx.arc(pX,pY,rO,ca-sp,ca+sp);
    ctx.arc(pX,pY,rI,ca+sp,ca-sp,true);
    ctx.closePath();
    ctx.fillStyle=fill; ctx.fill();
    ctx.strokeStyle=stroke; ctx.lineWidth=1.5; ctx.setLineDash([8,5]); ctx.stroke(); ctx.setLineDash([]);
    if(label){
      const mr=(rI+rO)/2, lx=pX+Math.cos(ca)*mr, ly=pY+Math.sin(ca)*mr;
      ctx.save(); ctx.translate(lx,ly); ctx.rotate(ca+Math.PI/2);
      ctx.fillStyle=stroke; ctx.globalAlpha=0.7; ctx.font='14px Georgia'; ctx.textAlign='center';
      ctx.fillText(label,0,5); ctx.globalAlpha=1; ctx.restore();
    }
  }

  // Flat ground (green tint behind zones)
  drawArc(layout.fellowship, 'rgba(80,180,80,0.06)', 'rgba(80,180,80,0.1)', null);
  drawArc(layout.skirmish, 'rgba(80,180,80,0.04)', 'rgba(80,180,80,0.08)', null);
  drawArc(layout.shadow, 'rgba(80,180,80,0.03)', 'rgba(80,180,80,0.06)', null);

  // Zones
  drawArc(layout.shadow, 'rgba(80,50,120,0.1)', 'rgba(80,50,120,0.3)', 'SHADOW');
  drawArc(layout.skirmish, 'rgba(200,60,60,0.07)', 'rgba(200,80,80,0.22)', 'SKIRMISH');
  drawArc(layout.fellowship, 'rgba(186,140,30,0.1)', 'rgba(186,140,30,0.3)', 'FELLOWSHIP');
  drawArc(layout.adventure, 'rgba(120,80,30,0.12)', 'rgba(120,80,30,0.3)', 'PATH');

  // Twilight
  const twR = maxReach * 0.5;
  const twA = lookAngle - halfSpread * 0.1;
  const twX = pX + Math.cos(twA)*twR, twY = pY + Math.sin(twA)*twR;
  ctx.beginPath(); ctx.ellipse(twX,twY,maxReach*0.06,maxReach*0.04,0,0,Math.PI*2);
  ctx.fillStyle='rgba(55,138,221,0.15)'; ctx.fill();
  ctx.strokeStyle='rgba(55,138,221,0.3)'; ctx.lineWidth=1; ctx.stroke();

  // Player dot
  ctx.beginPath(); ctx.arc(pX,pY,8,0,Math.PI*2);
  ctx.fillStyle='rgba(186,140,30,0.6)'; ctx.fill();

  // Hand fan
  const fanR = maxReach * 0.13;
  for(let i=0;i<8;i++){
    const t=i/7, a=lookAngle-0.25+t*0.7;
    const cx=pX+Math.cos(a)*fanR, cy=pY+Math.sin(a)*fanR;
    ctx.save(); ctx.translate(cx,cy); ctx.rotate(a+Math.PI/2);
    ctx.fillStyle='rgba('+(30+i*10)+','+(40+i*7)+','+(25+i*5)+',0.45)';
    ctx.strokeStyle='rgba(186,140,30,0.2)'; ctx.lineWidth=0.5;
    ctx.beginPath(); ctx.roundRect(-10,-16,20,16,2); ctx.fill(); ctx.stroke();
    ctx.restore();
  }
}

if(!ctx.roundRect){ctx.roundRect=function(x,y,w,h,r){this.moveTo(x+r,y);this.lineTo(x+w-r,y);this.arcTo(x+w,y,x+w,y+r,r);this.lineTo(x+w,y+h-r);this.arcTo(x+w,y+h,x+w-r,y+h,r);this.lineTo(x+r,y+h);this.arcTo(x,y+h,x,y+h-r,r);this.lineTo(x,y+r);this.arcTo(x,y,x+r,y,r);this.closePath()}}

window.addEventListener('resize', resize);
setTimeout(resize, 100);
</script>
</body>
</html>`;
}

// Generate HTML files and screenshot them
(async () => {
  // Write HTML files
  for (const site of SITES) {
    writeFileSync(path.join(outDir, site.file), generateHTML(site));
    console.log(`  ✓ Generated ${site.file}`);
  }

  // Screenshot
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1600, height: 900 });

    for (const site of SITES) {
      await page.goto(`file://${path.join(outDir, site.file)}`, { waitUntil: 'networkidle0' });
      await sleep(600);
      await page.screenshot({ path: path.join(outDir, site.screenshot) });
      console.log(`  ✓ Screenshot ${site.screenshot}`);
    }
  } finally { await browser.close(); }

  console.log(`\nDone. Files in: ${outDir}`);
})();
