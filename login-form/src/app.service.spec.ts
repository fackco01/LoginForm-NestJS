import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import { AppService } from './app.service';
import { beforeEach, describe, it } from 'node:test';
import { expect } from '@jest/globals';

describe('AppService', () => {
  let appService: AppService;
  let userRepository: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppService,
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
      ],
    }).compile();

    appService = module.get<AppService>(AppService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('be defined', async () => {
    expect(appService).toBeDefined();
  });

  it('register a new user', async () => {
    const userData = { username: 'nva', password: '123123Aa!' };
    const newUser = await appService.register(userData);

    expect(newUser).toHaveProperty('id');
    expect(newUser.username).toEqual(userData.username);
    // Add more expectations based on your application logic
  });

  it('find a user by username', async () => {
    const username = 'testuser';
    const user = await appService.findByUsername(username);

    expect(user).toBeDefined();
    expect(user.username).toEqual(username);
  });

  it('find a user by ID', async () => {
    const id = 1; // Provide an existing user ID
    const user = await appService.findById(id);

    expect(user).toBeDefined();
    expect(user.id).toEqual(id);
  });
});