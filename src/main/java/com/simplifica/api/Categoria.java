package com.simplifica.api;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Column;

/**
 * @Entity: Informa ao Hibernate que esta classe é uma tabela no banco
 * @Table(name = "categorias"): Define o nome da tabela
 */
@Entity
@Table(name = "categorias")
public class Categoria {

  /**
   * @Id: Marca este campo como a Chave Primária (PK)
   * @GeneratedValue(strategy = GenerationType.IDENTITY):
   *                          Diz ao MySQL para cuidar do auto-incremento do ID.
   */
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Integer id; // categoria_id

  @Column(nullable = false, length = 100)
  private String nome; // nome_categoria

  @Column(length = 7) // Ex: "#FF5733"
  private String cor;

  @Column(length = 100) // Ex: "fa-burger"
  private String icone;

  /**
   * @Enumerated(EnumType.STRING): Garante que o texto ("RECEITA" / "DESPESA")
   * seja salvo no banco, e não um número (0 ou 1).
   */
  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private TipoCategoria tipo;

  // --- Enum para o Tipo ---
  public enum TipoCategoria {
    RECEITA,
    DESPESA
  }

  // --- Construtores, Getters e Setters ---
  // O Hibernate/JPA precisa de um construtor vazio para funcionar.
  public Categoria() {
  }

  public Categoria(String nome, String cor, String icone, TipoCategoria tipo) {
    this.nome = nome;
    this.cor = cor;
    this.icone = icone;
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

  public String getIcone() {
    return icone;
  }

  public void setIcone(String icone) {
    this.icone = icone;
  }

  public TipoCategoria getTipo() {
    return tipo;
  }

  public void setTipo(TipoCategoria tipo) {
    this.tipo = tipo;
  }
}