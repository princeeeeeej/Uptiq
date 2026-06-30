import { prismaclient } from 'store/client';
import nodemailer from 'nodemailer';

export type AlertPayload = {
  websiteId: string;
  websiteName: string;
  websiteUrl: string;
  eventType: 'DOWN' | 'RECOVERED' | 'SSL_EXPIRING';
  reason?: string;
  daysRemaining?: number;
};

const SSL_COOLDOWN_MS = 24 * 60 * 60 * 1000;

const emailTransporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT ?? 587),
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
});

async function shouldFire(
  websiteId: string,
  channelId: string,
  eventType: AlertPayload['eventType']
): Promise<boolean> {
  const last = await prismaclient.alertEvent.findFirst({
    where: { websiteId, alertChannelId: channelId },
    orderBy: { createdAt: 'desc' },
  });

  if (!last) return true;

  if (eventType === 'DOWN' && last.eventType === 'DOWN') return false;
  if (eventType === 'RECOVERED' && last.eventType === 'RECOVERED') return false;

  if (eventType === 'SSL_EXPIRING') {
    const age = Date.now() - last.createdAt.getTime();
    if (age < SSL_COOLDOWN_MS) return false;
  }

  return true;
}

async function sendEmail(to: string, payload: AlertPayload) {
  const subjects = {
    DOWN: `🔴 [Uptiq] ${payload.websiteName} is DOWN`,
    RECOVERED: `🟢 [Uptiq] ${payload.websiteName} recovered`,
    SSL_EXPIRING: `⚠️ [Uptiq] SSL expiring in ${payload.daysRemaining} days — ${payload.websiteName}`,
  };

  const bodies = {
    DOWN: `<p><b>${payload.websiteName}</b> is down.</p><p>${payload.reason ?? ''}</p><p>URL: ${payload.websiteUrl}</p>`,
    RECOVERED: `<p><b>${payload.websiteName}</b> is back up.</p><p>URL: ${payload.websiteUrl}</p>`,
    SSL_EXPIRING: `<p>SSL certificate for <b>${payload.websiteName}</b> expires in <b>${payload.daysRemaining} days</b>.</p><p>URL: ${payload.websiteUrl}</p>`,
  };

  await emailTransporter.sendMail({
    from: process.env.SMTP_FROM ?? 'alerts@uptiq.dev',
    to,
    subject: subjects[payload.eventType],
    html: bodies[payload.eventType],
  });
}

export async function fireAlerts(payload: AlertPayload) {
  const website = await prismaclient.website.findUnique({
    where: { id: payload.websiteId },
    include: {
      user: {
        include: { alertChannels: { where: { isActive: true } } },
      },
    },
  });

  if (!website) return;

  const channels = website.user.alertChannels;
  if (!channels.length) return;

  await Promise.allSettled(
    channels.map(async (channel) => {
      const config = channel.config as Record<string, string>;

      const ok = await shouldFire(payload.websiteId, channel.id, payload.eventType);
      if (!ok) return;

      try {
        await sendEmail(config.to!, payload);

        await prismaclient.alertEvent.create({
          data: {
            websiteId: payload.websiteId,
            alertChannelId: channel.id,
            eventType: payload.eventType,
          },
        });

        console.log(`[alerts] fired ${payload.eventType} → EMAIL for ${payload.websiteId}`);
      } catch (err) {
        console.error(`[alerts] failed EMAIL for ${payload.websiteId}:`, err);
      }
    })
  );
}