import * as cron from 'cron';
import { MicroframeworkLoader, MicroframeworkSettings } from 'microframework-w3tec';
import { Container } from 'typedi';
import { OtpService } from '../api/services/OtpService';
import { env } from '../env';
import { UserActivePlanService } from '../api/services/UserActivePlanService';
import { StoriesService } from '../api/services/StoriesService';
// import { UsersService } from '../api/services/UsersService';

export const cronJobLoader: MicroframeworkLoader = async (settings: MicroframeworkSettings | undefined) => {
    if (settings) {
        // return;
        const otpService = Container.get(OtpService);
        const userActivePlanService = Container.get(UserActivePlanService)
        const storyService = Container.get(StoriesService)
        // const userService = Container.get(UsersService)

        /* ----------  first cron job on every 2 minutes -----------*/
        const firstCronJob = new cron.CronJob(`*/2 * * * *`, async () => {
            await otpService.expireOtp();
        });

        // /* ------------ run a cron every day at 11:59pm ------------------ */
        const secondCronJob = new cron.CronJob(`59 23 * * *`, async () => {
            await userActivePlanService.userActivePlanExpire()
        })

        /* ------------- run a cron job every day at 11:59pm --------*/
        const thirdCronJob = new cron.CronJob(`59 23 * * *`, async () => {
            await storyService.updateStories()
        })

        /* ----------------- run a cron job at 12pm ---------------- */
        // const fourthCronJob = new cron.CronJob(`0 12 * * *`, async () => {
        //     await userService.userDelete()
        // })

      
 
        if (env.app.runCron) {
            firstCronJob.start()
            secondCronJob.start();
            thirdCronJob.start()
            // fourthCronJob.start();
        }

    }
};
