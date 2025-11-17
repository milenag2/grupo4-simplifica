document.addEventListener("DOMContentLoaded", () => {
  
  // URLs da API
  const API_URL = "http://localhost:8080";
  const DASHBOARD_URL = `${API_URL}/dashboard/resumo-principal`;

  // Elementos dos Cards
  const statSaldo = document.getElementById("stat-saldo");
  const statReceitasMes = document.getElementById("stat-receitas-mes");
  const statDespesasMes = document.getElementById("stat-despesas-mes");

  // Elemento do Gráfico
  const donutCanvas = document.getElementById("donutChart");
  const donutPlaceholder = document.getElementById("donut-placeholder");
  const donutCtx = donutCanvas.getContext("2d");
  let donutChart; // Variável para guardar a instância do gráfico

  // Formata um número para Real (BRL)
  const formatadorBRL = new Intl.NumberFormat('pt-BR', { 
    style: 'currency', 
    currency: 'BRL' 
  });

  /**
   * Busca os dados do Dashboard (GET /dashboard/resumo-principal)
   * e preenche a página.
   */
  async function carregarDashboard() {
    // Pega o mês e ano atuais para a API
    const hoje = new Date();
    const mesAtual = hoje.getMonth() + 1; // JS (0-11) -> Java (1-12)
    const anoAtual = hoje.getFullYear();

    try {
      const response = await fetch(`${DASHBOARD_URL}?mes=${mesAtual}&ano=${anoAtual}`);
      if (!response.ok) throw new Error("Falha ao carregar dados do dashboard.");
      
      const dashboard = await response.json();

      // 1. Preenche os Cartões de Estatísticas
      // (Usamos || 0 para evitar erro se o valor for null)
      statSaldo.textContent = formatadorBRL.format(dashboard.saldo_atual || 0);
      statReceitasMes.textContent = formatadorBRL.format(dashboard.total_receitas_mes || 0);
      statDespesasMes.textContent = formatadorBRL.format(dashboard.total_despesas_mes || 0);
      
      // 2. Preenche o Gráfico de Donut
      // (O 'distribuicao_por_categoria_mes' vem da sua API)
      criarGraficoDonut(dashboard.distribuicao_por_categoria_mes);

    } catch (error) {
      console.error("Erro ao carregar dashboard:", error);
      // Adicione feedback de erro para o usuário aqui, se desejar
      statSaldo.textContent = "Erro";
      statReceitasMes.textContent = "Erro";
      statDespesasMes.textContent = "Erro";
    }
  }

  /**
   * Cria o gráfico de Donut com os dados da API
   */
  function criarGraficoDonut(data) {
    // Se o gráfico já existir, destrua-o antes de criar um novo
    if (donutChart) {
      donutChart.destroy();
    }
    
    // Se não houver dados, mostra o placeholder e esconde o canvas
    if (!data || data.length === 0) {
      donutCanvas.style.display = 'none';
      donutPlaceholder.style.display = 'flex';
      return;
    }

    // Se houver dados, mostra o canvas e esconde o placeholder
    donutCanvas.style.display = 'block';
    donutPlaceholder.style.display = 'none';

    // Processa os dados da API para o formato do Chart.js
    const labels = data.map(item => item.categoriaNome);
    const valores = data.map(item => item.total);

    donutChart = new Chart(donutCtx, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          label: 'Gastos por Categoria',
          data: valores,
          backgroundColor: [
            // Cores de exemplo
            '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
            '#9966FF', '#FF9F40', '#E7E9ED', '#80E1A1'
          ],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'right', // Coloca a legenda na direita, como na imagem
          },
          tooltip: {
            callbacks: {
              // Formata o tooltip para mostrar R$
              label: function(context) {
                let label = context.label || '';
                let value = context.parsed || 0;
                return `${label}: ${formatadorBRL.format(value)}`;
              }
            }
          }
        }
      }
    });
  }

  // --- INICIALIZAÇÃO ---
  carregarDashboard();
});