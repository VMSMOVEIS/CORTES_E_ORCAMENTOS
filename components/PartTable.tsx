
import React from 'react';
import { ProcessedPart, RegisteredMaterial, EdgeBanding, EdgeType, RegisteredEdgeBand } from '../types';
import { Trash2, Copy, PlusCircle, Palette } from 'lucide-react';

interface PartTableProps {
  parts: ProcessedPart[];
  availableMaterials: RegisteredMaterial[];
  availableEdgeBands: RegisteredEdgeBand[];
  onUpdatePart: (id: string, field: string, value: any) => void;
  onDeletePart: (id: string) => void;
  onDuplicatePart: (id: string) => void;
  onAddPart: () => void;
}

// Helper checkbox component
const EdgeCheckbox = ({ checked, onClick, colorClass = "bg-slate-700 border-slate-700" }: { checked: boolean; onClick: () => void, colorClass?: string }) => (
    <div 
        onClick={onClick}
        className={`w-3.5 h-3.5 border rounded-sm cursor-pointer transition-all ${
            checked 
                ? colorClass 
                : 'bg-white border-slate-300 hover:border-blue-400'
        }`}
    >
        {checked && <div className="w-full h-full flex items-center justify-center text-white"><div className="w-1.5 h-1.5 bg-white rounded-[1px]"></div></div>}
    </div>
);

interface EdgeSelectorProps {
  edges: EdgeBanding;
  onUpdate: (edges: EdgeBanding) => void;
}

const EdgeSelector: React.FC<EdgeSelectorProps> = ({ edges, onUpdate }) => {
    
    const handleToggle = (side: keyof EdgeBanding, type: EdgeType) => {
        const current = edges[side];
        // If clicking same type -> toggle off (none)
        // If clicking different type -> switch to that type
        const newType = current === type ? 'none' : type;
        onUpdate({ ...edges, [side]: newType });
    };

    return (
        <div className="flex flex-col gap-1 w-full max-w-[120px] mx-auto select-none">
            {/* ROW 1: SOLID (Sólida) */}
            <div className="flex items-center justify-between gap-1">
                <span className="text-[9px] font-bold text-slate-500 uppercase w-8 text-right">Sólida</span>
                <div className="flex gap-1 bg-slate-50 p-0.5 rounded border border-slate-100">
                    <EdgeCheckbox checked={edges.long1 === 'solid'} onClick={() => handleToggle('long1', 'solid')} />
                    <EdgeCheckbox checked={edges.long2 === 'solid'} onClick={() => handleToggle('long2', 'solid')} />
                </div>
                <div className="flex gap-1 bg-slate-50 p-0.5 rounded border border-slate-100">
                    <EdgeCheckbox checked={edges.short1 === 'solid'} onClick={() => handleToggle('short1', 'solid')} />
                    <EdgeCheckbox checked={edges.short2 === 'solid'} onClick={() => handleToggle('short2', 'solid')} />
                </div>
            </div>

            {/* ROW 2: DASHED (Tracejada / Pont.) */}
            <div className="flex items-center justify-between gap-1">
                <span className="text-[9px] font-bold text-blue-600 uppercase w-8 text-right">Pont.</span>
                <div className="flex gap-1 bg-blue-50 p-0.5 rounded border border-blue-100">
                    <EdgeCheckbox checked={edges.long1 === 'dashed'} onClick={() => handleToggle('long1', 'dashed')} colorClass="bg-blue-600 border-blue-600" />
                    <EdgeCheckbox checked={edges.long2 === 'dashed'} onClick={() => handleToggle('long2', 'dashed')} colorClass="bg-blue-600 border-blue-600" />
                </div>
                <div className="flex gap-1 bg-blue-50 p-0.5 rounded border border-blue-100">
                    <EdgeCheckbox checked={edges.short1 === 'dashed'} onClick={() => handleToggle('short1', 'dashed')} colorClass="bg-blue-600 border-blue-600" />
                    <EdgeCheckbox checked={edges.short2 === 'dashed'} onClick={() => handleToggle('short2', 'dashed')} colorClass="bg-blue-600 border-blue-600" />
                </div>
            </div>

            {/* ROW 3: COLORED (2ª Cor) */}
            <div className="flex items-center justify-between gap-1">
                <span className="text-[9px] font-bold text-amber-600 uppercase w-8 text-right leading-none">2ª Cor</span>
                <div className="flex gap-1 bg-amber-50 p-0.5 rounded border border-amber-100">
                    <EdgeCheckbox checked={edges.long1 === 'colored'} onClick={() => handleToggle('long1', 'colored')} colorClass="bg-amber-600 border-amber-600" />
                    <EdgeCheckbox checked={edges.long2 === 'colored'} onClick={() => handleToggle('long2', 'colored')} colorClass="bg-amber-600 border-amber-600" />
                </div>
                <div className="flex gap-1 bg-amber-50 p-0.5 rounded border border-amber-100">
                    <EdgeCheckbox checked={edges.short1 === 'colored'} onClick={() => handleToggle('short1', 'colored')} colorClass="bg-amber-600 border-amber-600" />
                    <EdgeCheckbox checked={edges.short2 === 'colored'} onClick={() => handleToggle('short2', 'colored')} colorClass="bg-amber-600 border-amber-600" />
                </div>
            </div>
        </div>
    );
};

export const PartTable: React.FC<PartTableProps> = ({ parts, availableMaterials, availableEdgeBands, onUpdatePart, onDeletePart, onDuplicatePart, onAddPart }) => {
  return (
    <div className="flex flex-col gap-3 w-full">
        <div className="w-full bg-white border border-slate-300 rounded-lg shadow-sm overflow-hidden">
        {/* 'table-fixed' força as larguras definidas nos THs e evita scroll */}
        <table className="w-full text-left text-sm text-slate-700 table-fixed border-collapse">
            <thead className="bg-slate-100 text-xs uppercase text-slate-600 font-bold leading-tight">
            <tr>
                <th className="px-2 py-3 w-10 text-center border border-slate-300">#</th>
                <th className="px-2 py-3 w-24 border border-slate-300">Projeto</th>
                <th className="px-2 py-3 w-28 border border-slate-300">Material</th>
                <th className="px-2 py-3 w-auto border border-slate-300">Nome da Peça</th> 
                <th className="px-1 py-3 w-20 text-right border border-slate-300">Comp.</th>
                <th className="px-1 py-3 w-20 text-right border border-slate-300">Larg.</th>
                <th className="px-1 py-3 w-10 text-center border border-slate-300">Esp.</th>
                <th className="px-1 py-3 w-36 text-center border border-slate-300">
                    <div className="flex justify-center gap-4">
                        <span>Comp. (C)</span>
                        <span>Larg. (L)</span>
                    </div>
                </th>
                <th className="px-1 py-3 w-10 text-center border border-slate-300">Qtd</th>
                <th className="px-2 py-3 w-24 text-center border border-slate-300">Cores Fitas</th>
                <th className="px-2 py-3 w-40 border border-slate-300">Obs.</th> 
                <th className="px-2 py-3 w-14 text-center border border-slate-300"></th>
            </tr>
            </thead>
            <tbody className="bg-white">
            {parts.map((part) => {
                // Check if any edge is marked as 'colored'
                const hasColoredEdge = 
                    part.edges?.long1 === 'colored' || 
                    part.edges?.long2 === 'colored' || 
                    part.edges?.short1 === 'colored' || 
                    part.edges?.short2 === 'colored';

                return (
                <tr key={part.id} className="hover:bg-blue-50/50 transition-colors group">
                <td className="px-1 py-2 text-center font-bold text-slate-400 truncate text-xs border border-slate-300">
                    {part.displayId}
                </td>

                <td className="px-1 py-2 border border-slate-300">
                    <input 
                        type="text" 
                        title={part.sourceFile}
                        value={part.sourceFile}
                        onChange={(e) => onUpdatePart(part.id, 'sourceFile', e.target.value)}
                        className="bg-transparent border border-transparent hover:border-slate-300 focus:border-blue-500 rounded px-1 py-1 w-full text-xs font-medium text-blue-600 outline-none transition-all truncate placeholder:text-blue-300"
                        placeholder="Nome do Projeto"
                    />
                </td>

                <td className="px-1 py-2 border border-slate-300">
                    <select 
                        value={part.materialName}
                        onChange={(e) => {
                            onUpdatePart(part.id, 'materialName', e.target.value);
                            const found = availableMaterials.find(m => m.name === e.target.value);
                            if (found) {
                                onUpdatePart(part.id, 'thickness', found.thickness);
                            }
                        }}
                        className="w-full bg-transparent border border-transparent hover:border-slate-300 focus:border-blue-500 rounded px-1 py-1 text-xs font-semibold text-slate-700 outline-none truncate"
                        title={part.materialName}
                    >
                        {!availableMaterials.some(m => m.name === part.materialName) && (
                            <option value={part.materialName}>{part.materialName} (Original)</option>
                        )}
                        {availableMaterials.map(mat => (
                            <option key={mat.id} value={mat.name}>{mat.name}</option>
                        ))}
                    </select>
                </td>
                
                <td className="px-1 py-2 border border-slate-300">
                    <input 
                        type="text" 
                        title={part.finalName}
                        value={part.finalName}
                        onChange={(e) => onUpdatePart(part.id, 'finalName', e.target.value)}
                        className="bg-transparent border border-transparent hover:border-slate-300 focus:border-blue-500 rounded px-1 py-1 w-full text-slate-900 outline-none transition-all font-medium truncate"
                    />
                </td>

                <td className="px-1 py-2 text-right border border-slate-300">
                    <input 
                        type="number"
                        value={part.dimensions.height}
                        onChange={(e) => onUpdatePart(part.id, 'height', Number(e.target.value))}
                        className="w-full text-right text-slate-700 font-mono bg-transparent border border-transparent hover:border-slate-300 rounded px-1 py-1 focus:border-blue-500 outline-none"
                    />
                </td>
                <td className="px-1 py-2 text-right border border-slate-300">
                    <input 
                        type="number"
                        value={part.dimensions.width}
                        onChange={(e) => onUpdatePart(part.id, 'width', Number(e.target.value))}
                        className="w-full text-right text-slate-700 font-mono bg-transparent border border-transparent hover:border-slate-300 rounded px-1 py-1 focus:border-blue-500 outline-none"
                    />
                </td>
                
                <td className="px-1 py-2 text-center border border-slate-300">
                    <input 
                        type="number"
                        value={part.dimensions.thickness}
                        onChange={(e) => onUpdatePart(part.id, 'thickness', e.target.value)}
                        className="w-full text-center font-bold text-amber-600 bg-transparent border-b border-dashed border-amber-200 hover:border-amber-500 focus:border-amber-600 focus:bg-amber-50 outline-none px-0 py-1"
                    />
                </td>
                
                {/* EDGE SELECTOR */}
                <td className="px-1 py-1 text-center align-middle border border-slate-300">
                    <EdgeSelector 
                        edges={part.edges || { long1: 'none', long2: 'none', short1: 'none', short2: 'none' }} 
                        onUpdate={(newEdges) => onUpdatePart(part.id, 'edges', newEdges)}
                    />
                </td>

                <td className="px-1 py-2 text-center border border-slate-300">
                    <input 
                        type="number" 
                        min="1"
                        value={part.quantity}
                        onChange={(e) => onUpdatePart(part.id, 'quantity', parseInt(e.target.value) || 0)}
                        className="bg-slate-50 border border-slate-200 rounded w-full text-center text-blue-600 font-bold outline-none focus:border-blue-500 py-1"
                    />
                </td>

                {/* EDGE BAND COLOR SELECTOR - DISABLED IF NO COLORED EDGE */}
                <td className="px-1 py-2 text-center border border-slate-300">
                    <select
                        value={part.detectedEdgeColor || ''}
                        onChange={(e) => onUpdatePart(part.id, 'detectedEdgeColor', e.target.value)}
                        disabled={!hasColoredEdge}
                        className={`w-full bg-transparent border border-transparent hover:border-slate-300 focus:border-blue-500 rounded px-1 py-1 text-[10px] font-bold outline-none truncate transition-opacity ${
                            !hasColoredEdge ? 'opacity-30 cursor-not-allowed bg-slate-100' : ''
                        } ${
                            part.detectedEdgeColor ? 'text-amber-700 bg-amber-50 border-amber-100' : 'text-slate-400'
                        }`}
                        title={hasColoredEdge ? (part.detectedEdgeColor || 'Padrão do Material') : 'Habilite "2ª Cor" nas bordas para alterar'}
                    >
                        <option value="">Padrão (Material)</option>
                        {availableEdgeBands.map(eb => (
                            <option key={eb.id} value={eb.name}>{eb.name}</option>
                        ))}
                        {part.detectedEdgeColor && !availableEdgeBands.some(eb => eb.name === part.detectedEdgeColor) && (
                            <option value={part.detectedEdgeColor}>{part.detectedEdgeColor} (Original)</option>
                        )}
                    </select>
                </td>

                {/* OBSERVAÇÃO */}
                <td className="px-1 py-2 border border-slate-300">
                    <input 
                        type="text"
                        placeholder="..."
                        title={part.notes?.join(' ') || ''}
                        value={part.notes?.join(' ') || ''}
                        onChange={(e) => onUpdatePart(part.id, 'notes', [e.target.value])}
                        className="w-full bg-transparent border-b border-dashed border-slate-200 hover:border-blue-400 focus:border-blue-600 focus:bg-blue-50 outline-none text-xs text-slate-600 px-1 py-1"
                    />
                </td>

                <td className="px-1 py-2 text-center border border-slate-300">
                    <div className="flex items-center justify-center gap-1">
                        <button 
                            onClick={() => onDuplicatePart(part.id)}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="Duplicar Peça"
                        >
                            <Copy size={16} />
                        </button>
                        <button 
                            onClick={() => onDeletePart(part.id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Remover Peça"
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
        
        <button 
            onClick={onAddPart}
            className="flex items-center justify-center gap-2 w-full py-3 bg-white border border-dashed border-slate-300 rounded text-slate-500 font-bold hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-all text-sm"
        >
            <PlusCircle size={18} />
            Adicionar Peça Manualmente
        </button>
    </div>
  );
};
