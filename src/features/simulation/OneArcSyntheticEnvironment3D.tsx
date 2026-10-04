import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { 
  Eye, 
  Layers, 
  Radio, 
  Compass, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Minimize2, 
  Sun, 
  Moon, 
  ShieldAlert, 
  Activity, 
  Zap, 
  AlertTriangle, 
  Crosshair, 
  Camera, 
  Play, 
  Pause, 
  RotateCcw,
  Sparkles,
  Target,
  Clock,
  CheckCircle2,
  Sliders,
  MapPin,
  Flame,
  Scan
} from 'lucide-react';
import { useSimulation } from '../../simulation/simulationStore';

export type CameraPerspective = 'UAV_GIMBAL' | 'GROUND_SCOUT' | 'SATELLITE_ORBIT' | 'EW_SPECTRUM';
export type SensorOpticalMode = 'VISIBLE_RGB' | 'FLIR_WHITE_HOT' | 'FLIR_BLACK_HOT' | 'NVG_GREEN' | 'EW_HEATMAP';

interface OneArcSyntheticEnvironment3DProps {
  isCompact?: boolean;
  onFullscreenToggle?: () => void;
  isFullscreen?: boolean;
}

export const OneArcSyntheticEnvironment3D: React.FC<OneArcSyntheticEnvironment3DProps> = ({
  isCompact = false,
  onFullscreenToggle,
  isFullscreen = false
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const { session, uncertaintyMetrics, informationDebt, formatSimTime } = useSimulation();

  // Controls State
  const [perspective, setPerspective] = useState<CameraPerspective>('UAV_GIMBAL');
  const [sensorMode, setSensorMode] = useState<SensorOpticalMode>('VISIBLE_RGB');
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [isSimPlaying, setIsSimPlaying] = useState<boolean>(true);
  const [timeOfDay, setTimeOfDay] = useState<number>(14); // 14:00 hours
  const [selectedTarget, setSelectedTarget] = useState<string | null>('Waypoint Echo (River Crossing)');
  const [showHUD, setShowHUD] = useState<boolean>(true);
  const [showContourGrid, setShowContourGrid] = useState<boolean>(true);

  // Degradation state
  const isAirDelayed = session.channels.find(c => c.id === 'ch-air')?.status === 'DELAYED';
  const isBlackout = session.channels.some(c => c.status === 'INTERRUPTED');

  // Animation Refs
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const terrainMeshRef = useRef<THREE.Mesh | null>(null);
  const ewBubbleRef = useRef<THREE.Mesh | null>(null);
  const uavDroneMeshRef = useRef<THREE.Group | null>(null);
  const waypointMarkersRef = useRef<THREE.Group[]>([]);
  const reqIdRef = useRef<number>(0);
  const timeAngleRef = useRef<number>(0);

  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 500;

    // 1. Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0xf1f5f9);
    scene.fog = new THREE.FogExp2(0xe2e8f0, 0.0035);

    // 2. Camera setup
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    cameraRef.current = camera;
    camera.position.set(0, 75, 110);
    camera.lookAt(0, 10, 0);

    // 3. Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    rendererRef.current = renderer;
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 4. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    ambientLight.name = 'ambient';
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfffaed, 1.8);
    sunLight.name = 'sunLight';
    sunLight.position.set(60, 120, 50);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 10;
    sunLight.shadow.camera.far = 350;
    const d = 100;
    sunLight.shadow.camera.left = -d;
    sunLight.shadow.camera.right = d;
    sunLight.shadow.camera.top = d;
    sunLight.shadow.camera.bottom = -d;
    scene.add(sunLight);

    // 5. Procedural 3D Synthetic Terrain Generation (Hills, Valleys, River, Fields)
    const terrainSize = 220;
    const segments = 128;
    const terrainGeo = new THREE.PlaneGeometry(terrainSize, terrainSize, segments, segments);
    terrainGeo.rotateX(-Math.PI / 2);

    const pos = terrainGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);

      // Multi-frequency Perlin-style height approximation
      let y = Math.sin(x * 0.035) * Math.cos(z * 0.035) * 8;
      y += Math.sin(x * 0.08 + 1.2) * Math.cos(z * 0.08 + 0.8) * 3.5;
      y += Math.sin(x * 0.15) * Math.cos(z * 0.15) * 1.2;

      // River valley depression along winding curve
      const riverX = Math.sin(z * 0.03) * 20;
      const distToRiver = Math.abs(x - riverX);
      if (distToRiver < 18) {
        y -= Math.cos((distToRiver / 18) * (Math.PI / 2)) * 6;
      }

      // Ridge on north-west
      if (x < -30 && z < -20) {
        y += Math.min(18, (-x - 30) * 0.4);
      }

      pos.setY(i, Math.max(-2, y));
    }
    terrainGeo.computeVertexNormals();

    // Terrain Texture / Material
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d')!;

    // Base tactical palette texture
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(0, 0, 1024, 1024);

    // Agricultural field patches
    const colors = ['#94a3b8', '#a3b899', '#cbd5e1', '#b8a894', '#64748b', '#cbd5e1', '#8ca382'];
    for (let i = 0; i < 60; i++) {
      ctx.fillStyle = colors[i % colors.length];
      const fx = (i * 137) % 900;
      const fz = (i * 211) % 900;
      const fw = 80 + (i * 19) % 120;
      const fh = 60 + (i * 31) % 90;
      ctx.fillRect(fx, fz, fw, fh);
      ctx.strokeStyle = 'rgba(255,255,255,0.4)';
      ctx.strokeRect(fx, fz, fw, fh);
    }

    // River winding path
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 24;
    ctx.lineCap = 'round';
    ctx.beginPath();
    for (let z = 0; z <= 1024; z += 10) {
      const x = 512 + Math.sin((z / 1024) * Math.PI * 4) * 120;
      if (z === 0) ctx.moveTo(x, z);
      else ctx.lineTo(x, z);
    }
    ctx.stroke();

    const terrainTexture = new THREE.CanvasTexture(canvas);
    terrainTexture.wrapS = THREE.RepeatWrapping;
    terrainTexture.wrapT = THREE.RepeatWrapping;

    const terrainMat = new THREE.MeshStandardMaterial({
      map: terrainTexture,
      roughness: 0.85,
      metalness: 0.1,
      flatShading: false
    });

    const terrainMesh = new THREE.Mesh(terrainGeo, terrainMat);
    terrainMesh.receiveShadow = true;
    scene.add(terrainMesh);
    terrainMeshRef.current = terrainMesh;

    // 6. Tactical MGRS Contour Grid Overlay
    const gridHelper = new THREE.GridHelper(terrainSize, 44, 0x0284c7, 0x94a3b8);
    gridHelper.position.y = 0.4;
    gridHelper.name = 'tacticalGrid';
    scene.add(gridHelper);

    // 7. Tree clusters & Outpost Buildings
    const treeGroup = new THREE.Group();
    const treeTrunkGeo = new THREE.CylinderGeometry(0.3, 0.4, 1.8, 6);
    const treeTrunkMat = new THREE.MeshStandardMaterial({ color: 0x5c4033 });
    const treeFoliageGeo = new THREE.ConeGeometry(1.6, 3.5, 7);
    const treeFoliageMat = new THREE.MeshStandardMaterial({ color: 0x2e5a36, roughness: 0.9 });

    for (let i = 0; i < 120; i++) {
      const tx = (Math.sin(i * 1.7) * 90) + (i % 5) * 4;
      const tz = (Math.cos(i * 2.3) * 90) + (i % 7) * 3;
      if (Math.abs(tx) < 12 && Math.abs(tz) < 12) continue; // clear center

      const tree = new THREE.Group();
      const trunk = new THREE.Mesh(treeTrunkGeo, treeTrunkMat);
      trunk.position.y = 0.9;
      trunk.castShadow = true;
      const foliage = new THREE.Mesh(treeFoliageGeo, treeFoliageMat);
      foliage.position.y = 2.8;
      foliage.castShadow = true;
      tree.add(trunk);
      tree.add(foliage);

      tree.position.set(tx, 1.5, tz);
      treeGroup.add(tree);
    }
    scene.add(treeGroup);

    // Tactical Outpost Buildings (Forward Operating Station)
    const buildingGroup = new THREE.Group();
    const bldgMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.6 });
    const bldgGeo1 = new THREE.BoxGeometry(7, 4, 10);
    const bldg1 = new THREE.Mesh(bldgGeo1, bldgMat);
    bldg1.position.set(25, 2, 10);
    bldg1.castShadow = true;
    bldg1.receiveShadow = true;
    buildingGroup.add(bldg1);

    const bldgGeo2 = new THREE.BoxGeometry(6, 3.5, 6);
    const bldg2 = new THREE.Mesh(bldgGeo2, bldgMat);
    bldg2.position.set(34, 1.75, 12);
    bldg2.castShadow = true;
    buildingGroup.add(bldg2);

    // Radio Antenna Mast
    const mastGeo = new THREE.CylinderGeometry(0.15, 0.3, 16, 8);
    const mastMat = new THREE.MeshStandardMaterial({ color: 0xe11d48 });
    const mast = new THREE.Mesh(mastGeo, mastMat);
    mast.position.set(25, 10, 10);
    mast.castShadow = true;
    buildingGroup.add(mast);
    scene.add(buildingGroup);

    // 8. Interactive 3D Tactical Waypoint Beacons
    const waypoints = [
      { name: 'Checkpoint Alpha', x: -40, z: 20, color: 0x0284c7 },
      { name: 'Waypoint Echo (River Crossing)', x: 0, z: -10, color: 0xd97706 },
      { name: 'Sector North Observation Post', x: 25, z: 10, color: 0x059669 },
      { name: 'EW Jammer Source Origin', x: -25, z: -45, color: 0xe11d48 }
    ];

    waypointMarkersRef.current = [];
    waypoints.forEach(wp => {
      const wpGroup = new THREE.Group();
      wpGroup.position.set(wp.x, 0, wp.z);

      // Pulsing ring
      const ringGeo = new THREE.RingGeometry(2.5, 3.2, 32);
      ringGeo.rotateX(-Math.PI / 2);
      const ringMat = new THREE.MeshBasicMaterial({ color: wp.color, side: THREE.DoubleSide, transparent: true, opacity: 0.85 });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.y = 0.5;
      wpGroup.add(ring);

      // Pin Marker Pillar
      const pinGeo = new THREE.CylinderGeometry(0.2, 0.2, 10, 12);
      const pinMat = new THREE.MeshStandardMaterial({ color: wp.color, emissive: wp.color, emissiveIntensity: 0.4 });
      const pin = new THREE.Mesh(pinGeo, pinMat);
      pin.position.y = 5;
      wpGroup.add(pin);

      // Top floating diamond beacon
      const diamondGeo = new THREE.OctahedronGeometry(1.4, 0);
      const diamondMat = new THREE.MeshStandardMaterial({ color: wp.color, emissive: wp.color, emissiveIntensity: 0.6 });
      const diamond = new THREE.Mesh(diamondGeo, diamondMat);
      diamond.position.y = 11;
      wpGroup.add(diamond);

      scene.add(wpGroup);
      waypointMarkersRef.current.push(wpGroup);
    });

    // 9. UAV Aerial Platform Model
    const uavGroup = new THREE.Group();
    const uavBodyGeo = new THREE.BoxGeometry(2.5, 0.6, 4);
    const uavMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3 });
    const uavBody = new THREE.Mesh(uavBodyGeo, uavMat);
    uavGroup.add(uavBody);

    const wingGeo = new THREE.BoxGeometry(14, 0.15, 1.2);
    const wing = new THREE.Mesh(wingGeo, uavMat);
    wing.position.set(0, 0.2, 0);
    uavGroup.add(wing);

    uavGroup.position.set(0, 48, 0);
    scene.add(uavGroup);
    uavDroneMeshRef.current = uavGroup;

    // 10. Electronic Warfare (EW) Electromagnetic Dome Bubble
    const ewGeo = new THREE.SphereGeometry(32, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    const ewMat = new THREE.MeshBasicMaterial({
      color: 0xe11d48,
      wireframe: true,
      transparent: true,
      opacity: 0.28
    });
    const ewBubble = new THREE.Mesh(ewGeo, ewMat);
    ewBubble.position.set(-25, 0, -45);
    scene.add(ewBubble);
    ewBubbleRef.current = ewBubble;

    // 11. Animation Render Loop
    let lastTime = performance.now();
    const animate = () => {
      reqIdRef.current = requestAnimationFrame(animate);

      const now = performance.now();
      const delta = (now - lastTime) / 1000;
      lastTime = now;

      if (isSimPlaying) {
        timeAngleRef.current += delta * 0.35;
      }

      const angle = timeAngleRef.current;

      // Animate UAV Drone Orbit
      if (uavDroneMeshRef.current) {
        const uavRadius = 45;
        const uavX = Math.sin(angle) * uavRadius;
        const uavZ = Math.cos(angle) * uavRadius;
        uavDroneMeshRef.current.position.set(uavX, 42 + Math.sin(angle * 2) * 2, uavZ);
        uavDroneMeshRef.current.rotation.y = angle + Math.PI / 2;
      }

      // Animate Waypoint Beacons
      waypointMarkersRef.current.forEach((wp, idx) => {
        const diamond = wp.children[2];
        if (diamond) {
          diamond.rotation.y += delta * (1.5 + idx * 0.3);
          diamond.position.y = 11 + Math.sin(angle * 3 + idx) * 0.8;
        }
      });

      // Animate EW Pulsating Dome
      if (ewBubbleRef.current) {
        const scale = 1 + Math.sin(angle * 4) * 0.08;
        ewBubbleRef.current.scale.set(scale, scale, scale);
        ewBubbleRef.current.rotation.y += delta * 0.2;
      }

      // Camera Perspective Dynamics
      if (cameraRef.current) {
        const cam = cameraRef.current;
        if (perspective === 'UAV_GIMBAL') {
          // Drone Gimbal view orbiting target waypoint
          const camDist = 75 / zoomLevel;
          cam.position.x = Math.sin(angle * 0.6) * camDist;
          cam.position.z = Math.cos(angle * 0.6) * camDist;
          cam.position.y = (45 + Math.sin(angle * 0.3) * 6) / zoomLevel;
          cam.lookAt(0, 4, 0);
        } else if (perspective === 'GROUND_SCOUT') {
          // Forward Observer ground sightline
          cam.position.set(-38, 7, 24);
          cam.lookAt(0 + Math.sin(angle * 0.2) * 5, 4, -10);
        } else if (perspective === 'SATELLITE_ORBIT') {
          // High-altitude top-down satellite
          cam.position.set(0.1, 140 / zoomLevel, 0.1);
          cam.lookAt(0, 0, 0);
        } else if (perspective === 'EW_SPECTRUM') {
          // Close-up on EW Jammer origin
          cam.position.set(-25 + Math.sin(angle) * 35, 25, -45 + Math.cos(angle) * 35);
          cam.lookAt(-25, 4, -45);
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    // Resize Handler
    const handleResize = () => {
      if (!container || !cameraRef.current || !rendererRef.current) return;
      const newW = container.clientWidth;
      const newH = container.clientHeight;
      cameraRef.current.aspect = newW / newH;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(newW, newH);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(reqIdRef.current);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, [perspective, isSimPlaying, zoomLevel]);

  // Update Sensor Mode Filters & Lighting
  useEffect(() => {
    if (!sceneRef.current) return;
    const scene = sceneRef.current;
    const sun = scene.getObjectByName('sunLight') as THREE.DirectionalLight;
    const amb = scene.getObjectByName('ambient') as THREE.AmbientLight;

    if (sensorMode === 'VISIBLE_RGB') {
      scene.background = new THREE.Color(0xf1f5f9);
      if (sun) sun.color.setHex(0xfffaed);
      if (amb) amb.color.setHex(0xffffff);
    } else if (sensorMode === 'FLIR_WHITE_HOT') {
      scene.background = new THREE.Color(0x0f172a);
      if (sun) sun.color.setHex(0xffffff);
      if (amb) amb.color.setHex(0x94a3b8);
    } else if (sensorMode === 'FLIR_BLACK_HOT') {
      scene.background = new THREE.Color(0xe2e8f0);
      if (sun) sun.color.setHex(0x1e293b);
      if (amb) amb.color.setHex(0x334155);
    } else if (sensorMode === 'NVG_GREEN') {
      scene.background = new THREE.Color(0x022c22);
      if (sun) sun.color.setHex(0x10b981);
      if (amb) amb.color.setHex(0x047857);
    } else if (sensorMode === 'EW_HEATMAP') {
      scene.background = new THREE.Color(0x1e1b4b);
      if (sun) sun.color.setHex(0xe11d48);
      if (amb) amb.color.setHex(0x4338ca);
    }
  }, [sensorMode]);

  return (
    <div className={`relative bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col font-mono shadow-xs select-none ${
      isFullscreen ? 'fixed inset-0 z-50 rounded-none' : isCompact ? 'h-[440px]' : 'h-[580px]'
    }`}>
      
      {/* 3D Viewport Top Action HUD */}
      <div className="absolute top-0 inset-x-0 z-20 p-3 bg-gradient-to-b from-white/95 via-white/80 to-transparent flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/50 backdrop-blur-xs">
        
        {/* Left: Tactical Camera Perspective Selector */}
        <div className="flex items-center space-x-1.5 bg-white/90 border border-slate-200 p-1 rounded-lg shadow-xs">
          <span className="text-[10px] font-bold text-sky-700 px-2 uppercase flex items-center gap-1">
            <Camera className="w-3.5 h-3.5" />
            <span>OneArc 3D</span>
          </span>

          {[
            { id: 'UAV_GIMBAL', label: 'Aerial UAV EO/IR', icon: <Crosshair className="w-3 h-3" /> },
            { id: 'GROUND_SCOUT', label: 'Ground Scout POV', icon: <Eye className="w-3 h-3" /> },
            { id: 'SATELLITE_ORBIT', label: 'Satellite GIS', icon: <Layers className="w-3 h-3" /> },
            { id: 'EW_SPECTRUM', label: 'EW Bubble 3D', icon: <Zap className="w-3 h-3" /> }
          ].map(p => (
            <button
              key={p.id}
              onClick={() => setPerspective(p.id as CameraPerspective)}
              className={`px-2.5 py-1 text-xs rounded-md font-semibold flex items-center space-x-1 transition-all ${
                perspective === p.id
                  ? 'bg-sky-600 text-white shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {p.icon}
              <span className="hidden sm:inline">{p.label}</span>
            </button>
          ))}
        </div>

        {/* Right: Optical Sensor Filters (RGB, FLIR, NVG) & Zoom */}
        <div className="flex items-center space-x-1.5">
          {/* Sensor Filter Dropdown / Buttons */}
          <div className="flex items-center space-x-1 bg-white/90 border border-slate-200 p-1 rounded-lg shadow-xs text-xs">
            <span className="text-[10px] text-slate-500 font-semibold px-1">Optical:</span>
            {[
              { id: 'VISIBLE_RGB', label: 'Daylight', color: 'text-slate-800' },
              { id: 'FLIR_WHITE_HOT', label: 'FLIR White', color: 'text-amber-700' },
              { id: 'NVG_GREEN', label: 'NVG', color: 'text-emerald-700' },
              { id: 'EW_HEATMAP', label: 'RF Spectrum', color: 'text-rose-700' }
            ].map(m => (
              <button
                key={m.id}
                onClick={() => setSensorMode(m.id as SensorOpticalMode)}
                className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all ${
                  sensorMode === m.id
                    ? 'bg-slate-900 text-white shadow-xs'
                    : `${m.color} hover:bg-slate-100`
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          {/* Zoom Controls */}
          <div className="flex items-center bg-white/90 border border-slate-200 rounded-lg p-0.5 shadow-xs">
            <button
              onClick={() => setZoomLevel(prev => Math.max(0.6, prev - 0.2))}
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] font-bold px-1.5 text-slate-700">{(zoomLevel).toFixed(1)}x</span>
            <button
              onClick={() => setZoomLevel(prev => Math.min(2.5, prev + 0.2))}
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Fullscreen Toggle */}
          {onFullscreenToggle && (
            <button
              onClick={onFullscreenToggle}
              className="p-1.5 bg-white/90 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg shadow-xs transition-colors"
              title="Toggle Fullscreen 3D Lab"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>

      {/* 3D WebGL Canvas Container */}
      <div 
        ref={mountRef} 
        className={`w-full flex-1 relative ${
          sensorMode === 'FLIR_WHITE_HOT' ? 'invert contrast-125' :
          sensorMode === 'NVG_GREEN' ? 'hue-rotate-90 saturate-200' : ''
        }`}
      />

      {/* Tactical HUD Overlay (Gimbal Crosshairs, Latency Stutter, Coordinates) */}
      {showHUD && (
        <div className="absolute inset-0 pointer-events-none z-10 p-4 flex flex-col justify-between">
          
          {/* Top Telemetry Strip */}
          <div className="flex justify-between items-start pt-12 text-xs">
            <div className="bg-slate-900/80 backdrop-blur-xs text-white p-2.5 rounded-lg border border-slate-700 space-y-1 shadow-md">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="font-bold font-mono text-[11px] text-sky-400">ONEARC SYNTHETIC TERRAIN ENGINE v4.2</span>
              </div>
              <div className="text-[10px] text-slate-300 font-mono">
                MGRS: <strong className="text-white">38SMB 4421 9812</strong> • ELEV: <strong className="text-white">1,420m MSL</strong>
              </div>
              <div className="text-[10px] text-slate-300 font-mono">
                FOV: <strong className="text-emerald-300">42.5° HFOV</strong> • AZIMUTH: <strong className="text-amber-300">247° SW</strong>
              </div>
            </div>

            {/* Degraded Comms Warning Overlay */}
            {isAirDelayed && (
              <div className="bg-amber-500/90 text-slate-950 font-bold px-3 py-1.5 rounded-lg border border-amber-300 shadow-lg flex items-center space-x-2 animate-bounce">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-xs">UAV SENSOR UPLINK: 45s LATENCY BUFFER ACTIVE</span>
              </div>
            )}
          </div>

          {/* Center Tactical Crosshair */}
          <div className="self-center flex flex-col items-center justify-center text-sky-600/70">
            <Crosshair className="w-16 h-16 stroke-[1.2] animate-pulse" />
            <span className="text-[10px] font-mono bg-white/80 px-2 py-0.5 rounded border border-sky-300 text-sky-800 font-bold mt-1">
              GIMBAL LOCK: {selectedTarget || 'MERIDIAN SECTOR'}
            </span>
          </div>

          {/* Bottom Telemetry Bar */}
          <div className="flex justify-between items-end pb-1 text-xs">
            <div className="bg-white/90 backdrop-blur-xs border border-slate-200 p-2 rounded-lg shadow-xs space-y-0.5 text-[11px] text-slate-700">
              <div>Domain: <strong className="text-slate-900">Land & Air Synthetic Link</strong></div>
              <div>Telemetry Feed: <strong className="text-sky-700 font-semibold">{perspective.replace('_', ' ')}</strong></div>
            </div>

            <div className="bg-white/90 backdrop-blur-xs border border-slate-200 p-2 rounded-lg shadow-xs flex items-center space-x-3 text-[11px]">
              <button
                onClick={() => setIsSimPlaying(!isSimPlaying)}
                className="pointer-events-auto px-2.5 py-1 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded flex items-center space-x-1 shadow-xs"
              >
                {isSimPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 fill-current" />}
                <span>{isSimPlaying ? 'Pause Orbit' : 'Resume Orbit'}</span>
              </button>

              <button
                onClick={() => setZoomLevel(1)}
                className="pointer-events-auto px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded border border-slate-300 font-medium"
              >
                Reset View
              </button>
            </div>
          </div>

        </div>
      )}

      {/* Footer Info Bar */}
      <div className="px-4 py-2 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between text-xs text-slate-600 font-mono">
        <div className="flex items-center space-x-3">
          <span className="flex items-center space-x-1">
            <MapPin className="w-3.5 h-3.5 text-sky-600" />
            <span>Target: <strong className="text-slate-900">{selectedTarget}</strong></span>
          </span>
          <span>•</span>
          <span>Grid Contours: <strong className="text-emerald-700">10m Topography</strong></span>
        </div>

        <div className="flex items-center space-x-3">
          <span>Uncertainty: <strong className="text-amber-700">{uncertaintyMetrics.score}/100</strong></span>
          <span>Info Debt: <strong className="text-amber-700">{informationDebt.current} pts</strong></span>
        </div>
      </div>

    </div>
  );
};
