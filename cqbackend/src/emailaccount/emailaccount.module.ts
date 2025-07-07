// src/email-account/email-account.module.ts
import { Module } from '@nestjs/common';
import { EmailAccountService } from './emailaccount.service';
import { EmailAccountController } from './emailaccount.controller';

@Module({
  controllers: [EmailAccountController],
  providers: [EmailAccountService],
})
export class EmailAccountModule {}
