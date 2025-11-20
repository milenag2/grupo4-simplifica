package com.simplifica.api;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;

public interface TransacaoRepository extends CrudRepository<Transacao, Integer> {

    @Query("SELECT COALESCE(SUM(t.valor), 0.0) FROM Transacao t WHERE t.tipo = 'RECEITA'")
    BigDecimal getSomaReceitasConfirmadas();

    @Query("SELECT COALESCE(SUM(t.valor), 0.0) FROM Transacao t WHERE t.tipo = 'DESPESA'")
    BigDecimal getSomaDespesasConfirmadas();

    @Query("SELECT COALESCE(SUM(t.valor), 0.0) FROM Transacao t " +
            "WHERE t.tipo = 'RECEITA' " +
            "AND MONTH(t.data_transacao) = :mes AND YEAR(t.data_transacao) = :ano")
    BigDecimal getSomaReceitasPorMes(@Param("mes") int mes, @Param("ano") int ano);

    @Query("SELECT COALESCE(SUM(t.valor), 0.0) FROM Transacao t " +
            "WHERE t.tipo = 'DESPESA' " +
            "AND MONTH(t.data_transacao) = :mes AND YEAR(t.data_transacao) = :ano")
    BigDecimal getSomaDespesasPorMes(@Param("mes") int mes, @Param("ano") int ano);

    @Query("SELECT new com.simplifica.api.CategoriaGasto(c.nome, SUM(t.valor)) " +
            "FROM Transacao t JOIN t.categoria c " +
            "WHERE t.tipo = 'DESPESA' " +
            "AND MONTH(t.data_transacao) = :mes AND YEAR(t.data_transacao) = :ano " +
            "GROUP BY c.nome")
    List<CategoriaGasto> getDistribuicaoDespesasPorCategoria(
            @Param("mes") int mes, @Param("ano") int ano);
}