import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { db } from '../db/db.connection';
import { users } from '../db/schema/users.schema'; 
import { eq } from 'drizzle-orm';
import * as bcrypt from 'bcryptjs';
import { emailAccounts } from 'src/db/schema/emailAccount.schema';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

// async login(email: string, password: string) {
//   const userResult = await db
//     .select()
//     .from(users)
//     .where(eq(users.email, email))
//     .limit(1);

//   const user = userResult[0];

//   if (!user) {
//     throw new UnauthorizedException('Invalid credentials');
//   }

//   const isPasswordValid = await bcrypt.compare(password, user.password);
//   if (!isPasswordValid) {
//     throw new UnauthorizedException('Invalid credentials');
//   }

//   const payload = { sub: user.id, email: user.email, role: user.role };
//   const access_token = this.jwtService.sign(payload);

//   return { access_token };
// }
async login(email: string, password: string) {
  // Step 1: Verify user credentials from `users` table
  const userResult = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  const user = userResult[0];

  if (!user) {
    throw new UnauthorizedException('Invalid credentials');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new UnauthorizedException('Invalid credentials');
  }

  // Step 2: Fetch appPassword from `emailAccounts` table
  const emailAccountResult = await db
    .select()
    .from(emailAccounts)
    .where(eq(emailAccounts.email, email))
    .limit(1);

  const emailAccount = emailAccountResult[0];

  if (!emailAccount) {
    throw new UnauthorizedException('Email account not configured');
  }

  // Step 3: Create JWT payload including appPassword
  const payload = {
    sub: user.id,
    email: user.email,
    role: user.role,
    appPassword: emailAccount.appPassword, // include this securely
    email_account_id:emailAccount.id,
   fullname: `${user.firstname} ${user.lastname}`

  };

  const access_token = this.jwtService.sign(payload);

  return { access_token ,email};
}


}
