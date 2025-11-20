package com.simplifica.api;

import java.math.BigDecimal;

public class CategoriaGasto {

  private String categoriaNome;
  private BigDecimal total;

  public CategoriaGasto(String categoriaNome, BigDecimal total) {
    this.categoriaNome = categoriaNome;
    this.total = total;
  }

  public String getCategoriaNome() {
    return categoriaNome;
  }

  public BigDecimal getTotal() {
    return total;
  }
}