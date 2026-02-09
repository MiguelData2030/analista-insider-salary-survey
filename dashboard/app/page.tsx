'use client';

import React, { useEffect, useState } from 'react';
import { Users, DollarSign, Briefcase, TrendingUp, Download, Info } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ScatterChart, Scatter, ZAxis, Cell
} from 'recharts';
import { motion } from 'framer-motion';

// Componentes internos
interface SurveyRecord {
  edad: string;
  cargo: string;
  industria: string;
  pais_limpio: string;
  ciudad_limpia: string;
  salario_anual_cop: number;
  compensaciones_cop: number;
  ingresos_totales_cop: number;
  exp_total: string;
  exp_campo: string;
  educacion: string;
  genero: string;
}

interface IndustryData {
  name: string;
  value: number;
}

interface ScatterPoint {
  exp: number;
  salary: number;
  industry: string;
}

const KpiCard = ({ title, value, icon: Icon, description }: { title: string, value: string, icon: any, description?: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="glass-card p-6 flex flex-col gap-2"
  >
    <div className="flex justify-between items-start">
      <p className="text-[#a3a3a3] text-sm font-medium">{title}</p>
      <Icon className="w-5 h-5 text-[#3b82f6]" />
    </div>
    <h3 className="text-2xl font-bold">{value}</h3>
    {description && <p className="text-xs text-[#737373] mt-1">{description}</p>}
  </motion.div>
);

export default function Dashboard() {
  const [stats, setStats] = useState({ total: 0, avgSalary: 0, topIndustry: '' });
  const [industryData, setIndustryData] = useState<IndustryData[]>([]);
  const [scatterData, setScatterData] = useState<ScatterPoint[]>([]);

  useEffect(() => {
    fetch('/data/processed_data.json')
      .then(res => res.json())
      .then((d: SurveyRecord[]) => {
        // Calcular Estadísticas
        const total = d.length;
        if (total === 0) return;

        const avg = d.reduce((acc, curr) => acc + curr.ingresos_totales_cop, 0) / total;

        // Procesar Industrias para el gráfico
        const indMap: Record<string, number> = d.reduce((acc: Record<string, number>, curr: SurveyRecord) => {
          acc[curr.industria] = (acc[curr.industria] || 0) + curr.ingresos_totales_cop;
          return acc;
        }, {});

        const sortedIndustries = Object.entries(indMap)
          .map(([name, val]: [string, number]) => ({
            name: name.length > 20 ? name.substring(0, 20) + '...' : name,
            value: Math.round(val / d.filter(x => x.industria === name).length)
          }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 10);

        setStats({
          total,
          avgSalary: avg / 1e6, // In Millions
          topIndustry: sortedIndustries[0]?.name || 'N/A'
        });

        setIndustryData(sortedIndustries);

        // Scatter Data: Experiencia vs Salario (Muestra de 500 para rendimiento)
        setScatterData(d.slice(0, 500).map(x => ({
          exp: parseInt(x.exp_total) || 0,
          salary: Math.round(x.ingresos_totales_cop / 1e6),
          industry: x.industria
        })));
      });
  }, []);

  return (
    <main className="min-h-screen p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black gradient-text">Analista Insider</h1>
          <p className="text-muted mt-2">Ask A Manager Salary Survey 2021 | Análisis de Datos</p>
        </div>
        <div className="bg-white/5 px-4 py-2 rounded-full border border-white/10 text-xs flex items-center gap-2">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          Sistema de Analistas Activo
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KpiCard title="Total Respuestas" value={stats.total.toLocaleString()} icon={Users} description="Muestra procesada hoy" />
        <KpiCard title="Salario Promedio" value={`$${stats.avgSalary.toFixed(1)}M`} icon={DollarSign} description="Pesos Colombianos (COP)" />
        <KpiCard title="Industria Top" value={stats.topIndustry} icon={TrendingUp} description="Mayor promedio salarial" />
        <KpiCard title="TRM Aplicada" value="$3,670.20" icon={Briefcase} description="USD -> COP (Hoy)" />
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Industry Chart */}
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-lg">Top 10 Industrias por Ingreso</h3>
            <div className="px-2 py-0.5 bg-accent/20 text-accent text-[10px] rounded uppercase font-bold">Promedio COP</div>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={industryData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" stroke="#737373" fontSize={10} width={120} />
                <Tooltip
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  contentStyle={{ backgroundColor: '#141414', border: '1px solid #333' }}
                />
                <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Scatter Chart */}
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-lg">Experiencia vs Salario</h3>
            <div className="px-2 py-0.5 bg-accent/20 text-accent text-[10px] rounded uppercase font-bold">Insights</div>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                <XAxis type="number" dataKey="exp" name="Experiencia" unit=" años" stroke="#737373" />
                <YAxis type="number" dataKey="salary" name="Salario" unit="M" stroke="#737373" />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                <Scatter data={scatterData} fill="#3b82f6" fillOpacity={0.6} />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Documentación Seccion */}
      <section className="glass-card p-8 border-t-4 border-accent">
        <div className="flex items-center gap-3 mb-6">
          <Info className="text-accent" />
          <h2 className="text-2xl font-bold">Documentación del Modelo</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-sm">
          <div className="space-y-4">
            <h4 className="font-bold text-accent uppercase tracking-wider">Variables Modeladas</h4>
            <ul className="space-y-3">
              <li className="flex justify-between border-b border-white/5 pb-2">
                <span className="font-mono">salario_anual_cop</span>
                <span className="text-muted">Float | Salario base convertido a COP</span>
              </li>
              <li className="flex justify-between border-b border-white/5 pb-2">
                <span className="font-mono">ingresos_totales_cop</span>
                <span className="text-muted">Float | Suma de base + compensaciones</span>
              </li>
              <li className="flex justify-between border-b border-white/5 pb-2">
                <span className="font-mono">pais_limpio</span>
                <span className="text-muted">String | Normalización geográfica (USA/UK/CAN)</span>
              </li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="font-bold text-accent uppercase tracking-wider">Guía de Actualización</h4>
            <div className="bg-white/5 p-4 rounded-lg space-y-2 font-mono text-xs">
              <p>1. Cargar nuevo CSV en c:\Users\usuario\Desktop\...</p>
              <p>2. Ejecutar: python src/etl_process.py</p>
              <p>3. El script genera: public/data/processed_data.json</p>
              <p>4. El Dashboard se actualiza automáticamente al buildear.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center py-8 text-muted text-xs flex flex-col gap-2">
        <p>Datos extraídos de "Ask A Manager Salary Survey 2021"</p>
        <p>Conversión realizada el 08/02/2026 usando TRM de $3,670.20 COP</p>
        <div className="flex justify-center gap-4 mt-4 grayscale opacity-50 hover:grayscale-0 transition-all">
          <img src="https://v0.dev/placeholder.svg" className="h-6" alt="Ask A Manager Logo" />
        </div>
      </footer>
    </main>
  );
}
