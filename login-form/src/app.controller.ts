import {BadRequestException, Body, Controller, Get, Post, Res} from '@nestjs/common';
import {AppService} from './app.service';
import * as bcrypt from 'bcrypt';
import {JwtService} from "@nestjs/jwt";
import {Response} from "express";

@Controller()
export class AppController {
    constructor(
        private readonly appService: AppService,
        private jwtService: JwtService
) {
    }

    //API Register
    @Post('register')
    async register(
        @Body('username') username: string,
        @Body('fullName') fullName: string,
        @Body('email') email: string,
        @Body('password') password: string
    ) {
        const hashPassword = await bcrypt.hash(password, 16);

        return this.appService.register({
            username,
            fullName,
            email,
            password: hashPassword
        });
    }

    //API Login
    @Post('login')
    async login(
        @Body('username') username: string,
        @Body('password') password: string,
        @Res({passthrough: true}) resonse: Response
    ) {
        const user = await this.appService.findByUsername(username);

        if(!user){
            throw new BadRequestException("Not found User!!!");
        }

        if(!await bcrypt.compare(password, user.password)){
            throw new BadRequestException("Wrong Password");
        }

        const jwt = await this.jwtService.signAsync({id: user.id});

        resonse.cookie('jwt', jwt, {httpOnly: true});

        return {
            message: 'success'
        };
    }
}
