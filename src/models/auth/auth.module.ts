import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import User from '../user/entities/user.entity';
import { TokenService } from '../token/token.service';
import Token from '../token/entity/token.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Token])],
  providers: [AuthService, TokenService, UserService],
  controllers: [AuthController],
})
export class AuthModule {}
