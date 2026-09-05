## Purpose

Documenta las operaciones de sesión y autenticación que los clientes pueden invocar mediante HTTP.

## ADDED Requirements

### Requirement: Google authentication
The API SHALL expose `POST /api/auth/google` without Bearer authentication. The JSON body SHALL require a non-empty string `idToken` and MAY include string `deviceId` and `deviceName`.

#### Scenario: Google authentication succeeds
- **WHEN** a valid body is submitted
- **THEN** the API returns HTTP 200 with `{ success: true, data: { accessToken, refreshToken } }`.

#### Scenario: Google authentication fails
- **WHEN** Google authentication raises an invalid-token error
- **THEN** the API returns HTTP 401 with `{ success: false, message, errorCode }`.

### Requirement: Refresh and logout
The API SHALL expose `POST /api/auth/refresh` and `POST /api/auth/logout` without Bearer authentication. Both SHALL require a non-empty string `refreshToken`; `deviceId` and `deviceName` are optional strings.

#### Scenario: Refresh succeeds
- **WHEN** a valid refresh request is accepted
- **THEN** HTTP 200 returns `data` containing `accessToken` and `refreshToken`.

#### Scenario: Logout succeeds
- **WHEN** a valid refresh token is submitted to logout
- **THEN** HTTP 200 returns `{ success: true, data: { message: "Logged out" } }`.

#### Scenario: Auth input is invalid
- **WHEN** a required token is absent or empty
- **THEN** HTTP 400 returns `message: "Validation failed"` and an `errors` array.

## Errors

Known Google errors include HTTP 400 for `GOOGLE_EMAIL_MISSING` and `GOOGLE_NAME_MISSING`, and HTTP 401 for `GOOGLE_ID_TOKEN_INVALID` and `INVALID_GOOGLE_TOKEN_SIGNATURE`. Other domain errors are handled globally as HTTP 400.
