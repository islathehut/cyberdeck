import type { Debugger } from 'debug';

export enum InstallStatus {
  INSTALLED = 'INSTALLED',
  UNINSTALLED = 'UNINSTALLED',
  UNKNOWN = 'UNKNOWN',
}

export enum InstallMode {
  REAL = 'REAL',
  TEST = 'TEST',
  DRY = 'DRY',
}

export interface Logger {
  log: Debugger;
  error: Debugger;
}

export interface RuntimeOptions {
  verbose?: true | undefined;
  installMode: InstallMode;
}

export interface CopyOverride {
  in: string;
  out: string;
}

export interface NexusModsAuthor {
  name: string;
  displayName: string;
  memberId: number;
  memberGroupId: number;
}

export interface NexusModsModMetadata {
  name: string;
  summary: string;
  pictureUrl: string;
  uid: number;
  modId: number;
  gameId: number;
  version: string;
  createdAt: number;
  modifiedAt: number;
  nsfw: boolean;
  available: boolean;
  author: NexusModsAuthor;
}

export interface NexusModsFileMetadata {
  id: number;
  uid: number;
  name: string;
  version: string;
  isPrimary: boolean;
  fileName: string;
  description: string;
  uploadedAt: number;
}

export interface NexusModsMetadata {
  mod: NexusModsModMetadata;
  file: NexusModsFileMetadata;
}

export interface Mod {
  uuid: string;
  filename: string;
  path: string;
  checksum: string;
  status: InstallStatus;
  blockUuid?: string | null;
  name: string;
  description?: string | null;
  copyOverrides: CopyOverride[];
  skip: boolean;
  createdAt: number;
  modifiedAt: number;
  installedAt?: number | null;
  nexusMetadata?: NexusModsMetadata | null;
}

export interface Block {
  uuid: string;
  installOrder: string[];
  installed: boolean;
  installedAt?: number | null;
  createdAt: number;
  modifiedAt: number;
}

export interface Config {
  modsDirPath: string;
  installDirPath: string;
  dbDataDirPath: string;
  modifiedAt: number;
  latestModLoadedMs: number;
  nexusModsApiKey?: string;
}

export interface UnpackResult {
  mergedDir: string;
  count: number;
  blockUuid: string;
}

export interface SearchResult<T> {
  acknowledged: boolean;
  message: string;
  results?: Record<string, T[]>;
}

export interface FindResult<T> {
  acknowledged: boolean;
  message: string;
  results?: T;
}

export interface RemoveResult<T> {
  acknowledged: boolean;
  message: string;
  results?: T;
}

export interface NexusModsUser {
  userId: number;
  key: string;
  name: string;
  isPremium: boolean;
  isSupporter: boolean;
  email: string;
  profileUrl: string;
}
