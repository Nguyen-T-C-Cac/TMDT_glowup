package com.example.becommerce.utils;

import com.example.becommerce.repository.InvoiceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class InvoiceCodeGenerator {

    private static final String PREFIX = "INV-";
    private static final long BASE = 10000L;

    private final InvoiceRepository invoiceRepository;

    public String generate() {
        long next = invoiceRepository.count() + BASE;
        String code;
        do {
            code = PREFIX + next++;
        } while (invoiceRepository.findByCode(code).isPresent());
        return code;
    }
}
