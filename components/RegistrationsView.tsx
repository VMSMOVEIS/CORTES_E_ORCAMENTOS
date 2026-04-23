
import React, { useState, useEffect } from 'react';
import { 
    Users, Wrench, Activity, HardDrive, Truck, 
    Search, Plus, Filter, Edit2, Trash2, ChevronLeft, 
    ChevronRight, Download, Upload, Info, Settings,
    Percent, Ruler, Building2, Briefcase, DollarSign,
    Clock, CheckCircle2, XCircle, MoreVertical, X, Save,
    Mail, MapPin, Phone, Hash, FileText
} from 'lucide-react';

export const RegistrationsView: React.FC = () => {
    const [subTab, setSubTab] = useState('colaboradores');
    const [showModal, setShowModal] = useState(false);
    
    // States for various registries
    const [colaboradores, setColaboradores] = useState([
        { code: 'COL-001', name: 'Carlos Alberto', role: 'Marceneiro', type: 'Hora Produtiva', monthRate: 3800.00, hourRate: 17.27, status: 'Ativo' },
        { code: 'COL-002', name: 'João Pereira', role: 'Marceneiro', type: 'Hora Produtiva', monthRate: 3500.00, hourRate: 15.91, status: 'Ativo' },
        { code: 'COL-003', name: 'Ricardo Santos', role: 'Auxiliar', type: 'Hora Produtiva', monthRate: 2200.00, hourRate: 10.00, status: 'Ativo' },
        { code: 'COL-004', name: 'Ana Souza', role: 'Vendedora', type: 'Administrativo', monthRate: 4500.00, hourRate: 20.45, status: 'Ativo' },
        { code: 'COL-005', name: 'Marcos Silva', role: 'Pintor', type: 'Hora Produtiva', monthRate: 3200.00, hourRate: 14.54, status: 'Ativo' },
    ]);

    const [hardware, setHardware] = useState([
        { code: 'FR-001', name: 'Dobradiça Caneco 35mm', type: 'Standard', price: 4.50, supplier: 'FGVtn' },
        { code: 'FR-002', name: 'Alça para Gaveta 128mm', type: 'Aluminio', price: 12.80, supplier: 'Cermag' },
        { code: 'FR-003', name: 'Corrediça Telescópica 450mm', type: 'Extra', price: 32.50, supplier: 'Hettich' },
        { code: 'FR-004', name: 'Parafuso 4x40mm', type: 'Sextavado', price: 0.15, supplier: 'Leo Madeiras' },
        { code: 'FR-005', name: 'Suporte Tucano Médio', type: 'Zamac', price: 18.20, supplier: 'Cermag' },
    ]);

    const [fornecedores, setFornecedores] = useState([
        { code: 'FOR-001', name: 'Leo Madeiras', category: 'Chapas/Acessórios', contact: 'Leo Silva', phone: '(11) 98888-7777' },
        { code: 'FOR-002', name: 'Gasometro Madeiras', category: 'Chapas/Maquinas', contact: 'Ana Clara', phone: '(11) 97777-6666' },
        { code: 'FOR-003', name: 'Hettich Brasil', category: 'Ferragens Luxo', contact: 'Roberto', phone: '(41) 3333-2222' },
        { code: 'FOR-004', name: 'Duratex SA', category: 'Painéis MDF', contact: 'Juliana', phone: '0800-770-000' },
        { code: 'FOR-005', name: 'Blum do Brasil', category: 'Ferragens High-end', contact: 'Stefan', phone: '(11) 4500-1000' },
    ]);

    const [unidades, setUnidades] = useState([
        { id: 'UN', name: 'Unidade', category: 'Contagem' },
        { id: 'M2', name: 'Metro Quadrado', category: 'Área' },
        { id: 'ML', name: 'Metro Linear', category: 'Comprimento' },
        { id: 'PC', name: 'Peça', category: 'Contagem' },
        { id: 'CX', name: 'Caixa', category: 'Embalagem' },
        { id: 'FL', name: 'Folha', category: 'Área' },
    ]);

    const [impostos, setImpostos] = useState([
        { code: 'IMP-001', name: 'Simples Nacional', value: 6.5, type: 'Faturamento', status: 'Ativo' },
        { code: 'IMP-002', name: 'ICMS', value: 18.0, type: 'Estadual', status: 'Ativo' },
        { code: 'IMP-003', name: 'ISSQN', value: 5.0, type: 'Serviços', status: 'Ativo' },
        { code: 'IMP-004', name: 'PIS/COFINS', value: 3.65, type: 'Federal', status: 'Ativo' },
    ]);

    const [costs, setCosts] = useState([
        { code: 'CI-001', name: 'Aluguel Galpão', value: 2500.00, category: 'Fixo' },
        { code: 'CI-002', name: 'Energia Elétrica', value: 450.00, category: 'Variável' },
        { code: 'CI-003', name: 'Contabilidade', value: 800.00, category: 'Fixo' },
        { code: 'CI-004', name: 'Marketing/Anúncios', value: 300.00, category: 'Variável' },
        { code: 'CI-005', name: 'Manutenção Máquinas', value: 150.00, category: 'Variável' },
    ]);

    const [equipamentos, setEquipamentos] = useState([
        { code: 'EQP-001', name: 'Seccionadora Vertical', brand: 'Inmes', power: '5HP', status: 'Operacional' },
        { code: 'EQP-002', name: 'Coladeira de Bordas', brand: 'Frama', power: '3Kw', status: 'Operacional' },
        { code: 'EQP-003', name: 'Coletor de Pó', brand: 'Makita', power: '2HP', status: 'Operacional' },
        { code: 'EQP-004', name: 'Furadeira de Bancada', brand: 'Schulz', power: '0.5HP', status: 'Operacional' },
    ]);

    // Form inputs states
    const [colFormData, setColFormData] = useState({ name: '', role: '', type: 'Hora Produtiva', monthRate: 0, hourRate: 0, status: 'Ativo' });
    const [hwFormData, setHwFormData] = useState({ name: '', type: '', price: 0, supplier: '' });
    const [fornFormData, setFornFormData] = useState({ name: '', category: '', contact: '', phone: '' });
    const [unFormData, setUnFormData] = useState({ id: '', name: '', category: '' });
    const [impFormData, setImpFormData] = useState({ name: '', value: 0, type: '', status: 'Ativo' });
    const [ciFormData, setCiFormData] = useState({ name: '', value: 0, category: 'Fixo' });
    const [eqFormData, setEqFormData] = useState({ name: '', brand: '', power: '', status: 'Operacional' });

    // Handle hourRate calculation automatically when monthRate changes
    useEffect(() => {
        const calculated = colFormData.monthRate / 220;
        setColFormData(prev => ({ ...prev, hourRate: calculated }));
    }, [colFormData.monthRate]);

    const handleSave = () => {
        switch(subTab) {
            case 'colaboradores':
                const colCode = `COL-${(colaboradores.length + 1).toString().padStart(3, '0')}`;
                setColaboradores([...colaboradores, { ...colFormData, code: colCode }]);
                setColFormData({ name: '', role: '', type: 'Hora Produtiva', monthRate: 0, hourRate: 0, status: 'Ativo' });
                break;
            case 'ferragens':
                const hwCode = `FR-${(hardware.length + 1).toString().padStart(3, '0')}`;
                setHardware([...hardware, { ...hwFormData, code: hwCode }]);
                setHwFormData({ name: '', type: '', price: 0, supplier: '' });
                break;
            case 'fornecedores':
                const fornCode = `FOR-${(fornecedores.length + 1).toString().padStart(3, '0')}`;
                setFornecedores([...fornecedores, { ...fornFormData, code: fornCode }]);
                setFornFormData({ name: '', category: '', contact: '', phone: '' });
                break;
            case 'unidades':
                setUnidades([...unidades, { ...unFormData }]);
                setUnFormData({ id: '', name: '', category: '' });
                break;
            case 'impostos':
                const impCode = `IMP-${(impostos.length + 1).toString().padStart(3, '0')}`;
                setImpostos([...impostos, { ...impFormData, code: impCode }]);
                setImpFormData({ name: '', value: 0, type: '', status: 'Ativo' });
                break;
            case 'custos':
                const ciCode = `CI-${(costs.length + 1).toString().padStart(3, '0')}`;
                setCosts([...costs, { ...ciFormData, code: ciCode }]);
                setCiFormData({ name: '', value: 0, category: 'Fixo' });
                break;
            case 'equipamentos':
                const eqCode = `EQP-${(equipamentos.length + 1).toString().padStart(3, '0')}`;
                setEquipamentos([...equipamentos, { ...eqFormData, code: eqCode }]);
                setEqFormData({ name: '', brand: '', power: '', status: 'Operacional' });
                break;
        }
        setShowModal(false);
    };

    const summaryCards = [
        { id: 'colaboradores', label: 'COLABORADORES', count: colaboradores.length, sub: 'colaboradores ativos', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
        { id: 'ferragens', label: 'FERRAGENS', count: hardware.length, sub: 'itens cadastrados', icon: Wrench, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { id: 'custos', label: 'CUSTOS INDIRETOS', count: costs.length, sub: 'grupos de custos', icon: Activity, color: 'text-purple-600', bg: 'bg-purple-50' },
        { id: 'equipamentos', label: 'EQUIPAMENTOS', count: equipamentos.length, sub: 'equipamentos ativos', icon: HardDrive, color: 'text-orange-600', bg: 'bg-orange-50' },
        { id: 'fornecedores', label: 'FORNECEDORES', count: fornecedores.length, sub: 'fornecedores ativos', icon: Truck, color: 'text-blue-600', bg: 'bg-blue-50' }
    ];

    const subTabs = [
        { id: 'colaboradores', label: 'Colaboradores' },
        { id: 'ferragens', label: 'Ferragens' },
        { id: 'custos', label: 'Custos Indiretos (Mês)' },
        { id: 'equipamentos', label: 'Equipamentos' },
        { id: 'fornecedores', label: 'Fornecedores' },
        { id: 'unidades', label: 'Unidades de Medida' },
        { id: 'impostos', label: 'Impostos' },
        { id: 'config', label: 'Configurações' }
    ];

    const renderTable = () => {
        switch(subTab) {
            case 'colaboradores':
                return (
                    <table className="w-full text-left">
                        <thead className="bg-slate-50/50 text-[10px] text-slate-400 uppercase font-black italic border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4">Código</th>
                                <th className="px-6 py-4">Nome do Colaborador</th>
                                <th className="px-6 py-4">Função</th>
                                <th className="px-6 py-4">Tipo de Cálculo</th>
                                <th className="px-6 py-4 text-right">Custo Mês (R$)</th>
                                <th className="px-6 py-4 text-right">Custo Hora (R$)</th>
                                <th className="px-6 py-4 text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 text-[11px]">
                            {colaboradores.map((col, idx) => (
                                <tr key={idx} className="hover:bg-slate-50/50">
                                    <td className="px-6 py-4 font-mono font-bold text-slate-400">{col.code}</td>
                                    <td className="px-6 py-4 font-black text-slate-700">{col.name}</td>
                                    <td className="px-6 py-4 italic font-bold text-slate-500 uppercase">{col.role}</td>
                                    <td className="px-6 py-4">{col.type}</td>
                                    <td className="px-6 py-4 text-right font-mono font-black">R$ {col.monthRate.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                                    <td className="px-6 py-4 text-right font-mono">R$ {col.hourRate.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${col.status === 'Ativo' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                            {col.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                );
            case 'ferragens':
                return (
                    <table className="w-full text-left">
                        <thead className="bg-slate-50/50 text-[10px] text-slate-400 uppercase font-black italic border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4">Código</th>
                                <th className="px-6 py-4">Item</th>
                                <th className="px-6 py-4">Tipo</th>
                                <th className="px-6 py-4 text-right">Preço Unit. (R$)</th>
                                <th className="px-6 py-4">Fornecedor</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 text-[11px]">
                            {hardware.map((hw, idx) => (
                                <tr key={idx} className="hover:bg-slate-50/50">
                                    <td className="px-6 py-4 font-mono font-bold text-slate-400">{hw.code}</td>
                                    <td className="px-6 py-4 font-black text-slate-700">{hw.name}</td>
                                    <td className="px-6 py-4 uppercase font-bold text-slate-500">{hw.type}</td>
                                    <td className="px-6 py-4 text-right font-mono font-black">R$ {hw.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                                    <td className="px-6 py-4 italic text-slate-500">{hw.supplier}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                );
            case 'fornecedores':
                return (
                    <table className="w-full text-left">
                        <thead className="bg-slate-50/50 text-[10px] text-slate-400 uppercase font-black italic border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4">Código</th>
                                <th className="px-6 py-4">Fornecedor</th>
                                <th className="px-6 py-4">Categoria</th>
                                <th className="px-6 py-4">Contato</th>
                                <th className="px-6 py-4">Telefone</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 text-[11px]">
                            {fornecedores.map((f, idx) => (
                                <tr key={idx} className="hover:bg-slate-50/50">
                                    <td className="px-6 py-4 font-mono font-bold text-slate-400">{f.code}</td>
                                    <td className="px-6 py-4 font-black text-slate-700">{f.name}</td>
                                    <td className="px-6 py-4 uppercase font-bold text-slate-500">{f.category}</td>
                                    <td className="px-6 py-4 text-slate-600">{f.contact}</td>
                                    <td className="px-6 py-4 font-mono">{f.phone}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                );
            case 'unidades':
                return (
                    <table className="w-full text-left">
                        <thead className="bg-slate-50/50 text-[10px] text-slate-400 uppercase font-black italic border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4">ID</th>
                                <th className="px-6 py-4">Nome</th>
                                <th className="px-6 py-4">Categoria</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 text-[11px]">
                            {unidades.map((u, idx) => (
                                <tr key={idx} className="hover:bg-slate-50/50">
                                    <td className="px-6 py-4 font-mono font-bold text-blue-600">{u.id}</td>
                                    <td className="px-6 py-4 font-black text-slate-700">{u.name}</td>
                                    <td className="px-6 py-4 text-slate-500 italic font-medium">{u.category}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                );
            case 'impostos':
                return (
                    <table className="w-full text-left">
                        <thead className="bg-slate-50/50 text-[10px] text-slate-400 uppercase font-black italic border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4">Código</th>
                                <th className="px-6 py-4">Imposto</th>
                                <th className="px-6 py-4">Tipo</th>
                                <th className="px-6 py-4 text-right">Valor (%)</th>
                                <th className="px-6 py-4 text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 text-[11px]">
                            {impostos.map((imp, idx) => (
                                <tr key={idx} className="hover:bg-slate-50/50">
                                    <td className="px-6 py-4 font-mono font-bold text-slate-400">{imp.code}</td>
                                    <td className="px-6 py-4 font-black text-slate-700">{imp.name}</td>
                                    <td className="px-6 py-4 uppercase font-bold text-slate-500">{imp.type}</td>
                                    <td className="px-6 py-4 text-right font-mono font-black text-amber-600">{imp.value.toFixed(2)}%</td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase">{imp.status}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                );
            case 'custos':
                return (
                    <table className="w-full text-left">
                        <thead className="bg-slate-50/50 text-[10px] text-slate-400 uppercase font-black italic border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4">Código</th>
                                <th className="px-6 py-4">Descrição do Custo</th>
                                <th className="px-6 py-4">Categoria</th>
                                <th className="px-6 py-4 text-right">Valor Mensal (R$)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 text-[11px]">
                            {costs.map((c, idx) => (
                                <tr key={idx} className="hover:bg-slate-50/50">
                                    <td className="px-6 py-4 font-mono font-bold text-slate-400">{c.code}</td>
                                    <td className="px-6 py-4 font-black text-slate-700">{c.name}</td>
                                    <td className="px-6 py-4 uppercase font-bold text-slate-500 italic">{c.category}</td>
                                    <td className="px-6 py-4 text-right font-mono font-black text-blue-600">R$ {c.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                );
            case 'equipamentos':
                return (
                    <table className="w-full text-left">
                        <thead className="bg-slate-50/50 text-[10px] text-slate-400 uppercase font-black italic border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4">Código</th>
                                <th className="px-6 py-4">Equipamento</th>
                                <th className="px-6 py-4">Marca</th>
                                <th className="px-6 py-4">Potência/Capac.</th>
                                <th className="px-6 py-4 text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 text-[11px]">
                            {equipamentos.map((eq, idx) => (
                                <tr key={idx} className="hover:bg-slate-50/50">
                                    <td className="px-6 py-4 font-mono font-bold text-slate-400">{eq.code}</td>
                                    <td className="px-6 py-4 font-black text-slate-700">{eq.name}</td>
                                    <td className="px-6 py-4 font-bold text-slate-500">{eq.brand}</td>
                                    <td className="px-6 py-4 text-slate-600 italic">{eq.power}</td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[9px] font-black uppercase">{eq.status}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                );
            case 'config':
                return (
                    <div className="p-12">
                        <div className="max-w-2xl mx-auto space-y-8 bg-slate-50/50 p-8 rounded-3xl border border-slate-200 shadow-inner">
                            <div className="flex items-center gap-4 border-b border-slate-200 pb-4">
                                <Settings className="text-blue-600" size={24} />
                                <h3 className="font-black text-slate-800 uppercase tracking-tight">Configurações Gerais do ERP</h3>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Horas Úteis/Mês</label>
                                    <input type="number" defaultValue={220} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:border-blue-500 outline-none font-mono font-bold" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Moeda Padrão</label>
                                    <select className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:border-blue-500 outline-none font-bold">
                                        <option>Real (BRL - R$)</option>
                                        <option>Dólar (USD - $)</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                                <div className="flex items-center gap-3">
                                    <CheckCircle2 className="text-emerald-600" size={20} />
                                    <div>
                                        <p className="text-xs font-black text-emerald-800 uppercase italic">Buckup Automático</p>
                                        <p className="text-[10px] text-emerald-600">Sincronizado com a nuvem a cada 5 min</p>
                                    </div>
                                </div>
                                <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-[10px] font-black uppercase">Ativo</button>
                            </div>

                            <button className="w-full py-4 bg-slate-800 text-white font-black text-xs uppercase tracking-widest rounded-2xl flex items-center justify-center gap-3 shadow-xl">
                                <Save size={18} /> Salvar Configurações
                            </button>
                        </div>
                    </div>
                );
            default:
                return (
                    <div className="p-12 text-center text-slate-300 italic font-medium">
                        Selecione uma aba válida para listar os registros.
                    </div>
                );
        }
    };

    const renderModalContent = () => {
        switch(subTab) {
            case 'colaboradores':
                return (
                    <>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 italic">Código</label>
                                <input readOnly value={`COL-${(colaboradores.length + 1).toString().padStart(3, '0')}`} className="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-xl text-slate-400 font-mono font-bold cursor-not-allowed" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 italic">Status</label>
                                <select 
                                    value={colFormData.status}
                                    onChange={e => setColFormData({...colFormData, status: e.target.value})}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 outline-none font-bold"
                                >
                                    <option value="Ativo">Ativo</option>
                                    <option value="Inativo">Inativo</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 italic">Nome do Colaborador</label>
                            <input 
                                value={colFormData.name}
                                onChange={e => setColFormData({...colFormData, name: e.target.value})}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 outline-none font-bold"
                                placeholder="Nome completo"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 italic">Função</label>
                                <input 
                                    value={colFormData.role}
                                    onChange={e => setColFormData({...colFormData, role: e.target.value})}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 outline-none font-bold"
                                    placeholder="Ex: Marceneiro"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 italic">Tipo de Cálculo</label>
                                <select 
                                    value={colFormData.type}
                                    onChange={e => setColFormData({...colFormData, type: e.target.value})}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 outline-none font-bold"
                                >
                                    <option value="Hora Produtiva">Hora Produtiva</option>
                                    <option value="Hora Improdutiva">Hora Improdutiva</option>
                                    <option value="Administrativo">Administrativo</option>
                                </select>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 italic">Custo Mês (R$)</label>
                                <input 
                                    type="number"
                                    value={colFormData.monthRate}
                                    onChange={e => setColFormData({...colFormData, monthRate: parseFloat(e.target.value) || 0})}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 outline-none font-bold"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 italic">Custo Hora (Automático)</label>
                                <div className="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-xl text-blue-600 font-mono font-bold">
                                    R$ {colFormData.hourRate.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </div>
                            </div>
                        </div>
                    </>
                );
            case 'ferragens':
                return (
                    <>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 italic">Código</label>
                                <input readOnly value={`FR-${(hardware.length + 1).toString().padStart(3, '0')}`} className="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-xl text-slate-400 font-mono font-bold cursor-not-allowed" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 italic">Fornecedor</label>
                                <input 
                                    value={hwFormData.supplier}
                                    onChange={e => setHwFormData({...hwFormData, supplier: e.target.value})}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 outline-none font-bold"
                                    placeholder="Nome do fornecedor"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 italic">Item (Descrição)</label>
                            <input 
                                value={hwFormData.name}
                                onChange={e => setHwFormData({...hwFormData, name: e.target.value})}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 outline-none font-bold"
                                placeholder="Descrição da ferragem"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 italic">Tipo</label>
                                <input 
                                    value={hwFormData.type}
                                    onChange={e => setHwFormData({...hwFormData, type: e.target.value})}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 outline-none font-bold"
                                    placeholder="Ex: Corrediça, Dobradiça"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 italic">Preço Unit. (R$)</label>
                                <input 
                                    type="number"
                                    value={hwFormData.price}
                                    onChange={e => setHwFormData({...hwFormData, price: parseFloat(e.target.value) || 0})}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 outline-none font-bold"
                                />
                            </div>
                        </div>
                    </>
                );
            case 'fornecedores':
                return (
                    <>
                         <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 italic">Nome do Fornecedor</label>
                            <input 
                                value={fornFormData.name}
                                onChange={e => setFornFormData({...fornFormData, name: e.target.value})}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 outline-none font-bold"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 italic">Categoria</label>
                                <input 
                                    value={fornFormData.category}
                                    onChange={e => setFornFormData({...fornFormData, category: e.target.value})}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 outline-none font-bold"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 italic">Telefone</label>
                                <input 
                                    value={fornFormData.phone}
                                    onChange={e => setFornFormData({...fornFormData, phone: e.target.value})}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 outline-none font-bold"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 italic">Contato</label>
                            <input 
                                value={fornFormData.contact}
                                onChange={e => setFornFormData({...fornFormData, contact: e.target.value})}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 outline-none font-bold"
                            />
                        </div>
                    </>
                );
             case 'unidades':
                return (
                    <>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 italic">Símbolo (Sigla)</label>
                                <input 
                                    value={unFormData.id}
                                    onChange={e => setUnFormData({...unFormData, id: e.target.value})}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 outline-none font-bold uppercase"
                                    placeholder="Ex: UN"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 italic">Categoria</label>
                                <input 
                                    value={unFormData.category}
                                    onChange={e => setUnFormData({...unFormData, category: e.target.value})}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 outline-none font-bold"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 italic">Descrição Completa</label>
                            <input 
                                value={unFormData.name}
                                onChange={e => setUnFormData({...unFormData, name: e.target.value})}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 outline-none font-bold"
                                placeholder="Ex: Unidade"
                            />
                        </div>
                    </>
                );
            case 'custos':
                return (
                    <>
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 italic">Descrição do Custo</label>
                            <input 
                                value={ciFormData.name}
                                onChange={e => setCiFormData({...ciFormData, name: e.target.value})}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 outline-none font-bold"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 italic">Valor Mensal (R$)</label>
                                <input 
                                    type="number"
                                    value={ciFormData.value}
                                    onChange={e => setCiFormData({...ciFormData, value: parseFloat(e.target.value) || 0})}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 outline-none font-bold font-mono"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 italic">Categoria</label>
                                <select 
                                    value={ciFormData.category}
                                    onChange={e => setCiFormData({...ciFormData, category: e.target.value})}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 outline-none font-bold"
                                >
                                    <option value="Fixo">Fixo</option>
                                    <option value="Variável">Variável</option>
                                </select>
                            </div>
                        </div>
                    </>
                );
            default:
                return <div className="text-center p-8 text-slate-400 italic">Formulário indisponível para esta aba.</div>;
        }
    };

    return (
        <div className="animate-fade-in space-y-6 pb-20 relative">
            {/* GENERIC MODAL */}
            {showModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="bg-slate-900 p-6 flex justify-between items-center border-b border-white/10">
                            <h3 className="text-white font-black text-lg uppercase tracking-tight flex items-center gap-3 italic">
                                <Plus size={24} className="text-blue-400"/> Novo Registro: {subTabs.find(t => t.id === subTab)?.label}
                            </h3>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white"><X size={24}/></button>
                        </div>
                        
                        <div className="p-8 space-y-6">
                            {renderModalContent()}

                            <div className="flex gap-4 pt-6 border-t border-slate-100">
                                <button onClick={() => setShowModal(false)} className="flex-1 py-4 bg-slate-100 hover:bg-slate-200 text-slate-600 font-black text-[10px] uppercase tracking-widest rounded-2xl italic">Cancelar</button>
                                <button onClick={handleSave} className="flex-1 py-4 bg-blue-600 hover:bg-blue-700 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl shadow-xl shadow-blue-200 flex items-center justify-center gap-3 italic"><Save size={18}/> Salvar</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* HEADER */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-100 text-blue-600 rounded-xl shadow-inner font-black italic">
                         <FileText size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Cadastros <span className="text-blue-600 italic">ERP</span></h2>
                        <p className="text-slate-400 text-sm">Gerencie {subTabs.find(t => t.id === subTab)?.label.toLowerCase()} do sistema</p>
                    </div>
                </div>
                <div className="flex gap-2">
                     <button className="flex items-center gap-2 px-6 py-2.5 bg-slate-100 text-slate-600 rounded-lg font-bold text-[10px] uppercase hover:bg-slate-200 transition-all font-black italic"><Download size={14}/> Exportar</button>
                     <button className="flex items-center gap-2 px-6 py-2.5 bg-slate-100 text-slate-600 rounded-lg font-bold text-[10px] uppercase hover:bg-slate-200 transition-all font-black italic"><Upload size={14}/> Importar</button>
                </div>
            </div>

            {/* TOP SUMMARY CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {summaryCards.map(card => (
                    <div key={card.id} onClick={() => setSubTab(card.id)} className={`bg-white rounded-2xl border p-4 shadow-sm relative overflow-hidden group cursor-pointer transition-all ${subTab === card.id ? 'border-blue-500 ring-2 ring-blue-50' : 'border-slate-200 hover:border-blue-300'}`}>
                        <div className="flex items-start justify-between">
                            <div className="flex flex-col">
                                <span className={`text-[9px] font-black uppercase tracking-widest mb-1 ${subTab === card.id ? 'text-blue-600' : 'text-slate-400'}`}>{card.label}</span>
                                <span className="text-xl font-black text-slate-800 leading-none">{card.count}</span>
                                <span className="text-[10px] text-slate-400 font-medium mt-1 italic">{card.sub}</span>
                            </div>
                            <div className={`p-2 ${card.bg} ${card.color} rounded-xl`}>
                                <card.icon size={18} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* SUB-TABS */}
            <div className="flex gap-1 border-b border-slate-100 mb-6 bg-white p-1.5 rounded-2xl border shadow-sm">
                {subTabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setSubTab(tab.id)}
                        className={`px-4 py-3 text-[10px] font-black uppercase tracking-tight rounded-xl transition-all ${
                            subTab === tab.id
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-100'
                            : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100/50'
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-12 space-y-6">
                    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between flex-wrap gap-4">
                            <div>
                                <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest italic">{subTabs.find(t => t.id === subTab)?.label}</h3>
                                <p className="text-[10px] text-slate-400 font-medium leading-relaxed italic">Gerenciamento dinâmico de tabelas de {subTabs.find(t => t.id === subTab)?.label.toLowerCase()}</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
                                    <input placeholder="Buscar registro..." className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[10px] font-bold outline-none focus:bg-white focus:border-blue-500 w-48" />
                                </div>
                                <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg font-black text-[10px] uppercase hover:bg-blue-700 transition-all shadow-lg italic">
                                    <Plus size={14}/> Novo {subTabs.find(t => t.id === subTab)?.label.split(' ')[0]}
                                </button>
                            </div>
                        </div>

                        <div className="overflow-x-auto min-h-[400px]">
                            {renderTable()}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
