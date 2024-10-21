import { Action } from 'routing-controllers';
import { Connection } from 'typeorm';

export function currentUserChecker(connection: Connection): (action: Action) => Promise<undefined> {
    return async function innerCurrentUserChecker(action: Action): Promise<undefined> {
        return action.request.user;
    };
}
