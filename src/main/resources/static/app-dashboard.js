document.addEventListener("DOMContentLoaded", () => {
  
  // URLs da API
  const API_URL = "http://localhost:8080";
  // Endpoint de resumo (Cards e Donut)
  const DASHBOARD_URL = `${API_URL}/dashboard/resumo-principal`;
  // Endpoint da Lista Completa (para montar o Histórico no JS)
  const TRANSACOES_URL = `${API_URL}/transacoes`; 

  // Elementos DOM
  const statSaldo = document.getElementById("stat-saldo");
  const statReceitasMes = document.getElementById("stat-receitas-mes");
  const statDespesasMes = document.getElementById("stat-despesas-mes");

  const donutCanvas = document.getElementById("donutChart");
  const donutPlaceholder = document.getElementById("donut-placeholder");
  const donutCtx = donutCanvas.getContext("2d");
  let donutChart; 

  const historyCanvas = document.getElementById("historyChart");
  const historyCtx = historyCanvas.getContext("2d");
  let historyChart;

  const formatadorBRL = new Intl.NumberFormat('pt-BR', { 
    style: 'currency', 
    currency: 'BRL' 
  });

  // Inicializa a tela
  carregarDashboard();

  async function carregarDashboard() {
    const hoje = new Date();
    const mesAtual = hoje.getMonth() + 1;
    const anoAtual = hoje.getFullYear();

    // 1. Inicia o gráfico vazio para não quebrar o layout visualmente
    carregarGraficoHistorico(); 

    try {
      // --- A. CARREGA OS DADOS DE RESUMO (Cards + Donut) ---
      const resDashboard = await fetch(`${DASHBOARD_URL}?mes=${mesAtual}&ano=${anoAtual}`);
      if (resDashboard.ok) {
        const dashboard = await resDashboard.json();
        
        statSaldo.textContent = formatadorBRL.format(dashboard.saldo_atual || 0);
        statReceitasMes.textContent = formatadorBRL.format(dashboard.total_receitas_mes || 0);
        statDespesasMes.textContent = formatadorBRL.format(dashboard.total_despesas_mes || 0);
        
        criarGraficoDonut(dashboard.distribuicao_por_categoria_mes);
      }

      // --- B. CARREGA A LISTA DE TRANSAÇÕES (Histórico) ---
      const resTransacoes = await fetch(TRANSACOES_URL);
      if (resTransacoes.ok) {
        const listaTransacoes = await resTransacoes.json();
        // Chama a função que processa a lista bruta e monta o gráfico
        processarDadosParaGrafico(listaTransacoes);
      }

    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      statSaldo.textContent = "Erro";
    }
  }

  /**
   * Processa a lista de transações vinda do Java
   * e agrupa os valores nos 6 meses do gráfico.
   */
  function processarDadosParaGrafico(transacoes) {
    const hoje = new Date();
    
    // Arrays para armazenar os totais (6 posições)
    // Ordem: [Mês-4, Mês-3, Mês-2, Mês-1, Mês Atual, Próximo Mês]
    const receitasPorMes = [0, 0, 0, 0, 0, 0];
    const despesasPorMes = [0, 0, 0, 0, 0, 0];
    
    // Cria datas de referência para saber onde encaixar cada transação
    const datasReferencia = [];
    for (let i = 4; i >= -1; i--) {
      // Ex: Se hoje é Nov, gera: Jul, Ago, Set, Out, Nov, Dez
      datasReferencia.push(new Date(hoje.getFullYear(), hoje.getMonth() - i, 1));
    }

    // Percorre a lista completa de transações do banco
    transacoes.forEach(t => {
      // CORREÇÃO AQUI: O campo no Java é 'data_transacao'
      if (!t.data_transacao) return; // Pula se não tiver data

      // Adiciona 'T00:00:00' para garantir que o JS entenda como data local/ISO
      const dataTransacao = new Date(t.data_transacao + 'T00:00:00'); 

      // Tenta encaixar a transação em um dos 6 meses do gráfico
      for (let i = 0; i < 6; i++) {
        const ref = datasReferencia[i];
        
        // Verifica se Mês e Ano coincidem
        if (dataTransacao.getMonth() === ref.getMonth() && 
            dataTransacao.getFullYear() === ref.getFullYear()) {
          
          // Soma o valor na categoria correta (Baseado no Enum do Java)
          if (t.tipo === 'RECEITA') {
            receitasPorMes[i] += t.valor;
          } else if (t.tipo === 'DESPESA') {
            despesasPorMes[i] += t.valor;
          }
          break; // Encontrou o mês, para de procurar nos outros
        }
      }
    });

    // Atualiza o gráfico com os dados calculados do banco
    carregarGraficoHistorico(receitasPorMes, despesasPorMes);
  }

  // --- Funções de Gráfico (Donut e Barras) ---

  function criarGraficoDonut(data) {
    if (donutChart) donutChart.destroy();
    
    if (!data || data.length === 0) {
      donutCanvas.style.display = 'none';
      donutPlaceholder.style.display = 'flex';
      return;
    }
    donutCanvas.style.display = 'block';
    donutPlaceholder.style.display = 'none';

    const labels = data.map(item => item.categoriaNome);
    const valores = data.map(item => item.total);

    donutChart = new Chart(donutCtx, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          label: 'Gastos',
          data: valores,
          backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#E7E9ED', '#80E1A1'],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'right' },
          tooltip: {
            callbacks: { label: (c) => `${c.label}: ${formatadorBRL.format(c.parsed)}` }
          }
        }
      }
    });
  }

  function obterLabelsJanelaTemporal() {
    const labels = [];
    const hoje = new Date();
    // Gera labels de 4 meses atrás até 1 mês na frente
    for (let i = 4; i >= -1; i--) {
      const d = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
      const nomeMes = new Intl.DateTimeFormat('pt-BR', { month: 'short' }).format(d);
      labels.push(nomeMes.toUpperCase());
    }
    return labels;
  }

  function carregarGraficoHistorico(receitasData = [], despesasData = []) {
    if (historyChart) historyChart.destroy();

    const labelsMeses = obterLabelsJanelaTemporal();
    
    // Garante arrays de tamanho 6 preenchidos com 0 se vier vazio
    const dadosReceitas = receitasData.length === 6 ? receitasData : [0,0,0,0,0,0];
    const dadosDespesas = despesasData.length === 6 ? despesasData : [0,0,0,0,0,0];

    historyChart = new Chart(historyCtx, {
      type: 'bar',
      data: {
        labels: labelsMeses,
        datasets: [
          {
            label: 'Receitas',
            data: dadosReceitas,
            backgroundColor: '#28a745',
            borderRadius: 4,
            barPercentage: 0.6,
          },
          {
            label: 'Despesas',
            data: dadosDespesas,
            backgroundColor: '#dc3545',
            borderRadius: 4,
            barPercentage: 0.6,
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'top' },
          tooltip: {
            callbacks: {
              label: (c) => `${c.dataset.label}: ${formatadorBRL.format(c.parsed.y)}`
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: (v) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumSignificantDigits: 3 })
            }
          },
          x: { grid: { display: false } }
        }
      }
    });
  }
});