// draft.controller.ts
import {
  Controller,
  Post,
  Get,
  Put,
  Body,
  Param,
  Delete,
  Req,
  UseGuards,
  Patch,
} from '@nestjs/common';
import { DraftsService } from './drafts.service';
import { JwtAuthGuard } from '../auth/jwt.guard';


@Controller('drafts')
@UseGuards(JwtAuthGuard)

export class DraftsController {
  constructor(private readonly draftService: DraftsService) {}

  @Get()
  async getDrafts(@Req() req: any) {
    return this.draftService.getDrafts(req.user);
  }

  @Post()
  async saveDraft(@Req() req: any, @Body() body: any) {
    const { user_id, email_account_id } = req.user;
    return this.draftService.createDraft(body, user_id, email_account_id);
  }

@Post('move/:messageId')
async moveToDraft(
  @Req() req: any,
  @Param('messageId') messageId: string,
  @Body() body: any
) {
  const { user_id, email_account_id, email, appPassword } = req.user;

  const user = {
    email,
    appPassword,
    user_id,
    email_account_id,
  };

  return this.draftService.moveToDraftFromImap(messageId, user);
}



  @Patch('patch/:messageId')
  async updateDraft(@Req() req: any, @Param('messageId') messageId: string, @Body() body: any) {
    return this.draftService.updateDraft(req.user, messageId, body);
  }

  @Delete('delete/:messageId')
  async deleteDraft(@Req() req: any, @Param('messageId') messageId: string) {
    return this.draftService.deleteDraft(req.user, messageId);
  }
}
