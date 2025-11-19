package com.simplifica.api;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/transacoes")
public class TransacaoController {

  @Autowired
  private TransacaoRepository transacaoRepository;

  @Autowired
  private CategoriaRepository categoriaRepository;

  @PostMapping
  public ResponseEntity<Transacao> criarTransacao(@RequestBody Transacao transacao) {

    if (transacao.getCategoria() != null && transacao.getCategoria().getId() != null) {
      Integer categoriaId = transacao.getCategoria().getId();

      Categoria categoria = categoriaRepository.findById(categoriaId)
          .orElseThrow(() -> new RuntimeException("Categoria não encontrada com id: " + categoriaId));

      transacao.setCategoria(categoria);
    } else {
      transacao.setCategoria(null);
    }

    Transacao novaTransacao = transacaoRepository.save(transacao);
    return ResponseEntity.status(HttpStatus.CREATED).body(novaTransacao);
  }

  @GetMapping
  public ResponseEntity<List<Transacao>> listarTransacoes() {
    List<Transacao> transacoes = (List<Transacao>) transacaoRepository.findAll();
    return ResponseEntity.ok(transacoes);
  }

  @PutMapping("/{id}")
  public ResponseEntity<Transacao> atualizarTransacao(@PathVariable Integer id,
      @RequestBody Transacao transacaoAtualizada) {

    Optional<Transacao> transacaoExistenteOpt = transacaoRepository.findById(id);

    if (transacaoExistenteOpt.isEmpty()) {
      return ResponseEntity.notFound().build();
    }

    if (transacaoAtualizada.getCategoria() != null && transacaoAtualizada.getCategoria().getId() != null) {
      Integer categoriaId = transacaoAtualizada.getCategoria().getId();
      Categoria categoria = categoriaRepository.findById(categoriaId)
          .orElseThrow(() -> new RuntimeException("Categoria não encontrada com id: " + categoriaId));
      transacaoAtualizada.setCategoria(categoria);
    } else {
      transacaoAtualizada.setCategoria(null);
    }

    Transacao transacaoExistente = transacaoExistenteOpt.get();
    transacaoAtualizada.setId(transacaoExistente.getId());

    Transacao transacaoSalva = transacaoRepository.save(transacaoAtualizada);
    return ResponseEntity.ok(transacaoSalva);
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> deletarTransacao(@PathVariable Integer id) {

    if (!transacaoRepository.existsById(id)) {
      return ResponseEntity.notFound().build();
    }

    transacaoRepository.deleteById(id);
    return ResponseEntity.noContent().build();
  }
}