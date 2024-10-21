import * as express from 'express';
import hbs from 'express-handlebars';
import { MicroframeworkLoader, MicroframeworkSettings } from 'microframework-w3tec';
import path from 'path';

import { env } from '../env';

export const homeLoader: MicroframeworkLoader = (settings: MicroframeworkSettings | undefined) => {
    if (settings) {
        const expressApp = settings.getData('express_app');
        expressApp.engine('handlebars', hbs());
        expressApp.set('view engine', 'handlebars');
        expressApp.set('views', path.resolve('src/views'));
        expressApp.get(
            env.app.routePrefix,
            (req: express.Request, res: express.Response) => {
                return res.json({
                    name: env.app.name,
                    version: env.app.version,
                    description: env.app.description,
                });
            }
        );

    }
};
