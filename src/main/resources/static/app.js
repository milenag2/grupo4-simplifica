document.addEventListener("DOMContentLoaded", () => {
  
  const form = document.getElementById("form-transacao");
  const selectCategoria = document.getElementById("categoria");
  const tabelaCorpo = document.getElementById("tabela-corpo");
  const modalOverlay = document.querySelector(".modal-overlay");
  const btnAbrirModal = document.getElementById("btn-abrir-modal");
  const btnFecharModal = document.getElementById("btn-fechar-modal");
  const btnCancelar = document.getElementById("btn-cancelar");
  const btnTipoReceita = document.getElementById("btn-tipo-receita");
  const btnTipoDespesa = document.getElementById("btn-tipo-despesa");
  const inputTipo = document.getElementById("tipo");

  const API_URL = "http://localhost:8080";
  const CATEGORIAS_URL = `${API_URL}/categorias`;
  const TRANSACOES_URL = `${API_URL}/transacoes`;

  function abrirModal() {
    selecionarTipo('RECEITA');
    modalOverlay.classList.add("ativo");
  }

  function fecharModal() {
    modalOverlay.classList.remove("ativo");
    form.reset(); 
  }

  btnAbrirModal.addEventListener("click", abrirModal);
  btnFecharModal.addEventListener("click", fecharModal);
  btnCancelar.addEventListener("click", fecharModal);
  modalOverlay.addEventListener("click", (event) => {
    if (event.target === modalOverlay) {
      fecharModal();
    }
  });

  function selecionarTipo(tipo) {
    inputTipo.value = tipo; 
    if (tipo === 'RECEITA') {
      btnTipoReceita.classList.add("ativo-receita");
      btnTipoDespesa.classList.remove("ativo-despesa");
    } else {
      btnTipoReceita.classList.remove("ativo-receita");
      btnTipoDespesa.classList.add("ativo-despesa");
    }
  }

  btnTipoReceita.addEventListener("click", () => selecionarTipo('RECEITA'));
  btnTipoDespesa.addEventListener("click", () => selecionarTipo('DESPESA'));

  async function carregarCategorias() {
    try {
      const response = await fetch(CATEGORIAS_URL);
      if (!response.ok) throw new Error("Falha ao carregar categorias.");
      const categorias = await response.json();
      
      selectCategoria.innerHTML = '<option value="">Selecione uma categoria</option>'; 
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

  async function carregarTransacoes() {
    try {
      const response = await fetch(TRANSACOES_URL); 
      if (!response.ok) throw new Error("Falha ao carregar transações.");
      const transacoes = await response.json();
      
      tabelaCorpo.innerHTML = ""; 
      
      transacoes.sort((a, b) => new Date(b.data_transacao) - new Date(a.data_transacao));
      
      transacoes.forEach(transacao => {
        adicionarTransacaoNaTabela(transacao);
      });
    } catch (error) {
      console.error("Erro ao carregar transações:", error);
      tabelaCorpo.innerHTML = `<tr><td colspan="6">Erro ao carregar transações.</td></tr>`;
    }
  }

  function adicionarTransacaoNaTabela(transacao) {
    const isReceita = transacao.tipo === 'RECEITA';
    const classeValor = isReceita ? 'valor-receita' : 'valor-despesa';
    const prefixoValor = isReceita ? '+' : '-';
    
    const valorFormatado = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(transacao.valor);
    const dataFormatada = new Date(transacao.data_transacao + 'T00:00:00-03:00')
      .toLocaleDateString('pt-BR');

    const categoriaNome = transacao.categoria ? transacao.categoria.nome : 'N/A';
    const categoriaSlug = categoriaNome.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(' ', '-');
    const statusSlug = transacao.status.toLowerCase();

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td data-label="Data">${dataFormatada}</td>
      <td data-label="Descrição">${transacao.descricao}</td>
      <td data-label="Valor" class="${classeValor}">${prefixoValor} ${valorFormatado.replace('R$', '')}</td>
      <td data-label="Categoria">
        <span class="tag categoria-${categoriaSlug}">${categoriaNome}</span>
      </td>
      <td data-label="Status">
        <span class="tag status-${statusSlug}">${transacao.status}</span>
      </td>
      <td data-label="Ações" class="action-buttons">
        <button class="btn btn-delete" data-id="${transacao.id}"><i class="fas fa-trash-alt"></i></button>
      </td>
    `;
    tabelaCorpo.appendChild(tr);
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault(); 
    
    const formData = new FormData(form);
    
    const transacaoData = {
      descricao: formData.get("descricao"),
      valor: parseFloat(formData.get("valor")),
      data_transacao: formData.get("data_transacao"), 
      tipo: formData.get("tipo"), 
      status: "PENDENTE", 
      categoria: {
        id: parseInt(formData.get("categoria")) 
      }
    };

    try {
      const response = await fetch(TRANSACOES_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(transacaoData),
      });

      if (!response.ok) {
        throw new Error("Falha ao salvar transação.");
      }
      
      carregarTransacoes(); 
      fecharModal();

    } catch (error) {
      console.error("Erro ao salvar transação:", error);
      alert("Não foi possível salvar a transação. Verifique o console.");
    }
  });

  tabelaCorpo.addEventListener("click", async (event) => {
    const deleteButton = event.target.closest(".btn-delete");

    if (!deleteButton) {
      return;
    }
    
    const id = deleteButton.dataset.id; 
    
    if (confirm(`Tem certeza que deseja excluir a transação ID ${id}?`)) {
      try {
        const response = await fetch(`${TRANSACOES_URL}/${id}`, { method: "DELETE" });
        if (!response.ok) throw new Error("Falha ao deletar transação.");
        
        deleteButton.closest("tr").remove();

      } catch (error) {
        console.error("Erro ao deletar transação:", error);
        alert("Não foi possível deletar a transação.");
      }
    }
  });

  carregarCategorias();
  carregarTransacoes();
});