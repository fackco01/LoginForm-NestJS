import {BadRequestException, Body, Controller, Get, Post, Req, Res, UnauthorizedException} from '@nestjs/common';
import {AppService} from './app.service';
import * as bcrypt from 'bcrypt';
import {JwtService} from "@nestjs/jwt";
import {Response, Request} from "express";
import { ApiBody, ApiCookieAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller()
export class AppController {
    constructor(
        private readonly appService: AppService,
        private jwtService: JwtService
) {
    }

    //API Register
    @Post('register')
    @ApiOperation({ summary: 'Register a new user' })
    @ApiBody({
        schema: {
            type: 'object',
            required: ['username', 'fullName', 'email', 'password'],
            properties: {
                username: { type: 'string', example: 'username' },
                fullName: { type: 'string', example: 'fullName' },
                email: { type: 'string', format: 'email', example: 'user@example.com' },
                password: { type: 'string', format: 'password', example: 'strongpassword123' }
            }
        }
    })
    @ApiResponse({ status: 201, description: 'User successfully registered' })
    @ApiResponse({ status: 400, description: 'Bad request' })
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
    @ApiOperation({ summary: 'User login' })
    @ApiBody({
        schema: {
            type: 'object',
            required: ['username', 'password'],
            properties: {
                username: { type: 'string', example: 'username' },
                password: { type: 'string', format: 'password', example: 'strongpassword123' }
            }
        }
    })
    @ApiResponse({
        status: 200,
        description: 'Login successful',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Login Success' },
                username: { type: 'string', example: 'username' },
                fullName: { type: 'string', example: 'fullName' },
                email: { type: 'string', example: 'john@example.com' }
            }
        }
    })
    @ApiResponse({ status: 400, description: 'Bad request - User not found or wrong password' })
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
    @ApiOperation({ summary: 'Get current user information' })
    @ApiCookieAuth()
    @ApiResponse({
        status: 200,
        description: 'User information retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                id: { type: 'number', example: 1 },
                username: { type: 'string', example: 'johndoe' },
                fullName: { type: 'string', example: 'John Doe' },
                email: { type: 'string', example: 'john@example.com' }
            }
        }
    })
    @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing JWT token' })
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
    @ApiOperation({ summary: 'User logout' })
    @ApiCookieAuth()
    @ApiResponse({
        status: 200,
        description: 'Logout successful',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Logout Success' }
            }
        }
    })
    async logout(
        @Res({passthrough: true}) resonse: Response
    ){
        resonse.clearCookie('jwt');
        return {
            message: 'Logout Success'
        }
    }
}
