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

  /**
   * Precisamos do CategoriaRepository para "anexar" a categoria
   * à meta, caso o usuário especifique uma.
   */
  @Autowired
  private CategoriaRepository categoriaRepository;

  // --- CREATE (Criar) ---
  /**
   * @PostMapping: Mapeia requisições HTTP POST para /metas.
   */
  @PostMapping
  public ResponseEntity<Meta> criarMeta(@RequestBody Meta meta) {

    // Lógica de relacionamento opcional (igual ao TransacaoController)
    if (meta.getCategoria() != null && meta.getCategoria().getId() != null) {
      Integer categoriaId = meta.getCategoria().getId();

      // Busca a categoria no banco
      Categoria categoria = categoriaRepository.findById(categoriaId)
          .orElseThrow(() -> new RuntimeException("Categoria não encontrada com id: " + categoriaId));

      // Anexa a categoria completa à meta
      meta.setCategoria(categoria);
    } else {
      // Se o usuário não enviou uma categoria, ela fica nula (meta geral)
      meta.setCategoria(null);
    }

    // O valorAtual deve sempre começar com 0, ignorando o que o usuário enviar
    meta.setValorAtual(BigDecimal.ZERO);

    Meta novaMeta = metaRepository.save(meta);
    return ResponseEntity.status(HttpStatus.CREATED).body(novaMeta);
  }

  // --- READ (Ler Todos) ---
  /**
   * @GetMapping: Mapeia requisições HTTP GET para /metas.
   */
  @GetMapping
  public ResponseEntity<List<Meta>> listarMetas() {
    List<Meta> metas = (List<Meta>) metaRepository.findAll();
    return ResponseEntity.ok(metas);
  }

  // --- UPDATE (Atualizar) ---
  /**
   * @PutMapping("/{id}"): Mapeia requisições HTTP PUT.
   */
  @PutMapping("/{id}")
  public ResponseEntity<Meta> atualizarMeta(@PathVariable Integer id,
      @RequestBody Meta metaAtualizada) {

    Optional<Meta> metaExistenteOpt = metaRepository.findById(id);

    if (metaExistenteOpt.isEmpty()) {
      return ResponseEntity.notFound().build();
    }

    Meta metaExistente = metaExistenteOpt.get();

    // LÓGICA DE RELACIONAMENTO (igual ao POST)
    if (metaAtualizada.getCategoria() != null && metaAtualizada.getCategoria().getId() != null) {
      Integer categoriaId = metaAtualizada.getCategoria().getId();
      Categoria categoria = categoriaRepository.findById(categoriaId)
          .orElseThrow(() -> new RuntimeException("Categoria não encontrada com id: " + categoriaId));
      metaExistente.setCategoria(categoria);
    } else {
      metaExistente.setCategoria(null);
    }

    // Atualiza os outros campos
    metaExistente.setNome(metaAtualizada.getNome());
    metaExistente.setValorAlvo(metaAtualizada.getValorAlvo());
    metaExistente.setPeriodo(metaAtualizada.getPeriodo());
    metaExistente.setMes(metaAtualizada.getMes());
    metaExistente.setAno(metaAtualizada.getAno());

    Meta metaSalva = metaRepository.save(metaExistente);
    return ResponseEntity.ok(metaSalva);
  }

  // --- DELETE (Deletar) ---
  /**
   * @DeleteMapping("/{id}"): Mapeia requisições HTTP DELETE.
   */
  @DeleteMapping("/{id}")
  public ResponseEntity<Void> deletarMeta(@PathVariable Integer id) {

    if (!metaRepository.existsById(id)) {
      return ResponseEntity.notFound().build();
    }

    metaRepository.deleteById(id);
    return ResponseEntity.noContent().build();
  }
}