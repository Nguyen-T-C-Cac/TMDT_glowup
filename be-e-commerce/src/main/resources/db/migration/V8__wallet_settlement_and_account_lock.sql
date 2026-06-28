-- TN3: unified wallet settlement + account-lock foundation (shared with TN2 refund)

-- Idempotency flag so settlement runs exactly once per order.
ALTER TABLE orders ADD COLUMN IF NOT EXISTS settled BOOLEAN NOT NULL DEFAULT FALSE;

-- Account lock when a technician's credit wallet goes negative.
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_locked BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS locked_reason VARCHAR(255);

-- Re-introduce wallet health tier (dropped in V3) so the lock logic can persist it.
ALTER TABLE wallets ADD COLUMN IF NOT EXISTS wallet_status VARCHAR(20) NOT NULL DEFAULT 'NORMAL';

-- Lock threshold: lock the technician when credit balance < this value.
INSERT INTO system_settings (setting_key, setting_value, created_at, updated_at)
VALUES ('refund_lock_threshold', '0', NOW(), NOW())
ON CONFLICT (setting_key) DO NOTHING;
