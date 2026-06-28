-- V8: Add unique constraint on conversations (customer_id, technician_id).
-- Business rule: exactly one conversation per (customer, technician) pair.
--
-- Before adding the constraint, clean up any duplicate conversations that may
-- have been created by race conditions or missing application-level dedup.
-- For each duplicate pair we keep the conversation with the most recent activity
-- and reassign all dependent rows (messages, quotations, invoices, bookings)
-- to the kept conversation before deleting duplicates.

-- 1. Clean up duplicate conversations
DO $$
DECLARE
    dup RECORD;
    keep_id BIGINT;
BEGIN
    FOR dup IN (
        SELECT customer_id, technician_id
        FROM conversations
        WHERE customer_id IS NOT NULL AND technician_id IS NOT NULL
        GROUP BY customer_id, technician_id
        HAVING COUNT(*) > 1
    ) LOOP
        -- Keep the conversation with the most recent activity
        SELECT c.id INTO keep_id
        FROM conversations c
        WHERE c.customer_id = dup.customer_id AND c.technician_id = dup.technician_id
        ORDER BY c.last_message_at DESC NULLS LAST, c.created_at DESC NULLS LAST, c.id DESC
        LIMIT 1;

        -- Reassign messages
        UPDATE messages m
        SET conversation_id = keep_id
        FROM conversations c_dup
        WHERE c_dup.customer_id = dup.customer_id
          AND c_dup.technician_id = dup.technician_id
          AND c_dup.id <> keep_id
          AND m.conversation_id = c_dup.id;

        -- Reassign quotations
        UPDATE quotations q
        SET conversation_id = keep_id
        FROM conversations c_dup
        WHERE c_dup.customer_id = dup.customer_id
          AND c_dup.technician_id = dup.technician_id
          AND c_dup.id <> keep_id
          AND q.conversation_id = c_dup.id;

        -- Reassign invoices
        UPDATE invoices i
        SET conversation_id = keep_id
        FROM conversations c_dup
        WHERE c_dup.customer_id = dup.customer_id
          AND c_dup.technician_id = dup.technician_id
          AND c_dup.id <> keep_id
          AND i.conversation_id = c_dup.id;

        -- Reassign bookings (nullable FK)
        UPDATE bookings b
        SET conversation_id = keep_id
        FROM conversations c_dup
        WHERE c_dup.customer_id = dup.customer_id
          AND c_dup.technician_id = dup.technician_id
          AND c_dup.id <> keep_id
          AND b.conversation_id = c_dup.id;

        -- Delete duplicate conversations
        DELETE FROM conversations c_dup
        WHERE c_dup.customer_id = dup.customer_id
          AND c_dup.technician_id = dup.technician_id
          AND c_dup.id <> keep_id;
    END LOOP;
END $$;

-- 2. Add unique constraint (idempotent)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'uq_conversations_customer_technician'
          AND conrelid = 'conversations'::regclass
    ) THEN
        ALTER TABLE conversations
            ADD CONSTRAINT uq_conversations_customer_technician
            UNIQUE (customer_id, technician_id);
    END IF;
END $$;
