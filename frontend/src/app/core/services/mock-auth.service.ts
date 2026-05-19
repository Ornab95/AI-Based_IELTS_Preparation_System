import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegistrationPayload {
  name: string;
  hasTakenIelts: boolean | null;
  currentLevel: string;
  targetBand: number;
  examDate: string;
  reason: string;
  focusSkill: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

@Injectable({
  providedIn: 'root',
})
export class MockAuthService {
  private readonly MOCK_DELAY = 1500;

  login(payload: LoginPayload): Observable<AuthResponse> {
    return of(payload).pipe(
      delay(this.MOCK_DELAY),
      map((data) => {
        // Simulate auth check
        if (
          data.email === 'demo@ielts.com' &&
          data.password === 'password123'
        ) {
          return {
            success: true,
            message: 'Login successful!',
            token: 'mock-jwt-token-' + Date.now(),
            user: {
              id: 'usr_001',
              name: 'Demo User',
              email: data.email,
            },
          };
        }
        return {
          success: true,
          message: 'Login successful!',
          token: 'mock-jwt-token-' + Date.now(),
          user: {
            id: 'usr_' + Math.random().toString(36).substring(2, 8),
            name: 'User',
            email: data.email,
          },
        };
      })
    );
  }

  register(payload: RegistrationPayload): Observable<AuthResponse> {
    return of(payload).pipe(
      delay(this.MOCK_DELAY),
      map((data) => ({
        success: true,
        message: 'Registration successful! Welcome aboard.',
        token: 'mock-jwt-token-' + Date.now(),
        user: {
          id: 'usr_' + Math.random().toString(36).substring(2, 8),
          name: data.name,
          email: data.email,
        },
      }))
    );
  }
}
