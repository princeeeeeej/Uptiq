import { createClient } from 'redis';

const client = await createClient({
  url: process.env.REDIS_URL,
})
  .on('error', (err) =>
    console.error('Redis Client Error', err),
  )
  .connect();

export const CHECK_STREAM = 'uptiq:checks';
export const DB_WRITE_STREAM = 'uptiq:db-write';
export const FAILED_STREAM = 'uptiq:failed';

export type WebsiteEvent = {
  url: string;
  id: string;
};

export type StreamMessage<T = Record<string, string>> = {
  id: string;
  message: T;
};

export type DBWriteEvent = {
  websiteId: string;
  regionId: string;
  url: string;
  status: 'UP' | 'DOWN';
  statusCode: string;
  responseTimeMs: string;
  errorMessage: string;
  checkedAt: string;
};

export async function xAdd(
  stream: string,
  data: Record<string, string>,
) {
  await client.xAdd(stream, '*', data);
}

export async function xAddBulk(
  stream: string,
  events: Record<string, string>[],
) {
  await Promise.all(
    events.map((event) => xAdd(stream, event)),
  );
}

export async function xReadGroup<T>(
  stream: string,
  consumerGroup: string,
  workerId: string,
  count = 5,
): Promise<StreamMessage<T>[] | undefined> {
  const res = await client.xReadGroup(
    consumerGroup,
    workerId,
    {
      key: stream,
      id: '>',
    },
    {
      COUNT: count,
      BLOCK: 5000,
    },
  );

  return res?.[0]
    ?.messages as StreamMessage<T>[] | undefined;
}

export async function xAck(
  stream: string,
  consumerGroup: string,
  eventId: string,
) {
  await client.xAck(
    stream,
    consumerGroup,
    eventId,
  );
}

export async function xAckBulk(
  stream: string,
  consumerGroup: string,
  eventIds: string[],
) {
  await Promise.all(
    eventIds.map((id) =>
      xAck(stream, consumerGroup, id),
    ),
  );
}

export async function xCreateGroup(
  stream: string,
  consumerGroup: string,
) {
  try {
    await client.xGroupCreate(
      stream,
      consumerGroup,
      '0',
      {
        MKSTREAM: true,
      },
    );
  } catch (err: any) {
    if (
      !err?.message?.includes('BUSYGROUP')
    ) {
      throw err;
    }
  }
}

export async function reclaimStuck(
  stream: string,
  consumerGroup: string,
  workerId: string,
  minIdleMs = 60_000,
  count = 10,
) {
  const pending =
    await client.xPendingRange(
      stream,
      consumerGroup,
      '-',
      '+',
      count,
    );

  if (!pending.length) {
    return [];
  }

  const stuckIds = pending
    .filter(
      (p) =>
        p.millisecondsSinceLastDelivery >=
        minIdleMs,
    )
    .map((p) => p.id);

  if (!stuckIds.length) {
    return [];
  }

  return client.xClaim(
    stream,
    consumerGroup,
    workerId,
    minIdleMs,
    stuckIds,
  );
}

export async function xAddToDLQ(
  payload: Record<string, string>,
) {
  await xAdd(FAILED_STREAM, {
    ...payload,
    failedAt: Date.now().toString(),
  });
}
