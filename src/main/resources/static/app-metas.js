document.addEventListener("DOMContentLoaded", () => {
  
  // URLs da API
  const API_URL = "http://localhost:8080";
  const CATEGORIAS_URL = `${API_URL}/categorias`;
  const METAS_URL = `${API_URL}/metas`;
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
  const btnAbrirEconomia = document.getElementById("btn-abrir-economia");
  const btnFecharEconomia = document.getElementById("btn-fechar-economia");
  const btnCancelarEconomia = document.getElementById("btn-cancelar-economia");

  // --- Elementos da Página ---
  const statSaldo = document.getElementById("stat-saldo");
  const statMetas = document.getElementById("stat-metas");
  const statSucesso = document.getElementById("stat-sucesso");
  const statReceitaMes = document.getElementById("stat-receita-mes");
  const listaMetasContainer = document.getElementById("lista-metas-container");

  // --- Elementos do Formulário de Meta ---
  const selectPeriodo = document.getElementById("periodo");
  const campoMes = document.getElementById("campo-mes");

  // =============================================
  // --- LÓGICA DOS MODAIS ---
  // =============================================

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
    campoMes.style.display = 'none'; // Esconde campo 'mes'
  }

  // --- Modal de Economia ---
  btnAbrirEconomia.addEventListener("click", () => modalEconomiaOverlay.classList.add("ativo"));
  btnFecharEconomia.addEventListener("click", () => modalEconomiaOverlay.classList.remove("ativo"));
  btnCancelarEconomia.addEventListener("click", () => modalEconomiaOverlay.classList.remove("ativo"));
  modalEconomiaOverlay.addEventListener("click", (e) => {
    if (e.target === modalEconomiaOverlay) modalEconomiaOverlay.classList.remove("ativo");
  });

  // --- Lógica do Formulário de Meta (Mostrar/Esconder Mês) ---
  selectPeriodo.addEventListener("change", () => {
    if (selectPeriodo.value === "MENSAL") {
      campoMes.style.display = 'block';
    } else {
      campoMes.style.display = 'none';
    }
  });

  // =============================================
  // --- CARREGAMENTO DE DADOS (GET) ---
  // =============================================

  // Formata um número para Real (BRL)
  const formatadorBRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

  /**
   * Busca categorias (GET /categorias) e preenche o <select>
   */
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
    } catch (error) {
      console.error("Erro ao carregar categorias:", error);
      selectCategoria.innerHTML = '<option value="">Erro ao carregar</option>';
    }
  }

  /**
   * Busca os dados do Dashboard (GET /dashboard/resumo-principal)
   * e preenche a página inteira.
   */
  async function carregarDashboard() {
    // Pega o mês e ano atuais para a API do dashboard
    const hoje = new Date();
    const mesAtual = hoje.getMonth() + 1; // JS (0-11) -> Java (1-12)
    const anoAtual = hoje.getFullYear();

    try {
      const response = await fetch(`${DASHBOARD_URL}?mes=${mesAtual}&ano=${anoAtual}`);
      if (!response.ok) throw new Error("Falha ao carregar dados do dashboard.");
      
      const dashboard = await response.json();

      // 1. Preenche os Cartões de Estatísticas
      statSaldo.textContent = formatadorBRL.format(dashboard.saldo_atual || 0);
      statReceitaMes.textContent = formatadorBRL.format(dashboard.total_receitas_mes || 0);
      statMetas.textContent = dashboard.progresso_metas_mes 
        ? `${dashboard.progresso_metas_mes.length} ativas` 
        : '0 ativas';
      // statSucesso.textContent = ... (API não fornece isso, deixamos como está)

      // 2. Preenche a Lista de Metas
      listaMetasContainer.innerHTML = ""; // Limpa a lista
      if (dashboard.progresso_metas_mes && dashboard.progresso_metas_mes.length > 0) {
        dashboard.progresso_metas_mes.forEach(adicionarMetaNoDOM);
      } else {
        listaMetasContainer.innerHTML = "<p>Nenhuma meta ativa encontrada para este período.</p>";
      }

    } catch (error) {
      console.error("Erro ao carregar dashboard:", error);
      listaMetasContainer.innerHTML = "<p>Erro ao carregar metas.</p>";
    }
  }

  /**
   * Cria o HTML de um Card de Meta e o insere na página
   */
  function adicionarMetaNoDOM(meta) {
    const valorAlvo = meta.valorAlvo;
    const valorAtual = meta.valorAtual;
    const percentual = valorAlvo > 0 ? (valorAtual / valorAlvo) * 100 : 0;
    const restante = valorAlvo - valorAtual;

    const div = document.createElement("div");
    div.className = "meta-card";
    div.innerHTML = `
      <div class="meta-card-header">
        <i class="meta-icon fas fa-bullseye"></i>
        <div>
          <h3>${meta.nome}</h3>
          <p>${meta.categoria ? `Meta de gastos: ${meta.categoria.nome}` : 'Meta geral de economia'}</p>
        </div>
        <div>
          <span class="meta-target-value">${formatadorBRL.format(valorAlvo)}</span>
          <span class="meta-target-date">até ${meta.mes ? `${meta.mes}/` : ''}${meta.ano}</span>
        </div>
      </div>

      <div class="progress-labels">
        <span>${formatadorBRL.format(valorAtual)} de ${formatadorBRL.format(valorAlvo)}</span>
        <span class="progress-percent">${percentual.toFixed(0)}%</span>
      </div>
      <div class="progress-bar-container">
        <div class="progress-bar-fill" style="width: ${percentual.toFixed(0)}%;"></div>
      </div>

      <div class="meta-card-footer">
        <span class="meta-remaining">Faltam ${formatadorBRL.format(restante)}</span>
        </div>
    `;
    listaMetasContainer.appendChild(div);
  }

  // =============================================
  // --- CRIAÇÃO DE DADOS (POST) ---
  // =============================================

  formMeta.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(formMeta);
    
    // Pega o ID da categoria (pode ser "" se for "Nenhuma")
    const categoriaId = formData.get("categoria");

    const metaData = {
      nome: formData.get("nome"),
      valorAlvo: parseFloat(formData.get("valorAlvo")),
      periodo: formData.get("periodo"),
      mes: formData.get("periodo") === "MENSAL" ? parseInt(formData.get("mes")) : null,
      ano: parseInt(formData.get("ano")),
      // Envia a categoria {id: ...} se um ID foi selecionado, ou null se não
      categoria: categoriaId ? { id: parseInt(categoriaId) } : null
    };

    try {
      const response = await fetch(METAS_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(metaData),
      });

      if (!response.ok) {
        throw new Error("Falha ao salvar meta.");
      }
      
      const novaMeta = await response.json();
      
      // Atualiza a lista de metas (simplesmente recarregando o dashboard)
      carregarDashboard(); 
      
      fecharModalMeta();

    } catch (error) {
      console.error("Erro ao salvar meta:", error);
      alert("Não foi possível salvar a meta. Verifique o console.");
    }
  });


  // --- INICIALIZAÇÃO ---
  carregarCategorias(); // Carrega o <select> do modal
  carregarDashboard();  // Carrega a página inteira
});