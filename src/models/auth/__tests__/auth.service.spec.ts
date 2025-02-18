import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../auth.service';

import { HttpException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { TokenService } from '../../token/token.service';
import { UserService } from '../../user/user.service';

describe('AuthService', () => {
  let service: AuthService;
  let tokenService: TokenService;

  const findUserByEmail = jest.fn();
  const createUser = jest.fn();

  const user = {
    username: 'username',
    email: 'email',
    password: 'password',
    first_name: 'first_name',
    last_name: 'last_name',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
        {
          provide: UserService,
          useValue: {
            findUserByEmail,
            createUser,
          },
        },
        {
          provide: TokenService,
          useValue: {
            generateAccessToken: jest.fn(),
            generateRefreshToken: jest.fn(),
            refreshAccessToken: jest.fn(),
            deleteRefreshToken: jest.fn(),
            saveRefreshToken: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    tokenService = module.get<TokenService>(TokenService);
  });

  it('authService should be defined', () => {
    expect(service).toBeDefined();
  });

  it('signup should not create the same user', async () => {
    findUserByEmail.mockResolvedValueOnce({
      email: 'alreadyExists@gmail.com',
    });

    await expect(service.signup(user)).rejects.toThrow(HttpException);
  });

  it('should create a new user', async () => {
    findUserByEmail.mockResolvedValueOnce(null);
    jest.spyOn(bcrypt, 'hashSync').mockReturnValueOnce('hashedPassword');

    await expect(service.signup(user)).resolves.toEqual({
      message: 'User created successfully',
      username: user.username,
    });

    expect(createUser).toHaveBeenCalledWith({
      ...user,
      password: 'hashedPassword',
    });
  });

  it('should throw an exception on login if user does not exist ', async () => {
    findUserByEmail.mockResolvedValueOnce(null);

    await expect(service.login(user)).rejects.toThrow(HttpException);
  });

  it('should throw an exception on login if password does not match', async () => {
    findUserByEmail.mockResolvedValueOnce({
      email: 'alreadyExists@gmail.com',
    });
    jest.spyOn(bcrypt, 'compareSync').mockReturnValueOnce(false);

    await expect(service.login(user)).rejects.toThrow(HttpException);
  });

  it('should login user', async () => {
    findUserByEmail.mockResolvedValueOnce({
      email: 'alreadyExists@gmail.com',
    });
    jest.spyOn(bcrypt, 'compareSync').mockReturnValueOnce(true);

    (tokenService.generateAccessToken as jest.Mock).mockReturnValueOnce(
      'accessToken',
    );
    (tokenService.generateRefreshToken as jest.Mock).mockReturnValueOnce(
      'refreshToken',
    );

    await expect(service.login(user)).resolves.toEqual({
      message: 'Login successful',
      accessToken: 'accessToken',
      refreshToken: 'refreshToken',
    });
  });

  it('should logout user', async () => {
    (tokenService.deleteRefreshToken as jest.Mock).mockResolvedValueOnce({
      affected: 1,
    });

    await expect(service.logout('refreshToken')).resolves.toEqual({
      message: 'Logout successful',
    });
  });

  it('should throw an exception on logout if token does not exist', async () => {
    (tokenService.deleteRefreshToken as jest.Mock).mockResolvedValueOnce({
      affected: 0,
    });

    await expect(service.logout('refreshToken')).rejects.toThrow(HttpException);
  });
});
