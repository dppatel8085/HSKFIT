import { Logger, LoggerInterface } from "../../decorators/Logger";
import { Service } from "typedi";
import { OrmRepository } from "typeorm-typedi-extensions";
import { UsersRepository } from "../repositories/UsersRepository";
import { UsersModel } from "../models/UsersModel";
import { Pagination } from "nestjs-typeorm-paginate";
import { ExcelError, UserNotFound } from "../errors/User";
import { Filter } from "../controllers/requests/User";
import { UserInfoService } from "./UserInfoService";
import { Role, UserRoles } from "../enums/Users";
import { AdminRepository } from "../repositories/AdminRepository";
import { SubsCriptionPlansService } from "./SubsCriptionPlansService";
import { RecipeService } from "./RecipeService";
import { TransformationService } from "./TransformationService";
import { StoriesService } from "./StoriesService";
import { UserActivePlanRepository } from "../repositories/UserActivePlanRepository";
import axios from 'axios';
import { WaterTrackerService } from "./WaterTrackerService";
import { FollowUpMsgRepository } from "../repositories/FollowUpMsgRepository";
import { BookingRepository } from "../repositories/BookingRepository";
import Excel from 'exceljs';
const ObjectId = require('mongodb').ObjectId;

@Service()
export class UsersService {
    constructor(
        @Logger(__filename) private log: LoggerInterface,
        @Service() private userInfoService: UserInfoService,
        @Service() private subsCriptionPlansService: SubsCriptionPlansService,
        @Service() private recipeService: RecipeService,
        @Service() private storiesService: StoriesService,
        @Service() private transformationService: TransformationService,
        @Service() private waterTrackerService: WaterTrackerService,
        @OrmRepository() private usersRepository: UsersRepository,
        @OrmRepository() private adminRepository: AdminRepository,
        @OrmRepository() private userActivePlanRepository: UserActivePlanRepository,
        @OrmRepository() private followUpMsgRepository: FollowUpMsgRepository,
        @OrmRepository() private bookingRepository: BookingRepository
    ) {
    }


    public async getUserInformation(Id: string, roleId: number): Promise<UsersModel | any> {
        this.log.info(`get user information by id`, Id);
        if (roleId == UserRoles.ADMIN || roleId == UserRoles.DIETITIAN) {
            const res = await this.adminRepository.findOne({ _id: ObjectId(Id) })
            res._id = res?._id?.toString()
            return res;
        }
        let userData = await this.usersRepository.getUserData(ObjectId(Id));
        console.log(userData, "0000----")
        userData._id = userData?._id?.toString();
        userData['userId'] = Id;
        const isBooking = await this.bookingRepository.isBooking(ObjectId(Id));
        userData['isBooking'] = isBooking;
        let userPersonalDetails = await this.userInfoService.userData(ObjectId(Id));
        if (!userPersonalDetails) {
            userData['height'] = null;
            userData['weight'] = null;
            userData['isFeet'] = true;
            userData['isKg'] = true;
        } else {
            userData['height'] = userPersonalDetails?.height;
            userData['weight'] = userPersonalDetails?.weight;
            userData['isFeet'] = userPersonalDetails?.isFeet;
            userData['isKg'] = userPersonalDetails?.isKg;
        }
        return userData;
    }

    /*  ------------------  users list for admin -------------------  */
    public async userListForAdmin(params: Filter, roleId: number, Id: number, res: any): Promise<Pagination<UsersModel[]> | any> {
        this.log.info(`user list for admin`)
        let response;
        if (Role.ADMIN == roleId) {
            response = await this.usersRepository.userListForAdmin(params, res);
            if (params.type == 'xlsx') return response;
            return await this.getFollowMsgData(response)
        }
        response = await this.usersRepository.userOfDietitian(ObjectId(Id), params);
        return await this.getFollowMsgData(response)
    }

    /*  ------------------  users list for admin -------------------  */
    public async userList(roleId: number, id: string): Promise<UsersModel[] | any> {
        this.log.info(`user list for admin`)
        if (Role.ADMIN == roleId)
            return await this.usersRepository.adminUserList();
        return await this.usersRepository.userList(ObjectId(id));
    }

    /*  ------------------  users list for admin -------------------  */
    public async userxlsx(res: any, param: any): Promise<UsersModel[] | any> {
        this.log.info(`user xlsx`)
            const result = await this.usersRepository.userxlsx(param);
            const workbook = new Excel.Workbook();
            const worksheet = workbook.addWorksheet('users');
            worksheet.columns = [
                { header: 'name', key: 'name' },
                { header: 'address', key: 'address' },
                { header: 'age', key: 'age' },
                { header: 'gender', key: 'gender' },
                { header: 'mobileNumber', key: 'mobileNumber' },
                { header: 'createdAt', key: 'createdAt' },
                { header: 'status', key: 'isActive' },
                { header: 'profileCompeted', key: 'isCompleted' },
                { header: 'plan', key: 'plan' },
                { header: 'planExpire', key: 'planExpire' },
                { header: 'dietianName', key: 'dietianName' },
                { header: 'height', key: 'height' },
                { header: 'weight', key: 'weight' },
                { header: 'healthCondition', key: 'healthCondition' },
                { header: 'weightLose', key: 'weightLose' },
                { header: 'previousWeightLose', key: 'previousWeightLose' },
            ]
            result?.forEach(ele => {
                const date = new Date(ele?.createdAt);
                console.log('eleeleeleele',ele);
                const createdAt = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
                worksheet.addRow({
                    name: ele?.name,
                    address: ele?.address,
                    age: ele?.age,
                    gender: ele?.gender,
                    mobileNumber: ele?.mobileNumber,
                    createdAt: createdAt,
                    isActive: ele?.isActive,
                    isCompleted: ele?.isCompleted,
                    plan: ele?.userActivePlan?.subsCription?.planName,
                    planExpire: ele?.userActivePlan?.expiredDate,
                    dietianName: ele?.dietitian?.name,
                    height: ele?.userInfo?.height,
                    weight: ele?.userInfo?.weight,
                    healthCondition: ele?.userInfo?.healthCondition,
                    weightLose: ele?.userInfo?.weightLose,
                    previousWeightLose: ele?.userInfo?.previousWeightLose,
                })
            })
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', 'attachment; filename=' + 'users.xlsx');
            return workbook.xlsx.write(res)
                .then(() => {
                    res.status(200).end();
                }).catch((err) => {
                    res.status(500).send('Error generating the Excel file');
                })
    }

    public async getFollowMsgData(data: any): Promise<UsersModel | any> {
        await Promise.all(data?.items?.map(async (ele) => {
            let result = await this.followUpMsgRepository.find({ userId: ele?._id });
            ele['followUp'] = result;
        }))
        return data;
    }

    /* ---------------------- compete profile of the user ------------*/
    public async completeProfileByUser(body: any): Promise<UsersModel | any> {
        this.log.info(`complete profile of user ${body}`);

        const isUserExist = await this.usersRepository.findOne({ _id: ObjectId(body?._id) });
        if (isUserExist) {
            isUserExist.name = body?.name;
            isUserExist.address = body?.address;
            isUserExist.age = body?.age;
            isUserExist.gender = body?.gender;
            isUserExist.deviceToken = body?.deviceToken;
            isUserExist.deviceType = body?.deviceType;
            isUserExist.isStep1 = body?.isStep1;
            isUserExist.isStep2 = body?.isStep2;
            isUserExist.isStep3 = body?.isStep3;
            isUserExist.isStep4 = body?.isStep4;
            isUserExist.isStep5 = body?.isStep5;
            isUserExist.isStep6 = body?.isStep6;
            isUserExist.isStep7 = body?.isStep7;
            isUserExist.isStep8 = body?.isStep8;
            isUserExist.isStep9 = body?.isStep9;
            isUserExist.isStep10 = body?.isStep10;
            isUserExist.isSkip = body?.isSkip;
            isUserExist.isCompleted = body?.isCompleted;
            isUserExist.isCompletedStep = body?.isCompletedStep;
            await this.userInfoService.adduserDetails(body);
            await this.usersRepository.save(isUserExist);
            const res = await this.usersRepository.findOne({ _id: ObjectId(body?._id) });
            res._id = res?._id?.toString();
            return res
        }
        throw new UserNotFound();
    }

    /*  ------------------ edit user profile ---------------  */
    public async editProfile(body: any, roleId: number, res: any): Promise<UsersModel | any> {
        let id = new ObjectId(body?._id)
        body.id = id;
        if (roleId === Role.ADMIN || roleId == Role.DIETITIAN) {
            const adminData = await this.adminRepository.findOne(body?.id);
            adminData.name = body?.name;
            adminData.address = body?.address;
            adminData.mobileNumber = body?.mobileNumber;
            adminData.profilePic = body?.profilePic;
            await this.adminRepository.save(adminData);
            return await this.adminRepository.findOne(body?.id)
        }
        const userData = await this.usersRepository.findOne({ _id: ObjectId(body?.id) });
        if (userData) {
            userData.name = body?.name;
            userData.address = body?.address;
            userData.age = body?.age;
            userData.gender = body?.gender;
            userData.mobileNumber = body?.mobileNumber;
            userData.profilePic = body?.profilePic;
            var result = await this.userInfoService.userUpdate(body?.id, body?.height, body?.weight, body?.isFeet, body?.isKg);
            await this.usersRepository.save(userData);
            const response = await this.usersRepository.findOne(body?.id);
            response['height'] = result ? result?.height : null;
            response['weight'] = result ? result?.weight : null;
            response['isFeet'] = result ? result?.isFeet : true;
            response['isKg'] = result ? result?.isKg : true;
            response._id = response?._id?.toString();
            return response;
        }
        throw new UserNotFound();
    }

    /* ----------------------create user by admin ----------------- */
    public async createUserByAdmin(body: any, res: any): Promise<UsersModel[]> {
        this.log.info(`create user by admin`);
        if (body?.length) {
            for (const userData of body) {
                const filterNumber = `+${userData.countryCode}${userData.mobileNumber}`;
                const isUserExist = await this.usersRepository.findOne({ mobileNumber: filterNumber });
                if (!isUserExist) {
                    userData.mobileNumber = filterNumber;
                    await this.usersRepository.save(userData);
                }
            }
            return res.status(200).send({ success: true, MESSAGE: 'SUCCESSFULLY_ADD' })
        }
        throw new ExcelError()
    }

    /*  ------------------  home data for user -------------------  */
    public async homeData(params: Filter, roleId: number, userid: string, res: any): Promise<UsersModel[] | any> {
        this.log.info(`home data for users`)
        const userId = new ObjectId(userid);
        const userInfo = await this.userInfoService.userData(userId);
        const subsCriptionData = await this.subsCriptionPlansService.subsCriptionPlanList(params, roleId);
        const recipeData = await this.recipeService.getRecipeList(params, roleId, userId);
        const transformationData = await this.transformationService.getTransformationDataHome(params, roleId, userId);
        const storiesData = await this.storiesService.storiesList(params, roleId);
        const waterTracker = await this.waterTrackerService.waterInfoAtHome(userId, res)
        const result = { subsCriptionData: subsCriptionData, recipeData: recipeData, transformationData: transformationData, storiesData: storiesData, userInfo: userInfo ? userInfo : null, waterTracker: waterTracker }
        return result;
    }

    /* ------------------------- get full user detil by admin ------------- */
    public async getFullUserDetailByAdmin(userid: string): Promise<UsersModel> {
        this.log.info(`get full user data by admin`)
        return await this.usersRepository.getFullUserDetailByAdmin(ObjectId(userid));
    }

    public async assignPlanAndDietitanToUser(body, res): Promise<UsersModel> {
        this.log.info(`assign user to dietitan by admin`);
        const userData = await this.usersRepository.findOne(ObjectId(body?._id));
        if (userData) {
            userData.name = body?.name;
            userData.address = body?.address;
            userData.age = body?.age;
            userData.gender = body?.gender;
            userData.mobileNumber = body?.mobileNumber;
            userData.isActive = body?.isActive;
            if (body?.isActive == false)
                userData.jwtToken = null;
            if (body?.dietitianId)
                userData.dietitianId = ObjectId(body?.dietitianId);
            if (body['planId']) {
                const isPlanExist = await this.userActivePlanRepository.isPlanExist(ObjectId(body?._id));
                const subsCriptionPlanData = await this.subsCriptionPlansService.getSubscriptionPlanData(ObjectId(body['planId']));
                if (ObjectId(body.planId) == ObjectId(isPlanExist?.planId)) {
                    isPlanExist.paymentMode = body?.paymentMode;
                    await this.userActivePlanRepository.save(isPlanExist);
                } else {
                    if (isPlanExist) {
                        isPlanExist.expiredDate = new Date();
                        isPlanExist.isExpire = true;
                        await this.userActivePlanRepository.save(isPlanExist);
                    }
                    const calculateExpireDate = await this.userActivePlanRepository.calculateExpireDate(body['activationDate'], subsCriptionPlanData['durationInMonth']);
                    await this.userActivePlanRepository.save({ planId: ObjectId(body?.planId), activationDate: body?.activationDate, expiredDate: calculateExpireDate, userId: ObjectId(body?._id), planActivatedById: body?.planActivatedById, paymentMode: body?.paymentMode, isExpire: false })
                }
            }
            await this.usersRepository.save(userData);
            return await this.usersRepository.findOne(ObjectId(body?._id));
        }
        throw new UserNotFound();
    }

    /* ----------------------- delete user by admin --------------- */
    public async deleteUser(id: string, res: any): Promise<UsersModel> {
        this.log.info(`delete user by admin ${id}`)
        const isUserExist = await this.usersRepository.findOne({ _id: ObjectId(id) });
        if (isUserExist) {
            await this.usersRepository.delete(id);
            return res.status(200).send({ success: true, MESSAGE: 'SUCCESSFULLY_DELETE' })
        }
        throw new UserNotFound();
    }

    /* ------------------- send notification to user ---------------- */
    public async sendNotification(body: any, res): Promise<UsersModel> {
        let data = [];
        if (body['isAll']) {
            data = await this.usersRepository.allNotificationUsers();
        } else {
            if (!body?.userId?.length) throw new UserNotFound()
            data = await this.usersRepository.notificationUsers(body?.userId);
        }

        await Promise.all(data.map(async (ele) => {
            const url = `https://fcm.googleapis.com/fcm/send`;
            const headers = {
                Authorization: `key=${process.env.SERVER_KEY}`,
                'Content-Type': 'application/json',
            };
            const notificationData = {
                to: ele?.deviceToken,
                notification: {
                    title: body?.title,
                    body: body?.message,
                }
            };
            await axios.post(url, JSON.stringify(notificationData), {
                headers
            }).then((response) => {
                return response
            }).catch((error) => {
                console.error('Error sending notification:', error);
            });
        }))
        return res.status(200).send({ success: true, MESSAGE: 'SUCCESSFULLY_SENT' })
    }


    /*  ------------------  diet plan of user -------------------  */
    public async dietPlanOfUser(params: Filter, userId: string): Promise<UsersModel> {
        this.log.info(`diet plan of user `)
        const result = await this.usersRepository.dietPlanOfUser(ObjectId(userId), params);
        result._id = result?._id?.toString();
        if (result?.dietPlan?.length) {
            const groupedDietPlans = result.dietPlan.reduce((acc, plan) => {
                plan._id = plan?._id?.toString();
                plan.userId = plan?.userId?.toString();
                plan.dietitianId = plan?.dietitianId ? plan?.dietitianId?.toString() : null;
                plan.mealIncluded = JSON.parse(plan.mealIncluded);
                plan.mealExcluded = JSON.parse(plan.mealExcluded);
                if (!acc[plan.days]) {
                    acc[plan.days] = [];
                }
                acc[plan.days].push(plan);
                return acc;
            }, {} as Record<string, any[]>);
            const transformedDietPlans = Object.keys(groupedDietPlans).map(day => ({
                day,
                plans: groupedDietPlans[day]
            }));
            result.dietPlan = transformedDietPlans;
        }
        if (result?.userActivePlan)
            result.userActivePlan.subscription.planIncludes = JSON.parse(result.userActivePlan.subscription.planIncludes)
        return result;
    }

    /*  ------------------  diet pending list of user by admin -------------------  */
    public async dietPendingList(params: Filter): Promise<UsersModel[] | any> {
        this.log.info(`diet pending user list by admin`)
        let data = await this.usersRepository.dietPendingList(params);
        data = data?.filter((ele) => (!ele?.userActivePlan));

        const page = params?.page ?? 1;
        const limit = params?.limit ?? 10;
        const totalItems = data?.length;
        const totalPages = Math.ceil(totalItems / limit);
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedItems = data?.slice(startIndex, endIndex);
        const metaData = {
            totalItems: totalItems,
            itemCount: paginatedItems?.length,
            itemsPerPage: limit,
            totalPages: totalPages,
            currentPage: page
        };
        return {
            items: paginatedItems,
            meta: metaData
        };

    }

    public async userDelete(): Promise<UsersModel | void> {
        this.log.info('user delete')
        await this.usersRepository.userDelete()
    }

    public async disableUser(body): Promise<UsersModel> {
        this.log.info('user disable')
        const userData = await this.usersRepository.findOne({ _id: body?.id });
        if (!userData) throw new UserNotFound();
        userData.isActive = body?.isActive;
        let saveUserData = await this.usersRepository.save(userData);
        saveUserData._id = saveUserData?._id?.toString();
        return saveUserData;
    }


    /* ----------------------dashboard api ----------- */
    public async dashboard(userId: string, roleId: number): Promise<any> {
        this.log.info(`dashboard api`);
        const totalBooking = await this.bookingRepository.totalBooking(ObjectId(userId), roleId)
        const allUser = await this.usersRepository.totalUser(ObjectId(userId), roleId);
        const subscriptionPlan = await this.subsCriptionPlansService.totalsubscriptionPlan(ObjectId(userId), roleId);
        return { totalBooking: totalBooking, totalUsers: allUser.totalUserCount, activeUser: allUser.activeUserCount, inActiveUser: allUser.inActiveUserCount, totalSubscriptionPlans: subscriptionPlan }
    }


    /* ---------------- assign dietitan to user --------------------- */
    public async assignDietianUsers(body, res): Promise<UsersModel> {
        this.log.info(`assign user to dietitan by admin`);
        try {
            const userUpdates = await Promise.all(body?.userIds?.map(async (ele) => {
                const userData = await this.usersRepository.findOne(ObjectId(ele));
                userData.dietitianId = ObjectId(body?.dietitianId);
                return userData;
            }))
            await this.usersRepository.save(userUpdates);
            return res.status(200).send({ success: true, MESSAGE: 'ASSIGN_SUCCESSFULLY' })
        } catch (error) {
            throw new UserNotFound();
        }
    }


}