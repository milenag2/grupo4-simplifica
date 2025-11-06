package com.simplifica.api;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;

public interface TransacaoRepository extends CrudRepository<Transacao, Integer> {
  /**
   * Esta query customizada (em JPQL) soma o 'valor' de todas as transações
   * onde o 'tipo' é RECEITA e o 'status' é CONFIRMADA.
   * O 'COALESCE(..., 0.0)' garante que ele retorne 0.00 se não houver
   * nenhuma receita, em vez de retornar 'null'.
   */
  @Query("SELECT COALESCE(SUM(t.valor), 0.0) FROM Transacao t WHERE t.tipo = 'RECEITA' AND t.status = 'CONFIRMADA'")
  BigDecimal getSomaReceitasConfirmadas();

  /**
   * Mesma lógica, mas para DESPESAS.
   */
  @Query("SELECT COALESCE(SUM(t.valor), 0.0) FROM Transacao t WHERE t.tipo = 'DESPESA' AND t.status = 'CONFIRMADA'")
  BigDecimal getSomaDespesasConfirmadas();

  /**
   * Soma as RECEITAS de um mês/ano específico.
   * Nota: MONTH() e YEAR() são funções que extraem o mês/ano da 'data_transacao'.
   * @Param("mes") e @Param("ano") ligam os parâmetros do método à query.
   */
  @Query("SELECT COALESCE(SUM(t.valor), 0.0) FROM Transacao t " +
      "WHERE t.tipo = 'RECEITA' AND t.status = 'CONFIRMADA' " +
      "AND MONTH(t.data_transacao) = :mes AND YEAR(t.data_transacao) = :ano")
  BigDecimal getSomaReceitasPorMes(@Param("mes") int mes, @Param("ano") int ano);

  /**
   * Soma as DESPESAS de um mês/ano específico.
   */
  @Query("SELECT COALESCE(SUM(t.valor), 0.0) FROM Transacao t " +
      "WHERE t.tipo = 'DESPESA' AND t.status = 'CONFIRMADA' " +
      "AND MONTH(t.data_transacao) = :mes AND YEAR(t.data_transacao) = :ano")
  BigDecimal getSomaDespesasPorMes(@Param("mes") int mes, @Param("ano") int ano);

  /**
   * Esta é a query do "gráfico de pizza".
   * Ela agrupa (GROUP BY) as despesas pela categoria,
   * soma (SUM) o valor de cada grupo,
   * e retorna uma lista de um objeto customizado (CategoriaGasto).
   *
   * IMPORTANTE: Isso requer uma nova classe/interface (DTO)
   * chamada 'CategoriaGasto' que criaremos a seguir.
   */
  @Query("SELECT new com.simplifica.api.CategoriaGasto(c.nome, SUM(t.valor)) " +
      "FROM Transacao t JOIN t.categoria c " +
      "WHERE t.tipo = 'DESPESA' AND t.status = 'CONFIRMADA' " +
      "AND MONTH(t.data_transacao) = :mes AND YEAR(t.data_transacao) = :ano " +
      "GROUP BY c.nome")
  List<CategoriaGasto> getDistribuicaoDespesasPorCategoria(
      @Param("mes") int mes, @Param("ano") int ano);
}