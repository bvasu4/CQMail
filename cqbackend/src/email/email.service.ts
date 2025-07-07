import { Injectable, InternalServerErrorException, Logger,NotFoundException, } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { simpleParser,ParsedMail } from 'mailparser';
import { ImapFlow ,FetchMessageObject,} from 'imapflow';
import { db } from '../db/db.connection';
import { emails } from '../db/schema/emails.schema';
import { eq ,and,asc,inArray,or} from 'drizzle-orm';
import { emailAccounts } from 'src/db/schema';
import MailComposer from 'nodemailer/lib/mail-composer';

import { log } from 'console';
// Instantiate a logger for this service
const logger = new Logger('MailService');
// Renamed interface for clarity and to avoid conflicts
interface ImapFetchedMessage {
  envelope?: any; // Consider defining a more specific type for envelope if its structure is known
  source?: Buffer; // Raw message source is a Buffer
  // Add other properties if you fetch them, e.g., bodyParts, flags, etc.
}

export interface EmailMessage {
  uid: number;
  subject: string;
  from: string;
  to: string;
  date: Date;
  messageId: string;
  flags: string[];
  isRead: boolean;
  threadId?: string;
  body?: string;
}

@Injectable()
export class MailService {
 private readonly logger = new Logger(MailService.name);
async  sendMail(
  data: any,
  user: { email: string; password: string },
  userId: number
) {
  if (!userId) {
    throw new InternalServerErrorException('userId is missing');
  }

  const transporter = nodemailer.createTransport({
    // host: process.env.SMTP_HOST || 'smtp.gmail.com',
    // port: parseInt(process.env.SMTP_PORT || '587'),
    // secure: process.env.SMTP_SECURE === 'true',
    host: process.env.SMTP_HOST!,
port: parseInt(process.env.SMTP_PORT!),
secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: user.email,
      pass: user.password,
    },
     tls: { rejectUnauthorized: false },
     logger: false,
  });

  const info = await transporter.sendMail({
    from: user.email,
    to: data.to,
    cc: data.cc || [],
    bcc: data.bcc || [],
    subject: data.subject,
    text: data.text || '',
    html: data.html || '',
    attachments: data.attachments || [],
    headers: {
      ...(data.inReplyTo && { 'In-Reply-To': data.inReplyTo }),
      ...(data.references && {
        References: Array.isArray(data.references)
          ? data.references.join(' ')
          : data.references,
      }),
    },
  });

  // --- Append sent mail to IMAP 'Sent' folder ---
  try {
    const imapClient = new ImapFlow({
      host: process.env.IMAP_HOST!,
      port: parseInt(process.env.IMAP_PORT!),
      secure: process.env.IMAP_SECURE === 'true',
      auth: {
        user: user.email,
        pass: user.password,
      },
      tls: { rejectUnauthorized: false },
      logger: false,
    });
    await imapClient.connect();
    // Get the raw message from nodemailer
    const raw = info.message && typeof info.message === 'string' ? info.message : null;
    if (raw) {
      await imapClient.append('Sent', raw, ['\\Seen']);
    } else {
      // fallback: reconstruct a simple raw message if needed
      const fallbackRaw = [
        `From: ${user.email}`,
        `To: ${data.to}`,
        `Subject: ${data.subject}`,
        '',
        data.text || ''
      ].join('\r\n');
      await imapClient.append('Sent', fallbackRaw, ['\\Seen']);
    }
    await imapClient.logout();
  } catch (err) {
    console.warn('⚠️ Failed to append sent mail to IMAP Sent folder:', err.message);
  }

  const messageId: string = info.messageId;
  const parentMessageId: string | null = data.inReplyTo || null;
  // Normalize messageId
  const normalizedMessageId = messageId.startsWith('<') && messageId.endsWith('>') ? messageId : `<${messageId}>`;
  let threadId: string | null = null;
  let referencesIds: string[] = [];
  let inReplyToId: string | null = null;
  if (parentMessageId) {
    const originalEmail = await db.query.emails.findFirst({
      where: eq(emails.message_id, parentMessageId),
    });
    inReplyToId = originalEmail?.id?.toString() ?? null;
    threadId = originalEmail?.thread_id || originalEmail?.message_id || normalizedMessageId;
    // Inherit references_ids from parent, append parentMessageId
    if (originalEmail) {
      if (Array.isArray(originalEmail.references_ids)) {
        referencesIds = [...originalEmail.references_ids];
      } else if (typeof originalEmail.references_ids === 'string') {
        try {
          const parsed = JSON.parse(originalEmail.references_ids);
          if (Array.isArray(parsed)) referencesIds = parsed;
        } catch {}
      }
      if (!referencesIds.includes(parentMessageId)) referencesIds.push(parentMessageId);
    } else {
      referencesIds = [parentMessageId];
    }
  } else {
    inReplyToId = null;
    threadId = normalizedMessageId;
    referencesIds = [normalizedMessageId];
  }

  const emailAccount = await db.query.emailAccounts.findFirst({
    where: eq(emailAccounts.email, user.email),
  });
  const emailAccountId = emailAccount?.id ?? null;

  await db.insert(emails).values({
    message_id: normalizedMessageId,
    user_id: userId,
    email_account_id: emailAccountId,
    thread_id: threadId,
    in_reply_to_id: inReplyToId,
    parent_message_id: parentMessageId,
    from_email: user.email,
    to: data.to,
    cc: data.cc || null,
    bcc: data.bcc || null,
    subject: data.subject,
    content: data.text || '',
    html_content: data.html || '',
    attachments: JSON.stringify(data.attachments || []),
    email_type: 'sent',
    status: 'sent',
    folder: 'Sent',
    is_read: true,
    is_starred: !!data.is_starred,
    is_important:!!data.is_important,
    is_deleted: false,
    is_spam: false,
    references_ids: JSON.stringify(referencesIds),
    metadata: data.references
      ? JSON.stringify({ references: data.references })
      : null,
    sent_at: new Date(),
    delivered_at: new Date(),
    priority: 'Normal',
    forwarded: false,
  });

  return {
    success: true,
    messageId,
  };
}




async getInbox(user: {
  email: string;
  password: string;
  user_id: number;
  email_account_id: number;
}): Promise<any[]> {
  const client = new ImapFlow({
    host: process.env.IMAP_HOST!,
    port: parseInt(process.env.IMAP_PORT!),
    secure: process.env.IMAP_SECURE === 'true',
    auth: {
      user: user.email,
      pass: user.password,
    },
    tls: {
      rejectUnauthorized: false
    },
    logger: false,
  });

  try {
    await client.connect();
    // List all folders and log them
    const mailboxes = await client.list();
    console.log('IMAP Folders:', mailboxes.map(mb => mb.path));
    const lock = await client.getMailboxLock('INBOX');
    const allUids = await client.search({ all: true }) || [];
    if (!Array.isArray(allUids) || !allUids.length) {
      lock.release();
      await client.logout();
      return [];
    }
    const lastUids = allUids.slice(-20);
    const messages: any[] = [];
    for await (const message of client.fetch(lastUids, {
      envelope: true,
      flags: true,
      source: true,
    })) {
      const envelope = message.envelope;
      if (!envelope) continue;
      const raw = message.source?.toString('utf8') || '';
      const parsed = await simpleParser(raw);
      const messageId = envelope.messageId;
      if (!messageId) continue;
      // Avoid duplicate insert
      const exists = await db
        .select()
        .from(emails)
        .where(eq(emails.message_id, messageId));
      if (!exists.length) {
        const attachments = parsed.attachments || [];
        const attachmentLinks = attachments.map(att =>
          `https://yourdomain.com/uploads/${att.filename}`
        );
        await db.insert(emails).values({
          message_id: messageId,
          user_id: user.user_id,
          email_account_id: user.email_account_id,
          thread_id: null,
          in_reply_to_id: null,
          parent_message_id: null,
          from_email: envelope.from?.[0]?.address || '',
          to: (envelope.to?.map((t) => t.address).filter(Boolean) || []).join(','),
          cc: (envelope.cc?.map((t) => t.address).filter(Boolean) || []).join(','),
          bcc: (envelope.bcc?.map((t) => t.address).filter(Boolean) || []).join(','),
          subject: envelope.subject || '',
          content: (parsed.text || '').slice(0, 10),
          html_content: parsed.html || '',
          attachments: JSON.stringify(attachmentLinks),
          email_type: 'inbox',
          status: 'received',
          folder: 'INBOX',
          is_read: Array.isArray(message.flags) ? message.flags.includes('\\Seen') : false,
          is_starred: Array.isArray(message.flags) ? message.flags.includes('\\Flagged') : false,
          is_important: false,
          is_deleted: false,
          is_spam: false,
          sent_at: envelope.date,
          delivered_at: envelope.date,
          priority: null,
          forwarded: false,
        });
      }
      messages.push({
        message_id: messageId,
        subject: envelope.subject || '(No Subject)',
        from: envelope.from?.[0]?.address || '',
        to: (envelope.to?.map((t) => t.address).filter(Boolean) || []).join(','),
        date: envelope.date,
        summary: (parsed.text || '').slice(0, 100),
        html_content: parsed.html || '',
        attachments: parsed.attachments?.map(att => att.filename) || [],
      });
    }
    lock.release();
    await client.logout();
    messages.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return messages;
  } catch (error) {
    console.error('❌ Inbox sync failed:', error);
    throw new InternalServerErrorException('Failed to sync inbox');
  }
}

async replyToMessage(
  messageId: string,
  data: { subject: string; text?: string; html?: string },
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
    logger: false,
    tls: { rejectUnauthorized: false },
  });

  let info: any = null;
  let recipientEmail: string = '';
  let mailSubject: string = '';
  let inReplyToId: string = '';
  let references: string[] = [];
  let threadId: string = '';

  try {
    await client.connect();
    const folders = await client.list();
    const folderNames = folders.map((f) => f.path);
    console.log('📁 Available IMAP folders:', folderNames);

    const lock = await client.getMailboxLock('INBOX');
    let latestMessage: FetchMessageObject | null = null;

    try {
      const messages = await client.search({ all: true }) || [];
      if (!messages.length) throw new Error('No messages found in inbox');

      const cleanMessageId =
        messageId.startsWith('<') && messageId.endsWith('>') ? messageId : `<${messageId}>`;

      for await (const msg of client.fetch(messages, { envelope: true }) as AsyncIterable<FetchMessageObject>) {
        if (!msg.envelope) continue;
        const inReplyTo = msg.envelope.inReplyTo ?? '';
        const ref: string[] = (msg.envelope as any).references ?? [];

        if (
          ref.includes(cleanMessageId) ||
          inReplyTo === cleanMessageId ||
          msg.envelope.messageId === cleanMessageId
        ) {
          if (
            !latestMessage ||
            (msg.envelope.date &&
              (!latestMessage.envelope || msg.envelope.date > (latestMessage.envelope.date ?? new Date(0))))
          ) {
            latestMessage = msg;
          }
        }
      }

      if (!latestMessage?.envelope) {
        throw new Error(`Message with ID ${messageId} not found`);
      }

      const inReplyTo = latestMessage.envelope.messageId!;
      const rawReferences = (latestMessage.envelope as any).references ?? [];
      references = Array.from(new Set([...rawReferences, inReplyTo]));
recipientEmail = latestMessage.envelope.from?.[0]?.address ?? ''; // ensures it's always a string
      if (!recipientEmail) throw new Error('Original sender not found.');

      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST!,
        port: parseInt(process.env.SMTP_PORT!),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: user.email,
          pass: user.appPassword,
        },
        tls: { rejectUnauthorized: false },
      });

      mailSubject = latestMessage.envelope.subject?.startsWith('Re:')
        ? latestMessage.envelope.subject
        : `Re: ${latestMessage.envelope.subject}`;

      info = await transporter.sendMail({
        from: user.email,
        to: recipientEmail,
        subject: mailSubject,
        text: data.text || '',
        html: data.html || '',
        inReplyTo,
        references,
        headers: {
          'In-Reply-To': inReplyTo,
          References: references.join(' '),
        },
      });

      const messageIdSent = info.messageId;
      const parentMessageId = messageId;
      inReplyToId = inReplyTo;
      threadId = latestMessage.envelope.inReplyTo || latestMessage.envelope.messageId || messageIdSent;

      await db.insert(emails).values({
        message_id: messageIdSent,
        user_id: user.user_id,
        email_account_id: user.email_account_id,
        thread_id: threadId,
        in_reply_to_id: inReplyToId,
        parent_message_id: parentMessageId,
        from_email: user.email,
        to: recipientEmail,
        cc: '',
        bcc: '',
        subject: data.subject,
        content: data.text?.slice(0, 500) || '',
        html_content: data.html || '',
        attachments: '[]',
        email_type: 'sent',
        status: 'sent',
        folder: 'Sent',
        is_read: true,
        is_starred: false,
        is_important: false,
        is_deleted: false,
        is_spam: false,
        references_ids: references,
        metadata: JSON.stringify({ references }),
        sent_at: new Date(),
        delivered_at: new Date(),
        forwarded: false,
        priority: null,
      });

    } finally {
      lock.release();
    }

    // 🔁 Append using second imapClient like in sendMail
    try {
      const imapClient = new ImapFlow({
        host: process.env.IMAP_HOST!,
        port: parseInt(process.env.IMAP_PORT!),
        secure: process.env.IMAP_SECURE === 'true',
        auth: {
          user: user.email,
          pass: user.appPassword,
        },
        tls: { rejectUnauthorized: false },
        logger: false,
      });

      await imapClient.connect();

      const raw = info?.message && typeof info.message === 'string' ? info.message : null;

      if (raw) {
        await imapClient.append('Sent', raw, ['\\Seen']);
        console.log('✅ Appended raw message to IMAP Sent folder');
      } else {
        const fallbackRaw = [
          `From: ${user.email}`,
          `To: ${recipientEmail}`,
          `Subject: ${mailSubject}`,
          '',
          data.text || ''
        ].join('\r\n');

        await imapClient.append('Sent', fallbackRaw, ['\\Seen']);
        console.log('✅ Appended fallback raw message to IMAP Sent folder');
      }

      await imapClient.logout();
    } catch (err: any) {
      console.warn('⚠️ Failed to append message to IMAP Sent folder:', err.message);
    }

    return {
      success: true,
      sentTo: recipientEmail,
      messageId: info.messageId,
      repliedTo: inReplyToId,
      references,
      threadId,
    };

  } catch (error: any) {
    console.error('❌ Error replying to message:', error.message);
    throw new InternalServerErrorException('Failed to reply to message');
  } finally {
    await client.logout();
  }
}






async forwardMessage(
  messageId: string,
  data: {
    to: string | string[];
    cc?: string | string[];
    bcc?: string | string[];
    subject: string;
    text?: string;
    html?: string;
  },
  user: { email: string; appPassword: string; user_id: number; email_account_id: number },
) {
  const imapHost = process.env.IMAP_HOST!;
  const imapPort = parseInt(process.env.IMAP_PORT!);
  const imapSecure = process.env.IMAP_SECURE === 'true';
  const smtpHost = process.env.SMTP_HOST!;
  const smtpPort = parseInt(process.env.SMTP_PORT!);
  const smtpSecure = process.env.SMTP_SECURE === 'true';

  const client = new ImapFlow({
    host: imapHost,
    port: imapPort,
    secure: imapSecure,
    auth: {
      user: user.email,
      pass: user.appPassword,
    },
    tls: { rejectUnauthorized: false },
    logger: this.logger as any,
  });

  let lock: any = null;
  let mailMessageId: string | null = null;

  try {
    await client.connect();
    lock = await client.getMailboxLock('INBOX');

    const searchResults = await client.search({
  or: [
    { header: { 'Message-ID': messageId } },
    { header: { 'Message-ID': `<${messageId}>` } },
  ],
});

if (!searchResults || (Array.isArray(searchResults) && searchResults.length === 0)) {
  throw new Error(`Original message not found in IMAP with ID: ${messageId}`);
}

const searchResultsArr = Array.isArray(searchResults) ? searchResults : [];


    let originalMessage: ImapFetchedMessage | null = null;
    for await (const msg of client.fetch(searchResults, { envelope: true, source: true })) {
      originalMessage = msg;
      break;
    }

    if (!originalMessage) throw new Error('Failed to fetch original message');

    const rawOriginal = originalMessage.source?.toString('utf8') || '';
    const parsedOriginal = await simpleParser(rawOriginal);

    const quotedHtml = `
      <hr>
      <p>-------- Forwarded message --------</p>
      <p><b>From:</b> ${parsedOriginal.from?.value?.map(f => f.address).join(', ')}</p>
      <p><b>To:</b> ${parsedOriginal.to?.value?.map(t => t.address).join(', ')}</p>
      ${parsedOriginal.cc?.value?.length ? `<p><b>Cc:</b> ${parsedOriginal.cc.value.map(c => c.address).join(', ')}</p>` : ''}
      <p><b>Subject:</b> ${parsedOriginal.subject}</p>
      <p><b>Date:</b> ${parsedOriginal.date?.toUTCString()}</p>
      <br>
      ${parsedOriginal.html || parsedOriginal.textAsHtml}
    `;

    const attachments = parsedOriginal.attachments?.map(att => ({
      filename: att.filename,
      content: att.content,
      contentType: att.contentType,
      cid: att.cid,
    })) || [];

    const mailComposer = new MailComposer({
      from: user.email,
      to: data.to,
      cc: data.cc,
      bcc: data.bcc,
      subject: data.subject,
      text: data.text || parsedOriginal.text || '',
      html: (data.html || '') + quotedHtml,
      attachments,
    });

    const rawMime = await new Promise<Buffer>((resolve, reject) => {
      mailComposer.compile().build((err, message) => {
        if (err) return reject(err);
        resolve(message);
      });
    });

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpSecure,
      auth: {
        user: user.email,
        pass: user.appPassword,
      },
      tls: { rejectUnauthorized: false },
    });

    const [mailInfo, originalEmailDbRecord] = await Promise.all([
      transporter.sendMail({
        raw: rawMime.toString('utf8'),
        from: user.email,
        to: data.to,
        cc: data.cc,
        bcc: data.bcc,
      }),
      db.query.emails.findFirst({
        where: eq(emails.message_id, messageId),
      }),
    ]);

    mailMessageId = mailInfo.messageId;

    // APPEND TO SENT FOLDER
    const sentFolders = ['Sent', 'Sent Mail', 'Sent Items', '[Gmail]/Sent Mail'];
    let appended = false;
    for (const folder of sentFolders) {
      try {
        await client.append(folder, rawMime, ['\\Seen']);
        appended = true;
        this.logger.debug(`✅ Appended to folder: ${folder}`);
        break;
      } catch (e: any) {
        this.logger.warn(`⚠️ Could not append to "${folder}": ${e.message}`);
      }
    }
    if (!appended) this.logger.warn('❌ Failed to append to any Sent folder.');

    // Prepare reference/thread data
    const referencesIds: string[] = [];
    let threadId = originalEmailDbRecord?.thread_id || messageId;

    if (originalEmailDbRecord?.references_ids) {
      try {
        const parsed = typeof originalEmailDbRecord.references_ids === 'string'
          ? JSON.parse(originalEmailDbRecord.references_ids)
          : originalEmailDbRecord.references_ids;
        if (Array.isArray(parsed)) referencesIds.push(...parsed);
      } catch {}
    }
    if (!referencesIds.includes(messageId)) referencesIds.push(messageId);
    if (mailMessageId && !referencesIds.includes(mailMessageId)) referencesIds.push(mailMessageId);

    await db.insert(emails).values({
      message_id: mailMessageId,
      user_id: user.user_id,
      email_account_id: user.email_account_id,
      thread_id: threadId,
      in_reply_to_id: null,
      parent_message_id: messageId,
      from_email: user.email,
      to: Array.isArray(data.to) ? data.to.join(', ') : data.to,
      cc: Array.isArray(data.cc) ? data.cc.join(', ') : data.cc || '',
      bcc: Array.isArray(data.bcc) ? data.bcc.join(', ') : data.bcc || '',
      subject: data.subject || `Fwd: ${parsedOriginal.subject || ''}`,
      content: (data.text || parsedOriginal.text || '').slice(0, 1000),
      html_content: (data.html || '') + quotedHtml,
      attachments: JSON.stringify(parsedOriginal.attachments?.map(a => a.filename) || []),
      email_type: 'sent',
      status: 'sent',
      folder: 'SENT',
      is_read: true,
      is_starred: false,
      is_important: false,
      is_deleted: false,
      is_spam: false,
      references_ids: JSON.stringify(referencesIds),
      metadata: JSON.stringify({ forwarded_from: messageId }),
      sent_at: new Date(),
      delivered_at: new Date(),
      priority: null,
      forwarded: true,
    });

    // Async cleanup
    (async (logger, lock, client) => {
      try {
        if (lock) lock.release();
      } catch (e: any) {
        logger.warn('Failed to release lock:', e.message);
      }
      try {
        await Promise.race([
          client.logout(),
          new Promise((_res, rej) => setTimeout(() => rej(new Error('Timeout logout')), 5000)),
        ]);
      } catch (e: any) {
        logger.warn('Failed to logout IMAP:', e.message);
      }
    })(this.logger, lock, client);

    return {
      success: true,
      forwardedTo: data.to,
      messageId: mailMessageId,
      forwardedFrom: messageId,
    };

  } catch (error: any) {
    this.logger.error('❌ Forward message failed:', error.message);
    try {
      if (lock) lock.release();
    } catch {}
    try {
      await client.logout();
    } catch {}
    throw new InternalServerErrorException('Failed to forward message');
  }
}


async trashMessage(
  messageId: string,
  user: {
    user_id: number;
    email: string;
    email_account_id: number;
    appPassword: string;
  }
) {
  // Step 1: Update in local DB
  const result = await db
    .update(emails)
    .set({
      is_deleted: true,
      folder: 'TRASH',
    })
    .where(
      and(
        eq(emails.message_id, messageId),
        eq(emails.user_id, user.user_id),
        eq(emails.email_account_id, user.email_account_id)
      )
    )
    .returning();

  // Step 2: Connect to IMAP (always try, even if DB update failed)
  const client = new ImapFlow({
    host: process.env.IMAP_HOST!,
    port: parseInt(process.env.IMAP_PORT!),
    secure: process.env.IMAP_SECURE === 'true',
    auth: {
      user: user.email,
      pass: user.appPassword,
    },
    tls: { rejectUnauthorized: false },
    logger: false,
  });

  // Find the Trash folder in a case-insensitive way
  let trashFolder = 'Trash';
  const cleanMessageId = messageId.startsWith('<') && messageId.endsWith('>') ? messageId : `<${messageId}>`;
  let moved = false;
  let imapError: any = null;

  try {
    await client.connect();
    const mailboxes = await client.list();
    const foldersToSearch = mailboxes.map((mb) => mb.path);
    const foundTrash = foldersToSearch.find(f => f.toLowerCase() === 'trash');
    if (foundTrash) trashFolder = foundTrash;
    for (const folder of foldersToSearch) {
      try {
        await client.mailboxOpen(folder);
        const uids = await client.search({ header: { 'Message-ID': cleanMessageId } });
        if (Array.isArray(uids) && uids.length > 0) {
          await client.messageMove(uids, trashFolder);
          console.log(`✅ Moved message ${cleanMessageId} from ${folder} to ${trashFolder}`);
          moved = true;
          break;
        } else {
          console.log(`🔍 No UIDs in ${folder} for Message-ID ${cleanMessageId}`);
        }
        for await (const msg of client.fetch({ all: true }, { envelope: true, uid: true })) {
          const foundId = msg.envelope?.messageId;
          if (foundId && foundId.trim() === cleanMessageId) {
            await client.messageMove(msg.uid, trashFolder);
            console.log(`✅ Moved message by envelope match from ${folder}`);
            moved = true;
            break;
          }
        }
        if (moved) break;
      } catch (folderErr) {
        console.warn(`⚠️ Error accessing folder ${folder}:`, folderErr.message);
      }
    }
  } catch (err) {
    imapError = err;
    console.error('❌ IMAP operation failed:', err.message);
  } finally {
    try {
      await client.logout();
    } catch (e) {
      console.warn('⚠️ Logout failed');
    }
  }

  // Only return 404 if both DB and IMAP failed
  if (result.length === 0 && !moved) {
    throw new NotFoundException('Message not found in DB or IMAP');
  }

  return {
    success: true,
    imapMoved: moved,
    message: moved
      ? `✅ Message ${messageId} moved to IMAP Trash${result.length === 0 ? ' (not in DB)' : ' and DB marked'}`
      : `⚠️ Message ${messageId} moved only in DB (IMAP message not found${imapError ? ': ' + imapError.message : ''})`,
  };
}


async getSentEmails(user: {
  email: string;
  appPassword: string;
  user_id: number;
  email_account_id: number;
}) {
  const client = new ImapFlow({
    host: process.env.IMAP_HOST!,
    port: parseInt(process.env.IMAP_PORT!),
    secure: process.env.IMAP_SECURE === 'true',
    auth: {
      user: user.email,
      pass: user.appPassword,
    },
    tls: {
      rejectUnauthorized: false
    },
    logger: false,
  });

  await client.connect();

  let sentFolder = 'Sent';
  try {
    // Dynamically find the Sent folder (case-insensitive, common variants)
    const mailboxes = await client.list();
    const foldersToSearch = mailboxes.map((mb) => mb.path);
    const sentCandidates = ['Sent', 'sent mail', 'sent items', '[gmail]/sent mail'];
    const foundSent = foldersToSearch.find(f => sentCandidates.includes(f.toLowerCase()));
    if (foundSent) sentFolder = foundSent;
    else {
      // fallback: try to find any folder containing 'sent'
      const partialSent = foldersToSearch.find(f => f.toLowerCase().includes('sent'));
      if (partialSent) sentFolder = partialSent;
    }

    await client.mailboxOpen(sentFolder);

    const sentEmails: {
      message_id: string;
      subject: string;
      to: string;
      from: string;
      date: string;
      body: string;
      attachments: {
        filename: string;
        contentType: string;
        size: number;
      }[];
    }[] = [];

    const uids = await client.search({ all: true }) || [];
    for await (const message of client.fetch(Array.isArray(uids) ? uids : [], {
      envelope: true,
      source: true,
      uid: true,
      internalDate: true,
    })) {
      const envelope = message.envelope;
      if (!envelope) continue;
      const parsed = await simpleParser(message.source);
      sentEmails.push({
        message_id: envelope.messageId || '',
        subject: envelope.subject || '',
        to: envelope.to?.map(t => t.address).join(', ') || '',
        from: envelope.from?.[0]?.address || '',
        date: envelope.date ? envelope.date.toISOString() : '',
        body: parsed.html || parsed.text || '',
        attachments: parsed.attachments.map(att => ({
          filename: att.filename || 'unknown',
          contentType: att.contentType,
          size: att.size,
        })),
      });
    }

    // ✅ Sort by date descending (latest emails first)
    sentEmails.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return sentEmails;
  } finally {
    await client.logout();
  }
}


 async  getTrashMails(user: {
  email: string;
  appPassword: string;
  user_id: number;
  email_account_id: number;
}) {
  const client = new ImapFlow({
    host: process.env.IMAP_HOST!,
    port: parseInt(process.env.IMAP_PORT!),
    secure: process.env.IMAP_SECURE === 'true',
    auth: {
      user: user.email,
      pass: user.appPassword,
    },
    tls: { rejectUnauthorized: false },
    logger: false,
  });

  let trashFolder = 'Trash';
  try {
    // Set a manual timeout of 10 seconds
    await Promise.race([
      client.connect(),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('IMAP connection timeout')), 10000)
      ),
    ]);

    const mailboxes = await client.list();
    const foldersToSearch = mailboxes.map((mb) => mb.path);
    const foundTrash = foldersToSearch.find((f) => f.toLowerCase() === 'trash');
    if (foundTrash) trashFolder = foundTrash;

    await client.mailboxOpen(trashFolder);
    const uids = await client.search({ all: true }) || [];

    const messages: any[] = [];

    for await (const message of client.fetch(uids, {
      envelope: true,
      flags: true,
      source: true,
      uid: true,
      internalDate: true,
    })) {
      const envelope = message.envelope;
      if (!envelope) continue;

      const parsed = await simpleParser(message.source);

  messages.push({
  message_id: envelope.messageId || '',
  subject: envelope.subject || '',
  from: envelope.from?.[0]?.address || '',
  to: envelope.to?.map(t => t.address).filter(Boolean).join(', ') || '',
  date: envelope.date ? envelope.date.toISOString() : '',
  body: parsed.html || parsed.text || '',
  attachments: parsed.attachments?.map(att => att.filename) || [],
  flags: Array.isArray(message.flags) ? message.flags : [],  // ✅ normalize here
  isRead: Array.isArray(message.flags) ? message.flags.includes('\\Seen') : false,
  folder: trashFolder,
  uid: message.uid,
});
    }

    messages.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    await client.logout();
    return messages;

  } catch (err: any) {
    console.error('❌ IMAP Trash fetch failed:', err.code || err.message, err.stack || '');
    throw new InternalServerErrorException(
      `Failed to fetch trash from IMAP: ${err.code || err.message}`
    );
  }
}

async getConversationByMessageId(messageId: string, userId: number) {
  // Normalize variations of messageId
  const trimmedId = messageId.trim();
  const withBrackets = trimmedId.startsWith('<') ? trimmedId : `<${trimmedId}>`;
  const withoutBrackets = trimmedId.replace(/^<|>$/g, '');

  const possibleIds = [trimmedId, withBrackets, withoutBrackets];

  // Get all emails with matching message_id (any format)
  const allMatching = await db.query.emails.findMany({
    where: inArray(emails.message_id, possibleIds),
  });

  console.log('Messages matching messageId:', allMatching);
  console.log('Looking for userId:', userId);

  // Find the one that belongs to the current user
  const message = allMatching.find(m => m.user_id === userId);

  if (!message) {
    console.warn('Message found, but not owned by user. Tried IDs:', possibleIds);
    throw new NotFoundException('Message not found or access denied');
  }

  // Parse references_ids for ancestry
  let ancestry: string[] = [];
  if (Array.isArray(message.references_ids)) {
    ancestry = [...message.references_ids];
  } else if (typeof message.references_ids === 'string') {
    try {
      const parsed = JSON.parse(message.references_ids);
      if (Array.isArray(parsed)) ancestry = parsed;
    } catch (e) {
      console.warn('Failed to parse references_ids JSON:', e);
    }
  }

  // Always include self and thread_id in ancestry
  if (message.message_id && !ancestry.includes(message.message_id)) {
    ancestry.push(message.message_id);
  }

  if (message.thread_id && typeof message.thread_id === 'string' && !ancestry.includes(message.thread_id)) {
    ancestry.push(message.thread_id);
  }

  // Get all emails belonging to the same user
  const allUserEmails = await db
    .select()
    .from(emails)
    .where(eq(emails.user_id, userId));

  // Filter out emails part of the thread
  const threadMessages = allUserEmails.filter(e => {
    if (e.message_id && ancestry.includes(e.message_id)) return true;

    let refs: string[] = [];
    if (Array.isArray(e.references_ids)) {
      refs = e.references_ids;
    } else if (typeof e.references_ids === 'string') {
      try {
        const parsed = JSON.parse(e.references_ids);
        if (Array.isArray(parsed)) refs = parsed;
      } catch {}
    }

    if (refs.some(r => ancestry.includes(r))) return true;

    if (
      message.thread_id &&
      typeof message.thread_id === 'string' &&
      e.thread_id &&
      typeof e.thread_id === 'string' &&
      e.thread_id === message.thread_id
    ) {
      return true;
    }

    return false;
  });

  // Sort the thread by date
  threadMessages.sort((a, b) => {
    const aTime = a.sent_at ? new Date(a.sent_at).getTime() : 0;
    const bTime = b.sent_at ? new Date(b.sent_at).getTime() : 0;
    return aTime - bTime;
  });

  return threadMessages;
}




}
