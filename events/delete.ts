import { RedisClientType } from '@redis/client';
import { withoutKey } from 'utils';
import {MagnesiumContext, MagnesiumFileData, ObsidianFileChange} from '../main';

export const deleteFile = async (file: ObsidianFileChange, context: MagnesiumContext, client: RedisClientType): Promise<MagnesiumContext> => {
	await client.del(file.path)
	return withoutKey(file.path, context)
};
