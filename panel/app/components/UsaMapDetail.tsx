'use client';

import React from 'react';
import { motion } from 'framer-motion';

// Mock de rutas simplificadas para los principales estados industriales (para peso visual)
// En producción se usaría un JSON completo de topojson, aquí implementamos los clave solicitados.
const STATE_PATHS: Record<string, string> = {
    TX: "M200,350 L250,330 L320,330 L320,450 L250,500 L180,480 L180,400 Z",
    CA: "M50,150 L100,100 L130,100 L150,450 L100,500 L50,450 Z",
    FL: "M750,450 L850,450 L860,550 L800,580 L780,500 Z",
    NY: "M800,100 L850,80 L880,100 L870,150 L820,160 Z",
    WA: "M80,30 L180,30 L170,100 L80,100 Z",
    AZ: "M150,300 L200,300 L200,400 L150,400 Z",
    MA: "M880,110 L920,110 L920,140 L880,140 Z",
    IL: "M550,200 L600,200 L600,300 L550,300 Z",
    PA: "M750,150 L820,150 L820,200 L750,200 Z",
    GA: "M750,380 L820,380 L820,450 L750,450 Z"
};

const STATE_NAMES: Record<string, string> = {
    TX: "Texas", CA: "California", FL: "Florida", NY: "Nueva York", WA: "Washington",
    AZ: "Arizona", MA: "Massachusetts", IL: "Illinois", PA: "Pensilvania", GA: "Georgia"
};

interface MapProps {
    data: Record<string, number>;
}

export default function UsaMapDetail({ data }: MapProps) {
    // Calculamos el radio máximo para las burbujas basado en los valores
    const maxVal = Math.max(...Object.values(data));

    return (
        <div className="relative w-full h-full bg-black/20 rounded-3xl overflow-hidden group">
            <svg viewBox="0 0 1000 600" className="w-full h-full opacity-90 transition-opacity group-hover:opacity-100">
                <defs>
                    <filter id="glow">
                        <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                {/* Fondo decorativo de EE.UU. (Contorno general) */}
                <path
                    d="M50,100 L900,100 L950,500 L100,550 Z"
                    fill="rgba(255,255,255,0.02)"
                    stroke="rgba(255,255,255,0.05)"
                    strokeWidth="2"
                />

                {/* Estados con Hovers */}
                {Object.entries(STATE_PATHS).map(([code, d]) => (
                    <motion.path
                        key={code}
                        d={d}
                        initial={{ fill: "rgba(59, 130, 246, 0.1)" }}
                        whileHover={{ fill: "rgba(59, 130, 246, 0.3)", stroke: "#3b82f6" }}
                        stroke="rgba(255,255,255,0.1)"
                        strokeWidth="1"
                        className="cursor-pointer transition-all duration-300"
                    />
                ))}

                {/* Burbujas de Calor (Bubbles) */}
                {Object.entries(data).map(([code, val]) => {
                    // Calculamos posición central aproximada basada en el path manual
                    // TX: 250,400 | CA: 100,300 | FL: 800,500 | NY: 840,120...
                    const positions: Record<string, [number, number]> = {
                        TX: [250, 390], CA: [100, 300], FL: [810, 510], NY: [840, 120],
                        WA: [130, 65], AZ: [175, 350], MA: [900, 125], IL: [575, 250],
                        PA: [785, 175], GA: [785, 415]
                    };

                    const pos = positions[code] || [500, 300];
                    const radius = (val / maxVal) * 35;

                    return (
                        <g key={`bubble-${code}`} className="pointer-events-none">
                            <motion.circle
                                cx={pos[0]}
                                cy={pos[1]}
                                initial={{ r: 0 }}
                                animate={{ r: radius }}
                                fill="url(#gradBubble)"
                                filter="url(#glow)"
                                opacity={0.8}
                            />
                            <defs>
                                <radialGradient id="gradBubble">
                                    <stop offset="0%" stopColor="#60a5fa" />
                                    <stop offset="100%" stopColor="#1e40af" />
                                </radialGradient>
                            </defs>
                            <text
                                x={pos[0]}
                                y={pos[1] + radius + 15}
                                fill="white"
                                fontSize="10"
                                fontWeight="black"
                                textAnchor="middle"
                                className="uppercase tracking-tighter"
                                style={{ textShadow: "0 0 5px black" }}
                            >
                                {STATE_NAMES[code]}
                            </text>
                            <text
                                x={pos[0]}
                                y={pos[1] + 4}
                                fill="white"
                                fontSize="8"
                                fontWeight="bold"
                                textAnchor="middle"
                            >
                                ${val}M
                            </text>
                        </g>
                    );
                })}

                <text x="20" y="580" fill="#444" fontSize="10" fontStyle="italic">Internal Intelligence Engine v3.5 | Geospatial Layer</text>
            </svg>

            {/* Legend Heatmap */}
            <div className="absolute bottom-6 right-6 flex items-center gap-3 bg-black/40 p-3 rounded-full border border-white/5 backdrop-blur-xl">
                <span className="text-[8px] text-[#737373] uppercase font-bold tracking-widest">Intensidad:</span>
                <div className="flex gap-1 h-2">
                    {[0.2, 0.4, 0.6, 0.8, 1].map(o => (
                        <div key={o} className="w-4 bg-blue-500 rounded-sm" style={{ opacity: o }}></div>
                    ))}
                </div>
            </div>
        </div>
    );
}
