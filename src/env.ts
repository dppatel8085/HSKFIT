import * as dotenv from 'dotenv';
import * as path from 'path';

import * as pkg from '../package.json';
import {
    getOsEnv, getOsEnvOptional, getOsPath, getOsPaths, normalizePort, toBool, toNumber
} from './lib/env';

/**
 * Load .env file or for tests the .env.test file.
 */
dotenv.config({ path: path.join(process.cwd(), `.env${((process.env.NODE_ENV === 'test') ? '.test' : '')}`) });

/**
 * Environment variables
 */
const useSMTP = getOsEnv('USE_SMTP');
export const env = {
    node: process.env.NODE_ENV || 'development',
    isProduction: process.env.NODE_ENV === 'production',
    isTest: process.env.NODE_ENV === 'test',
    isDevelopment: process.env.NODE_ENV === 'development',
    digits:process.env.DIGITS,
    app: {
        name: getOsEnv('APP_NAME'),
        version: (pkg as any).version,
        description: (pkg as any).description,
        host: getOsEnv('APP_HOST'),
        localAssetHost: getOsEnv('LOCAL_ASSET_HOST'),
        schema: getOsEnv('APP_SCHEMA'),
        routePrefix: getOsEnv('APP_ROUTE_PREFIX'),
        port: normalizePort(process.env.PORT || getOsEnv('APP_PORT')),
        banner: toBool(getOsEnv('APP_BANNER')),
        runCron: toBool(getOsEnv('APP_ENABLE_CRON')),
        isCron: toBool(getOsEnvOptional('IS_CRON')),
        dirs: {
            migrations: getOsPaths('TYPEORM_MIGRATIONS'),
            migrationsDir: getOsPath('TYPEORM_MIGRATIONS_DIR'),
            entities: getOsPaths('TYPEORM_ENTITIES'),
            entitiesDir: getOsPath('TYPEORM_ENTITIES_DIR'),
            controllers: getOsPaths('CONTROLLERS'),
            middlewares: getOsPaths('MIDDLEWARES'),
            interceptors: getOsPaths('INTERCEPTORS'),
            subscribers: getOsPaths('SUBSCRIBERS'),
            resolvers: getOsPaths('RESOLVERS'),
        },
    },
    email: {
        use_smtp: getOsEnv('USE_SMTP'),
        serviceName: (useSMTP && useSMTP === 'gmail') ? getOsEnv('EMAIL_SERVICE_NAME') : getOsEnv('OUTLOOK_EMAIL_SERVICE_NAME'),
        serviceHost: (useSMTP && useSMTP === 'gmail') ? getOsEnv('EMAIL_SERVICE_HOST') : getOsEnv('OUTLOOK_EMAIL_SERVICE_HOST'),
        userName: (useSMTP && useSMTP === 'gmail') ? getOsEnv('EMAIL_USER_NAME') : getOsEnv('OUTLOOK_EMAIL_USER_NAME'),
        to: (useSMTP && useSMTP === 'gmail') ? getOsEnv('EMAIL_TO_NAME') : getOsEnv('OUTLOOK_EMAIL_TO_NAME'),
        userPassword: (useSMTP && useSMTP === 'gmail') ? getOsEnv('EMAIL_USER_PASSWORD') : getOsEnv('OUTLOOK_EMAIL_USER_PASSWORD'),
        isSecure: getOsEnv('EMAIL_SERVICE_SECURE'),
        servicePort: getOsEnv('EMAIL_SERVICE_PORT'),
    },
    log: {
        level: getOsEnv('LOG_LEVEL'),
        json: toBool(getOsEnvOptional('LOG_JSON')),
        output: getOsEnv('LOG_OUTPUT'),
    },
    jwt: {
        secret: getOsEnv('JWT_SECRET'),
        algorithm: getOsEnv('JWT_ALGORITHM'),
        expireIN: getOsEnv('JWT_EXPIR_IN'),
        secretRefresh: getOsEnv('JWT_REFRESH_SECRET'),
        algorithmRefresh: getOsEnv('JWT_REFRESH_ALGORITHM'),
        refreshExpireIn: getOsEnv('JWT_REFRESH_EXPIRE_IN'),
    },
    db: {
        type: getOsEnv('TYPEORM_CONNECTION'),
        host: getOsEnvOptional('TYPEORM_HOST'),
        port: toNumber(getOsEnvOptional('TYPEORM_PORT')),
        username: getOsEnvOptional('TYPEORM_USERNAME'),
        password: getOsEnvOptional('TYPEORM_PASSWORD'),
        database: getOsEnv('TYPEORM_DATABASE'),
        synchronize: toBool(getOsEnvOptional('TYPEORM_SYNCHRONIZE')),
        logging: getOsEnv('TYPEORM_LOGGING'),
    },

    uploads:process.env.UPLOAD,
};
