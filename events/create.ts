import { RedisClientType } from '@redis/client';
import {MagnesiumContext, MagnesiumFileData, ObsidianFileChange} from '../main';

export const create = (file: ObsidianFileChange, context: MagnesiumContext, client: RedisClientType): MagnesiumContext => {
	const updatedFile: MagnesiumFileData = { fileVersion: 0, content: file.content }
	client.set(file.path, JSON.stringify(updatedFile))
	return {...context, [file.path]: updatedFile}
}
