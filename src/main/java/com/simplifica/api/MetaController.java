package com.simplifica.api;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/metas")
public class MetaController {

  @Autowired
  private MetaRepository metaRepository;

  @Autowired
  private CategoriaRepository categoriaRepository;

  @PostMapping
  public ResponseEntity<Meta> criarMeta(@RequestBody Meta meta) {

    if (meta.getCategoria() != null && meta.getCategoria().getId() != null) {
      Integer categoriaId = meta.getCategoria().getId();

      Categoria categoria = categoriaRepository.findById(categoriaId)
          .orElseThrow(() -> new RuntimeException("Categoria não encontrada com id: " + categoriaId));

      meta.setCategoria(categoria);
    } else {
      meta.setCategoria(null);
    }

    meta.setValorAtual(BigDecimal.ZERO);

    Meta novaMeta = metaRepository.save(meta);
    return ResponseEntity.status(HttpStatus.CREATED).body(novaMeta);
  }

  @GetMapping
  public ResponseEntity<List<Meta>> listarMetas() {
    List<Meta> metas = (List<Meta>) metaRepository.findAll();
    return ResponseEntity.ok(metas);
  }

  @PutMapping("/{id}")
  public ResponseEntity<Meta> atualizarMeta(@PathVariable Integer id,
      @RequestBody Meta metaAtualizada) {

    Optional<Meta> metaExistenteOpt = metaRepository.findById(id);

    if (metaExistenteOpt.isEmpty()) {
      return ResponseEntity.notFound().build();
    }

    Meta metaExistente = metaExistenteOpt.get();

    if (metaAtualizada.getCategoria() != null && metaAtualizada.getCategoria().getId() != null) {
      Integer categoriaId = metaAtualizada.getCategoria().getId();
      Categoria categoria = categoriaRepository.findById(categoriaId)
          .orElseThrow(() -> new RuntimeException("Categoria não encontrada com id: " + categoriaId));
      metaExistente.setCategoria(categoria);
    } else {
      metaExistente.setCategoria(null);
    }

    metaExistente.setNome(metaAtualizada.getNome());
    metaExistente.setValorAlvo(metaAtualizada.getValorAlvo());
    metaExistente.setPeriodo(metaAtualizada.getPeriodo());
    metaExistente.setMes(metaAtualizada.getMes());
    metaExistente.setAno(metaAtualizada.getAno());

    Meta metaSalva = metaRepository.save(metaExistente);
    return ResponseEntity.ok(metaSalva);
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> deletarMeta(@PathVariable Integer id) {

    if (!metaRepository.existsById(id)) {
      return ResponseEntity.notFound().build();
    }

    metaRepository.deleteById(id);
    return ResponseEntity.noContent().build();
  }
}