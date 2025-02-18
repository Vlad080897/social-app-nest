import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto, LoginUserDto } from '../user/dto/user.dto';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../user/user.service';
import { TokenService } from '../token/token.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService,
    private readonly tokenService: TokenService,
  ) {}

  async signup(user: CreateUserDto) {
    const { password } = user;

    const isUserExist = await this.userService.findUserByEmail(user.email);

    if (isUserExist) {
      throw new HttpException('User already exists', HttpStatus.CONFLICT);
    }

    const hashedPassword = this.hashPassword(password);

    await this.userService.createUser({ ...user, password: hashedPassword });

    return {
      message: 'User created successfully',
      username: user.username,
    };
  }

  async login(loginUserDto: LoginUserDto) {
    const user = await this.userService.findUserByEmail(loginUserDto.email);

    if (!user) {
      throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
    }

    const isPasswordMatch = this.checkPassword(
      loginUserDto.password,
      user.password,
    );

    if (!isPasswordMatch) {
      throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
    }

    const accessToken = this.tokenService.generateAccessToken({
      username: user.username,
    });

    const refreshToken = this.tokenService.generateRefreshToken({
      username: user.username,
    });

    await this.tokenService.saveRefreshToken(refreshToken, user);

    return {
      message: 'Login successful',
      accessToken,
      refreshToken,
    };
  }

  async logout(refreshToken: string) {
    const result = await this.tokenService.deleteRefreshToken(refreshToken);

    if (result.affected === 0) {
      throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
    }

    return {
      message: 'Logout successful',
    };
  }

  private hashPassword(password: string) {
    const saltRounds = Number(
      this.configService.get<string>('auth.saltRounds'),
    );

    const salt = bcrypt.genSaltSync(saltRounds);
    return bcrypt.hashSync(password, salt);
  }

  private checkPassword(password: string, hashedPassword: string) {
    return bcrypt.compareSync(password, hashedPassword);
  }
}
