import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

interface TheaterStage3DProps {
  mode?: 'intro' | 'workshop' | 'finale';
  curtainsOpen?: boolean;
  className?: string;
}

const _dummy = new THREE.Object3D();
const _color = new THREE.Color();

function createWoodStageTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#5B3118';
    ctx.fillRect(0, 0, 512, 512);
    const planks = 12;
    const plankHeight = 512 / planks;
    for (let i = 0; i < planks; i++) {
      const y = i * plankHeight;
      const shades = ['#6B3B1E', '#5D3218', '#754222', '#63361B'];
      ctx.fillStyle = shades[i % shades.length];
      ctx.fillRect(0, y + 2, 512, plankHeight - 3);

      // Warm golden-honey plank bevel highlight
      ctx.fillStyle = 'rgba(248, 212, 146, 0.22)';
      ctx.fillRect(0, y + 3, 512, 2.2);

      // Crisp walnut plank seam
      ctx.fillStyle = '#381C0B';
      ctx.fillRect(0, y, 512, 2);

      // Clear natural walnut wood grain streaks
      for (let g = 0; g < 26; g++) {
        const gx = (g * 37 + i * 53) % 490;
        const gy = y + 6 + ((g * 7 + i * 3) % Math.max(8, Math.floor(plankHeight - 10)));
        const gw = 38 + ((g * 19) % 76);
        ctx.fillStyle = g % 3 === 0 ? 'rgba(54, 24, 9, 0.28)' : 'rgba(148, 94, 48, 0.22)';
        ctx.fillRect(gx, gy, gw, 1.8);
      }
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(3, 2);
  return tex;
}

function createStageBackdropTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 768;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    // Rich Royal Theater backdrop: warm dark brown edges -> golden brown -> champagne & glowing amber center
    const bgGrad = ctx.createRadialGradient(512, 435, 30, 512, 420, 640);
    bgGrad.addColorStop(0, '#F6DFAA');
    bgGrad.addColorStop(0.24, '#DFAC5A');
    bgGrad.addColorStop(0.52, '#9A5F26');
    bgGrad.addColorStop(0.8, '#593218');
    bgGrad.addColorStop(1, '#3B1F0F');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 1024, 768);

    // Subtle vertical royal tapestry sheen ribs
    for (let x = 0; x < 1024; x += 48) {
      const sheen = ctx.createLinearGradient(x, 0, x + 48, 0);
      sheen.addColorStop(0, 'rgba(255, 245, 215, 0.045)');
      sheen.addColorStop(0.5, 'rgba(48, 22, 8, 0.08)');
      sheen.addColorStop(1, 'rgba(255, 245, 215, 0.04)');
      ctx.fillStyle = sheen;
      ctx.fillRect(x, 0, 48, 768);
    }

    // Elegant royal theater architectural arches & delicate golden filigree trim
    ctx.save();
    ctx.strokeStyle = 'rgba(251, 224, 152, 0.26)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(512, 560, 355, Math.PI, 0, false);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(245, 184, 46, 0.20)';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.arc(512, 560, 336, Math.PI, 0, false);
    ctx.stroke();

    // Subtle side pilaster moldings
    ctx.strokeStyle = 'rgba(247, 214, 148, 0.16)';
    ctx.lineWidth = 2;
    ctx.strokeRect(128, 120, 768, 600);

    // Soft warm champagne-amber fairy bokeh lights along the upper arch
    for (let i = 0; i < 19; i++) {
      const angle = Math.PI + (i / 18) * Math.PI;
      const bx = 512 + Math.cos(angle) * 345;
      const by = 560 + Math.sin(angle) * 345;
      const dot = ctx.createRadialGradient(bx, by, 1, bx, by, 14);
      dot.addColorStop(0, 'rgba(255, 249, 224, 0.55)');
      dot.addColorStop(0.45, 'rgba(245, 184, 46, 0.18)');
      dot.addColorStop(1, 'rgba(245, 184, 46, 0)');
      ctx.fillStyle = dot;
      ctx.beginPath();
      ctx.arc(bx, by, 14, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // Soft glowing warm champagne-amber backlight behind the floating magic book
    const halo = ctx.createRadialGradient(512, 460, 16, 512, 460, 290);
    halo.addColorStop(0, 'rgba(255, 248, 220, 0.42)');
    halo.addColorStop(0.5, 'rgba(245, 184, 46, 0.16)');
    halo.addColorStop(1, 'rgba(154, 95, 38, 0)');
    ctx.fillStyle = halo;
    ctx.fillRect(0, 0, 1024, 768);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function createContactShadowTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const grad = ctx.createRadialGradient(128, 128, 12, 128, 128, 124);
    grad.addColorStop(0, 'rgba(61, 38, 18, 0.55)');
    grad.addColorStop(0.55, 'rgba(61, 38, 18, 0.22)');
    grad.addColorStop(1, 'rgba(61, 38, 18, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 256);
  }
  const tex = new THREE.CanvasTexture(canvas);
  return tex;
}

export default function TheaterStage3D({
  mode = 'intro',
  curtainsOpen = true,
  className = ''
}: TheaterStage3DProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const modeRef = useRef(mode);
  const curtainsOpenRef = useRef(curtainsOpen);

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  useEffect(() => {
    curtainsOpenRef.current = curtainsOpen;
  }, [curtainsOpen]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const isSoftwareGl = (() => {
      const probe = document.createElement('canvas').getContext('webgl2');
      if (!probe) return true;
      const ext = probe.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : probe.RENDERER;
      const gpu = String(probe.getParameter(param));
      probe.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !isSoftwareGl,
        powerPreference: 'high-performance'
      });
    } catch {
      return;
    }

    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = modeRef.current === 'finale' ? 1.04 : 0.96;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setSize(container.clientWidth || window.innerWidth, container.clientHeight || window.innerHeight);

    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';

    const handleContextLost = (e: Event) => {
      e.preventDefault();
    };
    const handleContextRestored = () => {
      renderer.setSize(container.clientWidth || window.innerWidth, container.clientHeight || window.innerHeight);
    };
    renderer.domElement.addEventListener('webglcontextlost', handleContextLost, false);
    renderer.domElement.addEventListener('webglcontextrestored', handleContextRestored, false);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#F7E3B0');
    scene.fog = new THREE.FogExp2('#F7E3B0', 0.004);

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const roomEnv = new RoomEnvironment();
    const envTex = pmremGenerator.fromScene(roomEnv, 0.04).texture;
    scene.environment = envTex;
    scene.environmentIntensity = modeRef.current === 'finale' ? 0.62 : 0.52;
    roomEnv.dispose();
    pmremGenerator.dispose();

    const camera = new THREE.PerspectiveCamera(
      44,
      (container.clientWidth || window.innerWidth) / (container.clientHeight || window.innerHeight),
      0.1,
      80
    );
    camera.position.set(0, 2.7, 10.2);
    camera.lookAt(0, 1.85, 0);

    // Lighting rig: balanced warm-gold theater spotlight + soft even apron & curtain illumination
    const hemiLight = new THREE.HemisphereLight(0xfff4d4, 0x693b1c, 0.78);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xffd98a, 1.15);
    keyLight.position.set(4, 9, 7);
    keyLight.castShadow = !isSoftwareGl;
    keyLight.shadow.mapSize.set(1024, 1024);
    keyLight.shadow.camera.near = 1;
    keyLight.shadow.camera.far = 25;
    keyLight.shadow.camera.left = -7;
    keyLight.shadow.camera.right = 7;
    keyLight.shadow.camera.top = 7;
    keyLight.shadow.camera.bottom = -4;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.02;
    scene.add(keyLight);

    const centerSpot = new THREE.SpotLight(0xffcd5c, 42, 22, Math.PI / 4.2, 0.78, 1.25);
    centerSpot.position.set(0, 7.6, 3.2);
    centerSpot.target.position.set(0, 1.3, 0);
    scene.add(centerSpot);
    scene.add(centerSpot.target);

    const rimLight = new THREE.PointLight(0xe89b3c, 10, 16);
    rimLight.position.set(-4.8, 4.2, -1.6);
    scene.add(rimLight);

    const goldRimLight = new THREE.PointLight(0xf5b82e, 11, 16);
    goldRimLight.position.set(4.8, 4.2, -1.6);
    scene.add(goldRimLight);

    // Even warm golden fill across front stage apron & back royal arch depth
    const apronFill = new THREE.PointLight(0xffdf9e, 10, 15);
    apronFill.position.set(0, 2.6, 6.2);
    scene.add(apronFill);

    const backGlowLight = new THREE.PointLight(0xf5b82e, 12, 12);
    backGlowLight.position.set(0, 3.2, -2.0);
    scene.add(backGlowLight);

    // Track disposables
    const geometries: THREE.BufferGeometry[] = [];
    const materials: THREE.Material[] = [];
    const textures: THREE.Texture[] = [];

    const woodTex = createWoodStageTexture();
    woodTex.anisotropy = renderer.capabilities.getMaxAnisotropy();
    textures.push(woodTex);

    const backdropTex = createStageBackdropTexture();
    backdropTex.anisotropy = renderer.capabilities.getMaxAnisotropy();
    textures.push(backdropTex);

    const shadowTex = createContactShadowTexture();
    textures.push(shadowTex);

    // Materials: royal dark maroon curtains, medium-dark walnut floor with soft golden reflections, champagne-gold trim
    const stageWoodMat = new THREE.MeshStandardMaterial({
      map: woodTex,
      roughness: 0.42,
      metalness: 0.08
    });
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xf6c03e,
      emissive: new THREE.Color(0xa1550b),
      emissiveIntensity: 0.2,
      roughness: 0.22,
      metalness: 0.86
    });
    const maroonVelvetDeepMat = new THREE.MeshStandardMaterial({
      color: 0x6b0f2a,
      emissive: new THREE.Color(0x26040e),
      emissiveIntensity: 0.08,
      roughness: 0.7,
      metalness: 0.05
    });
    const maroonVelvetMidMat = new THREE.MeshStandardMaterial({
      color: 0x821434,
      emissive: new THREE.Color(0x300511),
      emissiveIntensity: 0.08,
      roughness: 0.64,
      metalness: 0.06
    });
    const valenceMaroonMat = new THREE.MeshStandardMaterial({
      color: 0x620d26,
      emissive: new THREE.Color(0x22030c),
      emissiveIntensity: 0.08,
      roughness: 0.68,
      metalness: 0.05
    });
    const pillarIvoryMat = new THREE.MeshStandardMaterial({
      color: 0xfbf0cc,
      roughness: 0.44,
      metalness: 0.06
    });
    const bronzeAccentMat = new THREE.MeshStandardMaterial({
      color: 0x6c361a,
      roughness: 0.48,
      metalness: 0.18
    });
    const backdropWallMat = new THREE.MeshStandardMaterial({
      map: backdropTex,
      roughness: 0.82,
      metalness: 0.04,
      fog: false
    });
    const bookLeatherMat = new THREE.MeshStandardMaterial({
      color: 0x7c2d12,
      roughness: 0.46,
      metalness: 0.18
    });
    const pageMat = new THREE.MeshStandardMaterial({
      color: 0xfff8dc,
      roughness: 0.84,
      metalness: 0.0,
      emissive: new THREE.Color(0xf59e0b),
      emissiveIntensity: 0.24
    });
    const crystalOrbMat = new THREE.MeshStandardMaterial({
      color: 0xfef08a,
      emissive: new THREE.Color(0xf59e0b),
      emissiveIntensity: 1.55,
      roughness: 0.16,
      metalness: 0.1
    });
    const beamMat = new THREE.MeshBasicMaterial({
      color: 0xfde68a,
      transparent: true,
      opacity: 0.075,
      depthWrite: false,
      side: THREE.DoubleSide
    });
    materials.push(
      stageWoodMat,
      goldMat,
      maroonVelvetDeepMat,
      maroonVelvetMidMat,
      valenceMaroonMat,
      pillarIvoryMat,
      bronzeAccentMat,
      backdropWallMat,
      bookLeatherMat,
      pageMat,
      crystalOrbMat,
      beamMat
    );

    // 1. Composite Wooden Stage & Proscenium Arch Group
    const stageGroup = new THREE.Group();

    const floorGeo = new THREE.CylinderGeometry(6.8, 7.2, 0.7, 48);
    geometries.push(floorGeo);
    const floorMesh = new THREE.Mesh(floorGeo, stageWoodMat);
    floorMesh.position.set(0, -0.35, 0);
    floorMesh.receiveShadow = true;
    stageGroup.add(floorMesh);

    const trimGeo = new THREE.TorusGeometry(6.82, 0.12, 14, 56);
    geometries.push(trimGeo);
    const trimMesh = new THREE.Mesh(trimGeo, goldMat);
    trimMesh.rotation.x = Math.PI / 2;
    trimMesh.position.set(0, -0.02, 0);
    stageGroup.add(trimMesh);

    // Stage apron footlights
    const footlightGeo = new THREE.SphereGeometry(0.11, 12, 12);
    geometries.push(footlightGeo);
    for (let i = -3; i <= 3; i++) {
      const angle = (i / 4) * 0.65;
      const bulb = new THREE.Mesh(footlightGeo, crystalOrbMat);
      bulb.position.set(Math.sin(angle) * 6.3, 0.06, Math.cos(angle) * 6.3 - 0.15);
      stageGroup.add(bulb);
    }

    // Proscenium pillars (left & right) + golden arch
    const pillarBaseGeo = new THREE.BoxGeometry(1.1, 0.55, 1.1);
    const pillarShaftGeo = new THREE.CylinderGeometry(0.36, 0.44, 6.2, 16);
    const pillarCapGeo = new THREE.BoxGeometry(1.05, 0.45, 1.05);
    geometries.push(pillarBaseGeo, pillarShaftGeo, pillarCapGeo);

    [-5.4, 5.4].forEach((xPos) => {
      const pillar = new THREE.Group();
      const base = new THREE.Mesh(pillarBaseGeo, bronzeAccentMat);
      base.position.y = 0.275;
      base.castShadow = true;
      base.receiveShadow = true;
      const shaft = new THREE.Mesh(pillarShaftGeo, pillarIvoryMat);
      shaft.position.y = 3.35;
      shaft.castShadow = true;
      shaft.receiveShadow = true;
      const cap = new THREE.Mesh(pillarCapGeo, goldMat);
      cap.position.y = 6.55;
      cap.castShadow = true;
      pillar.add(base, shaft, cap);
      pillar.position.set(xPos, 0, 1.2);
      stageGroup.add(pillar);
    });

    const archGeo = new THREE.TorusGeometry(5.5, 0.28, 12, 48, Math.PI);
    const innerArchGeo = new THREE.TorusGeometry(4.55, 0.1, 10, 48, Math.PI);
    geometries.push(archGeo, innerArchGeo);
    const archMesh = new THREE.Mesh(archGeo, goldMat);
    archMesh.position.set(0, 5.9, 1.2);
    const innerArchMesh = new THREE.Mesh(innerArchGeo, goldMat);
    innerArchMesh.position.set(0, 4.85, -1.9);
    stageGroup.add(archMesh, innerArchMesh);

    // Royal golden-champagne-amber theater backdrop wall
    const backdropGeo = new THREE.PlaneGeometry(14, 9);
    geometries.push(backdropGeo);
    const backdropMesh = new THREE.Mesh(backdropGeo, backdropWallMat);
    backdropMesh.position.set(0, 4.1, -3.4);
    backdropMesh.receiveShadow = true;
    stageGroup.add(backdropMesh);

    scene.add(stageGroup);

    // 2. Composite Draped Curtains (pulled wide open to the sides with gold tie-back trim)
    const leftCurtain = new THREE.Group();
    const rightCurtain = new THREE.Group();
    const pleatGeo = new THREE.CylinderGeometry(0.32, 0.4, 7.2, 16);
    const tasselGeo = new THREE.TorusGeometry(0.42, 0.075, 10, 24);
    const goldBorderGeo = new THREE.CylinderGeometry(0.05, 0.05, 7.2, 10);
    geometries.push(pleatGeo, tasselGeo, goldBorderGeo);

    for (let i = 0; i < 5; i++) {
      const pleatMat = i % 2 === 0 ? maroonVelvetDeepMat : maroonVelvetMidMat;
      const pleatL = new THREE.Mesh(pleatGeo, pleatMat);
      pleatL.position.set(i * 0.44, 3.6, Math.sin(i * 0.95) * 0.16);
      pleatL.rotation.z = -0.04 * (4 - i);
      pleatL.castShadow = true;
      pleatL.receiveShadow = true;
      leftCurtain.add(pleatL);

      const pleatR = new THREE.Mesh(pleatGeo, pleatMat);
      pleatR.position.set(-i * 0.44, 3.6, Math.sin(i * 0.95) * 0.16);
      pleatR.rotation.z = 0.04 * (4 - i);
      pleatR.castShadow = true;
      pleatR.receiveShadow = true;
      rightCurtain.add(pleatR);
    }

    // Golden edge piping & tie-back clasps on the gathered maroon drapes
    const trimL = new THREE.Mesh(goldBorderGeo, goldMat);
    trimL.position.set(4 * 0.44 + 0.28, 3.6, 0.14);
    trimL.rotation.z = -0.02;
    leftCurtain.add(trimL);

    const trimR = new THREE.Mesh(goldBorderGeo, goldMat);
    trimR.position.set(-(4 * 0.44 + 0.28), 3.6, 0.14);
    trimR.rotation.z = 0.02;
    rightCurtain.add(trimR);

    const tieL = new THREE.Mesh(tasselGeo, goldMat);
    tieL.rotation.x = Math.PI / 2;
    tieL.position.set(1.15, 2.45, 0.22);
    leftCurtain.add(tieL);

    const tieR = new THREE.Mesh(tasselGeo, goldMat);
    tieR.rotation.x = Math.PI / 2;
    tieR.position.set(-1.15, 2.45, 0.22);
    rightCurtain.add(tieR);

    leftCurtain.position.set(-6.15, 0, 1.45);
    rightCurtain.position.set(6.15, 0, 1.45);
    scene.add(leftCurtain, rightCurtain);

    // Top valence drape + delicate golden trim bar
    const valenceGeo = new THREE.CylinderGeometry(0.46, 0.46, 11.4, 16);
    const valenceTrimGeo = new THREE.CylinderGeometry(0.06, 0.06, 11.4, 12);
    geometries.push(valenceGeo, valenceTrimGeo);
    const valence = new THREE.Mesh(valenceGeo, valenceMaroonMat);
    valence.rotation.z = Math.PI / 2;
    valence.position.set(0, 6.95, 1.6);
    valence.castShadow = true;
    const valenceTrim = new THREE.Mesh(valenceTrimGeo, goldMat);
    valenceTrim.rotation.z = Math.PI / 2;
    valenceTrim.position.set(0, 6.52, 1.72);
    scene.add(valence, valenceTrim);

    // 3. Composite Hero Prop: Floating Magic Storybook (8 parts)
    const bookGroup = new THREE.Group();
    const pedestalBaseGeo = new THREE.CylinderGeometry(0.9, 1.15, 0.25, 24);
    const pedestalColGeo = new THREE.CylinderGeometry(0.24, 0.35, 1.15, 18);
    const pedestalTopGeo = new THREE.CylinderGeometry(0.75, 0.5, 0.18, 24);
    const coverGeo = new THREE.BoxGeometry(1.15, 0.08, 1.55);
    const pageGeo = new THREE.BoxGeometry(1.04, 0.12, 1.42);
    const spineGeo = new THREE.CylinderGeometry(0.09, 0.09, 1.58, 12);
    const orbGeo = new THREE.OctahedronGeometry(0.26, 1);
    const contactPlaneGeo = new THREE.PlaneGeometry(3.2, 3.2);
    geometries.push(
      pedestalBaseGeo,
      pedestalColGeo,
      pedestalTopGeo,
      coverGeo,
      pageGeo,
      spineGeo,
      orbGeo,
      contactPlaneGeo
    );

    const pedBase = new THREE.Mesh(pedestalBaseGeo, goldMat);
    pedBase.position.y = 0.125;
    const pedCol = new THREE.Mesh(pedestalColGeo, bronzeAccentMat);
    pedCol.position.y = 0.82;
    const pedTop = new THREE.Mesh(pedestalTopGeo, goldMat);
    pedTop.position.y = 1.48;
    stageGroup.add(pedBase, pedCol, pedTop);

    // Soft contact shadow under pedestal
    const contactMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      depthWrite: false,
      opacity: 0.65
    });
    materials.push(contactMat);
    const contactPlane = new THREE.Mesh(contactPlaneGeo, contactMat);
    contactPlane.rotation.x = -Math.PI / 2;
    contactPlane.position.set(0, 0.015, 0);
    stageGroup.add(contactPlane);

    // Open book assembly
    const leftCover = new THREE.Mesh(coverGeo, bookLeatherMat);
    leftCover.position.set(-0.56, 0, 0);
    leftCover.rotation.z = 0.26;
    leftCover.castShadow = true;

    const rightCover = new THREE.Mesh(coverGeo, bookLeatherMat);
    rightCover.position.set(0.56, 0, 0);
    rightCover.rotation.z = -0.26;
    rightCover.castShadow = true;

    const leftPages = new THREE.Mesh(pageGeo, pageMat);
    leftPages.position.set(-0.53, 0.08, 0);
    leftPages.rotation.z = 0.24;

    const rightPages = new THREE.Mesh(pageGeo, pageMat);
    rightPages.position.set(0.53, 0.08, 0);
    rightPages.rotation.z = -0.24;

    const spine = new THREE.Mesh(spineGeo, goldMat);
    spine.rotation.x = Math.PI / 2;
    spine.position.set(0, -0.08, 0);

    const magicOrb = new THREE.Mesh(orbGeo, crystalOrbMat);
    magicOrb.position.set(0, 0.68, 0);

    bookGroup.add(leftCover, rightCover, leftPages, rightPages, spine, magicOrb);
    bookGroup.position.set(0, 2.05, 0);
    bookGroup.rotation.x = 0.32;
    scene.add(bookGroup);

    // Spotlight volumetric cone
    const coneGeo = new THREE.ConeGeometry(2.6, 7.6, 24, 1, true);
    geometries.push(coneGeo);
    const coneMesh = new THREE.Mesh(coneGeo, beamMat);
    coneMesh.position.set(0, 3.8, 0.4);
    scene.add(coneMesh);

    // 4. Instanced Twinkling Golden Stars
    const STAR_COUNT = 42;
    const starGeo = new THREE.OctahedronGeometry(0.11, 0);
    const starMat = new THREE.MeshStandardMaterial({
      color: 0xfde047,
      emissive: new THREE.Color(0xf59e0b),
      emissiveIntensity: 0.9,
      roughness: 0.2,
      metalness: 0.8
    });
    geometries.push(starGeo);
    materials.push(starMat);

    const starsMesh = new THREE.InstancedMesh(starGeo, starMat, STAR_COUNT);
    const starSeeds: { x: number; y: number; z: number; phase: number; scale: number }[] = [];
    for (let i = 0; i < STAR_COUNT; i++) {
      const spreadX = (Math.sin(i * 17.3) * 0.5 + (i / STAR_COUNT - 0.5)) * 10.5;
      const spreadY = 2.0 + ((i * 1.37) % 4.8);
      const spreadZ = -2.6 + Math.cos(i * 5.1) * 1.4;
      const sc = 0.65 + (i % 5) * 0.22;
      starSeeds.push({ x: spreadX, y: spreadY, z: spreadZ, phase: i * 0.7, scale: sc });
      _dummy.position.set(spreadX, spreadY, spreadZ);
      _dummy.scale.setScalar(sc);
      _dummy.updateMatrix();
      starsMesh.setMatrixAt(i, _dummy.matrix);
      _color.setHex(i % 3 === 0 ? 0xfef08a : 0xfbbf24);
      starsMesh.setColorAt(i, _color);
    }
    starsMesh.instanceMatrix.needsUpdate = true;
    starsMesh.frustumCulled = false;
    starsMesh.computeBoundingSphere();
    scene.add(starsMesh);

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    // Animation state
    const clock = new THREE.Clock();
    let frameId = 0;
    let disposed = false;
    let curtainProgress = curtainsOpenRef.current ? 1 : 0;

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync ? gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0) : null;
      gl.flush();
      if (!sync) {
        frameId = window.setTimeout(cb, 80);
        return;
      }
      const poll = () => {
        if (disposed) return;
        const status = gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (status === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    function tick() {
      if (disposed) return;
      const rawDt = clock.getDelta();
      const dt = Math.min(rawDt, 0.05);
      const elapsed = clock.getElapsedTime();

      const targetCurtain = curtainsOpenRef.current ? 1 : 0;
      curtainProgress = THREE.MathUtils.damp(curtainProgress, targetCurtain, 3.2, dt);

      leftCurtain.position.x = -2.1 - curtainProgress * 4.05;
      rightCurtain.position.x = 2.1 + curtainProgress * 4.05;

      // Floating magic book & orb
      bookGroup.position.y = 2.06 + Math.sin(elapsed * 1.6) * 0.1;
      bookGroup.rotation.y = Math.sin(elapsed * 0.55) * 0.22;
      magicOrb.rotation.y = elapsed * 1.1;
      magicOrb.rotation.x = Math.sin(elapsed * 0.9) * 0.3;

      const activeMode = modeRef.current;
      renderer.toneMappingExposure = activeMode === 'finale' ? 1.04 : 0.96;
      scene.environmentIntensity = activeMode === 'finale' ? 0.62 : 0.52;
      const targetSpotIntensity = activeMode === 'finale' ? 66 : activeMode === 'workshop' ? 48 : 42;
      centerSpot.intensity = THREE.MathUtils.damp(centerSpot.intensity, targetSpotIntensity, 4, dt);
      beamMat.opacity = activeMode === 'finale' ? 0.1 : 0.072;

      // Gentle camera sway
      const camTargetX = Math.sin(elapsed * 0.25) * 0.55;
      const camTargetY = activeMode === 'finale' ? 2.45 : 2.7;
      camera.position.x = THREE.MathUtils.damp(camera.position.x, camTargetX, 2.5, dt);
      camera.position.y = THREE.MathUtils.damp(camera.position.y, camTargetY, 2.5, dt);
      camera.lookAt(0, 1.85, 0);

      // Animate twinkling instanced stars
      for (let i = 0; i < STAR_COUNT; i++) {
        const s = starSeeds[i];
        const pulse = s.scale * (0.78 + 0.32 * Math.sin(elapsed * 2.2 + s.phase));
        _dummy.position.set(s.x, s.y + Math.sin(elapsed * 0.9 + s.phase) * 0.08, s.z);
        _dummy.rotation.set(0, elapsed * 0.6 + s.phase, 0);
        _dummy.scale.setScalar(pulse);
        _dummy.updateMatrix();
        starsMesh.setMatrixAt(i, _dummy.matrix);
      }
      starsMesh.instanceMatrix.needsUpdate = true;

      renderer.render(scene, camera);

      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = requestAnimationFrame(tick);
      }
    }

    const handleResize = () => {
      if (!container || disposed) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);
    tick();

    return () => {
      disposed = true;
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('webglcontextlost', handleContextLost);
      renderer.domElement.removeEventListener('webglcontextrestored', handleContextRestored);
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      geometries.forEach((g) => g.dispose());
      materials.forEach((m) => m.dispose());
      textures.forEach((t) => t.dispose());
      envTex.dispose();
      renderer.dispose();
    };
  }, []);

  return <div ref={mountRef} className={`w-full h-full overflow-hidden ${className}`} aria-hidden="true" />;
}
