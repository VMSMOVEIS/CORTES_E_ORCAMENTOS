
import React, { useMemo } from 'react';
import { OptimizationResult, OptimizationConfig, ProcessedPart } from '../types';
import { FileText, Printer, DollarSign, Activity, Layers, BarChart3, Clock, Scissors, LayoutDashboard } from 'lucide-react';

interface ReportPanelProps {
  result: OptimizationResult | null;
  config: OptimizationConfig;
  projectName: string;
  parts: ProcessedPart[]; // Nova prop para análise global
}

export const ReportPanel: React.FC<ReportPanelProps> = ({ result, config, projectName, parts }) => {
  // Cálculo do Resumo de Materiais (Global do Projeto)
  const materialSummary = useMemo(() => {
      const summary: Record<string, { count: number; area: number; name: string; thickness: number }> = {};
      
      parts.forEach(p => {
          const key = `${p.materialName} - ${Math.round(p.dimensions.thickness)}mm`;
          if (!summary[key]) {
              summary[key] = { 
                  name: p.materialName, 
                  thickness: Math.round(p.dimensions.thickness), 
                  count: 0, 
                  area: 0 
              };
          }
          summary[key].count += p.quantity;
          // Área em m² (Largura * Altura * Quantidade / 1.000.000)
          summary[key].area += (p.dimensions.width * p.dimensions.height * p.quantity) / 1000000;
      });

      return Object.values(summary).sort((a, b) => b.count - a.count);
  }, [parts]);

  if (!result) {
    return (
        <div className="flex flex-col items-center justify-center h-[60vh] text-slate-400">
            <FileText size={64} className="mb-4 opacity-50"/>
            <h3 className="text-xl font-bold text-slate-700 mb-2">Relatório Indisponível</h3>
            <p className="max-w-md text-center">
                Gere um plano de corte na aba <strong>Resultados</strong> para visualizar o relatório completo.
            </p>
        </div>
    );
  }

  const costPerCut = config.costPerCut || 0;
  const totalCutCost = result.totalCutsCount * costPerCut;
  const totalAreaM2 = result.totalUsedArea / 1000000;

  // Identifica o material do plano atual para destaque
  const currentMaterialKey = result.meta ? `${result.meta.materialName} - ${result.meta.thickness}mm` : "";

  return (
    <div className="max-w-5xl mx-auto mt-8 pb-20 animate-fade-in px-4">
        <div className="flex justify-between items-center mb-8 no-print">
            <div>
                <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3 uppercase tracking-tighter">
                    <FileText className="text-blue-600" size={32} /> Relatório de Produção
                </h2>
                <p className="text-slate-500 font-medium ml-1">Projeto: {projectName}</p>
            </div>
            <button 
                onClick={() => window.print()} 
                className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-black transition-all flex items-center gap-2"
            >
                <Printer size={18} /> Imprimir Relatório
            </button>
        </div>

        {/* PRINTABLE AREA */}
        <div className="bg-white p-10 rounded-3xl shadow-xl border border-slate-200 print:shadow-none print:border-none print:p-0">
            
            {/* Header Report */}
            <div className="border-b-4 border-slate-900 pb-6 mb-8 flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 uppercase">Relatório Técnico</h1>
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mt-2">Análise de Custos e Eficiência</p>
                </div>
                <div className="text-right">
                    <div className="text-xs font-bold text-slate-400 uppercase">Data de Emissão</div>
                    <div className="text-lg font-bold text-slate-800">{new Date().toLocaleDateString()}</div>
                </div>
            </div>

            {/* KPIs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                
                {/* 1. Chapas */}
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                    <div className="flex items-center gap-3 mb-2 text-slate-500">
                        <Layers size={20} />
                        <span className="text-xs font-black uppercase tracking-widest">Chapas Utilizadas</span>
                    </div>
                    <p className="text-4xl font-black text-slate-800">{result.totalSheets} <span className="text-sm font-medium text-slate-400">unidades</span></p>
                </div>

                {/* 2. Aproveitamento */}
                <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100">
                    <div className="flex items-center gap-3 mb-2 text-emerald-600">
                        <BarChart3 size={20} />
                        <span className="text-xs font-black uppercase tracking-widest">Eficiência Global</span>
                    </div>
                    <p className="text-4xl font-black text-emerald-700">{((1 - result.globalWastePercentage) * 100).toFixed(1)}%</p>
                    <p className="text-xs font-medium text-emerald-600 mt-1">Área Útil: {totalAreaM2.toFixed(2)} m²</p>
                </div>

                {/* 3. Tempo Estimado */}
                <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
                    <div className="flex items-center gap-3 mb-2 text-blue-600">
                        <Clock size={20} />
                        <span className="text-xs font-black uppercase tracking-widest">Tempo de Corte</span>
                    </div>
                    <p className="text-4xl font-black text-blue-700">{Math.ceil(result.estimatedTime)} <span className="text-sm font-medium text-blue-500">min</span></p>
                </div>
            </div>

            {/* SEÇÃO RESUMO DE MATERIAIS (NOVO) */}
            <div className="mb-10">
                <h3 className="text-lg font-black text-slate-800 uppercase border-b border-slate-200 pb-2 mb-6 flex items-center gap-2">
                    <LayoutDashboard size={20} className="text-slate-900"/> Resumo de Materiais do Projeto
                </h3>
                
                <table className="w-full text-sm text-left border border-slate-200 rounded-lg overflow-hidden">
                    <thead className="bg-slate-100 text-slate-500 font-bold uppercase text-xs">
                        <tr>
                            <th className="p-3">Material</th>
                            <th className="p-3 text-center">Espessura</th>
                            <th className="p-3 text-center">Qtd. Peças</th>
                            <th className="p-3 text-right">Área Total (m²)</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {materialSummary.map((item, idx) => {
                            const isCurrent = `${item.name} - ${item.thickness}mm` === currentMaterialKey;
                            return (
                                <tr key={idx} className={`${isCurrent ? 'bg-blue-50 border-l-4 border-l-blue-500' : 'hover:bg-slate-50'}`}>
                                    <td className="p-3 font-bold text-slate-700">
                                        {item.name}
                                        {isCurrent && <span className="ml-2 text-[9px] bg-blue-600 text-white px-2 py-0.5 rounded-full uppercase tracking-wider">Plano Atual</span>}
                                    </td>
                                    <td className="p-3 text-center font-mono text-slate-500">{item.thickness}mm</td>
                                    <td className="p-3 text-center font-bold text-slate-800">{item.count}</td>
                                    <td className="p-3 text-right font-mono text-slate-600">{item.area.toFixed(2)} m²</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* SEÇÃO DE CUSTOS DE CORTE */}
            <div className="mb-10">
                <h3 className="text-lg font-black text-slate-800 uppercase border-b border-slate-200 pb-2 mb-6 flex items-center gap-2">
                    <Scissors size={20} className="text-slate-900"/> Operação de Corte (Plano Atual)
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-white border-2 border-slate-100 rounded-2xl p-6 flex flex-col justify-between">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <Activity size={18} className="text-amber-500" />
                                <span className="text-xs font-bold text-slate-400 uppercase">Total de Deslocamentos</span>
                            </div>
                            <p className="text-sm text-slate-500 mb-4">
                                Quantidade de vezes que a serra se desloca na linha total (considerando peças e sobras/refilos).
                            </p>
                        </div>
                        <div className="text-3xl font-black text-slate-800">
                            {result.totalCutsCount} <span className="text-sm font-bold text-slate-400">passadas</span>
                        </div>
                    </div>

                    <div className="bg-white border-2 border-slate-100 rounded-2xl p-6 flex flex-col justify-between">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <DollarSign size={18} className="text-green-600" />
                                <span className="text-xs font-bold text-slate-400 uppercase">Custo Estimado de Corte</span>
                            </div>
                            <p className="text-sm text-slate-500 mb-4">
                                Baseado no valor configurado de <strong>{costPerCut.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong> por deslocamento.
                            </p>
                        </div>
                        <div className="text-3xl font-black text-green-700">
                            {totalCutCost.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabela de Detalhes por Chapa */}
            <div>
                <h3 className="text-lg font-black text-slate-800 uppercase border-b border-slate-200 pb-2 mb-6">Detalhamento por Chapa</h3>
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-100 text-slate-500 font-bold uppercase text-xs">
                        <tr>
                            <th className="p-3 rounded-l-lg">Chapa</th>
                            <th className="p-3">Dimensão</th>
                            <th className="p-3 text-center">Peças</th>
                            <th className="p-3 text-center">Deslocamentos</th>
                            <th className="p-3 text-right rounded-r-lg">Aproveitamento</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {result.sheets.map((sheet) => (
                            <tr key={sheet.id}>
                                <td className="p-3 font-bold text-slate-700">#{sheet.id}</td>
                                <td className="p-3 font-mono text-slate-500">{sheet.width} x {sheet.height}</td>
                                <td className="p-3 text-center font-bold">{sheet.parts.length}</td>
                                <td className="p-3 text-center font-mono text-slate-600">{sheet.cutsCount}</td>
                                <td className="p-3 text-right font-bold text-emerald-600">{((1 - sheet.wastePercentage) * 100).toFixed(1)}%</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

        </div>
    </div>
  );
};
