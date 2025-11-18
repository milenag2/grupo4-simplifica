document.addEventListener("DOMContentLoaded", () => {
  
  // URLs da API
  const API_URL = "http://localhost:8080";
  const CATEGORIAS_URL = `${API_URL}/categorias`;
  const METAS_URL = `${API_URL}/metas`;
  const ECONOMIAS_URL = `${API_URL}/economias`;
  const DASHBOARD_URL = `${API_URL}/dashboard/resumo-principal`;

  // --- Elementos do Modal "Nova Meta" ---
  const modalMetaOverlay = document.getElementById("modal-meta-overlay");
  const formMeta = document.getElementById("form-meta");
  const btnAbrirMeta = document.getElementById("btn-abrir-meta");
  const btnFecharMeta = document.getElementById("btn-fechar-meta");
  const btnCancelarMeta = document.getElementById("btn-cancelar-meta");
  const selectCategoria = document.getElementById("categoria");

  // --- Elementos do Modal "Adicionar Economia" ---
  const modalEconomiaOverlay = document.getElementById("modal-economia-overlay");
  const formEconomia = document.getElementById("form-economia");
  const selectMeta = document.getElementById("meta");
  const btnAbrirEconomia = document.getElementById("btn-abrir-economia");
  const btnFecharEconomia = document.getElementById("btn-fechar-economia");
  const btnCancelarEconomia = document.getElementById("btn-cancelar-economia");

  // --- Elementos da Página ---
  const statSaldo = document.getElementById("stat-saldo");
  const statMetas = document.getElementById("stat-metas");
  const statSucesso = document.getElementById("stat-sucesso");
  const statReceitaMes = document.getElementById("stat-receita-mes");
  
  // 👇 AGORA TEMOS DOIS CONTAINERS
  const listaMetasContainer = document.getElementById("lista-metas-container");
  const listaMetasConcluidasContainer = document.getElementById("lista-metas-concluidas-container");

  // --- Elementos do Formulário de Meta ---
  const selectPeriodo = document.getElementById("periodo");
  const campoMes = document.getElementById("campo-mes");

  // --- Elementos do Seletor de Cores ---
  const inputCor = document.getElementById("cor");
  const spanHex = document.getElementById("hex-value");

  // =============================================
  // --- LÓGICA DOS MODAIS E UI ---
  // =============================================

  if(inputCor && spanHex) {
    inputCor.addEventListener("input", () => {
      spanHex.textContent = inputCor.value;
      spanHex.style.color = inputCor.value;
    });
  }

  // --- Modal de Metas ---
  btnAbrirMeta.addEventListener("click", () => modalMetaOverlay.classList.add("ativo"));
  btnFecharMeta.addEventListener("click", fecharModalMeta);
  btnCancelarMeta.addEventListener("click", fecharModalMeta);
  modalMetaOverlay.addEventListener("click", (e) => {
    if (e.target === modalMetaOverlay) fecharModalMeta();
  });
  function fecharModalMeta() {
    modalMetaOverlay.classList.remove("ativo");
    formMeta.reset();
    campoMes.style.display = 'none'; 
    if(spanHex) { spanHex.textContent = "#3498db"; spanHex.style.color = "#3498db"; }
  }

  // --- Lógica do Período ---
  selectPeriodo.addEventListener("change", () => {
    if (selectPeriodo.value === "MENSAL") {
      campoMes.style.display = 'block';
    } else {
      campoMes.style.display = 'none';
    }
  });

  // --- Modal de Economia ---
  btnAbrirEconomia.addEventListener("click", () => {
    carregarMetasParaSelect(); 
    modalEconomiaOverlay.classList.add("ativo");
  });

  btnFecharEconomia.addEventListener("click", fecharModalEconomia);
  btnCancelarEconomia.addEventListener("click", fecharModalEconomia);
  
  modalEconomiaOverlay.addEventListener("click", (e) => {
    if (e.target === modalEconomiaOverlay) fecharModalEconomia();
  });

  function fecharModalEconomia() {
    modalEconomiaOverlay.classList.remove("ativo");
    formEconomia.reset();
  }

  // =============================================
  // --- CARREGAMENTO DE DADOS (GET) ---
  // =============================================

  const formatadorBRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

  async function carregarCategorias() {
    try {
      const response = await fetch(CATEGORIAS_URL);
      if (!response.ok) throw new Error("Falha ao carregar categorias.");
      const categorias = await response.json();
      selectCategoria.innerHTML = '<option value="">Nenhuma (Meta Geral)</option>'; 
      categorias.forEach(categoria => {
        const option = document.createElement("option");
        option.value = categoria.id;
        option.textContent = `${categoria.nome} (${categoria.tipo})`;
        selectCategoria.appendChild(option);
      });
    } catch (error) { console.error(error); }
  }

  async function carregarMetasParaSelect() {
    try {
      const response = await fetch(METAS_URL);
      if (!response.ok) throw new Error("Falha ao carregar metas.");
      const metas = await response.json();
      selectMeta.innerHTML = '<option value="">Selecione uma meta</option>'; 
      if (metas.length === 0) { selectMeta.innerHTML = '<option value="">Nenhuma meta criada</option>'; return; }

      metas.forEach(meta => {
        const option = document.createElement("option");
        option.value = meta.id;
        const textoPeriodo = meta.periodo === 'MENSAL' ? `(${meta.periodo} - ${meta.mes}/${meta.ano})` : `(${meta.periodo} - ${meta.ano})`;
        option.textContent = `${meta.nome} ${textoPeriodo}`;
        selectMeta.appendChild(option);
      });
    } catch (error) { console.error(error); }
  }

  /**
   * Lógica Principal: Carrega, Calcula Estatísticas e Separa as Metas
   */
  async function carregarDashboard() {
    const hoje = new Date();
    const mesAtual = hoje.getMonth() + 1; 
    const anoAtual = hoje.getFullYear();

    try {
      const [dashboardResponse, metasResponse, economiasResponse] = await Promise.all([
        fetch(`${DASHBOARD_URL}?mes=${mesAtual}&ano=${anoAtual}`),
        fetch(METAS_URL),
        fetch(ECONOMIAS_URL)
      ]);

      const dashboard = await dashboardResponse.json();
      const todasAsMetas = await metasResponse.json();
      const todasAsEconomias = await economiasResponse.json();

      // 1. Cálculos de Economias (Saldo Total e do Mês)
      const totalEconomizado = todasAsEconomias.reduce((total, item) => total + item.economia, 0);
      
      const economiasDoMes = todasAsEconomias.filter(item => {
        if (!item.data) return false; 
        const [ano, mes] = item.data.split('-');
        return parseInt(ano) === anoAtual && parseInt(mes) === mesAtual;
      });
      const totalEconomizadoMes = economiasDoMes.reduce((total, item) => total + item.economia, 0);

      // 2. Metas Ativas (para o card de contagem)
      const metasContadorAtivas = todasAsMetas.filter(meta => meta.ano >= anoAtual);

      // 3. ✨ NOVA LÓGICA: Taxa de Sucesso (Concluídas / Total) ✨
      const totalCriadas = todasAsMetas.length;
      // Conta quantas metas já atingiram ou passaram do valor alvo
      const totalConcluidas = todasAsMetas.filter(m => m.valorAtual >= m.valorAlvo).length;
      
      let taxaSucesso = 0;
      if (totalCriadas > 0) {
        taxaSucesso = (totalConcluidas / totalCriadas) * 100;
      }

      // 4. Atualiza Cards de Topo
      statSaldo.textContent = formatadorBRL.format(totalEconomizado || 0);
      statReceitaMes.textContent = formatadorBRL.format(totalEconomizadoMes || 0);
      statMetas.textContent = `${metasContadorAtivas.length} ativas`;
      
      // 👇 Atualiza o elemento da Taxa de Sucesso (sem casas decimais)
      statSucesso.textContent = `${taxaSucesso.toFixed(0)}%`;

      // --- SEPARAÇÃO DAS LISTAS VISUAIS ---
      
      listaMetasContainer.innerHTML = "";
      listaMetasConcluidasContainer.innerHTML = "";

      todasAsMetas.sort((a, b) => b.ano - a.ano);

      todasAsMetas.forEach(meta => {
        const valorAlvo = meta.valorAlvo;
        const valorAtual = meta.valorAtual;
        const percentual = valorAlvo > 0 ? (valorAtual / valorAlvo) * 100 : 0;
        
        const estaCompleta = percentual >= 100;

        let prazoVenceu = false;
        if (meta.ano < anoAtual) {
          prazoVenceu = true; 
        } else if (meta.ano === anoAtual && meta.periodo === 'MENSAL' && meta.mes < mesAtual) {
          prazoVenceu = true; 
        }

        if (estaCompleta || prazoVenceu) {
          // Se está completa OU venceu, vai para o histórico
          adicionarMetaNoDOM(meta, listaMetasConcluidasContainer, true); 
        } else {
          // Se não, continua ativa
          adicionarMetaNoDOM(meta, listaMetasContainer, false);
        }
      });

      if (listaMetasContainer.children.length === 0) {
        listaMetasContainer.innerHTML = "<p style='color:#777;'>Nenhuma meta em andamento.</p>";
      }
      if (listaMetasConcluidasContainer.children.length === 0) {
        listaMetasConcluidasContainer.innerHTML = "<p style='color:#777;'>Nenhuma meta concluída ainda.</p>";
      }

    } catch (error) {
      console.error("Erro:", error);
    }
  }

  /**
   * Cria o Card e coloca no container certo
   * @param {Object} meta - Dados da meta
   * @param {HTMLElement} container - Onde o card será colocado
   * @param {Boolean} isConcluida - Se é uma meta concluída (para mudar estilo se quiser)
   */
  function adicionarMetaNoDOM(meta, container, isConcluida) {
    const valorAlvo = meta.valorAlvo;
    const valorAtual = meta.valorAtual;
    const percentual = valorAlvo > 0 ? (valorAtual / valorAlvo) * 100 : 0;
    const restante = Math.max(0, valorAlvo - valorAtual); // Não mostra negativo

    const corTema = meta.cor || '#3498db'; 

    const div = document.createElement("div");
    div.className = "meta-card";
    
    // Se concluída, podemos adicionar uma classe extra ou mudar a opacidade
    if (isConcluida) {
        div.style.opacity = "0.9"; // Leve transparência para diferenciar
        div.style.filter = "grayscale(20%)"; // Leve desaturação
    }

    div.style.setProperty('--cor-meta-principal', corTema);

    div.innerHTML = `
      <div class="meta-card-header">
        <div class="meta-details">
          <h3>${meta.nome} ${isConcluida && percentual >= 100 ? '✅' : ''}</h3>
          <p>${meta.categoria ? `Categoria: ${meta.categoria.nome}` : 'Meta geral'}</p>
        </div>
        
        <div class="meta-amount">
          <span class="meta-target-value">${formatadorBRL.format(valorAlvo)}</span>
          <br>
          <span class="meta-target-date">até ${meta.mes ? `${meta.mes}/` : ''}${meta.ano}</span>
        </div>
      </div>

      <div class="meta-card-progress">
        <div class="progress-labels">
          <span>${formatadorBRL.format(valorAtual)} de ${formatadorBRL.format(valorAlvo)}</span>
          <span class="progress-percent">${percentual.toFixed(0)}%</span>
        </div>
        <div class="progress-bar-container">
          <div class="progress-bar-fill" style="width: ${Math.min(percentual, 100).toFixed(0)}%;"></div>
        </div>
      </div>

      <div class="meta-card-footer">
        <span class="meta-remaining">
            ${isConcluida && percentual >= 100 ? 'Meta Concluída!' : `Faltam ${formatadorBRL.format(restante)}`}
        </span>
      </div>
    `;
    container.appendChild(div);
  }

  // =============================================
  // --- CRIAÇÃO DE DADOS (POST) ---
  // =============================================

  formMeta.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(formMeta);
    const categoriaId = formData.get("categoria");

    const metaData = {
      nome: formData.get("nome"),
      valorAlvo: parseFloat(formData.get("valorAlvo")),
      periodo: formData.get("periodo"),
      mes: formData.get("periodo") === "MENSAL" ? parseInt(formData.get("mes")) : null,
      ano: parseInt(formData.get("ano")),
      categoria: categoriaId ? { id: parseInt(categoriaId) } : null,
      cor: formData.get("cor")
    };

    try {
      const response = await fetch(METAS_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(metaData),
      });
      if (!response.ok) throw new Error("Falha ao salvar meta.");
      carregarDashboard(); 
      fecharModalMeta();
    } catch (error) {
      console.error(error);
      alert("Não foi possível salvar a meta.");
    }
  });

  formEconomia.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(formEconomia);
    const metaId = formData.get("meta");
    const valorEconomia = formData.get("economia");
    const dataEconomia = formData.get("data_economia");

    if (!metaId) { alert("Selecione uma meta."); return; }
    if (!dataEconomia) { alert("Selecione uma data."); return; }

    const economiaData = {
      meta: { id: parseInt(metaId) },
      economia: parseFloat(valorEconomia),
      data: dataEconomia
    };

    try {
      const response = await fetch(ECONOMIAS_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(economiaData),
      });
      if (!response.ok) throw new Error("Falha ao salvar economia.");
      fecharModalEconomia();
      carregarDashboard(); 
    } catch (error) {
      console.error(error);
      alert("Não foi possível salvar a economia.");
    }
  });

  carregarCategorias(); 
  carregarDashboard();  
});