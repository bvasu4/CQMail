import { Injectable } from '@nestjs/common';
import { db } from '../db/db.connection';
import { records,dnsRecordType } from '../db/schema/records.schema';
import { eq } from 'drizzle-orm';
// ✅ Infer enum type from schema so it's always in sync
type RecordType = (typeof dnsRecordType.enumValues)[number];
@Injectable()
export class RecordsService {
  async findAll() {
    try {
      return await db.select().from(records);
    } catch (error) {
      throw error;
    }
  }

  async findOne(id: number) {
    try {
      return await db.select().from(records).where(eq(records.id, id));
    } catch (error) {
      throw error;
    }
  }

async create(data: {
    domainId: number;
    name: string;
    type: RecordType; // ✅ Type-safe
    value: string;
    ttl: number;
    priority?: number;
  }) {
    try {
      return await db.insert(records).values(data).returning();
    } catch (error) {
      throw error;
    }
  }

  async update(id: number, data: { name?: string }) {
    try {
      return await db
        .update(records)
        .set(data)
        .where(eq(records.id, id))
        .returning();
    } catch (error) {
      throw error;
    }
  }

  async remove(id: number) {
    try {
      return await db.delete(records).where(eq(records.id, id)).returning();
    } catch (error) {
      throw error;
    }
  }
}