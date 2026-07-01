package com.example.becommerce.repository;

import com.example.becommerce.entity.Conversation;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ConversationRepository extends JpaRepository<Conversation, Long> {

    Optional<Conversation> findByCode(String code);

    boolean existsByCode(String code);

    long count();

    Optional<Conversation> findByOrder_Id(Long orderId);

    /** Conversation between this exact (customer, technician) pair, regardless of order link.
     *  Uses LIMIT 1 via derived findFirstBy prefix to avoid NonUniqueResultException
     *  even before the unique constraint is in place. */
    Optional<Conversation> findFirstByCustomer_IdAndTechnician_IdOrderByLastMessageAtDesc(
            Long customerId, Long technicianId);

    /**
     * All conversations where the given user is either the customer or the technician,
     * excluding the ones this user has soft-deleted (unless a newer message arrived after
     * the delete watermark, in which case the conversation reappears).
     */
    @Query(value = """
            SELECT c FROM Conversation c
            LEFT JOIN FETCH c.customer
            LEFT JOIN FETCH c.technician
            LEFT JOIN FETCH c.order
            WHERE (c.customer.id = :userId
                       AND (c.customerDeletedAt IS NULL OR c.lastMessageAt > c.customerDeletedAt))
               OR (c.technician.id = :userId
                       AND (c.technicianDeletedAt IS NULL OR c.lastMessageAt > c.technicianDeletedAt))
            """,
            countQuery = """
            SELECT COUNT(c) FROM Conversation c
            WHERE (c.customer.id = :userId
                       AND (c.customerDeletedAt IS NULL OR c.lastMessageAt > c.customerDeletedAt))
               OR (c.technician.id = :userId
                       AND (c.technicianDeletedAt IS NULL OR c.lastMessageAt > c.technicianDeletedAt))
            """)
    Page<Conversation> findAllForUser(@Param("userId") Long userId, Pageable pageable);
}
