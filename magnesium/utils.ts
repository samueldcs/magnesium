export function withoutKey(key: any, obj: Record<any, any>) {
	const { [key]: _, ...rest } = obj;
	return { ...rest };
}