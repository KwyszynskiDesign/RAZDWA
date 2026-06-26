import type { PriceDataSource } from './core/contracts/PriceDataSource';
import type { CategoryRegistry } from './core/contracts/CategoryRegistry';
import { JsonPriceSource } from './infrastructure/adapters/JsonPriceSource';
import { LocalStorageOverrideSource } from './infrastructure/adapters/LocalStorageOverrideSource';
import { DefaultCategoryRegistry } from './domain/CategoryRegistry';

type RootGetter = () => unknown;
let _rootGetter: RootGetter = () => ({});

export function initPriceRoot(getter: RootGetter): void {
  _rootGetter = getter;
}

const PRICES_STORAGE_KEY = 'razdwa_prices';

const _jsonSource = new JsonPriceSource(() => _rootGetter());

export const priceSource: PriceDataSource = new LocalStorageOverrideSource(
  _jsonSource,
  PRICES_STORAGE_KEY,
);

export const categoryRegistry: CategoryRegistry = new DefaultCategoryRegistry();
