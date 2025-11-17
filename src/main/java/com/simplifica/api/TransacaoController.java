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

  /**
   * Precisa do CategoriaRepository aqui,
   * para poder "anexar" a categoria correta à transação.
   */
  @Autowired
  private CategoriaRepository categoriaRepository;

  // --- CREATE (Criar) ---
  /**
   * @PostMapping: Mapeia requisições HTTP POST para /transacoes.
   */
  @PostMapping
  public ResponseEntity<Transacao> criarTransacao(@RequestBody Transacao transacao) {

    // LÓGICA DE RELACIONAMENTO:
    // O JSON que o usuário envia (o @RequestBody) não vem com o
    // objeto Categoria completo. Ele vem apenas com o ID da categoria.
    // Precisamos "hidratar" (buscar) a Categoria completa no banco
    // antes de salvar a Transação.

    if (transacao.getCategoria() != null && transacao.getCategoria().getId() != null) {
      Integer categoriaId = transacao.getCategoria().getId();

      // Busca a categoria no banco
      Categoria categoria = categoriaRepository.findById(categoriaId)
          .orElseThrow(() -> new RuntimeException("Categoria não encontrada com id: " + categoriaId));

      // Anexa a categoria completa à transação
      transacao.setCategoria(categoria);
    } else {
      // Permite transações "Sem Categoria"
      transacao.setCategoria(null);
    }

    Transacao novaTransacao = transacaoRepository.save(transacao);
    return ResponseEntity.status(HttpStatus.CREATED).body(novaTransacao);
  }

  // --- READ (Ler Todos) ---
  /**
   * @GetMapping: Mapeia requisições HTTP GET para /transacoes.
   */
  @GetMapping
  public ResponseEntity<List<Transacao>> listarTransacoes() {
    List<Transacao> transacoes = (List<Transacao>) transacaoRepository.findAll();
    return ResponseEntity.ok(transacoes);
  }

  // --- UPDATE (Atualizar) ---
  /**
   * @PutMapping("/{id}"): Mapeia requisições HTTP PUT.
   */
  @PutMapping("/{id}")
  public ResponseEntity<Transacao> atualizarTransacao(@PathVariable Integer id,
      @RequestBody Transacao transacaoAtualizada) {

    Optional<Transacao> transacaoExistenteOpt = transacaoRepository.findById(id);

    if (transacaoExistenteOpt.isEmpty()) {
      return ResponseEntity.notFound().build();
    }

    // LÓGICA DE RELACIONAMENTO (igual ao POST)
    if (transacaoAtualizada.getCategoria() != null && transacaoAtualizada.getCategoria().getId() != null) {
      Integer categoriaId = transacaoAtualizada.getCategoria().getId();
      Categoria categoria = categoriaRepository.findById(categoriaId)
          .orElseThrow(() -> new RuntimeException("Categoria não encontrada com id: " + categoriaId));
      transacaoAtualizada.setCategoria(categoria);
    } else {
      transacaoAtualizada.setCategoria(null);
    }

    // Pega o ID da transação existente e o define na transação atualizada
    // para garantir que o .save() atualize o registro correto.
    Transacao transacaoExistente = transacaoExistenteOpt.get();
    transacaoAtualizada.setId(transacaoExistente.getId());

    Transacao transacaoSalva = transacaoRepository.save(transacaoAtualizada);
    return ResponseEntity.ok(transacaoSalva);
  }

  // --- DELETE (Deletar) ---
  /**
   * @DeleteMapping("/{id}"): Mapeia requisições HTTP DELETE.
   */
  @DeleteMapping("/{id}")
  public ResponseEntity<Void> deletarTransacao(@PathVariable Integer id) {

    if (!transacaoRepository.existsById(id)) {
      return ResponseEntity.notFound().build();
    }

    transacaoRepository.deleteById(id);
    return ResponseEntity.noContent().build();
  }
}