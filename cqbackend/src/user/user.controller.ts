// src/user/user.controller.ts
import { Controller, Post, Body, Patch, Req, UseGuards,UnauthorizedException } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import {RequestWithUser} from './user.service'
import { Request } from 'express';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

@Post()
@UseGuards(JwtAuthGuard)
async createUser(@Body() body: any, @Req() req: Request) {
  return this.userService.create(body, req as RequestWithUser);
}

  @Patch('password')
  @UseGuards(JwtAuthGuard)
  async updatePassword(@Req() req, @Body() body: any) {
    const userId = req.user?.id;
    return this.userService.updatePassword(userId, body);
  }
}
