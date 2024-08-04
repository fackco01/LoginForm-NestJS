import {BadRequestException, Body, Controller, Get, Post, Req, Res, UnauthorizedException} from '@nestjs/common';
import {AppService} from './app.service';
import * as bcrypt from 'bcrypt';
import {JwtService} from "@nestjs/jwt";
import {Response, Request} from "express";

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

        const user = await this.appService.register({
            username,
            fullName,
            email,
            password: hashPassword
        })

        delete user.password;
        return user;
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
            message: 'Login Success',
            username: user.username,
            fullName: user.fullName,
            email: user.email
        };
    }

    //Get User
    @Get('user')
    async user(
        @Req() request: Request
    ){
        try{
            const cookies = request.cookies['jwt'];

            const data = await this.jwtService.verifyAsync(cookies);

            if(!data) {
                throw new UnauthorizedException("Not found User!!!");
            }

            const user = await this.appService.findById(data['id']);

           const {password, ...result} = user;
            return result;
        }
        catch (error) {
            throw new UnauthorizedException();
        }
    }

    //Logout
    @Post('logout')
    async logout(
        @Res({passthrough: true}) resonse: Response
    ){
        resonse.clearCookie('jwt');
        return {
            message: 'Logout Success'
        }
    }
}
