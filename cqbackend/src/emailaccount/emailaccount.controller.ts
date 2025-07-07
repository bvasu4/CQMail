// src/email-account/email-account.controller.ts
import {Controller,Get,Post,Body,Patch,Param,Delete,Req,UseGuards,} from '@nestjs/common';
import { EmailAccountService } from './emailaccount.service';
import { JwtAuthGuard } from '../auth/jwt.guard';

@UseGuards(JwtAuthGuard)
@Controller('emailaccounts')
export class EmailAccountController {
  constructor(private readonly emailAccountService: EmailAccountService) {}

  @Post()
  create(@Body() body: any, @Req() req: any) {
    return this.emailAccountService.create(body, req.user);
  }

  @Get()
  findAll(@Req() req: any) {
    return this.emailAccountService.findAll(req.user);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: any) {
    return this.emailAccountService.findOne(Number(id), req.user);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    return this.emailAccountService.update(Number(id), body, req.user);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: any) {
    return this.emailAccountService.delete(Number(id), req.user);
  }
}
