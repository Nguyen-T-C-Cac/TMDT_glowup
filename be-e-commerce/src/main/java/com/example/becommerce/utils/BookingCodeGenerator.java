package com.example.becommerce.utils;

import com.example.becommerce.repository.BookingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class BookingCodeGenerator {

    private static final String PREFIX = "BK-";
    private final BookingRepository bookingRepository;

    public String generate() {
        long next = bookingRepository.count() + 1;
        String code;
        do {
            code = PREFIX + String.format("%03d", next++);
        } while (bookingRepository.existsByCode(code));
        return code;
    }
}
