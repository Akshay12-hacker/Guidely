import { OAuth2Client } from 'google-auth-library';
import { env } from '../../config/env.js';
import { AppError } from '../../shared/errors/AppError.js';
import { logger } from '../../shared/utils/logger.js';

export interface VerifiedGoogleUser {
  email: string;
  fullName: string;
  avatarUrl?: string;
  googleId: string;
  emailVerified: boolean;
}

export class GoogleAuthService {
  private static oauthClient: OAuth2Client | null = null;

  private static getClient(): OAuth2Client {
    if (!this.oauthClient) {
      this.oauthClient = new OAuth2Client({
        clientId: env.GOOGLE_CLIENT_ID || undefined,
        clientSecret: env.GOOGLE_CLIENT_SECRET || undefined,
        redirectUri: env.GOOGLE_CALLBACK_URL || undefined
      });
    }
    return this.oauthClient;
  }

  /**
   * Securely verifies a Google ID token (JWT) server-side using Google's public key certificates.
   */
  static async verifyGoogleToken(idToken: string): Promise<VerifiedGoogleUser> {
    if (!idToken || typeof idToken !== 'string') {
      throw AppError.badRequest('A valid Google ID token is required');
    }

    const client = this.getClient();
    let payload: any = null;

    // 1. Primary: Verify using official google-auth-library cryptographic verification
    try {
      const ticket = await client.verifyIdToken({
        idToken,
        audience: env.GOOGLE_CLIENT_ID ? env.GOOGLE_CLIENT_ID : undefined
      });
      payload = ticket.getPayload();
    } catch (libraryErr: any) {
      logger.warn({ error: libraryErr.message }, 'google-auth-library verification failed, falling back to Google tokeninfo endpoint');

      // 2. Secondary fallback: Query Google's public tokeninfo endpoint
      try {
        const tokenInfoRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`);
        if (tokenInfoRes.ok) {
          payload = await tokenInfoRes.json();
          // If a Google Client ID is configured, verify that audience matches
          if (env.GOOGLE_CLIENT_ID && payload.aud && payload.aud !== env.GOOGLE_CLIENT_ID) {
            throw AppError.unauthorized('Google token audience does not match configured Google Client ID');
          }
        } else {
          throw new Error(`Google tokeninfo API responded with HTTP ${tokenInfoRes.status}`);
        }
      } catch (tokenInfoErr: any) {
        logger.error({ error: tokenInfoErr.message }, 'Failed to verify Google token with Google servers');
        throw AppError.unauthorized(`Invalid or expired Google token: ${libraryErr.message}`);
      }
    }

    if (!payload || !payload.email) {
      throw AppError.unauthorized('Unable to extract verified user email from Google ID token');
    }

    const isEmailVerified = payload.email_verified === true || payload.email_verified === 'true';
    if (!isEmailVerified) {
      throw AppError.unauthorized('Your Google account email has not been verified by Google');
    }

    return {
      email: String(payload.email).toLowerCase().trim(),
      fullName: payload.name || payload.given_name || payload.email.split('@')[0],
      avatarUrl: payload.picture,
      googleId: payload.sub,
      emailVerified: true
    };
  }

  /**
   * Exchanges an authorization code for tokens and returns verified user claims.
   */
  static async verifyAuthCode(code: string): Promise<VerifiedGoogleUser> {
    if (!code) {
      throw AppError.badRequest('Authorization code is required');
    }

    const client = this.getClient();
    try {
      const { tokens } = await client.getToken(code);
      if (tokens.id_token) {
        return await this.verifyGoogleToken(tokens.id_token);
      }
      throw new Error('Google did not return an id_token for the provided authorization code');
    } catch (err: any) {
      logger.error({ error: err.message }, 'Google authorization code exchange failed');
      throw AppError.unauthorized(`Google authorization failed: ${err.message}`);
    }
  }
}
