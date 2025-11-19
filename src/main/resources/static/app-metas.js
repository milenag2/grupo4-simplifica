document.addEventListener("DOMContentLoaded", () => {
  const API_URL = "http://localhost:8080";
  const ENDPOINTS = {
    CATEGORIAS: `${API_URL}/categorias`,
    METAS: `${API_URL}/metas`,
    ECONOMIAS: `${API_URL}/economias`,
    DASHBOARD: `${API_URL}/dashboard/resumo-principal`
  };

  const elements = {
    modals: {
      meta: document.getElementById("modal-meta-overlay"),
      economia: document.getElementById("modal-economia-overlay")
    },
    forms: {
      meta: document.getElementById("form-meta"),
      economia: document.getElementById("form-economia")
    },
    stats: {
      saldo: document.getElementById("stat-saldo"),
      metas: document.getElementById("stat-metas"),
      sucesso: document.getElementById("stat-sucesso"),
      receitaMes: document.getElementById("stat-receita-mes")
    },
    lists: {
      ativas: document.getElementById("lista-metas-container"),
      concluidas: document.getElementById("lista-metas-concluidas-container")
    },
    inputs: {
      categoria: document.getElementById("categoria"),
      metaSelect: document.getElementById("meta"),
      periodo: document.getElementById("periodo"),
      campoMes: document.getElementById("campo-mes"),
      cor: document.getElementById("cor"),
      hex: document.getElementById("hex-value")
    }
  };

  const formatadorBRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

  init();

  function init() {
    setupEventListeners();
    carregarCategorias();
    carregarDashboard();
  }

  function setupEventListeners() {
    if (elements.inputs.cor && elements.inputs.hex) {
      elements.inputs.cor.addEventListener("input", (e) => {
        elements.inputs.hex.textContent = e.target.value;
        elements.inputs.hex.style.color = e.target.value;
      });
    }

    elements.inputs.periodo.addEventListener("change", () => {
      elements.inputs.campoMes.style.display = elements.inputs.periodo.value === "MENSAL" ? 'block' : 'none';
    });

    document.getElementById("btn-abrir-meta").addEventListener("click", () => toggleModal('meta', true));
    ["btn-fechar-meta", "btn-cancelar-meta"].forEach(id => {
      document.getElementById(id).addEventListener("click", () => toggleModal('meta', false));
    });
a
    document.getElementById("btn-abrir-economia").addEventListener("click", () => {
      carregarMetasParaSelect();
      toggleModal('economia', true);
    });
    ["btn-fechar-economia", "btn-cancelar-economia"].forEach(id => {
      document.getElementById(id).addEventListener("click", () => toggleModal('economia', false));
    });

    Object.values(elements.modals).forEach(modal => {
      modal.addEventListener("click", (e) => {
        if (e.target === modal) toggleModal(modal === elements.modals.meta ? 'meta' : 'economia', false);
      });
    });

    elements.forms.meta.addEventListener("submit", handleMetaSubmit);
    elements.forms.economia.addEventListener("submit", handleEconomiaSubmit);
  }

  function toggleModal(type, show) {
    const modal = elements.modals[type];
    const form = elements.forms[type];
    
    if (show) {
      modal.classList.add("ativo");
    } else {
      modal.classList.remove("ativo");
      form.reset();
      if (type === 'meta') {
        elements.inputs.campoMes.style.display = 'none';
        if (elements.inputs.hex) {
          elements.inputs.hex.textContent = "#3498db";
          elements.inputs.hex.style.color = "#3498db";
        }
      }
    }
  }

  // Dashboard 

  async function carregarDashboard() {
    const hoje = new Date();
    const mesAtual = hoje.getMonth() + 1;
    const anoAtual = hoje.getFullYear();

    try {
      const [resDash, resMetas, resEcono] = await Promise.all([
        fetch(`${ENDPOINTS.DASHBOARD}?mes=${mesAtual}&ano=${anoAtual}`),
        fetch(ENDPOINTS.METAS),
        fetch(ENDPOINTS.ECONOMIAS)
      ]);

      if (!resDash.ok || !resMetas.ok || !resEcono.ok) throw new Error("Erro ao carregar dados");

      const dashboard = await resDash.json();
      const metas = await resMetas.json();
      const economias = await resEcono.json();

      atualizarEstatisticas(metas, economias, mesAtual, anoAtual);
      renderizarListasMetas(metas, mesAtual, anoAtual);

    } catch (error) {
      console.error("Erro no dashboard:", error);
    }
  }

  function atualizarEstatisticas(metas, economias, mesAtual, anoAtual) {
    const totalGeral = economias.reduce((acc, item) => acc + item.economia, 0);
    
    const totalMes = economias
      .filter(item => {
        if (!item.data) return false;
        const [ano, mes] = item.data.split('-').map(Number);
        return ano === anoAtual && mes === mesAtual;
      })
      .reduce((acc, item) => acc + item.economia, 0);

    const metasAtivas = metas.filter(m => m.ano >= anoAtual);
    const concluidas = metas.filter(m => m.valorAtual >= m.valorAlvo).length;
    const taxaSucesso = metas.length > 0 ? (concluidas / metas.length) * 100 : 0;

    elements.stats.saldo.textContent = formatadorBRL.format(totalGeral);
    elements.stats.receitaMes.textContent = formatadorBRL.format(totalMes);
    elements.stats.metas.textContent = `${metasAtivas.length} ativas`;
    elements.stats.sucesso.textContent = `${taxaSucesso.toFixed(0)}%`;
  }

  function renderizarListasMetas(metas, mesAtual, anoAtual) {
    const { ativas, concluidas } = elements.lists;
    ativas.innerHTML = "";
    concluidas.innerHTML = "";

    metas.sort((a, b) => b.ano - a.ano).forEach(meta => {
      const estaCompleta = meta.valorAtual >= meta.valorAlvo;
      
      let prazoVenceu = meta.ano < anoAtual;
      if (meta.ano === anoAtual && meta.periodo === 'MENSAL' && meta.mes < mesAtual) {
        prazoVenceu = true;
      }

      const container = (estaCompleta || prazoVenceu) ? concluidas : ativas;
      adicionarMetaNoDOM(meta, container, estaCompleta || prazoVenceu);
    });

    if (!ativas.children.length) ativas.innerHTML = "<p style='color:#777;'>Nenhuma meta em andamento.</p>";
    if (!concluidas.children.length) concluidas.innerHTML = "<p style='color:#777;'>Nenhuma meta concluída.</p>";
  }

  function adicionarMetaNoDOM(meta, container, isHistorico) {
    const percentual = meta.valorAlvo > 0 ? (meta.valorAtual / meta.valorAlvo) * 100 : 0;
    const restante = Math.max(0, meta.valorAlvo - meta.valorAtual);
    
    const div = document.createElement("div");
    div.className = `meta-card ${isHistorico ? 'meta-concluida' : ''}`;
    div.style.setProperty('--cor-meta-principal', meta.cor || '#3498db');
    
    // Estilos visuais de histórico (opacidade/filtro) via classe ou inline se necessário
    if (isHistorico) {
        div.style.opacity = "0.9"; 
        div.style.filter = "grayscale(20%)";
    }

    div.innerHTML = `
      <div class="meta-card-header">
        <div class="meta-details">
          <h3>${meta.nome} ${percentual >= 100 ? '✅' : ''}</h3>
          <p>${meta.categoria ? `Categoria: ${meta.categoria.nome}` : 'Meta geral'}</p>
        </div>
        <div class="meta-amount">
          <span class="meta-target-value">${formatadorBRL.format(meta.valorAlvo)}</span>
          <br>
          <span class="meta-target-date">até ${meta.mes ? `${meta.mes}/` : ''}${meta.ano}</span>
        </div>
      </div>
      <div class="meta-card-progress">
        <div class="progress-labels">
          <span>${formatadorBRL.format(meta.valorAtual)} de ${formatadorBRL.format(meta.valorAlvo)}</span>
          <span class="progress-percent">${percentual.toFixed(0)}%</span>
        </div>
        <div class="progress-bar-container">
          <div class="progress-bar-fill" style="width: ${Math.min(percentual, 100).toFixed(0)}%;"></div>
        </div>
      </div>
      <div class="meta-card-footer">
        <span class="meta-remaining">
            ${percentual >= 100 ? 'Meta Concluída!' : `Faltam ${formatadorBRL.format(restante)}`}
        </span>
      </div>
    `;
    container.appendChild(div);
  }

  // Selects

  async function carregarCategorias() {
    try {
      const res = await fetch(ENDPOINTS.CATEGORIAS);
      if (!res.ok) return;
      const categorias = await res.json();
      
      const options = categorias.map(c => `<option value="${c.id}">${c.nome} (${c.tipo})</option>`).join('');
      elements.inputs.categoria.innerHTML = '<option value="">Nenhuma (Meta Geral)</option>' + options;
    } catch (err) { console.error(err); }
  }

  async function carregarMetasParaSelect() {
    try {
      const res = await fetch(ENDPOINTS.METAS);
      if (!res.ok) return;
      const metas = await res.json();
      
      const select = elements.inputs.metaSelect;
      if (metas.length === 0) {
        select.innerHTML = '<option value="">Nenhuma meta criada</option>';
        return;
      }

      select.innerHTML = '<option value="">Selecione uma meta</option>' + metas.map(m => {
        const textoPeriodo = m.periodo === 'MENSAL' ? `(${m.periodo} - ${m.mes}/${m.ano})` : `(${m.periodo} - ${m.ano})`;
        return `<option value="${m.id}">${m.nome} ${textoPeriodo}</option>`;
      }).join('');
    } catch (err) { console.error(err); }
  }

  // Form

  async function handleMetaSubmit(e) {
    e.preventDefault();
    const fd = new FormData(e.target);
    const catId = fd.get("categoria");

    const payload = {
      nome: fd.get("nome"),
      valorAlvo: parseFloat(fd.get("valorAlvo")),
      periodo: fd.get("periodo"),
      mes: fd.get("periodo") === "MENSAL" ? parseInt(fd.get("mes")) : null,
      ano: parseInt(fd.get("ano")),
      categoria: catId ? { id: parseInt(catId) } : null,
      cor: fd.get("cor")
    };

    submitData(ENDPOINTS.METAS, payload, () => toggleModal('meta', false));
  }

  async function handleEconomiaSubmit(e) {
    e.preventDefault();
    const fd = new FormData(e.target);
    
    if (!fd.get("meta") || !fd.get("data_economia")) {
      alert("Preencha todos os campos obrigatórios.");
      return;
    }

    const payload = {
      meta: { id: parseInt(fd.get("meta")) },
      economia: parseFloat(fd.get("economia")),
      data: fd.get("data_economia")
    };

    submitData(ENDPOINTS.ECONOMIAS, payload, () => toggleModal('economia', false));
  }

  async function submitData(url, payload, onSuccess) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error("Falha na requisição");
      
      onSuccess();
      carregarDashboard();
    } catch (err) {
      console.error(err);
      alert("Ocorreu um erro ao salvar.");
    }
  }
});