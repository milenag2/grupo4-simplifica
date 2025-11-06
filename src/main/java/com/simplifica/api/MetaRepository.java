package com.simplifica.api;

import org.springframework.data.jpa.repository.Query; // 1. IMPORTE
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param; // 2. IMPORTE
import java.util.List; // 3. IMPORTE

public interface MetaRepository extends CrudRepository<Meta, Integer> {
  /*
   * Busca metas
   * que sejam:*1.
   * Anuais daquele
   * 
   * ano (ex: "Fundo de Emergência 2025")
   * OU
   * 2. Mensais daquele mês/ano (ex: "Economizar com Alimentação" de Nov/2025)
   */

  @Query("SELECT m FROM Meta m WHERE (m.ano = :ano AND m.periodo = 'ANUAL') OR " +
      "(m.ano = :ano AND m.mes = :mes AND m.periodo = 'MENSAL')")
  List<Meta> findMetasRelevantes(
      @Param("ano") int ano,
      @Param("mes") int mes);
}