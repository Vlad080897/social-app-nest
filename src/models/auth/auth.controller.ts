import { Body, Controller, Post } from '@nestjs/common';
import {
  CreateUserDto,
  LoginUserDto,
  RefreshTokenDto,
} from '../user/dto/user.dto';
import { AuthService } from './auth.service';
import { TokenService } from '../token/token.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly tokenService: TokenService,
  ) {}

  @Post('signup')
  signup(@Body() createUserDto: CreateUserDto) {
    return this.authService.signup(createUserDto);
  }
  @Post('login')
  login(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }

  @Post('logout')
  logout(@Body() body: RefreshTokenDto) {
    return this.authService.logout(body.refreshToken);
  }

  @Post('token')
  refreshAccessToken(@Body() body: RefreshTokenDto) {
    return this.tokenService.refreshAccessToken(body.refreshToken);
  }
}
