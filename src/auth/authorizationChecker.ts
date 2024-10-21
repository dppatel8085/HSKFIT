import { Action } from 'routing-controllers';
import { Container } from 'typedi';
import { Connection } from 'typeorm';
import { UserRoles } from '../api/enums/Users';
import { Logger } from '../lib/logger';
import { AuthService } from './AuthService';

export function authorizationChecker(connection: Connection): (action: Action, roles: UserRoles[]) => Promise<boolean> | boolean {
    const log = new Logger(__filename);
    const authService = Container.get<AuthService>(AuthService);

    return async function innerAuthorizationChecker(action: Action, roles: UserRoles[]): Promise<boolean> {
        const authUser :any= await authService.parseAuthFromRequest(action.request);

        if (authUser === undefined) {
            log.warn('Invalid credentials given');
            return false;
        }
        console.log(roles,"------",authUser.role)
          if (roles.length) {                         
            if (roles.includes(authUser.role)) {        
                action.request.user = authUser;
                log.info(`Successfully checked credentials with Role ${authUser.role}`);
                return true;
            }                
            log.info(`AccessDeniedError for User<${authUser.role}>`);
            return false;
        } else {
            action.request.user = authUser;
            log.info('Successfully checked credentials');
            return true;
        }
    };
}
