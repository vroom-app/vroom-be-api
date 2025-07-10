import { Injectable, Logger } from '@nestjs/common';
import { SearchBusinessPayload, SearchClient } from './search-client.interface';
import axios from 'axios';

@Injectable()
export class SearchClientService implements SearchClient {
  private readonly logger = new Logger(SearchClientService.name);
  private readonly http = axios.create({
    baseURL: process.env.SEARCH_ENGINE_URL,
    timeout: 5000,
  });

  async upsertBusiness(payload: SearchBusinessPayload): Promise<void> {
    try {
      this.logger.debug(`Upserted business ${JSON.stringify(payload)}`);

      await this.http.put('/search/businesses/sync', payload);
      this.logger.debug(`Upserted business ${payload.id}`);
    } catch (err: any) {
      this.logger.error(
        `Failed to upsert business ${payload.id}: ${err.message}`,
      );
      throw err;
    }
  }
}