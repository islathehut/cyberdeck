/**
 * API Documentation: 
 *    - https://app.swaggerhub.com/apis/NexusMods/nexus-mods_public_api_params_in_form_data/1.0
 *    - https://app.swaggerhub.com/apis-docs/NexusMods/nexus-mods_public_api_params_in_form_data/1.0
 */

import axios, { type Axios } from 'axios';
import type { ModMetadataResponse, Path, PathMethod, RequestParams, ResponseType, UserValidateResponse } from '../../types/nexusMods/nexusMods.api.types.js';
import { NEXUS_MODS_API_APIKEY_HEADER, NEXUS_MODS_API_BASE_URL, NEXUS_MODS_API_GAME_DOMAIN_NAME } from '../../const.js';
import { ConfigManager } from '../../config/config.manager.js';
import type { Logger } from '../../types/types.js';
import { createSimpleModuleLogger } from '../../../utils/logger.js';

export class NexusModsAPI {
  private static readonly _instance: NexusModsAPI = new NexusModsAPI();
  private readonly _api: Axios;
  private readonly _logger: Logger = createSimpleModuleLogger('nexus-mods:api');

  private constructor() {
    this._api = axios.create({
      baseURL: NEXUS_MODS_API_BASE_URL
    });
  }

  public async getUser(): Promise<UserValidateResponse> {
    this._logger.log(`Getting user information from Nexus Mods`);
    const response = await this.callApi('/v1/users/validate.json', 'get', {});
    return response;
  }

  public async getModByChecksum(checksum: string): Promise<ModMetadataResponse[]> {
    this._logger.log(`Getting mod information for checksum ${checksum}`);
    const response = await this.callApi('/v1/games/{game_domain_name}/mods/md5_search/{md5_hash}.json', 'get', {
      path: {
        md5_hash: checksum,
        game_domain_name: NEXUS_MODS_API_GAME_DOMAIN_NAME
      }
    });

    if (response.length === 0) {
      this._logger.error(`Failed to find mod for checksum ${checksum} on nexus mods!`);
    }

    return response;
  }

  private async callApi<P extends Path, M extends PathMethod<P>, T>(
    url: P,
    method: M,
    ...params: RequestParams<P, M> extends undefined ? [] : [RequestParams<P, M>]
  ): Promise<ResponseType<P, M, T>> {
    const {
      path: pathParams
    } = params[0]?.path != null ? params[0] : { path: {} }

    const response = await this._api.request({
      method: method as string,
      url: NexusModsAPI._convertUrlWithNamedParams(url, pathParams),
      params,
      headers: {
        [NEXUS_MODS_API_APIKEY_HEADER]: ConfigManager.manager.config.nexusModsApiKey
      }
    });

    if (response.status !== 200) {
      throw new Error(`Error occurred while calling ${response.config.url}: ${response.statusText}`)
    }

    return response.data as ResponseType<P, M, T>;
  }

  private static _convertUrlWithNamedParams(url: string, pathParams: Record<string, string | number | boolean | null>): string {
    const REGEX = /(?<=\{)[^{\\}]+(?=\})/g;
    const results = [...url.matchAll(REGEX)].flat();
    const malformed: string[] = [];
    let formatted = url;
    for (const result of results) {
      if (pathParams[result] != null) {
        formatted = formatted.replaceAll(`{${result}}`, `${pathParams[result]}`);
      } else {
        malformed.push(result)
      }
    }

    if (malformed.length > 0) {
      throw new Error(`Malformed request: the path params ${JSON.stringify(malformed)} were found in the URL but had no matching values in pathParams`);
    }

    return formatted;
  }
  

  public static get api(): NexusModsAPI {
    return this._instance;
  }
}