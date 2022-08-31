import { RedisClientType } from '@redis/client';
import { withoutKey } from 'utils';
import {MagnesiumContext, ObsidianFileChange} from '../main';

export const rename = async (file: ObsidianFileChange, context: MagnesiumContext, client: RedisClientType): Promise<MagnesiumContext> => {
	const otherFiles = withoutKey(file.oldPath, context)
	await client.rename(file.oldPath!, file.path)
	return {...otherFiles, [file.path]: { content: file.content, fileVersion: 0 }};
};

