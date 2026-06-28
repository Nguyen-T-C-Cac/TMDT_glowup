package com.example.becommerce.config;

import com.example.becommerce.entity.SystemSetting;
import com.example.becommerce.repository.SystemSettingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Seeds the {@code system_settings} table with default values on every startup.
 *
 * <p>The project does not use Flyway and {@code spring.sql.init.mode=never}, so the
 * INSERTs in the migration files (V8/V10) never run automatically. Without this
 * initializer a fresh database has no {@code points_per_order} row, which makes the
 * reward-points feature silently award 0 points (the code falls back to 0).
 *
 * <p>It is idempotent and non-destructive: only missing keys are inserted, so any
 * value an admin has changed via the settings UI is preserved.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DefaultSettingsInitializer implements ApplicationRunner {

    private final SystemSettingRepository systemSettingRepository;

    /** Default key/value pairs the application logic relies on. */
    private static final Map<String, String> DEFAULTS = new LinkedHashMap<>() {{
        put("fixed_commission_fee", "10000");        // TN3: phí hoa hồng cố định mỗi đơn
        put("minimum_commission_balance", "20000");  // ngưỡng cảnh báo ví tín dụng thấp
        put("auto_lock_enabled", "true");            // tự khóa khi ví tín dụng âm
        put("refund_lock_threshold", "0");           // TN2/TN3: khóa khi balance < ngưỡng
        put("points_per_order", "10");               // TN4: điểm cố định mỗi đơn hoàn thành
        put("points_rate", "0");                     // TN4: % theo giá trị đơn (floor)
    }};

    @Override
    public void run(ApplicationArguments args) {
        int created = 0;
        for (Map.Entry<String, String> entry : DEFAULTS.entrySet()) {
            if (systemSettingRepository.findByKey(entry.getKey()).isEmpty()) {
                systemSettingRepository.save(SystemSetting.builder()
                        .key(entry.getKey())
                        .value(entry.getValue())
                        .build());
                created++;
                log.info("Seeded default system setting {}={}", entry.getKey(), entry.getValue());
            }
        }
        if (created > 0) {
            log.info("DefaultSettingsInitializer: seeded {} missing system setting(s)", created);
        }
    }
}
