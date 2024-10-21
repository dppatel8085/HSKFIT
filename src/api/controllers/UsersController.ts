import { Authorized, Body, Delete, Get, JsonController, Param, Patch, Post, QueryParams, Req, Res, UseBefore } from "routing-controllers";
import { OpenAPI, ResponseSchema } from "routing-controllers-openapi";
import { Service } from "typedi";
import { UsersService } from "../services/UsersService";
import { UsersModel } from "../models/UsersModel";
import { UserRoles } from "../enums/Users";
import { Pagination } from "nestjs-typeorm-paginate";
import { fileUploadExcel, fileUploadOptions } from "../fileUpload";
import { env } from "../../env";
import multer from 'multer';
import { CompleteProfileRequest, Filter } from "./requests/User";
import { DecodeTokenService } from "../services/DecodeTokenService";
import XLSX from 'xlsx';
import { Response } from "express";

@OpenAPI({ security: [{ bearerAuth: [] }] })
@JsonController('/users')

export class UserController {
    constructor(
        @Service() private usersService: UsersService,
        @Service() private decodeTokenService: DecodeTokenService
    ) {
    }

    @Authorized(UserRoles.ADMIN)
    @Get('/diet-pending-list')
    @ResponseSchema(UsersModel, {
        description: 'diet pending of user by admin',
        isArray: true
    })
    public async dietPendingList(@QueryParams() params: Filter): Promise<UsersModel[]> {
        return await this.usersService.dietPendingList(params);
    }

    @Authorized([UserRoles.ADMIN, UserRoles.DIETITIAN])
    @Get('/dashboard')
    @ResponseSchema(UsersModel, {
        description: 'dashboard',
        isArray: true
    })
    public async dashboard(@Req() req: any): Promise<UsersModel[]> {
        const decodedToken = await this.decodeTokenService.Decode(req.headers['authorization']);
        return await this.usersService.dashboard(decodedToken?._id, decodedToken?.role);
    }

    @Authorized([UserRoles.ADMIN])
    @Get('/xlsx')
    @ResponseSchema(UsersModel, {
        description: 'get xlsx',
        isArray: true
    })
    public async userxlsx(@Req() req: any, @Res() res: any, @QueryParams() param: any): Promise<UsersModel[]> {
        return await this.usersService.userxlsx(res, param);
    }

    @Authorized([UserRoles.ADMIN, UserRoles.DIETITIAN])
    @Get('/user-list')
    @ResponseSchema(UsersModel, {
        description: 'user list for admin,user of dietitan',
        isArray: true
    })
    public async userList(@Req() req: any, @QueryParams() param: any, @Res() res: any): Promise<UsersModel[]> {
        const decodedToken = await this.decodeTokenService.Decode(req.headers['authorization']);
        return await this.usersService.userList(decodedToken?.role, decodedToken?._id);
    }

    @Authorized([UserRoles.ADMIN, UserRoles.DIETITIAN])
    @Get('/list')
    @ResponseSchema(UsersModel, {
        description: 'user list for admin,user of dietitan',
        isArray: true
    })
    public async userListForAdmin(@QueryParams() params: Filter, @Req() req: any, @Res() res: any): Promise<Pagination<UsersModel[]>> {
        const decodedToken = await this.decodeTokenService.Decode(req.headers['authorization']);
        return await this.usersService.userListForAdmin(params, decodedToken?.role, decodedToken?._id, res);
    }

    @Authorized([UserRoles.USER, UserRoles.DIETITIAN])
    @Get('/diet-plan/:id')
    @ResponseSchema(UsersModel, {
        description: 'user list for admin,user of dietitan',
    })
    public async dietPlanOfUser(@QueryParams() params: Filter, @Param('id') id: string): Promise<UsersModel> {
        return await this.usersService.dietPlanOfUser(params, id);
    }

    @Authorized(UserRoles.ADMIN)
    @Get('/user-details/:id')
    @ResponseSchema(UsersModel, {
        description: 'get full user details by admin'
    })
    public async getFullUserDetailByAdmin(@Param('id') id: string): Promise<UsersModel> {
        return await this.usersService.getFullUserDetailByAdmin(id);
    }

    @Authorized(UserRoles.USER)
    @Get('/home')
    @ResponseSchema(UsersModel, {
        description: 'user list for admin',
        isArray: true
    })
    public async homeData(@QueryParams() params: Filter, @Req() req: any, @Res() res: Response): Promise<UsersModel[]> {
        const decodedToken = await this.decodeTokenService.Decode(req.headers['authorization'])
        return await this.usersService.homeData(params, decodedToken.role, decodedToken?._id, res);
    }

    @Authorized([UserRoles.ADMIN, UserRoles.USER, UserRoles.DIETITIAN])
    @Get('/info-id/:id')
    @ResponseSchema(UsersModel, {
        description: 'user info by id',
    })
    public async userInfoById(@Param('id') id: string, @Req() req: any): Promise<UsersModel> {
        const decodedToken = await this.decodeTokenService.Decode(req.headers['authorization'])
        return await this.usersService.getUserInformation(id, decodedToken.role);
    }

    @Authorized(UserRoles.ADMIN)
    @Post('/send-notification')
    @ResponseSchema(UsersModel, {
        description: 'send notification to user'
    })
    public async sendNotification(@Body() body: any, @Res() res: Response): Promise<UsersModel> {
        return await this.usersService.sendNotification(body, res);
    }

    @Authorized(UserRoles.ADMIN)
    @Post('/upload-excel')
    @UseBefore(multer(fileUploadExcel).single('excelFile'))
    @ResponseSchema(UsersModel,
        { isArray: true }
    )
    public async uploadExcelFile(@Body() body: any, @Req() req: any, @Res() res: any): Promise<UsersModel | any> {
        const excelFile = req.file;
        if (!excelFile)
            return res.status(400).send({ success: false, MESSAGE: 'EXCEL_FILE_NOT_PROVIDED' })
        const workbook = XLSX.readFile(excelFile.path);
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const excelData = XLSX.utils.sheet_to_json(worksheet) as any[];
        return await this.usersService.createUserByAdmin(excelData, res);
    }

    @Authorized(UserRoles.ADMIN)
    @Patch('/assign-user')
    @ResponseSchema(UsersModel, {
        description: 'assign user to dietitan and plan assign and edit user details by admin'
    })
    public async assignPlanAndDietitanToUser(@Body() body: any, @Res() res: Response): Promise<UsersModel> {
        return await this.usersService.assignPlanAndDietitanToUser(body, res);
    }

    @Authorized(UserRoles.ADMIN)
    @Patch('/assign-dietitian-user')
    @ResponseSchema(UsersModel, {
        description: 'assign dietian to user bulk'
    })
    public async assignDietianUsers(@Body() body: any, @Res() res: Response): Promise<UsersModel> {
        return await this.usersService.assignDietianUsers(body, res);
    }

    @Authorized(UserRoles.USER)
    @Patch('/complete-profile')
    @ResponseSchema(CompleteProfileRequest, {
        description: 'complete profile of the user',
    })
    public async completeProfileByUser(@Body() body: CompleteProfileRequest): Promise<UsersModel> {
        return await this.usersService.completeProfileByUser(body);
    }

    @Authorized([UserRoles.ADMIN, UserRoles.DIETITIAN])
    @Patch('/disable-user')
    @ResponseSchema(CompleteProfileRequest, {
        description: 'disable user '
    })
    public async disableUser(@Body() body: CompleteProfileRequest): Promise<UsersModel> {
        return await this.usersService.disableUser(body);
    }

    @Authorized([UserRoles.ADMIN, UserRoles.USER, UserRoles.DIETITIAN])
    @Patch('/')
    @UseBefore(multer(fileUploadOptions).fields([
        { maxCount: 1, name: 'profilePic' },
    ]))
    @ResponseSchema(CompleteProfileRequest, {
        contentType: 'multipart/form-data',
        description: 'edit user profile',
    })
    public async editUserProfile(@Body() body: CompleteProfileRequest, @Req() req: CompleteProfileRequest, @Res() res: Response): Promise<UsersModel> {
        if (req['files']?.profilePic) {
            body.profilePic = env.app.schema + '://' + req.headers['host'] + '/uploads/' + req['files']?.profilePic[0].filename;
        }
        const decodedToken = await this.decodeTokenService.Decode(req.headers['authorization'])
        return await this.usersService.editProfile(body, decodedToken?.role, res);
    }

    /*  ------------------ delete user by Admin ---------------  */
    @Authorized([UserRoles.ADMIN, UserRoles.USER])
    @Delete('/:id')
    @ResponseSchema(UsersModel, {
        description: 'delete user by Admin',
    })
    public async deleteUser(@Param('id') id: string, @Res() res: Response): Promise<UsersModel> {
        return await this.usersService.deleteUser(id, res);
    }


}