package com.simplifica.api;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import org.hibernate.annotations.CreationTimestamp;

@Entity
@Table(name = "metas")
public class Meta {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Integer id; 

  @ManyToOne
  @JoinColumn(name = "categoria_id", nullable = true)
  private Categoria categoria; 

  @Column(nullable = false, length = 255)
  private String nome;

  @Column(nullable = false, precision = 10, scale = 2)
  private BigDecimal valorAlvo; 

  @Column(nullable = false, precision = 10, scale = 2)
  private BigDecimal valorAtual = BigDecimal.ZERO; 

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private PeriodoMeta periodo;

  @Column
  private Integer mes; 

  @Column(length = 7) 
  private String cor;

  @Column(nullable = false)
  private Integer ano;

  @CreationTimestamp
  @Column(nullable = false, updatable = false)
  private LocalDateTime data_criacao;


  public enum PeriodoMeta {
    MENSAL,
    ANUAL
  }

  // Construtor, Getters e Setters
  public Meta() {
  }

  public Integer getId() {
    return id;
  }

  public void setId(Integer id) {
    this.id = id;
  }

  public Categoria getCategoria() {
    return categoria;
  }

  public void setCategoria(Categoria categoria) {
    this.categoria = categoria;
  }

  public String getNome() {
    return nome;
  }

  public void setNome(String nome) {
    this.nome = nome;
  }

  public BigDecimal getValorAlvo() {
    return valorAlvo;
  }

  public void setValorAlvo(BigDecimal valorAlvo) {
    this.valorAlvo = valorAlvo;
  }

  public BigDecimal getValorAtual() {
    return valorAtual;
  }

  public void setValorAtual(BigDecimal valorAtual) {
    this.valorAtual = valorAtual;
  }

  public PeriodoMeta getPeriodo() {
    return periodo;
  }

  public void setPeriodo(PeriodoMeta periodo) {
    this.periodo = periodo;
  }

  public Integer getMes() {
    return mes;
  }

  public void setMes(Integer mes) {
    this.mes = mes;
  }

  public String getCor() {
      return cor;
   }

  public void setCor(String cor) {
      this.cor = cor;
  }

  public Integer getAno() {
    return ano;
  }

  public void setAno(Integer ano) {
    this.ano = ano;
  }

  public LocalDateTime getData_criacao() {
    return data_criacao;
  }

  public void setData_criacao(LocalDateTime data_criacao) {
    this.data_criacao = data_criacao;
  }
}