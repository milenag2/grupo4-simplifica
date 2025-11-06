package com.simplifica.api;

import java.math.BigDecimal;

/**
 * Esta NÃO é uma entidade (@Entity). É uma classe simples (POJO)
 * usada apenas para transferir os dados do resultado da nossa query customizada
 * do Repositório para o Controller.
 */
public class CategoriaGasto {

  private String categoriaNome;
  private BigDecimal total;

  // O Construtor que a query @Query(... new
  // com.simplifica.api.CategoriaGasto(...)) chama
  public CategoriaGasto(String categoriaNome, BigDecimal total) {
    this.categoriaNome = categoriaNome;
    this.total = total;
  }

  // Getters (necessários para o Spring converter isso em JSON)
  public String getCategoriaNome() {
    return categoriaNome;
  }

  public BigDecimal getTotal() {
    return total;
  }
}