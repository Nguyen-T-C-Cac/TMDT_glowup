 -- slot_type = 'ORDER' dùng khi đơn hàng tự động tạo slot; 'MANUAL' khi thợ tự thêm lịch.
CREATE TABLE IF NOT EXISTS technician_schedule_slots (
    id              BIGSERIAL PRIMARY KEY,
    technician_id   BIGINT       NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    order_id        BIGINT       REFERENCES orders(id) ON DELETE SET NULL,
    start_time      TIMESTAMP    NOT NULL,
    end_time        TIMESTAMP    NOT NULL,
    title           VARCHAR(200),
    note            VARCHAR(500),
    slot_type       VARCHAR(20)  NOT NULL DEFAULT 'MANUAL',
    created_at      TIMESTAMP    NOT NULL DEFAULT now(),
    updated_at      TIMESTAMP    NOT NULL DEFAULT now(),
    CONSTRAINT chk_slot_type CHECK (slot_type IN ('MANUAL', 'ORDER')),
    CONSTRAINT chk_slot_time CHECK (end_time > start_time)
);

CREATE INDEX IF NOT EXISTS idx_slots_technician ON technician_schedule_slots(technician_id);
CREATE INDEX IF NOT EXISTS idx_slots_start ON technician_schedule_slots(technician_id, start_time);
CREATE INDEX IF NOT EXISTS idx_slots_order ON technician_schedule_slots(order_id);