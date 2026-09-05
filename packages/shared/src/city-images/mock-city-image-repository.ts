import type { CityImageRepository } from './types';

/** No demo photos — the mock intentionally mirrors "nothing configured yet". */
export class MockCityImageRepository implements CityImageRepository {
  async listAll() {
    return {};
  }
}
