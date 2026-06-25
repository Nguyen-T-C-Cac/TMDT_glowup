package com.example.becommerce.service.impl;

import com.example.becommerce.constant.ErrorCode;
import com.example.becommerce.exception.AppException;
import com.example.becommerce.service.GoogleAuthService;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Collections;

@Service
@RequiredArgsConstructor
public class GoogleAuthServiceImpl
        implements GoogleAuthService {

    @Value("${google.client-id}")
    private String clientId;

    @Override
    public GoogleIdToken.Payload verifyToken(
            String tokenString) {

        try {
            GoogleIdTokenVerifier verifier =
                    new GoogleIdTokenVerifier.Builder(
                            new NetHttpTransport(),
                            GsonFactory.getDefaultInstance())
                            .setAudience(
                                    Collections.singletonList(clientId))
                            .build();

            GoogleIdToken idToken =
                    verifier.verify(tokenString);

            if (idToken != null) {
                return idToken.getPayload();
            }
        } catch (Exception ignored) {
        }

        return verifyAccessToken(tokenString);
    }

    private GoogleIdToken.Payload verifyAccessToken(
            String accessToken) {

        try {
            RestTemplate restTemplate = new RestTemplate();

            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(accessToken);

            HttpEntity<Void> entity =
                    new HttpEntity<>(headers);

            ResponseEntity<GoogleUserInfo> response =
                    restTemplate.exchange(
                            "https://www.googleapis.com/oauth2/v3/userinfo",
                            HttpMethod.GET,
                            entity,
                            GoogleUserInfo.class);

            if (!response.getStatusCode().is2xxSuccessful()
                    || response.getBody() == null) {
                throw AppException.badRequest(
                        ErrorCode.INVALID_TOKEN,
                        "Google token không hợp lệ");
            }

            GoogleUserInfo info = response.getBody();

            GoogleIdToken.Payload payload =
                    new GoogleIdToken.Payload();

            payload.setEmail(info.email());
            payload.put("name", info.name());
            payload.put("picture", info.picture());
            payload.put("sub", info.sub());

            return payload;

        } catch (Exception ex) {
            throw AppException.badRequest(
                    ErrorCode.INVALID_TOKEN,
                    "Google token không hợp lệ");
        }
    }

    private record GoogleUserInfo(
            String sub,
            String name,
            String email,
            String picture
    ) {
    }
}
