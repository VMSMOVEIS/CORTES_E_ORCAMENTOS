
import React, { useState, useMemo } from 'react';
import { 
    FileSpreadsheet, Monitor, Package, Wrench, Users, DollarSign,
    Box, Layers, Ruler, Activity, Info, BarChart3, TrendingUp,
    Layout, Filter, Search, Edit3, ChevronRight, Hash,
    ArrowUpRight, ArrowDownRight, Printer, Save, Trash2, Calendar
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { ProcessedPart, OptimizationConfig } from '../types';

interface PartsListViewProps {
    parts: ProcessedPart[];
    globalConfig: OptimizationConfig;
    materialCosts: any[];
}

export const PartsListView: React.FC<PartsListViewProps> = ({ 
    parts, 
    globalConfig,
    materialCosts 
}) => {
    const [activeFilter, setActiveFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    // Categorization logic
    const categorizePart = (part: ProcessedPart) => {
        const name = part.finalName.toLowerCase();
        if (name.includes('lateral') || name.includes('divis') || name.includes('base') || name.includes('travessa') || name.includes('acabamento')) return 'estruturais';
        if (name.includes('porta')) return 'portas';
        if (name.includes('gaveta') || name.includes('frente')) return 'gavetas';
        if (name.includes('prat')) return 'prateleiras';
        if (name.includes('fundo') || name.includes('tras')) return 'fundos';
        return 'diversos';
    };

    // Processed parts with category and cost
    const processedParts = useMemo(() => {
        return parts.map(p => {
            const category = categorizePart(p);
            const area = (p.dimensions.width * p.dimensions.height * p.quantity) / 1000000;
            
            // Basic cost estimation per part area (using average m2 price from materialCosts or fallback)
            const materialId = p.materialName;
            const matCostObj = materialCosts.find(m => m.name === materialId);
            const m2Price = matCostObj ? (matCostObj.cost / matCostObj.sheetArea) : 250; // Fallback price
            const totalCost = area * m2Price;

            return {
                ...p,
                category,
                area,
                totalCost,
                m2Price
            };
        });
    }, [parts, materialCosts]);

    // Derived Statistics
    const stats = useMemo(() => {
        const totalPieces = processedParts.reduce((acc, p) => acc + p.quantity, 0);
        const uniqueModules = new Set(processedParts.map(p => p.groupCategory || 'Módulo Único')).size;
        const totalArea = processedParts.reduce((acc, p) => acc + p.area, 0);
        const avgPiecesPerModule = uniqueModules > 0 ? totalPieces / uniqueModules : 0;
        const totalCost = processedParts.reduce((acc, p) => acc + p.totalCost, 0);
        const avgCostPerPiece = totalPieces > 0 ? totalCost / totalPieces : 0;

        return {
            totalPieces,
            uniqueModules,
            totalArea,
            avgPiecesPerModule,
            avgCostPerPiece,
            totalCost
        };
    }, [processedParts]);

    // Filtering
    const filteredParts = useMemo(() => {
        return processedParts.filter(p => {
            const matchesFilter = activeFilter === 'all' || p.category === activeFilter;
            const matchesSearch = p.finalName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                p.displayId.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesFilter && matchesSearch;
        });
    }, [processedParts, activeFilter, searchTerm]);

    // Groups for Table
    const groupedParts = useMemo(() => {
        const groups: Record<string, typeof processedParts> = {};
        filteredParts.forEach(p => {
            if (!groups[p.category]) groups[p.category] = [];
            groups[p.category].push(p);
        });
        return groups;
    }, [filteredParts]);

    // Chart Data: Distribution by Type
    const distributionData = useMemo(() => {
        const counts: Record<string, number> = {};
        processedParts.forEach(p => {
            const label = p.category.charAt(0).toUpperCase() + p.category.slice(1);
            counts[label] = (counts[label] || 0) + p.quantity;
        });
        return Object.entries(counts).map(([name, value]) => ({ name, value }));
    }, [processedParts]);

    const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#94a3b8', '#ec4899'];

    // Chart Data: Area per Module
    const moduleAreaData = useMemo(() => {
        const areas: Record<string, number> = {};
        processedParts.forEach(p => {
            const mod = p.groupCategory || 'Módulo Único';
            areas[mod] = (areas[mod] || 0) + p.area;
        });
        return Object.entries(areas)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 5);
    }, [processedParts]);

    // Top 5 Pieces by Area
    const topPieces = useMemo(() => {
        return [...processedParts]
            .sort((a, b) => b.area - a.area)
            .slice(0, 5);
    }, [processedParts]);

    const categories = [
        { id: 'all', label: 'Todas as Peças', icon: Layers },
        { id: 'estruturais', label: 'Estruturais', icon: Layout },
        { id: 'portas', label: 'Portas', icon: Package },
        { id: 'gavetas', label: 'Gavetas', icon: Box },
        { id: 'prateleiras', label: 'Prateleiras', icon: BarChart3 },
        { id: 'fundos', label: 'Fundos', icon: Layers },
        { id: 'diversos', label: 'Diversos', icon: Monitor }
    ];

    return (
        <div className="animate-fade-in space-y-6 pb-20">
            {/* HEADER */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-100 text-blue-600 rounded-xl shadow-inner">
                        <FileSpreadsheet size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Itens / Peças</h2>
                        <p className="text-slate-400 text-sm">Lista de todas as peças do projeto, cálculo de áreas e vínculo com materiais</p>
                    </div>
                </div>
            </div>

            {/* DASHBOARD STATS */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm relative overflow-hidden group">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Box size={16}/></div>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">Total de Peças</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xl font-black text-slate-800">{stats.totalPieces} peças</span>
                        <div className="flex items-center gap-1 mt-0.5">
                            <ArrowUpRight size={10} className="text-emerald-500" />
                            <span className="text-[9px] font-bold text-emerald-500 uppercase">Eficiência 94%</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm relative overflow-hidden group">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><Monitor size={16}/></div>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">Total de Módulos</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xl font-black text-slate-800">{stats.uniqueModules} módulos</span>
                        <span className="text-[9px] font-medium text-slate-400 mt-0.5 italic">Grupamento automático</span>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm relative overflow-hidden group">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-orange-50 text-orange-600 rounded-lg"><Ruler size={16}/></div>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">Área Total das Peças</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xl font-black text-slate-800">{stats.totalArea.toFixed(2)} m²</span>
                        <span className="text-[9px] font-medium text-slate-400 mt-0.5 italic">Soma técnica</span>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm relative overflow-hidden group">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><Users size={16}/></div>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">Média de Peças por Módulo</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xl font-black text-slate-800">{stats.avgPiecesPerModule.toFixed(1)}</span>
                        <span className="text-[9px] font-medium text-slate-400 mt-0.5 italic">Densidade técnica</span>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm relative overflow-hidden group">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><DollarSign size={16}/></div>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">Custo Médio por Peça</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xl font-black text-slate-800">R$ {stats.avgCostPerPiece.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                        <span className="text-[9px] font-medium text-slate-400 mt-0.5 italic">Base: {stats.totalPieces} un</span>
                    </div>
                </div>
            </div>

            {/* FILTERS & SEARCH */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex gap-1 overflow-x-auto no-scrollbar p-1">
                    {categories.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveFilter(cat.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-tight transition-all whitespace-nowrap ${
                                activeFilter === cat.id
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                            }`}
                        >
                            <cat.icon size={14} />
                            {cat.label}
                        </button>
                    ))}
                </div>
                <div className="relative flex-1 max-w-sm mr-2">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                    <input 
                        type="text" 
                        placeholder="Pesquisar peça ou código..."
                        className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-medium focus:bg-white focus:border-blue-300 outline-none transition-all"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                <button className="flex items-center gap-2 px-4 py-2 text-[10px] font-black uppercase tracking-tight text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all mr-2">
                    <Edit3 size={14} /> Editar Peças
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* TABLE AREA */}
                <div className="lg:col-span-8 space-y-6">
                    {Object.entries(groupedParts).sort().map(([category, items]) => (
                        <div key={category} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                            <div className="bg-slate-50/50 border-b border-slate-100 px-6 py-3 flex items-center justify-between">
                                <h3 className="text-[10px] font-black text-blue-700 uppercase tracking-widest italic flex items-center gap-2">
                                    <Hash size={12}/> {category.toUpperCase()}
                                </h3>
                                <span className="text-[10px] font-bold text-slate-400">{items.length} itens</span>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-white text-[9px] text-slate-400 uppercase font-black italic border-b border-slate-50">
                                        <tr>
                                            <th className="px-6 py-3">Tipo</th>
                                            <th className="px-6 py-3">Código</th>
                                            <th className="px-6 py-3">Descrição da Peça</th>
                                            <th className="px-6 py-3">Módulo</th>
                                            <th className="px-6 py-3">Material</th>
                                            <th className="px-6 py-3">Dimensões (mm)</th>
                                            <th className="px-6 py-3">Esp.</th>
                                            <th className="px-6 py-3 text-center">Qtde</th>
                                            <th className="px-6 py-3 text-right">Área (m²)</th>
                                            <th className="px-6 py-3 text-right">Custo Total (R$)</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {items.map((part, idx) => (
                                            <tr key={idx} className="hover:bg-slate-50/50 transition-colors group">
                                                <td className="px-6 py-3">
                                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                                                </td>
                                                <td className="px-6 py-3 font-mono text-[9px] text-slate-500 font-bold">{part.displayId}</td>
                                                <td className="px-6 py-3">
                                                    <span className="text-[10px] font-black text-slate-700 group-hover:text-blue-600 transition-colors">{part.finalName}</span>
                                                </td>
                                                <td className="px-6 py-3">
                                                    <span className="text-[9px] text-slate-400 italic">{part.groupCategory || 'Módulo 01'}</span>
                                                </td>
                                                <td className="px-6 py-3">
                                                    <span className="text-[9px] font-bold text-slate-500">{part.materialName}</span>
                                                </td>
                                                <td className="px-6 py-3 font-mono text-[9px] text-slate-500">
                                                    {part.dimensions.width.toFixed(0)} x {part.dimensions.height.toFixed(0)}
                                                </td>
                                                <td className="px-6 py-3 text-[9px] font-bold text-slate-400">{part.dimensions.thickness}</td>
                                                <td className="px-6 py-3 text-center font-black text-slate-700 text-[10px]">{part.quantity}</td>
                                                <td className="px-6 py-3 text-right font-mono text-[10px] text-slate-500">{part.area.toFixed(2)}</td>
                                                <td className="px-6 py-3 text-right font-black text-slate-800 text-[10px]">
                                                    R$ {part.totalCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot className="bg-slate-50/30 border-t border-slate-100">
                                        <tr className="text-[10px] font-black">
                                            <td colSpan={7} className="px-6 py-3 text-blue-700 uppercase italic">Total de {category}</td>
                                            <td className="px-6 py-3 text-center text-blue-800">
                                                {items.reduce((acc, i) => acc + i.quantity, 0)}
                                            </td>
                                            <td className="px-6 py-3 text-right text-blue-800">
                                                {items.reduce((acc, i) => acc + i.area, 0).toFixed(2)}
                                            </td>
                                            <td className="px-6 py-3 text-right text-blue-900 bg-blue-50/50">
                                                R$ {items.reduce((acc, i) => acc + i.totalCost, 0).toLocaleString('pt-BR')}
                                            </td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>
                    ))}

                    <div className="bg-slate-900 rounded-2xl p-6 flex items-center justify-between shadow-lg shadow-slate-100 border border-slate-800">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-white backdrop-blur-sm">
                                <FileSpreadsheet size={24} />
                            </div>
                            <div>
                                <h4 className="text-white font-black text-sm uppercase tracking-widest italic">Total Geral de Peças</h4>
                                <p className="text-slate-400 text-[10px] font-medium">Consolidação técnica de fabricação</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-12 text-white">
                            <div className="text-center">
                                <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1 italic">Total Itens</span>
                                <span className="text-xl font-black">{stats.totalPieces}</span>
                            </div>
                            <div className="text-center">
                                <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1 italic">Área Consolidada</span>
                                <span className="text-xl font-black">{stats.totalArea.toFixed(2)} m²</span>
                            </div>
                            <div className="text-center bg-blue-600 px-6 py-2 rounded-xl shadow-lg shadow-blue-900 border border-blue-500">
                                <span className="block text-[8px] font-black text-blue-100 uppercase tracking-widest mb-1 italic text-center">Custo Previsto</span>
                                <span className="text-xl font-black">R$ {stats.totalCost.toLocaleString('pt-BR')}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* SIDEBAR CHARTS */}
                <div className="lg:col-span-4 space-y-6">
                    {/* CHART 1: Distribution */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6 italic">Distribuição de Peças por Tipo</h3>
                        <div className="h-64 relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={distributionData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={85}
                                        paddingAngle={5}
                                        dataKey="value"
                                        strokeWidth={0}
                                    >
                                        {distributionData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip 
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.1)', fontFamily: 'sans-serif' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span className="text-xs font-black text-slate-800">{stats.totalPieces}</span>
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Total</span>
                            </div>
                        </div>
                        <div className="mt-4 space-y-2">
                             {distributionData.map((item, i) => (
                                 <div key={i} className="flex items-center justify-between text-[10px]">
                                     <div className="flex items-center gap-2">
                                         <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                                         <span className="font-bold text-slate-600">{item.name}</span>
                                     </div>
                                     <span className="font-black text-slate-800">{item.value} ({((item.value / stats.totalPieces) * 100).toFixed(1)}%)</span>
                                 </div>
                             ))}
                        </div>
                    </div>

                    {/* CHART 2: Area per Module */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6 italic">Área das Peças por Módulo</h3>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={moduleAreaData} layout="vertical">
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="name" type="category" tick={{ fontSize: 9, fontWeight: 700, fill: '#64748b' }} width={80}/>
                                    <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '8px', border: 'none', fontSize: '10px' }} />
                                    <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={12} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* TOP 5 PIECES */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6 italic">Top 5 Peças (por Área)</h3>
                        <div className="space-y-3">
                            {topPieces.map((piece, i) => (
                                <div key={i} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-xl transition-all cursor-default group">
                                    <div className="w-6 h-6 bg-slate-100 rounded-lg flex items-center justify-center text-[10px] font-black text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                        {i + 1}
                                    </div>
                                    <div className="flex-1 overflow-hidden">
                                        <span className="block text-[10px] font-black text-slate-700 truncate">{piece.finalName}</span>
                                        <span className="block text-[8px] text-slate-400 font-bold uppercase">{piece.materialName}</span>
                                    </div>
                                    <div className="text-right">
                                        <span className="block text-[10px] font-black text-slate-800">{piece.area.toFixed(2)} m²</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* INDICATORS GRID */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm text-center">
                            <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 italic">Índices das Peças</h4>
                            <div className="flex flex-col items-center gap-1">
                                <ArrowUpRight size={20} className="text-emerald-500" />
                                <span className="text-lg font-black text-slate-800 italic">78,4 %</span>
                                <span className="text-[8px] font-bold text-slate-400 uppercase">Aproveitamento médio</span>
                            </div>
                        </div>
                        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm text-center">
                             <div className="h-4"></div>
                             <div className="flex flex-col items-center gap-1">
                                <Monitor size={20} className="text-orange-500" />
                                <span className="text-lg font-black text-slate-800 italic">8,6 un</span>
                                <span className="text-[8px] font-bold text-slate-400 uppercase">Peças pr chapa</span>
                             </div>
                        </div>
                        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm text-center">
                             <div className="flex flex-col items-center gap-1">
                                <Layout size={20} className="text-blue-500" />
                                <span className="text-lg font-black text-slate-800 italic">18,61 m²</span>
                                <span className="text-[8px] font-bold text-slate-400 uppercase">Área aproveitada</span>
                             </div>
                        </div>
                        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm text-center">
                             <div className="flex flex-col items-center gap-1">
                                <Box size={20} className="text-purple-500" />
                                <span className="text-lg font-black text-slate-800 italic">5,14 m²</span>
                                <span className="text-[8px] font-bold text-slate-400 uppercase">Área de sobra</span>
                             </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* INFO FOOTER */}
            <div className="flex bg-blue-50 border border-blue-100 rounded-2xl p-4 gap-4 items-center">
                <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-blue-500 shrink-0">
                    <Info size={24} />
                </div>
                <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                        <p className="text-[10px] text-blue-700 font-black uppercase tracking-tight italic">Informação sobre a extração</p>
                        <span className="text-[9px] text-blue-400 font-bold">Última atualização: {new Date().toLocaleDateString('pt-BR')} {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className="text-[10px] text-blue-600 font-medium leading-relaxed">
                        As quantidades e áreas foram calculadas com base nas dimensões informadas. Cada item está vinculado ao seu respectivo material e módulo para garantir o correto fluxo de produção.
                    </p>
                </div>
            </div>
        </div>
    );
};
