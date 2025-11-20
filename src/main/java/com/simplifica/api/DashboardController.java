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
import java.util.Map;

@RestController
@RequestMapping("/dashboard")
public class DashboardController {

  @Autowired
  private TransacaoRepository transacaoRepository;

  @Autowired
  private MetaRepository metaRepository;

  @GetMapping("/saldo")
  public ResponseEntity<Map<String, BigDecimal>> getSaldoAtual() {
    BigDecimal totalReceitas = transacaoRepository.getSomaReceitasConfirmadas();
    BigDecimal totalDespesas = transacaoRepository.getSomaDespesasConfirmadas();

    BigDecimal saldoAtual = totalReceitas.subtract(totalDespesas);

    Map<String, BigDecimal> resposta = Map.of("saldo_atual", saldoAtual);

    return ResponseEntity.ok(resposta);
  }

  @GetMapping("/resumo-principal")
  public ResponseEntity<Map<String, Object>> getResumoPrincipal(
      @RequestParam("mes") int mes,
      @RequestParam("ano") int ano) {
    Map<String, Object> resumo = new HashMap<>();

    BigDecimal totalReceitas = transacaoRepository.getSomaReceitasConfirmadas();
    BigDecimal totalDespesas = transacaoRepository.getSomaDespesasConfirmadas();
    resumo.put("saldo_atual", totalReceitas.subtract(totalDespesas));

    BigDecimal receitasMes = transacaoRepository.getSomaReceitasPorMes(mes, ano);
    BigDecimal despesasMes = transacaoRepository.getSomaDespesasPorMes(mes, ano);
    resumo.put("total_receitas_mes", receitasMes);
    resumo.put("total_despesas_mes", despesasMes);

    List<CategoriaGasto> distribuicao = transacaoRepository.getDistribuicaoDespesasPorCategoria(mes, ano);
    resumo.put("distribuicao_por_categoria_mes", distribuicao);

    List<Meta> metasRelevantes = metaRepository.findMetasRelevantes(ano, mes);

    Map<String, BigDecimal> gastosPorCategoria = distribuicao.stream()
        .collect(Collectors.toMap(
            CategoriaGasto::getCategoriaNome,
            CategoriaGasto::getTotal));

    for (Meta meta : metasRelevantes) {

      if (meta.getCategoria() != null) {
        String nomeCategoria = meta.getCategoria().getNome();

        BigDecimal gasto = gastosPorCategoria.getOrDefault(nomeCategoria, BigDecimal.ZERO);

        meta.setValorAtual(gasto);

      } else {
        meta.setValorAtual(receitasMes);
      }
    }

    resumo.put("progresso_metas_mes", metasRelevantes);

    return ResponseEntity.ok(resumo);

  }
}