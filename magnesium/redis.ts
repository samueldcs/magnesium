import { createClient, RedisClientType } from '@redis/client';

export async function getClient(): Promise<RedisClientType> {
    const client: RedisClientType = createClient({
        url: "redis://yourstring"
    })
    await client.connect();

    return client;
}