import { RedisClientType } from '@redis/client';
import {MagnesiumContext, ObsidianFileChange} from '../main';

export const modify = async (file: ObsidianFileChange, context: MagnesiumContext, client: RedisClientType): Promise<MagnesiumContext> => {
	const newFile = { content: file.content, path: file.path, fileVersion: context[file.path].fileVersion + 1 }
	const { [file.path]: _, ...contextWithoutOldFile} = context
	await client.set(newFile.path, JSON.stringify(newFile))
	return {...contextWithoutOldFile, [file.path]: newFile}
}
