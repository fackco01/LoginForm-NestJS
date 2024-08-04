import { Injectable } from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import {User} from "./user.entity";
import {FindOneOptions, Repository} from "typeorm";

@Injectable()
export class AppService {
  constructor(
      @InjectRepository(User)
      private readonly userRepository : Repository<User>
  ) {
    console.log(this.userRepository);
  }

  async register(data: any) : Promise<User> {
    return this.userRepository.save(data);
  }

  async findByUsername(username: string): Promise<User | undefined> {
    const user = await this.userRepository.findOne({
      where:
          {username: username}});
    if(!user) {
      return undefined;
    }
    return user;
  }

  async findById(id: number): Promise<User | undefined> {
    const user = await this.userRepository.findOne({
      where:
          {id: id}
        }
    );
    return user;
  }
}
