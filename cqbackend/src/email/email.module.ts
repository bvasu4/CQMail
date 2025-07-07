// src/emails/emails.module.ts
import { Module } from '@nestjs/common';
import { MailService } from './email.service';
import { MailController } from './email.controller';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from '../auth/auth.module'; // assuming auth module for AuthGuard

@Module({
  imports: [JwtModule.register({}), AuthModule],
  controllers: [MailController],
  providers: [MailService],
})
export class Mailmodule{}
