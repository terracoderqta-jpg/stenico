package com.stenico.ventas.controller;

import java.util.List;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.stenico.ventas.dto.PresupuestoRequest;
import com.stenico.ventas.exception.ResourceNotFoundException;
import com.stenico.ventas.model.Presupuesto;
import com.stenico.ventas.service.PdfService;
import com.stenico.ventas.service.PresupuestoService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/presupuestos")
@RequiredArgsConstructor
public class PresupuestoController {

    private final PresupuestoService presupuestoService;
    private final PdfService pdfService;

    @GetMapping
    public List<Presupuesto> listar() {
        return presupuestoService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Presupuesto> obtener(@PathVariable Long id) {
        return presupuestoService.findById(id)
                .map(ResponseEntity::ok)
                .orElseThrow(() -> new ResourceNotFoundException("Presupuesto no encontrado: " + id));
    }

    @PostMapping
    public ResponseEntity<Presupuesto> crear(@Valid @RequestBody PresupuestoRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(presupuestoService.crearPresupuesto(request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        presupuestoService.eliminar(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/pdf")
    public ResponseEntity<byte[]> pdf(@PathVariable Long id) {
        Presupuesto presupuesto = presupuestoService.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Presupuesto no encontrado: " + id));
        byte[] pdf = pdfService.presupuestoPdf(presupuesto);
        String filename = "presupuesto_" + presupuesto.getNroPresupuesto() + ".pdf";
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }
}
