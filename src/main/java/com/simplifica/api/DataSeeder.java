package com.simplifica.api;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;

/**
 * @Component: Diz ao Spring para gerenciar esta classe.
 *             implements CommandLineRunner: Faz esta classe rodar
 *             automaticamente no startup.
 */
@Component
public class DataSeeder implements CommandLineRunner {

  // Injeta o repositório que já fizemos
  @Autowired
  private CategoriaRepository categoriaRepository;

  /**
   * Este é o método que vai rodar no startup.
   */
  @Override
  public void run(String... args) throws Exception {
    // Só adiciona as categorias se o banco estiver vazio
    if (categoriaRepository.count() == 0) {
      System.out.println(">>> Banco de categorias vazio. Criando categorias padrão...");

      // Crie suas categorias padrão aqui
      Categoria c1 = new Categoria("Alimentação", "#FF5733", "fa-burger", Categoria.TipoCategoria.DESPESA);
      Categoria c2 = new Categoria("Moradia", "#33FF57", "fa-home", Categoria.TipoCategoria.DESPESA);
      Categoria c3 = new Categoria("Transporte", "#3357FF", "fa-car", Categoria.TipoCategoria.DESPESA);
      Categoria c4 = new Categoria("Lazer", "#FF33A1", "fa-gamepad", Categoria.TipoCategoria.DESPESA);
      Categoria c5 = new Categoria("Salário", "#33FFA1", "fa-money-bill", Categoria.TipoCategoria.RECEITA);

      // Cria uma lista com elas
      List<Categoria> categoriasPadrao = Arrays.asList(c1, c2, c3, c4, c5);

      // Salva TODAS elas no banco de uma vez
      categoriaRepository.saveAll(categoriasPadrao);

      System.out.println(">>> " + categoriasPadrao.size() + " categorias padrão criadas.");
    } else {
      System.out.println(">>> O banco de categorias já está populado.");
    }
  }
}