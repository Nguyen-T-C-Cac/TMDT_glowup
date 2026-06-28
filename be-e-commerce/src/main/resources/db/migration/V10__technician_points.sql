-- TN4: technician reward points

ALTER TABLE technician_profiles
    ADD COLUMN IF NOT EXISTS reward_points BIGINT NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS point_transactions (
    id            BIGSERIAL PRIMARY KEY,
    technician_id BIGINT      NOT NULL REFERENCES users(id),
    order_id      BIGINT      REFERENCES orders(id),
    points        BIGINT      NOT NULL,
    balance_after BIGINT      NOT NULL,
    type          VARCHAR(30) NOT NULL,
    note          VARCHAR(255),
    created_at    TIMESTAMP   NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_point_tx_technician ON point_transactions(technician_id);

-- Point award rule: points = points_per_order + floor(finalPrice * points_rate / 100)
INSERT INTO system_settings (setting_key, setting_value, created_at, updated_at)
VALUES
    ('points_per_order', '10', NOW(), NOW()),
    ('points_rate', '0', NOW(), NOW())
ON CONFLICT (setting_key) DO NOTHING;
