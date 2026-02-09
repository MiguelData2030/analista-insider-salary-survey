'use client';

import React, { useEffect, useState, useMemo } from 'react';
import {
  Users, DollarSign, Briefcase, TrendingUp, Info, List,
  Database, ShieldAlert, Rocket, GraduationCap, Clock,
  ArrowRightLeft, FileText, Settings, HeartPulse, PieChart as PieIcon
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ScatterChart, Scatter, Cell, Legend, PieChart, Pie
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

// --- Tipos ---
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

// --- Componentes UI ---
const KpiCard = ({ title, value, icon: Icon, description }: { title: string, value: string, icon: any, description?: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="glass-card p-6 flex flex-col gap-2 border-white/5 hover:border-blue-500/30 transition-all cursor-default"
  >
    <div className="flex justify-between items-start">
      <p className="text-[#a3a3a3] text-sm font-medium uppercase tracking-wider">{title}</p>
      <Icon className="w-5 h-5 text-[#3b82f6]" />
    </div>
    <h3 className="text-2xl font-bold">{value}</h3>
    {description && <p className="text-[10px] text-[#737373] mt-1 font-mono">{description}</p>}
  </motion.div>
);

const TabButton = ({ active, label, icon: Icon, onClick }: any) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold transition-all ${active ? 'bg-[#3b82f6] text-white shadow-lg shadow-blue-500/20' : 'bg-white/5 text-[#737373] hover:bg-white/10'
      }`}
  >
    <Icon size={18} />
    {label}
  </button>
);

// Tooltip de Alto Contraste (Fix Solicitado)
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border-2 border-blue-500 p-3 rounded-lg shadow-[0_0_20px_rgba(59,130,246,0.5)]">
        <p className="text-black font-black mb-1 text-xs uppercase tracking-tighter">{label || 'Dato'}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex justify-between gap-4 items-center">
            <span className="text-gray-600 text-[10px] font-bold">{entry.name}:</span>
            <span className="text-blue-700 font-black text-xs">
              {typeof entry.value === 'number' && entry.value > 1000
                ? `$${entry.value.toLocaleString()}`
                : entry.value}
              {entry.unit || ''}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

// --- Componente Principal ---
export default function Dashboard() {
  const [data, setData] = useState<SurveyRecord[]>([]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'documentation'>('dashboard');

  useEffect(() => {
    fetch('/data/processed_data.json')
      .then(res => res.json())
      .then((d: SurveyRecord[]) => setData(d))
      .catch(err => console.error("Error loading data:", err));
  }, []);

  const aggregated = useMemo(() => {
    if (data.length === 0) return null;

    // 1. Estadísticas
    const total = data.length;
    const avg = data.reduce((acc, curr) => acc + curr.ingresos_totales_cop, 0) / total;

    // 2. Industrias Top
    const indStats: Record<string, { sum: number, count: number }> = {};
    data.forEach(curr => {
      const ind = curr.industria || "Otras Industrias";
      if (!indStats[ind]) indStats[ind] = { sum: 0, count: 0 };
      indStats[ind].sum += curr.ingresos_totales_cop;
      indStats[ind].count += 1;
    });
    const industries = Object.entries(indStats)
      .map(([name, stat]) => ({
        name: name.length > 15 ? name.substring(0, 15) + '...' : name,
        value: Math.round(stat.sum / stat.count)
      }))
      .sort((a, b) => b.value - a.value).slice(0, 10);

    // 3. Educación (Nueva Visualización)
    const eduStats: Record<string, { sum: number, count: number }> = {};
    data.forEach(curr => {
      let edu = curr.educacion || "N/A";
      if (edu.length > 20) edu = edu.substring(0, 18) + "..";
      if (!eduStats[edu]) eduStats[edu] = { sum: 0, count: 0 };
      eduStats[edu].sum += curr.ingresos_totales_cop;
      eduStats[edu].count += 1;
    });
    const educationData = Object.entries(eduStats)
      .map(([name, stat]) => ({ name, value: Math.round((stat.sum / stat.count) / 1e6) }))
      .sort((a, b) => b.value - a.value).slice(0, 6);

    // 4. Género (Nueva Visualización Pie)
    const genStats: Record<string, number> = {};
    data.forEach(x => {
      const g = x.genero || "No indica";
      genStats[g] = (genStats[g] || 0) + 1;
    });
    const genderData = Object.entries(genStats)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value).slice(0, 5);

    // 5. Scatter Data
    const scatter = data.slice(0, 500).map(x => ({
      exp: parseInt(x.exp_total) || 0,
      salary: Math.round(x.ingresos_totales_cop / 1e6),
      industry: x.industria
    }));

    return {
      stats: { total, avgSalary: avg / 1e6, topIndustry: industries[0]?.name || 'N/A' },
      industries,
      educationData,
      genderData,
      scatter
    };
  }, [data]);

  if (!aggregated) return <div className="h-screen flex items-center justify-center text-blue-500 font-mono">Cargando Inteligencia v3.1...</div>;

  const COLORS = ['#3b82f6', '#2563eb', '#1d4ed8', '#1e40af', '#172554', '#0f172a'];

  return (
    <main className="min-h-screen p-8 max-w-7xl mx-auto space-y-8 bg-[#0a0a0a] text-white">
      {/* Header Consolidado */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-white/5 pb-8">
        <div>
          <h1 className="text-4xl font-black gradient-text">Analista Insider v3.1</h1>
          <p className="text-[#a3a3a3] mt-2 font-medium">Consolidación Analítica | Medallion Data Architecture</p>
        </div>
        <div className="flex gap-2">
          <TabButton active={activeTab === 'dashboard'} label="Panel Analítico" icon={TrendingUp} onClick={() => setActiveTab('dashboard')} />
          <TabButton active={activeTab === 'documentation'} label="Centro de Conocimiento" icon={Database} onClick={() => setActiveTab('documentation')} />
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'dashboard' ? (
          <motion.div key="dash" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-8">
            {/* 4 KPIs Originales */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <KpiCard title="Muestra Total" value={aggregated.stats.total.toLocaleString()} icon={Users} description="Registros limpios" />
              <KpiCard title="Ingreso Medio" value={`$${aggregated.stats.avgSalary.toFixed(1)}M`} icon={DollarSign} description="Anual COP (M)" />
              <KpiCard title="Industria Top" value={aggregated.stats.topIndustry} icon={Briefcase} description="Mayor promedio salarial" />
              <KpiCard title="Referencia TRM" value="$3,670.20" icon={ArrowRightLeft} description="USD/COP Fijo" />
            </div>

            {/* Grid de 4 Gráficas (2 Originales + 2 Nuevas) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* G1: Industrias (Original Mejorada) */}
              <div className="glass-card p-6 space-y-4">
                <h3 className="font-bold text-sm tracking-widest text-[#737373] uppercase">Top 10 Sectores Económicos</h3>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={aggregated.industries} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                      <XAxis type="number" hide />
                      <YAxis dataKey="name" type="category" stroke="#a3a3a3" fontSize={10} width={100} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* G2: Hallazgo Experiencia (Original + Fix Tooltip) */}
              <div className="glass-card p-6 space-y-4">
                <h3 className="font-bold text-sm tracking-widest text-[#737373] uppercase">Hallazgo: Experiencia vs Ingresos</h3>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart>
                      <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                      <XAxis type="number" dataKey="exp" name="Experiencia" unit=" años" stroke="#737373" fontSize={10} />
                      <YAxis type="number" dataKey="salary" name="Salario" unit="M" stroke="#737373" fontSize={10} />
                      <Tooltip content={<CustomTooltip />} />
                      <Scatter data={aggregated.scatter} fill="#3b82f6" fillOpacity={0.5} />
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* G3: Educación (Nueva) */}
              <div className="glass-card p-6 space-y-4">
                <h3 className="font-bold text-sm tracking-widest text-[#737373] uppercase">Correlación Académica (Promedio M)</h3>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={aggregated.educationData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                      <XAxis dataKey="name" stroke="#a3a3a3" fontSize={10} />
                      <YAxis stroke="#a3a3a3" fontSize={10} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="value" fill="#2563eb">
                        {aggregated.educationData.map((_, index) => (
                          <Cell key={`c-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* G4: Género (Nueva) */}
              <div className="glass-card p-6 space-y-4">
                <h3 className="font-bold text-sm tracking-widest text-[#737373] uppercase">Distribución por Género</h3>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={aggregated.genderData}
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {aggregated.genderData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend verticalAlign="bottom" height={36} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div key="docs" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-10 space-y-12">
            <h2 className="text-3xl font-black italic border-b border-white/10 pb-4">MANUAL MAESTRO DE ANALÍTICA</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <section className="space-y-6 text-sm text-[#a3a3a3] leading-relaxed">
                <div className="flex items-center gap-2 text-white">
                  <Settings size={20} className="text-blue-500" />
                  <h4 className="font-bold uppercase tracking-widest">1. Arquitectura de Datos</h4>
                </div>
                <p>
                  Este sistema utiliza una arquitectura <strong>Medallion Lite</strong>. Los datos viajan desde una "Sourcing Zone" (Excel crudo) hasta una "Serving Zone" (JSON optimizado para React).
                </p>
                <div className="bg-white/5 p-4 rounded-lg space-y-3">
                  <p>• <strong>Normalización:</strong> Uso de RegEx para consolidar mercados (e.g., "U.S." → "United States").</p>
                  <p>• <strong>Conversión:</strong> Estandarización de divisas globales a USD y posterior cambio a COP vía TRM fija.</p>
                  <p>• <strong>Calidad (Regla Aidan):</strong> Multiplicador x1000 para valores atípicos menores a 100 USD.</p>
                </div>
              </section>

              <section className="space-y-6 text-sm text-[#a3a3a3] leading-relaxed">
                <div className="flex items-center gap-2 text-white">
                  <FileText size={20} className="text-blue-500" />
                  <h4 className="font-bold uppercase tracking-widest">2. Manual de Mantenimiento</h4>
                </div>
                <div className="space-y-4">
                  <div className="border-l-2 border-blue-500 pl-4 py-1">
                    <p className="text-white font-bold">Actualización de Datos</p>
                    <p>Coloque el Excel en la raíz y ejecute: <code>python origen/etl_process.py</code></p>
                  </div>
                  <div className="border-l-2 border-blue-500 pl-4 py-1">
                    <p className="text-white font-bold">Despliegue</p>
                    <p>Haga Push a GitHub. Vercel detectará el nuevo <code>processed_data.json</code> y publicará automáticamente.</p>
                  </div>
                  <div className="border-l-2 border-blue-500 pl-4 py-1">
                    <p className="text-white font-bold">Tipado</p>
                    <p>Las interfaces en <code>page.tsx</code> aseguran que no haya fallas de visualización por datos nulos.</p>
                  </div>
                </div>
              </section>
            </div>

            <section className="bg-blue-600/10 p-8 rounded-3xl border border-blue-500/20">
              <h4 className="font-black text-xl mb-4 flex items-center gap-2"><Rocket /> Guía de Continuidad</h4>
              <p className="text-sm text-[#737373]">
                Este proyecto ha sido diseñado para ser totalmente autónomo. En caso de vacaciones o rotación de equipo, cualquier analista con conocimientos básicos de Python puede mantener el pipeline. La lógica de negocio está encapsulada en <code>src/etl_process.py</code> y la visualización en <code>panel/app/page.tsx</code>.
              </p>
            </section>
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="text-center py-12 text-[#444] text-[10px] font-black uppercase tracking-[0.3em] border-t border-white/5">
        <p>© 2026 Senior Data Engineering Team | Internal Intelligence Framework</p>
      </footer>
    </main>
  );
}
