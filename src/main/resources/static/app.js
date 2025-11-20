document.addEventListener("DOMContentLoaded", () => {
  const API_URL = "http://localhost:8080";
  const CATEGORIAS_URL = `${API_URL}/categorias`;
  const TRANSACOES_URL = `${API_URL}/transacoes`;

  let todasCategorias = [];
  let todasTransacoes = [];

  const filtroCategoria = document.getElementById("filtro-categoria");
  const filtroTipo = document.getElementById("filtro-tipo");

  const tabelaCorpo = document.getElementById("tabela-corpo");

  if (filtroCategoria) filtroCategoria.addEventListener("change", aplicarFiltros);
  if (filtroTipo) filtroTipo.addEventListener("change", aplicarFiltros);

  function aplicarFiltros() {
    const categoriaNomeSelecionada = filtroCategoria ? filtroCategoria.value : "";
    const tipoSelecionado = filtroTipo ? filtroTipo.value : "";

    const transacoesFiltradas = todasTransacoes.filter(t => {
      let matchCategoria = true;
      if (categoriaNomeSelecionada !== "") {
        matchCategoria = t.categoria && t.categoria.nome === categoriaNomeSelecionada;
      }

      const matchTipo = tipoSelecionado === "" || t.tipo === tipoSelecionado;

      return matchCategoria && matchTipo;
    });

    renderizarTabela(transacoesFiltradas);
  }

  function renderizarTabela(listaTransacoes) {
    if (!tabelaCorpo) return;
    tabelaCorpo.innerHTML = "";

    if (listaTransacoes.length === 0) {
      tabelaCorpo.innerHTML = `<tr><td colspan="5" style="text-align:center; color:#666;">Nenhuma transação encontrada.</td></tr>`;
      return;
    }

    listaTransacoes.forEach(transacao => {
      adicionarTransacaoNaTabela(transacao);
    });
  }

  function adicionarTransacaoNaTabela(transacao) {
    const isReceita = transacao.tipo === 'RECEITA';
    const classeValor = isReceita ? 'valor-receita' : 'valor-despesa';
    const prefixoValor = isReceita ? '+' : '-';

    const valorFormatado = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(transacao.valor);

    let dataFormatada = 'Data Inválida';
    if (transacao.data_transacao) {
      const [ano, mes, dia] = transacao.data_transacao.split('-');
      dataFormatada = `${dia}/${mes}/${ano}`;
    }

    const categoriaNome = transacao.categoria ? transacao.categoria.nome : 'N/A';
    const catStyle = (transacao.categoria && transacao.categoria.cor)
      ? `background-color: ${transacao.categoria.cor}; color: #fff; text-shadow: 0 1px 2px rgba(0,0,0,0.2);`
      : 'background-color: #eee; color: #555;';

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td data-label="Data">${dataFormatada}</td>
      <td data-label="Descrição">${transacao.descricao}</td>
      <td data-label="Valor" class="${classeValor}">${prefixoValor} ${valorFormatado.replace('R$', '')}</td>
      <td data-label="Categoria">
        <span class="tag" style="${catStyle}">${categoriaNome}</span>
      </td>
      <td data-label="Ações" class="action-buttons">
        <button class="btn btn-delete" data-id="${transacao.id}"><i class="fas fa-trash-alt"></i></button>
      </td>
    `;
    tabelaCorpo.appendChild(tr);
  }

  const modalCategoriaOverlay = document.getElementById("modal-categoria-overlay");
  const formCategoria = document.getElementById("form-categoria");
  const btnAbrirCategoria = document.getElementById("btn-abrir-categoria");
  const btnFecharCategoria = document.getElementById("btn-fechar-categoria");
  const btnCancelarCategoria = document.getElementById("btn-cancelar-categoria");

  const btnReceitaCat = document.getElementById("btn-tipo-receita-cat");
  const btnDespesaCat = document.getElementById("btn-tipo-despesa-cat");
  const inputTipoCat = document.getElementById("tipo-cat");

  const inputCor = document.getElementById("cor");
  const spanHex = document.getElementById("hex-value");

  function abrirModalCategoria() {
    modalCategoriaOverlay.classList.add("ativo");
    formCategoria.reset();
    selecionarTipoCategoria('RECEITA');
    if (spanHex) { spanHex.textContent = "#3498db"; spanHex.style.color = "#3498db"; }
  }

  function fecharModalCategoria() {
    modalCategoriaOverlay.classList.remove("ativo");
  }

  function selecionarTipoCategoria(tipo) {
    if (inputTipoCat) inputTipoCat.value = tipo;
    if (tipo === 'RECEITA') {
      btnReceitaCat.classList.add("ativo-receita");
      btnDespesaCat.classList.remove("ativo-despesa");
    } else {
      btnDespesaCat.classList.add("ativo-despesa");
      btnReceitaCat.classList.remove("ativo-receita");
    }
  }

  if (btnAbrirCategoria) btnAbrirCategoria.addEventListener("click", abrirModalCategoria);
  if (btnFecharCategoria) btnFecharCategoria.addEventListener("click", fecharModalCategoria);
  if (btnCancelarCategoria) btnCancelarCategoria.addEventListener("click", fecharModalCategoria);
  if (btnReceitaCat) btnReceitaCat.addEventListener("click", () => selecionarTipoCategoria('RECEITA'));
  if (btnDespesaCat) btnDespesaCat.addEventListener("click", () => selecionarTipoCategoria('DESPESA'));

  if (inputCor && spanHex) {
    inputCor.addEventListener("input", () => {
      spanHex.textContent = inputCor.value;
      spanHex.style.color = inputCor.value;
    });
  }

  if (formCategoria) {
    formCategoria.addEventListener("submit", async (event) => {
      event.preventDefault();
      const formData = new FormData(formCategoria);
      const categoriaData = {
        nome: formData.get("nome"),
        cor: formData.get("cor"),
        tipo: formData.get("tipo")
      };
      if (!categoriaData.tipo) { alert("Selecione o tipo."); return; }
      try {
        const response = await fetch(CATEGORIAS_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(categoriaData),
        });
        if (!response.ok) throw new Error("Falha ao salvar categoria.");
        alert("Categoria criada com sucesso!");
        fecharModalCategoria();
        carregarCategorias();
      } catch (error) {
        console.error("Erro:", error);
        alert("Erro ao criar categoria.");
      }
    });
  }

  const modalTransacaoOverlay = document.getElementById("modal-transacao-overlay") || document.querySelector(".modal-overlay");
  const formTransacao = document.getElementById("form-transacao");
  const btnAbrirTransacao = document.getElementById("btn-abrir-transacao");
  const btnFecharTransacao = document.getElementById("btn-fechar-modal");
  const btnCancelarTransacao = document.getElementById("btn-cancelar");
  const btnReceitaTrans = document.getElementById("btn-tipo-receita");
  const btnDespesaTrans = document.getElementById("btn-tipo-despesa");
  const inputTipoTrans = document.getElementById("tipo");
  const selectCategoria = document.getElementById("categoria");

  function abrirModalTransacao() {
    modalTransacaoOverlay.classList.add("ativo");
    selecionarTipoTransacao('RECEITA');
  }

  function fecharModalTransacao() {
    modalTransacaoOverlay.classList.remove("ativo");
    formTransacao.reset();
  }

  function selecionarTipoTransacao(tipo) {
    if (inputTipoTrans) inputTipoTrans.value = tipo;
    if (tipo === 'RECEITA') {
      btnReceitaTrans.classList.add("ativo-receita");
      btnDespesaTrans.classList.remove("ativo-despesa");
    } else {
      btnDespesaTrans.classList.add("ativo-despesa");
      btnReceitaTrans.classList.remove("ativo-receita");
    }
    atualizarSelectCategorias(tipo);
  }

  function atualizarSelectCategorias(tipo) {
    if (!selectCategoria) return;
    selectCategoria.innerHTML = '<option value="">Selecione uma categoria</option>';
    const categoriasFiltradas = todasCategorias.filter(cat => cat.tipo === tipo);
    categoriasFiltradas.forEach(cat => {
      const option = document.createElement("option");
      option.value = cat.id;
      option.textContent = cat.nome;
      selectCategoria.appendChild(option);
    });
  }

  if (btnAbrirTransacao) btnAbrirTransacao.addEventListener("click", abrirModalTransacao);
  if (btnFecharTransacao) btnFecharTransacao.addEventListener("click", fecharModalTransacao);
  if (btnCancelarTransacao) btnCancelarTransacao.addEventListener("click", fecharModalTransacao);
  if (btnReceitaTrans) btnReceitaTrans.addEventListener("click", () => selecionarTipoTransacao('RECEITA'));
  if (btnDespesaTrans) btnDespesaTrans.addEventListener("click", () => selecionarTipoTransacao('DESPESA'));
  window.addEventListener("click", (e) => {
    if (e.target === modalCategoriaOverlay) fecharModalCategoria();
    if (e.target === modalTransacaoOverlay) fecharModalTransacao();
  });

  if (formTransacao) {
    formTransacao.addEventListener("submit", async (event) => {
      event.preventDefault();
      const formData = new FormData(formTransacao);
      const transacaoData = {
        descricao: formData.get("descricao"),
        valor: parseFloat(formData.get("valor")),
        data_transacao: formData.get("data_transacao"),
        tipo: formData.get("tipo"),
        categoria: { id: parseInt(formData.get("categoria")) }
      };
      try {
        const response = await fetch(TRANSACOES_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(transacaoData),
        });
        if (!response.ok) throw new Error("Falha ao salvar transação.");
        carregarTransacoes();
        fecharModalTransacao();
      } catch (error) {
        console.error("Erro:", error);
        alert("Não foi possível salvar a transação.");
      }
    });
  }


  async function carregarCategorias() {
    try {
      const response = await fetch(CATEGORIAS_URL);
      if (!response.ok) throw new Error("Falha ao carregar categorias.");

      todasCategorias = await response.json();

      if (filtroCategoria) {
        filtroCategoria.innerHTML = '<option value="">Todas as categorias</option>';
        todasCategorias.forEach(cat => {
          const option = document.createElement("option");
          option.value = cat.nome;
          option.textContent = cat.nome;
          filtroCategoria.appendChild(option);
        });
      }

      const tipoAtual = inputTipoTrans ? inputTipoTrans.value : 'RECEITA';
      atualizarSelectCategorias(tipoAtual || 'RECEITA');

    } catch (error) {
      console.error("Erro ao carregar categorias:", error);
    }
  }

  async function carregarTransacoes() {
    try {
      const response = await fetch(TRANSACOES_URL);
      if (!response.ok) throw new Error("Erro na API Transações");
      todasTransacoes = await response.json();

      todasTransacoes.sort((a, b) => new Date(b.data_transacao) - new Date(a.data_transacao));

      aplicarFiltros();

    } catch (error) {
      console.error("Erro ao carregar transações:", error);
    }
  }

  if (tabelaCorpo) {
    tabelaCorpo.addEventListener("click", async (event) => {
      const deleteButton = event.target.closest(".btn-delete");
      if (!deleteButton) return;
      const id = deleteButton.dataset.id;
      if (confirm(`Tem certeza que deseja excluir a transação?`)) {
        try {
          const response = await fetch(`${TRANSACOES_URL}/${id}`, { method: "DELETE" });
          if (!response.ok) throw new Error("Falha ao deletar.");

          todasTransacoes = todasTransacoes.filter(t => t.id != id);
          aplicarFiltros();
        } catch (error) {
          console.error("Erro:", error);
          alert("Não foi possível deletar.");
        }
      }
    });
  }

  carregarCategorias();
  carregarTransacoes();
});