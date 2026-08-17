package com.stenico.ventas.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.stenico.ventas.dto.ChequeRequest;
import com.stenico.ventas.exception.ResourceNotFoundException;
import com.stenico.ventas.model.Cheque;
import com.stenico.ventas.service.ChequeService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/cheques")
@RequiredArgsConstructor
public class ChequeController {

    private final ChequeService chequeService;

    @GetMapping
    public List<Cheque> listar() {
        return chequeService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Cheque> obtener(@PathVariable Long id) {
        return chequeService.findById(id)
                .map(ResponseEntity::ok)
                .orElseThrow(() -> new ResourceNotFoundException("Cheque no encontrado: " + id));
    }

    @PostMapping
    public ResponseEntity<Cheque> crear(@Valid @RequestBody ChequeRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(chequeService.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Cheque> actualizar(@PathVariable Long id, @Valid @RequestBody ChequeRequest request) {
        return ResponseEntity.ok(chequeService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        chequeService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
