import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { EmailAccountModule } from './emailaccount/emailaccount.module';
import { Mailmodule } from './email/email.module';
import { UserModule } from './user/user.module';
import { DraftsModule } from './drafts/drafts.module';

@Module({
  imports: [UsersModule,AuthModule,EmailAccountModule,Mailmodule,UserModule,DraftsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
