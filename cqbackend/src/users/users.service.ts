import { ConflictException,ForbiddenException,Injectable,NotFoundException} from '@nestjs/common';
import { db } from '../db/db.connection';
import { users } from '../db/schema/users.schema';
import { eq } from 'drizzle-orm';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  async createUser(creator: { id: number; role: string },userDto: {
      email: string;
      password: string;
      firstname?: string;
      lastname?: string;
      displayName?: string;
      employeeId?: string;
      role?: string;
    },
  ) {
    // ✅ Only Admins can register users
    if (creator.role !== 'Admin') {
      throw new ForbiddenException('Only admins can create users');
    }

    // ✅ Check if email already exists
    const existing = await db
      .select()
      .from(users)
      .where(eq(users.email, userDto.email))
      .limit(1);

    if (existing.length > 0) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(userDto.password, 10);

    const finalDisplayName =
      userDto.displayName ||
      [userDto.firstname, userDto.lastname].filter(Boolean).join(' ').trim();

    const now = new Date();

await db.insert(users).values({
  email: userDto.email,
  password: hashedPassword,
  firstname: userDto.firstname || null,
  lastname: userDto.lastname || null,
  displayName: finalDisplayName || null,
  employeeId: userDto.employeeId || null,
  role: (userDto.role as 'Admin'  | 'Employee') || 'Employee',
  createdAt: new Date(),
  updatedAt: new Date(),
});



    return { message: 'User registered successfully' };
  }

  async getAllUsers(requester: { role: string }) {
    if (requester.role !== 'Admin') {
      throw new ForbiddenException('Only admins can view users');
    }
    return await db.select().from(users);
  }

  async getUserById(id: number, requester: { role: string }) {
    if (requester.role !== 'Admin') {
      throw new ForbiddenException('Only admins can view users');
    }

    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    if (result.length === 0) throw new NotFoundException('User not found');
    return result[0];
  }

  async updateUser(
    id: number,
    updateDto: {
      firstname?: string;
      lastname?: string;
      displayName?: string;
      employeeId?: string;
      role?: string;
      password?: string;
    },
    requester: { email: string; role: string }
  ) {
    const existing = await db.select().from(users).where(eq(users.id, id)).limit(1);
    if (existing.length === 0) throw new NotFoundException('User not found');
    const existingUser = existing[0];

    const now = new Date();

    // 🔐 If user is not admin
    if (requester.role !== 'Admin') {
      if (updateDto.password && existingUser.email === requester.email) {
        const hashedPassword = await bcrypt.hash(updateDto.password, 10);
        await db
          .update(users)
          .set({ password: hashedPassword, updatedAt: now })
          .where(eq(users.id, id));
        return { message: 'Password updated successfully' };
      } else {
        throw new ForbiddenException('Only Admin can update user info');
      }
    }

    // ✅ If Admin - full update access
    const dataToUpdate: any = {
      updatedAt: now,
    };

    if (updateDto.firstname) dataToUpdate.firstname = updateDto.firstname;
    if (updateDto.lastname) dataToUpdate.lastname = updateDto.lastname;
    if (updateDto.displayName) {
      dataToUpdate.displayName = updateDto.displayName;
    } else if (updateDto.firstname || updateDto.lastname) {
      dataToUpdate.displayName = [updateDto.firstname, updateDto.lastname]
        .filter(Boolean)
        .join(' ');
    }
    if (updateDto.employeeId) dataToUpdate.employeeId = updateDto.employeeId;
    if (updateDto.role) dataToUpdate.role = updateDto.role;
    if (updateDto.password) {
      dataToUpdate.password = await bcrypt.hash(updateDto.password, 10);
    }

    await db.update(users).set(dataToUpdate).where(eq(users.id, id));
    return { message: 'User updated successfully' };
  }

  async deleteUser(id: number, requester: { role: string }) {
    if (requester.role !== 'Admin') {
      throw new ForbiddenException('Only admins can delete users');
    }

    const existing = await db.select().from(users).where(eq(users.id, id)).limit(1);
    if (existing.length === 0) throw new NotFoundException('User not found');

    await db.delete(users).where(eq(users.id, id));
    return { message: 'User deleted successfully' };
  }
}
