package com.simplifica.api;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;

@Component
public class DataSeeder implements CommandLineRunner {

  @Autowired
  private CategoriaRepository categoriaRepository;

  @Override
  public void run(String... args) throws Exception {
    if (categoriaRepository.count() == 0) {
      System.out.println(">>> Banco de categorias vazio. Criando categorias padrão...");

      Categoria c1 = new Categoria("Alimentação", "#FF5733", Categoria.TipoCategoria.DESPESA);
      Categoria c2 = new Categoria("Moradia", "#33FF57", Categoria.TipoCategoria.DESPESA);
      Categoria c3 = new Categoria("Transporte", "#3357FF", Categoria.TipoCategoria.DESPESA);
      Categoria c4 = new Categoria("Lazer", "#FF33A1", Categoria.TipoCategoria.DESPESA);
      Categoria c5 = new Categoria("Salário", "#33FFA1", Categoria.TipoCategoria.RECEITA);

      List<Categoria> categoriasPadrao = Arrays.asList(c1, c2, c3, c4, c5);

      categoriaRepository.saveAll(categoriasPadrao);

      System.out.println(">>> " + categoriasPadrao.size() + " categorias padrão criadas.");
    } else {
      System.out.println(">>> O banco de categorias já está populado.");
    }
  }
}