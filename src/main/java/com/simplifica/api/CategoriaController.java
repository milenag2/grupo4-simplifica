package com.simplifica.api;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;


@RestController
@RequestMapping("/categorias")
public class CategoriaController {


  @Autowired
  private CategoriaRepository categoriaRepository;

  @PostMapping
  public ResponseEntity<Categoria> criarCategoria(@RequestBody Categoria categoria) {
    Categoria novaCategoria = categoriaRepository.save(categoria);
    return ResponseEntity.status(HttpStatus.CREATED).body(novaCategoria);
  }

  @GetMapping
  public ResponseEntity<List<Categoria>> listarCategorias() {
    List<Categoria> categorias = (List<Categoria>) categoriaRepository.findAll();
    return ResponseEntity.ok(categorias);
  }

  @PutMapping("/{id}")
  public ResponseEntity<Categoria> atualizarCategoria(@PathVariable Integer id,
      @RequestBody Categoria categoriaAtualizada) {

    Optional<Categoria> categoriaExistenteOpt = categoriaRepository.findById(id);

    if (categoriaExistenteOpt.isEmpty()) {
      return ResponseEntity.notFound().build();
    }

    Categoria categoriaExistente = categoriaExistenteOpt.get();
    categoriaExistente.setNome(categoriaAtualizada.getNome());
    categoriaExistente.setCor(categoriaAtualizada.getCor());
    categoriaExistente.setTipo(categoriaAtualizada.getTipo());

    Categoria categoriaSalva = categoriaRepository.save(categoriaExistente);
    return ResponseEntity.ok(categoriaSalva);
  }


  @DeleteMapping("/{id}")
  public ResponseEntity<Void> deletarCategoria(@PathVariable Integer id) {

    if (!categoriaRepository.existsById(id)) {
      return ResponseEntity.notFound().build();
    }

    categoriaRepository.deleteById(id);

    return ResponseEntity.noContent().build();
  }
}