import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { db } from '../db/db.connection';
import { emailAccounts } from '../db/schema/emailAccount.schema';
import { eq } from 'drizzle-orm';

@Injectable()
export class EmailAccountService {
  // ✅ CREATE (Admin only)
  async create(data: any, user: { role: string }) {
    if (user.role !== 'Admin') {
      throw new ForbiddenException('Only Admins are allowed');
    }

    // ✅ Check if email already exists
    const existing = await db
      .select()
      .from(emailAccounts)
      .where(eq(emailAccounts.email, data.email))
      .limit(1);

    if (existing.length > 0) {
      throw new ConflictException('Email already exists');
    }


    const now = new Date();
    await db.insert(emailAccounts).values({
      userId: data.id,
      email: data.email,
      appPassword: data.app_password,
      isDefault: data.isDefault ?? false,
      createdAt: now,
      updatedAt: now,
    });

    return { message: 'Email account created successfully' };
  }

  // ✅ GET ALL (Admin only)
  async findAll(user: { role: string }) {
    if (user?.role !== 'Admin') {
      throw new ForbiddenException('Only Admins are allowed');
    }

    return db.select().from(emailAccounts);
  }

  // ✅ GET ONE (Admin only)
  async findOne(id: number, user: { role: string }) {
    if (user?.role !== 'Admin') {
      throw new ForbiddenException('Only Admins are allowed');
    }

    const result = await db
      .select()
      .from(emailAccounts)
      .where(eq(emailAccounts.id, id));
    if (result.length === 0) throw new NotFoundException('Email account not found');
    return result[0];
  }

  // ✅ UPDATE (Admin and Employee)
  async update(id: number, data: any, user: { role: string }) {
    if (!['Admin', 'Employee'].includes(user?.role)) {
      throw new ForbiddenException('Only Admin or Employee can update');
    }

    const now = new Date();
    await db
      .update(emailAccounts)
      .set({ ...data, updatedAt: now })
      .where(eq(emailAccounts.id, id));
    return { message: 'Email account updated successfully' };
  }

  // ✅ DELETE (Admin only)
  async delete(id: number, user: { role: string }) {
    if (user?.role !== 'Admin') {
      throw new ForbiddenException('Only Admins are allowed');
    }

    await db.delete(emailAccounts).where(eq(emailAccounts.id, id));
    return { message: 'Email account deleted successfully' };
  }
}
