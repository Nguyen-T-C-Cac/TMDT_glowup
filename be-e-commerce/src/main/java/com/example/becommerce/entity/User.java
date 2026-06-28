package com.example.becommerce.entity;

import com.example.becommerce.entity.enums.Role;
import com.example.becommerce.entity.enums.UserStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Core user entity mapped to the 'users' table.
 * Supports soft delete via the 'deleted' flag.
 */
@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Human-readable unique code, e.g. USR-001.
     */
    @Column(unique = true, nullable = false, length = 20)
    private String code;

    @Column(name = "full_name", nullable = false)
    private String fullName;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(unique = true)
    private String phone;

    @Column(nullable = false)
    private String password;

    private String avatar;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private UserStatus status = UserStatus.PENDING;

    private String district;

    @Column(columnDefinition = "TEXT")
    private String address;

    @Column(columnDefinition = "TEXT")
    private String bio;

    @Column(name = "average_rating")
    private Double averageRating;

    /**
     * Account lock flag. Set when a technician's credit wallet goes negative
     * (after commission deduction or admin refund). A locked technician cannot
     * accept/complete orders or withdraw until topping up the credit wallet.
     */
    @Column(name = "is_locked", nullable = false)
    @ColumnDefault("false")
    @Builder.Default
    private boolean locked = false;

    @Column(name = "locked_reason")
    private String lockedReason;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    /** Soft delete flag — true means logically deleted. */
    @Builder.Default
    private boolean deleted = false;

    // ----------------------------------------------------------------
    // Relationships
    // ----------------------------------------------------------------

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<RefreshToken> refreshTokens;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<EmailConfirmationToken> emailConfirmationTokens;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<PasswordResetToken> passwordResetTokens;

    @OneToOne(mappedBy = "user")
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Wallet wallet;

    @OneToMany(mappedBy = "user", fetch = FetchType.LAZY)
    private List<Notification> notifications;
}
