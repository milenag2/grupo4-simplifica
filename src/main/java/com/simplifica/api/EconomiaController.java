package com.simplifica.api;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.util.List; 


@RestController
@RequestMapping("/economias")
public class EconomiaController {

    @Autowired
    private EconomiaRepository economiaRepository;

    @Autowired
    private MetaRepository metaRepository;

    @PostMapping
    public ResponseEntity<Economia> criarEconomia(@RequestBody Economia economia) {

        if (economia.getMeta() == null || economia.getMeta().getId() == null) {
            throw new RuntimeException("Uma meta é obrigatória para salvar uma economia.");
        }

        Integer metaId = economia.getMeta().getId();
        Meta meta = metaRepository.findById(metaId)
            .orElseThrow(() -> new RuntimeException("Meta não encontrada com id: " + metaId));
        
        BigDecimal valorEconomizado = economia.getEconomia();

        if (valorEconomizado == null || valorEconomizado.compareTo(BigDecimal.ZERO) <= 0) {
             throw new RuntimeException("O valor da economia deve ser positivo.");
        }

        if (economia.getData() == null) {
            throw new RuntimeException("A data da economia é obrigatória.");
        }

        BigDecimal valorAtualDaMeta = meta.getValorAtual();
        meta.setValorAtual(valorAtualDaMeta.add(valorEconomizado));

        metaRepository.save(meta);

        economia.setMeta(meta);
        Economia novaEconomia = economiaRepository.save(economia);

        return ResponseEntity.status(HttpStatus.CREATED).body(novaEconomia);
    }

    @GetMapping
    public ResponseEntity<List<Economia>> listarEconomias() {
        List<Economia> economias = (List<Economia>) economiaRepository.findAll();
        return ResponseEntity.ok(economias);
    }

}