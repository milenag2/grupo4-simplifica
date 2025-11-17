package com.simplifica.api;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

/**
 * @RestController: Marca esta classe como um Controller REST
 *                  @RequestMapping("/categorias"): Diz que todas as URLs desta
 *                  classe
 *                  começarão com http://localhost:8080/categorias
 */
@RestController
@RequestMapping("/categorias")
public class CategoriaController {

  /**
   * @Autowired: Injeção de Dependência.
   *             O Spring vai "injetar" (colocar) aqui a instância do
   *             CategoriaRepository
   *             que ele criou automaticamente.
   */
  @Autowired
  private CategoriaRepository categoriaRepository;

  // --- CREATE (Criar) ---
  /**
   * @PostMapping: Mapeia requisições HTTP POST para esta URL (/categorias).
   * @RequestBody: Converte o JSON enviado pelo usuário em um objeto Categoria.
   */
  @PostMapping
  public ResponseEntity<Categoria> criarCategoria(@RequestBody Categoria categoria) {
    // Usa o método .save() que o CrudRepository deu
    Categoria novaCategoria = categoriaRepository.save(categoria);
    // Retorna o objeto criado e o status HTTP 201 (Created).
    return ResponseEntity.status(HttpStatus.CREATED).body(novaCategoria);
  }

  // --- READ (Ler Todos) ---
  /**
   * @GetMapping: Mapeia requisições HTTP GET para esta URL (/categorias).
   */
  @GetMapping
  public ResponseEntity<List<Categoria>> listarCategorias() {
    // Usa o método .findAll()
    // (Tivemos que fazer um "cast" para List, pois findAll() retorna Iterable)
    List<Categoria> categorias = (List<Categoria>) categoriaRepository.findAll();
    return ResponseEntity.ok(categorias);
  }

  // --- UPDATE (Atualizar) ---
  /**
   * @PutMapping("/{id}"): Mapeia requisições HTTP PUT para
   * /categorias/ALGUM_NUMERO (ex: /categorias/5).
   * 
   * @PathVariable: Pega o "5" da URL e o coloca na variável 'id'.
   */
  @PutMapping("/{id}")
  public ResponseEntity<Categoria> atualizarCategoria(@PathVariable Integer id,
      @RequestBody Categoria categoriaAtualizada) {

    // 1. Tenta encontrar a categoria no banco pelo ID
    Optional<Categoria> categoriaExistenteOpt = categoriaRepository.findById(id);

    // 2. Se o Optional estiver vazio (não encontrou), retorna 404 Not Found.
    if (categoriaExistenteOpt.isEmpty()) {
      return ResponseEntity.notFound().build();
    }

    // 3. Se encontrou, atualiza os campos.
    Categoria categoriaExistente = categoriaExistenteOpt.get();
    categoriaExistente.setNome(categoriaAtualizada.getNome());
    categoriaExistente.setCor(categoriaAtualizada.getCor());
    categoriaExistente.setIcone(categoriaAtualizada.getIcone());
    categoriaExistente.setTipo(categoriaAtualizada.getTipo());

    // 4. Salva as alterações no banco.
    Categoria categoriaSalva = categoriaRepository.save(categoriaExistente);
    return ResponseEntity.ok(categoriaSalva);
  }

  // --- DELETE (Deletar) ---
  /**
   * @DeleteMapping("/{id}"): Mapeia requisições HTTP DELETE.
   */
  @DeleteMapping("/{id}")
  public ResponseEntity<Void> deletarCategoria(@PathVariable Integer id) {

    // 1. Verifica se o ID existe antes de tentar deletar
    if (!categoriaRepository.existsById(id)) {
      return ResponseEntity.notFound().build();
    }

    // 2. Se existe, deleta
    categoriaRepository.deleteById(id);

    // Retorna 204 No Content (sucesso, sem corpo de resposta).
    return ResponseEntity.noContent().build();
  }
}