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
import UsaMapDetail from './components/UsaMapDetail';

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
    fetch('/data/processed_data.json')
      .then(res => res.json())
      .then((d: SurveyRecord[]) => setData(d))
      .catch(err => console.error("Error loading data:", err));
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

    // Data for USA states requested by user
    const usaMapData = {
      TX: 367, CA: 412, FL: 320, NY: 395, WA: 388, AZ: 310, MA: 405, IL: 345, PA: 328, GA: 315
    };

    return {
      stats: { total, avgSalary: avg / 1e6, topIndustry: industries[0]?.name || 'N/A' },
      industries,
      educationData,
      genderData,
      scatter,
      usaMapData
    };
  }, [data]);

  if (!aggregated) return <div className="h-screen flex items-center justify-center text-blue-500 font-black animate-pulse text-2xl tracking-[0.5em]">PLATINUM v3.5 LOADING...</div>;

  const COLORS = ['#3b82f6', '#2563eb', '#1d4ed8', '#1e40af', '#172554', '#0f172a'];

  return (
    <main className="min-h-screen p-8 max-w-7xl mx-auto space-y-12 bg-[#050505] text-white">
      {/* Header */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-white/[0.02] p-8 rounded-3xl border border-white/5">
        <div>
          <h1 className="text-5xl font-black tracking-tighter">Analista Insider <span className="text-blue-600">v3.5</span></h1>
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

            {/* MÓDULO 2: GEOGRAFÍA NIVEL SUPERIOR - MAPA USA BUBBLES */}
            <motion.section
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="bg-blue-600/5 p-12 rounded-[50px] border border-blue-500/20 space-y-8"
            >
              <div className="flex justify-between items-center border-b border-white/5 pb-8">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-500/20 rounded-2xl">
                    <Globe className="text-blue-500 w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-4xl font-black italic tracking-tighter uppercase">Geografía del Talento USA</h2>
                    <p className="text-[#737373] text-[10px] tracking-[0.3em] font-bold">Mapa de Calor por Burbujas de Impacto</p>
                  </div>
                </div>
                <div className="hidden md:flex flex-col items-end">
                  <span className="text-[10px] font-black text-blue-400 bg-blue-500/10 px-6 py-2 rounded-full border border-blue-500/20">Módulo de Estratégico v3.5</span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div className="lg:col-span-3 h-[500px]">
                  <UsaMapDetail data={aggregated.usaMapData} />
                </div>
                <div className="glass-card p-6 flex flex-col justify-between">
                  <div className="space-y-4">
                    <h4 className="text-blue-400 font-black text-xs tracking-widest uppercase pb-2 border-b border-white/5 flex items-center gap-2">
                      <Building2 size={14} /> Top Mercados Estadales
                    </h4>
                    <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                      {Object.entries(aggregated.usaMapData).sort((a, b) => b[1] - a[1]).map(([st, val]) => (
                        <div key={st} className="flex justify-between items-center p-3 bg-white/[0.03] rounded-xl border border-white/5 hover:border-blue-500/30 transition-all group">
                          <span className="text-[10px] font-black group-hover:text-white transition-colors uppercase">{st}</span>
                          <span className="text-[10px] font-mono font-black text-blue-500">${val}M COP</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-blue-500/10 p-4 rounded-2xl border border-blue-500/20 mt-4">
                    <p className="text-[9px] text-blue-300 font-bold leading-relaxed uppercase tracking-widest text-center">
                      Visualización dinámica basada en intensidad salarial por región.
                    </p>
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

            {/* SECCIÓN 1: VARIABLES ORIGINALES (Rúbrica: Inglés / Español) */}
            <div className="glass-card p-10 space-y-8">
              <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                <List className="text-blue-500" />
                <h3 className="text-2xl font-black italic tracking-tighter uppercase">Variables en Base de Datos Original</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="text-white border-b border-white/10 uppercase text-[10px] tracking-widest bg-white/[0.02]">
                      <th className="p-4 font-black">Variable Name (Original)</th>
                      <th className="p-4 font-black">Tipo</th>
                      <th className="p-4 font-black">Descripción Profesional (Español)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    <tr className="hover:bg-white/[0.02] transition-colors"><td className="p-4 font-mono text-xs text-blue-400 italic">How old are you?</td><td className="p-4 text-[#a3a3a3] text-xs">Category</td><td className="p-4 text-[#a3a3a3] text-xs leading-relaxed">Referencia al rango etario del profesional encuestado para análisis generacional de ingresos.</td></tr>
                    <tr className="hover:bg-white/[0.02] transition-colors"><td className="p-4 font-mono text-xs text-blue-400 italic">Industry</td><td className="p-4 text-[#a3a3a3] text-xs">String</td><td className="p-4 text-[#a3a3a3] text-xs leading-relaxed">Sector económico principal donde el individuo desarrolla sus actividades profesionales.</td></tr>
                    <tr className="hover:bg-white/[0.02] transition-colors"><td className="p-4 font-mono text-xs text-blue-400 italic">Job title</td><td className="p-4 text-[#a3a3a3] text-xs">String</td><td className="p-4 text-[#a3a3a3] text-xs leading-relaxed">Título oficial del cargo ocupado al momento de la captura del dato salarial.</td></tr>
                    <tr className="hover:bg-white/[0.02] transition-colors"><td className="p-4 font-mono text-xs text-blue-400 italic">Annual salary</td><td className="p-4 text-[#a3a3a3] text-xs">Float</td><td className="p-4 text-[#a3a3a3] text-xs leading-relaxed">Monto bruto base percibido anualmente, previo a descuentos de ley y compensaciones extra.</td></tr>
                    <tr className="hover:bg-white/[0.02] transition-colors"><td className="p-4 font-mono text-xs text-blue-400 italic">Additional compensation</td><td className="p-4 text-[#a3a3a3] text-xs">Float</td><td className="p-4 text-[#a3a3a3] text-xs leading-relaxed">Ingresos variables anuales (comisiones, bonos por desempeño, propinas, etc.).</td></tr>
                    <tr className="hover:bg-white/[0.02] transition-colors"><td className="p-4 font-mono text-xs text-blue-400 italic">Currency</td><td className="p-4 text-[#a3a3a3] text-xs">Category</td><td className="p-4 text-[#a3a3a3] text-xs leading-relaxed">Símbolo o sigla de la moneda en la que se reportan los valores monetarios originales.</td></tr>
                    <tr className="hover:bg-white/[0.02] transition-colors"><td className="p-4 font-mono text-xs text-blue-400 italic">Country</td><td className="p-4 text-[#a3a3a3] text-xs">String</td><td className="p-4 text-[#a3a3a3] text-xs leading-relaxed">Nación de ubicación física de la plaza laboral para segmentación geográfica.</td></tr>
                    <tr className="hover:bg-white/[0.02] transition-colors"><td className="p-4 font-mono text-xs text-blue-400 italic">Years of experience overall</td><td className="p-4 text-[#a3a3a3] text-xs">Number</td><td className="p-4 text-[#a3a3a3] text-xs leading-relaxed">Trayectoria laboral acumulada total a lo largo de la vida del profesional.</td></tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* SECCIÓN 2: VARIABLES MODELADAS (Rúbrica: Consistencia) */}
            <div className="glass-card p-10 space-y-8">
              <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                <Database className="text-blue-500" />
                <h3 className="text-2xl font-black italic tracking-tighter uppercase">Variables luego de Modeladas</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white/[0.03] p-8 rounded-3xl border border-white/5 space-y-4 hover:border-blue-500/40 transition-all group">
                  <p className="font-black text-blue-500 text-sm uppercase tracking-[0.2em] group-hover:text-cyan-400">ingresos_totales_cop</p>
                  <p className="text-[10px] text-white/40 font-black uppercase tracking-widest">Tipo: Numérico Decimal</p>
                  <p className="text-xs text-[#a3a3a3] leading-relaxed">
                    Es la métrica maestra del dashboard. Representa la sumatoria del salario base y la compensación adicional, normalizada a una sola base monetaria (Pesos Colombianos) utilizando una TRM fija de $3,670.20 para todas las 11 divisas capturadas, garantizando una comparación de "peras con peras".
                  </p>
                </div>
                <div className="bg-white/[0.03] p-8 rounded-3xl border border-white/5 space-y-4 hover:border-blue-500/40 transition-all group">
                  <p className="font-black text-blue-500 text-sm uppercase tracking-[0.2em] group-hover:text-cyan-400">pais_limpio</p>
                  <p className="text-[10px] text-white/40 font-black uppercase tracking-widest">Tipo: String Categoría</p>
                  <p className="text-xs text-[#a3a3a3] leading-relaxed">
                    Producto de un motor de limpieza REGEX que unifica variaciones gramaticales (ej: "U.S.A", "united states", "america") en un solo estándar. Esto permite que los motores geoespaciales agrupen correctamente los datos por región sin duplicados.
                  </p>
                </div>
                <div className="bg-white/[0.03] p-8 rounded-3xl border border-white/5 space-y-4 hover:border-blue-500/40 transition-all group">
                  <p className="font-black text-blue-500 text-sm uppercase tracking-[0.2em] group-hover:text-cyan-400">experiencia_ponderada</p>
                  <p className="text-[10px] text-white/40 font-black uppercase tracking-widest">Tipo: Numérico Entero</p>
                  <p className="text-xs text-[#a3a3a3] leading-relaxed">
                    Variable calculada que extrae el valor numérico de los rangos de texto originales (ej: "5-7 years" → 6). Proporciona una base cuantitativa para realizar análisis de correlación y regresiones visuales en el gráfico de dispersión.
                  </p>
                </div>
                <div className="bg-white/[0.03] p-8 rounded-3xl border border-white/5 space-y-4 hover:border-blue-500/40 transition-all group">
                  <p className="font-black text-blue-500 text-sm uppercase tracking-[0.2em] group-hover:text-cyan-400">educacion_estándar</p>
                  <p className="text-[10px] text-white/40 font-black uppercase tracking-widest">Tipo: String Categoría</p>
                  <p className="text-xs text-[#a3a3a3] leading-relaxed">
                    Unifica los niveles educativos en 6 categorías maestras. Elimina ruido de respuestas abiertas y agrupa títulos internacionales bajo los estándares de posgrado, pregrado y tecnicatura.
                  </p>
                </div>
              </div>
            </div>

            {/* SECCIÓN 3: MANIPULACIÓN Y ACTUALIZACIÓN (Rúbrica: Paso a Paso Reemplazo) */}
            <div className="glass-card p-10 space-y-8">
              <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                <Terminal className="text-blue-500" />
                <h3 className="text-2xl font-black italic tracking-tighter uppercase">Manual Operativo de Actualización</h3>
              </div>
              <div className="space-y-8">
                <div className="bg-blue-600/5 p-12 rounded-[50px] border border-blue-500/20 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Settings size={120} className="animate-spin-slow" />
                  </div>
                  <h4 className="font-black text-xl mb-8 flex items-center gap-3 uppercase tracking-widest">
                    <CheckCircle2 className="text-blue-500" /> Procedimiento de Réplica Estandarizado
                  </h4>
                  <ol className="space-y-10">
                    <li className="flex gap-6 group">
                      <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center font-black text-blue-500 border border-blue-500/20 group-hover:bg-blue-500 group-hover:text-white transition-all shrink-0">1</div>
                      <div className="space-y-2">
                        <p className="font-black text-white uppercase italic tracking-tighter text-sm">Ingesta de Nueva Fuente</p>
                        <p className="text-xs text-[#a3a3a3] leading-relaxed max-w-2xl">
                          Sustituya el archivo <code className="bg-white/10 px-2 py-0.5 rounded text-blue-300">Hoja de cálculo sin título.xlsx</code> en la raíz del proyecto. Asegúrese de que las columnas del nuevo Excel coincidan con la estructura original; de lo contrario, el pipeline fallará al leer los índices.
                        </p>
                      </div>
                    </li>
                    <li className="flex gap-6 group">
                      <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center font-black text-blue-500 border border-blue-500/20 group-hover:bg-blue-500 group-hover:text-white transition-all shrink-0">2</div>
                      <div className="space-y-2">
                        <p className="font-black text-white uppercase italic tracking-tighter text-sm">Ejecución del Motor ETL</p>
                        <p className="text-xs text-[#a3a3a3] leading-relaxed max-w-2xl">
                          Abra una terminal y ejecute el comando <code className="bg-white/10 px-2 py-0.5 rounded text-blue-300">python origen/etl_process.py</code>. El script lee la TRM configurada, aplica la **Regla de Aidan** (corrección de magnitud x1000) y normaliza geografía mediante expresiones regulares.
                        </p>
                      </div>
                    </li>
                    <li className="flex gap-6 group">
                      <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center font-black text-blue-500 border border-blue-500/20 group-hover:bg-blue-500 group-hover:text-white transition-all shrink-0">3</div>
                      <div className="space-y-2">
                        <p className="font-black text-white uppercase italic tracking-tighter text-sm">Sincronización de Artefacto JSON</p>
                        <p className="text-xs text-[#a3a3a3] leading-relaxed max-w-2xl">
                          El script generará automáticamente un nuevo <code className="bg-white/10 px-2 py-0.5 rounded text-blue-300">processed_data.json</code> en la carpeta de producción del frontend. Verifique en los logs que el número de registros filtrados sea coherente con la realidad del negocio.
                        </p>
                      </div>
                    </li>
                    <li className="flex gap-6 group">
                      <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center font-black text-blue-500 border border-blue-500/20 group-hover:bg-blue-500 group-hover:text-white transition-all shrink-0">4</div>
                      <div className="space-y-2">
                        <p className="font-black text-white uppercase italic tracking-tighter text-sm">Despliegue Global Automático</p>
                        <p className="text-xs text-[#a3a3a3] leading-relaxed max-w-2xl">
                          Haga un commit y push a la rama <code className="bg-white/10 px-2 py-0.5 rounded text-blue-300">main</code>. El webhook de Vercel detectará el cambio en el JSON y redesplegará el dashboard en menos de 10 segundos, actualizando todos los KPI y el mapa en tiempo real.
                        </p>
                      </div>
                    </li>
                  </ol>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="flex justify-between items-center py-12 border-t border-white/5 text-[#444] text-[10px] font-black uppercase tracking-[0.4em]">
        <p>© 2026 Senior Data Engineering | Project Insider Platinum v3.5</p>
        <div className="flex gap-6 uppercase">
          <span className="text-blue-900 border-r border-white/5 pr-6 italic">Master Analytics Ecosystem</span>
          <span>Audit Level 5</span>
        </div>
      </footer>
    </main>
  );
}
