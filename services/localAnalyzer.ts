
import { RawPart, ProcessedPart, RegisteredMaterial, EdgeBanding, ExtractedComponent } from "../types";

/**
 * Gera notas automáticas baseadas nas fitas de borda (Espessura e Cor)
 */
export const generateAutomatedNotes = (
    edges: EdgeBanding, 
    dimensions: { width: number, height: number, thickness: number }, 
    material?: RegisteredMaterial,
    detectedColor?: string, // Cor vinda direto do 3D
    isBoleado: boolean = false // Detecção de peças boleadas
): string[] => {
    const notes: string[] = [];
    const rW = Math.round(dimensions.width);
    const rH = Math.round(dimensions.height);

    if (edges) {
        const dashedDims: number[] = [];
        const coloredDims: number[] = [];

        // Arestas longas correspondem à Altura (Height) no padrão local
        if (edges.long1 === 'dashed') dashedDims.push(rH);
        if (edges.long1 === 'colored') coloredDims.push(rH);
        
        if (edges.long2 === 'dashed') dashedDims.push(rH);
        if (edges.long2 === 'colored') coloredDims.push(rH);
        
        // Arestas curtas correspondem à Largura (Width)
        if (edges.short1 === 'dashed') dashedDims.push(rW);
        if (edges.short1 === 'colored') coloredDims.push(rW);
        
        if (edges.short2 === 'dashed') dashedDims.push(rW);
        if (edges.short2 === 'colored') coloredDims.push(rW);

        // Nota para Fita Larga (Tracejada) / Boleada
        if (dashedDims.length > 0) {
            const uniqueDims = Array.from(new Set(dashedDims)).join(' e ');
            if (isBoleado) {
                notes.push(`Fitas boleadas em ${uniqueDims}`);
            } else {
                notes.push(`Fita larga em ${uniqueDims}`);
            }
        }

        // Nota para 2ª Cor (Checkbox de Cor)
        if (coloredDims.length > 0) {
            // Lógica de Prioridade de Nome da Cor:
            // 1. DetectedColor (Veio direto da face do 3D)
            // 2. Material.edgeColor (Definido no cadastro do material)
            // 3. Fallback "2ª Cor"
            
            let colorName = "2ª Cor";
            
            if (detectedColor && detectedColor.trim() !== '' && !detectedColor.toLowerCase().includes('padrao') && !detectedColor.toLowerCase().includes('default')) {
                colorName = detectedColor;
            } else if (material && material.edgeColor && material.edgeColor.trim() !== '') {
                colorName = material.edgeColor;
            } else if (material && material.name) {
                // Infer color from material name (e.g., "MDF Branco" -> "Branco")
                const commonColors = ['Branco', 'Preto', 'Cinza', 'Freijó', 'Louro', 'Carvalho', 'Nogueira', 'Grafite', 'Fendi', 'Gianduia'];
                const inferred = commonColors.find(c => material.name.toLowerCase().includes(c.toLowerCase()));
                if (inferred) colorName = inferred;
            }
                
            const uniqueDims = Array.from(new Set(coloredDims)).join(' e ');
            // Formato: Fita (cor) em (medida)
            notes.push(`Fita ${colorName} em ${uniqueDims}`);
        }
        
        // Lógica de Cor da Fita Genérica (Se definida no material, mas SEM checkboxes de 2ª cor específicos marcados)
        const hasSpecificColorEdges = coloredDims.length > 0;
        const hasAnyEdge = edges.long1 !== 'none' || edges.long2 !== 'none' || edges.short1 !== 'none' || edges.short2 !== 'none';

        if (!hasSpecificColorEdges && hasAnyEdge) {
            // PRIORIDADE: Se o usuário selecionou uma cor explícita (detectedColor), usa ela.
            // Caso contrário, usa a cor padrão do material.
            if (detectedColor && detectedColor.trim() !== '' && !detectedColor.toLowerCase().includes('padrao') && !detectedColor.toLowerCase().includes('default')) {
                 notes.push(`Fita: ${detectedColor}`);
            } else if (material && material.edgeColor && material.edgeColor.trim() !== '') {
                // Nota simples se toda a peça usa a fita definida no material
                notes.push(`Fita: ${material.edgeColor}`);
            } else if (material && material.name) {
                // Infer color from material name
                const commonColors = ['Branco', 'Preto', 'Cinza', 'Freijó', 'Louro', 'Carvalho', 'Nogueira', 'Grafite', 'Fendi', 'Gianduia'];
                const inferred = commonColors.find(c => material.name.toLowerCase().includes(c.toLowerCase()));
                if (inferred) notes.push(`Fita: ${inferred}`);
            }
        }
    }

    return notes;
};

// Palavras-chave para identificar Componentes/Ferragens
const HARDWARE_KEYWORDS = [
    { key: 'dobradi', cat: 'Dobradiça' },
    { key: 'hinge', cat: 'Dobradiça' },
    { key: 'corredi', cat: 'Corrediça' },
    { key: 'trilho', cat: 'Sistema/Trilho' },
    { key: 'slide', cat: 'Corrediça' },
    { key: 'puxador', cat: 'Puxador' },
    { key: 'puxadore', cat: 'Puxador' },
    { key: 'handle', cat: 'Puxador' },
    { key: 'knob', cat: 'Puxador' },
    { key: 'pe ', cat: 'Pé' },
    { key: 'pes ', cat: 'Pé' },
    { key: 'rodizio', cat: 'Rodízio' },
    { key: 'rodinha', cat: 'Rodízio' },
    { key: 'cantoneira', cat: 'Acessório' },
    { key: 'suporte', cat: 'Acessório' },
    { key: 'minifix', cat: 'Ferragem' },
    { key: 'parafuso', cat: 'Ferragem' },
    { key: 'screw', cat: 'Ferragem' },
    { key: 'cavilha', cat: 'Ferragem' },
    { key: 'dowel', cat: 'Ferragem' },
    { key: 'pistao', cat: 'Pistão' },
    { key: 'articula', cat: 'Articulador' },
    { key: 'tubo', cat: 'Tubo/Cabideiro' },
    { key: 'cabideiro', cat: 'Tubo/Cabideiro' },
    { key: 'sapata', cat: 'Acessório' },
    { key: 'tapafuro', cat: 'Acessório' },
    { key: 'bucha', cat: 'Ferragem' },
    { key: 'prego', cat: 'Ferragem' },
    { key: 'cola ', cat: 'Insumo' },
    { key: 'verniz', cat: 'Insumo' },
    { key: 'isopor', cat: 'Insumo' },
    { key: 'perfil', cat: 'Perfil' },
    { key: 'sistema porta', cat: 'Sistema' },
    { key: 'bocal', cat: 'Elétrica' },
    { key: 'lampada', cat: 'Elétrica' },
    { key: 'gancho', cat: 'Acessório' },
    { key: 'copinho', cat: 'Acessório' },
    { key: 'pulsador', cat: 'Acessório' },
    { key: 'basculante', cat: 'Acessório' },
    { key: 'hardware', cat: 'Ferragem' },
    { key: 'fixa', cat: 'Ferragem' },
    { key: 'montante', cat: 'Perfil' },
    { key: 'niveladora', cat: 'Acessório' }
];

/**
 * MOTOR DE ENGENHARIA DETERMINÍSTICO
 * Classifica peças 3D baseando-se em padrões industriais de marcenaria.
 * Agora separa Componentes (Hardware) de Painéis (MDF).
 */
export const analyzePartsLocally = (rawParts: RawPart[], startIndex: number = 0, swapDimensions: boolean = false): { panels: ProcessedPart[], hardware: ExtractedComponent[] } => {
  const groupedParts = new Map<string, ProcessedPart>();
  const groupedHardware = new Map<string, ExtractedComponent>();
  
  // Função auxiliar para limpar nomes e agrupar simétricos
  const cleanPartName = (name: string): string => {
      if (!name) return "";
      
      let clean = name;

      // 1. Remove extensões de arquivo se houver (ex: Lateral.skp)
      clean = clean.replace(/\.[^/.]+$/, "");

      // 2. Remove sufixos de cópia comuns em softwares 3D e índices numéricos
      clean = clean.replace(/[-_]\s*copy\s*\d*$/i, ''); 
      clean = clean.replace(/[\s_.-]*\(?\d+\)?$/g, ''); 
      
      // 3. Remove sufixos posicionais para agrupar Esquerda/Direita (Simetria)
      clean = clean.replace(/[\s_-]+(Esquerda|Direita|Esq|Dir|Left|Right|L|R|Sup|Inf|Superior|Inferior|Bottom|Top|Front|Back|Tras)[\s\d]*$/i, '');
      
      // 4. Remove caracteres especiais residuais
      clean = clean.replace(/[#]/g, '');

      return clean.trim();
  };

  rawParts.forEach((part) => {
    // Apply global swap if requested
    if (swapDimensions) {
        const originalWidth = part.dimensions.width;
        const originalHeight = part.dimensions.height;
        part.dimensions.width = originalHeight;
        part.dimensions.height = originalWidth;

        // Swap edges too
        const originalEdges = { ...part.edges };
        part.edges.long1 = originalEdges.short1;
        part.edges.long2 = originalEdges.short2;
        part.edges.short1 = originalEdges.long1;
        part.edges.short2 = originalEdges.long2;
    }

    const rawNameLower = part.originalName.toLowerCase();
    
    // --- 1. VERIFICAR SE É FERRAGEM / COMPONENTE ---
    // Critérios: Palavra-chave no nome OU Espessura > 30mm
    const hardwareMatch = HARDWARE_KEYWORDS.find(hw => rawNameLower.includes(hw.key));
    const isSpecialHardware = part.dimensions.thickness > 30;
    
    if (hardwareMatch || isSpecialHardware) {
        // É um componente! Agrupar separadamente.
        const cleanedName = cleanPartName(part.originalName);
        const category = hardwareMatch ? hardwareMatch.cat : 'Componente Especial';
        const hwKey = `${cleanedName}|${category}`; // Agrupa por Nome Limpo + Categoria
        
        if (groupedHardware.has(hwKey)) {
            const existing = groupedHardware.get(hwKey)!;
            existing.quantity += 1;
        } else {
            groupedHardware.set(hwKey, {
                id: part.id,
                name: cleanedName, // Nome limpo (ex: "Dobradiça Curva" em vez de "Dobradiça Curva #2")
                originalName: part.originalName,
                category: category,
                quantity: 1,
                sourceFile: "", // Will be set later in App.tsx
                dimensions: `${Math.round(part.dimensions.width)}x${Math.round(part.dimensions.height)}x${Math.round(part.dimensions.thickness)}`
            });
        }
        return; // Pula o processamento de painel
    }

    // --- 2. PROCESSAMENTO DE PAINEL (MDF/VIDRO) ---
    const { width, height, thickness } = part.dimensions;
    const matName = part.materialName;
    
    // Normaliza dimensões (Arredondamento) para agrupar 499.9mm com 500mm
    const rW = Math.round(width);
    const rH = Math.round(height);
    const rT = Math.round(thickness);

    // Key de agrupamento: Fita de borda
    const edgeKey = part.edges ? `${part.edges.long1}${part.edges.long2}${part.edges.short1}${part.edges.short2}` : 'nonenonenonenone';
    
    // IMPORTANTE: Incluir detectedEdgeColor na chave de agrupamento.
    // Se duas peças são iguais mas uma tem fita "Azul" e outra "Vermelha", devem ser linhas separadas.
    const colorKey = part.detectedEdgeColor ? part.detectedEdgeColor.trim().toLowerCase() : 'default';

    // Detectar boleado pelo nome original para a nota (COM PALAVRAS-CHAVE EXPANDIDAS)
    const isBoleado = ['bolead', 'abalu', 'arredond', 'curv'].some(k => rawNameLower.includes(k));

    // Gera notas iniciais usando a cor detectada (se houver)
    const notes = generateAutomatedNotes(part.edges, part.dimensions, undefined, part.detectedEdgeColor, isBoleado);

    const cleanedName = cleanPartName(part.originalName);
    const lowerCleaned = cleanedName.toLowerCase();

    // --- CLASSIFICAÇÃO ---
    let geoCategory = 'Peça';
    const aspect = rH / rW;
    const area = (rW * rH) / 1000000;

    // 1. Prioridade por Nome (Baseado no pedido do usuário)
    if (lowerCleaned.includes('porta')) {
        geoCategory = "Porta";
    } else if (lowerCleaned.includes('gaveta') || lowerCleaned.includes('gavetão')) {
        geoCategory = "Gaveta";
    } else if (lowerCleaned.includes('frente')) {
        geoCategory = "Frente Gaveta";
    }
    // 2. Classificação Geométrica (Fallback)
    else if (rT <= 7) {
        geoCategory = "Fundo";
    } else if (aspect > 1.8) {
        geoCategory = "Lateral";
    } else if (aspect < 0.55) {
        if (area > 0.8) geoCategory = "Tampo";
        else geoCategory = "Base/Prateleira";
    } else if (aspect >= 0.8 && aspect <= 1.25) {
        if (area > 0.15) geoCategory = "Porta";
        else geoCategory = "Frente Gaveta";
    } else {
        geoCategory = "Divisória";
    }

    // Identifica se o nome original é genérico ou lixo gerado por software
    const isGenericName = !part.originalName || 
                         /^Peça\s*\d*$/i.test(part.originalName) || 
                         /^(Mesh|Object|Model|Component|Group|Box|Cube|Poly)\s*[._]?\d*$/i.test(part.originalName) ||
                         part.originalName.length < 2;

    // Se o nome limpo for muito curto ou numérico, usa a categoria geométrica
    const baseDisplayName = (isGenericName || cleanedName.length < 2 || /^\d+$/.test(cleanedName)) 
                            ? geoCategory 
                            : cleanedName;

    const finalName = baseDisplayName;

    // A chave de agrupamento combina: Nome Limpo + Material + Dimensões + Config Fita + COR DA FITA
    const groupingKey = `${finalName}|${matName}|${rW}x${rH}x${rT}|${edgeKey}|${colorKey}`;

    if (groupedParts.has(groupingKey)) {
        const existing = groupedParts.get(groupingKey)!;
        existing.quantity += 1; // Incrementa quantidade ao invés de criar nova linha
        if (!existing.originalData) existing.originalData = [];
        existing.originalData.push({ id: part.id, position: part.position });
    } else {
        const newPart: ProcessedPart = {
            ...part,
            dimensions: { width: rW, height: rH, thickness: rT }, // Usa dimensões arredondadas
            finalName: finalName,
            groupCategory: geoCategory,
            grainDirection: 'N/A', 
            quantity: 1,
            notes: notes, // Insere as notas geradas automaticamente
            displayId: "", 
            sourceFile: "", 
            originalData: [{ id: part.id, position: part.position }]
        };
        groupedParts.set(groupingKey, newPart);
    }
  });

  // Ordenação e Numeração Visual dos Painéis
  const finalParts = Array.from(groupedParts.values());
  finalParts.sort((a, b) => {
      // Ordena primeiro por espessura (maior para menor), depois por nome
      if (b.dimensions.thickness !== a.dimensions.thickness) return b.dimensions.thickness - a.dimensions.thickness;
      return a.finalName.localeCompare(b.finalName);
  });

  // Lógica de diferenciação para peças com MESMO NOME mas DIMENSÕES DIFERENTES
  const nameCounters: Record<string, number> = {};
  finalParts.forEach(p => { nameCounters[p.finalName] = (nameCounters[p.finalName] || 0) + 1; });
  
  const currentNameIndex: Record<string, number> = {};

  const panelsWithId = finalParts.map((p, index) => {
      let displayName = p.finalName;
      
      // Só adiciona #1, #2 se existirem peças com o MESMO nome mas tamanhos DIFERENTES que sobraram desagrupadas
      if (nameCounters[p.finalName] > 1) {
          currentNameIndex[p.finalName] = (currentNameIndex[p.finalName] || 0) + 1;
          displayName = `${p.finalName} #${currentNameIndex[p.finalName]}`;
      }

      return {
          ...p,
          finalName: displayName,
          displayId: (startIndex + index + 1).toString()
      };
  });

  // Retorna ambos os arrays
  return {
      panels: panelsWithId,
      hardware: Array.from(groupedHardware.values()).sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name))
  };
};
