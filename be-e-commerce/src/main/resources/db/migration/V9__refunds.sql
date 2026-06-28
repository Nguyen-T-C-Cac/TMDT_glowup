-- TN2: admin-initiated refunds

CREATE TABLE IF NOT EXISTS refunds (
    id              BIGSERIAL PRIMARY KEY,
    code            VARCHAR(40)  NOT NULL UNIQUE,
    order_id        BIGINT       NOT NULL REFERENCES orders(id),
    customer_id     BIGINT       NOT NULL REFERENCES users(id),
    technician_id   BIGINT       REFERENCES users(id),
    amount          NUMERIC(19,0) NOT NULL CHECK (amount > 0),
    reason          VARCHAR(500),
    status          VARCHAR(20)  NOT NULL DEFAULT 'PENDING',
    technician_debt BOOLEAN      NOT NULL DEFAULT FALSE,
    created_by      BIGINT       NOT NULL REFERENCES users(id),
    created_at      TIMESTAMP    NOT NULL DEFAULT now(),
    resolved_at     TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_refunds_order ON refunds(order_id);
CREATE INDEX IF NOT EXISTS idx_refunds_technician ON refunds(technician_id);
