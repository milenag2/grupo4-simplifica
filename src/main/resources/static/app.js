document.addEventListener("DOMContentLoaded", () => {
  const API_BASE = "http://localhost:8080";
  const API = {
    CATEGORIAS: `${API_BASE}/categorias`,
    TRANSACOES: `${API_BASE}/transacoes`
  };

  let estado = {
    categorias: [],
    transacoes: []
  };

  const formatadorBRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

  const DOM = {
    filtros: {
      categoria: document.getElementById("filtro-categoria"),
      tipo: document.getElementById("filtro-tipo")
    },
    tabela: document.getElementById("tabela-corpo"),
    modals: {
      categoria: document.getElementById("modal-categoria-overlay"),
      transacao: document.getElementById("modal-transacao-overlay") || document.querySelector(".modal-overlay")
    },
    forms: {
      categoria: document.getElementById("form-categoria"),
      transacao: document.getElementById("form-transacao")
    },
    inputs: {
      tipoCat: document.getElementById("tipo-cat"),
      tipoTrans: document.getElementById("tipo"),
      catCor: document.getElementById("cor"),
      catHex: document.getElementById("hex-value"),
      transacaoCategoria: document.getElementById("categoria")
    },
    botoes: {
      catReceita: document.getElementById("btn-tipo-receita-cat"),
      catDespesa: document.getElementById("btn-tipo-despesa-cat"),
      transReceita: document.getElementById("btn-tipo-receita"),
      transDespesa: document.getElementById("btn-tipo-despesa")
    }
  };

  init();

  function init() {
    setupEventListeners();
    carregarDadosIniciais();
  }

  function setupEventListeners() {
    // Filtros
    if (DOM.filtros.categoria) DOM.filtros.categoria.addEventListener("change", aplicarFiltros);
    if (DOM.filtros.tipo) DOM.filtros.tipo.addEventListener("change", aplicarFiltros);

    // Modal Categoria
    document.getElementById("btn-abrir-categoria")?.addEventListener("click", () => abrirModalCategoria());
    document.getElementById("btn-fechar-categoria")?.addEventListener("click", () => toggleModal('categoria', false));
    document.getElementById("btn-cancelar-categoria")?.addEventListener("click", () => toggleModal('categoria', false));
    
    // Modal Transação
    document.getElementById("btn-abrir-transacao")?.addEventListener("click", () => abrirModalTransacao());
    document.getElementById("btn-fechar-modal")?.addEventListener("click", () => toggleModal('transacao', false));
    document.getElementById("btn-cancelar")?.addEventListener("click", () => toggleModal('transacao', false));

    // Fechar ao clicar fora
    window.addEventListener("click", (e) => {
      if (e.target === DOM.modals.categoria) toggleModal('categoria', false);
      if (e.target === DOM.modals.transacao) toggleModal('transacao', false);
    });

    DOM.botoes.catReceita?.addEventListener("click", () => setTipo('categoria', 'RECEITA'));
    DOM.botoes.catDespesa?.addEventListener("click", () => setTipo('categoria', 'DESPESA'));
    DOM.botoes.transReceita?.addEventListener("click", () => setTipo('transacao', 'RECEITA'));
    DOM.botoes.transDespesa?.addEventListener("click", () => setTipo('transacao', 'DESPESA'));

    if (DOM.inputs.catCor && DOM.inputs.catHex) {
      DOM.inputs.catCor.addEventListener("input", (e) => {
        DOM.inputs.catHex.textContent = e.target.value;
        DOM.inputs.catHex.style.color = e.target.value;
      });
    }

    DOM.forms.categoria?.addEventListener("submit", handleCategoriaSubmit);
    DOM.forms.transacao?.addEventListener("submit", handleTransacaoSubmit);

    DOM.tabela?.addEventListener("click", handleDeleteClick);
  }

  async function carregarDadosIniciais() {
    await carregarCategorias();
    await carregarTransacoes();
  }

  // Lógica de Modais

  function toggleModal(tipo, show) {
    const modal = DOM.modals[tipo];
    const form = DOM.forms[tipo];
    if (!modal) return;

    if (show) {
      modal.classList.add("ativo");
    } else {
      modal.classList.remove("ativo");
      if (form) form.reset();
      if (tipo === 'categoria' && DOM.inputs.catHex) {
        DOM.inputs.catHex.textContent = "#3498db";
        DOM.inputs.catHex.style.color = "#3498db";
      }
    }
  }

  function abrirModalCategoria() {
    toggleModal('categoria', true);
    setTipo('categoria', 'RECEITA');
  }

  function abrirModalTransacao() {
    toggleModal('transacao', true);
    setTipo('transacao', 'RECEITA');
  }

  function setTipo(contexto, tipo) {
    const input = contexto === 'categoria' ? DOM.inputs.tipoCat : DOM.inputs.tipoTrans;
    if (input) input.value = tipo;

    const btnRec = contexto === 'categoria' ? DOM.botoes.catReceita : DOM.botoes.transReceita;
    const btnDesp = contexto === 'categoria' ? DOM.botoes.catDespesa : DOM.botoes.transDespesa;

    if (tipo === 'RECEITA') {
      btnRec?.classList.add("ativo-receita");
      btnDesp?.classList.remove("ativo-despesa");
    } else {
      btnDesp?.classList.add("ativo-despesa");
      btnRec?.classList.remove("ativo-receita");
    }

    if (contexto === 'transacao') atualizarSelectCategoriasModal(tipo);
  }

  function atualizarSelectCategoriasModal(tipo) {
    const select = DOM.inputs.transacaoCategoria;
    if (!select) return;
    
    select.innerHTML = '<option value="">Selecione uma categoria</option>';
    estado.categorias
      .filter(cat => cat.tipo === tipo)
      .forEach(cat => {
        const option = document.createElement("option");
        option.value = cat.id;
        option.textContent = cat.nome;
        select.appendChild(option);
      });
  }

  // API e Dados

  async function carregarCategorias() {
    try {
      const res = await fetch(API.CATEGORIAS);
      if (!res.ok) throw new Error("Erro ao carregar categorias");
      estado.categorias = await res.json();

      if (DOM.filtros.categoria) {
        DOM.filtros.categoria.innerHTML = '<option value="">Todas as categorias</option>';
        estado.categorias.forEach(cat => {
          const option = document.createElement("option");
          option.value = cat.nome;
          option.textContent = cat.nome;
          DOM.filtros.categoria.appendChild(option);
        });
      }
    } catch (err) { console.error(err); }
  }

  async function carregarTransacoes() {
    try {
      const res = await fetch(API.TRANSACOES);
      if (!res.ok) throw new Error("Erro ao carregar transações");
      estado.transacoes = await res.json();

      estado.transacoes.sort((a, b) => new Date(b.data_transacao) - new Date(a.data_transacao));
      
      aplicarFiltros();
    } catch (err) { console.error(err); }
  }

  // Renderização e Filtros

  function aplicarFiltros() {
    const catSelecionada = DOM.filtros.categoria?.value || "";
    const tipoSelecionado = DOM.filtros.tipo?.value || "";

    const filtradas = estado.transacoes.filter(t => {
      const matchCat = catSelecionada === "" || (t.categoria && t.categoria.nome === catSelecionada);
      const matchTipo = tipoSelecionado === "" || t.tipo === tipoSelecionado;
      return matchCat && matchTipo;
    });

    renderizarTabela(filtradas);
  }

  function renderizarTabela(lista) {
    if (!DOM.tabela) return;
    DOM.tabela.innerHTML = "";

    if (lista.length === 0) {
      DOM.tabela.innerHTML = `<tr><td colspan="5" style="text-align:center; color:#666;">Nenhuma transação encontrada.</td></tr>`;
      return;
    }

    lista.forEach(t => {
      const isReceita = t.tipo === 'RECEITA';

      let dataFormatada = 'Data Inválida';
      if (t.data_transacao) {
        const [ano, mes, dia] = t.data_transacao.split('-');
        dataFormatada = `${dia}/${mes}/${ano}`;
      }

      const catNome = t.categoria ? t.categoria.nome : 'N/A';
      const catStyle = t.categoria?.cor 
        ? `background-color: ${t.categoria.cor}; color: #fff; text-shadow: 0 1px 2px rgba(0,0,0,0.2);` 
        : 'background-color: #eee; color: #555;';

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td data-label="Data">${dataFormatada}</td>
        <td data-label="Descrição">${t.descricao}</td>
        <td data-label="Valor" class="${isReceita ? 'valor-receita' : 'valor-despesa'}">
            ${isReceita ? '+' : '-'} ${formatadorBRL.format(t.valor).replace('R$', '')}
        </td>
        <td data-label="Categoria">
          <span class="tag" style="${catStyle}">${catNome}</span>
        </td>
        <td data-label="Ações" class="action-buttons">
          <button class="btn btn-delete" data-id="${t.id}"><i class="fas fa-trash-alt"></i></button>
        </td>
      `;
      DOM.tabela.appendChild(tr);
    });
  }

  // Submit/Delete

  async function handleCategoriaSubmit(e) {
    e.preventDefault();
    const fd = new FormData(e.target);
    const payload = {
      nome: fd.get("nome"),
      cor: fd.get("cor"),
      tipo: fd.get("tipo")
    };

    if (!payload.tipo) { alert("Selecione o tipo."); return; }

    try {
      const res = await fetch(API.CATEGORIAS, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error("Erro ao salvar");
      
      alert("Categoria criada!");
      toggleModal('categoria', false);
      carregarCategorias(); 
    } catch (err) { 
      console.error(err); 
      alert("Erro ao criar categoria."); 
    }
  }

  async function handleTransacaoSubmit(e) {
    e.preventDefault();
    const fd = new FormData(e.target);
    const payload = {
      descricao: fd.get("descricao"),
      valor: parseFloat(fd.get("valor")),
      data_transacao: fd.get("data_transacao"),
      tipo: fd.get("tipo"),
      categoria: { id: parseInt(fd.get("categoria")) }
    };

    try {
      const res = await fetch(API.TRANSACOES, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error("Erro ao salvar");

      toggleModal('transacao', false);
      carregarTransacoes();
    } catch (err) { 
      console.error(err); 
      alert("Erro ao salvar transação."); 
    }
  }

  async function handleDeleteClick(e) {
    const btn = e.target.closest(".btn-delete");
    if (!btn) return;

    const id = btn.dataset.id;
    if (confirm("Tem certeza que deseja excluir a transação?")) {
      try {
        const res = await fetch(`${API.TRANSACOES}/${id}`, { method: "DELETE" });
        if (!res.ok) throw new Error("Erro ao deletar");
        
        estado.transacoes = estado.transacoes.filter(t => t.id != id);
        aplicarFiltros();
      } catch (err) {
        console.error(err);
        alert("Não foi possível deletar.");
      }
    }
  }
});