package com.simplifica.api;

import org.springframework.data.repository.CrudRepository;

/**
 * Esta é a interface de conexão com o banco
 * * Ela estende CrudRepository, o que diz ao Spring:
 * 1. Gerencie a entidade 'Categoria'.
 * 2. O tipo da chave primária (@Id) é 'Integer'.
 * * O Spring automaticamente nos dará métodos como .save(), .findById(),
 * .findAll(), e .delete()
 */
public interface CategoriaRepository extends CrudRepository<Categoria, Integer> {

}