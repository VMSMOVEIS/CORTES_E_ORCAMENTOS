import React, { useState, useMemo, useEffect } from 'react';
import { Calculator, DollarSign, Package, Wrench, Percent, FileText, AlertCircle, Clock, Disc, User, Phone, MapPin, Mail, Save, Trash2, Eye, Plus, X, Calendar, Search, Copy, Printer, TrendingUp } from 'lucide-react';
import { ProcessedPart, ExtractedComponent, RegisteredMaterial, RegisteredHardware, RegisteredEdgeBand, OptimizationConfig, OptimizationResult, SavedBudget, ClientInfo } from '../types';
import { BudgetPdfModal } from './BudgetPdfModal';
import { FinancialSettings } from './FinancialSettings';

interface BudgetPanelProps {
    parts: ProcessedPart[];
    hardware: ExtractedComponent[];
    materials: RegisteredMaterial[];
    hardwareRegistry: RegisteredHardware[];
    edgeRegistry: RegisteredEdgeBand[];
    globalConfig: OptimizationConfig;
    setGlobalConfig: (config: OptimizationConfig) => void;
    optimizationResult: OptimizationResult | null;
    projectName: string;
}

export const BudgetPanel: React.FC<BudgetPanelProps> = ({ 
    parts, 
    hardware, 
    materials, 
    hardwareRegistry, 
    edgeRegistry,
    globalConfig,
    setGlobalConfig,
    optimizationResult,
    projectName
}) => {
    const [activeTab, setActiveTab] = useState<'calculator' | 'saved' | 'config'>('calculator');
    const [savedBudgets, setSavedBudgets] = useState<SavedBudget[]>(() => {
        const saved = localStorage.getItem('cutlist_saved_budgets_pro_v4');
        return saved ? JSON.parse(saved) : [];
    });
    const [showSaveModal, setShowSaveModal] = useState(false);
    const [showPdfModal, setShowPdfModal] = useState(false);
    const [selectedBudgetForPdf, setSelectedBudgetForPdf] = useState<SavedBudget | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);

    const [clientInfo, setClientInfo] = useState<ClientInfo>({
        name: '',
        phone: '',
        email: '',
        address: '',
        notes: ''
    });

    useEffect(() => {
        localStorage.setItem('cutlist_saved_budgets_pro_v4', JSON.stringify(savedBudgets));
    }, [savedBudgets]);

    const [manualMargin, setManualMargin] = useState<number | null>(null);
    const [otherCosts, setOtherCosts] = useState<number>(0);
    
    // Manual Hardware State
    const [manualHardware, setManualHardware] = useState<{id: string, name: string, quantity: number}[]>([]);
    const [showHardwareModal, setShowHardwareModal] = useState(false);
    const [newHardwareItem, setNewHardwareItem] = useState({ name: '', quantity: 1 });
    const [editingHardwareId, setEditingHardwareId] = useState<string | null>(null);

    // ... (Calculations remain the same) ...

    // 1. Calculate Material Costs & Production Time
    const materialCosts = useMemo(() => {
        // ... (existing code)
        const costs: { 
            materialName: string; 
            thickness: number; 
            area: number; 
            sheets: number; 
            unitCost: number; 
            totalCost: number;
            productionTime: number;
            isEstimated: boolean;
        }[] = [];

        // Group parts by material
        const groupedParts: Record<string, ProcessedPart[]> = {};
        parts.forEach(p => {
            const key = `${p.materialName}|${p.dimensions.thickness}`;
            if (!groupedParts[key]) groupedParts[key] = [];
            groupedParts[key].push(p);
        });

        Object.entries(groupedParts).forEach(([key, groupParts]) => {
            const [matName, thicknessStr] = key.split('|');
            const thickness = Number(thicknessStr);
            const material = materials.find(m => m.name === matName && m.thickness === thickness);
            
            // Calculate total area in m²
            const totalAreaM2 = groupParts.reduce((acc, p) => {
                return acc + (p.dimensions.width * p.dimensions.height * p.quantity) / 1000000;
            }, 0);

            // Determine number of sheets
            let sheetsCount = 0;
            let isEstimated = true;

            if (optimizationResult && optimizationResult.sheets) {
                if (optimizationResult.meta?.materialName === matName && optimizationResult.meta?.thickness === thickness) {
                    sheetsCount = optimizationResult.totalSheets;
                    isEstimated = false;
                }
            }

            const sheetArea = material?.sheetArea || (globalConfig.sheetWidth * globalConfig.sheetHeight) / 1000000;

            if (sheetsCount === 0) {
                sheetsCount = Math.ceil((totalAreaM2 * 1.2) / sheetArea);
            }

            const m2Price = (material?.cost || 0) / sheetArea;
            const totalCost = totalAreaM2 * m2Price;
            
            // Production time for material (per m²)
            // Use material specific time if available, otherwise use global default
            const prodTimePerM2 = material?.productionTime || globalConfig.minutesPerSqMeter || 0;
            const totalProdTime = totalAreaM2 * prodTimePerM2;

            costs.push({
                materialName: matName,
                thickness,
                area: totalAreaM2,
                sheets: sheetsCount,
                unitCost: m2Price,
                totalCost,
                productionTime: totalProdTime,
                isEstimated
            });
        });

        return costs;
    }, [parts, materials, optimizationResult, globalConfig]);

    // 2. Calculate Hardware Costs & Production Time
    const hardwareCosts = useMemo(() => {
        const extracted = hardware.map(hw => ({...hw, isManual: false, id: `extracted_${hw.name}`}));
        const manual = manualHardware.map(hw => ({...hw, isManual: true}));
        
        return [...extracted, ...manual].map(hw => {
            const registryItem = hardwareRegistry.find(r => r.name.toLowerCase() === hw.name.toLowerCase());
            const unitPrice = registryItem?.price || 0;
            const prodTimePerUnit = registryItem?.productionTime || 0;
            
            return {
                id: hw.id,
                name: registryItem?.name || hw.name,
                quantity: hw.quantity,
                unitPrice,
                total: hw.quantity * unitPrice,
                productionTime: hw.quantity * prodTimePerUnit,
                found: !!registryItem,
                isManual: hw.isManual
            };
        });
    }, [hardware, hardwareRegistry, manualHardware]);

    // 3. Calculate Edge Band Costs & Production Time
    const edgeBandCosts = useMemo(() => {
        const costs: Record<string, { length: number, price: number, prodTime: number, name: string }> = {};

        // Helper to find best matching edge band
        const findBestEdgeBand = (p: ProcessedPart) => {
            const edgeColor = (p.detectedEdgeColor || '').trim().toLowerCase();
            const matName = p.materialName.toLowerCase();
            
            // 1. Try exact or partial match with detected color
            if (edgeColor) {
                const match = edgeRegistry.find(r => 
                    r.name.toLowerCase() === edgeColor || 
                    r.name.toLowerCase().includes(edgeColor) ||
                    edgeColor.includes(r.name.toLowerCase())
                );
                if (match) return match;
            }

            // 2. Try to find common keywords between material name and edge bands
            const commonKeywords = ['branco', 'preto', 'cinza', 'freijó', 'louro', 'carvalho', 'nogueira', 'grafite', 'fendi', 'gianduia', 'titânio', 'metálico', 'cristal', 'gelo', 'pérola', 'areia', 'argila', 'cappuccino', 'lino', 'trama', 'couro', 'concreto', 'aço', 'cobre', 'ouro', 'prata'];
            
            const foundKeyword = commonKeywords.find(k => matName.includes(k));
            if (foundKeyword) {
                const match = edgeRegistry.find(r => r.name.toLowerCase().includes(foundKeyword));
                if (match) return match;
            }

            // 3. Try any word from material name that might match an edge band
            const matWords = matName.split(/\s+/).filter(w => w.length > 3);
            for (const word of matWords) {
                const match = edgeRegistry.find(r => r.name.toLowerCase().includes(word));
                if (match) return match;
            }

            // 4. Fallback: If no match found, use the first registered edge band (as "random" fallback)
            if (edgeRegistry.length > 0) return edgeRegistry[0];

            return null;
        };

        parts.forEach(p => {
            const { width, height } = p.dimensions;
            const qty = p.quantity;
            const edges = p.edges;
            const edgeColor = p.detectedEdgeColor || p.materialName;

            // Find matching edge band in registry using robust logic
            const registryItem = findBestEdgeBand(p);

            const key = registryItem ? registryItem.id : `unregistered_${edgeColor}`;
            if (!costs[key]) {
                costs[key] = { 
                    length: 0, 
                    price: registryItem?.pricePerMeter || 0, 
                    prodTime: registryItem?.productionTime || 0, 
                    name: registryItem?.name || `Fita: ${edgeColor}` 
                };
            }

            // Calculate length in meters
            let lengthMm = 0;
            if (edges.long1 !== 'none') lengthMm += width;
            if (edges.long2 !== 'none') lengthMm += width;
            if (edges.short1 !== 'none') lengthMm += height;
            if (edges.short2 !== 'none') lengthMm += height;

            costs[key].length += (lengthMm * qty) / 1000;
        });

        return Object.values(costs).map(c => ({
            name: c.name,
            length: c.length,
            unitPrice: c.price,
            total: c.length * c.price,
            productionTime: c.length * c.prodTime
        }));
    }, [parts, edgeRegistry]);

    // 4. Totals
    const totalMaterialCost = materialCosts.reduce((acc, c) => acc + c.totalCost, 0);
    const totalHardwareCost = hardwareCosts.reduce((acc, c) => acc + c.total, 0);
    const totalEdgeCost = edgeBandCosts.reduce((acc, c) => acc + c.total, 0);
    
    const totalProdTimeMinutes = 
        materialCosts.reduce((acc, c) => acc + c.productionTime, 0) +
        hardwareCosts.reduce((acc, c) => acc + c.productionTime, 0) +
        edgeBandCosts.reduce((acc, c) => acc + c.productionTime, 0);

    const totalPartsCount = parts.reduce((acc, p) => acc + p.quantity, 0);

    const hourlyRate = globalConfig.laborCostSettings?.hourlyRate || 0;
    const assemblyTimePerPart = globalConfig.laborCostSettings?.assemblyTimePerPart || 0;

    // Detailed Labor Breakdown
    const materialProdTimeMinutes = materialCosts.reduce((acc, c) => acc + c.productionTime, 0);
    const materialLaborCost = (materialProdTimeMinutes / 60) * hourlyRate;

    const edgeBandingTimeMinutes = edgeBandCosts.reduce((acc, c) => acc + c.productionTime, 0);
    const edgeBandingLaborCost = (edgeBandingTimeMinutes / 60) * hourlyRate;

    const hardwareAssemblyTimeMinutes = hardwareCosts.reduce((acc, c) => acc + c.productionTime, 0);
    const partsAssemblyTimeMinutes = parts.reduce((acc, p) => acc + (p.quantity * assemblyTimePerPart), 0);
    const totalAssemblyTimeMinutes = hardwareAssemblyTimeMinutes + partsAssemblyTimeMinutes;
    const assemblyLaborCost = (totalAssemblyTimeMinutes / 60) * hourlyRate;

    const calculatedLaborCost = materialLaborCost + edgeBandingLaborCost + assemblyLaborCost;

    // Indirect Costs Calculation
    const indirectHourlyRate = globalConfig.laborCostSettings?.indirectCosts || 0;
    const totalHours = (materialProdTimeMinutes + edgeBandingTimeMinutes + totalAssemblyTimeMinutes) / 60;
    const indirectCostsTotal = totalHours * indirectHourlyRate;

    const subtotal = totalMaterialCost + totalHardwareCost + totalEdgeCost + calculatedLaborCost + indirectCostsTotal + otherCosts;
    
    // Monthly Projection Calculations
    const totalProjectHours = (materialProdTimeMinutes + edgeBandingTimeMinutes + totalAssemblyTimeMinutes) / 60;
    const workingDays = globalConfig.laborCostSettings?.workingDays || 22;
    const workingHoursPerDay = globalConfig.laborCostSettings?.hoursPerDay || 8;
    const numberOfEmployees = globalConfig.laborCostSettings?.numberOfEmployees || 1;
    const totalMonthlyHours = workingDays * workingHoursPerDay * numberOfEmployees;
    const monthlyQty = totalProjectHours > 0 ? Math.floor(totalMonthlyHours / totalProjectHours) : 0;

    // Profit Calculation (Time Based with Manual Margin Override)
    // const totalHours = ... (already calculated above)
    const days = globalConfig.laborCostSettings?.workingDays || 22;
    const hours = globalConfig.laborCostSettings?.hoursPerDay || 8;
    const employees = globalConfig.laborCostSettings?.numberOfEmployees || 1;
    const theoreticalHours = days * hours * employees;
    const estimatedHourlyValue = theoreticalHours > 0 ? (globalConfig.financialSettings?.desiredMonthlyProfit || 0) / theoreticalHours : 0;
    
    const timeBasedProfit = totalHours * estimatedHourlyValue;
    const initialFinalPrice = subtotal + timeBasedProfit;
    
    // Calculate automatic margin based on time-based profit
    const automaticMargin = initialFinalPrice > 0 ? (timeBasedProfit / initialFinalPrice) * 100 : 0;
    
    // Use manual margin if set, otherwise use automatic margin
    const effectiveMargin = manualMargin !== null ? manualMargin : automaticMargin;
    
    // Calculate final values based on effective margin
    // Formula: Price = Cost / (1 - Margin%)
    // But if we use the logic Margin = Profit / Price, then Price = Cost + Profit => Price = Cost + Price*Margin => Price(1-Margin) = Cost => Price = Cost / (1-Margin)
    // However, if margin is 100%, price is infinite. Let's cap it or handle it.
    
    let finalPrice = 0;
    let profit = 0;

    if (manualMargin !== null) {
        // Recalculate based on manual margin
        if (effectiveMargin >= 100) {
            finalPrice = subtotal * 2; // Fallback to avoid division by zero or negative
        } else {
            finalPrice = subtotal / (1 - (effectiveMargin / 100));
        }
        profit = finalPrice - subtotal;
    } else {
        // Use time-based defaults
        profit = timeBasedProfit;
        finalPrice = initialFinalPrice;
    }

    const monthlyRevenue = monthlyQty * finalPrice;
    const variableCostsPerUnit = totalMaterialCost + totalEdgeCost + totalHardwareCost + otherCosts;
    const monthlyVariableCosts = monthlyQty * variableCostsPerUnit;
    const monthlyProfit = monthlyQty * profit;

    const handleAddManualHardware = () => {
        if (!newHardwareItem.name) return;
        
        if (editingHardwareId) {
            // Update existing item
            setManualHardware(prev => prev.map(item => 
                item.id === editingHardwareId 
                    ? { ...item, name: newHardwareItem.name, quantity: newHardwareItem.quantity }
                    : item
            ));
            setEditingHardwareId(null);
        } else {
            // Add new item
            setManualHardware(prev => [
                ...prev,
                {
                    id: `manual_${Date.now()}`,
                    name: newHardwareItem.name,
                    quantity: newHardwareItem.quantity
                }
            ]);
        }
        
        setNewHardwareItem({ name: '', quantity: 1 });
        setShowHardwareModal(false);
    };

    const handleEditManualHardware = (id: string, name: string, quantity: number) => {
        setNewHardwareItem({ name, quantity });
        setEditingHardwareId(id);
        setShowHardwareModal(true);
    };

    const handleRemoveManualHardware = (id: string) => {
        setManualHardware(prev => prev.filter(h => h.id !== id));
    };

    const handleSaveBudget = () => {
        if (!clientInfo.name.trim()) {
            alert('Por favor, informe o nome do cliente.');
            return;
        }

        if (editingId) {
            // Update existing budget (Metadata only)
            setSavedBudgets(prev => prev.map(b => {
                if (b.id === editingId) {
                    return {
                        ...b,
                        client: { ...clientInfo }
                    };
                }
                return b;
            }));
            alert('Dados do cliente atualizados com sucesso!');
        } else {
            // Create new budget
            const newBudget: SavedBudget = {
                id: Date.now().toString(),
                date: new Date().toISOString(),
                client: { ...clientInfo },
                items: {
                    materials: totalMaterialCost,
                    hardware: totalHardwareCost,
                    edges: totalEdgeCost,
                    labor: calculatedLaborCost,
                    other: otherCosts
                },
                total: subtotal,
                margin: effectiveMargin,
                finalPrice: finalPrice,
                projectName: projectName,
                parts: parts, // Saving current state
                hardware: hardware // Saving current state
            };
            setSavedBudgets(prev => [newBudget, ...prev]);
            alert('Orçamento salvo com sucesso!');
        }

        setShowSaveModal(false);
        setEditingId(null);
        setClientInfo({ name: '', phone: '', email: '', address: '', notes: '' });
        setActiveTab('saved');
    };

    const handleDeleteBudget = (id: string) => {
        if (confirm('Tem certeza que deseja excluir este orçamento salvo?')) {
            setSavedBudgets(prev => prev.filter(b => b.id !== id));
        }
    };

    const handleDuplicateBudget = (budget: SavedBudget) => {
        const duplicated: SavedBudget = {
            ...budget,
            id: Date.now().toString(),
            date: new Date().toISOString(),
            projectName: `${budget.projectName} (Cópia)`
        };
        setSavedBudgets(prev => [duplicated, ...prev]);
    };

    const handleEditBudget = (budget: SavedBudget) => {
        setClientInfo({ ...budget.client });
        setEditingId(budget.id);
        setShowSaveModal(true);
    };

    const handleGeneratePdf = (budget: SavedBudget) => {
        setSelectedBudgetForPdf(budget);
        setShowPdfModal(true);
    };

    // Helper to generate PDF for CURRENT calculator state
    const handleCurrentPdf = () => {
        const tempBudget: SavedBudget = {
            id: 'PREVIEW',
            date: new Date().toISOString(),
            client: { ...clientInfo }, // Use current form info if any, or empty
            items: {
                materials: totalMaterialCost,
                hardware: totalHardwareCost,
                edges: totalEdgeCost,
                labor: calculatedLaborCost,
                other: otherCosts
            },
            total: subtotal,
            margin: effectiveMargin,
            finalPrice: finalPrice,
            projectName: projectName
        };
        setSelectedBudgetForPdf(tempBudget);
        setShowPdfModal(true);
    };

    return (
        <div className="max-w-6xl mx-auto mt-6 p-4 pb-20 animate-fade-in space-y-6">
            {/* TABS */}
            <div className="flex gap-4 border-b border-slate-200 pb-2">
                <button 
                    onClick={() => setActiveTab('calculator')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all ${activeTab === 'calculator' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-100'}`}
                >
                    <Calculator size={20}/> Calculadora
                </button>
                <button 
                    onClick={() => setActiveTab('saved')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all ${activeTab === 'saved' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-100'}`}
                >
                    <Save size={20}/> Orçamentos Salvos
                    <span className="bg-white/20 px-2 py-0.5 rounded text-xs">{savedBudgets.length}</span>
                </button>
                <button 
                    onClick={() => setActiveTab('config')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all ${activeTab === 'config' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-100'}`}
                >
                    <TrendingUp size={20}/> Configurações Financeiras
                </button>
            </div>

            {activeTab === 'calculator' ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* LEFT COLUMN: BOM (Materials & Hardware) */}
                <div className="lg:col-span-2 space-y-6">
                    
                    {/* MATERIALS TABLE */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                            <h3 className="font-bold text-slate-700 flex items-center gap-2">
                                <Package size={20} className="text-blue-600"/> Materiais (Chapas)
                            </h3>
                            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                                Total: R$ {totalMaterialCost.toFixed(2)}
                            </span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 text-xs text-slate-500 uppercase font-bold">
                                    <tr>
                                        <th className="px-4 py-3">Material</th>
                                        <th className="px-4 py-3 text-center">Área (m²)</th>
                                        <th className="px-4 py-3 text-center">Qtd.</th>
                                        <th className="px-4 py-3 text-center">Tempo</th>
                                        <th className="px-4 py-3 text-right">Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {materialCosts.map((item, idx) => (
                                        <tr key={idx} className="hover:bg-slate-50">
                                            <td className="px-4 py-3 font-medium text-slate-700">
                                                {item.materialName} <span className="text-slate-400 text-xs">({item.thickness}mm)</span>
                                            </td>
                                            <td className="px-4 py-3 text-center text-slate-600">{item.area.toFixed(2)}</td>
                                            <td className="px-4 py-3 text-center">
                                                <span className={`font-bold px-2 py-1 rounded ${item.isEstimated ? 'bg-amber-50 text-amber-700' : 'bg-blue-50 text-blue-700'}`}>
                                                    {item.sheets}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-center text-blue-600 font-medium">{item.productionTime.toFixed(2)} min</td>
                                            <td className="px-4 py-3 text-right font-bold text-slate-800">R$ {item.totalCost.toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* EDGE BAND TABLE */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                            <h3 className="font-bold text-slate-700 flex items-center gap-2">
                                <Disc size={20} className="text-emerald-600"/> Fitas de Borda
                            </h3>
                            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                                Total: R$ {totalEdgeCost.toFixed(2)}
                            </span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 text-xs text-slate-500 uppercase font-bold">
                                    <tr>
                                        <th className="px-4 py-3">Fita</th>
                                        <th className="px-4 py-3 text-center">Comprimento (m)</th>
                                        <th className="px-4 py-3 text-center">Tempo</th>
                                        <th className="px-4 py-3 text-right">Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {edgeBandCosts.map((item, idx) => (
                                        <tr key={idx} className="hover:bg-slate-50">
                                            <td className="px-4 py-3 font-medium text-slate-700">{item.name}</td>
                                            <td className="px-4 py-3 text-center text-slate-600">{item.length.toFixed(2)}m</td>
                                            <td className="px-4 py-3 text-center text-blue-600 font-medium">{item.productionTime.toFixed(2)} min</td>
                                            <td className="px-4 py-3 text-right font-bold text-slate-800">R$ {item.total.toFixed(2)}</td>
                                        </tr>
                                    ))}
                                    {edgeBandCosts.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="px-4 py-8 text-center text-slate-400 italic">Nenhuma fita calculada.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* HARDWARE TABLE */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                            <h3 className="font-bold text-slate-700 flex items-center gap-2">
                                <Wrench size={20} className="text-orange-600"/> Ferragens & Acessórios
                            </h3>
                            <div className="flex items-center gap-2">
                                <button 
                                    onClick={() => setShowHardwareModal(true)}
                                    className="text-xs font-bold text-blue-600 hover:bg-blue-50 px-2 py-1 rounded border border-blue-200 flex items-center gap-1 transition-colors"
                                >
                                    <Plus size={14}/> Adicionar Manualmente
                                </button>
                                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                                    Total: R$ {totalHardwareCost.toFixed(2)}
                                </span>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 text-xs text-slate-500 uppercase font-bold">
                                    <tr>
                                        <th className="px-4 py-3">Item</th>
                                        <th className="px-4 py-3 text-center">Qtd.</th>
                                        <th className="px-4 py-3 text-center">Tempo</th>
                                        <th className="px-4 py-3 text-right">Subtotal</th>
                                        <th className="px-4 py-3 text-center w-10"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {hardwareCosts.map((item, idx) => (
                                        <tr key={idx} className="hover:bg-slate-50">
                                            <td className="px-4 py-3 font-medium text-slate-700">
                                                {item.name}
                                                {item.isManual && <span className="ml-2 text-[10px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full">Manual</span>}
                                            </td>
                                            <td className="px-4 py-3 text-center text-slate-600">{item.quantity}</td>
                                            <td className="px-4 py-3 text-center text-blue-600 font-medium">{item.productionTime.toFixed(2)} min</td>
                                            <td className="px-4 py-3 text-right font-bold text-slate-800">R$ {item.total.toFixed(2)}</td>
                                            <td className="px-4 py-3 text-center">
                                                {item.isManual && (
                                                    <div className="flex items-center justify-center gap-1">
                                                        <button 
                                                            onClick={() => handleEditManualHardware(item.id, item.name, item.quantity)}
                                                            className="text-blue-400 hover:text-blue-600 p-1 rounded hover:bg-blue-50 transition-colors"
                                                            title="Editar item manual"
                                                        >
                                                            <Wrench size={14}/>
                                                        </button>
                                                        <button 
                                                            onClick={() => handleRemoveManualHardware(item.id)}
                                                            className="text-red-400 hover:text-red-600 p-1 rounded hover:bg-red-50 transition-colors"
                                                            title="Remover item manual"
                                                        >
                                                            <Trash2 size={14}/>
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>

                {/* RIGHT COLUMN: SUMMARY & INPUTS */}
                <div className="space-y-6">
                    
                    <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden sticky top-6">
                        <div className="p-6 bg-slate-800 text-white">
                            <h3 className="text-xl font-black flex items-center gap-2">
                                <DollarSign size={24} className="text-emerald-400"/> Resumo Financeiro
                            </h3>
                            <p className="text-slate-400 text-sm mt-1">Cálculo final do orçamento</p>
                        </div>

                        <div className="p-6 space-y-6">
                            
                            {/* Costs Breakdown */}
                            <div className="space-y-3 pb-6 border-b border-slate-100">
                                {/* Matéria Prima Group */}
                                <div className="p-3 bg-slate-50 rounded-lg space-y-2 border border-slate-100">
                                    <div className="flex justify-between text-sm font-bold text-slate-800">
                                        <span>Matéria Prima</span>
                                        <span>R$ {(totalMaterialCost + totalEdgeCost + totalHardwareCost).toFixed(2)}</span>
                                    </div>
                                    <div className="pl-3 space-y-1 border-l-2 border-slate-200 ml-1">
                                        <div className="flex justify-between text-[11px] text-slate-500">
                                            <span>Materiais (Chapas)</span>
                                            <span>R$ {totalMaterialCost.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between text-[11px] text-slate-500">
                                            <span>Fitas de Borda</span>
                                            <span>R$ {totalEdgeCost.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between text-[11px] text-slate-500">
                                            <span>Ferragens</span>
                                            <span>R$ {totalHardwareCost.toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-between text-sm font-bold">
                                    <span className="text-slate-700">Nº de peças</span>
                                    <span className="text-slate-700">{totalPartsCount}</span>
                                </div>
                                <div className="flex justify-between text-sm font-bold">
                                    <span className="text-slate-700">Total de Horas</span>
                                    <span className="text-slate-700">{totalProjectHours.toFixed(2)} h</span>
                                </div>
                                <div className="flex justify-between text-sm font-bold">
                                    <span className="text-slate-700">Qnt Produto mês</span>
                                    <span className="text-blue-600">{monthlyQty}</span>
                                </div>
                                
                                {/* Labor Breakdown */}
                                <div className="pt-2 border-t border-slate-50 space-y-2">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-slate-500 font-medium">Mão de Obra Direta</span>
                                        <span className="font-bold text-slate-700">R$ {calculatedLaborCost.toFixed(2)}</span>
                                    </div>
                                    <div className="pl-4 space-y-1">
                                        <div className="flex justify-between text-[10px] text-slate-400">
                                            <span>Processamento Chapas</span>
                                            <span>R$ {materialLaborCost.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between text-[10px] text-slate-400">
                                            <span>Bordeamento</span>
                                            <span>R$ {edgeBandingLaborCost.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between text-[10px] text-slate-400">
                                            <span>Montagem</span>
                                            <span>R$ {assemblyLaborCost.toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Indirect Costs */}
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-500 font-medium">Custos Indiretos</span>
                                    <span className="font-bold text-slate-700">R$ {indirectCostsTotal.toFixed(2)}</span>
                                </div>

                                {/* Other Costs Input */}
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-500 font-medium">Outros Custos</span>
                                    <div className="flex items-center gap-2 w-32">
                                        <span className="text-slate-400 text-xs">R$</span>
                                        <input 
                                            type="number" 
                                            value={otherCosts || ''}
                                            placeholder="0.00"
                                            onChange={e => {
                                                const val = Number(e.target.value);
                                                if (!isNaN(val)) setOtherCosts(val);
                                            }}
                                            className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-right font-bold text-slate-700 outline-none focus:border-blue-500"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Subtotal */}
                            <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg">
                                <span className="font-bold text-slate-600 uppercase text-xs">Custo Total</span>
                                <span className="font-black text-slate-800 text-lg">R$ {subtotal.toFixed(2)}</span>
                            </div>

                            {/* Projeção Section */}
                            <div className="border border-blue-100 bg-blue-50/50 p-4 rounded-xl space-y-3">
                                <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-widest flex items-center gap-2">
                                    <TrendingUp size={14}/> Projeção Mensal
                                </h4>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500">Faturamento esperado/mês</span>
                                        <span className="font-bold text-slate-700">R$ {monthlyRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500">Custo variável esperado/mês</span>
                                        <span className="font-bold text-red-600">R$ {monthlyVariableCosts.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                    </div>
                                    <div className="flex justify-between text-sm items-center pt-2 border-t border-blue-100/50">
                                        <span className="text-slate-600 font-bold underline decoration-blue-200 underline-offset-4">Lucro esperado/mês</span>
                                        <span className="font-black text-blue-700 text-lg">R$ {monthlyProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                    </div>
                                </div>
                             </div>

                            {/* Margin Input (Editable) */}
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1">
                                        <Percent size={12}/> Margem de Lucro (%)
                                    </label>
                                    {manualMargin !== null && (
                                        <button 
                                            onClick={() => setManualMargin(null)}
                                            className="text-[10px] text-blue-600 hover:underline"
                                            title="Voltar para cálculo automático baseado em horas"
                                        >
                                            Restaurar Automático
                                        </button>
                                    )}
                                </div>
                                <div className="relative">
                                    <input 
                                        type="number" 
                                        value={effectiveMargin.toFixed(2)}
                                        onChange={e => {
                                            const val = parseFloat(e.target.value);
                                            if (!isNaN(val)) {
                                                setManualMargin(val);
                                            }
                                        }}
                                        step="0.1"
                                        className={`w-full bg-white border ${manualMargin !== null ? 'border-blue-400 ring-1 ring-blue-100' : 'border-slate-300'} rounded-lg px-4 py-3 text-lg font-bold text-blue-600 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all`}
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">%</span>
                                </div>
                                <div className="flex justify-between text-xs text-slate-400 px-1">
                                    <span>Lucro {manualMargin !== null ? '(Manual)' : '(Estimado por Horas)'}:</span>
                                    <span className="font-bold text-emerald-600">+ R$ {profit.toFixed(2)}</span>
                                </div>
                            </div>

                            {/* Final Price */}
                            <div className="bg-blue-600 text-white p-6 rounded-xl shadow-lg shadow-blue-200 text-center transform hover:scale-105 transition-transform duration-200">
                                <span className="block text-blue-100 text-xs font-bold uppercase mb-1">Valor Final do Orçamento</span>
                                <span className="block text-3xl font-black tracking-tight">R$ {finalPrice.toFixed(2)}</span>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <button 
                                    onClick={() => setShowSaveModal(true)}
                                    className="py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                                >
                                    <Save size={20}/> Salvar
                                </button>
                                <button 
                                    onClick={handleCurrentPdf}
                                    className="py-3 bg-white border-2 border-slate-200 hover:border-blue-500 hover:text-blue-600 text-slate-600 font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                                >
                                    <FileText size={20}/> PDF
                                </button>
                            </div>

                        </div>
                    </div>

                </div>
            </div>
            ) : activeTab === 'saved' ? (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden min-h-[400px]">
                    {savedBudgets.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-96 text-slate-400">
                            <Save size={64} className="mb-4 opacity-20"/>
                            <p className="font-medium">Nenhum orçamento salvo ainda.</p>
                            <button onClick={() => setActiveTab('calculator')} className="mt-4 text-blue-600 font-bold hover:underline">
                                Criar novo orçamento
                            </button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 text-xs text-slate-500 uppercase font-bold border-b border-slate-200">
                                    <tr>
                                        <th className="px-6 py-4">Data</th>
                                        <th className="px-6 py-4">Cliente</th>
                                        <th className="px-6 py-4">Projeto</th>
                                        <th className="px-6 py-4 text-right">Valor Final</th>
                                        <th className="px-6 py-4 text-center">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {savedBudgets.map((budget) => (
                                        <tr key={budget.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4 text-slate-500">
                                                <div className="flex items-center gap-2">
                                                    <Calendar size={14}/>
                                                    {new Date(budget.date).toLocaleDateString()}
                                                </div>
                                                <div className="text-xs text-slate-400 mt-1">
                                                    {new Date(budget.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-slate-700">{budget.client.name}</div>
                                                <div className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                                                    <Phone size={10}/> {budget.client.phone || '-'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 font-medium text-slate-600">
                                                {budget.projectName}
                                            </td>
                                            <td className="px-6 py-4 text-right font-black text-slate-800 text-lg">
                                                R$ {budget.finalPrice.toFixed(2)}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button 
                                                        onClick={() => handleGeneratePdf(budget)}
                                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                        title="Gerar PDF"
                                                    >
                                                        <Printer size={18}/>
                                                    </button>
                                                    <button 
                                                        onClick={() => handleEditBudget(budget)}
                                                        className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                                                        title="Editar Dados do Cliente"
                                                    >
                                                        <User size={18}/>
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDuplicateBudget(budget)}
                                                        className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                                        title="Duplicar Orçamento"
                                                    >
                                                        <Copy size={18}/>
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDeleteBudget(budget.id)}
                                                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Excluir Orçamento"
                                                    >
                                                        <Trash2 size={18}/>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            ) : activeTab === 'config' ? (
                <div className="animate-fade-in">
                    <FinancialSettings globalConfig={globalConfig} setGlobalConfig={setGlobalConfig} />
                </div>
            ) : null}

            {/* SAVE MODAL */}
            {showSaveModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="bg-slate-800 p-6 flex justify-between items-center">
                            <h3 className="text-white font-bold text-lg flex items-center gap-2">
                                <Save size={20} className="text-emerald-400"/> {editingId ? 'Editar Orçamento' : 'Salvar Orçamento'}
                            </h3>
                            <button onClick={() => { setShowSaveModal(false); setEditingId(null); }} className="text-slate-400 hover:text-white transition-colors">
                                <X size={24}/>
                            </button>
                        </div>
                        
                        <div className="p-6 space-y-4">
                            {!editingId && (
                                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-4">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-xs font-bold text-blue-600 uppercase">Valor Total</span>
                                        <span className="text-2xl font-black text-slate-800">R$ {finalPrice.toFixed(2)}</span>
                                    </div>
                                    <div className="text-xs text-slate-500">
                                        Projeto: <span className="font-bold">{projectName}</span>
                                    </div>
                                </div>
                            )}

                            <div className="space-y-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nome do Cliente *</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16}/>
                                        <input 
                                            type="text" 
                                            value={clientInfo.name}
                                            onChange={e => setClientInfo({...clientInfo, name: e.target.value})}
                                            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:border-blue-500 outline-none font-medium"
                                            placeholder="Nome completo"
                                            autoFocus
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Telefone</label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16}/>
                                            <input 
                                                type="text" 
                                                value={clientInfo.phone}
                                                onChange={e => setClientInfo({...clientInfo, phone: e.target.value})}
                                                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:border-blue-500 outline-none font-medium"
                                                placeholder="(00) 00000-0000"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email</label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16}/>
                                            <input 
                                                type="email" 
                                                value={clientInfo.email}
                                                onChange={e => setClientInfo({...clientInfo, email: e.target.value})}
                                                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:border-blue-500 outline-none font-medium"
                                                placeholder="email@exemplo.com"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Endereço</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16}/>
                                        <input 
                                            type="text" 
                                            value={clientInfo.address}
                                            onChange={e => setClientInfo({...clientInfo, address: e.target.value})}
                                            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:border-blue-500 outline-none font-medium"
                                            placeholder="Endereço de entrega/instalação"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Observações</label>
                                    <textarea 
                                        value={clientInfo.notes}
                                        onChange={e => setClientInfo({...clientInfo, notes: e.target.value})}
                                        className="w-full p-3 border border-slate-300 rounded-lg focus:border-blue-500 outline-none font-medium h-24 resize-none"
                                        placeholder="Detalhes adicionais..."
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 mt-6 pt-4 border-t border-slate-100">
                                <button 
                                    onClick={() => { setShowSaveModal(false); setEditingId(null); }}
                                    className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button 
                                    onClick={handleSaveBudget}
                                    className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md shadow-emerald-200 transition-colors flex items-center justify-center gap-2"
                                >
                                    <Save size={20}/> {editingId ? 'Salvar Alterações' : 'Confirmar Salvar'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ADD HARDWARE MODAL */}
            {showHardwareModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="bg-slate-800 p-6 flex justify-between items-center">
                            <h3 className="text-white font-bold text-lg flex items-center gap-2">
                                <Plus size={20} className="text-blue-400"/> {editingHardwareId ? 'Editar Ferragem' : 'Adicionar Ferragem'}
                            </h3>
                            <button onClick={() => { setShowHardwareModal(false); setEditingHardwareId(null); setNewHardwareItem({ name: '', quantity: 1 }); }} className="text-slate-400 hover:text-white transition-colors">
                                <X size={24}/>
                            </button>
                        </div>
                        
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nome da Ferragem</label>
                                <div className="space-y-2">
                                    <select 
                                        onChange={e => {
                                            if(e.target.value) setNewHardwareItem({...newHardwareItem, name: e.target.value})
                                        }}
                                        className="w-full border border-slate-300 rounded-lg p-3 outline-none focus:border-blue-500 bg-slate-50 text-slate-600"
                                        value=""
                                    >
                                        <option value="">Selecione da lista...</option>
                                        {hardwareRegistry.map(hw => (
                                            <option key={hw.id} value={hw.name}>{hw.name}</option>
                                        ))}
                                    </select>
                                    
                                    <input 
                                        type="text" 
                                        placeholder="Ou digite o nome..."
                                        value={newHardwareItem.name}
                                        onChange={e => setNewHardwareItem({...newHardwareItem, name: e.target.value})}
                                        className="w-full border border-slate-300 rounded-lg p-3 outline-none focus:border-blue-500 font-medium"
                                        autoFocus
                                    />
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Quantidade</label>
                                <input 
                                    type="number" 
                                    min="1"
                                    value={newHardwareItem.quantity}
                                    onChange={e => setNewHardwareItem({...newHardwareItem, quantity: parseInt(e.target.value) || 1})}
                                    className="w-full border border-slate-300 rounded-lg p-3 outline-none focus:border-blue-500 font-bold text-slate-700"
                                />
                            </div>
                            
                            <div className="pt-4 flex gap-3">
                                <button 
                                    onClick={() => { setShowHardwareModal(false); setEditingHardwareId(null); setNewHardwareItem({ name: '', quantity: 1 }); }}
                                    className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button 
                                    onClick={handleAddManualHardware}
                                    className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md shadow-blue-200 transition-colors"
                                >
                                    {editingHardwareId ? 'Salvar Alterações' : 'Adicionar'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* PDF MODAL */}
            {selectedBudgetForPdf && (
                <BudgetPdfModal 
                    isOpen={showPdfModal}
                    onClose={() => { setShowPdfModal(false); setSelectedBudgetForPdf(null); }}
                    budget={selectedBudgetForPdf}
                    globalConfig={globalConfig}
                />
            )}
        </div>
    );
};
