package com.example.becommerce.dto.mapper;

import com.example.becommerce.dto.response.WalletResponse;
import com.example.becommerce.entity.Wallet;
import com.example.becommerce.entity.enums.WalletType;
import org.springframework.stereotype.Component;

/**
 * Maps Wallet entities to API responses.
 */
@Component
public class WalletMapper {

    public WalletResponse toResponse(Wallet wallet) {
        if (wallet == null) {
            return null;
        }

        return WalletResponse.builder()
                .userId(wallet.getUser() != null ? wallet.getUser().getCode() : null)
                .totalBalance(wallet.getCreditBalance().add(wallet.getPersonalBalance()))
                .creditWallet(WalletResponse.WalletPocket.builder()
                        .type(WalletType.CREDIT.apiValue())
                        .balance(wallet.getCreditBalance())
                        .pendingBalance(null)
                        .status(null)
                        .build())
                .personalWallet(WalletResponse.WalletPocket.builder()
                        .type(WalletType.PERSONAL.apiValue())
                        .balance(wallet.getPersonalBalance())
                        .pendingBalance(wallet.getPendingWithdrawBalance())
                        .status(null)
                        .build())
                .totalEarned(wallet.getTotalEarned())
                .totalWithdrawn(wallet.getTotalWithdrawn())
                .currency(wallet.getCurrency())
                .updatedAt(wallet.getUpdatedAt())
                .build();
    }
}
