package com.simplifica.api;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestParam;
import java.util.stream.Collectors;

import java.util.HashMap;
import java.util.List;
import java.math.BigDecimal;
import java.util.Map; // Para criar o JSON de resposta

@RestController
@RequestMapping("/dashboard")
public class DashboardController {

  @Autowired
  private TransacaoRepository transacaoRepository;

  @Autowired
  private MetaRepository metaRepository;

  /**
   * @GetMapping("/saldo"): Mapeia para GET /dashboard/saldo
   * Este é o endpoint que o seu plano pedia.
   */
  @GetMapping("/saldo")
  public ResponseEntity<Map<String, BigDecimal>> getSaldoAtual() {

    // 1. Pega o total de receitas do banco
    BigDecimal totalReceitas = transacaoRepository.getSomaReceitasConfirmadas();

    // 2. Pega o total de despesas do banco
    BigDecimal totalDespesas = transacaoRepository.getSomaDespesasConfirmadas();

    // 3. Calcula a diferença
    BigDecimal saldoAtual = totalReceitas.subtract(totalDespesas);

    // 4. Monta o JSON de resposta simples, como planejado
    // (Ex: {"saldo_atual": 1450.75})
    Map<String, BigDecimal> resposta = Map.of("saldo_atual", saldoAtual);

    return ResponseEntity.ok(resposta);
  }

  /**
   * @GetMapping("/resumo-principal"): Mapeia para GET /dashboard/resumo-principal
   * 
   * @RequestParam: Pega os valores da URL (ex: ?mes=11&ano=2025)
   */
  @GetMapping("/resumo-principal")
  public ResponseEntity<Map<String, Object>> getResumoPrincipal(
      @RequestParam("mes") int mes,
      @RequestParam("ano") int ano) {
    // Cria o JSON de resposta
    Map<String, Object> resumo = new HashMap<>();

    // 1. Saldo Atual (Global)
    BigDecimal totalReceitas = transacaoRepository.getSomaReceitasConfirmadas();
    BigDecimal totalDespesas = transacaoRepository.getSomaDespesasConfirmadas();
    resumo.put("saldo_atual", totalReceitas.subtract(totalDespesas));

    // 2. Totais do Mês
    BigDecimal receitasMes = transacaoRepository.getSomaReceitasPorMes(mes, ano);
    BigDecimal despesasMes = transacaoRepository.getSomaDespesasPorMes(mes, ano);
    resumo.put("total_receitas_mes", receitasMes);
    resumo.put("total_despesas_mes", despesasMes);

    // 3. Distribuição por Categoria (Gráfico de Pizza)
    List<CategoriaGasto> distribuicao = transacaoRepository.getDistribuicaoDespesasPorCategoria(mes, ano);
    resumo.put("distribuicao_por_categoria_mes", distribuicao);

    // 4. Progresso das Metas// --- 3. NOVA LÓGICA DE METAS (O DESAFIO) ---

    // 3a. Pega as metas relevantes (ex: "Alimentação" e "Fundo de Emergência")
    List<Meta> metasRelevantes = metaRepository.findMetasRelevantes(ano, mes);

    // 3b. Para performance, transforma a lista de gastos num "mapa de busca"
    // (Ex: {"Lazer": 45.50, "Alimentação": 300.00})
    Map<String, BigDecimal> gastosPorCategoria = distribuicao.stream()
        .collect(Collectors.toMap(
            CategoriaGasto::getCategoriaNome, // Chave (ex: "Lazer")
            CategoriaGasto::getTotal // Valor (ex: 45.50)
        ));

    // 3c. O LOOP: Atualiza o 'valorAtual' de cada meta
    for (Meta meta : metasRelevantes) {

      if (meta.getCategoria() != null) {
        // É uma meta de categoria (ex: "Alimentação")
        String nomeCategoria = meta.getCategoria().getNome();

        // Procura o gasto dessa categoria no mapa.
        // Se não achar (ex: gastou 0), usa BigDecimal.ZERO.
        BigDecimal gasto = gastosPorCategoria.getOrDefault(nomeCategoria, BigDecimal.ZERO);

        meta.setValorAtual(gasto); // Atualiza o progresso!

      } else {
        // É uma meta geral (categoria é null), ex: "Fundo de Emergência"
        // O "progresso" de uma meta geral é o total de receitas do mês
        // (Não faz sentido ser o total de despesas)
        meta.setValorAtual(receitasMes);
      }
    }

    // 4. Adiciona a lista de metas JÁ ATUALIZADAS na resposta
    resumo.put("progresso_metas_mes", metasRelevantes);

    return ResponseEntity.ok(resumo);

  }
}