package com.stenico.ventas.controller;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.stenico.ventas.service.PdfService;
import com.stenico.ventas.service.PdfService.ListaRequest;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/revendedores")
@RequiredArgsConstructor
public class RevendedorController {

    private final PdfService pdfService;

    @PostMapping("/pdf")
    public ResponseEntity<byte[]> pdf(@RequestBody ListaRequest request) {
        byte[] pdf = pdfService.listaDePrecios(request);
        String nombreLimpio = (request.nombre() == null || request.nombre().isBlank())
                ? "lista"
                : request.nombre().trim().replaceAll("[^a-zA-Z0-9_áéíóúñÁÉÍÓÚÑ-]", "_");
        String filename = "lista_de_precios_" + nombreLimpio + ".pdf";
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .body(pdf);
    }
}
