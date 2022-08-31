import { Plugin, TFile } from 'obsidian';
import { create } from './events/create';
import { deleteFile } from './events/delete';
import { modify } from './events/modify';
import { rename } from './events/rename';
import { readFile, writeFile } from 'fs';
import { RedisClientType } from '@redis/client';
import { getClient as getRedisClient } from 'redis';
import { withoutKey } from 'utils';

export default class Magnesium extends Plugin {

	context: MagnesiumContext = {};
	readonly localContextFile = 'context.json';

	async onload() {
		const redisClient = await getRedisClient();
		await this.syncRemoteContext(redisClient);

		this.watchForContextChanges(redisClient);
	}

	async syncRemoteContext(client: RedisClientType) {
		readFile(this.localContextFile, 'utf8', async (_, data) => {
			
			let temporaryLocalContext: MagnesiumContext = JSON.parse(data)
			const remoteContext: MagnesiumContext = {}

			for await (const key of client.scanIterator()) {
				const remoteFile = await client.get(key).then(redisEntry => JSON.parse(redisEntry!) as MagnesiumFileData);
				const localSnapshot: MagnesiumFileData = temporaryLocalContext[key];

				if (!localSnapshot) {
					app.vault.create(key, remoteFile.content!)
				}
				if (localSnapshot.fileVersion !== remoteFile.fileVersion) {
					const oldFile = app.vault.getAbstractFileByPath(key) as TFile;
					app.vault.modify(oldFile, remoteFile.content!)
				}

				remoteContext[key] = remoteFile
				temporaryLocalContext = withoutKey(key, temporaryLocalContext);
			}

			this.deleteLocalFilesAbsentInRemoteContext(temporaryLocalContext);
			this.context = remoteContext
		})
	}

	private deleteLocalFilesAbsentInRemoteContext(temporaryContext: MagnesiumContext) {
		Object.keys(temporaryContext).forEach(key => app.vault.delete(
			app.vault.getAbstractFileByPath(key) as TFile
		));
	}

	private async watchForContextChanges(client: RedisClientType) {
		const strategiesByEvent = {
			'create': create,
			'delete': deleteFile,
			'modify': modify,
			'rename': rename,
		};
		Object.keys(strategiesByEvent).forEach(event => {
			// @ts-ignore
			this.registerEvent(this.app.vault.on(event, (obsidianFile, oldObsidianFilePath) => {
				if(obsidianFile instanceof TFile) {
					// @ts-ignore
					this.handleEvent(obsidianFile, oldObsidianFilePath, event, client, strategiesByEvent[event]);
				}
			}))
		});
	}

	private handleEvent(obsidianFile: TFile, oldObsidianFilePath: string, event: string, client: RedisClientType, handler: any): void {
		app.vault.cachedRead(obsidianFile).then(async (eventFile) => {
			const fileChange: ObsidianFileChange = {
				path: obsidianFile.path,
				oldPath: oldObsidianFilePath,
				content: eventFile
			};
			// @ts-ignore
			const updatedContext = await handler(fileChange, this.context, client);
			this.updateContext(updatedContext);
		});
	}

	private updateContext(updatedContext: any) {
		this.context = updatedContext;
		writeFile('context.json', JSON.stringify(updatedContext), _ => _)
	}

	onunload() {

	}
}

export interface MagnesiumFileData {
	content: string | null,
	fileVersion: number,
}

export interface ObsidianFileChange {
	path: string,
	oldPath: string | null,
	content: string | null,
}

export interface MagnesiumContext {
	[fileName: string]: MagnesiumFileData;
}
