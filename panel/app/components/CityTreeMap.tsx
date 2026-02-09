'use client';

import React from 'react';
import { Treemap, ResponsiveContainer, Tooltip } from 'recharts';
import { motion } from 'framer-motion';

interface TreeMapProps {
    data: Array<{
        name: string;
        value: number;
        count: number;
        children?: any[];
    }>;
}

const COLORS = ['#1e3a8a', '#1e40af', '#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe'];

const CustomizedContent = (props: any) => {
    const { x, y, width, height, index, name, count } = props;

    return (
        <g>
            <rect
                x={x}
                y={y}
                width={width}
                height={height}
                style={{
                    fill: COLORS[index % COLORS.length],
                    stroke: '#050505',
                    strokeWidth: 3,
                    strokeOpacity: 0.8,
                }}
            />
            {width > 80 && height > 40 && (
                <text
                    x={x + width / 2}
                    y={y + height / 2 - 5}
                    textAnchor="middle"
                    fill="#fff"
                    fontSize={width > 150 ? 14 : 11}
                    fontWeight="900"
                    className="uppercase tracking-widest pointer-events-none"
                    style={{ textShadow: '0px 2px 4px rgba(0,0,0,0.8)' }}
                >
                    {name}
                </text>
            )}
            {width > 80 && height > 60 && (
                <text
                    x={x + width / 2}
                    y={y + height / 2 + 15}
                    textAnchor="middle"
                    fill="rgba(255,255,255,0.7)"
                    fontSize={9}
                    fontWeight="bold"
                    className="pointer-events-none font-mono"
                >
                    N={count} PERS
                </text>
            )}
        </g>
    );
};

const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        const d = payload[0].payload;
        return (
            <div className="bg-white border-2 border-blue-600 p-5 rounded-2xl shadow-[0_10px_30px_rgba(37,99,235,0.4)]">
                <p className="text-black font-black mb-3 text-sm uppercase tracking-[0.2em] border-b border-gray-100 pb-2">{d.name}</p>
                <div className="space-y-3">
                    <div className="flex justify-between gap-10 items-center">
                        <span className="text-gray-400 text-[10px] font-black uppercase">Ingreso Promedio:</span>
                        <span className="text-blue-700 font-black text-sm">${d.value.toLocaleString()}M COP</span>
                    </div>
                    <div className="flex justify-between gap-10 items-center">
                        <span className="text-gray-400 text-[10px] font-black uppercase">Muestra Total:</span>
                        <span className="text-gray-800 font-bold text-xs">{d.count} Profesionales</span>
                    </div>
                </div>
                <p className="text-[9px] text-blue-500 mt-4 font-bold border-t border-gray-50 pt-2 italic tracking-tight">
                    * Validez estadística nivel Senior
                </p>
            </div>
        );
    }
    return null;
};

export default function CityTreeMap({ data }: TreeMapProps) {
    return (
        <div className="w-full h-full bg-black/20 rounded-3xl overflow-hidden p-4 border border-white/5">
            <ResponsiveContainer width="100%" height="100%">
                <Treemap
                    data={data}
                    dataKey="value"
                    aspectRatio={4 / 3}
                    stroke="#fff"
                    fill="#3b82f6"
                    content={<CustomizedContent />}
                >
                    <Tooltip content={<CustomTooltip />} />
                </Treemap>
            </ResponsiveContainer>
        </div>
    );
}
