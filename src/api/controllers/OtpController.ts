import {  Body, JsonController, Patch, Post, Res } from "routing-controllers";
import { OpenAPI, ResponseSchema } from "routing-controllers-openapi";
import { Service } from "typedi";
import { OtpService } from "../services/OtpService";
import { OtpModel } from "../models/OtpModel";
const axios = require('axios');
import { Response } from "express";


@OpenAPI({ security: [{ bearerAuth: [] }] })
@JsonController('/send-otp')

export class OtpController {
  constructor(
    @Service() private otpService: OtpService,
  ) {
  }

  @Post('/delete-account')
  @ResponseSchema('add', {
    description: ' add mobileNumber by user'
  })
  public async sendOtp(@Body() body: any): Promise<OtpModel> {
    const res = await this.otpService.sendOtp(body);
    const url = `https://http.myvfirst.com/smpp/sendsms?username=Unayurmtrnshttp&password=eyJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwczovL2FwaS5teXZhbHVlZmlyc3QuY29tL3BzbXMiLCJzdWIiOiJ1bmF5dXJtdHJuc2h0dHAiLCJleHAiOjMyNzY1NTAzNjV9.b5_iWyS7epQ4lEcDwhvZbBg3eet7Z6q10RB1VmrgEmA&to=${body.mobileNumber}&from=UNAYUR&text=${res.otp}%20is%20your%20verification%20code%20(OTP)%20for%20HSKFIT.%20UNATYA%20UNAYUR%20MARKETING%20Pvt.%20Ltd.&category=bulk`;

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwczovL2FwaS5teXZhbHVlZmlyc3QuY29tL3BzbXMiLCJzdWIiOiJ1bmF5dXJqYXNvbiIsImV4cCI6MTcxNzkzMjQ2MX0.F6N0M0UeB74Q0mqeoDDTO3Da3jLGuVpUo6zq6kakALw'
    };

    await axios.post(url, { headers: headers })
      .then(response => {
        return response;
      })
      .catch(error => {
        return error;
      });

    return await res;
  }

  @Post('/')
  @ResponseSchema('', {
    description: 'add mobileNumber by user'
  })
  public async verifyMobileNumber(@Body() body: any): Promise<OtpModel | any> {
    const res = await this.otpService.verifyMobileNumber(body);
    const url = `https://http.myvfirst.com/smpp/sendsms?username=Unayurmtrnshttp&password=eyJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwczovL2FwaS5teXZhbHVlZmlyc3QuY29tL3BzbXMiLCJzdWIiOiJ1bmF5dXJtdHJuc2h0dHAiLCJleHAiOjMyNzY1NTAzNjV9.b5_iWyS7epQ4lEcDwhvZbBg3eet7Z6q10RB1VmrgEmA&to=${body.mobileNumber}&from=UNAYUR&text=${res.otp}%20is%20your%20verification%20code%20(OTP)%20for%20HSKFIT.%20UNATYA%20UNAYUR%20MARKETING%20Pvt.%20Ltd.&category=bulk`;

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwczovL2FwaS5teXZhbHVlZmlyc3QuY29tL3BzbXMiLCJzdWIiOiJ1bmF5dXJqYXNvbiIsImV4cCI6MTcxNzkzMjQ2MX0.F6N0M0UeB74Q0mqeoDDTO3Da3jLGuVpUo6zq6kakALw'
    };

    await axios.post(url, { headers: headers })
      .then(response => {
        return response;
      })
      .catch(error => {
        return error;
      });

    return await res;
  }

 
  @Patch('/disable-user')
  @ResponseSchema(OtpModel, {
    description: 'disable-account'
  })
  public async disableAccount(@Body() body: any, @Res() res: Response): Promise<OtpModel> {
    return await this.otpService.disableAccount(body, res);
  }

}
