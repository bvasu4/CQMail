import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Req,
  Param,UnauthorizedException,Delete
} from '@nestjs/common';
import { Request } from 'express';
import { MailService } from './email.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { EmailMessage } from './email.service';
@Controller('mail')
@UseGuards(JwtAuthGuard) // Applies guard to all routes
export class MailController {
  constructor(private readonly MailService: MailService) {}

@Post('send')
async send(@Body() data: any, @Req() req: Request) {
  const { id, email, appPassword } = req.user as {
    id: number;
    email: string;
    appPassword: string;
  };

  if (!email || !appPassword) {
    throw new UnauthorizedException('Missing credentials from token');
  }

  return this.MailService.sendMail(data, { email, password: appPassword }, id);
}

// without db
// @Get('inbox')
// async getInbox(@Req() req: Request): Promise<EmailMessage[]> {
//   const user = req.user as { id: number; email: string; appPassword: string };

//   return this.MailService.getInbox({
//     email: user.email,
//     password: user.appPassword, // correct mapping here
//   });
// }


@Get('inbox')
async getInbox(@Req() req: Request): Promise<EmailMessage[]> {
  const user = req.user as {
    id: number;
    email: string;
    appPassword: string;
    email_account_id: number;
  };

  return this.MailService.getInbox({
    email: user.email,
    password: user.appPassword,
    user_id: user.id,
    email_account_id: user.email_account_id, 
  });
}


@Post('reply/:messageId')
async replyToMessage(
  @Param('messageId') messageId: string,
  @Body() body: { subject: string; text?: string; html?: string },
  @Req() req: Request
) {
  const user = req.user as {
    id: number;
    email: string;
    role: string;
    appPassword: string;
    email_account_id: number;
  };

  const data = {
    subject: body.subject,
    text: body.text,
    html: body.html,
  };

  return this.MailService.replyToMessage(messageId, data, {
    email: user.email,
    appPassword: user.appPassword,
    user_id: user.id,
     email_account_id: user.email_account_id,
  });
}


@Post('forward/:messageId')
async forwardMessage(
  @Param('messageId') messageId: string,
  @Body() body: { to: string | string[]; cc?: string | string[]; bcc?: string | string[]; subject: string; text?: string; html?: string },
  @Req() req: Request,
) {
  console.log('Controller received raw body:', body); // ADD THIS
  const user = req.user as {
    id: number;
    email: string;
    role: string;
    appPassword: string;
    email_account_id: number;
  };

  const dataForService = {
      to: body.to,
      cc: body.cc,
      bcc: body.bcc,
      subject: body.subject,
      text: body.text,
      html: body.html,
  };
  console.log('Controller preparing dataForService:', dataForService); // ADD THIS

  return this.MailService.forwardMessage(messageId, dataForService, {
    email: user.email,
    appPassword: user.appPassword,
    user_id: user.id,
    email_account_id: user.email_account_id,
  });
}

// In your controller, decode messageId from URL
@Delete('trash/:messageId')
async trashMessage(
  @Param('messageId') messageId: string,
  @Req() req: Request
) {
  const cleanId = decodeURIComponent(messageId); // ✅ Decode it
  const user = req.user as {
    id: number;
    email: string;
    email_account_id: number;
    appPassword: string;
  };

  return this.MailService.trashMessage(cleanId, {
    user_id: user.id,
    email: user.email,
    email_account_id: user.email_account_id,
    appPassword: user.appPassword,
  });
}


@Get('sent')
async getSent(@Req() req: any) {
  const user: any = req.user; // ✅ Declare first
  const result = await this.MailService.getSentEmails(user);
  return result;
}
@Get('trash')
async getTrash(@Req() req: Request) {
  const user = req.user as {
    id: number;
    email: string;
    appPassword: string;
    email_account_id: number;
  };

  return this.MailService.getTrashMails({
    email: user.email,
    appPassword: user.appPassword,
    user_id: user.id,
    email_account_id: user.email_account_id,
  });
}

@Get('thread/:messageId')
async getThread(
  @Param('messageId') messageId: string,
  @Req() req: Request
) {
  const cleanId = decodeURIComponent(messageId);
  const user = req.user as {
    id: number;
    email: string;
    email_account_id: number;
    appPassword: string;
  };

  return this.MailService.getConversationByMessageId(cleanId, user.id);
}




}


