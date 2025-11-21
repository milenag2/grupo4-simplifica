package com.simplifica.api;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import org.hibernate.annotations.CreationTimestamp;

@Entity
@Table(name = "transacoes")
public class Transacao {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Integer id;

  @ManyToOne
  @JoinColumn(name = "categoria_id", nullable = true)
  private Categoria categoria;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private TipoTransacao tipo;

  @Column(nullable = false, length = 255)
  private String descricao;

  @Column(nullable = false, precision = 10, scale = 2)
  private BigDecimal valor;

  @Column(nullable = false)
  private LocalDate data_transacao;

  // (REMOVIDO O CAMPO STATUS AQUI)

  @CreationTimestamp
  @Column(nullable = false, updatable = false)
  private LocalDateTime data_criacao;

  public enum TipoTransacao {
    RECEITA,
    DESPESA
  }

  // Construtores 
  public Transacao() {}

  // --- Getters e Setters (Sem Status) ---
  public Integer getId() { return id; }
  public void setId(Integer id) { this.id = id; }

  public Categoria getCategoria() { return categoria; }
  public void setCategoria(Categoria categoria) { this.categoria = categoria; }

  public TipoTransacao getTipo() { return tipo; }
  public void setTipo(TipoTransacao tipo) { this.tipo = tipo; }

  public String getDescricao() { return descricao; }
  public void setDescricao(String descricao) { this.descricao = descricao; }

  public BigDecimal getValor() { return valor; }
  public void setValor(BigDecimal valor) { this.valor = valor; }

  public LocalDate getData_transacao() { return data_transacao; }
  public void setData_transacao(LocalDate data_transacao) { this.data_transacao = data_transacao; }

  public LocalDateTime getData_criacao() { return data_criacao; }
  public void setData_criacao(LocalDateTime data_criacao) { this.data_criacao = data_criacao; }
}