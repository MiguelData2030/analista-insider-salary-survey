'use client';

import React, { useEffect, useState, useMemo } from 'react';
import {
  Users, DollarSign, Briefcase, TrendingUp, Info, List,
  Database, ShieldAlert, Rocket, GraduationCap, Clock,
  ArrowRightLeft, FileText, Settings, HeartPulse, PieChart as PieIcon,
  CheckCircle2, AlertCircle, Terminal, BookOpen
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

    const total = data.length;
    const avg = data.reduce((acc, curr) => acc + curr.ingresos_totales_cop, 0) / total;

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

    const genStats: Record<string, number> = {};
    data.forEach(x => {
      const g = x.genero || "No indica";
      genStats[g] = (genStats[g] || 0) + 1;
    });
    const genderData = Object.entries(genStats)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value).slice(0, 5);

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

  if (!aggregated) return <div className="h-screen flex items-center justify-center text-blue-500 font-mono">Cargando Documentación Maestra v3.2...</div>;

  const COLORS = ['#3b82f6', '#2563eb', '#1d4ed8', '#1e40af', '#172554', '#0f172a'];

  return (
    <main className="min-h-screen p-8 max-w-7xl mx-auto space-y-8 bg-[#0a0a0a] text-white">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-white/5 pb-8">
        <div>
          <h1 className="text-4xl font-black gradient-text tracking-tighter">Analista Insider v3.2</h1>
          <p className="text-[#a3a3a3] mt-2 font-medium">Ingeniería de Datos Corporativa | Storytelling de Valor</p>
        </div>
        <div className="flex gap-2">
          <TabButton active={activeTab === 'dashboard'} label="Panel Analítico" icon={TrendingUp} onClick={() => setActiveTab('dashboard')} />
          <TabButton active={activeTab === 'documentation'} label="Centro de Conocimiento Maestre" icon={Database} onClick={() => setActiveTab('documentation')} />
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'dashboard' ? (
          <motion.div key="dash" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <KpiCard title="Muestra Total" value={aggregated.stats.total.toLocaleString()} icon={Users} description="Registros limpios" />
              <KpiCard title="Ingreso Medio" value={`$${aggregated.stats.avgSalary.toFixed(1)}M`} icon={DollarSign} description="Anual COP (M)" />
              <KpiCard title="Industria Top" value={aggregated.stats.topIndustry} icon={Briefcase} description="Mayor promedio salarial" />
              <KpiCard title="Referencia TRM" value="$3,670.20" icon={ArrowRightLeft} description="USD/COP Fijo" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
          <motion.div key="docs" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12 pb-20">
            {/* Header de Documentación */}
            <div className="bg-blue-600/10 p-10 rounded-[40px] border border-blue-500/20">
              <h2 className="text-3xl font-black mb-4 flex items-center gap-3"><BookOpen size={36} /> Knowledge Center Maestre</h2>
              <p className="text-[#a3a3a3] text-sm max-w-3xl">
                Este centro contiene la fuente de verdad técnica para el proyecto. Diseñado bajo estándares de ingeniería de datos para asegurar la **continuidad operativa**, la **claridad del modelado** y la **perfecta replicabilidad** del sistema.
              </p>
            </div>

            {/* SECCIÓN 1: TIPOLOGÍA DE VARIABLES (Rúbrica: Variables Tabla Original) */}
            <section className="glass-card p-8 space-y-6">
              <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                <List className="text-blue-500" />
                <h3 className="text-xl font-bold uppercase tracking-widest">1. Diccionario de Variables Originales</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-[#a3a3a3]">
                  <thead>
                    <tr className="text-white border-b border-white/10 uppercase text-[10px] tracking-tighter">
                      <th className="py-3">Columna Excel</th>
                      <th className="py-3">Variable Sistema</th>
                      <th className="py-3">Tipo de Dato</th>
                      <th className="py-3">Descripción / Propósito</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    <tr><td className="py-3 font-mono text-xs">How old are you?</td><td className="py-3">edad</td><td className="py-3">Categorica (String)</td><td className="py-3">Rango de edad del encuestado para análisis demográfico.</td></tr>
                    <tr><td className="py-3 font-mono text-xs">Industry</td><td className="py-3">industria</td><td className="py-3">Categorica (String)</td><td className="py-3">Sector económico principal de empleo.</td></tr>
                    <tr><td className="py-3 font-mono text-xs">Job title</td><td className="py-3">cargo</td><td className="py-3">Categorica (String)</td><td className="py-3">Nombre formal del puesto de trabajo.</td></tr>
                    <tr><td className="py-3 font-mono text-xs">Annual salary</td><td className="py-3">salario_anual</td><td className="py-3">Numérico (Float)</td><td className="py-3">Ingreso base anual bruto reportado por el usuario.</td></tr>
                    <tr><td className="py-3 font-mono text-xs">Additional comp</td><td className="py-3">comp_adicional</td><td className="py-3">Numérico (Float)</td><td className="py-3">Bonos, comisiones y compensación variable.</td></tr>
                    <tr><td className="py-3 font-mono text-xs">Currency</td><td className="py-3">moneda</td><td className="py-3">Categorica (String)</td><td className="py-3">Divisa base del país de origen (USD, EUR, etc.).</td></tr>
                    <tr><td className="py-3 font-mono text-xs">Country</td><td className="py-3">pais</td><td className="py-3">Categorica (String)</td><td className="py-3">Ubicación nacional para normalización geoespacial.</td></tr>
                    <tr><td className="py-3 font-mono text-xs">Experience total</td><td className="py-3">exp_total</td><td className="py-3">Numérico (Float)</td><td className="py-3">Años totales de trayectoria laboral profesional.</td></tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* SECCIÓN 2: DOCUMENTACIÓN DE MODELADO (Rúbrica: Modelado) */}
            <section className="glass-card p-8 space-y-6">
              <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                <Database className="text-blue-500" />
                <h3 className="text-xl font-bold uppercase tracking-widest">2. Ingeniería y Modelado de Datos</h3>
              </div>
              <p className="text-sm text-[#a3a3a3]">
                El pipeline transforma los datos originales mediante reglas de negocio rigurosas para asegurar la **integridad de los KPIs**.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white/5 p-6 rounded-2xl border border-white/5 space-y-4">
                  <h4 className="text-blue-400 font-bold text-xs uppercase tracking-widest flex items-center gap-2"><ArrowRightLeft size={16} /> Lógica de Conversión</h4>
                  <p className="text-xs text-[#737373]">
                    Se implementa un mapeo de 11 divisas principales a USD. <br />
                    <strong>Fórmula:</strong> `Ingreso_COP = (Base + Extra) * Rate_USD * TRM_COP` <br />
                    <strong>TRM Estática:</strong> $3,670.20 para control de varianza temporal.
                  </p>
                </div>
                <div className="bg-white/5 p-6 rounded-2xl border border-white/5 space-y-4">
                  <h4 className="text-blue-400 font-bold text-xs uppercase tracking-widest flex items-center gap-2"><ShieldAlert size={16} /> Limpieza y Data Quality</h4>
                  <p className="text-xs text-[#737373]">
                    <strong>Regla de Aidan:</strong> Multiplicación x1000 para corregir errores de digitación en salarios menores a 100 USD. <br />
                    <strong>Outlier Cap:</strong> Eliminación del top 1% de ingresos (percentil 0.99) para evitar sesgos por CEOs o datos erróneos de magnitud.
                  </p>
                </div>
                <div className="bg-white/5 p-6 rounded-2xl border border-white/5 space-y-4">
                  <h4 className="text-blue-400 font-bold text-xs uppercase tracking-widest flex items-center gap-2"><Rocket size={16} /> Variables Modeladas</h4>
                  <p className="text-xs text-[#737373]">
                    • <code className="text-white">ingresos_totales_cop</code>: Suma de base y compensación normalizada. <br />
                    • <code className="text-white">pais_limpio</code>: Geografía consolidada vía REGEX (USA, America → United States).
                  </p>
                </div>
                <div className="bg-white/5 p-6 rounded-2xl border border-white/5 space-y-4">
                  <h4 className="text-blue-400 font-bold text-xs uppercase tracking-widest flex items-center gap-2"><CheckCircle2 size={16} /> Auditoría (Logs)</h4>
                  <p className="text-xs text-[#737373]">
                    El script genera un archivo `etl_log.json` que registra la fecha de ejecución, el número de filas originales vs. procesadas y cualquier error detectado durante el runtime.
                  </p>
                </div>
              </div>
            </section>

            {/* SECCIÓN 3: PASO A PASO (Rúbrica: Replicabilidad) */}
            <section className="glass-card p-8 space-y-6">
              <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                <Terminal className="text-blue-500" />
                <h3 className="text-xl font-bold uppercase tracking-widest">3. Manual Paso a Paso de Replicación</h3>
              </div>
              <div className="space-y-4">
                {[
                  { step: "01", title: "Entorno Técnico", desc: "Instalar Python 3.10+ y las librerías necesarias con el comando: `pip install pandas openpyxl`." },
                  { step: "02", title: "Preparación de Datos", desc: "Colocar el nuevo archivo Excel con la estructura de la encuesta en la raíz del proyecto, nombrado como `Hoja de cálculo sin título.xlsx`." },
                  { step: "03", title: "Ejecución del Pipeline", desc: "Abrir una terminal en la carpeta raíz y ejecutar: `python origen/etl_process.py`. Validar que el log confirme la generación del JSON." },
                  { step: "04", title: "Validación de Salida", desc: "Verificar que el archivo `processed_data.json` se haya actualizado en la carpeta `panel/public/data/`." },
                  { step: "05", title: "Despliegue GitHub/Vercel", desc: "Hacer commit de los cambios y push a GitHub. Vercel redesplegará el dashboard automáticamente en segundos." }
                ].map((s, i) => (
                  <div key={i} className="flex gap-6 items-start group">
                    <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center font-black text-blue-500 shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-all">
                      {s.step}
                    </div>
                    <div className="pt-2">
                      <p className="text-white font-bold text-sm tracking-tight">{s.title}</p>
                      <p className="text-xs text-[#737373] mt-1">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <div className="p-8 bg-yellow-500/10 border border-yellow-500/20 rounded-3xl flex gap-4">
              <AlertCircle className="text-yellow-500 shrink-0" />
              <p className="text-xs text-yellow-500 leading-relaxed font-bold">
                POLÍTICA DE CONTINUIDAD: La lógica de este BI está diseñada para ser independiente del desarrollador original. Siguiendo este manual, cualquier analista del nivel Senior puede garantizar el 100% de la operatividad del dashboard.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="text-center py-12 text-[#444] text-[10px] font-black uppercase tracking-[0.3em] border-t border-white/5">
        <p>© 2026 Senior Data Engineering Team | Internal Intelligence Framework v3.2</p>
      </footer>
    </main>
  );
}
