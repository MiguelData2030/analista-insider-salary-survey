'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { Users, DollarSign, Briefcase, TrendingUp, Info, List, Database, ShieldAlert, Rocket } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ScatterChart, Scatter, ZAxis, Cell
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

interface IndustryData {
  name: string;
  value: number;
}

interface ScatterPoint {
  exp: number;
  salary: number;
  industry: string;
}

// --- Componentes UI ---
const KpiCard = ({ title, value, icon: Icon, description }: { title: string, value: string, icon: any, description?: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="glass-card p-6 flex flex-col gap-2 hover:border-accent/40 transition-colors"
  >
    <div className="flex justify-between items-start">
      <p className="text-[#a3a3a3] text-sm font-medium">{title}</p>
      <Icon className="w-5 h-5 text-[#3b82f6]" />
    </div>
    <h3 className="text-2xl font-bold">{value}</h3>
    {description && <p className="text-xs text-[#737373] mt-1">{description}</p>}
  </motion.div>
);

const TabButton = ({ active, label, icon: Icon, onClick }: any) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold transition-all ${active ? 'bg-[#3b82f6] text-white shadow-lg shadow-blue-500/20' : 'bg-white/5 text-[#737373] hover:bg-white/10'
      }`}
  >
    <Icon size={18} />
    {label}
  </button>
);

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

  // Lógica de Datos Optimizada
  const { stats, industryData, scatterData } = useMemo(() => {
    if (data.length === 0) return { stats: { total: 0, avgSalary: 0, topIndustry: 'N/A' }, industryData: [], scatterData: [] };

    // 1. Estadísticas Generales
    const total = data.length;
    const avg = data.reduce((acc, curr) => acc + curr.ingresos_totales_cop, 0) / total;

    // 2. Agregación de Industrias (Promedio por Industria)
    const indStats: Record<string, { sum: number, count: number }> = {};
    data.forEach(curr => {
      const ind = curr.industria || "Otras Industrias";
      if (!indStats[ind]) indStats[ind] = { sum: 0, count: 0 };
      indStats[ind].sum += curr.ingresos_totales_cop;
      indStats[ind].count += 1;
    });

    const sortedIndustries = Object.entries(indStats)
      .map(([name, stat]) => ({
        full_name: name,
        name: name.length > 18 ? name.substring(0, 18) + '...' : name,
        value: Math.round(stat.sum / stat.count)
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);

    // 3. Scatter Data (Muestra de 600)
    const scatter = data.slice(0, 600).map(x => ({
      exp: parseInt(x.exp_total) || 0,
      salary: Math.round(x.ingresos_totales_cop / 1e6),
      industry: x.industria
    }));

    return {
      stats: { total, avgSalary: avg / 1e6, topIndustry: sortedIndustries[0]?.full_name || 'N/A' },
      industryData: sortedIndustries,
      scatterData: scatter
    };
  }, [data]);

  return (
    <main className="min-h-screen p-8 max-w-7xl mx-auto space-y-8 bg-[#0a0a0a] text-white">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-4xl font-black gradient-text">Analista Insider v2.0</h1>
          <p className="text-[#a3a3a3] mt-2">Plataforma de Storytelling y Análisis Salarial</p>
        </div>

        <div className="flex gap-2">
          <TabButton active={activeTab === 'dashboard'} label="Panel de Analítica" icon={TrendingUp} onClick={() => setActiveTab('dashboard')} />
          <TabButton active={activeTab === 'documentation'} label="Documentación del Modelo" icon={Database} onClick={() => setActiveTab('documentation')} />
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'dashboard' ? (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-8"
          >
            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <KpiCard title="Total Respuestas" value={stats.total.toLocaleString()} icon={Users} description="Encuestas procesadas" />
              <KpiCard title="Salario Promedio" value={`$${stats.avgSalary.toFixed(1)}M`} icon={DollarSign} description="Pesos Colombianos (COP)" />
              <KpiCard title="Industria Top" value={stats.topIndustry} icon={TrendingUp} description="Basado en promedio salarial" />
              <KpiCard title="TRM Hoy" value="$3,670.20" icon={Briefcase} description="Tipo de Cambio Estático" />
            </div>

            {/* Charts View */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="glass-card p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-lg">Top 10 Industrias</h3>
                  <span className="text-[10px] text-accent font-mono">AVG COP / AÑO</span>
                </div>
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={industryData} layout="vertical" margin={{ left: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                      <XAxis type="number" hide />
                      <YAxis dataKey="name" type="category" stroke="#a3a3a3" fontSize={10} width={120} />
                      <Tooltip
                        cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                        contentStyle={{ backgroundColor: '#141414', border: '1px solid #333', borderRadius: '8px' }}
                        formatter={(val: number) => [`$${val.toLocaleString()} COP`, 'Promedio Anual']}
                      />
                      <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="glass-card p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-lg">Hallazgo: Experiencia vs Ingresos</h3>
                  <span className="text-[10px] text-accent font-mono">CORRELACIÓN</span>
                </div>
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                      <XAxis type="number" dataKey="exp" name="Experiencia" unit=" años" stroke="#737373" />
                      <YAxis type="number" dataKey="salary" name="Salario" unit="M" stroke="#737373" />
                      <Tooltip
                        cursor={{ strokeDasharray: '3 3' }}
                        contentStyle={{ backgroundColor: '#141414', border: '1px solid #333', borderRadius: '8px' }}
                      />
                      <Scatter data={scatterData} fill="#3b82f6" fillOpacity={0.4} />
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="documentation"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="glass-card p-10 space-y-12"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
              <section className="space-y-6">
                <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                  <Database className="text-accent" />
                  <h2 className="text-2xl font-bold">Arquitectura de Datos (ETL)</h2>
                </div>
                <div className="prose prose-invert max-w-none text-sm space-y-4 text-[#a3a3a3]">
                  <p>
                    El proceso de ingeniería se basa en una arquitectura de **Medallion Lite**, donde los datos pasan de un estado crudo (Excel) a un estado limpio (JSON).
                  </p>
                  <div className="bg-white/5 p-4 rounded-lg space-y-4 border border-white/5">
                    <div>
                      <h4 className="font-bold text-white mb-1">1. Normalización Geográfica</h4>
                      <p>Se utiliza una lógica de regex avanzada para consolidar variantes de países (USA, United States, U.S. -> United States). Las ciudades se titulan y se eliminan espacios extra.</p>
                    </div>
                    <div>
                      <h4 className="font-bold text-white mb-1">2. Conversión Financiera (TRM)</h4>
                      <p>Se aplica la TRM estática de **$3,670.20 COP/USD**. Otras monedas base (EUR, GBP, CAD) se nivelan a USD antes del cambio final a COP.</p>
                    </div>
                    <div>
                      <h4 className="font-bold text-white mb-1">3. Regla de Aidan (Data Quality)</h4>
                      <p>Corrección de errores de magnitud: si el salario anual detectado es menor a 100 USD, se multiplica por 1000 asumiendo error de entrada por parte del usuario.</p>
                    </div>
                  </div>
                </div>
              </section>

              <section className="space-y-6">
                <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                  <List className="text-accent" />
                  <h2 className="text-2xl font-bold">Manual para Analistas</h2>
                </div>
                <div className="space-y-4">
                  <div className="flex gap-4 items-start">
                    <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center font-bold text-xs shrink-0">1</div>
                    <div>
                      <p className="font-bold">Repositorio Fuente</p>
                      <p className="text-sm text-[#737373]">Toda la lógica de transformación reside en la carpeta `/origen`. El script principal es `etl_process.py`.</p>
                    </div>
                  </div>
                  <div className="flex gap-4 items-start">
                    <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center font-bold text-xs shrink-0">2</div>
                    <div>
                      <p className="font-bold">Ejecución del Pipeline</p>
                      <p className="text-sm text-[#737373]">Para actualizar datos, coloca el nuevo Excel en la raíz y corre `python origen/etl_process.py`. Se generará un nuevo `processed_data.json` en `panel/public/data`.</p>
                    </div>
                  </div>
                  <div className="flex gap-4 items-start">
                    <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center font-bold text-xs shrink-0">3</div>
                    <div>
                      <p className="font-bold">Despliegue Continuo</p>
                      <p className="text-sm text-[#737373]">Al hacer push a GitHub, Vercel detectará el cambio en el JSON y redesplegará el dashboard automáticamente.</p>
                    </div>
                  </div>
                  <div className="mt-8 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg flex gap-3">
                    <ShieldAlert className="text-yellow-500 shrink-0" size={20} />
                    <p className="text-xs text-yellow-500">
                      **Nota de Seguridad:** Asegúrate de que el archivo Excel no sea subido a GitHub (configurado en .gitignore) para proteger la privacidad de la muestra bruta.
                    </p>
                  </div>
                </div>
              </section>
            </div>

            <div className="border-t border-white/5 pt-8">
              <div className="flex items-center gap-2 mb-4 text-accent">
                <Rocket size={20} />
                <h3 className="font-bold uppercase tracking-widest text-xs">Diccionario de Datos Modelados</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white/5 p-4 rounded-lg">
                  <code className="text-accent text-xs">salario_anual_cop</code>
                  <p className="text-xs mt-2 text-[#737373]">Salario base sin bonificaciones ni extras, normalizado a COP.</p>
                </div>
                <div className="bg-white/5 p-4 rounded-lg">
                  <code className="text-accent text-xs">ingresos_totales_cop</code>
                  <p className="text-xs mt-2 text-[#737373]">Suma final de compensación base y adicional.</p>
                </div>
                <div className="bg-white/5 p-4 rounded-lg">
                  <code className="text-accent text-xs">exp_total</code>
                  <p className="text-xs mt-2 text-[#737373]">Variable discreta de años de trayectoria profesional.</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="text-center py-12 text-[#737373] text-xs flex flex-col gap-2 border-t border-white/5">
        <p>Analítica interna para equipo de investigación | Ask A Manager Survey 2021</p>
        <p>Propiedad intelectual del procesamiento: Senior Data Engineer Team 2026</p>
      </footer>
    </main>
  );
}
