import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';

/**
 * FakeAuthGuard - V1 Authentication Guard
 * 
 * This is a mock authentication guard for V1 development.
 * It simulates an authenticated user without requiring JWT tokens.
 * 
 * In V2, this will be replaced with a proper JWT-based authentication guard.
 * 
 * Default user injected:
 * - id: '00000000-0000-0000-0000-000000000001'
 * - email: 'employee@example.com'
 * - role: 'EMPLOYEE'
 */
@Injectable()
export class FakeAuthGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    
    // Inject a fake authenticated user
    request.user = {
      id: '00000000-0000-0000-0000-000000000001',
      email: 'employee@example.com',
      role: 'EMPLOYEE',
    };
    
    return true;
  }
}
