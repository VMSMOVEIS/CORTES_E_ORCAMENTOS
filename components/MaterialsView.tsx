
import React, { useState } from 'react';
import { 
    Disc, Package, Scissors, Box, Layers, 
    TrendingUp, Info, Search, Edit3, ChevronDown,
    Award, Percent, Ruler, ClipboardList, Settings,
    FileSpreadsheet, Zap
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { OptimizationResult } from '../types';

interface MaterialsViewProps {
    materialCosts: any[];
    edgeBandCosts: any[];
    hardwareCosts: any[];
    totalMaterialCost: number;
    totalEdgeCost: number;
    totalHardwareCost: number;
    subtotal: number;
    optimizationResult: OptimizationResult | null;
    globalConfig: any;
}

export const MaterialsView: React.FC<MaterialsViewProps> = ({ 
    materialCosts, 
    edgeBandCosts, 
    hardwareCosts,
    totalMaterialCost,
    totalEdgeCost,
    totalHardwareCost,
    subtotal,
    optimizationResult,
    globalConfig
}) => {
    const [activeFilter, setActiveFilter] = useState<'todos' | 'chapas' | 'fitas' | 'diversos' | 'colas'>('todos');

    const grandTotal = totalMaterialCost + totalEdgeCost + totalHardwareCost;
    const laborPercentOfTotal = subtotal > 0 ? (grandTotal / subtotal) * 100 : 0;
    
    const sheetsCount = materialCosts.reduce((acc, m) => acc + m.sheets, 0);
    const totalEdgesM = edgeBandCosts.reduce((acc, e) => acc + e.length, 0);

    // Filtered lists
    const filteredMaterials = materialCosts;
    const filteredEdges = edgeBandCosts;
    const filteredHardware = hardwareCosts;

    // Charts
    const chartData = [
        { name: 'Chapas (MDF/MDP)', value: totalMaterialCost, color: '#2563eb' },
        { name: 'Fitas de Borda', value: totalEdgeCost, color: '#d97706' },
        { name: 'Acessórios / Diversos', value: totalHardwareCost, color: '#8b5cf6' },
        { name: 'Outros / Consumíveis', value: totalMaterialCost * 0.05, color: '#64748b' } // Estimated 5%
    ];

    // Calculate Efficiency from OptimizationResult
    const efficiency = optimizationResult ? (100 - (optimizationResult.globalWastePercentage || 0)) : 78.45;
    const usedArea = optimizationResult ? (optimizationResult.totalUsedArea || 0) : 47.88;
    const sheetArea = (globalConfig.sheetWidth * globalConfig.sheetHeight) / 1000000;
    const totalArea = optimizationResult ? (optimizationResult.totalSheets * sheetArea) : 61.05;
    const wasteArea = totalArea - usedArea;

    return (
        <div className="animate-fade-in space-y-6 pb-20">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                        <Layers size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Materiais</h2>
                        <p className="text-slate-400 text-sm">Materiais utilizados no projeto e cálculo de consumo</p>
                    </div>
                </div>
            </div>

            {/* SUMMARY CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><TrendingUp size={20}/></div>
                    <div>
                        <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Custo Total de Materiais</span>
                        <span className="text-lg font-black text-slate-800">R$ {grandTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Percent size={20}/></div>
                    <div>
                        <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">% Participação no Custo Total</span>
                        <span className="text-lg font-black text-slate-800">{laborPercentOfTotal.toFixed(2)} %</span>
                    </div>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-purple-50 text-purple-600 rounded-xl"><Package size={20}/></div>
                    <div>
                        <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Total de Chapas</span>
                        <span className="text-lg font-black text-slate-800">{sheetsCount} chapas</span>
                    </div>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-orange-50 text-orange-600 rounded-xl"><Disc size={20} className="rotate-12"/></div>
                    <div>
                        <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Total de Fitas de Borda</span>
                        <span className="text-lg font-black text-slate-800">{totalEdgesM.toFixed(2)} m</span>
                    </div>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-slate-50 text-slate-500 rounded-xl"><ClipboardList size={20}/></div>
                    <div>
                        <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Total de Materiais Diversos</span>
                        <span className="text-lg font-black text-slate-800">R$ {totalHardwareCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* LEFT COLUMN: TABLE */}
                <div className="lg:col-span-8 flex flex-col gap-4">
                    
                    {/* FILTERS & ACTION */}
                    <div className="flex items-center justify-between">
                         <div className="flex gap-2 p-1 bg-white border border-slate-200 rounded-lg shadow-sm">
                            {[
                                { id: 'todos', label: 'Todos os Materiais' },
                                { id: 'chapas', label: 'Chapas' },
                                { id: 'fitas', label: 'Fitas de Borda' },
                                { id: 'diversos', label: 'Acessórios / Diversos' }
                            ].map(filter => (
                                <button 
                                    key={filter.id}
                                    onClick={() => setActiveFilter(filter.id as any)}
                                    className={`px-4 py-2 rounded-md text-[10px] font-black uppercase transition-all ${activeFilter === filter.id ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}
                                >
                                    {filter.label}
                                </button>
                            ))}
                         </div>
                         <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-[10px] font-black uppercase text-slate-600 bg-white hover:bg-slate-50 transition-all">
                            <Edit3 size={14} /> Editar Materiais
                         </button>
                    </div>

                    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                        <table className="w-full text-left text-[10px]">
                            <thead className="bg-slate-50 text-slate-400 font-black uppercase border-b border-slate-100 italic">
                                <tr>
                                    <th className="px-4 py-3">Tipo</th>
                                    <th className="px-4 py-3">Código</th>
                                    <th className="px-4 py-3">Descrição do Material</th>
                                    <th className="px-4 py-3 text-center">Unid.</th>
                                    <th className="px-4 py-3 text-right">Quantidade</th>
                                    <th className="px-4 py-3 text-right">Custo Unit. (R$)</th>
                                    <th className="px-4 py-3 text-right">Custo Total (R$)</th>
                                    <th className="px-4 py-3 text-right">% Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {/* CHAPTER: CHAPAS */}
                                <tr className="bg-blue-50/20">
                                    <td colSpan={8} className="px-4 py-2 font-black text-blue-600 uppercase italic tracking-widest">1. Chapas (MDF / MDP)</td>
                                </tr>
                                {filteredMaterials.map((mat, i) => (
                                    <tr key={`mat-${i}`} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-4 py-2 text-slate-400"></td>
                                        <td className="px-4 py-2 text-slate-500">CHP-{i+1}</td>
                                        <td className="px-4 py-2 font-medium text-slate-700">{mat.materialName} {mat.thickness}mm</td>
                                        <td className="px-4 py-2 text-center text-slate-400">un</td>
                                        <td className="px-4 py-2 text-right font-bold text-slate-700">{mat.sheets.toFixed(2)}</td>
                                        <td className="px-4 py-2 text-right text-slate-500">{mat.unitCost.toFixed(2)}</td>
                                        <td className="px-4 py-2 text-right font-black text-slate-800">R$ {mat.totalCost.toFixed(2)}</td>
                                        <td className="px-4 py-2 text-right text-slate-400">{(mat.totalCost / grandTotal * 100).toFixed(2)}%</td>
                                    </tr>
                                ))}
                                <tr className="bg-slate-50/50">
                                    <td colSpan={6} className="px-4 py-2 font-black text-blue-600 uppercase text-[9px]">Total Chapas</td>
                                    <td className="px-4 py-2 text-right font-black text-blue-600 text-sm">R$ {totalMaterialCost.toFixed(2)}</td>
                                    <td className="px-4 py-2 text-right font-black text-blue-600 opacity-60">{(totalMaterialCost / grandTotal * 100).toFixed(2)}%</td>
                                </tr>

                                {/* CHAPTER: FITAS */}
                                <tr className="bg-orange-50/20">
                                    <td colSpan={8} className="px-4 py-2 font-black text-orange-600 uppercase italic tracking-widest">2. Fitas de Borda</td>
                                </tr>
                                {filteredEdges.map((edge, i) => (
                                    <tr key={`edge-${i}`} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-4 py-2 text-slate-400"></td>
                                        <td className="px-4 py-2 text-slate-500">FB-{i+1}</td>
                                        <td className="px-4 py-2 font-medium text-slate-700">{edge.name}</td>
                                        <td className="px-4 py-2 text-center text-slate-400">m</td>
                                        <td className="px-4 py-2 text-right font-bold text-slate-700">{edge.length.toFixed(2)}</td>
                                        <td className="px-4 py-2 text-right text-slate-500">{edge.unitPrice.toFixed(2)}</td>
                                        <td className="px-4 py-2 text-right font-black text-slate-800">R$ {edge.total.toFixed(2)}</td>
                                        <td className="px-4 py-2 text-right text-slate-400">{(edge.total / grandTotal * 100).toFixed(2)}%</td>
                                    </tr>
                                ))}
                                <tr className="bg-slate-50/50">
                                    <td colSpan={6} className="px-4 py-2 font-black text-orange-600 uppercase text-[9px]">Total Fitas de Borda</td>
                                    <td className="px-4 py-2 text-right font-black text-orange-600 text-sm">R$ {totalEdgeCost.toFixed(2)}</td>
                                    <td className="px-4 py-2 text-right font-black text-orange-600 opacity-60">{(totalEdgeCost / grandTotal * 100).toFixed(2)}%</td>
                                </tr>

                                {/* CHAPTER: DIVERSOS */}
                                <tr className="bg-purple-50/20">
                                    <td colSpan={8} className="px-4 py-2 font-black text-purple-600 uppercase italic tracking-widest">3. Acessórios / Diversos</td>
                                </tr>
                                {filteredHardware.map((hw, i) => (
                                    <tr key={`hw-${i}`} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-4 py-2 text-slate-400"></td>
                                        <td className="px-4 py-2 text-slate-500">DIV-{i+1}</td>
                                        <td className="px-4 py-2 font-medium text-slate-700">{hw.name}</td>
                                        <td className="px-4 py-2 text-center text-slate-400">un</td>
                                        <td className="px-4 py-2 text-right font-bold text-slate-700">{hw.quantity}</td>
                                        <td className="px-4 py-2 text-right text-slate-500">{hw.unitPrice.toFixed(2)}</td>
                                        <td className="px-4 py-2 text-right font-black text-slate-800">R$ {hw.total.toFixed(2)}</td>
                                        <td className="px-4 py-2 text-right text-slate-400">{(hw.total / grandTotal * 100).toFixed(2)}%</td>
                                    </tr>
                                ))}
                                <tr className="bg-slate-50/50">
                                    <td colSpan={6} className="px-4 py-2 font-black text-purple-600 uppercase text-[9px]">Total Acessórios / Diversos</td>
                                    <td className="px-4 py-2 text-right font-black text-purple-600 text-sm">R$ {totalHardwareCost.toFixed(2)}</td>
                                    <td className="px-4 py-2 text-right font-black text-purple-600 opacity-60">{(totalHardwareCost / grandTotal * 100).toFixed(2)}%</td>
                                </tr>

                                <tr className="bg-blue-600 text-white">
                                    <td colSpan={6} className="px-4 py-4 font-black uppercase text-xs">Total Geral de Materiais</td>
                                    <td className="px-4 py-4 text-right font-black text-xl">R$ {grandTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                                    <td className="px-4 py-4 text-right font-black text-sm opacity-60">100%</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    
                    <div className="flex bg-blue-50 border border-blue-100 rounded-xl p-4 gap-4 items-center">
                        <Info size={20} className="text-blue-500 shrink-0"/>
                        <p className="text-[10px] text-blue-700 font-medium leading-relaxed italic">
                            Os consumos foram calculados com base no plano de corte, projetos e parâmetros de produção. 
                            Última atualização: {new Date().toLocaleDateString('pt-BR')} {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                    </div>
                </div>

                {/* RIGHT COLUMN: SIDEBAR */}
                <div className="lg:col-span-4 space-y-6">
                    
                    {/* CHART: DISTRIBUICAO */}
                    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                         <h3 className="text-[10px] font-black text-slate-700 uppercase tracking-widest mb-4">Distribuição do Custo de Materiais</h3>
                         <div className="h-48 relative">
                             <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={chartData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={45}
                                        outerRadius={65}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip 
                                        formatter={(value: any) => [`R$ ${Number(value).toFixed(2)}`, 'Custo']}
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                    />
                                </PieChart>
                             </ResponsiveContainer>
                             <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mb-1 shadow-inner rounded-full mx-auto w-32 h-32 mt-8">
                                <span className="text-[10px] font-black text-slate-400 uppercase leading-none mb-1">Total</span>
                                <span className="text-xs font-black text-slate-800">R$ {grandTotal.toLocaleString('pt-BR', { minimumFractionDigits: 1 })}</span>
                             </div>
                         </div>
                         <div className="space-y-2 mt-4">
                            {chartData.map((item, i) => (
                                <div key={i} className="flex items-center justify-between text-[10px]">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></div>
                                        <span className="text-slate-500 font-bold">{item.name}</span>
                                    </div>
                                    <span className="text-slate-700 font-black">{(item.value / grandTotal * 100).toFixed(1)}% (R$ {item.value.toFixed(0)})</span>
                                </div>
                            ))}
                         </div>
                    </div>

                    {/* CONSUMO FITA DE BORDA */}
                    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-[10px] font-black text-slate-700 uppercase tracking-widest">Consumo de Fita de Borda</h3>
                             <Disc size={20} className="text-slate-300 italic rotate-12" />
                        </div>
                        <div className="mb-4">
                            <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Total de metros lineares</span>
                            <span className="text-2xl font-black text-blue-600">{totalEdgesM.toFixed(2)} m</span>
                        </div>
                        <div className="space-y-3 pt-4 border-t border-slate-50 italic">
                             {edgeBandCosts.map((edge, i) => (
                                 <div key={i} className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500">{edge.name}</span>
                                    <div className="flex items-center gap-2">
                                        <span className="font-black text-slate-700">{edge.length.toFixed(2)} m</span>
                                        <span className="text-slate-400 text-[8px]">({(edge.length / totalEdgesM * 100).toFixed(1)}%)</span>
                                    </div>
                                 </div>
                             ))}
                        </div>
                    </div>

                    {/* APROVEITAMENTO DE CHAPAS */}
                    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-[10px] font-black text-slate-700 uppercase tracking-widest">Aproveitamento de Chapas</h3>
                             <Layers size={20} className="text-slate-300 italic" />
                        </div>
                        <div className="mb-6">
                            <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1 italic">Média de aproveitamento</span>
                            <div className="flex items-baseline gap-2">
                                <span className="text-2xl font-black text-emerald-600">{efficiency.toFixed(2)} %</span>
                                <TrendingUp size={16} className="text-emerald-500" />
                            </div>
                        </div>

                        <div className="space-y-4 pt-4 border-t border-slate-50">
                            <div className="flex justify-between items-center text-[10px]">
                                <span className="text-slate-500 italic">Área total de chapas</span>
                                <span className="font-bold text-slate-700">{totalArea.toFixed(2)} m²</span>
                            </div>
                            <div className="flex justify-between items-center text-[10px]">
                                <span className="text-slate-500 italic">Área aproveitada</span>
                                <span className="font-bold text-emerald-600">{usedArea.toFixed(2)} m²</span>
                            </div>
                            <div className="flex justify-between items-center text-[10px]">
                                <span className="text-slate-500 italic">Área de sobra</span>
                                <span className="font-bold text-orange-600">{wasteArea.toFixed(2)} m²</span>
                            </div>
                        </div>
                        
                        <div className="mt-6 h-1 bg-slate-100 rounded-full overflow-hidden flex">
                            <div className="h-full bg-emerald-500" style={{ width: `${efficiency}%` }}></div>
                            <div className="h-full bg-orange-400" style={{ width: `${100 - efficiency}%` }}></div>
                        </div>
                    </div>

                </div>

            </div>

        </div>
    );
};
