'use client';

import React, { useEffect, useState, useMemo } from 'react';
import {
  Users, DollarSign, Briefcase, TrendingUp, Info, List,
  Database, ShieldAlert, Rocket, GraduationCap, Clock,
  ArrowRightLeft, FileText, Settings, HeartPulse
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ScatterChart, Scatter, LineChart, Line, Legend, AreaChart, Area
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
    whileHover={{ scale: 1.02 }}
    animate={{ opacity: 1, y: 0 }}
    className="glass-card p-6 flex flex-col gap-2 border-white/5 hover:border-blue-500/30 transition-all cursor-default"
  >
    <div className="flex justify-between items-start">
      <p className="text-[#a3a3a3] text-sm font-medium uppercase tracking-wider">{title}</p>
      <div className="p-2 bg-blue-500/10 rounded-lg">
        <Icon className="w-5 h-5 text-[#3b82f6]" />
      </div>
    </div>
    <h3 className="text-3xl font-bold tracking-tight">{value}</h3>
    {description && <p className="text-[10px] text-[#737373] mt-1 font-mono">{description}</p>}
  </motion.div>
);

const TabButton = ({ active, label, icon: Icon, onClick }: any) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-8 py-4 rounded-xl text-sm font-bold transition-all duration-300 ${active ? 'bg-[#3b82f6] text-white shadow-xl shadow-blue-500/30 -translate-y-1' : 'bg-white/5 text-[#737373] hover:bg-white/10 hover:text-white'
      }`}
  >
    <Icon size={18} />
    {label}
  </button>
);

// Estilo personalizado para Tooltip (Fix: Legibilidad)
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1a1a1a] border border-blue-500/30 p-4 rounded-xl shadow-2xl backdrop-blur-xl">
        <p className="text-blue-400 font-bold mb-2 text-xs uppercase tracking-widest">{label || 'Detalle'}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex justify-between gap-8 items-baseline py-1 border-t border-white/5 first:border-0">
            <span className="text-[#a3a3a3] text-[10px]">{entry.name}:</span>
            <span className="text-white font-mono font-bold text-sm">
              {typeof entry.value === 'number' && entry.name.toLowerCase().includes('cop')
                ? `$${entry.value.toLocaleString()}`
                : entry.value}
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

  // Lógica de Datos Avanzada
  const aggregated = useMemo(() => {
    if (data.length === 0) return null;

    // 1. Estadísticas Base
    const total = data.length;
    const avg = data.reduce((acc, curr) => acc + curr.ingresos_totales_cop, 0) / total;

    // 2. Agregación de Industrias (Promedio)
    const indStats: Record<string, { sum: number, count: number }> = {};
    data.forEach(curr => {
      const ind = curr.industria || "Otras Industrias";
      if (!indStats[ind]) indStats[ind] = { sum: 0, count: 0 };
      indStats[ind].sum += curr.ingresos_totales_cop;
      indStats[ind].count += 1;
    });

    const industries = Object.entries(indStats)
      .map(([name, stat]) => ({
        full_name: name,
        name: name.length > 15 ? name.substring(0, 15) + '...' : name,
        value: Math.round(stat.sum / stat.count)
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);

    // 3. PRO: Agregación por Educación
    const eduStats: Record<string, { sum: number, count: number }> = {};
    data.forEach(curr => {
      let edu = curr.educacion || "No Especificado";
      if (edu.length > 30) edu = edu.substring(0, 30) + "...";
      if (!eduStats[edu]) eduStats[edu] = { sum: 0, count: 0 };
      eduStats[edu].sum += curr.ingresos_totales_cop;
      eduStats[edu].count += 1;
    });

    const educationData = Object.entries(eduStats)
      .map(([name, stat]) => ({ name, value: Math.round((stat.sum / stat.count) / 1e6) }))
      .sort((a, b) => b.value - a.value);

    // 4. PRO: Curva de Experiencia (Tendencia)
    const expMap: Record<number, { sum: number, count: number }> = {};
    data.forEach(x => {
      const years = parseInt(x.exp_total) || 0;
      if (years > 40) return; // Limpiar outliers de años
      if (!expMap[years]) expMap[years] = { sum: 0, count: 0 };
      expMap[years].sum += x.ingresos_totales_cop;
      expMap[years].count += 1;
    });

    const experienceTrend = Object.entries(expMap)
      .map(([years, stat]) => ({
        x: parseInt(years),
        salary: Math.round((stat.sum / stat.count) / 1e6)
      }))
      .sort((a, b) => a.x - b.x);

    return {
      stats: { total, avgSalary: avg / 1e6, topIndustry: industries[0]?.full_name || 'N/A' },
      industries,
      educationData,
      experienceTrend,
      all: data.slice(0, 800) // Muestra para el Scatter original
    };
  }, [data]);

  if (!aggregated) return <div className="h-screen flex items-center justify-center text-blue-500 font-mono animate-pulse">Invocando Inteligencia de Datos...</div>;

  return (
    <main className="min-h-screen p-8 max-w-7xl mx-auto space-y-12 bg-[#050505] text-white">
      {/* Dynamic Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-white/[0.02] p-8 rounded-3xl border border-white/5">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-ping"></div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400">Sistema Elite de Analistas</span>
          </div>
          <h1 className="text-5xl font-black tracking-tighter text-white">Analista Insider <span className="text-blue-600">v3.0</span></h1>
          <p className="text-[#737373] mt-2 font-medium">Arquitectura Medallion para Investigación Salarial Corporativa</p>
        </div>

        <div className="flex gap-3 bg-black/40 p-1.5 rounded-2xl border border-white/5">
          <TabButton active={activeTab === 'dashboard'} label="Panel Exploratorio" icon={TrendingUp} onClick={() => setActiveTab('dashboard')} />
          <TabButton active={activeTab === 'documentation'} label="Knowledge Center" icon={Database} onClick={() => setActiveTab('documentation')} />
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'dashboard' ? (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-12"
          >
            {/* KPIs Elite */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <KpiCard title="Muestra Total" value={aggregated.stats.total.toLocaleString()} icon={Users} description="Registros validos procesados" />
              <KpiCard title="Retribución Media" value={`$${aggregated.stats.avgSalary.toFixed(1)}M`} icon={DollarSign} description="COP brutos anuales" />
              <KpiCard title="Sector Lider" value={aggregated.stats.topIndustry.substring(0, 20)} icon={HeartPulse} description="Mayor media salarial" />
              <KpiCard title="Referencia TRM" value="$3,670.20" icon={ArrowRightLeft} description="USD/COP - Fijo Sistema" />
            </div>

            {/* Fila 1: Industrias y Educación */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="glass-card p-8 space-y-6">
                <div className="flex justify-between items-center border-b border-white/5 pb-4">
                  <h3 className="font-black text-xl flex items-center gap-2"><Briefcase className="text-blue-500" /> Sectores de Alto Valor</h3>
                  <span className="text-[10px] bg-blue-500/10 px-2 py-1 rounded text-blue-400 font-mono">AVG COP / AÑO</span>
                </div>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={aggregated.industries} layout="vertical">
                      <CartesianGrid strokeDasharray="5 5" stroke="#1a1a1a" vertical={false} />
                      <XAxis type="number" hide />
                      <YAxis dataKey="name" type="category" stroke="#737373" fontSize={11} width={130} />
                      <Tooltip content={<CustomTooltip />} cursor={{ fill: 'white', fillOpacity: 0.03 }} />
                      <Bar dataKey="value" fill="#2563eb" radius={[0, 10, 10, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="glass-card p-8 space-y-6">
                <div className="flex justify-between items-center border-b border-white/5 pb-4">
                  <h3 className="font-black text-xl flex items-center gap-2"><GraduationCap className="text-blue-500" /> Correlación Académica</h3>
                  <span className="text-[10px] bg-blue-500/10 px-2 py-1 rounded text-blue-400 font-mono">MILLONES COP</span>
                </div>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={aggregated.educationData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#222" horizontal={false} />
                      <XAxis dataKey="name" stroke="#737373" fontSize={9} interval={0} angle={-15} textAnchor="end" height={60} />
                      <YAxis stroke="#444" fontSize={10} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="value" fill="#3b82f6">
                        {aggregated.educationData.map((_, index) => (
                          <Cell key={`cell-${index}`} fillOpacity={1 - index * 0.12} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Fila 2: Tendencias Temporales Pro */}
            <div className="glass-card p-10 space-y-8">
              <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 border-b border-white/5 pb-6">
                <div>
                  <h3 className="font-black text-2xl flex items-center gap-2"><Clock className="text-blue-500" /> Curva de Maduración Salarial</h3>
                  <p className="text-sm text-[#737373] mt-1">Análisis longitudinal de ingresos vs años de experiencia profesional</p>
                </div>
                <div className="flex gap-4">
                  <div className="flex items-center gap-2"><div className="w-3 h-3 bg-blue-500 rounded-full"></div> <span className="text-[10px] uppercase font-bold text-[#a3a3a3]">Ingreso Medio (M)</span></div>
                </div>
              </div>
              <div className="h-[450px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={aggregated.experienceTrend} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorSalary" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="x" stroke="#737373" fontSize={12} label={{ value: 'Años de Experiencia', position: 'insideBottomRight', offset: -10, fill: '#444' }} />
                    <YAxis stroke="#444" fontSize={12} label={{ value: 'Millones COP', angle: -90, position: 'insideLeft', fill: '#444' }} />
                    <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="salary" name="Salario" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorSalary)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="documentation"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            className="space-y-8"
          >
            {/* Knowledge Navigator */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="glass-card p-8 border-l-4 border-blue-600">
                <Settings className="text-blue-500 mb-4" size={32} />
                <h4 className="font-black text-lg mb-2">Build Pipeline</h4>
                <p className="text-xs text-[#a3a3a3] leading-relaxed">
                  Framework: Next.js 15 (App Router). <br />
                  Build: `npm run build`<br />
                  Runtime: Vercel Edge.
                </p>
              </div>
              <div className="glass-card p-8 border-l-4 border-accent">
                <Database className="text-accent mb-4" size={32} />
                <h4 className="font-black text-lg mb-2">Ingeniería de Datos</h4>
                <p className="text-xs text-[#a3a3a3] leading-relaxed">
                  Sourcing: Excel Binary.<br />
                  Engine: Python + Pandas.<br />
                  Format: Geo-Compressed JSON.
                </p>
              </div>
              <div className="glass-card p-8 border-l-4 border-green-500">
                <ShieldAlert className="text-green-500 mb-4" size={32} />
                <h4 className="font-black text-lg mb-2">Data Quality</h4>
                <p className="text-xs text-[#a3a3a3] leading-relaxed">
                  Outlier Cap: 99th Percentile. <br />
                  Regla Aidan: Magnitud x1000.<br />
                  UTF-8 Solidified.
                </p>
              </div>
            </div>

            <div className="glass-card p-12 space-y-16">
              <section className="space-y-8">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-1 bg-blue-600"></div>
                  <h2 className="text-3xl font-black italic tracking-tighter">PROTOCOLO DE ARQUITECTURA TÉCNICA</h2>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                  <div className="space-y-6">
                    <h5 className="text-blue-500 font-black uppercase text-xs tracking-widest flex items-center gap-2">
                      <Rocket size={14} /> El Pipeline de Transformación
                    </h5>
                    <div className="bg-white/[0.03] p-6 rounded-2xl space-y-4 border border-white/5 text-sm leading-relaxed text-[#737373]">
                      <p>
                        Los datos se cargan vía <code className="text-white">pd.read_excel</code> utilizando indexación posicional fija para evitar fallas por cambios en los nombres de las columnas (headers) del archivo original.
                      </p>
                      <p>
                        <strong>Normalización Geoespacial:</strong> El script ejecuta una cascada de mapeos para consolidar mercados principales. Esto permite que el dashboard muestre datos agrupados por valor económico y no por variaciones de escritura.
                      </p>
                      <p>
                        <strong>Conversión en Cascada:</strong> Primero se nivelan todas las divisas internacionales a USD usando un factor de conversión global, y finalmente se aplica la TRM local de <span className="text-white font-mono">$3,670.20</span>.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h5 className="text-blue-500 font-black uppercase text-xs tracking-widest flex items-center gap-2">
                      <FileText size={14} /> Manual de Reemplazo y Vacaciones
                    </h5>
                    <div className="bg-white/[0.03] p-6 rounded-2xl space-y-4 border border-white/5 text-sm">
                      <ul className="space-y-4 text-[#a3a3a3]">
                        <li className="flex gap-3">
                          <span className="text-blue-500 font-bold font-mono">STEP_01:</span>
                          <span>Asegurarse de tener Python 3.10+ instalado con `pandas` y `openpyxl`.</span>
                        </li>
                        <li className="flex gap-3">
                          <span className="text-blue-500 font-bold font-mono">STEP_02:</span>
                          <span>Al recibir el nuevo reporte, guardarlo exactamente con el nombre `Hoja de cálculo sin título.xlsx` en la raíz del proyecto.</span>
                        </li>
                        <li className="flex gap-3">
                          <span className="text-blue-500 font-bold font-mono">STEP_03:</span>
                          <span>Ejecutar la orden: <code className="bg-black text-blue-400 px-2 py-1 rounded">python origen/etl_process.py</code>. Si ves el mensaje "ETL Completado", el archivo JSON ya está actualizado.</span>
                        </li>
                        <li className="flex gap-3">
                          <span className="text-blue-500 font-bold font-mono">STEP_04:</span>
                          <span>Hacer Git Push al repositorio. Vercel reconstruirá el sitio en 90 segundos con los datos frescos.</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </section>

              <section className="bg-blue-600/10 p-10 rounded-[40px] border border-blue-500/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-12 opacity-10 blur-xl">
                  <Rocket size={200} className="text-blue-500" />
                </div>
                <div className="relative z-10 space-y-4">
                  <h3 className="text-2xl font-black">Escalabilidad Futura</h3>
                  <p className="text-[#a3a3a3] text-sm max-w-2xl leading-relaxed">
                    Este sistema está preparado para transicionar a una base de datos real (PostgreSQL/Supabase) simplemente modificando la conexión en <code className="text-white">etl_process.py</code>. El frontend ya maneja tipos de datos estrictos, por lo que la migración sería transparente para el usuario final.
                  </p>
                </div>
              </section>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="flex flex-col md:flex-row justify-between items-center py-12 border-t border-white/5 text-[#444] text-[10px] uppercase font-black tracking-[0.2em] gap-4">
        <p>© 2026 Senior Data Engineering Team | Internal Intelligence Platform</p>
        <div className="flex gap-8">
          <a href="#" className="hover:text-blue-500 transition-colors">Security Standards</a>
          <a href="#" className="hover:text-blue-500 transition-colors">Methodology</a>
        </div>
      </footer>
    </main>
  );
}
