import { createClient } from "redis";

const client = await createClient()
    .on("error", (err) => console.log("Redis Client Error", err))
    .connect()

type WebsiteEvent = {
    url: string,
    id: string
}

type MessageType = {
    id: string,
    message: {
        url: string,
        id: string
    }
}

const STREAM_NAME = "betteruptime:website"

export async function xAdd({url, id}: WebsiteEvent){
    await client.xAdd(
        "betteruptime:website", "*", {
            url,
            id
        }
    )
}

export async function xAddBulk(websites: WebsiteEvent[]){
    for(let i=0;i<websites.length;i++){
        await xAdd({
            url: websites[i]!.url,
            id: websites[i]!.id
        })
    }
}

export async function xReadGroup(consumerGroup: string, workerId: string): Promise<MessageType[] | undefined>{
    const res = await client.xReadGroup(
        consumerGroup, workerId, {
            key: STREAM_NAME,
            id: '>'
        },{
            'COUNT': 5
        }
    )
    console.log("Redis returned:", res);
    let messages : MessageType[] | undefined = res?.[0]?.messages;
    return messages;
}

export async function xAck(consumerGroup: string, eventId:string) {
    const res = await client.xAck(STREAM_NAME, consumerGroup, eventId)
}

export async function xAckBulk(consumerGroup: string, eventIds: string[]){
    eventIds.map(eventId => xAck(consumerGroup, eventId) )
}