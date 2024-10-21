import nodemailer from 'nodemailer';
import hbs from 'nodemailer-express-handlebars';

import { env } from '../env';

const gmail = {
    service: env.email.serviceName,
    host: env.email.serviceHost,
    secure: env.email.isSecure,
    port: env.email.servicePort,
    auth: {
        user: env.email.userName,
        pass: env.email.userPassword,
    },
};

const outlook = {
    service: env.email.serviceName,
    host: env.email.serviceHost,
    secureConnection: false,
    port: 587,
    tls: {
        ciphers: 'SSLv3',
    },
    auth: {
        user: env.email.userName,
        pass: env.email.userPassword,
    },
};

export const Transport = () => {
    const transport = nodemailer.createTransport(env.email.use_smtp === 'gmail' ? gmail : outlook);
    transport.use('compile', hbs({
        viewPath: 'src/views/email',
        extName: '.hbs',
        viewEngine: {
            extname: '.hbs', // handlebars extension
            layoutsDir: 'src/views/email/', // location of handlebars templates
            defaultLayout: 'layout', // name of main template
            partialsDir: 'src/views/email/', // location of your subtemplates aka. header, footer etc
        },

    }));
    return transport;
};
