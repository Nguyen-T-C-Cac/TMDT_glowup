-- Remove the messages.type check constraint entirely.
-- Validation is handled at the application level by the MessageType enum + JPA converter.

ALTER TABLE messages DROP CONSTRAINT IF EXISTS messages_type_check;
