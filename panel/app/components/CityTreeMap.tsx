'use client';

import React from 'react';
import { Treemap, ResponsiveContainer, Tooltip } from 'recharts';
import { motion } from 'framer-motion';

interface TreeMapProps {
    data: Array<{
        name: string;
        value: number;
        children?: any[];
    }>;
}

const COLORS = ['#1e3a8a', '#1e40af', '#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe'];

const CustomizedContent = (props: any) => {
    const { x, y, width, height, index, name } = props;

    return (
        <g>
            <rect
                x={x}
                y={y}
                width={width}
                height={height}
                style={{
                    fill: COLORS[index % COLORS.length],
                    stroke: '#000',
                    strokeWidth: 2,
                    strokeOpacity: 0.1,
                }}
            />
            {width > 60 && height > 30 && (
                <text
                    x={x + width / 2}
                    y={y + height / 2}
                    textAnchor="middle"
                    fill="#fff"
                    fontSize={10}
                    fontWeight="900"
                    className="uppercase tracking-tighter"
                    style={{ pointerEvents: 'none', filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.5))' }}
                >
                    {name}
                </text>
            )}
        </g>
    );
};

const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div className="bg-white border-2 border-blue-500 p-4 rounded-xl shadow-[0_0_20px_rgba(59,130,246,0.5)]">
                <p className="text-black font-black mb-1 text-xs uppercase tracking-widest">{data.name}</p>
                <div className="flex justify-between gap-6 items-center border-t border-gray-100 pt-1">
                    <span className="text-gray-500 text-[10px] font-bold uppercase">Ingreso Promedio:</span>
                    <span className="text-blue-700 font-black text-xs">${data.value.toLocaleString()}M COP</span>
                </div>
                <p className="text-[8px] text-gray-400 mt-2 italic">* Valor proporcional en el mercado global</p>
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
