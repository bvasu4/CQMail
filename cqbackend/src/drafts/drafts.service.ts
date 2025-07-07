import { Injectable ,InternalServerErrorException} from '@nestjs/common';
import { db } from 'src/db/db.connection';
import { drafts } from '../db/schema/drafts.schema';
import { and, eq } from 'drizzle-orm';
import { emailAccounts, users } from 'src/db/schema';
import { simpleParser } from 'mailparser';

import { ImapFlow } from 'imapflow';
@Injectable()
export class DraftsService {
  async createDraft(body: any, userId: number, emailAccountId: number) {
const [newDraft] = await db.insert(drafts).values({
  userId: userId,
  emailAccountId: emailAccountId,
  messageId: body.message_id,
  threadId: body.thread_id,
  parentMessageId: body.parent_message_id,
  to: body.to,
  cc: body.cc,
  bcc: body.bcc,
  subject: body.subject,
  content: body.content,
  htmlContent: body.html_content,
  attachments: body.attachments,
  lastSaved: new Date(),
  createdAt: new Date(),
  updatedAt: new Date(),
}).returning();

return newDraft;

  }
 async updateDraft(user: any, messageId: string, data: any) {
  return db.update(drafts)
    .set({
      to: data.to,
      cc: data.cc,
      bcc: data.bcc,
      subject: data.subject,
      content: data.content,
      htmlContent: data.html_content, // mapping to camelCase here
      attachments: data.attachments,
      updatedAt: new Date(),
      lastSaved: new Date(),
    })
    .where(eq(drafts.messageId, messageId)) // correct camelCase field
    .returning();
}


async deleteDraft(user: any, messageId: string) {
  return db.delete(drafts)
    .where(and(
      eq(drafts.userId, user.user_id),
      eq(drafts.messageId, messageId)
    ));
}


  async getDrafts(user: any) {
    return db.select().from(drafts).where(eq(drafts, user.user_id));
  }
async moveToDraftFromImap(
  messageId: string,
  user: { email: string; appPassword: string; user_id: number; email_account_id: number }
) {
  const client = new ImapFlow({
    host: process.env.IMAP_HOST!,
    port: parseInt(process.env.IMAP_PORT!),
    secure: process.env.IMAP_SECURE === 'true',
    auth: {
      user: user.email,
      pass: user.appPassword,
    },
    tls: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    await client.mailboxOpen('INBOX');

   const uids = await client.search({ header: { 'Message-ID': messageId } });

if (!uids || !Array.isArray(uids) || uids.length === 0) {
  throw new Error('Message not found in INBOX');
}

    for await (const msg of client.fetch(uids, { source: true, envelope: true, flags: true })) {
      const parsed = await simpleParser(msg.source);

      // 1. Append to Drafts
      const allBoxes = await client.list();
      const draftsBox = allBoxes.find(b => b.path.toLowerCase() === 'drafts')?.path || 'Drafts';

      if (!msg.source) {
  throw new Error('Email source is undefined');
}

for await (const msg of client.fetch([Number(messageId)], {
  source: true,
  internalDate: true,
})) {
await client.append('Drafts', msg.source!, {
  flags: ['\\Draft'],
} as any); // 👈 bypass type error for now

}


  // 2. Save to database
      const draftData = {
        message_id: msg.envelope?.messageId || '',
        parent_message_id: '',
        subject: msg.envelope?.subject || '',
        to: parsed.to?.text || '',
        cc: parsed.cc?.text || '',
        bcc: parsed.bcc?.text || '',
        content: parsed.text || '',
        html_content: parsed.html || '',
        attachments: JSON.stringify(
          parsed.attachments?.map(att => ({
            filename: att.filename,
            contentType: att.contentType,
            size: att.size,
          })) || []
        ),
      };

      await this.createDraft(draftData, user.user_id, user.email_account_id);

      // Optional: delete from inbox
      // await client.messageDelete(uids);
    }

    await client.logout();
    return { message: 'Moved to Drafts successfully' };
  } catch (err) {
    console.error('❌ moveToDraftFromImap error:', err);
    throw new InternalServerErrorException('Move to Draft failed');
  }
}


}
