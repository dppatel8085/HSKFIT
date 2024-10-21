import { Connection } from 'typeorm';
import { Factory, Seeder } from 'typeorm-seeding';
import { AdminModel } from '../../api/models/AdminModel';

export class CreateAdmin implements Seeder {
    public async run(factory: Factory, connection: Connection): Promise<any> {
        const em = connection.createEntityManager();
        const users = [{ email: 'admin123@gmail.com', password: 'admin123'}];
        for (const u of users) {
            const user = new AdminModel();
            user.name='admin'
            user.email = u.email;
            user.password = await AdminModel.hashPassword(u.password)
            await em.save(user);
        }
    }
}
