// src/user/user.service.ts
import { Injectable, UnauthorizedException, BadRequestException, NotFoundException } from '@nestjs/common';
import { db } from '../db/db.connection';
import { user } from '../db/schema/user.schema';
import { eq } from 'drizzle-orm';
import * as bcrypt from 'bcryptjs';
import * as nodemailer from 'nodemailer';
import { Request } from 'express'; // ✅ this is needed
import { users } from 'src/db/schema';

export interface RequestWithUser extends Request {
  user: {
    user_type: string;
    email: string;
    appPassword: string;
  };
}


@Injectable()
export class UserService {
 
async create(data: any, req: RequestWithUser) {
  const {firstname,lastname,phonenumber,employeeid,email,password,alternate_email,} = data;

  const currentEmail = req.user.email;

  // ✅ Step 1: Check role from `users` table
  const currentUser = await db.query.users.findFirst({
    where: eq(users.email, currentEmail),
  });

  if (!currentUser || currentUser.role !== 'Admin') {
    throw new UnauthorizedException('Only admin can create a user');
  }

  // ✅ Step 2: Continue creating user
  const existing = await db.query.user.findFirst({ where: eq(user.email, email) });
  if (existing) throw new BadRequestException('Email already exists');

  const hashedPassword = await bcrypt.hash(password, 10);

  await db.insert(user).values({
    firstname,
    lastname,
    phonenumber,
    employeeid,
    email,
    password: hashedPassword,
    alternate_email,
  });

  const smtpUser = currentEmail;
  const appPassword = req.user.appPassword;

  if (!smtpUser || !appPassword) {
    throw new UnauthorizedException('Missing SMTP credentials in token');
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: smtpUser,
      pass: appPassword,
    },
  });

  await transporter.sendMail({
    from: smtpUser,
    to: alternate_email,
    subject: 'Welcome to the System!',
   html: `
  <div style="font-family: Arial, sans-serif; padding: 20px;">
    <h2 style="color: #2e6c80;">Welcome to Our System, ${firstname}!</h2>
    
    <p>Dear ${firstname} ${lastname},</p>

    <p>Your account has been successfully created. You can log in with the following credentials:</p>

    <ul>
      <li><strong>Email:</strong> ${email}</li>
      <li><strong>Password:</strong> ${password}</li>
    </ul>

    <p>🔐 <strong>We recommend changing your password after your first login.</strong></p>

    <p>To change your password, click the link below:</p>
    <p>
      <a href="http://localhost:3000/user/password" target="_blank" style="color: #1a73e8;">
        http://localhost:3000/user/password
      </a>
    </p>

    <hr style="margin: 20px 0;" />

    <p>If you need help or have any questions, feel free to reply to this email.</p>

    <p>Best regards,<br/>The Admin Team</p>
  </div>
`

  });

  return { message: '✅ User created successfully and welcome email sent' };
}



  async updatePassword(userId: number, body: any) {
    const { previousPassword, newPassword, confirmPassword } = body;

    if (newPassword !== confirmPassword) {
      throw new BadRequestException('New and confirm passwords do not match');
    }

    const existingUser = await db.query.user.findFirst({ where: eq(user.id, userId) });
    if (!existingUser) throw new NotFoundException('User not found');

    const match = await bcrypt.compare(previousPassword, existingUser.password);
    if (!match) throw new UnauthorizedException('Previous password is incorrect');

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db.update(user).set({ password: hashedPassword }).where(eq(user.id, userId));

    return { message: '✅ Password updated successfully' };
  }
}
