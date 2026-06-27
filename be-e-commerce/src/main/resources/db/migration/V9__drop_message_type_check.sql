-- Drop the messages.type check constraint (if still present).
-- Booking messages use MessageType.BOOKING which was added after the constraint was created.
-- Validation is handled at the application level by the MessageType enum + JPA converter.
-- Idempotent — safe to run even if the constraint was already dropped by V6.

ALTER TABLE messages DROP CONSTRAINT IF EXISTS messages_type_check;
