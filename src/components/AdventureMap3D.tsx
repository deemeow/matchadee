import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

export type CameraFocusMode = 'follow' | 'overview';

export interface AdventureMap3DProps {
  kancilStation: number; // 0 = gate, 1..5 = mission buildings
  walkFromStation: number | null;
  walkTriggerId: number;
  celebrateUnlock: boolean;
  selectedStation: number;
  completedMissions: number[];
  unlockedUpToMission: number;
  pendingEnterStation?: number | null;
  cameraMode: CameraFocusMode;
  onSelectStation: (station: number) => void;
  onActivateMission?: (station: number) => void;
  onWalkComplete?: (arrivedStation: number) => void;
}

interface StationAnchor {
  station: number;
  buildingPos: THREE.Vector3;
  standPos: THREE.Vector3;
  lookAtBuildingPos: THREE.Vector3;
  pathT: number;
}

const MISSION_BUILDING_SCALE = 1.85;

const STATION_ANCHORS: StationAnchor[] = [
  {
    station: 0,
    buildingPos: new THREE.Vector3(0, 0, -42.0),
    standPos: new THREE.Vector3(0, 0.05, -37.2),
    lookAtBuildingPos: new THREE.Vector3(0, 0.8, -28.0),
    pathT: 0.0
  },
  {
    station: 1,
    buildingPos: new THREE.Vector3(-14.5, 0, -25.5),
    standPos: new THREE.Vector3(-11.2, 0.05, -17.5),
    lookAtBuildingPos: new THREE.Vector3(-14.5, 2.0, -25.5),
    pathT: 0.2
  },
  {
    station: 2,
    buildingPos: new THREE.Vector3(14.5, 0, -9.8),
    standPos: new THREE.Vector3(11.2, 0.05, -1.1),
    lookAtBuildingPos: new THREE.Vector3(14.5, 2.0, -9.8),
    pathT: 0.39
  },
  {
    station: 3,
    buildingPos: new THREE.Vector3(-14.5, 0, 12.2),
    standPos: new THREE.Vector3(-11.2, 0.05, 19.8),
    lookAtBuildingPos: new THREE.Vector3(-14.5, 2.0, 12.2),
    pathT: 0.62
  },
  {
    station: 4,
    buildingPos: new THREE.Vector3(14.5, 0, 28.0),
    standPos: new THREE.Vector3(11.2, 0.05, 36.3),
    lookAtBuildingPos: new THREE.Vector3(14.5, 2.0, 28.0),
    pathT: 0.8
  },
  {
    station: 5,
    buildingPos: new THREE.Vector3(0, 0, 44.5),
    standPos: new THREE.Vector3(0, 0.05, 54.5),
    lookAtBuildingPos: new THREE.Vector3(0, 2.8, 44.5),
    pathT: 1.0
  }
];

function createGrassTexture(maxAniso: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#204E37';
    ctx.fillRect(0, 0, 512, 512);

    // Subtle organic meadow patches
    for (let i = 0; i < 160; i++) {
      const x = (Math.sin(i * 17.3) * 0.5 + 0.5) * 512;
      const y = (Math.cos(i * 29.7) * 0.5 + 0.5) * 512;
      const r = 18 + (i % 26);
      const grad = ctx.createRadialGradient(x, y, 2, x, y, r);
      grad.addColorStop(0, i % 2 === 0 ? 'rgba(46, 114, 72, 0.34)' : 'rgba(22, 62, 41, 0.36)');
      grad.addColorStop(1, 'rgba(32, 78, 55, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Fine grass blade texture
    for (let i = 0; i < 1200; i++) {
      const x = ((i * 73) % 512);
      const y = ((i * 137) % 512);
      ctx.strokeStyle = i % 3 === 0 ? 'rgba(94, 179, 112, 0.22)' : 'rgba(18, 48, 31, 0.25)';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + (i % 5) - 2, y - 5 - (i % 4));
      ctx.stroke();
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(16, 16);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAniso;
  return tex;
}

function createWaterTexture(maxAniso: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const grad = ctx.createLinearGradient(0, 0, 0, 128);
    grad.addColorStop(0, '#136073');
    grad.addColorStop(0.5, '#1D8FA3');
    grad.addColorStop(1, '#125B6E');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 128);

    ctx.strokeStyle = 'rgba(186, 244, 255, 0.35)';
    ctx.lineWidth = 2.5;
    for (let i = 0; i < 42; i++) {
      const x = (i * 37) % 512;
      const y = 16 + ((i * 23) % 96);
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.quadraticCurveTo(x + 18, y - 5, x + 36, y);
      ctx.stroke();
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(6, 1);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAniso;
  return tex;
}

function createWoodTexture(maxAniso: number, base = '#6B4226', grain = '#4B2B15'): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, 256, 256);
    ctx.strokeStyle = grain;
    for (let i = 0; i < 40; i++) {
      ctx.globalAlpha = 0.16 + (i % 4) * 0.05;
      ctx.lineWidth = 1.5 + (i % 3);
      const y = i * 6.5;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.bezierCurveTo(85, y + (i % 2 ? 4 : -4), 170, y - (i % 2 ? 3 : -3), 256, y);
      ctx.stroke();
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAniso;
  return tex;
}

function createFurTexture(maxAniso: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#C8742D';
    ctx.fillRect(0, 0, 256, 256);

    // Subtle warm radial highlights matching mascot's golden-brown coat
    const coatGrad = ctx.createLinearGradient(0, 0, 0, 256);
    coatGrad.addColorStop(0, 'rgba(229, 149, 73, 0.35)');
    coatGrad.addColorStop(1, 'rgba(155, 76, 24, 0.25)');
    ctx.fillStyle = coatGrad;
    ctx.fillRect(0, 0, 256, 256);

    for (let i = 0; i < 900; i++) {
      const x = (i * 53) % 256;
      const y = (i * 89) % 256;
      ctx.strokeStyle = i % 2 === 0 ? 'rgba(245, 192, 128, 0.28)' : 'rgba(138, 66, 20, 0.24)';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + 2, y + 6);
      ctx.stroke();
    }

    // Soft cream dappled spots like the homepage Cikgu Kancil mascot
    const spots: [number, number, number][] = [
      [44, 52, 8],
      [78, 72, 6],
      [182, 58, 7],
      [210, 84, 5.5],
      [62, 168, 7.5],
      [196, 174, 7]
    ];
    spots.forEach(([sx, sy, sr]) => {
      const spotGrad = ctx.createRadialGradient(sx, sy, 1, sx, sy, sr);
      spotGrad.addColorStop(0, 'rgba(253, 239, 212, 0.65)');
      spotGrad.addColorStop(1, 'rgba(253, 239, 212, 0)');
      ctx.fillStyle = spotGrad;
      ctx.beginPath();
      ctx.arc(sx, sy, sr, 0, Math.PI * 2);
      ctx.fill();
    });
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAniso;
  return tex;
}

function createContactShadowTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const grad = ctx.createRadialGradient(64, 64, 6, 64, 64, 60);
    grad.addColorStop(0, 'rgba(12, 20, 15, 0.55)');
    grad.addColorStop(0.55, 'rgba(12, 20, 15, 0.24)');
    grad.addColorStop(1, 'rgba(12, 20, 15, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 128, 128);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

interface SignboardOptions {
  station: number;
  tagText: string;
  line1: string;
  line2: string;
  borderHex: string;
  bgTopHex: string;
  bgBottomHex: string;
  accentHex: string;
  theme: 'gate' | 'book' | 'studio' | 'lab' | 'workshop' | 'royal';
  width: number;
  height: number;
  bracketDepth?: number;
}

type SignButtonKey = 'enter' | 'entering' | 'reopen' | 'reopening' | 'locked';

interface SignButtonTextures {
  enter: THREE.CanvasTexture;
  entering: THREE.CanvasTexture;
  reopen: THREE.CanvasTexture;
  reopening: THREE.CanvasTexture;
  lockedByStation: Record<number, THREE.CanvasTexture>;
}

function createSignButtonTexture(
  variant: 'enter' | 'entering' | 'reopen' | 'reopening' | 'locked',
  maxAniso: number,
  lockedPrerequisite?: number
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 768;
  canvas.height = 216;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const isReopen = variant === 'reopen' || variant === 'reopening';
    const isLocked = variant === 'locked';

    // Bold, unmistakable high-contrast button color combinations against Deep Royal Navy board
    const bgGrad = ctx.createLinearGradient(0, 0, 0, 216);
    if (isLocked) {
      bgGrad.addColorStop(0, '#64748B');
      bgGrad.addColorStop(0.55, '#475569');
      bgGrad.addColorStop(1, '#334155');
    } else if (isReopen) {
      // Vivid Saturated Emerald Green for BUKA SEMULA
      bgGrad.addColorStop(0, variant === 'reopening' ? '#6EE7B7' : '#34D399');
      bgGrad.addColorStop(0.45, '#10B981');
      bgGrad.addColorStop(1, '#047857');
    } else {
      // Vivid Bright Sun-Amber Gold for MASUK (sharply distinct from Navy board & Emerald button)
      bgGrad.addColorStop(0, variant === 'entering' ? '#FFF066' : '#FFE033');
      bgGrad.addColorStop(0.48, '#FFB703');
      bgGrad.addColorStop(1, '#F5820D');
    }

    ctx.fillStyle = bgGrad;
    ctx.beginPath();
    ctx.roundRect(6, 6, 756, 204, 28);
    ctx.fill();

    // Inner bright specular bevel highlight
    ctx.strokeStyle = isLocked
      ? 'rgba(226, 232, 240, 0.45)'
      : isReopen
      ? 'rgba(236, 253, 245, 0.92)'
      : 'rgba(255, 253, 232, 0.95)';
    ctx.lineWidth = 4.5;
    ctx.beginPath();
    ctx.roundRect(14, 14, 740, 188, 22);
    ctx.stroke();

    // Strong crisp border separating button cleanly from the Deep Royal Navy board
    ctx.strokeStyle = isLocked ? '#CBD5E1' : isReopen ? '#A7F3D0' : '#FFF3B0';
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.roundRect(6, 6, 756, 204, 28);
    ctx.stroke();

    const textColor = isLocked ? '#F8FAFC' : isReopen ? '#FFFFFF' : '#1A0B00';
    const subColor = isLocked ? '#E2E8F0' : isReopen ? '#ECFDF5' : '#2E1300';
    const textOutlineColor = isLocked ? '#0F172A' : isReopen ? '#022C22' : 'rgba(255, 248, 200, 0.65)';

    const titleText =
      variant === 'entering'
        ? 'MENUJU KE MISI...'
        : variant === 'reopening'
        ? 'MEMBUKA MISI...'
        : isReopen
        ? 'BUKA SEMULA'
        : isLocked
        ? 'TERKUNCI'
        : 'MASUK';

    const subtitleText =
      variant === 'entering'
        ? 'Cikgu Kancil sedang berjalan ke pintu masuk...'
        : variant === 'reopening'
        ? 'Cikgu Kancil sedang menuju ke bangunan...'
        : isReopen
        ? 'Tekan untuk mengulangi atau melihat semula misi'
        : isLocked
        ? `Selesaikan Misi ${lockedPrerequisite ?? 1} dahulu`
        : 'Tekan untuk memulakan atau meneruskan misi';

    // Fit title + draw left action icon cleanly
    ctx.font = '900 72px system-ui, -apple-system, Segoe UI, sans-serif';
    let titleSize = variant === 'entering' || variant === 'reopening' ? 54 : 74;
    while (titleSize > 42) {
      ctx.font = `900 ${titleSize}px system-ui, -apple-system, Segoe UI, sans-serif`;
      if (ctx.measureText(titleText).width <= 540) break;
      titleSize -= 2;
    }
    const textWidth = ctx.measureText(titleText).width;
    const iconSpan = 56;
    const totalGroupW = iconSpan + textWidth;
    const startX = 384 - totalGroupW / 2;
    const titleY = 82;

    // Crisp icon on left of button title
    ctx.save();
    ctx.translate(startX + 22, titleY - 2);
    ctx.shadowColor = isReopen || isLocked ? 'rgba(0, 0, 0, 0.4)' : 'rgba(255, 255, 255, 0.35)';
    ctx.shadowBlur = 3;
    ctx.shadowOffsetY = 2;
    ctx.fillStyle = textColor;
    ctx.strokeStyle = textColor;
    ctx.lineWidth = 6.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    if (isLocked) {
      ctx.beginPath();
      ctx.roundRect(-16, -2, 32, 24, 5);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(0, -6, 11, Math.PI, 0);
      ctx.stroke();
    } else if (isReopen) {
      ctx.beginPath();
      ctx.arc(0, 0, 18, 0.35, Math.PI * 1.85);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(11, -18);
      ctx.lineTo(20, -6);
      ctx.lineTo(6, -4);
      ctx.closePath();
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.moveTo(-12, -20);
      ctx.lineTo(20, 0);
      ctx.lineTo(-12, 20);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();

    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = textOutlineColor;
    ctx.lineWidth = isReopen || isLocked ? 6 : 3;
    ctx.strokeText(titleText, startX + iconSpan, titleY);
    ctx.fillStyle = textColor;
    ctx.fillText(titleText, startX + iconSpan, titleY);

    // Subtitle on second line (guaranteed to fit comfortably inside 710px)
    let subSize = 25;
    while (subSize > 17) {
      ctx.font = `700 ${subSize}px system-ui, -apple-system, Segoe UI, sans-serif`;
      if (ctx.measureText(subtitleText).width <= 696) break;
      subSize -= 1;
    }
    ctx.textAlign = 'center';
    if (isReopen || isLocked) {
      ctx.strokeStyle = textOutlineColor;
      ctx.lineWidth = 3.5;
      ctx.strokeText(subtitleText, 384, 158);
    }
    ctx.fillStyle = subColor;
    ctx.fillText(subtitleText, 384, 158);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAniso;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.needsUpdate = true;
  return tex;
}

function createSignboardTexture(opts: SignboardOptions, maxAniso: number): THREE.CanvasTexture {
  const isGate = opts.theme === 'gate';
  const cw = isGate ? 2048 : 1024;
  const ch = isGate ? 880 : 660;
  const sc = isGate ? 2 : 1;

  const canvas = document.createElement('canvas');
  canvas.width = cw;
  canvas.height = ch;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.scale(sc, sc);

    if (isGate) {
      // Gate keeps its iconic dark royal fantasy plaque
      const grad = ctx.createLinearGradient(0, 0, 0, 440);
      grad.addColorStop(0, opts.bgTopHex);
      grad.addColorStop(1, opts.bgBottomHex);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 1024, 440);

      const glow = ctx.createRadialGradient(512, 240, 40, 512, 240, 440);
      glow.addColorStop(0, 'rgba(255, 255, 255, 0.12)');
      glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, 1024, 440);

      ctx.strokeStyle = opts.borderHex;
      ctx.lineWidth = 18;
      ctx.strokeRect(12, 12, 1000, 416);

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.28)';
      ctx.lineWidth = 4;
      ctx.strokeRect(30, 30, 964, 380);
    } else {
      // Rich, bold, non-faded Deep Royal Navy-Indigo Signboard with Vivid Gold Frame
      ctx.fillStyle = '#0B102E';
      ctx.fillRect(0, 0, 1024, 660);

      // Polished Bright Gold outer frame
      ctx.strokeStyle = '#FACC15';
      ctx.lineWidth = 14;
      ctx.strokeRect(10, 10, 1004, 640);

      const royalGrad = ctx.createLinearGradient(0, 24, 0, 636);
      royalGrad.addColorStop(0, '#1E2761');
      royalGrad.addColorStop(0.52, '#151B4B');
      royalGrad.addColorStop(1, '#0D1236');
      ctx.fillStyle = royalGrad;
      ctx.beginPath();
      ctx.roundRect(24, 24, 976, 612, 28);
      ctx.fill();

      // Inner bright gold accent border
      ctx.strokeStyle = '#F59E0B';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.roundRect(38, 38, 948, 584, 20);
      ctx.stroke();

      // Corner glowing gold rivets
      ctx.fillStyle = '#FDE047';
      [
        [62, 62],
        [962, 62],
        [62, 598],
        [962, 598]
      ].forEach(([cx, cy]) => {
        ctx.beginPath();
        ctx.arc(cx, cy, 8.5, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    if (opts.tagText) {
      // Vivid Royal Crimson Mission Pill Header
      const pillW = opts.tagText.length > 8 ? 340 : 250;
      const pillX = 512 - pillW / 2;
      const pillY = 48;
      const pillH = 58;
      ctx.fillStyle = '#E11D48';
      ctx.beginPath();
      ctx.roundRect(pillX, pillY, pillW, pillH, 29);
      ctx.fill();
      ctx.strokeStyle = '#FDE047';
      ctx.lineWidth = 4.5;
      ctx.stroke();

      ctx.fillStyle = '#FFFFFF';
      ctx.font = '900 34px system-ui, -apple-system, Segoe UI, sans-serif';
      ctx.fillText(opts.tagText, 512, pillY + pillH / 2 + 2);
    }

    // Crisp Canvas2D thematic vector emblem on left & right beside pill (bright gold on deep navy)
    const drawBadgeEmblem = (cx: number, cy: number) => {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.fillStyle = '#FDE047';
      ctx.strokeStyle = '#FDE047';
      ctx.lineWidth = 4.5;
      if (opts.theme === 'book') {
        ctx.beginPath();
        ctx.moveTo(0, -10);
        ctx.quadraticCurveTo(-18, -18, -28, -8);
        ctx.lineTo(-28, 16);
        ctx.quadraticCurveTo(-16, 8, 0, 16);
        ctx.quadraticCurveTo(16, 8, 28, 16);
        ctx.lineTo(28, -8);
        ctx.quadraticCurveTo(18, -18, 0, -10);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, -10);
        ctx.lineTo(0, 16);
        ctx.stroke();
      } else if (opts.theme === 'studio') {
        ctx.fillRect(-20, -10, 26, 20);
        ctx.beginPath();
        ctx.moveTo(6, -4);
        ctx.lineTo(22, -13);
        ctx.lineTo(22, 13);
        ctx.lineTo(6, 4);
        ctx.closePath();
        ctx.fill();
      } else if (opts.theme === 'lab') {
        ctx.beginPath();
        ctx.roundRect(-8, -20, 16, 26, 8);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(0, -2, 16, 0, Math.PI);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, 14);
        ctx.lineTo(0, 22);
        ctx.moveTo(-10, 22);
        ctx.lineTo(10, 22);
        ctx.stroke();
      } else if (opts.theme === 'workshop') {
        ctx.beginPath();
        ctx.arc(0, 0, 18, 0, Math.PI * 2);
        ctx.stroke();
        [
          [0, -9],
          [9, 0],
          [0, 9],
          [-9, 0]
        ].forEach(([dx, dy]) => {
          ctx.beginPath();
          ctx.arc(dx, dy, 4, 0, Math.PI * 2);
          ctx.fill();
        });
      } else if (opts.theme === 'royal') {
        ctx.beginPath();
        ctx.moveTo(-22, 14);
        ctx.lineTo(-24, -10);
        ctx.lineTo(-10, 2);
        ctx.lineTo(0, -16);
        ctx.lineTo(10, 2);
        ctx.lineTo(24, -10);
        ctx.lineTo(22, 14);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
    };
    if (!isGate) {
      drawBadgeEmblem(128, 79);
      drawBadgeEmblem(896, 79);
    }

    // Main Title Lines (auto-fit width so zero clipping)
    const maxTextWidth = isGate ? 860 : 884;
    const fitFontSize = (text: string, startSize: number, minSize = 38, weight = '900') => {
      let size = startSize;
      while (size > minSize) {
        ctx.font = `${weight} ${size}px "Trebuchet MS", "Segoe UI", system-ui, -apple-system, sans-serif`;
        if (ctx.measureText(text).width <= maxTextWidth) break;
        size -= 2;
      }
      return size;
    };

    const drawSpacedLine = (text: string, y: number, fontSize: number, fill: string, spacing: number) => {
      ctx.font = `700 ${fontSize}px "Trebuchet MS", "Segoe UI", system-ui, -apple-system, sans-serif`;
      const chars = Array.from(text);
      const totalWidth =
        chars.reduce((acc, ch) => acc + ctx.measureText(ch).width, 0) + spacing * Math.max(0, chars.length - 1);
      const scale = totalWidth > 880 ? 880 / totalWidth : 1;
      const finalSize = Math.floor(fontSize * scale);
      const finalSpacing = spacing * scale;
      ctx.font = `700 ${finalSize}px "Trebuchet MS", "Segoe UI", system-ui, -apple-system, sans-serif`;
      const finalWidth =
        chars.reduce((acc, ch) => acc + ctx.measureText(ch).width, 0) + finalSpacing * Math.max(0, chars.length - 1);

      let cursorX = 512 - finalWidth / 2;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.lineJoin = 'round';

      chars.forEach((ch) => {
        const w = ctx.measureText(ch).width;
        ctx.shadowColor = 'rgba(6, 2, 16, 0.96)';
        ctx.shadowBlur = 12;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 5;
        ctx.strokeStyle = '#120521';
        ctx.lineWidth = 10;
        ctx.strokeText(ch, cursorX, y);

        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.fillStyle = fill;
        ctx.fillText(ch, cursorX, y);
        cursorX += w + finalSpacing;
      });
      ctx.textAlign = 'center';
    };

    if (isGate) {
      drawSpacedLine(opts.line1, 154, 88, '#FFFFFF', 6);
      drawSpacedLine(opts.line2, 294, 78, '#FDE047', 4.5);
    } else {
      // TOP SECTION: MISSION NAME in Pure Crisp White (#FFFFFF) over Deep Royal Navy
      const line1Size = fitFontSize(opts.line1, opts.line1.length > 16 ? 68 : 78);
      ctx.font = `900 ${line1Size}px system-ui, -apple-system, Segoe UI, sans-serif`;
      ctx.lineJoin = 'round';
      ctx.shadowColor = 'rgba(4, 6, 22, 0.9)';
      ctx.shadowBlur = 10;
      ctx.shadowOffsetY = 4;
      ctx.strokeStyle = '#060921';
      ctx.lineWidth = 9;
      ctx.strokeText(opts.line1, 512, 180);
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetY = 0;
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText(opts.line1, 512, 180);

      const line2Size = fitFontSize(opts.line2, opts.line2.length > 16 ? 64 : 74);
      ctx.font = `900 ${line2Size}px system-ui, -apple-system, Segoe UI, sans-serif`;
      ctx.shadowColor = 'rgba(4, 6, 22, 0.9)';
      ctx.shadowBlur = 10;
      ctx.shadowOffsetY = 4;
      ctx.strokeStyle = '#060921';
      ctx.lineWidth = 9;
      ctx.strokeText(opts.line2, 512, 266);
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetY = 0;
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText(opts.line2, 512, 266);

      // HORIZONTAL GOLD DIVIDER (#FACC15) separating Mission Title from Action Button below
      ctx.strokeStyle = '#FACC15';
      ctx.lineWidth = 5.5;
      ctx.beginPath();
      ctx.moveTo(76, 340);
      ctx.lineTo(486, 340);
      ctx.moveTo(538, 340);
      ctx.lineTo(948, 340);
      ctx.stroke();

      // Center diamond divider accent
      ctx.fillStyle = '#FDE047';
      ctx.beginPath();
      ctx.moveTo(512, 326);
      ctx.lineTo(526, 340);
      ctx.lineTo(512, 354);
      ctx.lineTo(498, 340);
      ctx.closePath();
      ctx.fill();

      // Deep Navy recessed button slot with subtle bright edge so the button stands out crisply
      ctx.fillStyle = '#060921';
      ctx.beginPath();
      ctx.roundRect(72, 370, 880, 232, 24);
      ctx.fill();
      ctx.strokeStyle = '#3B4A99';
      ctx.lineWidth = 3;
      ctx.stroke();
    }

    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAniso;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.needsUpdate = true;
  return tex;
}

interface ThemedSignboardResult {
  group: THREE.Group;
  buttonGroup: THREE.Group | null;
  buttonFaceMat: THREE.MeshBasicMaterial | null;
  buttonCollider: THREE.Mesh | null;
}

function createThemedSignboard(
  opts: SignboardOptions,
  frameMat: THREE.Material,
  goldMat: THREE.Material,
  accentGlowMat: THREE.Material,
  maxAniso: number,
  buttonTextures?: SignButtonTextures
): ThemedSignboardResult {
  const signGroup = new THREE.Group();
  const isGate = opts.theme === 'gate';
  const tex = createSignboardTexture(opts, maxAniso);

  // Rich Royal Navy outer backing frame for mission boards
  const timberFrameMat = isGate
    ? frameMat
    : new THREE.MeshStandardMaterial({ color: 0x161d4a, roughness: 0.55, metalness: 0.18 });

  const backing = new THREE.Mesh(
    new THREE.BoxGeometry(opts.width + 0.44, opts.height + 0.44, 0.24),
    timberFrameMat
  );
  backing.castShadow = true;
  signGroup.add(backing);

  // Gold bezel bars top & bottom
  const topBar = new THREE.Mesh(new THREE.BoxGeometry(opts.width + 0.56, 0.16, 0.3), goldMat);
  topBar.position.y = opts.height / 2 + 0.18;
  const botBar = new THREE.Mesh(new THREE.BoxGeometry(opts.width + 0.56, 0.16, 0.3), goldMat);
  botBar.position.y = -opts.height / 2 - 0.18;
  signGroup.add(topBar, botBar);

  // Side trim pillars on mission boards for crisp framing
  if (!isGate) {
    [-opts.width / 2 - 0.18, opts.width / 2 + 0.18].forEach((sx) => {
      const sideTrim = new THREE.Mesh(new THREE.BoxGeometry(0.16, opts.height + 0.42, 0.28), goldMat);
      sideTrim.position.set(sx, 0, 0.01);
      signGroup.add(sideTrim);
    });
  }

  // Sturdy mounting brackets connecting signboard to enlarged building facade
  const bDepth = opts.bracketDepth ?? 0.72;
  [-opts.width * 0.3, opts.width * 0.3].forEach((bx) => {
    const bracket = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.3, bDepth), timberFrameMat);
    bracket.position.set(bx, 0, -bDepth / 2 - 0.06);
    signGroup.add(bracket);
  });

  // Unwashed, true-color front signboard face (toneMapped: false prevents ACES fading/washout)
  const faceMat = new THREE.MeshBasicMaterial({
    map: tex,
    toneMapped: false
  });
  const face = new THREE.Mesh(new THREE.PlaneGeometry(opts.width, opts.height), faceMat);
  face.position.z = 0.13;
  signGroup.add(face);

  // Physical 3D Interactive Action Button embedded neatly in the LOWER bay of the SAME signboard
  let buttonGroup: THREE.Group | null = null;
  let buttonFaceMat: THREE.MeshBasicMaterial | null = null;
  let buttonCollider: THREE.Mesh | null = null;

  if (!isGate && buttonTextures) {
    const btnWidth = opts.width * 0.83;
    const btnHeight = opts.height * 0.325;
    const btnY = -opts.height * 0.238; // Centered cleanly in lower bay (canvas y=370..602)

    buttonGroup = new THREE.Group();
    buttonGroup.position.set(0, btnY, 0.2);

    const btnBase = new THREE.Mesh(
      new THREE.BoxGeometry(btnWidth, btnHeight, 0.14),
      new THREE.MeshStandardMaterial({ color: 0x0b102e, roughness: 0.4, metalness: 0.2 })
    );
    btnBase.castShadow = true;
    buttonGroup.add(btnBase);

    const initTex = buttonTextures.enter;
    buttonFaceMat = new THREE.MeshBasicMaterial({
      map: initTex,
      toneMapped: false
    });
    const btnFace = new THREE.Mesh(new THREE.PlaneGeometry(btnWidth - 0.04, btnHeight - 0.04), buttonFaceMat);
    btnFace.position.z = 0.076;
    buttonGroup.add(btnFace);

    signGroup.add(buttonGroup);

    // Dedicated Layer 1 collider on the button itself (generous pad for effortless touch/mouse picking)
    buttonCollider = new THREE.Mesh(
      new THREE.BoxGeometry(btnWidth + 0.55, btnHeight + 0.45, 0.9),
      new THREE.MeshBasicMaterial({ visible: false })
    );
    buttonCollider.position.set(0, btnY, 0.32);
    buttonCollider.layers.set(1);
    buttonCollider.userData = { station: opts.station, isSignButton: true };
    signGroup.add(buttonCollider);
  }

  // Thematic 3D ornaments mounted neatly on top/corners of signboard
  const topY = opts.height / 2 + 0.28;
  if (opts.theme === 'book') {
    const leftWing = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.09, 0.48), accentGlowMat);
    leftWing.position.set(-0.38, topY + 0.14, 0.04);
    leftWing.rotation.z = 0.28;
    const rightWing = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.09, 0.48), accentGlowMat);
    rightWing.position.set(0.38, topY + 0.14, 0.04);
    rightWing.rotation.z = -0.28;
    signGroup.add(leftWing, rightWing);
  } else if (opts.theme === 'studio') {
    [-opts.width * 0.42, opts.width * 0.42].forEach((cx) => {
      const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.2, 10, 8), accentGlowMat);
      bulb.position.set(cx, topY + 0.14, 0.08);
      signGroup.add(bulb);
    });
  } else if (opts.theme === 'lab') {
    [-opts.width * 0.4, 0, opts.width * 0.4].forEach((cx, idx) => {
      const orb = new THREE.Mesh(
        new THREE.SphereGeometry(idx === 1 ? 0.24 : 0.15, 10, 8),
        accentGlowMat
      );
      orb.position.set(cx, topY + (idx === 1 ? 0.2 : 0.12), 0.06);
      signGroup.add(orb);
    });
  } else if (opts.theme === 'workshop') {
    const reel = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.18, 14), goldMat);
    reel.rotation.x = Math.PI / 2;
    reel.position.set(0, topY + 0.2, 0.05);
    signGroup.add(reel);
  } else if (opts.theme === 'royal') {
    [-opts.width * 0.46, opts.width * 0.46].forEach((cx) => {
      const finial = new THREE.Mesh(new THREE.OctahedronGeometry(0.22, 0), goldMat);
      finial.position.set(cx, topY + 0.18, 0.06);
      signGroup.add(finial);
    });
    const crownBand = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.46, 0.38, 8), goldMat);
    crownBand.position.set(0, topY + 0.22, 0.05);
    const crownJewel = new THREE.Mesh(new THREE.OctahedronGeometry(0.26, 0), accentGlowMat);
    crownJewel.position.set(0, topY + 0.52, 0.05);
    signGroup.add(crownBand, crownJewel);
  }

  return { group: signGroup, buttonGroup, buttonFaceMat, buttonCollider };
}

interface BuildingHandle {
  station: number;
  baseScale: number;
  group: THREE.Group;
  ringMesh: THREE.Mesh;
  beaconMesh: THREE.Mesh;
  lockBadge: THREE.Group;
  doneBadge: THREE.Group;
  signButtonGroup: THREE.Group | null;
  signButtonFaceMat: THREE.MeshBasicMaterial | null;
  signButtonCollider: THREE.Mesh | null;
  currentButtonKey: SignButtonKey | null;
  windowMats: THREE.MeshStandardMaterial[];
  doorMat: THREE.MeshStandardMaterial;
  collider: THREE.Mesh;
}

interface KancilRig {
  root: THREE.Group;
  bodyGroup: THREE.Group;
  headPivot: THREE.Group;
  leftArmPivot: THREE.Group;
  rightArmPivot: THREE.Group;
  leftLegPivot: THREE.Group;
  leftShinPivot: THREE.Group;
  rightLegPivot: THREE.Group;
  rightShinPivot: THREE.Group;
  leftEyelid: THREE.Mesh;
  rightEyelid: THREE.Mesh;
  tailPivot: THREE.Group;
  shadowDisc: THREE.Mesh;
}

function buildCikguKancil(furTex: THREE.Texture, shadowTex: THREE.Texture): KancilRig {
  const root = new THREE.Group();
  const bodyGroup = new THREE.Group();
  root.add(bodyGroup);

  const furMat = new THREE.MeshStandardMaterial({ map: furTex, roughness: 0.68, metalness: 0.04 });
  const darkFurMat = new THREE.MeshStandardMaterial({ color: 0x8f4718, roughness: 0.7 });
  const creamMat = new THREE.MeshStandardMaterial({ color: 0xfaf0dc, roughness: 0.72 });
  const shirtMat = new THREE.MeshStandardMaterial({ color: 0xfff8ec, roughness: 0.65 });
  const maroonMat = new THREE.MeshStandardMaterial({ color: 0x7a1833, roughness: 0.5 });
  const goldMat = new THREE.MeshStandardMaterial({ color: 0xf6c343, roughness: 0.24, metalness: 0.75 });
  const bowtieMat = new THREE.MeshStandardMaterial({ color: 0x5c3419, roughness: 0.58 });
  const leatherMat = new THREE.MeshStandardMaterial({ color: 0x62361a, roughness: 0.64 });
  const darkMat = new THREE.MeshStandardMaterial({ color: 0x1e120e, roughness: 0.35 });
  const pinkEarMat = new THREE.MeshStandardMaterial({ color: 0xf2a89b, roughness: 0.65 });
  const blushMat = new THREE.MeshStandardMaterial({ color: 0xee8f82, roughness: 0.75 });
  const eyeWhiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.1 });
  const eyeIrisMat = new THREE.MeshStandardMaterial({ color: 0x3b1d0c, roughness: 0.12 });
  const eyePupilMat = new THREE.MeshStandardMaterial({ color: 0x120906, roughness: 0.08, metalness: 0.1 });
  const glassLensMat = new THREE.MeshStandardMaterial({
    color: 0xe6f6ff,
    transparent: true,
    opacity: 0.22,
    roughness: 0.08,
    metalness: 0.15
  });

  // Soft ground contact shadow under Cikgu Kancil's hooves
  const shadowDisc = new THREE.Mesh(
    new THREE.PlaneGeometry(1.15, 1.15),
    new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      opacity: 0.78,
      depthWrite: false
    })
  );
  shadowDisc.rotation.x = -Math.PI / 2;
  shadowDisc.position.y = 0.015;
  root.add(shadowDisc);

  // Articulated Legs (Hip at y=0.56 -> Knee at -0.22 -> Hoof bottom at -0.56)
  const makeLeg = (xOffset: number) => {
    const hipPivot = new THREE.Group();
    hipPivot.position.set(xOffset, 0.56, 0);

    const thigh = new THREE.Mesh(new THREE.CapsuleGeometry(0.115, 0.18, 6, 10), furMat);
    thigh.position.y = -0.12;
    thigh.castShadow = true;
    hipPivot.add(thigh);

    const shinPivot = new THREE.Group();
    shinPivot.position.set(0, -0.24, 0);
    hipPivot.add(shinPivot);

    const shin = new THREE.Mesh(new THREE.CapsuleGeometry(0.082, 0.16, 6, 10), furMat);
    shin.position.y = -0.13;
    shin.castShadow = true;
    shinPivot.add(shin);

    const hoof = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.105, 0.11, 10), darkMat);
    hoof.position.y = -0.265;
    hoof.castShadow = true;
    shinPivot.add(hoof);

    return { hipPivot, shinPivot };
  };

  const leftLeg = makeLeg(-0.17);
  const rightLeg = makeLeg(0.17);
  bodyGroup.add(leftLeg.hipPivot, rightLeg.hipPivot);

  // Torso, Cream Shirt Front & Deep Maroon Embroidered Teacher Vest
  const torso = new THREE.Mesh(new THREE.SphereGeometry(0.37, 18, 14), furMat);
  torso.scale.set(0.96, 1.16, 0.86);
  torso.position.y = 0.9;
  torso.castShadow = true;
  bodyGroup.add(torso);

  const shirtFront = new THREE.Mesh(new THREE.SphereGeometry(0.29, 14, 12), shirtMat);
  shirtFront.scale.set(0.76, 1.02, 0.55);
  shirtFront.position.set(0, 0.92, 0.19);
  bodyGroup.add(shirtFront);

  // Open-front maroon vest panels (wrapping left, right, and back so cream shirt V-front stays visible!)
  const vestBack = new THREE.Mesh(
    new THREE.CylinderGeometry(0.35, 0.4, 0.56, 18, 1, false, Math.PI * 0.25, Math.PI * 1.5),
    maroonMat
  );
  vestBack.position.set(0, 0.9, 0);
  vestBack.rotation.y = Math.PI;
  vestBack.castShadow = true;
  bodyGroup.add(vestBack);

  [-1, 1].forEach((side) => {
    const lapel = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.5, 0.14), goldMat);
    lapel.position.set(side * 0.15, 0.94, 0.27);
    lapel.rotation.z = -side * 0.16;
    lapel.rotation.y = side * 0.35;
    bodyGroup.add(lapel);
  });

  // Brass vest buttons down the front
  [0.74, 0.88, 1.02].forEach((by) => {
    const btn = new THREE.Mesh(new THREE.SphereGeometry(0.028, 8, 8), goldMat);
    btn.position.set(0, by, 0.355);
    bodyGroup.add(btn);
  });

  // Shirt Collar & Signature Brown Bowtie
  const collarRing = new THREE.Mesh(new THREE.TorusGeometry(0.21, 0.045, 8, 18), shirtMat);
  collarRing.rotation.x = Math.PI / 2;
  collarRing.position.set(0, 1.24, 0.04);
  bodyGroup.add(collarRing);

  const bowtieGroup = new THREE.Group();
  bowtieGroup.position.set(0, 1.21, 0.28);
  const bowKnot = new THREE.Mesh(new THREE.SphereGeometry(0.042, 8, 8), bowtieMat);
  const leftWing = new THREE.Mesh(new THREE.ConeGeometry(0.065, 0.13, 6), bowtieMat);
  leftWing.rotation.z = -Math.PI / 2;
  leftWing.position.x = -0.075;
  leftWing.scale.set(0.65, 1, 0.55);
  const rightWing = new THREE.Mesh(new THREE.ConeGeometry(0.065, 0.13, 6), bowtieMat);
  rightWing.rotation.z = Math.PI / 2;
  rightWing.position.x = 0.075;
  rightWing.scale.set(0.65, 1, 0.55);
  bowtieGroup.add(bowKnot, leftWing, rightWing);
  bodyGroup.add(bowtieGroup);

  // Cute adventure satchel on back
  const satchel = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.32, 0.2), leatherMat);
  satchel.position.set(0, 0.9, -0.34);
  satchel.castShadow = true;
  bodyGroup.add(satchel);
  const satchelFlap = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.13, 0.22), leatherMat);
  satchelFlap.position.set(0, 1.02, -0.35);
  bodyGroup.add(satchelFlap);
  const buckle = new THREE.Mesh(new THREE.BoxGeometry(0.085, 0.075, 0.04), goldMat);
  buckle.position.set(0, 0.94, -0.45);
  bodyGroup.add(buckle);

  // Cute Cream Tail
  const tailPivot = new THREE.Group();
  tailPivot.position.set(0, 0.66, -0.3);
  const tail = new THREE.Mesh(new THREE.SphereGeometry(0.11, 10, 8), creamMat);
  tail.scale.set(0.85, 0.85, 1.4);
  tail.position.set(0, 0.05, -0.08);
  tailPivot.add(tail);
  bodyGroup.add(tailPivot);

  // Arms (with cream cuffs; left arm carries an Open Storybook matching the homepage mascot!)
  const makeArm = (xOffset: number, withBook: boolean) => {
    const pivot = new THREE.Group();
    pivot.position.set(xOffset, 1.14, 0.03);
    const sleeve = new THREE.Mesh(new THREE.CapsuleGeometry(0.085, 0.15, 6, 10), shirtMat);
    sleeve.position.y = -0.11;
    sleeve.castShadow = true;
    pivot.add(sleeve);

    const arm = new THREE.Mesh(new THREE.CapsuleGeometry(0.075, 0.14, 6, 10), furMat);
    arm.position.y = -0.26;
    arm.castShadow = true;
    pivot.add(arm);

    const paw = new THREE.Mesh(new THREE.SphereGeometry(0.082, 10, 8), darkMat);
    paw.position.y = -0.37;
    pivot.add(paw);

    if (withBook) {
      const bookGroup = new THREE.Group();
      bookGroup.position.set(0.06, -0.35, 0.22);
      bookGroup.rotation.set(0.55, -0.25, -0.2);

      const cover = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.04, 0.28), maroonMat);
      cover.castShadow = true;
      const pageLeft = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.035, 0.24), creamMat);
      pageLeft.position.set(-0.088, 0.03, 0);
      pageLeft.rotation.z = 0.22;
      const pageRight = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.035, 0.24), creamMat);
      pageRight.position.set(0.088, 0.03, 0);
      pageRight.rotation.z = -0.22;
      const ribbon = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.02, 0.32), goldMat);
      ribbon.position.set(0.02, 0.02, 0.02);

      bookGroup.add(cover, pageLeft, pageRight, ribbon);
      pivot.add(bookGroup);
    }

    return pivot;
  };
  const leftArmPivot = makeArm(-0.4, true);
  const rightArmPivot = makeArm(0.4, false);
  bodyGroup.add(leftArmPivot, rightArmPivot);

  // Expressive Head — NO mortarboard, NO antlers (100% matched to Enchanted Forest homepage mascot!)
  const headPivot = new THREE.Group();
  headPivot.position.set(0, 1.33, 0.04);
  bodyGroup.add(headPivot);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.37, 22, 18), furMat);
  head.position.y = 0.23;
  head.scale.set(1.06, 0.96, 1.0);
  head.castShadow = true;
  headPivot.add(head);

  // Cute brown fur tuft on crown of head
  [-0.04, 0.02, 0.06].forEach((tx, idx) => {
    const tuft = new THREE.Mesh(new THREE.ConeGeometry(0.052, 0.15 - idx * 0.015, 8), darkFurMat);
    tuft.position.set(tx, 0.6 + (idx === 1 ? 0.02 : 0), 0.06);
    tuft.rotation.z = -tx * 2.2;
    tuft.rotation.x = 0.22;
    headPivot.add(tuft);
  });

  // Cream forehead spots matching homepage illustration
  [
    [-0.14, 0.43, 0.27, 0.036],
    [-0.2, 0.38, 0.25, 0.026],
    [0.14, 0.43, 0.27, 0.036],
    [0.2, 0.38, 0.25, 0.026]
  ].forEach(([sx, sy, sz, sr]) => {
    const spot = new THREE.Mesh(new THREE.SphereGeometry(sr, 8, 8), creamMat);
    spot.scale.set(1, 0.85, 0.45);
    spot.position.set(sx, sy, sz);
    headPivot.add(spot);
  });

  // Friendly cream muzzle, dark nose & smiling arc
  const snout = new THREE.Mesh(new THREE.SphereGeometry(0.18, 16, 12), creamMat);
  snout.scale.set(1.05, 0.82, 1.12);
  snout.position.set(0, 0.14, 0.29);
  headPivot.add(snout);

  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.055, 10, 8), darkMat);
  nose.scale.set(1.22, 0.88, 0.92);
  nose.position.set(0, 0.2, 0.47);
  headPivot.add(nose);

  const smile = new THREE.Mesh(
    new THREE.TorusGeometry(0.075, 0.012, 6, 14, Math.PI * 0.82),
    darkMat
  );
  smile.position.set(0, 0.13, 0.44);
  smile.rotation.z = Math.PI * 1.09;
  headPivot.add(smile);

  // Expressive Eyes, Eyelids (for blinking), Rosy Cheeks, Wide Leaf Ears & Round Gold Glasses
  const eyelids: THREE.Mesh[] = [];
  [-1, 1].forEach((side) => {
    const eyeSocket = new THREE.Mesh(new THREE.SphereGeometry(0.088, 14, 12), eyeWhiteMat);
    eyeSocket.position.set(side * 0.155, 0.275, 0.3);
    eyeSocket.scale.set(1.0, 1.12, 0.62);
    headPivot.add(eyeSocket);

    const iris = new THREE.Mesh(new THREE.SphereGeometry(0.066, 12, 10), eyeIrisMat);
    iris.position.set(side * 0.155, 0.275, 0.335);
    iris.scale.set(1, 1.08, 0.6);
    headPivot.add(iris);

    const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.048, 12, 10), eyePupilMat);
    pupil.position.set(side * 0.155, 0.275, 0.352);
    pupil.scale.set(1, 1.08, 0.6);
    headPivot.add(pupil);

    const sparkleMain = new THREE.Mesh(new THREE.SphereGeometry(0.02, 8, 8), eyeWhiteMat);
    sparkleMain.position.set(side * 0.135, 0.305, 0.382);
    headPivot.add(sparkleMain);

    const sparkleSub = new THREE.Mesh(new THREE.SphereGeometry(0.011, 6, 6), eyeWhiteMat);
    sparkleSub.position.set(side * 0.175, 0.248, 0.38);
    headPivot.add(sparkleSub);

    // Eyelid hemisphere that closes cleanly during periodic blinks
    const eyelid = new THREE.Mesh(
      new THREE.SphereGeometry(0.094, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.52),
      furMat
    );
    eyelid.position.set(side * 0.155, 0.275, 0.305);
    eyelid.scale.set(1.02, 1.12, 0.68);
    eyelid.rotation.x = -Math.PI * 0.65; // Open state
    headPivot.add(eyelid);
    eyelids.push(eyelid);

    // Warm rosy cheek blush
    const cheek = new THREE.Mesh(new THREE.SphereGeometry(0.056, 10, 8), blushMat);
    cheek.scale.set(1.2, 0.72, 0.4);
    cheek.position.set(side * 0.245, 0.175, 0.285);
    headPivot.add(cheek);

    // Signature Round Gold Glasses!
    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.112, 0.015, 10, 26), goldMat);
    rim.position.set(side * 0.155, 0.272, 0.378);
    headPivot.add(rim);

    const lens = new THREE.Mesh(new THREE.CircleGeometry(0.105, 20), glassLensMat);
    lens.position.set(side * 0.155, 0.272, 0.378);
    headPivot.add(lens);

    const temple = new THREE.Mesh(new THREE.BoxGeometry(0.014, 0.014, 0.28), goldMat);
    temple.position.set(side * 0.272, 0.282, 0.24);
    temple.rotation.y = side * 0.22;
    headPivot.add(temple);

    // Wide cute leaf-shaped kancil ears with peach-pink inner hollow
    const ear = new THREE.Mesh(new THREE.SphereGeometry(0.15, 14, 12), furMat);
    ear.scale.set(0.75, 1.65, 0.42);
    ear.position.set(side * 0.34, 0.48, -0.02);
    ear.rotation.z = -side * 0.62;
    ear.rotation.y = side * 0.22;
    ear.castShadow = true;
    headPivot.add(ear);

    const innerEar = new THREE.Mesh(new THREE.SphereGeometry(0.105, 12, 10), pinkEarMat);
    innerEar.scale.set(0.68, 1.45, 0.3);
    innerEar.position.set(side * 0.335, 0.475, 0.022);
    innerEar.rotation.z = -side * 0.62;
    innerEar.rotation.y = side * 0.22;
    headPivot.add(innerEar);
  });

  // Gold nose bridge connecting the two glasses rims
  const glassBridge = new THREE.Mesh(new THREE.TorusGeometry(0.048, 0.013, 8, 14, Math.PI), goldMat);
  glassBridge.position.set(0, 0.282, 0.382);
  headPivot.add(glassBridge);

  return {
    root,
    bodyGroup,
    headPivot,
    leftArmPivot,
    rightArmPivot,
    leftLegPivot: leftLeg.hipPivot,
    leftShinPivot: leftLeg.shinPivot,
    rightLegPivot: rightLeg.hipPivot,
    rightShinPivot: rightLeg.shinPivot,
    leftEyelid: eyelids[0],
    rightEyelid: eyelids[1],
    tailPivot,
    shadowDisc
  };
}

function buildStatusBadges(group: THREE.Group) {
  // Lock badge (above roof when locked)
  const lockBadge = new THREE.Group();
  lockBadge.position.set(0, 4.9, 0);
  const lockMetal = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.35, metalness: 0.7 });
  const lockBodyMat = new THREE.MeshStandardMaterial({ color: 0xf5b82e, roughness: 0.3, metalness: 0.6 });
  const lockBody = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.5, 0.28), lockBodyMat);
  const shackle = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.055, 8, 16, Math.PI), lockMetal);
  shackle.position.y = 0.24;
  lockBadge.add(lockBody, shackle);
  group.add(lockBadge);

  // Completed Star Checkmark Badge
  const doneBadge = new THREE.Group();
  doneBadge.position.set(0, 5.1, 0);
  const starMat = new THREE.MeshStandardMaterial({
    color: 0xfde047,
    emissive: 0xd97706,
    emissiveIntensity: 0.55,
    roughness: 0.22,
    metalness: 0.65
  });
  const star = new THREE.Mesh(new THREE.OctahedronGeometry(0.46, 0), starMat);
  star.scale.set(1, 1.15, 0.55);
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(0.62, 0.06, 8, 22),
    new THREE.MeshStandardMaterial({ color: 0x34d399, emissive: 0x059669, emissiveIntensity: 0.45 })
  );
  doneBadge.add(star, ring);
  group.add(doneBadge);

  return { lockBadge, doneBadge };
}

function createMissionBuilding(
  station: number,
  woodTex: THREE.Texture,
  maxAniso: number,
  buttonTextures: SignButtonTextures
): BuildingHandle {
  const rootGroup = new THREE.Group();
  const group = new THREE.Group();
  rootGroup.add(group);
  const windowMats: THREE.MeshStandardMaterial[] = [];

  const stoneMat = new THREE.MeshStandardMaterial({ color: 0x6b7280, roughness: 0.85 });
  const warmStoneMat = new THREE.MeshStandardMaterial({ color: 0x9c8c74, roughness: 0.82 });
  const woodMat = new THREE.MeshStandardMaterial({ map: woodTex, roughness: 0.72 });
  const goldMat = new THREE.MeshStandardMaterial({ color: 0xf5b82e, roughness: 0.28, metalness: 0.68 });
  const maroonMat = new THREE.MeshStandardMaterial({ color: 0x8b1e3f, roughness: 0.58 });
  const purpleMat = new THREE.MeshStandardMaterial({ color: 0x4c1d95, roughness: 0.62 });
  const roofSlateMat = new THREE.MeshStandardMaterial({ color: 0x3b1f5e, roughness: 0.65 });
  const creamWallMat = new THREE.MeshStandardMaterial({ color: 0xe9dec8, roughness: 0.8 });
  const doorMat = new THREE.MeshStandardMaterial({
    color: 0x613218,
    emissive: 0xf59e0b,
    emissiveIntensity: 0.15,
    roughness: 0.65
  });

  const makeWindowMat = (colorHex = 0xfde047, emissiveHex = 0xf59e0b) => {
    const m = new THREE.MeshStandardMaterial({
      color: colorHex,
      emissive: emissiveHex,
      emissiveIntensity: 0.7,
      roughness: 0.2
    });
    windowMats.push(m);
    return m;
  };

  // Ground beacon ring & spotlight cone (hidden/dimmed when locked)
  const ringMesh = new THREE.Mesh(
    new THREE.RingGeometry(2.3, 2.75, 32),
    new THREE.MeshBasicMaterial({ color: 0xfde047, transparent: true, opacity: 0.7, side: THREE.DoubleSide })
  );
  ringMesh.rotation.x = -Math.PI / 2;
  ringMesh.position.set(0, 0.04, 2.5);
  group.add(ringMesh);

  const isFixedBoardStation = station === 1 || station === 2 || station === 4 || station === 5;
  const beaconMesh = new THREE.Mesh(
    isFixedBoardStation
      ? new THREE.CylinderGeometry(0.85, 1.45, 0.42, 20, 1, true)
      : new THREE.CylinderGeometry(0.18, 1.4, 5.2, 16, 1, true),
    new THREE.MeshBasicMaterial({
      color: 0xfde047,
      transparent: true,
      opacity: isFixedBoardStation ? 0.22 : 0.14,
      side: THREE.DoubleSide,
      depthWrite: false
    })
  );
  beaconMesh.position.set(0, isFixedBoardStation ? 0.21 : 2.6, 2.5);
  group.add(beaconMesh);

  let signResult: ThemedSignboardResult = {
    group: new THREE.Group(),
    buttonGroup: null,
    buttonFaceMat: null,
    buttonCollider: null
  };

  if (station === 0) {
    // PINTU MASUK PENGEMBARAAN — Grand Fantasy Forest Archway Gate
    [-2.4, 2.4].forEach((x) => {
      const plinth = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.9, 1.1), warmStoneMat);
      plinth.position.set(x, 0.45, 0);
      plinth.castShadow = true;
      plinth.receiveShadow = true;
      group.add(plinth);

      const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.44, 3.3, 12), woodMat);
      pillar.position.set(x, 2.35, 0);
      pillar.castShadow = true;
      group.add(pillar);

      const lanternGlow = makeWindowMat(0xfef08a, 0xf59e0b);
      const lantern = new THREE.Mesh(new THREE.SphereGeometry(0.24, 10, 8), lanternGlow);
      lantern.position.set(x, 4.15, 0.32);
      group.add(lantern);

      const lanternCap = new THREE.Mesh(new THREE.ConeGeometry(0.32, 0.24, 8), goldMat);
      lanternCap.position.set(x, 4.38, 0.32);
      group.add(lanternCap);
    });

    // Overhead timber arch beam
    const beam = new THREE.Mesh(new THREE.BoxGeometry(6.2, 0.55, 0.9), woodMat);
    beam.position.set(0, 4.0, 0);
    beam.castShadow = true;
    group.add(beam);

    // Leaf accents
    [-1.8, 0, 1.8].forEach((x) => {
      const vine = new THREE.Mesh(
        new THREE.SphereGeometry(0.35, 10, 8),
        new THREE.MeshStandardMaterial({ color: 0x2e8b57, roughness: 0.7 })
      );
      vine.position.set(x, 3.7, 0.42);
      group.add(vine);
    });

    const { group: sign } = createThemedSignboard(
      {
        station: 0,
        tagText: '',
        line1: 'PINTU MASUK',
        line2: 'PENGEMBARAAN',
        borderHex: '#F5B82E',
        bgTopHex: '#2F0D4A',
        bgBottomHex: '#160526',
        accentHex: '#F5B82E',
        theme: 'gate',
        width: 7.4,
        height: 2.9,
        bracketDepth: 1.6
      },
      woodMat,
      goldMat,
      makeWindowMat(0xfef08a, 0xf59e0b),
      maxAniso
    );
    sign.position.set(0, 4.65, 2.05);
    sign.rotation.x = -0.58;
    group.add(sign);
  } else if (station === 1) {
    // MISI 1: PERPUSTAKAAN SASTERA AJAIB
    const base = new THREE.Mesh(new THREE.BoxGeometry(5.6, 0.4, 4.6), warmStoneMat);
    base.position.y = 0.2;
    base.receiveShadow = true;
    group.add(base);

    const body = new THREE.Mesh(new THREE.BoxGeometry(4.8, 2.7, 3.8), creamWallMat);
    body.position.y = 1.75;
    body.castShadow = true;
    body.receiveShadow = true;
    group.add(body);

    const roof = new THREE.Mesh(new THREE.ConeGeometry(3.8, 2.0, 4), roofSlateMat);
    roof.position.y = 4.1;
    roof.rotation.y = Math.PI / 4;
    roof.castShadow = true;
    group.add(roof);

    // Giant Open Book Roof Emblem
    const bookGroup = new THREE.Group();
    bookGroup.position.set(0, 5.1, 0.2);
    bookGroup.rotation.x = 0.35;
    const pageMat = makeWindowMat(0xfef9c3, 0xfbbf24);
    const leftPage = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.08, 0.85), pageMat);
    leftPage.position.x = -0.52;
    leftPage.rotation.z = 0.25;
    const rightPage = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.08, 0.85), pageMat);
    rightPage.position.x = 0.52;
    rightPage.rotation.z = -0.25;
    const cover = new THREE.Mesh(new THREE.BoxGeometry(2.25, 0.06, 0.92), maroonMat);
    cover.position.y = -0.06;
    bookGroup.add(cover, leftPage, rightPage);
    group.add(bookGroup);

    // Arched door + illuminated windows + exterior bookshelves
    const door = new THREE.Mesh(new THREE.BoxGeometry(1.15, 1.85, 0.22), doorMat);
    door.position.set(0, 1.32, 1.92);
    group.add(door);

    const winMat = makeWindowMat(0xfde047, 0xf59e0b);
    [-1.55, 1.55].forEach((x) => {
      const win = new THREE.Mesh(new THREE.BoxGeometry(0.85, 1.0, 0.16), winMat);
      win.position.set(x, 1.9, 1.92);
      group.add(win);
      // Flower planter under windows
      const planter = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.28, 0.38), woodMat);
      planter.position.set(x, 0.65, 2.05);
      group.add(planter);
      const flower = new THREE.Mesh(
        new THREE.SphereGeometry(0.24, 8, 8),
        new THREE.MeshStandardMaterial({ color: 0xf43f5e, roughness: 0.7 })
      );
      flower.position.set(x, 0.92, 2.06);
      group.add(flower);
    });

    signResult = createThemedSignboard(
      {
        station: 1,
        tagText: 'MISI 1',
        line1: 'PERPUSTAKAAN',
        line2: 'SASTERA AJAIB',
        borderHex: '#FACC15',
        bgTopHex: '#1E2761',
        bgBottomHex: '#0D1236',
        accentHex: '#FACC15',
        theme: 'book',
        width: 6.4,
        height: 4.1,
        bracketDepth: 2.5
      },
      woodMat,
      goldMat,
      makeWindowMat(0xfef9c3, 0xfbbf24),
      maxAniso,
      buttonTextures
    );
    signResult.group.position.set(0, 3.05, 6.15);
    signResult.group.rotation.x = -0.38;
    rootGroup.add(signResult.group);
  } else if (station === 2) {
    // MISI 2: STUDIO DETEKTIF PERSEMBAHAN
    const base = new THREE.Mesh(new THREE.BoxGeometry(5.8, 0.42, 4.6), stoneMat);
    base.position.y = 0.21;
    base.receiveShadow = true;
    group.add(base);

    const body = new THREE.Mesh(new THREE.BoxGeometry(5.0, 2.8, 3.8), purpleMat);
    body.position.y = 1.8;
    body.castShadow = true;
    body.receiveShadow = true;
    group.add(body);

    const roofTrim = new THREE.Mesh(new THREE.BoxGeometry(5.4, 0.35, 4.2), goldMat);
    roofTrim.position.y = 3.35;
    group.add(roofTrim);

    const roof = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 3.2, 1.25, 6), maroonMat);
    roof.position.y = 4.1;
    roof.castShadow = true;
    group.add(roof);

    // Camera / Microphone Roof Emblem
    const camBody = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.75, 0.75), woodMat);
    camBody.position.set(0, 5.1, 0.2);
    const lens = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.36, 0.55, 14), goldMat);
    lens.rotation.x = Math.PI / 2;
    lens.position.set(0, 5.1, 0.72);
    group.add(camBody, lens);

    const door = new THREE.Mesh(new THREE.BoxGeometry(1.3, 1.95, 0.22), doorMat);
    door.position.set(0, 1.38, 1.92);
    group.add(door);

    const winMat = makeWindowMat(0xfde68a, 0xd946ef);
    [-1.65, 1.65].forEach((x) => {
      const win = new THREE.Mesh(new THREE.BoxGeometry(0.95, 1.35, 0.16), winMat);
      win.position.set(x, 1.85, 1.92);
      group.add(win);
    });

    signResult = createThemedSignboard(
      {
        station: 2,
        tagText: 'MISI 2',
        line1: 'STUDIO DETEKTIF',
        line2: 'PERSEMBAHAN',
        borderHex: '#FACC15',
        bgTopHex: '#1E2761',
        bgBottomHex: '#0D1236',
        accentHex: '#FACC15',
        theme: 'studio',
        width: 6.4,
        height: 4.1,
        bracketDepth: 3.3
      },
      maroonMat,
      goldMat,
      makeWindowMat(0xfde68a, 0xe879f9),
      maxAniso,
      buttonTextures
    );
    signResult.group.position.set(0, 3.15, 6.75);
    signResult.group.rotation.x = -0.36;
    rootGroup.add(signResult.group);
  } else if (station === 3) {
    // MISI 3: MAKMAL PERSEMBAHAN
    const base = new THREE.Mesh(new THREE.CylinderGeometry(3.2, 3.5, 0.42, 8), stoneMat);
    base.position.y = 0.21;
    base.receiveShadow = true;
    group.add(base);

    const body = new THREE.Mesh(new THREE.CylinderGeometry(2.6, 2.8, 2.8, 8), new THREE.MeshStandardMaterial({ color: 0x3b1c6d, roughness: 0.6 }));
    body.position.y = 1.8;
    body.castShadow = true;
    group.add(body);

    const dome = new THREE.Mesh(
      new THREE.SphereGeometry(2.55, 18, 12, 0, Math.PI * 2, 0, Math.PI * 0.55),
      new THREE.MeshStandardMaterial({ color: 0x6d28d9, roughness: 0.42, metalness: 0.2 })
    );
    dome.position.y = 3.1;
    dome.castShadow = true;
    group.add(dome);

    // Microphone & Soundwave Spire on top
    const micStand = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.16, 1.1, 10), goldMat);
    micStand.position.y = 5.4;
    const micHead = new THREE.Mesh(new THREE.SphereGeometry(0.32, 12, 10), makeWindowMat(0x7dd3fc, 0x38bdf8));
    micHead.position.y = 6.05;
    group.add(micStand, micHead);

    const door = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.9, 0.3), doorMat);
    door.position.set(0, 1.35, 2.55);
    group.add(door);

    const winMat = makeWindowMat(0xbae6fd, 0x38bdf8);
    [-1.65, 1.65].forEach((x) => {
      const win = new THREE.Mesh(new THREE.BoxGeometry(0.82, 1.45, 0.25), winMat);
      win.position.set(x, 1.85, 2.1);
      win.rotation.y = x < 0 ? -0.52 : 0.52;
      group.add(win);
    });

    signResult = createThemedSignboard(
      {
        station: 3,
        tagText: 'MISI 3',
        line1: 'MAKMAL',
        line2: 'PERSEMBAHAN',
        borderHex: '#FACC15',
        bgTopHex: '#1E2761',
        bgBottomHex: '#0D1236',
        accentHex: '#7DD3FC',
        theme: 'lab',
        width: 6.4,
        height: 4.1,
        bracketDepth: 1.75
      },
      purpleMat,
      goldMat,
      makeWindowMat(0xbae6fd, 0x38bdf8),
      maxAniso,
      buttonTextures
    );
    signResult.group.position.set(0, 5.3, 5.2);
    signResult.group.rotation.x = -0.44;
    rootGroup.add(signResult.group);
  } else if (station === 4) {
    // MISI 4: BENGKEL TRANSFORMASI
    const base = new THREE.Mesh(new THREE.BoxGeometry(6.2, 0.42, 4.6), warmStoneMat);
    base.position.y = 0.21;
    base.receiveShadow = true;
    group.add(base);

    const body = new THREE.Mesh(new THREE.BoxGeometry(5.5, 2.75, 3.9), woodMat);
    body.position.y = 1.78;
    body.castShadow = true;
    group.add(body);

    const roof = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 4.1, 1.8, 4), purpleMat);
    roof.position.y = 4.05;
    roof.rotation.y = Math.PI / 4;
    roof.scale.set(1.2, 1, 0.85);
    roof.castShadow = true;
    group.add(roof);

    // Film Reel / Tripod Video Motif on Roof
    const reel = new THREE.Mesh(new THREE.CylinderGeometry(0.68, 0.68, 0.26, 16), goldMat);
    reel.rotation.x = Math.PI / 2;
    reel.position.set(0, 5.15, 0.15);
    const reelCore = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.3, 12), maroonMat);
    reelCore.rotation.x = Math.PI / 2;
    reelCore.position.set(0, 5.15, 0.15);
    group.add(reel, reelCore);

    const door = new THREE.Mesh(new THREE.BoxGeometry(1.75, 2.0, 0.24), doorMat);
    door.position.set(0, 1.4, 1.96);
    group.add(door);

    const winMat = makeWindowMat(0xfef08a, 0xc084fc);
    [-1.85, 1.85].forEach((x) => {
      const win = new THREE.Mesh(new THREE.BoxGeometry(0.95, 1.15, 0.18), winMat);
      win.position.set(x, 1.95, 1.96);
      group.add(win);
    });

    signResult = createThemedSignboard(
      {
        station: 4,
        tagText: 'MISI 4',
        line1: 'BENGKEL',
        line2: 'TRANSFORMASI',
        borderHex: '#FACC15',
        bgTopHex: '#1E2761',
        bgBottomHex: '#0D1236',
        accentHex: '#FACC15',
        theme: 'workshop',
        width: 6.4,
        height: 4.1,
        bracketDepth: 2.65
      },
      woodMat,
      goldMat,
      makeWindowMat(0xfef08a, 0xc084fc),
      maxAniso,
      buttonTextures
    );
    signResult.group.position.set(0, 3.05, 6.15);
    signResult.group.rotation.x = -0.38;
    rootGroup.add(signResult.group);
  } else if (station === 5) {
    // MISI 5: PENTAS SERIBU KISAH (AKHIR) — Grand Royal Malay Fantasy Theater Hall
    const podium1 = new THREE.Mesh(new THREE.BoxGeometry(8.6, 0.45, 6.4), warmStoneMat);
    podium1.position.y = 0.225;
    podium1.receiveShadow = true;
    group.add(podium1);

    const podium2 = new THREE.Mesh(new THREE.BoxGeometry(7.6, 0.4, 5.4), stoneMat);
    podium2.position.y = 0.62;
    podium2.receiveShadow = true;
    group.add(podium2);

    // Red Royal Carpet Apron extending forward (+Z)
    const carpet = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.12, 4.2), maroonMat);
    carpet.position.set(0, 0.08, 3.8);
    group.add(carpet);

    // Grand Main Theater Hall
    const hall = new THREE.Mesh(new THREE.BoxGeometry(6.8, 3.6, 4.4), purpleMat);
    hall.position.y = 2.6;
    hall.castShadow = true;
    hall.receiveShadow = true;
    group.add(hall);

    // Tall Golden Pillars framing grand front stage
    [-2.9, -1.65, 1.65, 2.9].forEach((x) => {
      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.3, 3.7, 12), goldMat);
      col.position.set(x, 2.65, 2.28);
      col.castShadow = true;
      group.add(col);
    });

    // Illuminated Stage Alcove & Maroon Draped Curtains
    const stageGlow = makeWindowMat(0xfef3c7, 0xf59e0b);
    const stageBackdrop = new THREE.Mesh(new THREE.BoxGeometry(2.9, 2.7, 0.22), stageGlow);
    stageBackdrop.position.set(0, 2.2, 2.22);
    group.add(stageBackdrop);

    [-1.18, 1.18].forEach((x) => {
      const curtain = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.42, 2.8, 10), maroonMat);
      curtain.position.set(x, 2.2, 2.38);
      group.add(curtain);
    });
    const valance = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.55, 0.38), maroonMat);
    valance.position.set(0, 3.5, 2.42);
    group.add(valance);

    // Tiered Malay Royal Roof + Crown Apex
    const roof1 = new THREE.Mesh(new THREE.ConeGeometry(5.1, 2.1, 4), maroonMat);
    roof1.position.y = 5.45;
    roof1.rotation.y = Math.PI / 4;
    roof1.scale.set(1.2, 1, 0.85);
    roof1.castShadow = true;
    group.add(roof1);

    const crownBase = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.65, 0.55, 8), goldMat);
    crownBase.position.y = 6.75;
    const crownGem = new THREE.Mesh(new THREE.OctahedronGeometry(0.45, 0), makeWindowMat(0xfef08a, 0xf59e0b));
    crownGem.position.y = 7.3;
    group.add(crownBase, crownGem);

    signResult = createThemedSignboard(
      {
        station: 5,
        tagText: 'MISI 5',
        line1: 'PENTAS SERIBU KISAH',
        line2: '(AKHIR)',
        borderHex: '#FDE047',
        bgTopHex: '#1E2761',
        bgBottomHex: '#0D1236',
        accentHex: '#FDE047',
        theme: 'royal',
        width: 7.2,
        height: 4.5,
        bracketDepth: 3.5
      },
      maroonMat,
      goldMat,
      makeWindowMat(0xfef08a, 0xf59e0b),
      maxAniso,
      buttonTextures
    );
    signResult.group.position.set(0, 3.65, 7.65);
    signResult.group.rotation.x = -0.36;
    rootGroup.add(signResult.group);

    // Reposition badges higher on tall theater hall
    ringMesh.scale.set(1.35, 1.35, 1);
    ringMesh.position.set(0, 0.05, 4.4);
    beaconMesh.position.set(0, 0.21, 4.4);
  }

  const { lockBadge, doneBadge } = buildStatusBadges(group);
  if (station === 5) {
    lockBadge.position.y = 8.45;
    doneBadge.position.y = 8.6;
  } else if (station === 3) {
    lockBadge.position.y = 7.05;
    doneBadge.position.y = 7.2;
  } else if (station === 0) {
    lockBadge.visible = false;
    doneBadge.visible = false;
    ringMesh.position.set(0, 0.04, 2.8);
    beaconMesh.position.set(0, 2.6, 2.8);
  } else {
    lockBadge.position.y = 6.35;
    doneBadge.position.y = 6.5;
  }

  // Scale ONLY the architectural building structure dramatically so the building dominates the signboard
  const structureScale = station >= 1 ? MISSION_BUILDING_SCALE : 1.15;
  group.scale.setScalar(structureScale);

  // Simplified clickable collision box on Layer 1 covering enlarged building structure
  const collider = new THREE.Mesh(
    new THREE.BoxGeometry(station === 5 ? 9.2 : 7.0, station === 5 ? 8.6 : 6.8, station === 5 ? 7.6 : 5.8),
    new THREE.MeshBasicMaterial({ visible: false })
  );
  collider.position.set(0, 3.0, 0.5);
  collider.layers.set(1);
  collider.userData = { station };
  group.add(collider);

  return {
    station,
    baseScale: 1,
    group: rootGroup,
    ringMesh,
    beaconMesh,
    lockBadge,
    doneBadge,
    signButtonGroup: signResult.buttonGroup,
    signButtonFaceMat: signResult.buttonFaceMat,
    signButtonCollider: signResult.buttonCollider,
    currentButtonKey: null,
    windowMats,
    doorMat,
    collider
  };
}

export default function AdventureMap3D({
  kancilStation,
  walkFromStation,
  walkTriggerId,
  celebrateUnlock,
  selectedStation,
  completedMissions,
  unlockedUpToMission,
  pendingEnterStation = null,
  cameraMode,
  onSelectStation,
  onActivateMission,
  onWalkComplete
}: AdventureMap3DProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [webglError, setWebglError] = useState(false);

  // Store reactive React props in refs so WebGL scene never tears down on UI state changes
  const propsRef = useRef({
    kancilStation,
    walkFromStation,
    walkTriggerId,
    celebrateUnlock,
    selectedStation,
    completedMissions,
    unlockedUpToMission,
    pendingEnterStation,
    cameraMode,
    onSelectStation,
    onActivateMission,
    onWalkComplete
  });
  propsRef.current = {
    kancilStation,
    walkFromStation,
    walkTriggerId,
    celebrateUnlock,
    selectedStation,
    completedMissions,
    unlockedUpToMission,
    pendingEnterStation,
    cameraMode,
    onSelectStation,
    onActivateMission,
    onWalkComplete
  };

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    } catch {
      setWebglError(true);
      return;
    }

    const gl = renderer.getContext();
    const dbg = gl.getExtension('WEBGL_debug_renderer_info');
    const glVendor = dbg ? String(gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL)) : '';
    const isSoftwareGl = /SwiftShader|llvmpipe|Software/i.test(glVendor);

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isSoftwareGl ? 1 : 2));
    renderer.setSize(container.clientWidth || 800, container.clientHeight || 540);
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.06;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);

    const maxAniso = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    const scene = new THREE.Scene();
    const horizonHex = 0x132722;
    scene.background = new THREE.Color(horizonHex);
    scene.fog = new THREE.FogExp2(horizonHex, 0.0055);

    const pmrem = new THREE.PMREMGenerator(renderer);
    const envTarget = pmrem.fromScene(new RoomEnvironment(), 0.04);
    scene.environment = envTarget.texture;

    const aspect = (container.clientWidth || 800) / Math.max(container.clientHeight || 540, 1);
    const camera = new THREE.PerspectiveCamera(44, aspect, 0.5, 280);
    camera.position.set(0, 22, -10);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.07;
    controls.minDistance = 16;
    controls.maxDistance = 108;
    controls.minPolarAngle = 0.4;
    controls.maxPolarAngle = 0.98;
    controls.target.set(0, 2.0, -32);

    // Lighting — warm twilight sun + emerald sky bounce + active royal beacon light
    const hemiLight = new THREE.HemisphereLight(0xbbe8d4, 0x1a2822, 0.85);
    scene.add(hemiLight);

    const sunLight = new THREE.DirectionalLight(0xffe4b5, 2.2);
    sunLight.position.set(34, 48, 36);
    if (!isSoftwareGl) {
      sunLight.castShadow = true;
      sunLight.shadow.mapSize.set(1024, 1024);
      sunLight.shadow.camera.near = 5;
      sunLight.shadow.camera.far = 165;
      sunLight.shadow.camera.left = -56;
      sunLight.shadow.camera.right = 56;
      sunLight.shadow.camera.top = 66;
      sunLight.shadow.camera.bottom = -66;
      sunLight.shadow.bias = -0.0005;
    }
    scene.add(sunLight);

    const activeSpotLight = new THREE.PointLight(0xfde047, 4.8, 30, 1.4);
    activeSpotLight.position.set(0, 8.0, -32);
    scene.add(activeSpotLight);

    const stageRoyalLight = new THREE.PointLight(0xf472b6, 4.2, 30, 1.4);
    stageRoyalLight.position.set(0, 8.0, 48);
    scene.add(stageRoyalLight);

    // Textures
    const grassTex = createGrassTexture(maxAniso);
    const waterTex = createWaterTexture(maxAniso);
    const woodTex = createWoodTexture(maxAniso);
    const furTex = createFurTexture(maxAniso);
    const shadowTex = createContactShadowTexture();

    // Extended Forest Ground Plane
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(260, 260),
      new THREE.MeshStandardMaterial({ map: grassTex, roughness: 0.94, metalness: 0.0 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Winding Stone Path Curve from Gate (Top -Z) across Wooden Bridge down to Misi 5 (Bottom +Z)
    const pathCurve = new THREE.CatmullRomCurve3(
      [
        new THREE.Vector3(0, 0.05, -37.2),   // 0: Gate
        new THREE.Vector3(-8.4, 0.05, -27.5),
        new THREE.Vector3(-11.2, 0.05, -17.5), // 1: Misi 1
        new THREE.Vector3(0.0, 0.05, -12.0),
        new THREE.Vector3(11.2, 0.05, -1.1),   // 2: Misi 2
        new THREE.Vector3(3.0, 0.08, -1.2),
        new THREE.Vector3(0, 0.24, -0.5),     // Wooden Bridge North Ramp
        new THREE.Vector3(0, 0.61, 1.3),      // Wooden Bridge Peak (flush atop center plank)
        new THREE.Vector3(0, 0.24, 3.1),      // Wooden Bridge South Ramp
        new THREE.Vector3(-4.2, 0.06, 7.6),
        new THREE.Vector3(-11.2, 0.05, 19.8),  // 3: Misi 3
        new THREE.Vector3(0.2, 0.05, 24.8),
        new THREE.Vector3(11.2, 0.05, 36.3),   // 4: Misi 4
        new THREE.Vector3(7.6, 0.05, 47.0),
        new THREE.Vector3(0, 0.05, 54.5)      // 5: Misi 5 Grand Forecourt
      ],
      false,
      'catmullrom',
      0.45
    );

    // Synchronize exact pathT parameters with curve samples so transitions never snap
    const _samplePt = new THREE.Vector3();
    STATION_ANCHORS.forEach((anchor) => {
      let bestT = anchor.pathT;
      let bestDistSq = Infinity;
      for (let s = 0; s <= 500; s++) {
        const t = s / 500;
        pathCurve.getPointAt(t, _samplePt);
        const dSq =
          (_samplePt.x - anchor.standPos.x) * (_samplePt.x - anchor.standPos.x) +
          (_samplePt.z - anchor.standPos.z) * (_samplePt.z - anchor.standPos.z);
        if (dSq < bestDistSq) {
          bestDistSq = dSq;
          bestT = t;
        }
      }
      anchor.pathT = bestT;
      pathCurve.getPointAt(bestT, _samplePt);
      anchor.standPos.copy(_samplePt);
    });

    // Instanced Flagstones along the winding trail
    const stoneCount = 152;
    const flagstoneGeo = new THREE.CylinderGeometry(0.62, 0.72, 0.1, 8);
    const flagstoneMat = new THREE.MeshStandardMaterial({ color: 0xb0a695, roughness: 0.88 });
    const stonesInstanced = new THREE.InstancedMesh(flagstoneGeo, flagstoneMat, stoneCount);
    stonesInstanced.receiveShadow = true;

    const guideGemCount = 76;
    const guideGemGeo = new THREE.OctahedronGeometry(0.14, 0);
    const guideGemMat = new THREE.MeshStandardMaterial({
      color: 0xfde047,
      emissive: 0xf59e0b,
      emissiveIntensity: 0.55,
      roughness: 0.25
    });
    const guideGemsInstanced = new THREE.InstancedMesh(guideGemGeo, guideGemMat, guideGemCount);

    const _dummy = new THREE.Object3D();
    const _color = new THREE.Color();

    for (let i = 0; i < stoneCount; i++) {
      const t = i / (stoneCount - 1);
      const pt = pathCurve.getPointAt(t);
      const tang = pathCurve.getTangentAt(t);
      // Skip stones across the wooden bridge deck
      const onBridge = pt.z >= -0.7 && pt.z <= 3.3 && Math.abs(pt.x) < 1.6;
      _dummy.position.set(pt.x + Math.sin(i * 4.1) * 0.16, onBridge ? -2 : 0.05, pt.z);
      _dummy.rotation.set(0, Math.atan2(tang.x, tang.z) + (i % 3) * 0.2, 0);
      const s = 0.85 + (i % 4) * 0.1;
      _dummy.scale.set(s, 1, s * 0.9);
      _dummy.updateMatrix();
      stonesInstanced.setMatrixAt(i, _dummy.matrix);
      _color.setHex(i % 2 === 0 ? 0xc2b8a3 : 0xa39782);
      stonesInstanced.setColorAt(i, _color);
    }
    stonesInstanced.instanceMatrix.needsUpdate = true;
    if (stonesInstanced.instanceColor) stonesInstanced.instanceColor.needsUpdate = true;
    scene.add(stonesInstanced);

    const guideGemTs: number[] = [];
    for (let i = 0; i < guideGemCount; i++) {
      const t = i / (guideGemCount - 1);
      guideGemTs.push(t);
      const pt = pathCurve.getPointAt(t);
      _dummy.position.set(pt.x, pt.y + 0.14, pt.z);
      _dummy.rotation.set(0, i * 0.3, 0);
      _dummy.scale.setScalar(1);
      _dummy.updateMatrix();
      guideGemsInstanced.setMatrixAt(i, _dummy.matrix);
      _color.setHex(0xfde047);
      guideGemsInstanced.setColorAt(i, _color);
    }
    guideGemsInstanced.instanceMatrix.needsUpdate = true;
    if (guideGemsInstanced.instanceColor) guideGemsInstanced.instanceColor.needsUpdate = true;
    scene.add(guideGemsInstanced);

    // Flowing River / Forest Stream & Arched Wooden Bridge
    const streamMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(180, 3.1, 24, 1),
      new THREE.MeshStandardMaterial({
        map: waterTex,
        color: 0x38bdf8,
        roughness: 0.16,
        metalness: 0.25,
        transparent: true,
        opacity: 0.9
      })
    );
    streamMesh.rotation.x = -Math.PI / 2;
    streamMesh.position.set(0, 0.03, 1.3);
    scene.add(streamMesh);

    // Riverbanks
    [-1.68, 1.68].forEach((zOff) => {
      const bank = new THREE.Mesh(
        new THREE.BoxGeometry(180, 0.14, 0.45),
        new THREE.MeshStandardMaterial({ color: 0x5f5542, roughness: 0.95 })
      );
      bank.position.set(0, 0.05, 1.3 + zOff);
      scene.add(bank);
    });

    // Arched Wooden Bridge at (0, 0, 1.3)
    const bridgeGroup = new THREE.Group();
    bridgeGroup.position.set(0, 0, 1.3);
    const bridgeWoodMat = new THREE.MeshStandardMaterial({ map: woodTex, roughness: 0.72 });
    const bridgeGoldMat = new THREE.MeshStandardMaterial({ color: 0xf5b82e, roughness: 0.35, metalness: 0.5 });
    for (let i = -5; i <= 5; i++) {
      const zLocal = i * 0.38;
      const archY = 0.46 * Math.cos((i / 6) * (Math.PI / 2)) + 0.08;
      const plank = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.12, 0.32), bridgeWoodMat);
      plank.position.set(0, archY, zLocal);
      plank.castShadow = true;
      plank.receiveShadow = true;
      bridgeGroup.add(plank);
    }
    [-1.2, 1.2].forEach((xSide) => {
      const rail = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.14, 4.1), bridgeWoodMat);
      rail.position.set(xSide, 1.05, 0);
      bridgeGroup.add(rail);
      [-1.8, 0, 1.8].forEach((zPost) => {
        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 0.95, 8), bridgeWoodMat);
        post.position.set(xSide, 0.62, zPost);
        bridgeGroup.add(post);
        if (zPost !== 0) {
          const cap = new THREE.Mesh(
            new THREE.SphereGeometry(0.12, 8, 8),
            new THREE.MeshStandardMaterial({ color: 0xfef08a, emissive: 0xf59e0b, emissiveIntensity: 0.65 })
          );
          cap.position.set(xSide, 1.15, zPost);
          bridgeGroup.add(cap);
        }
      });
    });
    scene.add(bridgeGroup);

    // Park Perimeter Wooden & Stone Fence (widened to enclose large buildings cleanly)
    const fencePosts: [number, number][] = [];
    for (let z = -46.5; z <= 59.0; z += 5.5) {
      fencePosts.push([-25.5, z], [25.5, z]);
    }
    for (let x = -25.5; x <= 25.5; x += 4.6) {
      if (Math.abs(x) > 5.2) fencePosts.push([x, -46.5]);
      fencePosts.push([x, 59.0]);
    }
    const postInstanced = new THREE.InstancedMesh(
      new THREE.CylinderGeometry(0.14, 0.18, 1.15, 8),
      new THREE.MeshStandardMaterial({ map: woodTex, roughness: 0.8 }),
      fencePosts.length
    );
    fencePosts.forEach(([fx, fz], i) => {
      _dummy.position.set(fx, 0.57, fz);
      _dummy.rotation.set(0, 0, 0);
      _dummy.scale.setScalar(1);
      _dummy.updateMatrix();
      postInstanced.setMatrixAt(i, _dummy.matrix);
    });
    postInstanced.instanceMatrix.needsUpdate = true;
    scene.add(postInstanced);

    // Garden Lanterns along path bends
    const lanternPositions: [number, number][] = [
      [-6.5, -31.8],
      [-7.8, -19.2],
      [8.2, -3.8],
      [-7.8, 17.5],
      [8.2, 33.2],
      [-4.0, 52.0],
      [4.0, 52.0]
    ];
    const lanternGroup = new THREE.Group();
    const lanternGlassMat = new THREE.MeshStandardMaterial({
      color: 0xfef08a,
      emissive: 0xf59e0b,
      emissiveIntensity: 0.85,
      roughness: 0.2
    });
    lanternPositions.forEach(([lx, lz]) => {
      const l = new THREE.Group();
      l.position.set(lx, 0, lz);
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.1, 1.45, 8), bridgeWoodMat);
      pole.position.y = 0.72;
      const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.18, 10, 8), lanternGlassMat);
      bulb.position.y = 1.54;
      const hat = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.22, 6), bridgeGoldMat);
      hat.position.y = 1.74;
      l.add(pole, bulb, hat);
      lanternGroup.add(l);
    });
    scene.add(lanternGroup);

    // Directional Signposts at path forks
    const signposts: { pos: [number, number]; rotY: number }[] = [
      { pos: [-4.8, -29.8], rotY: -0.5 },
      { pos: [5.2, -10.5], rotY: 0.45 },
      { pos: [5.2, 26.0], rotY: 0.45 }
    ];
    signposts.forEach(({ pos, rotY }) => {
      const sp = new THREE.Group();
      sp.position.set(pos[0], 0, pos[1]);
      sp.rotation.y = rotY;
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 1.35, 8), bridgeWoodMat);
      post.position.y = 0.68;
      const board = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.22, 0.08), bridgeWoodMat);
      board.position.set(0.16, 1.15, 0);
      sp.add(post, board);
      scene.add(sp);
    });

    // Stylized Forest Trees (kept strictly outside enlarged buildings & camera sightlines!)
    const treeCoords: { x: number; z: number; scale: number; seed: number }[] = [];
    for (let i = 0; i < 130; i++) {
      const angle = i * 2.39996; // Golden-angle spiral distribution
      const sideBias = i % 2 === 0 ? 1 : -1;
      const x = sideBias * (24.0 + ((i * 7.3) % 34));
      const z = -54 + ((i * 11.7) % 116);
      // Avoid stream channel
      if (Math.abs(z - 1.3) < 2.8) continue;
      // Avoid wide central corridor so large buildings remain 100% clear
      if (Math.abs(x) < 23.5) continue;
      treeCoords.push({ x, z, scale: 0.95 + (i % 5) * 0.18, seed: angle });
    }
    // Add scenic backdrop trees behind the top gate and outer corners
    for (let i = 0; i < 28; i++) {
      const x = -34 + i * 2.5;
      const z = -51 - (i % 3) * 3.2;
      treeCoords.push({ x, z, scale: 1.08 + (i % 3) * 0.2, seed: i * 0.9 });
    }

    const trunkMesh = new THREE.InstancedMesh(
      new THREE.CylinderGeometry(0.24, 0.36, 2.2, 8),
      new THREE.MeshStandardMaterial({ color: 0x5c3a21, roughness: 0.9 }),
      treeCoords.length
    );
    trunkMesh.castShadow = !isSoftwareGl;

    const crownLowerMat = new THREE.MeshStandardMaterial({ color: 0x226842, roughness: 0.82 });
    const crownLowerMesh = new THREE.InstancedMesh(new THREE.ConeGeometry(1.55, 2.7, 9), crownLowerMat, treeCoords.length);
    crownLowerMesh.castShadow = !isSoftwareGl;

    const crownUpperMat = new THREE.MeshStandardMaterial({ color: 0x2f8556, roughness: 0.78 });
    const crownUpperMesh = new THREE.InstancedMesh(new THREE.ConeGeometry(1.1, 2.2, 9), crownUpperMat, treeCoords.length);

    treeCoords.forEach((tc, i) => {
      _dummy.position.set(tc.x, 1.1 * tc.scale, tc.z);
      _dummy.rotation.set(0, tc.seed, 0);
      _dummy.scale.setScalar(tc.scale);
      _dummy.updateMatrix();
      trunkMesh.setMatrixAt(i, _dummy.matrix);

      _dummy.position.set(tc.x, 2.7 * tc.scale, tc.z);
      _dummy.updateMatrix();
      crownLowerMesh.setMatrixAt(i, _dummy.matrix);
      _color.setHex(i % 3 === 0 ? 0x1e6b44 : i % 3 === 1 ? 0x2b7e50 : 0x255c3c);
      crownLowerMesh.setColorAt(i, _color);

      _dummy.position.set(tc.x, 4.15 * tc.scale, tc.z);
      _dummy.updateMatrix();
      crownUpperMesh.setMatrixAt(i, _dummy.matrix);
    });
    trunkMesh.instanceMatrix.needsUpdate = true;
    crownLowerMesh.instanceMatrix.needsUpdate = true;
    if (crownLowerMesh.instanceColor) crownLowerMesh.instanceColor.needsUpdate = true;
    crownUpperMesh.instanceMatrix.needsUpdate = true;
    scene.add(trunkMesh, crownLowerMesh, crownUpperMesh);

    // Decorative Flowers, Fantasy Mushrooms & Mossy Rocks along path edges
    const flowerPositions: [number, number, number][] = [
      [-7.5, -34.0, 0xf43f5e],
      [-19.8, -17.0, 0xfbbf24],
      [19.8, -3.5, 0xc084fc],
      [-19.8, 17.5, 0xf472b6],
      [19.8, 33.8, 0x38bdf8],
      [-8.5, 49.0, 0xfde047],
      [8.5, 49.0, 0xf43f5e]
    ];
    flowerPositions.forEach(([fx, fz, col]) => {
      const fMat = new THREE.MeshStandardMaterial({ color: col, emissive: col, emissiveIntensity: 0.2, roughness: 0.6 });
      for (let k = 0; k < 3; k++) {
        const bloom = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 8), fMat);
        bloom.position.set(fx + (k - 1) * 0.42, 0.22, fz + (k % 2) * 0.35);
        scene.add(bloom);
      }
    });

    // Fantasy glowing mushrooms near outer tree edge
    const mushCapMat = new THREE.MeshStandardMaterial({ color: 0xa855f7, emissive: 0x7e22ce, emissiveIntensity: 0.45, roughness: 0.45 });
    const mushStemMat = new THREE.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.7 });
    [
      [-22.0, -28],
      [22.0, -14],
      [-22.0, 8],
      [22.0, 22],
      [-21.0, 42]
    ].forEach(([mx, mz]) => {
      const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.13, 0.35, 8), mushStemMat);
      stem.position.set(mx, 0.17, mz);
      const cap = new THREE.Mesh(new THREE.SphereGeometry(0.3, 10, 8, 0, Math.PI * 2, 0, Math.PI * 0.55), mushCapMat);
      cap.position.set(mx, 0.34, mz);
      scene.add(stem, cap);
    });

    // Pre-generate shared high-res button textures for the integrated 3D signboard buttons
    const buttonTextures: SignButtonTextures = {
      enter: createSignButtonTexture('enter', maxAniso),
      entering: createSignButtonTexture('entering', maxAniso),
      reopen: createSignButtonTexture('reopen', maxAniso),
      reopening: createSignButtonTexture('reopening', maxAniso),
      lockedByStation: {
        1: createSignButtonTexture('locked', maxAniso, 1),
        2: createSignButtonTexture('locked', maxAniso, 1),
        3: createSignButtonTexture('locked', maxAniso, 2),
        4: createSignButtonTexture('locked', maxAniso, 3),
        5: createSignButtonTexture('locked', maxAniso, 4)
      }
    };

    // Build Gate & 5 Enlarged Mission Buildings
    const buildings: BuildingHandle[] = [];
    const colliders: THREE.Object3D[] = [];
    STATION_ANCHORS.forEach((anchor) => {
      const b = createMissionBuilding(anchor.station, woodTex, maxAniso, buttonTextures);
      b.group.position.copy(anchor.buildingPos);
      b.group.scale.setScalar(b.baseScale);
      scene.add(b.group);
      buildings.push(b);
      colliders.push(b.collider);
      if (b.signButtonCollider) colliders.push(b.signButtonCollider);
    });

    // Build Hero Character: Redesigned 3D Cikgu Kancil matching homepage mascot
    const kancil = buildCikguKancil(furTex, shadowTex);
    const initialAnchor = STATION_ANCHORS[propsRef.current.kancilStation] || STATION_ANCHORS[0];
    kancil.root.position.copy(initialAnchor.standPos);
    scene.add(kancil.root);

    // Walk / Hover / Bounce Animation State Machine
    const clickBounce = [0, 0, 0, 0, 0, 0];
    const buttonPress = [0, 0, 0, 0, 0, 0];
    let hoveredStation: number | null = null;
    let hoveredButtonStation: number | null = null;
    let lastHoverCheck = 0;

    let animState: {
      mode: 'idle' | 'walking' | 'celebrating';
      fromT: number;
      toT: number;
      currentT: number;
      progress: number;
      targetStation: number;
      lastSeenTrigger: number;
      celebrateTimer: number;
      scriptedCameraFollow: boolean;
      lastFocusStation: number;
      lastCameraMode: CameraFocusMode;
      lastPendingStation: number | null;
      blinkTimer: number;
    } = {
      mode: 'idle',
      fromT: initialAnchor.pathT,
      toT: initialAnchor.pathT,
      currentT: initialAnchor.pathT,
      progress: 1,
      targetStation: initialAnchor.station,
      lastSeenTrigger: propsRef.current.walkTriggerId,
      celebrateTimer: 0,
      scriptedCameraFollow: true,
      lastFocusStation: propsRef.current.selectedStation,
      lastCameraMode: propsRef.current.cameraMode,
      lastPendingStation: propsRef.current.pendingEnterStation ?? null,
      blinkTimer: 2.2
    };

    const handleControlStart = () => {
      // Hand control back to user immediately when they drag/zoom
      animState.scriptedCameraFollow = false;
    };
    controls.addEventListener('start', handleControlStart);

    // Raycasting for clicking/hovering buildings & integrated 3D signboard buttons
    const raycaster = new THREE.Raycaster();
    raycaster.layers.set(1);
    const pointer = new THREE.Vector2();
    let downX = 0;
    let downY = 0;

    const getHitInfo = (clientX: number, clientY: number): { station: number; isSignButton: boolean } | null => {
      const rect = renderer.domElement.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return null;
      pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(colliders, false);
      if (hits.length > 0) {
        const buttonHit = hits.find((h) => h.object.userData?.isSignButton);
        const chosen = buttonHit || hits[0];
        const st = chosen.object.userData?.station;
        if (typeof st === 'number') {
          return {
            station: st,
            isSignButton: Boolean(chosen.object.userData?.isSignButton)
          };
        }
      }
      return null;
    };

    const onPointerDown = (e: PointerEvent) => {
      downX = e.clientX;
      downY = e.clientY;
    };
    const onPointerUp = (e: PointerEvent) => {
      const dist = Math.hypot(e.clientX - downX, e.clientY - downY);
      if (dist > 7) return; // Ignore orbit drags
      const hit = getHitInfo(e.clientX, e.clientY);
      if (hit !== null) {
        clickBounce[hit.station] = 1;
        animState.scriptedCameraFollow = true;
        if (hit.isSignButton && hit.station >= 1 && propsRef.current.onActivateMission) {
          buttonPress[hit.station] = 1;
          propsRef.current.onActivateMission(hit.station);
        } else {
          propsRef.current.onSelectStation(hit.station);
        }
      }
    };
    const onPointerMove = (e: PointerEvent) => {
      const now = performance.now();
      if (now - lastHoverCheck < 28) return;
      lastHoverCheck = now;
      const hit = getHitInfo(e.clientX, e.clientY);
      hoveredStation = hit ? hit.station : null;
      hoveredButtonStation = hit && hit.isSignButton ? hit.station : null;
      renderer.domElement.style.cursor = hit !== null ? 'pointer' : 'grab';
    };
    const onPointerLeave = () => {
      hoveredStation = null;
      hoveredButtonStation = null;
      renderer.domElement.style.cursor = 'grab';
    };

    renderer.domElement.addEventListener('pointerdown', onPointerDown);
    renderer.domElement.addEventListener('pointerup', onPointerUp);
    renderer.domElement.addEventListener('pointermove', onPointerMove);
    renderer.domElement.addEventListener('pointerleave', onPointerLeave);

    // ResizeObserver for crisp responsive viewport & mobile portrait zoom compensation
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || 800;
      const h = Math.max(container.clientHeight || 540, 1);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    const ro = new ResizeObserver(handleResize);
    ro.observe(container);

    // Pre-allocated vectors for GC-free animation loop
    const _targetPos = new THREE.Vector3();
    const _desiredCamPos = new THREE.Vector3();
    const _desiredTarget = new THREE.Vector3();
    const _nextPt = new THREE.Vector3();
    const _lookTarget = new THREE.Vector3();

    let rafId = 0;
    let alive = true;
    const clock = new THREE.Clock();

    const scheduleNextFrame = (fn: () => void) => {
      if (!alive) return;
      if (isSoftwareGl && typeof (renderer as unknown as { afterDraw?: (cb: () => void) => void }).afterDraw === 'function') {
        (renderer as unknown as { afterDraw: (cb: () => void) => void }).afterDraw(fn);
      } else {
        rafId = requestAnimationFrame(fn);
      }
    };

    // Snap camera immediately on first frame to starting station or overview
    const snapInitialCamera = () => {
      const { kancilStation: st, cameraMode: mode } = propsRef.current;
      const anchor = STATION_ANCHORS[st] || STATION_ANCHORS[0];
      const portraitExtra = camera.aspect < 1 ? (1 - camera.aspect) * 18 : 0;
      if (mode === 'overview') {
        controls.target.set(0, 1.0, 4.0);
        camera.position.set(0, 66 + portraitExtra, 62 + portraitExtra * 0.9);
      } else {
        controls.target.set(anchor.standPos.x * 0.55, 2.2, anchor.buildingPos.z + 2.5);
        camera.position.set(anchor.standPos.x * 0.44, 21.0 + portraitExtra, anchor.buildingPos.z + 27.5 + portraitExtra);
      }
      controls.update();
    };
    snapInitialCamera();

    const tick = () => {
      if (!alive) return;
      const dt = Math.min(clock.getDelta(), 0.05);
      const elapsed = clock.elapsedTime;
      const p = propsRef.current;

      // Detect newly triggered walk transition (supports smooth mid-walk redirection from live currentT!)
      if (p.walkTriggerId !== animState.lastSeenTrigger) {
        animState.lastSeenTrigger = p.walkTriggerId;
        const toAnchor = STATION_ANCHORS[p.kancilStation] || STATION_ANCHORS[0];
        const startT =
          animState.mode === 'walking'
            ? animState.currentT
            : (STATION_ANCHORS[p.walkFromStation ?? p.kancilStation] || STATION_ANCHORS[0]).pathT;

        if (Math.abs(toAnchor.pathT - startT) > 0.002) {
          animState.mode = 'walking';
          animState.fromT = startT;
          animState.toT = toAnchor.pathT;
          animState.progress = 0;
          animState.targetStation = toAnchor.station;
          animState.scriptedCameraFollow = true;
        } else {
          animState.currentT = toAnchor.pathT;
          animState.targetStation = toAnchor.station;
          animState.mode = p.celebrateUnlock ? 'celebrating' : 'idle';
          animState.celebrateTimer = 0;
          p.onWalkComplete?.(toAnchor.station);
        }
      }

      // Re-engage smooth camera follow when user clicks a different mission tab / toggles mode
      if (p.selectedStation !== animState.lastFocusStation || p.cameraMode !== animState.lastCameraMode) {
        animState.lastFocusStation = p.selectedStation;
        animState.lastCameraMode = p.cameraMode;
        animState.scriptedCameraFollow = true;
        if (p.selectedStation >= 0 && p.selectedStation <= 5) {
          clickBounce[p.selectedStation] = Math.max(clickBounce[p.selectedStation], 0.85);
        }
      }
      if ((p.pendingEnterStation ?? null) !== animState.lastPendingStation) {
        animState.lastPendingStation = p.pendingEnterStation ?? null;
        if (animState.lastPendingStation && animState.lastPendingStation >= 1) {
          buttonPress[animState.lastPendingStation] = 1;
          clickBounce[animState.lastPendingStation] = Math.max(clickBounce[animState.lastPendingStation], 0.9);
        }
      }

      // 1. Scroll flowing river water UV
      waterTex.offset.x += dt * 0.24;

      // 2. Gentle tree crown wind sway
      if (!isSoftwareGl) {
        for (let i = 0; i < treeCoords.length; i++) {
          const tc = treeCoords[i];
          const sway = Math.sin(elapsed * 1.4 + tc.seed) * 0.035;
          _dummy.position.set(tc.x, 2.7 * tc.scale, tc.z);
          _dummy.rotation.set(sway * 0.5, tc.seed, sway);
          _dummy.scale.setScalar(tc.scale);
          _dummy.updateMatrix();
          crownLowerMesh.setMatrixAt(i, _dummy.matrix);

          _dummy.position.set(tc.x, 4.15 * tc.scale, tc.z);
          _dummy.rotation.set(sway * 0.8, tc.seed, sway * 1.2);
          _dummy.updateMatrix();
          crownUpperMesh.setMatrixAt(i, _dummy.matrix);
        }
        crownLowerMesh.instanceMatrix.needsUpdate = true;
        crownUpperMesh.instanceMatrix.needsUpdate = true;
      }

      // 3. Update Building States, Unified 3D Signboard Buttons, Hover & Click Feedback
      const activeTargetAnchor = STATION_ANCHORS[p.kancilStation] || STATION_ANCHORS[0];
      activeSpotLight.position.set(activeTargetAnchor.buildingPos.x, 8.0, activeTargetAnchor.buildingPos.z + 3.8);

      buildings.forEach((b) => {
        // Click bounce spring impulse
        if (clickBounce[b.station] > 0.001) {
          clickBounce[b.station] = Math.max(0, clickBounce[b.station] - dt * 2.6);
          const imp = clickBounce[b.station];
          const s = b.baseScale * (1 + Math.sin((1 - imp) * Math.PI * 2.1) * imp * 0.065);
          b.group.scale.set(s, s, s);
        } else {
          b.group.scale.set(b.baseScale, b.baseScale, b.baseScale);
        }

        const isHovered = hoveredStation === b.station;

        if (b.station === 0) {
          const isGateSelected = p.selectedStation === 0 || p.kancilStation === 0;
          b.ringMesh.visible = isGateSelected || isHovered;
          b.beaconMesh.visible = p.kancilStation === 0;
          const pulse = (isHovered ? 1.08 : 1) + Math.sin(elapsed * 2.8) * 0.06;
          b.ringMesh.scale.setScalar(pulse);
          return;
        }

        const isCompleted = p.completedMissions.includes(b.station);
        const isUnlocked = b.station <= p.unlockedUpToMission || isCompleted;
        const isCurrentHere = p.kancilStation === b.station;
        const isSelected = p.selectedStation === b.station;
        const isEnteringThis = p.pendingEnterStation === b.station;
        const isButtonHovered = hoveredButtonStation === b.station && isUnlocked;

        b.lockBadge.visible = !isUnlocked;
        b.doneBadge.visible = isCompleted;
        if (!isUnlocked) {
          b.lockBadge.position.y =
            (b.station === 5 ? 8.45 : b.station === 3 ? 7.05 : 6.35) + Math.sin(elapsed * 2.1 + b.station) * 0.12;
          b.lockBadge.rotation.y = Math.sin(elapsed * 1.2) * 0.25;
        }
        if (isCompleted) {
          b.doneBadge.rotation.y = elapsed * 1.3;
          b.doneBadge.position.y =
            (b.station === 5 ? 8.6 : b.station === 3 ? 7.2 : 6.5) + Math.sin(elapsed * 2.6 + b.station) * 0.1;
        }

        // Sync dynamic 3D button state (MASUK / BUKA SEMULA / TERKUNCI / MENUJU...) inside unified signboard
        if (b.signButtonFaceMat && b.signButtonGroup) {
          const nextKey: SignButtonKey = !isUnlocked
            ? 'locked'
            : isCompleted
            ? isEnteringThis
              ? 'reopening'
              : 'reopen'
            : isEnteringThis
            ? 'entering'
            : 'enter';

          if (b.currentButtonKey !== nextKey) {
            b.currentButtonKey = nextKey;
            const tex =
              nextKey === 'locked'
                ? buttonTextures.lockedByStation[b.station]
                : buttonTextures[nextKey];
            b.signButtonFaceMat.map = tex;
            b.signButtonFaceMat.needsUpdate = true;
          }

          // Smooth 3D hover lift + physical press depress animation
          let pressDepth = 0;
          if (buttonPress[b.station] > 0.001) {
            buttonPress[b.station] = Math.max(0, buttonPress[b.station] - dt * 3.8);
            pressDepth = Math.sin(buttonPress[b.station] * Math.PI) * 0.085;
          }
          const targetZ = (isButtonHovered ? 0.27 : 0.2) - pressDepth;
          const targetScale = isButtonHovered ? 1.04 : 1.0;
          b.signButtonGroup.position.z = THREE.MathUtils.damp(b.signButtonGroup.position.z, targetZ, 16, dt);
          const curScale = THREE.MathUtils.damp(b.signButtonGroup.scale.x, targetScale, 14, dt);
          b.signButtonGroup.scale.set(curScale, curScale, 1);
          b.signButtonFaceMat.color.setHex(isUnlocked ? 0xffffff : 0xe2e8f0);
        }

        const hoverBoost = isHovered ? 0.35 : 0;
        b.windowMats.forEach((wm) => {
          wm.emissiveIntensity = (isCompleted ? 0.9 : isUnlocked ? 0.65 : 0.1) + hoverBoost;
        });
        b.doorMat.emissiveIntensity =
          (isEnteringThis ? 0.95 : isCurrentHere || isSelected ? 0.48 : isUnlocked ? 0.22 : 0.03) + hoverBoost * 0.8;

        b.ringMesh.visible = isUnlocked || isSelected || isHovered;
        const ringMat = b.ringMesh.material as THREE.MeshBasicMaterial;
        ringMat.color.setHex(isCompleted ? 0x10b981 : isUnlocked ? 0xffb703 : 0x94a3b8);
        ringMat.opacity = isHovered || isEnteringThis ? 0.95 : isSelected || isCurrentHere ? 0.85 : 0.48;
        const ringScale =
          (b.station === 5 ? 1.35 : 1) * (isHovered ? 1.07 : 1) * (1 + Math.sin(elapsed * 3.0 + b.station) * 0.05);
        b.ringMesh.scale.set(ringScale, ringScale, 1);

        b.beaconMesh.visible = (isCurrentHere && !isCompleted) || isEnteringThis;
      });

      // 4. Update Guide Gems along unlocked portion of stone trail
      const unlockedAnchor = STATION_ANCHORS[Math.min(5, Math.max(0, p.unlockedUpToMission))] || STATION_ANCHORS[1];
      const frontierT = unlockedAnchor.pathT;
      for (let i = 0; i < guideGemCount; i++) {
        const lit = guideGemTs[i] <= frontierT;
        _color.setHex(lit ? 0xfde047 : 0x3f4c46);
        guideGemsInstanced.setColorAt(i, _color);
      }
      if (guideGemsInstanced.instanceColor) guideGemsInstanced.instanceColor.needsUpdate = true;

      // 5. Periodic natural eye blink for Cikgu Kancil
      animState.blinkTimer -= dt;
      if (animState.blinkTimer <= 0) {
        animState.blinkTimer = 3.2 + Math.sin(elapsed * 1.7) * 1.1;
      }
      const blinkPhase = animState.blinkTimer < 0.14 ? Math.sin((animState.blinkTimer / 0.14) * Math.PI) : 0;
      const eyelidRotX = THREE.MathUtils.lerp(-Math.PI * 0.65, -0.05, blinkPhase);
      kancil.leftEyelid.rotation.x = eyelidRotX;
      kancil.rightEyelid.rotation.x = eyelidRotX;

      // 6. Update Cikgu Kancil Position & Natural Articulated Walking Animation
      if (animState.mode === 'walking') {
        const span = Math.abs(animState.toT - animState.fromT);
        const walkDuration = Math.max(1.25, span * 8.6);
        animState.progress = Math.min(1, animState.progress + dt / walkDuration);
        const eased =
          animState.progress < 0.5
            ? 2 * animState.progress * animState.progress
            : 1 - Math.pow(-2 * animState.progress + 2, 2) / 2;
        const curT = THREE.MathUtils.lerp(animState.fromT, animState.toT, eased);
        animState.currentT = curT;

        pathCurve.getPointAt(curT, _targetPos);
        kancil.root.position.copy(_targetPos);

        const lookT = THREE.MathUtils.clamp(curT + (animState.toT >= animState.fromT ? 0.014 : -0.014), 0, 1);
        pathCurve.getPointAt(lookT, _nextPt);
        const desiredYaw = Math.atan2(_nextPt.x - _targetPos.x, _nextPt.z - _targetPos.z);
        let yawDiff = desiredYaw - kancil.root.rotation.y;
        while (yawDiff > Math.PI) yawDiff -= Math.PI * 2;
        while (yawDiff < -Math.PI) yawDiff += Math.PI * 2;
        kancil.root.rotation.y += yawDiff * Math.min(1, dt * 12);

        // Articulated hip + knee stride, upright storybook carry, subtle head bob & bounce
        const stride = elapsed * 11.0;
        const leftSwing = Math.sin(stride);
        const rightSwing = -leftSwing;
        kancil.leftLegPivot.rotation.x = leftSwing * 0.58;
        kancil.rightLegPivot.rotation.x = rightSwing * 0.58;
        kancil.leftShinPivot.rotation.x = Math.max(0, -leftSwing) * 0.68;
        kancil.rightShinPivot.rotation.x = Math.max(0, -rightSwing) * 0.68;

        // Left arm gently cradles open storybook while right arm swings naturally
        kancil.leftArmPivot.rotation.x = -0.35 + rightSwing * 0.16;
        kancil.leftArmPivot.rotation.z = -0.1;
        kancil.rightArmPivot.rotation.x = leftSwing * 0.48;
        kancil.rightArmPivot.rotation.z = 0.08;

        const stepBounce = Math.abs(Math.sin(stride));
        kancil.bodyGroup.position.y = stepBounce * 0.085;
        kancil.bodyGroup.rotation.x = 0.07;
        kancil.headPivot.rotation.x = -0.04 + Math.sin(stride * 2) * 0.03;
        kancil.headPivot.rotation.y = Math.sin(stride * 0.5) * 0.06;
        kancil.tailPivot.rotation.y = Math.sin(stride) * 0.36;
        const shadowScale = 1 - stepBounce * 0.14;
        kancil.shadowDisc.scale.set(shadowScale, shadowScale, 1);

        if (animState.progress >= 1) {
          animState.mode = p.celebrateUnlock ? 'celebrating' : 'idle';
          animState.celebrateTimer = 0;
          animState.currentT = animState.toT;
          const destAnchor = STATION_ANCHORS[animState.targetStation] || STATION_ANCHORS[0];
          kancil.root.position.copy(destAnchor.standPos);
          p.onWalkComplete?.(animState.targetStation);
        }
      } else {
        const standAnchor = STATION_ANCHORS[p.kancilStation] || STATION_ANCHORS[0];
        animState.currentT = standAnchor.pathT;
        kancil.root.position.x = THREE.MathUtils.damp(kancil.root.position.x, standAnchor.standPos.x, 7, dt);
        kancil.root.position.z = THREE.MathUtils.damp(kancil.root.position.z, standAnchor.standPos.z, 7, dt);
        kancil.root.position.y = THREE.MathUtils.damp(kancil.root.position.y, standAnchor.standPos.y, 7, dt);

        // Face forward warmly at Gate, or face towards building entrance at mission stations
        const targetYaw =
          p.kancilStation === 0
            ? 0
            : Math.atan2(
                standAnchor.lookAtBuildingPos.x - kancil.root.position.x,
                standAnchor.lookAtBuildingPos.z - kancil.root.position.z
              ) * (p.pendingEnterStation === p.kancilStation ? 1.0 : 0.8);
        let diff = targetYaw - kancil.root.rotation.y;
        while (diff > Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;
        kancil.root.rotation.y += diff * Math.min(1, dt * 7);

        // Dampen walking pivots back to calm stance
        kancil.leftLegPivot.rotation.x = THREE.MathUtils.damp(kancil.leftLegPivot.rotation.x, 0, 9, dt);
        kancil.rightLegPivot.rotation.x = THREE.MathUtils.damp(kancil.rightLegPivot.rotation.x, 0, 9, dt);
        kancil.leftShinPivot.rotation.x = THREE.MathUtils.damp(kancil.leftShinPivot.rotation.x, 0, 9, dt);
        kancil.rightShinPivot.rotation.x = THREE.MathUtils.damp(kancil.rightShinPivot.rotation.x, 0, 9, dt);
        kancil.bodyGroup.rotation.x = THREE.MathUtils.damp(kancil.bodyGroup.rotation.x, 0, 9, dt);
        kancil.headPivot.rotation.x = THREE.MathUtils.damp(kancil.headPivot.rotation.x, 0, 9, dt);
        kancil.shadowDisc.scale.set(1, 1, 1);

        if (animState.mode === 'celebrating') {
          animState.celebrateTimer += dt;
          const hop = Math.abs(Math.sin(animState.celebrateTimer * 7.5)) * 0.42;
          kancil.bodyGroup.position.y = hop;
          kancil.rightArmPivot.rotation.z = 2.2 + Math.sin(animState.celebrateTimer * 12) * 0.28;
          kancil.leftArmPivot.rotation.x = -0.35;
          kancil.leftArmPivot.rotation.z = -0.35 - Math.sin(animState.celebrateTimer * 12) * 0.12;
          if (animState.celebrateTimer > 1.35) {
            animState.mode = 'idle';
          }
        } else if (p.kancilStation === 0) {
          // Warm waving gesture at Entrance Gate!
          kancil.bodyGroup.position.y = Math.sin(elapsed * 2.4) * 0.03;
          kancil.rightArmPivot.rotation.x = -0.35;
          kancil.rightArmPivot.rotation.z = 2.1 + Math.sin(elapsed * 5.2) * 0.35;
          kancil.leftArmPivot.rotation.x = -0.38;
          kancil.leftArmPivot.rotation.z = -0.14;
          kancil.headPivot.rotation.y = Math.sin(elapsed * 1.4) * 0.14;
          kancil.tailPivot.rotation.y = Math.sin(elapsed * 4.5) * 0.28;
        } else {
          // Cheerful breathing idle holding storybook at mission building
          kancil.bodyGroup.position.y = Math.sin(elapsed * 2.6) * 0.03;
          kancil.rightArmPivot.rotation.x = THREE.MathUtils.damp(kancil.rightArmPivot.rotation.x, 0, 8, dt);
          kancil.rightArmPivot.rotation.z = THREE.MathUtils.damp(
            kancil.rightArmPivot.rotation.z,
            0.14 + Math.sin(elapsed * 2.6) * 0.05,
            8,
            dt
          );
          kancil.leftArmPivot.rotation.x = THREE.MathUtils.damp(kancil.leftArmPivot.rotation.x, -0.36, 8, dt);
          kancil.leftArmPivot.rotation.z = THREE.MathUtils.damp(kancil.leftArmPivot.rotation.z, -0.12, 8, dt);
          kancil.headPivot.rotation.y = Math.sin(elapsed * 1.3) * 0.14;
          kancil.tailPivot.rotation.y = Math.sin(elapsed * 3.8) * 0.22;
        }
      }

      // 7. Camera Follow / Overview Smooth Dampening
      if (animState.scriptedCameraFollow) {
        const portraitExtra = camera.aspect < 1 ? (1 - camera.aspect) * 18 : 0;
        if (p.cameraMode === 'overview') {
          _desiredTarget.set(0, 1.0, 4.0);
          _desiredCamPos.set(0, 66 + portraitExtra, 62 + portraitExtra * 0.9);
        } else if (animState.mode === 'walking') {
          _desiredTarget.set(kancil.root.position.x * 0.6, 1.5, kancil.root.position.z);
          _desiredCamPos.set(
            kancil.root.position.x * 0.42,
            20.0 + portraitExtra,
            kancil.root.position.z + 25.0 + portraitExtra
          );
        } else {
          const focusAnchor = STATION_ANCHORS[p.selectedStation] || STATION_ANCHORS[p.kancilStation] || STATION_ANCHORS[0];
          _desiredTarget.set(focusAnchor.buildingPos.x * 0.65, 2.4, focusAnchor.buildingPos.z + 2.5);
          _desiredCamPos.set(
            focusAnchor.buildingPos.x * 0.44,
            21.0 + portraitExtra,
            focusAnchor.buildingPos.z + 27.5 + portraitExtra
          );
        }

        controls.target.x = THREE.MathUtils.damp(controls.target.x, _desiredTarget.x, 4.2, dt);
        controls.target.y = THREE.MathUtils.damp(controls.target.y, _desiredTarget.y, 4.2, dt);
        controls.target.z = THREE.MathUtils.damp(controls.target.z, _desiredTarget.z, 4.2, dt);

        camera.position.x = THREE.MathUtils.damp(camera.position.x, _desiredCamPos.x, 3.8, dt);
        camera.position.y = THREE.MathUtils.damp(camera.position.y, _desiredCamPos.y, 3.8, dt);
        camera.position.z = THREE.MathUtils.damp(camera.position.z, _desiredCamPos.z, 3.8, dt);
      }

      // Keep pan bounds safely inside the expanded forest park
      controls.target.x = THREE.MathUtils.clamp(controls.target.x, -25, 25);
      controls.target.z = THREE.MathUtils.clamp(controls.target.z, -44, 54);
      controls.update();

      _lookTarget.copy(controls.target);
      renderer.render(scene, camera);
      scheduleNextFrame(tick);
    };

    scheduleNextFrame(tick);

    return () => {
      alive = false;
      cancelAnimationFrame(rafId);
      ro.disconnect();
      controls.removeEventListener('start', handleControlStart);
      controls.dispose();
      renderer.domElement.removeEventListener('pointerdown', onPointerDown);
      renderer.domElement.removeEventListener('pointerup', onPointerUp);
      renderer.domElement.removeEventListener('pointermove', onPointerMove);
      renderer.domElement.removeEventListener('pointerleave', onPointerLeave);

      scene.traverse((obj) => {
        const mesh = obj as THREE.Mesh;
        if (mesh.geometry) mesh.geometry.dispose();
        const mat = mesh.material;
        const disposeMat = (m: THREE.Material) => {
          const std = m as THREE.MeshStandardMaterial;
          if (std.map) std.map.dispose();
          if (std.emissiveMap && std.emissiveMap !== std.map) std.emissiveMap.dispose();
          m.dispose();
        };
        if (Array.isArray(mat)) mat.forEach(disposeMat);
        else if (mat) disposeMat(mat);
      });
      buttonTextures.enter.dispose();
      buttonTextures.entering.dispose();
      buttonTextures.reopen.dispose();
      buttonTextures.reopening.dispose();
      Object.values(buttonTextures.lockedByStation).forEach((t) => t.dispose());
      grassTex.dispose();
      waterTex.dispose();
      woodTex.dispose();
      furTex.dispose();
      shadowTex.dispose();
      envTarget.dispose();
      pmrem.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  if (webglError) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-[#132722] text-[#E6F4EA] p-6 text-center">
        <div className="max-w-md space-y-2">
          <p className="text-sm font-bold text-[#FDE047]">Paparan Peta 3D Tidak Disokong Pelayar Ini</p>
          <p className="text-xs text-[#CBE6D6]">
            Gunakan bar kawalan misi di bahagian bawah untuk memilih dan memasuki misi pengembaraan kamu.
          </p>
        </div>
      </div>
    );
  }

  return <div ref={mountRef} className="w-full h-full touch-none select-none" />;
}
