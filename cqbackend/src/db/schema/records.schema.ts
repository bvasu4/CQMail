import { integer, pgEnum, pgTable, serial, text, varchar } from "drizzle-orm/pg-core";
import { domains } from "./domains.schema";

export const dnsRecordType = pgEnum("dns_record_type", [
  "A", "AAAA", "CNAME", "MX", "TXT", "SRV", "NS", "PTR",
]);

export const records = pgTable('dns_records', {
  id: serial('id').primaryKey(),
  domainId: integer('domain_id').notNull().references(() => domains.id),
  type: dnsRecordType('type').notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  value: text('value').notNull(),
  ttl: integer('ttl').notNull().default(3600),
  priority: integer('priority').default(0),
});



export type DnsRecordType = (typeof dnsRecordType.enumValues)[number];