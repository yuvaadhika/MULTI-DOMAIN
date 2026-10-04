import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { useSimulation } from '../../simulation/simulationStore';
import { MapPin, Shield, Radio, Eye, AlertTriangle, Network, Cpu } from 'lucide-react';

export const SimulationMap: React.FC = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const { session, uncertaintyMetrics } = useSimulation();

  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return; // Prevent double-initialization

    // Fictional training grid center (Meridian Training Area)
    const map = L.map(mapContainerRef.current, {
      center: [35.1500, -117.8500],
      zoom: 12,
      zoomControl: false,
      attributionControl: false
    });

    L.control.zoom({ position: 'topright' }).addTo(map);

    // Dark-styled operational tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      className: 'c2-map-tiles'
    }).addTo(map);

    // Add Fictional Sector Polygons
    const sectorNorth = L.polygon([
      [35.1750, -117.8800],
      [35.1750, -117.8200],
      [35.1550, -117.8200],
      [35.1550, -117.8800]
    ], {
      color: '#eab308',
      weight: 1.5,
      dashArray: '4, 4',
      fillColor: '#eab308',
      fillOpacity: 0.08
    }).addTo(map);

    sectorNorth.bindTooltip('North Sector (Observation Alpha)', {
      permanent: true,
      direction: 'center',
      className: 'font-mono text-xs bg-neutral-900/90 text-yellow-300 border border-yellow-800/80 px-2 py-0.5 rounded shadow'
    });

    const sectorCentral = L.polygon([
      [35.1550, -117.8750],
      [35.1550, -117.8250],
      [35.1350, -117.8250],
      [35.1350, -117.8750]
    ], {
      color: '#06b6d4',
      weight: 1.5,
      dashArray: '3, 3',
      fillColor: '#06b6d4',
      fillOpacity: 0.06
    }).addTo(map);

    sectorCentral.bindTooltip('Central Sector (Corridor Beta)', {
      permanent: true,
      direction: 'center',
      className: 'font-mono text-xs bg-neutral-900/90 text-cyan-300 border border-cyan-800/80 px-2 py-0.5 rounded shadow'
    });

    const sectorSouth = L.polygon([
      [35.1350, -117.8700],
      [35.1350, -117.8300],
      [35.1150, -117.8300],
      [35.1150, -117.8700]
    ], {
      color: '#3b82f6',
      weight: 1.5,
      fillColor: '#3b82f6',
      fillOpacity: 0.05
    }).addTo(map);

    sectorSouth.bindTooltip('South Sector (Command Post Node)', {
      permanent: true,
      direction: 'center',
      className: 'font-mono text-xs bg-neutral-900/90 text-blue-300 border border-blue-800/80 px-2 py-0.5 rounded shadow'
    });

    // Custom abstract simulation HTML markers
    const createAbstractIcon = (label: string, symbol: string, colorClass: string) => {
      return L.divIcon({
        className: 'custom-c2-icon',
        html: `
          <div class="flex flex-col items-center group cursor-pointer" style="transform: translate(-50%, -50%);">
            <div class="w-6 h-6 rounded-sm ${colorClass} border flex items-center justify-center shadow font-mono text-[10px] font-bold">
              ${symbol}
            </div>
            <div class="mt-0.5 text-[9px] font-mono font-semibold px-1.5 py-0.5 bg-white text-slate-800 border border-slate-300 rounded shadow-xs whitespace-nowrap">
              ${label}
            </div>
          </div>
        `,
        iconSize: [24, 24]
      });
    };

    // HQ ALPHA Command Node
    L.marker([35.1250, -117.8500], {
      icon: createAbstractIcon('HQ ALPHA', 'C2', 'bg-sky-100 text-sky-800 border-sky-300')
    }).bindPopup(`
      <div class="font-mono text-xs p-1 space-y-1">
        <div class="font-bold text-sky-700">Command Post Node Alpha</div>
        <div class="text-[11px] text-slate-700">Stationary Sub-Unit Command Center</div>
        <div class="text-[10px] text-slate-500">Grid: Meridian-South (35.125° N, 117.850° W)</div>
        <div class="text-[10px] text-emerald-700 font-semibold">Status: Command Net Operational</div>
      </div>
    `).addTo(map);

    // Ground Recon Scout Alpha-2
    L.marker([35.1680, -117.8550], {
      icon: createAbstractIcon('RECON-2', 'GRD', 'bg-emerald-100 text-emerald-800 border-emerald-300')
    }).bindPopup(`
      <div class="font-mono text-xs p-1 space-y-1">
        <div class="font-bold text-emerald-700">Ground Recon Scout Alpha-2</div>
        <div class="text-[11px] text-slate-700">Observation Post: North Sector Access</div>
        <div class="text-[10px] text-slate-500">Visual coverage: Waypoint Echo corridor</div>
        <div class="text-[10px] text-amber-700 font-semibold">Status: Direct VHF link active</div>
      </div>
    `).addTo(map);

    // Aerial Surveillance Flight Air-04
    L.marker([35.1620, -117.8200], {
      icon: createAbstractIcon('AIR-04', 'AIR', 'bg-sky-100 text-sky-800 border-sky-300')
    }).bindPopup(`
      <div class="font-mono text-xs p-1 space-y-1">
        <div class="font-bold text-sky-700">Aerial Surveillance Flight 04</div>
        <div class="text-[11px] text-slate-700">Sensor Pod: High-Resolution EO/IR</div>
        <div class="text-[10px] text-amber-700 font-semibold">Downlink: Variable latency buffer active</div>
      </div>
    `).addTo(map);

    // Autonomous Sensor Array S-4
    L.marker([35.1450, -117.8600], {
      icon: createAbstractIcon('SENS-S4', 'S-4', 'bg-amber-100 text-amber-800 border-amber-300')
    }).bindPopup(`
      <div class="font-mono text-xs p-1 space-y-1">
        <div class="font-bold text-amber-700">Autonomous Sensor Array S-4</div>
        <div class="text-[11px] text-slate-700">Acoustic & Ground Micro-Seismic Array</div>
        <div class="text-[10px] text-emerald-700 font-semibold">Telemetry: Continuous packet stream</div>
      </div>
    `).addTo(map);

    // Tactical Relay Node 7
    L.marker([35.1550, -117.8050], {
      icon: createAbstractIcon('RELAY-7', 'EW', 'bg-purple-100 text-purple-800 border-purple-300')
    }).bindPopup(`
      <div class="font-mono text-xs p-1 space-y-1">
        <div class="font-bold text-purple-700">Tactical Relay Node 7</div>
        <div class="text-[11px] text-slate-700">Auxiliary Spectrum Routing Gateway</div>
        <div class="text-[10px] text-emerald-700 font-semibold">Status: Standby link active</div>
      </div>
    `).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  return (
    <div className="relative w-full h-full min-h-[380px] bg-white overflow-hidden border border-slate-200 rounded-xl shadow-xs">
      {/* Map Canvas */}
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Floating Situational Overlay Controls */}
      <div className="absolute top-3 left-3 z-10 flex flex-col space-y-2 pointer-events-auto">
        <div className="bg-white/95 border border-slate-200 px-3 py-2 rounded-lg shadow-sm font-mono text-xs backdrop-blur space-y-1.5">
          <div className="flex items-center space-x-2 text-slate-800 font-semibold border-b border-slate-100 pb-1">
            <Shield className="w-3.5 h-3.5 text-sky-600" />
            <span>Meridian Training Area Grid</span>
          </div>
          <div className="flex items-center space-x-3 text-[10px] text-slate-600">
            <span className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span>North Sector</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-sky-500" />
              <span>Central Sector</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-500" />
              <span>South Sector</span>
            </span>
          </div>
        </div>

        {/* Conflict Warning Badge */}
        {uncertaintyMetrics.conflictingReports > 0 && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 px-3 py-1.5 rounded-lg shadow-sm font-mono text-xs flex items-center space-x-2">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            <span>North Sector: Contradictory Intelligence</span>
          </div>
        )}
      </div>

      {/* Bottom Map Status Ticker */}
      <div className="absolute bottom-2 left-3 right-3 z-10 pointer-events-none flex flex-wrap items-center justify-between gap-2">
        <div className="bg-white/95 border border-slate-200 px-2.5 py-1 rounded-md text-[10px] font-mono text-slate-700 shadow-xs backdrop-blur pointer-events-auto">
          Abstract Entities Active: <span className="text-slate-900 font-bold">5 Nodes</span> | Reference Grid: <span className="text-sky-700 font-bold">MERIDIAN-T7</span>
        </div>
        <div className="bg-white/95 border border-slate-200 px-2 py-0.5 rounded-md text-[10px] font-mono text-slate-500 shadow-xs pointer-events-auto">
          Synthetic Fictional Training Bounds
        </div>
      </div>
    </div>
  );
};
