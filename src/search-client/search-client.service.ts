import { Injectable, Logger } from '@nestjs/common';
import { SearchBusinessPayload } from './search-client.interface';
import axios from 'axios';

@Injectable()
export class SearchClientService {
  private readonly logger = new Logger(SearchClientService.name);
  private readonly http = axios.create({
    baseURL: process.env.SEARCH_ENGINE_URL,
    timeout: 5000,
  });

  /**
   * Upsert a business in the search engine. The service api ensures that payload includes the id of the business.
   * @param payload 
   */
  async upsertBusiness(payload: SearchBusinessPayload): Promise<void> {
    await this.http.put('/search/businesses/sync', payload);
    this.logger.debug(`Upserted business ${payload.id}`);
  }
}