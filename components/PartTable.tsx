
import React from 'react';
import { ProcessedPart, RegisteredMaterial, EdgeBanding, EdgeType, RegisteredEdgeBand } from '../types';
import { Trash2, Copy, PlusCircle, Palette, ArrowLeftRight, Wrench, FileOutput, SlidersHorizontal, ChevronLeft, ChevronRight } from 'lucide-react';

interface PartTableProps {
  parts: ProcessedPart[];
  availableMaterials: RegisteredMaterial[];
  availableEdgeBands: RegisteredEdgeBand[];
  onUpdatePart: (id: string, field: string, value: any) => void;
  onDeletePart: (id: string) => void;
  onMoveToHardware: (id: string) => void;
  onDuplicatePart: (id: string) => void;
  onAddPart: () => void;
}

// Helper checkbox component
const EdgeCheckbox = ({ checked, onClick, colorClass = "bg-slate-700 border-slate-700" }: { checked: boolean; onClick: () => void, colorClass?: string }) => (
    <div 
        onClick={onClick}
        className={`w-4 h-4 border rounded cursor-pointer transition-all flex items-center justify-center ${
            checked 
                ? colorClass 
                : 'bg-white border-slate-300 hover:border-blue-400 shadow-sm'
        }`}
    >
        {checked && <div className="w-2 h-2 bg-white rounded-sm"></div>}
    </div>
);

interface EdgeSelectorProps {
  edges: EdgeBanding;
  onUpdate: (edges: EdgeBanding) => void;
  type: 'comp' | 'larg';
}

const EdgeSelector: React.FC<EdgeSelectorProps> = ({ edges, onUpdate, type }) => {
    
    const handleToggle = (side: keyof EdgeBanding, edgeType: EdgeType) => {
        const current = edges[side];
        const newType = current === edgeType ? 'none' : edgeType;
        onUpdate({ ...edges, [side]: newType });
    };

    const side1 = type === 'comp' ? 'long1' : 'short1';
    const side2 = type === 'comp' ? 'long2' : 'short2';

    return (
        <div className="flex flex-col gap-1.5 py-1">
            {/* ROW 1: SOLID */}
            <div className="flex items-center gap-2">
                <span className="text-[8px] font-black text-slate-400 uppercase w-10 text-right leading-none">Sólida</span>
                <div className="flex gap-1.5">
                    <EdgeCheckbox checked={edges[side1] === 'solid'} onClick={() => handleToggle(side1, 'solid')} />
                    <EdgeCheckbox checked={edges[side2] === 'solid'} onClick={() => handleToggle(side2, 'solid')} />
                </div>
            </div>

            {/* ROW 2: DASHED */}
            <div className="flex items-center gap-2">
                <span className="text-[8px] font-black text-blue-500 uppercase w-10 text-right leading-none">Pont.</span>
                <div className="flex gap-1.5">
                    <EdgeCheckbox checked={edges[side1] === 'dashed'} onClick={() => handleToggle(side1, 'dashed')} colorClass="bg-blue-600 border-blue-600" />
                    <EdgeCheckbox checked={edges[side2] === 'dashed'} onClick={() => handleToggle(side2, 'dashed')} colorClass="bg-blue-600 border-blue-600" />
                </div>
            </div>

            {/* ROW 3: COLORED */}
            <div className="flex items-center gap-2">
                <span className="text-[8px] font-black text-amber-500 uppercase w-10 text-right leading-none whitespace-nowrap">2ª Cor</span>
                <div className="flex gap-1.5">
                    <EdgeCheckbox checked={edges[side1] === 'colored'} onClick={() => handleToggle(side1, 'colored')} colorClass="bg-amber-500 border-amber-500" />
                    <EdgeCheckbox checked={edges[side2] === 'colored'} onClick={() => handleToggle(side2, 'colored')} colorClass="bg-amber-500 border-amber-500" />
                </div>
            </div>
        </div>
    );
};

export const PartTable: React.FC<PartTableProps> = ({ parts, availableMaterials, availableEdgeBands, onUpdatePart, onDeletePart, onMoveToHardware, onDuplicatePart, onAddPart }) => {
  return (
    <div className="flex flex-col gap-4 w-full">
        {/* TABS FOR VIEW FILTERING (MOCK FOR VISUAL) */}
        <div className="flex items-center gap-2 mb-2 h-10">
            {['Todas as Peças', 'Estruturais', 'Portas', 'Prateleiras', 'Fundos', 'Diversos'].map((tab, i) => (
                <button key={i} className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-tight transition-all ${i === 0 ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'bg-white border border-slate-200 text-slate-400 hover:text-slate-600'}`}>
                    {tab}
                </button>
            ))}
            <div className="flex-1"></div>
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-[10px] font-black uppercase hover:bg-slate-50">
                <FileOutput size={14}/> Exportar Planilha
            </button>
            <button className="p-2 bg-white border border-slate-200 text-slate-400 rounded-lg hover:text-blue-600">
                <SlidersHorizontal size={16}/>
            </button>
        </div>

        <div className="w-full bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm text-slate-700 table-fixed border-collapse">
            <thead className="bg-[#f8f9fb] text-[10px] uppercase text-slate-400 font-black leading-tight border-b border-slate-200">
            <tr>
                <th className="px-3 py-4 w-10 text-center">#</th>
                <th className="px-3 py-4 w-28 border-l border-slate-100">Projeto</th>
                <th className="px-3 py-4 w-36 border-l border-slate-100">Material</th>
                <th className="px-3 py-4 border-l border-slate-100">Nome da Peça</th> 
                <th className="px-2 py-4 w-20 text-right border-l border-slate-100">Comp.</th>
                <th className="px-2 py-4 w-20 text-right border-l border-slate-100">Larg.</th>
                <th className="px-2 py-4 w-14 text-center border-l border-slate-100">Esp.</th>
                <th className="px-3 py-4 w-28 text-center border-l border-slate-100">Comp. (C)</th>
                <th className="px-3 py-4 w-28 text-center border-l border-slate-100">Larg. (L)</th>
                <th className="px-2 py-4 w-14 text-center border-l border-slate-100">Qtd.</th>
                <th className="px-3 py-4 w-32 border-l border-slate-100">Cores / Fitas</th>
                <th className="px-3 py-4 w-24 border-l border-slate-100">Obs.</th> 
                <th className="px-3 py-4 w-28 text-center border-l border-slate-100">Ações</th>
            </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
            {parts.map((part) => {
                const hasColoredEdge = 
                    part.edges?.long1 === 'colored' || 
                    part.edges?.long2 === 'colored' || 
                    part.edges?.short1 === 'colored' || 
                    part.edges?.short2 === 'colored';

                const mat = availableMaterials.find(m => m.name === part.materialName);

                return (
                <tr key={part.id} className="hover:bg-blue-50/20 transition-colors group">
                <td className="px-3 py-4 text-center font-bold text-slate-300 text-xs">
                    {part.displayId}
                </td>

                <td className="px-3 py-4">
                    <input 
                        type="text" 
                        value={part.sourceFile}
                        onChange={(e) => onUpdatePart(part.id, 'sourceFile', e.target.value)}
                        className="bg-transparent text-xs font-black text-blue-600 uppercase outline-none truncate w-full"
                    />
                </td>

                <td className="px-3 py-4">
                    <select 
                        value={part.materialName}
                        onChange={(e) => {
                            onUpdatePart(part.id, 'materialName', e.target.value);
                            const found = availableMaterials.find(m => m.name === e.target.value);
                            if (found) {
                                onUpdatePart(part.id, 'thickness', found.thickness);
                            }
                        }}
                        className="w-full bg-slate-50 border border-slate-100 rounded px-2 py-1 text-[11px] font-bold text-slate-700 outline-none truncate cursor-pointer hover:border-blue-300"
                    >
                        {!availableMaterials.some(m => m.name === part.materialName) && (
                            <option value={part.materialName}>{part.materialName}</option>
                        )}
                        {availableMaterials.map(mat => (
                            <option key={mat.id} value={mat.name}>{mat.name}</option>
                        ))}
                    </select>
                </td>
                
                <td className="px-3 py-4">
                    <input 
                        type="text" 
                        value={part.finalName}
                        onChange={(e) => onUpdatePart(part.id, 'finalName', e.target.value)}
                        className="bg-transparent text-sm font-black text-slate-800 outline-none w-full"
                    />
                </td>

                <td className="px-2 py-4 text-right">
                    <input 
                        type="number"
                        value={part.dimensions.height}
                        onChange={(e) => onUpdatePart(part.id, 'height', Number(e.target.value))}
                        className="w-full text-right text-slate-500 font-bold bg-transparent outline-none text-xs"
                    />
                </td>
                
                <td className="px-2 py-4 text-right">
                    <input 
                        type="number"
                        value={part.dimensions.width}
                        onChange={(e) => onUpdatePart(part.id, 'width', Number(e.target.value))}
                        className="w-full text-right text-slate-500 font-bold bg-transparent outline-none text-xs"
                    />
                </td>
                
                <td className="px-2 py-4 text-center">
                    <input 
                        type="number"
                        value={part.dimensions.thickness}
                        onChange={(e) => onUpdatePart(part.id, 'thickness', e.target.value)}
                        className="w-full text-center font-black text-amber-500 bg-transparent outline-none text-xs"
                    />
                </td>
                
                {/* EDGE SELECTORS */}
                <td className="px-3 py-2 border-l border-slate-50">
                    <EdgeSelector 
                        edges={part.edges} 
                        onUpdate={(newEdges) => onUpdatePart(part.id, 'edges', newEdges)}
                        type="comp"
                    />
                </td>
                <td className="px-3 py-2 border-l border-slate-50">
                    <EdgeSelector 
                        edges={part.edges} 
                        onUpdate={(newEdges) => onUpdatePart(part.id, 'edges', newEdges)}
                        type="larg"
                    />
                </td>

                <td className="px-2 py-4 text-center">
                    <input 
                        type="number" 
                        min="1"
                        value={part.quantity}
                        onChange={(e) => onUpdatePart(part.id, 'quantity', parseInt(e.target.value) || 0)}
                        className="bg-blue-50/50 border border-blue-100 rounded-lg w-10 py-2 text-center text-blue-700 font-black outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                    />
                </td>

                <td className="px-3 py-4">
                    <select
                        value={part.detectedEdgeColor || ''}
                        onChange={(e) => onUpdatePart(part.id, 'detectedEdgeColor', e.target.value)}
                        className={`w-full bg-slate-50 border border-slate-100 rounded px-2 py-1.5 text-[11px] font-bold text-slate-600 outline-none truncate hover:border-blue-300 ${!hasColoredEdge ? 'opacity-40' : ''}`}
                    >
                        <option value="">{mat?.name?.includes('Branco') ? 'Branco' : 'Veneer'}</option>
                        {availableEdgeBands.map(eb => (
                            <option key={eb.id} value={eb.name}>{eb.name}</option>
                        ))}
                    </select>
                </td>

                <td className="px-3 py-4">
                    <div className="text-[10px] font-medium text-slate-400 italic">...</div>
                </td>

                <td className="px-3 py-4">
                    <div className="flex items-center justify-center gap-2">
                        <button 
                            onClick={() => onDuplicatePart(part.id)}
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all border border-transparent hover:border-blue-100"
                        >
                            <Copy size={16} />
                        </button>
                        <button 
                            onClick={() => onDeletePart(part.id)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all border border-transparent hover:border-red-100"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                </td>
                </tr>
            )})}
            </tbody>
        </table>
        </div>
        
        <div className="flex justify-between items-center py-4 bg-[#f8f9fb] px-6 rounded-2xl border border-slate-200">
            <span className="text-xs font-black text-slate-400 uppercase tracking-tight">Mostrando 1 a {parts.length} de {parts.length} peças</span>
            <div className="flex gap-1">
                <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:bg-white"><ChevronLeft size={16}/></button>
                <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-600 text-white font-black text-xs shadow-lg shadow-blue-100">1</button>
                <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-700 font-bold text-xs hover:bg-white">2</button>
                <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-700 font-bold text-xs hover:bg-white">3</button>
                <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:bg-white"><ChevronRight size={16}/></button>
            </div>
        </div>

        <button 
            onClick={onAddPart}
            className="flex items-center justify-center gap-2 w-full py-4 bg-white border border-dashed border-slate-300 rounded-2xl text-slate-500 font-black uppercase text-[10px] tracking-widest hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-all shadow-sm"
        >
            <PlusCircle size={18} />
            Adicionar Peça Manualmente
        </button>
    </div>
  );
};
