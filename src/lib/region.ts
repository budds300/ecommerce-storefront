import { sdk } from './sdk';

let cachedRegionId: string | null = null;

export async function getRegionId(): Promise<string | undefined> {
  if (cachedRegionId) return cachedRegionId;
  const { regions } = await sdk.store.region.list().catch(() => ({ regions: [] }));
  if (regions[0]) {
    cachedRegionId = regions[0].id;
    return cachedRegionId;
  }
  return undefined;
}
