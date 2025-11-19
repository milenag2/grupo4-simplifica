package com.simplifica.api;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Column;

@Entity
@Table(name = "categorias")
public class Categoria {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Integer id;

  @Column(nullable = false, length = 100)
  private String nome; 

  @Column(length = 7) 
  private String cor;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private TipoCategoria tipo;

  public enum TipoCategoria {
    RECEITA,
    DESPESA
  }

  public Categoria() {
  }

  public Categoria(String nome, String cor, TipoCategoria tipo) {
    this.nome = nome;
    this.cor = cor;
    this.tipo = tipo;
  }

  public Integer getId() {
    return id;
  }

  public void setId(Integer id) {
    this.id = id;
  }

  public String getNome() {
    return nome;
  }

  public void setNome(String nome) {
    this.nome = nome;
  }

  public String getCor() {
    return cor;
  }

  public void setCor(String cor) {
    this.cor = cor;
  }

  public TipoCategoria getTipo() {
    return tipo;
  }

  public void setTipo(TipoCategoria tipo) {
    this.tipo = tipo;
  }
}