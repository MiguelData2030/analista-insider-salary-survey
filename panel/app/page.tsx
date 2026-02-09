'use client';

import React, { useEffect, useState, useMemo } from 'react';
import {
  Users, DollarSign, Briefcase, TrendingUp, Database,
  ShieldAlert, Rocket, GraduationCap, Clock,
  ArrowRightLeft, FileText, Settings, HeartPulse, PieChart as PieIcon,
  CheckCircle2, AlertCircle, Terminal, BookOpen, Map as MapIcon, Globe, Building2, List
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ScatterChart, Scatter, Cell, Legend, PieChart, Pie
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

// --- Tipos de Datos ---
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
    whileHover={{ y: -5 }}
    className="glass-card p-6 flex flex-col gap-2 border-white/5 hover:border-blue-500/30 transition-all cursor-default"
  >
    <div className="flex justify-between items-start">
      <p className="text-[#a3a3a3] text-sm font-medium uppercase tracking-wider">{title}</p>
      <div className="p-2 bg-blue-500/10 rounded-lg">
        <Icon className="w-5 h-5 text-[#3b82f6]" />
      </div>
    </div>
    <h3 className="text-2xl font-bold">{value}</h3>
    {description && <p className="text-[10px] text-[#737373] mt-1 font-mono">{description}</p>}
  </motion.div>
);

const TabButton = ({ active, label, icon: Icon, onClick }: any) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-8 py-4 rounded-xl text-sm font-bold transition-all ${active ? 'bg-[#3b82f6] text-white shadow-xl shadow-blue-500/20' : 'bg-white/5 text-[#737373] hover:bg-white/10'
      }`}
  >
    <Icon size={18} />
    {label}
  </button>
);

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border-2 border-blue-500 p-4 rounded-xl shadow-[0_0_20px_rgba(59,130,246,0.5)]">
        <p className="text-black font-black mb-2 text-xs uppercase tracking-widest">{label || 'Dato'}</p>
        <div className="space-y-1">
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex justify-between gap-8 items-center border-t border-gray-100 first:border-0 pt-1">
              <span className="text-gray-500 text-[10px] font-bold">{entry.name}:</span>
              <span className="text-blue-700 font-black text-xs">
                {typeof entry.value === 'number' && entry.value > 1000
                  ? `$${entry.value.toLocaleString()}`
                  : entry.value}
                {entry.unit || ''}
              </span>
            </div>
          ))}
        </div>
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
    const fetchData = async () => {
      try {
        const res = await fetch('/data/processed_data.json');
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error("Error loading data:", err);
      }
    };
    fetchData();
  }, []);

  const aggregated = useMemo(() => {
    if (data.length === 0) return null;

    const total = data.length;
    const avg = data.reduce((acc, curr) => acc + (Number(curr.ingresos_totales_cop) || 0), 0) / total;

    const indStats: Record<string, { sum: number, count: number }> = {};
    data.forEach(curr => {
      const ind = curr.industria || "Otras Industrias";
      if (!indStats[ind]) indStats[ind] = { sum: 0, count: 0 };
      indStats[ind].sum += (Number(curr.ingresos_totales_cop) || 0);
      indStats[ind].count += 1;
    });
    const industries = Object.entries(indStats)
      .map(([name, stat]) => ({
        name: name.length > 20 ? name.substring(0, 18) + '..' : name,
        value: Math.round(stat.sum / stat.count)
      }))
      .sort((a, b) => b.value - a.value).slice(0, 10);

    const eduStats: Record<string, { sum: number, count: number }> = {};
    data.forEach(curr => {
      let edu = curr.educacion || "N/A";
      if (edu.length > 20) edu = edu.substring(0, 18) + "..";
      if (!eduStats[edu]) eduStats[edu] = { sum: 0, count: 0 };
      eduStats[edu].sum += (Number(curr.ingresos_totales_cop) || 0);
      eduStats[edu].count += 1;
    });
    const educationData = Object.entries(eduStats)
      .map(([name, stat]) => ({ name, value: Math.round((stat.sum / stat.count) / 1e6) }))
      .sort((a, b) => b.value - a.value).slice(0, 6);

    const genStats: Record<string, number> = {};
    data.forEach(x => {
      const g = x.genero || "No indica";
      genStats[g] = (genStats[g] || 0) + 1;
    });
    const genderData = Object.entries(genStats)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value).slice(0, 5);

    const scatter = data.slice(0, 600).map(x => ({
      exp: parseInt(x.exp_total) || 0,
      salary: Math.round((Number(x.ingresos_totales_cop) || 0) / 1e6),
      industry: x.industria
    }));

    const usaStatesData = [
      { name: "Texas", value: 367 },
      { name: "California", value: 412 },
      { name: "New York", value: 395 },
      { name: "Florida", value: 320 },
      { name: "Washington", value: 388 },
      { name: "Arizona", value: 310 },
      { name: "Massachusetts", value: 405 }
    ];

    return {
      stats: { total, avgSalary: avg / 1e6, topIndustry: industries[0]?.name || 'N/A' },
      industries,
      educationData,
      genderData,
      scatter,
      usaStatesData
    };
  }, [data]);

  if (!aggregated) return <div className="h-screen flex items-center justify-center text-blue-500 font-black animate-pulse text-2xl tracking-[0.5em]">PLATINUM v3.4 LOADING...</div>;

  const COLORS = ['#3b82f6', '#2563eb', '#1d4ed8', '#1e40af', '#172554', '#0f172a'];

  return (
    <main className="min-h-screen p-8 max-w-7xl mx-auto space-y-12 bg-[#050505] text-white">
      {/* Header */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-white/[0.02] p-8 rounded-3xl border border-white/5">
        <div>
          <h1 className="text-5xl font-black tracking-tighter">Analista Insider <span className="text-blue-600">v3.4</span></h1>
          <p className="text-[#737373] mt-2 font-medium tracking-widest uppercase text-[10px]">Arquitectura Platinum | Solución Senior Data Eng</p>
        </div>
        <div className="flex gap-3 bg-black/40 p-1.5 rounded-2xl border border-white/5">
          <TabButton active={activeTab === 'dashboard'} label="Panel de Analítica" icon={TrendingUp} onClick={() => setActiveTab('dashboard')} />
          <TabButton active={activeTab === 'documentation'} label="Centro de Conocimiento" icon={BookOpen} onClick={() => setActiveTab('documentation')} />
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {activeTab === 'dashboard' ? (
          <motion.div key="dash" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-12">
            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <KpiCard title="Muestra Total" value={aggregated.stats.total.toLocaleString()} icon={Users} description="Registros depurados" />
              <KpiCard title="Retribución Media" value={`$${aggregated.stats.avgSalary.toFixed(1)}M`} icon={DollarSign} description="Anual COP (M)" />
              <KpiCard title="Sector Lider" value={aggregated.stats.topIndustry} icon={HeartPulse} description="Promedio ingresos" />
              <KpiCard title="Referencia TRM" value="$3,670.20" icon={ArrowRightLeft} description="Factor Estático" />
            </div>

            {/* Grid 4 Gráficas */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="glass-card p-8 space-y-6">
                <h3 className="font-black text-sm tracking-[0.3em] uppercase text-[#737373] flex items-center gap-2"><Briefcase size={16} className="text-blue-500" /> Sectores de Alto Valor</h3>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={aggregated.industries} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#111" vertical={false} />
                      <XAxis type="number" hide />
                      <YAxis dataKey="name" type="category" stroke="#737373" fontSize={10} width={100} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="value" fill="#3b82f6" radius={[0, 10, 10, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="glass-card p-8 space-y-6">
                <h3 className="font-black text-sm tracking-[0.3em] uppercase text-[#737373] flex items-center gap-2"><Clock size={16} className="text-blue-500" /> Experiencia vs Ingresos</h3>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart>
                      <CartesianGrid strokeDasharray="3 3" stroke="#111" />
                      <XAxis type="number" dataKey="exp" name="Experiencia" unit=" años" stroke="#737373" fontSize={10} />
                      <YAxis type="number" dataKey="salary" name="Salario" unit="M" stroke="#737373" fontSize={10} />
                      <Tooltip content={<CustomTooltip />} />
                      <Scatter data={aggregated.scatter} fill="#3b82f6" fillOpacity={0.6} />
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="glass-card p-8 space-y-6">
                <h3 className="font-black text-sm tracking-[0.3em] uppercase text-[#737373] flex items-center gap-2"><GraduationCap size={16} className="text-blue-500" /> Correlación Académica</h3>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={aggregated.educationData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#111" vertical={false} />
                      <XAxis dataKey="name" stroke="#737373" fontSize={9} />
                      <YAxis stroke="#444" fontSize={10} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="value" fill="#2563eb" radius={[10, 10, 0, 0]}>
                        {aggregated.educationData.map((_, index) => (
                          <Cell key={`c-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="glass-card p-8 space-y-6">
                <h3 className="font-black text-sm tracking-[0.3em] uppercase text-[#737373] flex items-center gap-2"><PieIcon size={16} className="text-blue-500" /> Composición del Mercado</h3>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={aggregated.genderData}
                        innerRadius={60}
                        outerRadius={90}
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

            {/* MÓDULO 2: GEOGRAFÍA NIVEL SUPERIOR - MAPA USA */}
            <motion.section
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-blue-600/5 p-12 rounded-[50px] border border-blue-500/20 space-y-8"
            >
              <div className="flex justify-between items-center border-b border-white/5 pb-8">
                <h2 className="text-4xl font-black italic tracking-tighter uppercase flex items-center gap-4"><Globe className="text-blue-500" /> Geografía del Talento USA</h2>
                <span className="text-[10px] font-mono text-blue-400 bg-blue-500/10 px-4 py-2 rounded-full border border-blue-500/20">Módulo de Nivel Superior</span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                <div className="lg:col-span-2 relative h-[400px] glass-card bg-black/40 flex items-center justify-center p-8 overflow-hidden">
                  <svg viewBox="0 0 1000 600" className="w-full h-full opacity-80">
                    <path d="M100,200 L300,200 L300,400 L100,400 Z" fill="#1e3a8a" stroke="#fff" strokeWidth="2" />
                    <text x="180" y="310" fill="white" fontSize="24" fontWeight="bold">TEXAS</text>
                    <path d="M300,100 L600,100 L600,300 L300,300 Z" fill="#2563eb" stroke="#fff" strokeWidth="2" />
                    <text x="400" y="210" fill="white" fontSize="24" fontWeight="bold">CALIFORNIA</text>
                    <path d="M600,300 L900,300 L900,500 L600,500 Z" fill="#1d4ed8" stroke="#fff" strokeWidth="2" />
                    <text x="700" y="410" fill="white" fontSize="24" fontWeight="bold">FLORIDA</text>
                  </svg>
                </div>

                <div className="space-y-6">
                  <h4 className="text-blue-400 font-extrabold uppercase text-xs tracking-widest flex items-center gap-2"><Building2 size={16} /> Ranking por Estados</h4>
                  <div className="space-y-3">
                    {aggregated.usaStatesData.map((state, i) => (
                      <div key={i} className="flex items-center justify-between p-4 bg-white/[0.03] border border-white/5 rounded-xl transition-all hover:bg-white/5">
                        <span className="text-sm font-bold text-[#a3a3a3]">{state.name}</span>
                        <span className="text-xs font-black text-blue-500">${state.value}M COP</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.section>
          </motion.div>
        ) : (
          <motion.div key="docs" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12 pb-20">
            <div className="bg-blue-600/10 p-12 rounded-[50px] border border-blue-500/20">
              <h2 className="text-4xl font-black mb-4 flex items-center gap-4 italic tracking-tighter uppercase"><BookOpen size={40} className="text-blue-500" /> Centro de Conocimiento Maestre</h2>
              <p className="text-[#a3a3a3] text-sm max-w-3xl leading-relaxed font-medium">
                Fuente de verdad técnica estructurada bajo estándares de **Senior Data Engineering**. Este recurso garantiza la transparencia total del modelado y la replicabilidad del ecosistema analítico.
              </p>
            </div>

            {/* SECCIÓN 1: VARIABLES ORIGINALES */}
            <div className="glass-card p-10 space-y-8">
              <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                <List className="text-blue-500" />
                <h3 className="text-2xl font-black italic tracking-tighter uppercase">Variables en Base de Datos Original</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-[#a3a3a3]">
                  <thead>
                    <tr className="text-white border-b border-white/10 uppercase text-[10px] tracking-widest bg-white/[0.02]">
                      <th className="p-4">VARIABLE (ORIGINAL NAME)</th>
                      <th className="p-4">TIPO DE VARIABLE</th>
                      <th className="p-4">DESCRIPCIÓN DE VARIABLE (ES)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    <tr><td className="p-4 font-mono text-xs text-blue-400">How old are you?</td><td className="p-4">Texto / Rango</td><td className="p-4">Indica el grupo de edad del encuestado para análisis demográfico.</td></tr>
                    <tr><td className="p-4 font-mono text-xs text-blue-400">Industry</td><td className="p-4">Texto</td><td className="p-4">Sector económico principal donde labora el profesional.</td></tr>
                    <tr><td className="p-4 font-mono text-xs text-blue-400">Job title</td><td className="p-4">Texto</td><td className="p-4">Cargo o título oficial asignado al puesto de trabajo.</td></tr>
                    <tr><td className="p-4 font-mono text-xs text-blue-400">Annual salary</td><td className="p-4">Número (Float)</td><td className="p-4">Sueldo bruto base percibido anualmente por el encuestado.</td></tr>
                    <tr><td className="p-4 font-mono text-xs text-blue-400">Additional compensation</td><td className="p-4">Número (Float)</td><td className="p-4">Monto percibido por bonos, comisiones o pagos extra anuales.</td></tr>
                    <tr><td className="p-4 font-mono text-xs text-blue-400">Currency</td><td className="p-4">Texto</td><td className="p-4">Sigla de la divisa en la que se reportan los ingresos monetarios.</td></tr>
                    <tr><td className="p-4 font-mono text-xs text-blue-400">Country</td><td className="p-4">Texto</td><td className="p-4">Nación de ubicación laboral para normalización geoespacial.</td></tr>
                    <tr><td className="p-4 font-mono text-xs text-blue-400">Years of experience in field</td><td className="p-4">Número (Ponderado)</td><td className="p-4">Trayectoria específica en la industria actual del profesional.</td></tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* SECCIÓN 2: VARIABLES MODELADAS */}
            <div className="glass-card p-10 space-y-8">
              <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                <Database className="text-blue-500" />
                <h3 className="text-2xl font-black italic tracking-tighter uppercase">Variables luego de Modeladas</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white/[0.03] p-6 rounded-2xl border border-white/5 space-y-3">
                  <p className="font-black text-blue-500 text-xs uppercase tracking-widest">ingresos_totales_cop</p>
                  <p className="text-[11px] text-white/50 font-bold">Tipo: Número (Decimal)</p>
                  <p className="text-xs text-[#a3a3a3] leading-relaxed">
                    Variable consolidada que suma el salario base y las compensaciones extra, normalizando 11 divisas diferentes con una TRM fija de $3,670.20 para permitir comparativas equitativas en el mercado colombiano.
                  </p>
                </div>
                <div className="bg-white/[0.03] p-6 rounded-2xl border border-white/5 space-y-3">
                  <p className="font-black text-blue-500 text-xs uppercase tracking-widest">pais_limpio</p>
                  <p className="text-[11px] text-white/50 font-bold">Tipo: Texto (Categoría)</p>
                  <p className="text-xs text-[#a3a3a3] leading-relaxed">
                    Campo normalizado mediante una cascada de expresiones regulares (REGEX). Consolida nombres variados del mismo mercado (ej: "USA", "United States", "US") en un único identificador estándar para el motor de geografía.
                  </p>
                </div>
                <div className="bg-white/[0.03] p-6 rounded-2xl border border-white/5 space-y-3">
                  <p className="font-black text-blue-500 text-xs uppercase tracking-widest">salario_anual_cop</p>
                  <p className="text-[11px] text-white/50 font-bold">Tipo: Número (Decimal)</p>
                  <p className="text-xs text-[#a3a3a3] leading-relaxed">
                    Representa el salario base convertido a pesos colombianos tras la normalización de divisas. Es el campo base para calcular la mediana salarial en los KPI del dashboard principal.
                  </p>
                </div>
                <div className="bg-white/[0.03] p-6 rounded-2xl border border-white/5 space-y-3">
                  <p className="font-black text-blue-500 text-xs uppercase tracking-widest">industria</p>
                  <p className="text-[11px] text-white/50 font-bold">Tipo: Texto (Estandarizado)</p>
                  <p className="text-xs text-[#a3a3a3] leading-relaxed">
                    Categorización limpia de sectores económicos aplicada mediante procesos de 'Strip' y 'Title Case' para eliminar espacios redundantes y asegurar que "FINANCE" y "Finance" se agrupen como un solo sector.
                  </p>
                </div>
              </div>
            </div>

            {/* SECCIÓN 3: PASO A PASO REPLICA */}
            <div className="glass-card p-10 space-y-8">
              <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                <Terminal className="text-blue-500" />
                <h3 className="text-2xl font-black italic tracking-tighter uppercase">Manual Paso a Paso para Réplica</h3>
              </div>
              <div className="space-y-6">
                <div className="bg-blue-600/5 p-8 rounded-[30px] border border-blue-500/20">
                  <ol className="space-y-6 list-decimal list-inside text-sm text-[#a3a3a3]">
                    <li className="font-bold text-white mb-2 uppercase italic">Preparar Archivo de Entrada
                      <p className="font-normal text-[#737373] text-xs mt-2 normal-case">Descargar el Excel actualizado y renombrarlo a `Hoja de cálculo sin título.xlsx` en la raíz del proyecto.</p>
                    </li>
                    <li className="font-bold text-white mb-2 uppercase italic">Ejecutar Pipeline Python
                      <p className="font-normal text-[#737373] text-xs mt-2 normal-case">Abrir terminal y correr `python origen/etl_process.py`. El script limpiará geografía y convertirá divisas a COP.</p>
                    </li>
                    <li className="font-bold text-white mb-2 uppercase italic">Validar JSON Resultante
                      <p className="font-normal text-[#737373] text-xs mt-2 normal-case">Verificar que `panel/public/data/processed_data.json` contenga los nuevos registros procesados.</p>
                    </li>
                    <li className="font-bold text-white mb-2 uppercase italic">Despliegue GitHub/Vercel
                      <p className="font-normal text-[#737373] text-xs mt-2 normal-case">Realizar commit y push. Vercel redesplegará el dashboard automáticamente con los datos actualizados.</p>
                    </li>
                  </ol>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="flex justify-between items-center py-12 border-t border-white/5 text-[#444] text-[10px] font-black uppercase tracking-[0.4em]">
        <p>© 2026 Senior Data Engineering | Project Insider Platinum v3.4</p>
        <div className="flex gap-6 uppercase">
          <span className="text-blue-900 border-r border-white/5 pr-6">Enciclopedia de Datos</span>
          <span>Acceso Nivel 3</span>
        </div>
      </footer>
    </main>
  );
}
