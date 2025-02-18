import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../auth.controller';
import { AuthService } from '../auth.service';

import { TokenService } from '../../token/token.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;
  let tokenService: TokenService;

  const userData = {
    username: 'username',
    email: 'email',
    password: 'password',
    first_name: 'first_name',
    last_name: 'last_name',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            signup: jest.fn(),
            login: jest.fn(),
            logout: jest.fn(),
          },
        },
        {
          provide: TokenService,
          useValue: {
            generateAccessToken: jest.fn(),
            generateRefreshToken: jest.fn(),
            saveRefreshToken: jest.fn(),
            deleteRefreshToken: jest.fn(),
            refreshAccessToken: jest.fn(),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    tokenService = module.get<TokenService>(TokenService);
    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call signup', () => {
    const signupSpy = jest.spyOn(authService, 'signup');

    controller.signup(userData);

    expect(signupSpy).toHaveBeenCalledWith(userData);
  });

  it('should call login', async () => {
    const loginSpy = jest.spyOn(authService, 'login');

    await controller.login(userData);

    expect(loginSpy).toHaveBeenCalledWith(userData);
  });

  it('should call logout', async () => {
    const logoutSpy = jest.spyOn(authService, 'logout');

    await controller.logout({
      refreshToken: 'refreshToken',
    });

    expect(logoutSpy).toHaveBeenCalledWith('refreshToken');
  });

  it('should call refreshAccessToken', async () => {
    const refreshAccessTokenSpy = jest.spyOn(
      tokenService,
      'refreshAccessToken',
    );

    await controller.refreshAccessToken({
      refreshToken: 'refreshToken',
    });

    expect(refreshAccessTokenSpy).toHaveBeenCalledWith('refreshToken');
  });
});
