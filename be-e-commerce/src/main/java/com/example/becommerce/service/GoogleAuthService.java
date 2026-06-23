package com.example.becommerce.service;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;

public interface GoogleAuthService {
    GoogleIdToken.Payload verifyToken(String token);

}
