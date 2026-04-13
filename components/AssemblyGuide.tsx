
import React, { useMemo, useState, useEffect } from 'react';
import { ProcessedPart, RegisteredHardware } from '../types';
import { generateAssemblyJSON } from '../services/assemblyEngine';
import { ScrewDrawing, DowelDrawing, HingeDrawing, MinifixDrawing, NailDrawing } from './HardwareIcons';
import { Printer, Box, Camera, Trash, Upload, FileText, X, Settings2, PlusCircle, MinusCircle, Image as ImageIcon, Crosshair, ChevronDown, ChevronUp } from 'lucide-react';

interface AssemblyGuideProps {
  parts: ProcessedPart[];
  projectName: string;
  hardwareRegistry: RegisteredHardware[];
}

interface LocalAssemblyStep {
    id: string;
    title: string;
    description: string;
    image: string | null;
}

export const AssemblyGuide: React.FC<AssemblyGuideProps> = ({ parts, projectName, hardwareRegistry }) => {
  // --- STATE DE SELEÇÃO DE PROJETO ---
  const projectSources = useMemo(() => {
      const sources = Array.from(new Set(parts.map(p => p.sourceFile || "Desconhecido")));
      return sources.sort();
  }, [parts]);

  const [activeTab, setActiveTab] = useState<string>(projectSources[0] || "Desconhecido");

  // Filtra peças do projeto ativo
  const activeParts = useMemo(() => {
      return parts.filter(p => (p.sourceFile || "Desconhecido") === activeTab)
                  .sort((a,b) => parseInt(a.displayId) - parseInt(b.displayId));
  }, [parts, activeTab]);

  // --- CÁLCULO AUTOMÁTICO (E EDITÁVEL) DE FERRAGENS ---
  const [hardwareList, setHardwareList] = useState<{ nome: string; quantidade: number; uso: string }[]>([]);
  const [showHardwareModal, setShowHardwareModal] = useState(false);
  
  // --- STATE DE PASSOS DE MONTAGEM ---
  const [steps, setSteps] = useState<LocalAssemblyStep[]>([]);

  useEffect(() => {
      const autoData = generateAssemblyJSON(activeParts, activeTab);
      setHardwareList(autoData.ferragens);
      
      // Map generated steps to local state
      if (autoData.modulos && autoData.modulos.length > 0) {
          const generatedSteps = autoData.modulos[0].passos.map(p => ({
              id: `auto_${p.passo}`,
              title: `${p.passo}º Passo - ${p.titulo}`,
              description: `${p.descricao_tecnica} ${p.observacoes ? `(${p.observacoes})` : ''}`,
              image: null
          }));
          setSteps(generatedSteps);
      } else {
          setSteps([{ id: '1', title: '1º Passo', description: 'Preparação das laterais e fixação das corrediças.', image: null }]);
      }
  }, [activeParts, activeTab]);

  // --- HANDLERS ---

  const handleStepImageUpload = (e: React.ChangeEvent<HTMLInputElement>, stepId: string) => {
    const file = e.target.files?.[0];
    if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
            setSteps(prev => prev.map(s => s.id === stepId ? { ...s, image: reader.result as string } : s));
        };
        reader.readAsDataURL(file);
    }
  };

  const addStep = () => {
      const newId = (steps.length + 1).toString();
      setSteps(prev => [...prev, { id: Date.now().toString(), title: `${newId}º Passo`, description: '', image: null }]);
  };

  const removeStep = (id: string) => {
      setSteps(prev => prev.filter(s => s.id !== id));
  };

  const updateStep = (id: string, field: keyof LocalAssemblyStep, value: string) => {
      setSteps(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  // --- HARDWARE EDIT HANDLERS ---
  const updateHardware = (index: number, field: string, val: any) => {
      setHardwareList(prev => {
          const next = [...prev];
          next[index] = { ...next[index], [field]: val };
          return next;
      });
  };
  const removeHardware = (index: number) => setHardwareList(prev => prev.filter((_, i) => i !== index));
  const addHardware = (reg: RegisteredHardware) => {
      setHardwareList(prev => [...prev, { nome: reg.name, quantidade: 1, uso: 'Geral' }]);
  };

  // --- RENDER HELPERS ---
  const getHardwareIcon = (name: string) => {
      const reg = hardwareRegistry.find(h => h.name.toLowerCase() === name.toLowerCase());
      if (reg && reg.imageUrl) return <img src={reg.imageUrl} className="w-full h-full object-contain" />;
      if (name.includes('Parafuso')) return <ScrewDrawing className="text-slate-600"/>;
      if (name.includes('Cavilha')) return <DowelDrawing className="text-amber-700"/>;
      if (name.includes('Dobradiça')) return <HingeDrawing className="text-slate-600"/>;
      if (name.includes('Minifix')) return <MinifixDrawing className="text-slate-600"/>;
      if (name.includes('Prego')) return <NailDrawing className="text-slate-800"/>;
      return <div className="text-[10px] font-bold text-slate-400">?</div>;
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20 font-sans">
        
        {/* --- MENU SUPERIOR (TABS) --- */}
        <div className="no-print bg-white border-b border-slate-200 sticky top-0 z-30 px-6 py-3 flex justify-between items-center shadow-sm">
            <div className="flex items-center gap-4 overflow-x-auto">
                <span className="font-bold text-slate-500 flex items-center gap-2"><FileText size={18}/> Projeto:</span>
                {projectSources.map(src => (
                    <button 
                        key={src} 
                        onClick={() => setActiveTab(src)}
                        className={`px-4 py-1.5 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${activeTab === src ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                    >
                        {src}
                    </button>
                ))}
            </div>
            <button onClick={() => window.print()} className="flex items-center gap-2 bg-slate-900 hover:bg-black text-white px-4 py-2 rounded-lg font-bold shadow-lg transition-transform active:scale-95">
                <Printer size={18} /> Imprimir Manual
            </button>
        </div>

        {/* --- MODAL DE FERRAGENS --- */}
        {showHardwareModal && (
            <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm no-print">
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    <div className="p-4 border-b bg-slate-50 flex justify-between items-center">
                        <h3 className="font-bold text-lg flex items-center gap-2"><Settings2 className="text-blue-600"/> Editar Ferragens</h3>
                        <button onClick={() => setShowHardwareModal(false)}><X className="text-slate-400 hover:text-slate-800"/></button>
                    </div>
                    <div className="flex-1 flex overflow-hidden">
                        {/* Catálogo */}
                        <div className="w-1/3 border-r bg-slate-50/50 p-4 overflow-y-auto">
                            <h4 className="text-xs font-bold text-slate-400 uppercase mb-3">Adicionar do Catálogo</h4>
                            <div className="space-y-2">
                                {hardwareRegistry.map(h => (
                                    <button key={h.id} onClick={() => addHardware(h)} className="w-full flex items-center gap-2 p-2 bg-white border border-slate-200 rounded hover:border-blue-400 hover:shadow-sm text-left group">
                                        <div className="w-8 h-8 flex items-center justify-center bg-slate-100 rounded p-1">{getHardwareIcon(h.name)}</div>
                                        <span className="text-xs font-bold text-slate-700 flex-1">{h.name}</span>
                                        <PlusCircle size={16} className="text-blue-500 opacity-0 group-hover:opacity-100"/>
                                    </button>
                                ))}
                            </div>
                        </div>
                        {/* Lista Atual */}
                        <div className="flex-1 p-4 overflow-y-auto">
                            <table className="w-full text-sm">
                                <thead className="text-xs text-slate-400 uppercase border-b">
                                    <tr><th className="text-left py-2">Item</th><th className="w-20 text-center">Qtd</th><th className="text-left pl-4">Uso/Nota</th><th className="w-10"></th></tr>
                                </thead>
                                <tbody className="divide-y">
                                    {hardwareList.map((item, idx) => (
                                        <tr key={idx}>
                                            <td className="py-2 font-bold text-slate-700">{item.nome}</td>
                                            <td className="py-2"><input type="number" value={item.quantidade} onChange={(e) => updateHardware(idx, 'quantidade', Number(e.target.value))} className="w-full border rounded text-center font-bold text-blue-600"/></td>
                                            <td className="py-2 pl-4"><input type="text" value={item.uso} onChange={(e) => updateHardware(idx, 'uso', e.target.value)} className="w-full border rounded px-2 text-xs text-slate-500"/></td>
                                            <td className="py-2 text-center"><button onClick={() => removeHardware(idx)} className="text-slate-300 hover:text-red-500"><MinusCircle size={16}/></button></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div className="p-4 border-t bg-slate-50 flex justify-end">
                        <button onClick={() => setShowHardwareModal(false)} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold shadow-md hover:bg-blue-700">Concluir</button>
                    </div>
                </div>
            </div>
        )}

        {/* --- DOCUMENTO A4 --- */}
        <div className="max-w-[210mm] mx-auto my-8 print:m-0 print:w-full">
            
            {/* PÁGINA 1: CAPA E LISTAS */}
            <div className="bg-white shadow-xl print:shadow-none p-[10mm] min-h-[297mm] relative mb-8 print:break-after-page">
                {/* CABEÇALHO */}
                <div className="border-b-4 border-slate-900 pb-4 mb-8 flex justify-between items-end">
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter">Manual de Montagem</h1>
                        <p className="text-xl font-bold text-slate-500 uppercase mt-1">{activeTab}</p>
                    </div>
                    <div className="text-right">
                         <div className="text-xs font-bold text-slate-400 uppercase">Projeto</div>
                         <div className="font-bold text-slate-800 text-lg">{projectName}</div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-8">
                    {/* LISTA DE PEÇAS */}
                    <div>
                        <div className="bg-slate-100 p-2 border-b-2 border-slate-300 mb-2">
                            <h3 className="font-black text-slate-800 uppercase text-sm flex items-center gap-2"><FileText size={16}/> Lista de Peças</h3>
                        </div>
                        <table className="w-full text-xs border-collapse">
                            <thead className="bg-slate-50 text-slate-500 uppercase font-bold border-b border-slate-200">
                                <tr>
                                    <th className="p-2 text-center w-10 border-r">Nº</th>
                                    <th className="p-2 text-left border-r">Nome da Peça</th>
                                    <th className="p-2 text-center w-16 border-r">Dim.</th>
                                    <th className="p-2 text-center w-10">Qtd</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {activeParts.map((p) => (
                                    <tr key={p.id} className="hover:bg-slate-50">
                                        <td className="p-2 text-center font-black text-slate-900 border-r bg-slate-50/30">{p.displayId}</td>
                                        <td className="p-2 font-medium text-slate-700 border-r truncate max-w-[120px]">{p.finalName}</td>
                                        <td className="p-2 text-center font-mono text-slate-500 border-r text-[10px]">{Math.round(p.dimensions.height)}x{Math.round(p.dimensions.width)}</td>
                                        <td className="p-2 text-center font-bold text-slate-900">{p.quantity}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* LISTA DE FERRAGENS */}
                    <div>
                        <div className="bg-slate-100 p-2 border-b-2 border-slate-300 mb-2 flex justify-between items-center">
                            <h3 className="font-black text-slate-800 uppercase text-sm flex items-center gap-2"><Box size={16}/> Ferragens</h3>
                            <button onClick={() => setShowHardwareModal(true)} className="no-print text-[10px] text-blue-600 font-bold hover:underline">Editar</button>
                        </div>
                        <table className="w-full text-xs border-collapse">
                            <thead className="bg-slate-50 text-slate-500 uppercase font-bold border-b border-slate-200">
                                <tr>
                                    <th className="p-2 text-center w-10 border-r">Item</th>
                                    <th className="p-2 text-left border-r">Nome / Descrição</th>
                                    <th className="p-2 text-center w-10">Qtd</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {hardwareList.map((hw, i) => (
                                    <tr key={i} className="hover:bg-slate-50">
                                        <td className="p-2 text-center border-r">
                                            <div className="w-6 h-6 mx-auto border rounded flex items-center justify-center bg-white p-0.5">{getHardwareIcon(hw.nome)}</div>
                                        </td>
                                        <td className="p-2 font-medium text-slate-700 border-r">
                                            <div className="font-bold leading-tight">{hw.nome}</div>
                                            <div className="text-[9px] text-slate-400 leading-tight">{hw.uso}</div>
                                        </td>
                                        <td className="p-2 text-center font-black text-slate-900 bg-slate-50/30">{hw.quantidade}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* RODAPÉ DA CAPA */}
                <div className="absolute bottom-[10mm] left-[10mm] right-[10mm] border-t-2 border-slate-200 pt-4 text-center">
                    <p className="text-sm font-bold text-slate-400 uppercase">Gerado automaticamente por Smart 3D Cut Pro</p>
                </div>
            </div>

            {/* PÁGINA 2+: PASSOS DE MONTAGEM */}
            <div className="bg-white shadow-xl print:shadow-none p-[10mm] min-h-[297mm] relative">
                <div className="border-b-2 border-slate-200 pb-4 mb-8 flex justify-between items-center">
                    <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Passo a Passo</h2>
                    <button onClick={addStep} className="no-print flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-blue-700 shadow-md">
                        <PlusCircle size={16}/> Adicionar Passo
                    </button>
                </div>

                <div className="space-y-12">
                    {steps.map((step, index) => (
                        <div key={step.id} className="break-inside-avoid">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex-1">
                                    <input 
                                        type="text" 
                                        value={step.title}
                                        onChange={(e) => updateStep(step.id, 'title', e.target.value)}
                                        className="text-lg font-black text-slate-900 uppercase bg-transparent border-b border-transparent hover:border-slate-300 focus:border-blue-500 outline-none w-full mb-1"
                                        placeholder="Título do Passo"
                                    />
                                    <textarea 
                                        value={step.description}
                                        onChange={(e) => updateStep(step.id, 'description', e.target.value)}
                                        className="w-full text-sm text-slate-600 bg-transparent resize-none outline-none border border-transparent hover:border-slate-200 focus:border-blue-500 rounded p-1"
                                        rows={2}
                                        placeholder="Descreva as instruções deste passo..."
                                    />
                                </div>
                                <button onClick={() => removeStep(step.id)} className="no-print text-slate-300 hover:text-red-500 ml-4 p-1">
                                    <Trash size={18}/>
                                </button>
                            </div>

                            <div className="border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 min-h-[300px] flex items-center justify-center relative group overflow-hidden">
                                {step.image ? (
                                    <>
                                        <img src={step.image} className="max-w-full max-h-[400px] object-contain" alt={step.title} />
                                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity no-print flex gap-2">
                                            <label className="bg-white text-slate-700 p-2 rounded-lg shadow-md cursor-pointer hover:text-blue-600">
                                                <Camera size={18}/>
                                                <input type="file" className="hidden" accept="image/*" onChange={(e) => handleStepImageUpload(e, step.id)} />
                                            </label>
                                            <button onClick={() => updateStep(step.id, 'image', '')} className="bg-white text-red-600 p-2 rounded-lg shadow-md hover:bg-red-50">
                                                <Trash size={18}/>
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <label className="cursor-pointer flex flex-col items-center text-slate-400 hover:text-blue-600 transition-colors p-8">
                                        <ImageIcon size={48} className="mb-2 opacity-50"/>
                                        <span className="font-bold text-sm">Clique para adicionar imagem/diagrama</span>
                                        <input type="file" className="hidden" accept="image/*" onChange={(e) => handleStepImageUpload(e, step.id)} />
                                    </label>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

        </div>
    </div>
  );
};
