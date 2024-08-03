import {Body, Controller, Get, Post} from '@nestjs/common';
import { AppService } from './app.service';
import * as bcrypt from 'bcrypt';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('register')
  async register(
      @Body('username')username: string,
      @Body('fullName')fullName: string,
      @Body('email')email: string,
      @Body('password')password: string
  ){
      const hashPassword = await bcrypt.hash(password, 16);

      return this.appService.register({
        username,
        fullName,
        email,
        password: hashPassword
      });
  }
}
