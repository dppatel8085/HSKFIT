import { env } from '../env';
import { Transport } from './index';

export const AdminMail = (dbUser: any, data?: any) => {
    let template;
    template = 'adminMail';
    const helperOptions = {
        from: env.email.userName,
        to: dbUser,
        subject: 'THIS IS YOUR UPDATED PASSWORD',
        template,
        context: {
            password: data,
        }
    };
    Transport().sendMail(helperOptions, (error, info) => {
        if (error) {
            console.log(error);
        }
        console.log('email is send');
        console.log(info);
        return true;
    });
};


