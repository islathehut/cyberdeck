import type { paths } from './nexusMods.api.autogen.types.js';

/**
 * Response types
 */

export interface UserValidateResponse {
  user_id: number;
  key: string;
  name: string;
  is_premium: boolean;
  'is_premium?': boolean;
  is_supporter: boolean;
  'is_supporter?': boolean;
  email: string;
  profile_url: string;
}

export interface ModMetadataResponse {
  mod: {
    name: string;
    summary: string;
    description: string;
    picture_url: string;
    mod_downloads: number;
    mod_unique_downloads: number;
    uid: number;
    mod_id: number;
    game_id: number;
    allow_rating: boolean;
    domain_name: 'cyberpunk2077';
    category_id: number;
    version: string;
    endorsement_count: number;
    created_timestamp: number;
    created_time: string;
    updated_timestamp: number;
    updated_time: string;
    author: string;
    uploaded_by: string;
    uploaded_users_profile_url: string;
    contains_adult_content: boolean;
    status: string;
    available: boolean;
    user: {
      member_id: number;
      member_group_id: number;
      name: string;
    };
    endorsement: {
      endorse_status: string;
      timestamp: number | null;
      version: string | number | null;
    } | null;
  };
  file_details: {
    id: number[];
    uid: number;
    file_id: number;
    name: string;
    version: string;
    category_id: number;
    category_name: string;
    is_primary: boolean;
    size: number;
    file_name: string;
    uploaded_timestamp: number;
    uploaded_time: string;
    mod_version: string;
    external_virus_scan_url: string;
    description: string;
    size_kb: number;
    size_in_bytes: number;
    changelog_html: string | null;
    content_preview_link: string;
    md5: string;
  };
}

/**
 * Helper types
 */

export type Path = keyof paths;
export type PathMethod<T extends Path> = keyof paths[T];
export type RequestParams<P extends Path, M extends PathMethod<P>> = paths[P][M] extends {
  parameters: Record<string, Record<string, string | number | boolean | null>>;
}
  ? paths[P][M]['parameters']
  : undefined;
export type ResponseType<P extends Path, M extends PathMethod<P>, T> = paths[P][M] extends {
  responses: { 200: { schema: T } };
}
  ? paths[P][M]['responses'][200]['schema']
  : undefined;
