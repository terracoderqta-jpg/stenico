package com.stenico.ventas.service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.text.NumberFormat;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;

import org.springframework.stereotype.Service;

import com.lowagie.text.Document;
import com.lowagie.text.DocumentException;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.Image;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;

import com.stenico.ventas.model.Presupuesto;
import com.stenico.ventas.model.PresupuestoDetalle;
import com.stenico.ventas.model.Producto;
import com.stenico.ventas.model.TipoVenta;
import com.stenico.ventas.repository.ProductoRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PdfService {

    private final ProductoRepository productoRepository;

    public record ListaRequest(String nombre, BigDecimal porcentaje, String marca) {
    }

    public byte[] listaDePrecios(ListaRequest request) {
        BigDecimal pct = request.porcentaje() == null ? BigDecimal.ZERO : request.porcentaje();
        BigDecimal factor = BigDecimal.ONE.add(pct.divide(BigDecimal.valueOf(100), 10, RoundingMode.HALF_UP));

        List<Producto> productos = (request.marca() == null || request.marca().isBlank())
                ? productoRepository.findAll()
                : productoRepository.findByMarca(request.marca());
        productos = productos.stream()
                .filter(p -> p.getPrecio() != null && p.getPrecio().signum() > 0)
                .sorted((a, b) -> (a.getNombre() == null ? "" : a.getNombre())
                        .compareToIgnoreCase(b.getNombre() == null ? "" : b.getNombre()))
                .toList();

        NumberFormat nf = NumberFormat.getNumberInstance(new Locale("es", "AR"));
        nf.setMinimumFractionDigits(2);
        nf.setMaximumFractionDigits(2);

        Document document = new Document(PageSize.A4, 36, 36, 36, 36);
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        try {
            PdfWriter.getInstance(document, out);
            document.open();

            agregarLogo(document);

            Font tituloFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18);
            Font normalFont = FontFactory.getFont(FontFactory.HELVETICA, 10);
            Font negritaFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10);
            Font celdaFont = FontFactory.getFont(FontFactory.HELVETICA, 9);
            Font celdaBoldFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9);

            Paragraph titulo = new Paragraph("LISTA DE PRECIOS", tituloFont);
            titulo.setAlignment(Element.ALIGN_CENTER);
            document.add(titulo);

            Paragraph sub = new Paragraph("STENICO - Baterías y accesorios", normalFont);
            sub.setAlignment(Element.ALIGN_CENTER);
            document.add(sub);

            document.add(new Paragraph(" "));

            String nombre = (request.nombre() == null || request.nombre().isBlank())
                    ? "Sin especificar"
                    : request.nombre();
            document.add(new Paragraph("Revendedor: " + nombre, negritaFont));
            document.add(new Paragraph(
                    "Fecha: " + LocalDate.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")), normalFont));
            if (request.marca() != null && !request.marca().isBlank()) {
                document.add(new Paragraph("Marca: " + request.marca(), normalFont));
            }
            document.add(new Paragraph(" "));

            PdfPTable table = new PdfPTable(4);
            table.setWidthPercentage(100);
            table.setWidths(new float[] { 1.4f, 4f, 1.6f, 1.9f });
            String[] headers = { "Código", "Producto", "Marca", "Precio final" };
            for (String h : headers) {
                PdfPCell cell = new PdfPCell(new Phrase(h, celdaBoldFont));
                cell.setBackgroundColor(new com.lowagie.text.pdf.RGBColor(240, 240, 240));
                cell.setPadding(4);
                table.addCell(cell);
            }
            for (Producto p : productos) {
                BigDecimal precioFinal = p.getPrecio().multiply(factor).setScale(2, RoundingMode.HALF_UP);
                table.addCell(new PdfPCell(new Phrase(p.getCodigo(), celdaFont)));
                table.addCell(new PdfPCell(new Phrase(p.getNombre(), celdaFont)));
                table.addCell(new PdfPCell(new Phrase(p.getMarca() == null ? "" : p.getMarca(), celdaFont)));
                table.addCell(new PdfPCell(new Phrase("$ " + nf.format(precioFinal), celdaBoldFont)));
            }
            document.add(table);

            document.add(new Paragraph(" "));
            document.add(new Paragraph("Productos: " + productos.size(), normalFont));
            document.add(new Paragraph(
                    "Precios válidos hasta el "
                            + LocalDate.now().plusDays(30).format(DateTimeFormatter.ofPattern("dd/MM/yyyy")),
                    normalFont));

            document.close();
        } catch (DocumentException e) {
            throw new IllegalStateException("Error al generar el PDF", e);
        }
        return out.toByteArray();
    }

    public byte[] presupuestoPdf(Presupuesto presupuesto) {
        NumberFormat nf = NumberFormat.getNumberInstance(new Locale("es", "AR"));
        nf.setMinimumFractionDigits(2);
        nf.setMaximumFractionDigits(2);

        Document document = new Document(PageSize.A4, 36, 36, 36, 36);
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        try {
            PdfWriter.getInstance(document, out);
            document.open();

            agregarLogo(document);

            Font tituloFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18);
            Font normalFont = FontFactory.getFont(FontFactory.HELVETICA, 10);
            Font negritaFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10);
            Font celdaFont = FontFactory.getFont(FontFactory.HELVETICA, 9);
            Font celdaBoldFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9);

            Paragraph titulo = new Paragraph("PRESUPUESTO " + presupuesto.getNroPresupuesto(), tituloFont);
            titulo.setAlignment(Element.ALIGN_CENTER);
            document.add(titulo);

            document.add(new Paragraph(" "));

            document.add(new Paragraph("Cliente: " + nombreCliente(presupuesto), negritaFont));
            agregarLineaDatoCliente(document, "CUIT: ", presupuesto.getCuitCliente(), normalFont);
            agregarLineaDatoCliente(document, "Teléfono: ", presupuesto.getTelefonoCliente(), normalFont);
            agregarLineaDatoCliente(document, "Dirección: ", presupuesto.getDireccionCliente(), normalFont);
            agregarLineaDatoCliente(document, "Email: ", presupuesto.getEmailCliente(), normalFont);
            document.add(new Paragraph(
                    "Fecha: " + presupuesto.getFecha().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")),
                    normalFont));
            String tipo = presupuesto.getTipoVenta() == TipoVenta.REVENDEDOR
                    ? "Revendedor"
                    : "Minorista";
            document.add(new Paragraph("Tipo de precio: " + tipo, normalFont));
            if (presupuesto.getDiasVigencia() != null) {
                document.add(new Paragraph("Vigencia: " + presupuesto.getDiasVigencia() + " días", normalFont));
            }
            if (presupuesto.getObservaciones() != null && !presupuesto.getObservaciones().isBlank()) {
                document.add(new Paragraph("Observaciones: " + presupuesto.getObservaciones(), normalFont));
            }
            document.add(new Paragraph(" "));

            PdfPTable table = new PdfPTable(5);
            table.setWidthPercentage(100);
            table.setWidths(new float[] { 1.4f, 4f, 1f, 1.8f, 1.9f });
            String[] headers = { "Código", "Producto", "Cant.", "P. Unit.", "Subtotal" };
            for (String h : headers) {
                PdfPCell cell = new PdfPCell(new Phrase(h, celdaBoldFont));
                cell.setBackgroundColor(new com.lowagie.text.pdf.RGBColor(240, 240, 240));
                cell.setPadding(4);
                table.addCell(cell);
            }
            for (PresupuestoDetalle d : presupuesto.getDetalles()) {
                table.addCell(new PdfPCell(new Phrase(d.getProducto().getCodigo(), celdaFont)));
                table.addCell(new PdfPCell(new Phrase(d.getProducto().getNombre(), celdaFont)));
                table.addCell(new PdfPCell(new Phrase(String.valueOf(d.getCantidad()), celdaFont)));
                table.addCell(new PdfPCell(new Phrase("$ " + nf.format(d.getPrecioUnitario()), celdaFont)));
                table.addCell(new PdfPCell(new Phrase("$ " + nf.format(d.getSubtotal()), celdaBoldFont)));
            }
            document.add(table);

            document.add(new Paragraph(" "));
            Paragraph total = new Paragraph("TOTAL: $ " + nf.format(presupuesto.getTotal()), negritaFont);
            total.setAlignment(Element.ALIGN_RIGHT);
            document.add(total);

            document.add(new Paragraph(" "));
            int vigencia = presupuesto.getDiasVigencia() == null ? 30 : presupuesto.getDiasVigencia();
            document.add(new Paragraph(
                    "Presupuesto sin cargo, válido hasta el "
                            + LocalDate.now().plusDays(vigencia).format(DateTimeFormatter.ofPattern("dd/MM/yyyy")),
                    normalFont));

            document.close();
        } catch (DocumentException e) {
            throw new IllegalStateException("Error al generar el PDF", e);
        }
        return out.toByteArray();
    }

    private void agregarLineaDatoCliente(Document document, String label, String value, Font font)
            throws DocumentException {
        if (value != null && !value.isBlank()) {
            document.add(new Paragraph(label + value, font));
        }
    }

    private String nombreCliente(Presupuesto presupuesto) {
        if (presupuesto.getNombreCliente() != null && !presupuesto.getNombreCliente().isBlank()) {
            return presupuesto.getNombreCliente();
        }
        if (presupuesto.getCliente() == null) {
            return "Consumidor Final";
        }
        String nombre = presupuesto.getCliente().getNombre();
        if (presupuesto.getCliente().getApellido() != null && !presupuesto.getCliente().getApellido().isBlank()) {
            nombre += " " + presupuesto.getCliente().getApellido();
        }
        return nombre;
    }

    private void agregarLogo(Document document) throws DocumentException {
        try (InputStream in = getClass().getResourceAsStream("/logo_stenico.png")) {
            if (in == null) {
                return;
            }
            Image logo = Image.getInstance(in.readAllBytes());
            logo.setAlignment(Element.ALIGN_CENTER);
            logo.scaleToFit(170f, 64f);
            document.add(logo);
            document.add(new Paragraph(" "));
        } catch (IOException e) {
            throw new IllegalStateException("No se pudo cargar el logo", e);
        }
    }
}
