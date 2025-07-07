import { Injectable } from '@nestjs/common';
import { db } from '../db/db.connection'; 
import { domains } from '../db/schema/domains.schema'; 
import { eq } from 'drizzle-orm';

@Injectable()
export class DomainsService {
  async findAll() {
    try {
      return await db.select().from(domains);
    } catch (error) {
      throw error;
    }
  }

  async findOne(id: number) {
    try {
      return await db.select().from(domains).where(eq(domains.id, id));
    } catch (error) {
      throw error;
    }
  }

  async create(data: { name: string , registeredAt?: string, isConfigured?: boolean }) {
    try {
      return await db.insert(domains).values(data).returning();
    } catch (error) {
      throw error;
    }
  }

  async update(id: number, data: { name?: string , registeredAt?: string, isConfigured?: boolean }) {
    try {
      return await db
        .update(domains)
        .set(data)
        .where(eq(domains.id, id))
        .returning();
    } catch (error) {
      throw error;
    }
  }

  async remove(id: number) {
    try {
      return await db.delete(domains).where(eq(domains.id, id)).returning();
    } catch (error) {
      throw error;
    }
  }
}