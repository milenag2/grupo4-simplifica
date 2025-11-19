document.addEventListener("DOMContentLoaded", () => {
  const API_URL = "http://localhost:8080";
  const DASHBOARD_URL = `${API_URL}/dashboard/resumo-principal`;
  const TRANSACOES_URL = `${API_URL}/transacoes`;

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

  carregarDashboard();

  async function carregarDashboard() {
    const hoje = new Date();
    const mesAtual = hoje.getMonth() + 1;
    const anoAtual = hoje.getFullYear();

    // Inicializa o gráfico vazio enquanto carrega
    carregarGraficoHistorico();

    try {
      const [resDashboard, resTransacoes] = await Promise.all([
        fetch(`${DASHBOARD_URL}?mes=${mesAtual}&ano=${anoAtual}`),
        fetch(TRANSACOES_URL)
      ]);

      if (resDashboard.ok) {
        const dashboard = await resDashboard.json();
        statSaldo.textContent = formatadorBRL.format(dashboard.saldo_atual || 0);
        statReceitasMes.textContent = formatadorBRL.format(dashboard.total_receitas_mes || 0);
        statDespesasMes.textContent = formatadorBRL.format(dashboard.total_despesas_mes || 0);
        criarGraficoDonut(dashboard.distribuicao_por_categoria_mes);
      }

      if (resTransacoes.ok) {
        const listaTransacoes = await resTransacoes.json();
        processarDadosParaGrafico(listaTransacoes);
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      statSaldo.textContent = "Erro";
    }
  }

  function processarDadosParaGrafico(transacoes) {
    const hoje = new Date();
    const receitasPorMes = Array(6).fill(0);
    const despesasPorMes = Array(6).fill(0);
    const datasReferencia = [];

    // Gera janela de referência: 4 meses atrás até o próximo mês
    for (let i = 4; i >= -1; i--) {
      datasReferencia.push(new Date(hoje.getFullYear(), hoje.getMonth() - i, 1));
    }

    transacoes.forEach(t => {
      if (!t.data_transacao) return;

      // Adiciona horário zerado para evitar problemas de fuso horário (UTC vs Local)
      const dataTransacao = new Date(t.data_transacao + 'T00:00:00');

      const index = datasReferencia.findIndex(ref => 
        dataTransacao.getMonth() === ref.getMonth() && 
        dataTransacao.getFullYear() === ref.getFullYear()
      );

      if (index !== -1) {
        if (t.tipo === 'RECEITA') receitasPorMes[index] += t.valor;
        else if (t.tipo === 'DESPESA') despesasPorMes[index] += t.valor;
      }
    });

    carregarGraficoHistorico(receitasPorMes, despesasPorMes);
  }

  // Gráficos 

  function criarGraficoDonut(data) {
    if (donutChart) donutChart.destroy();

    if (!data || data.length === 0) {
      donutCanvas.style.display = 'none';
      donutPlaceholder.style.display = 'flex';
      return;
    }
    donutCanvas.style.display = 'block';
    donutPlaceholder.style.display = 'none';

    donutChart = new Chart(donutCtx, {
      type: 'doughnut',
      data: {
        labels: data.map(item => item.categoriaNome),
        datasets: [{
          label: 'Gastos',
          data: data.map(item => item.total),
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
    const hoje = new Date();
    const labels = [];
    for (let i = 4; i >= -1; i--) {
      const d = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
      labels.push(new Intl.DateTimeFormat('pt-BR', { month: 'short' }).format(d).toUpperCase());
    }
    return labels;
  }

  function carregarGraficoHistorico(receitasData = Array(6).fill(0), despesasData = Array(6).fill(0)) {
    if (historyChart) historyChart.destroy();

    // Garante que os arrays tenham o tamanho correto caso venham incompletos
    const dadosR = receitasData.length === 6 ? receitasData : Array(6).fill(0);
    const dadosD = despesasData.length === 6 ? despesasData : Array(6).fill(0);

    historyChart = new Chart(historyCtx, {
      type: 'bar',
      data: {
        labels: obterLabelsJanelaTemporal(),
        datasets: [
          {
            label: 'Receitas',
            data: dadosR,
            backgroundColor: '#28a745',
            borderRadius: 4,
            barPercentage: 0.6,
          },
          {
            label: 'Despesas',
            data: dadosD,
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