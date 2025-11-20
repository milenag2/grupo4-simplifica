package com.simplifica.api;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface MetaRepository extends CrudRepository<Meta, Integer> {
    @Query("SELECT m FROM Meta m WHERE (m.ano = :ano AND m.periodo = 'ANUAL') OR " +
            "(m.ano = :ano AND m.mes = :mes AND m.periodo = 'MENSAL')")
    List<Meta> findMetasRelevantes(
            @Param("ano") int ano,
            @Param("mes") int mes);
}