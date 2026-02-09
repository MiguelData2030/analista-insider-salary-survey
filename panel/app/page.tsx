'use client';

import React, { useEffect, useState, useMemo } from 'react';
import {
  Users, DollarSign, Briefcase, TrendingUp, Info, List,
  Database, ShieldAlert, Rocket, GraduationCap, Clock,
  ArrowRightLeft, FileText, Settings, HeartPulse, PieChart as PieIcon,
  CheckCircle2, AlertCircle, Terminal, BookOpen, Map as MapIcon, Globe, City
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
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    whileHover={{ scale: 1.02 }}
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
    className={`flex items-center gap-2 px-8 py-4 rounded-xl text-sm font-bold transition-all duration-300 ${active ? 'bg-[#3b82f6] text-white shadow-xl shadow-blue-500/30 -translate-y-1' : 'bg-white/5 text-[#737373] hover:bg-white/10 hover:text-white'
      }`}
  >
    <Icon size={18} />
    {label}
  </button>
);

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border-2 border-blue-500 p-4 rounded-xl shadow-[0_0_20px_rgba(59,130,246,0.3)]">
        <p className="text-black font-black mb-2 text-xs uppercase tracking-widest">{label || 'Detalle'}</p>
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
        name: name.length > 20 ? name.substring(0, 18) + '..' : name,
        value: Math.round(stat.sum / stat.count)
      }))
      .sort((a, b) => b.value - a.value).slice(0, 10);

    // 3. Educación
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

    // 4. Género
    const genStats: Record<string, number> = {};
    data.forEach(x => {
      const g = x.genero || "No indica";
      genStats[g] = (genStats[g] || 0) + 1;
    });
    const genderData = Object.entries(genStats)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value).slice(0, 5);

    // 5. Scatter Data
    const scatter = data.slice(0, 600).map(x => ({
      exp: parseInt(x.exp_total) || 0,
      salary: Math.round(x.ingresos_totales_cop / 1e6),
      industry: x.industria
    }));

    // 6. PRO: Geografía (Países)
    const countryMap: Record<string, { sum: number, count: number }> = {};
    data.forEach(x => {
      const p = x.pais_limpio || "Otros";
      if (!countryMap[p]) countryMap[p] = { sum: 0, count: 0 };
      countryMap[p].sum += x.ingresos_totales_cop;
      countryMap[p].count += 1;
    });
    const countryData = Object.entries(countryMap)
      .map(([name, stat]) => ({ name, value: Math.round((stat.sum / stat.count) / 1e6), count: stat.count }))
      .sort((a, b) => b.value - a.value).slice(0, 8);

    // 7. PRO: Geografía (Ciudades)
    const cityMap: Record<string, { sum: number, count: number }> = {};
    data.forEach(x => {
      const c = x.ciudad_limpia || "Otros";
      if (c === "Unknown") return;
      if (!cityMap[c]) cityMap[c] = { sum: 0, count: 0 };
      cityMap[c].sum += x.ingresos_totales_cop;
      cityMap[c].count += 1;
    });
    const cityData = Object.entries(cityMap)
      .map(([name, stat]) => ({ name, value: Math.round((stat.sum / stat.count) / 1e6) }))
      .sort((a, b) => b.value - a.value).slice(0, 8);

    return {
      stats: { total, avgSalary: avg / 1e6, topIndustry: industries[0]?.name || 'N/A' },
      industries,
      educationData,
      genderData,
      scatter,
      countryData,
      cityData
    };
  }, [data]);

  if (!aggregated) return <div className="h-screen flex items-center justify-center text-blue-500 font-black animate-pulse text-2xl tracking-[0.5em]">GEOLOCALIZANDO TALENTO v3.3...</div>;

  const COLORS = ['#3b82f6', '#2563eb', '#1d4ed8', '#1e40af', '#172554', '#0f172a'];

  return (
    <main className="min-h-screen p-8 max-w-7xl mx-auto space-y-12 bg-[#050505] text-white">
      {/* Header Estilizado */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-white/[0.02] p-8 rounded-3xl border border-white/5"
      >
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping"></div>
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-400">Plataforma de Inteligencia Salarial</span>
          </div>
          <h1 className="text-5xl font-black tracking-tighter">Analista Insider <span className="text-blue-600">v3.3</span></h1>
          <p className="text-[#737373] mt-2 font-medium">Visualización de Datos Estratégicos | Architecture: Medallion Gold</p>
        </div>
        <div className="flex gap-3 bg-black/40 p-1.5 rounded-2xl border border-white/5">
          <TabButton active={activeTab === 'dashboard'} label="Panel de Analítica" icon={TrendingUp} onClick={() => setActiveTab('dashboard')} />
          <TabButton active={activeTab === 'documentation'} label="Centro de Conocimiento" icon={Database} onClick={() => setActiveTab('documentation')} />
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {activeTab === 'dashboard' ? (
          <motion.div key="dash" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-12">
            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <KpiCard title="Muestra Total" value={aggregated.stats.total.toLocaleString()} icon={Users} description="Registros depurados" />
              <KpiCard title="Retribución Media" value={`$${aggregated.stats.avgSalary.toFixed(1)}M`} icon={DollarSign} description="Ingreso Anual (M COP)" />
              <KpiCard title="Sector Lider" value={aggregated.stats.topIndustry} icon={HeartPulse} description="Basado en promedio" />
              <KpiCard title="Referencia TRM" value="$3,670.20" icon={ArrowRightLeft} description="Factor Estático USD/COP" />
            </div>

            {/* Grid Principal (4 Gráficas Consolidadas) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* G1: Industrias */}
              <div className="glass-card p-8 space-y-6">
                <h3 className="font-black text-xl flex items-center gap-2 tracking-tighter italic border-b border-white/5 pb-4"><Briefcase className="text-blue-500" /> Sectores de Alto Impacto</h3>
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={aggregated.industries} layout="vertical">
                      <CartesianGrid strokeDasharray="5 5" stroke="#1a1a1a" vertical={false} />
                      <XAxis type="number" hide />
                      <YAxis dataKey="name" type="category" stroke="#737373" fontSize={11} width={100} />
                      <Tooltip content={<CustomTooltip />} cursor={{ fill: 'white', fillOpacity: 0.05 }} />
                      <Bar dataKey="value" fill="#3b82f6" radius={[0, 10, 10, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* G2: Hallazgo Experiencia (Fix contraste Tooltip aplicado) */}
              <div className="glass-card p-8 space-y-6">
                <h3 className="font-black text-xl flex items-center gap-2 tracking-tighter italic border-b border-white/5 pb-4"><Clock className="text-blue-500" /> Hallazgo: Trayectoria v Ingresos</h3>
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart>
                      <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                      <XAxis type="number" dataKey="exp" name="Experiencia" unit=" años" stroke="#737373" fontSize={11} />
                      <YAxis type="number" dataKey="salary" name="Salario" unit=" M" stroke="#737373" fontSize={11} />
                      <Tooltip content={<CustomTooltip />} />
                      <Scatter data={aggregated.scatter} fill="#3b82f6" fillOpacity={0.4} />
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* G3: Educación */}
              <div className="glass-card p-8 space-y-6">
                <h3 className="font-black text-xl flex items-center gap-2 tracking-tighter italic border-b border-white/5 pb-4"><GraduationCap className="text-blue-500" /> Segmentación por Nivel Educativo</h3>
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={aggregated.educationData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                      <XAxis dataKey="name" stroke="#a3a3a3" fontSize={10} />
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

              {/* G4: Género */}
              <div className="glass-card p-8 space-y-6">
                <h3 className="font-black text-xl flex items-center gap-2 tracking-tighter italic border-b border-white/5 pb-4"><PieIcon className="text-blue-500" /> Composición del Mercado</h3>
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={aggregated.genderData}
                        innerRadius={70}
                        outerRadius={100}
                        paddingAngle={8}
                        dataKey="value"
                      >
                        {aggregated.genderData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* MÓDULO 2: GEOGRAFÍA ESTRATÉGICA (NIVEL SUPERIOR) */}
            <motion.section
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-blue-600/5 p-12 rounded-[50px] border border-blue-500/20 space-y-12"
            >
              <div className="flex flex-col md:flex-row justify-between items-center gap-6 border-b border-white/5 pb-8">
                <div>
                  <h2 className="text-4xl font-black flex items-center gap-4 italic tracking-tighter uppercase"><Globe className="text-blue-500 animate-pulse" /> Geografía del Talento Global</h2>
                  <p className="text-[#a3a3a3] mt-2 font-mono text-xs">Análisis Territorial Pro: Distribución de Riqueza por Mercados Líderes</p>
                </div>
                <div className="flex bg-black/40 px-6 py-3 rounded-2xl border border-white/5 gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-[10px] font-black uppercase tracking-widest">Live Engine v3.3</span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Mapa de Calor: Países */}
                <div className="lg:col-span-2 space-y-6">
                  <h4 className="text-blue-400 font-black uppercase text-xs tracking-[0.3em] flex items-center gap-2"><MapIcon size={16} /> Ranking de Mercados Estratégicos</h4>
                  <div className="h-[400px] glass-card border-none bg-black/20 p-8">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={aggregated.countryData} layout="vertical" margin={{ left: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#111" horizontal={false} />
                        <XAxis type="number" hide />
                        <YAxis dataKey="name" type="category" stroke="#fff" fontSize={12} width={120} fontWeight="bold" />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="value" fill="url(#colorGeography)" radius={[0, 15, 15, 0]}>
                          <defs>
                            <linearGradient id="colorGeography" x1="0" y1="0" x2="1" y2="0">
                              <stop offset="0%" stopColor="#1e3a8a" stopOpacity={1} />
                              <stop offset="100%" stopColor="#3b82f6" stopOpacity={1} />
                            </linearGradient>
                          </defs>
                          {aggregated.countryData.map((_, index) => (
                            <Cell key={`geo-${index}`} fillOpacity={1 - index * 0.1} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Explosión por Ciudades */}
                <div className="space-y-6">
                  <h4 className="text-blue-400 font-black uppercase text-xs tracking-[0.3em] flex items-center gap-2"><City size={16} /> Explorador de Ciudades</h4>
                  <div className="space-y-3">
                    {aggregated.cityData.map((city, idx) => (
                      <motion.div
                        key={idx}
                        whileHover={{ x: 10 }}
                        className="bg-white/[0.03] p-4 rounded-xl border border-white/5 flex justify-between items-center group transition-colors hover:bg-blue-600/10 hover:border-blue-500/40"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center font-black text-xs text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-all">
                            {idx + 1}
                          </div>
                          <span className="text-sm font-bold tracking-tight text-[#a3a3a3] group-hover:text-white transition-colors">{city.name}</span>
                        </div>
                        <span className="text-xs font-mono font-black text-blue-500 group-hover:text-cyan-400 transition-colors">${city.value}M COP</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.section>
          </motion.div>
        ) : (
          <motion.div key="docs" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12 pb-20">
            <div className="bg-blue-600/10 p-12 rounded-[50px] border border-blue-500/20">
              <h2 className="text-4xl font-black mb-4 flex items-center gap-4 italic tracking-tighter"><BookOpen size={40} /> CENTRO DE CONOCIMIENTO MAESTRE</h2>
              <p className="text-[#a3a3a3] text-sm max-w-3xl leading-relaxed">
                Esta sección consolida la inteligencia técnica detrás del dashboard. Diseñada bajo la metodología **Senior Data Engineering**, garantiza la transparencia total del modelado y la replicabilidad infinita del sistema por cualquier miembro del equipo.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <section className="glass-card p-8 border-t-4 border-blue-600 space-y-4">
                <h4 className="font-black text-xs uppercase tracking-widest text-[#737373] flex items-center gap-2"><ArrowRightLeft size={16} /> Tipología Original</h4>
                <ul className="text-[10px] space-y-2 text-[#a3a3a3] font-mono">
                  <li>• EDAD: Categorical (idx 1)</li>
                  <li>• INDUSTRY: Categorical (idx 2)</li>
                  <li>• SALARY_ANUAL: Numeric (idx 5)</li>
                  <li>• CURRENCY: Categorical (idx 7)</li>
                  <li>• COUNTRY: Categorical (idx 10)</li>
                </ul>
              </section>
              <section className="glass-card p-8 border-t-4 border-blue-400 space-y-4">
                <h4 className="font-black text-xs uppercase tracking-widest text-[#737373] flex items-center gap-2"><Database size={16} /> Lógica de Modelado</h4>
                <p className="text-[10px] text-[#a3a3a3] leading-relaxed">
                  <strong>Conversión a COP:</strong> Nivelación a USD (11 divisas) + TRM Fija ($3,670.20). <br /><br />
                  <strong>Regla de Aidan:</strong> Normalización de magnitud (x1000) para registros menores a 100 USD anuales.
                </p>
              </section>
              <section className="glass-card p-8 border-t-4 border-cyan-400 space-y-4">
                <h4 className="font-black text-xs uppercase tracking-widest text-[#737373] flex items-center gap-2"><Rocket size={16} /> Mantenimiento</h4>
                <p className="text-[10px] text-[#a3a3a3] leading-relaxed">
                  1. Reemplazar `Hoja de cálculo sin título.xlsx`<br />
                  2. Correr `python origen/etl_process.py`<br />
                  3. Git Push y Vercel redespliega en automático.
                </p>
              </section>
            </div>

            <div className="glass-card p-12 space-y-8 relative overflow-hidden">
              <div className="absolute -top-10 -right-10 opacity-5">
                <Globe size={300} className="text-blue-500" />
              </div>
              <h3 className="text-2xl font-black flex items-center gap-3 italic"><ShieldAlert className="text-blue-500" /> Protocolo de Ingeniería Geoespacial</h3>
              <p className="text-[#737373] text-sm leading-relaxed max-w-3xl">
                La v3.3 introduce el **Módulo de Geografía Estratégica**. Los datos se normalizan mediante una cascada de mapeos REGEX en el pipeline Python, consolidando mercados internacionales (e.g., "u.s. of a." → "United States"). La visualización utiliza una escala de gradiente cian sobre azul para indicar densidad de riqueza territorial, permitiendo al analista identificar polos de valor económico de forma inmediata.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="flex flex-col md:flex-row justify-between items-center py-12 border-t border-white/5 text-[#444] text-[10px] font-black uppercase tracking-[0.4em] gap-4">
        <p>© 2026 Senior Data Engineering Team | Internal Research Infrastructure v3.3</p>
        <div className="flex gap-8">
          <span className="text-blue-900">Security: Encrypted</span>
          <span className="text-blue-900">Architecture: Medallion</span>
        </div>
      </footer>
    </main>
  );
}
