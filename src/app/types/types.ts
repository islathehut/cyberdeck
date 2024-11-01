import type { Debugger } from "debug"

export enum InstallStatus {
  INSTALLED = 'INSTALLED',
  UNINSTALLED = 'UNINSTALLED',
  UNKNOWN = 'UNKNOWN'
}

export interface Logger {
  log: Debugger
  error: Debugger
}

export interface CLIOptions {
  verbose?: true | undefined
  dry?: true | undefined
  test?: true | undefined
}

export interface CopyOverride {
  in: string
  out: string
}

export interface Mod {
  uuid: string
  filename: string
  path: string
  checksum: string
  status: InstallStatus
  blockUuid?: string | null
  name: string
  copyOverrides: CopyOverride[]
  skip: boolean
  createdAt: number
  modifiedAt: number
  installedAt?: number | null
}

export interface Block {
  uuid: string
  installOrder: string[]
  installed: boolean
  installedAt?: number | null
  createdAt: number
  modifiedAt: number
}

export interface Config {
  modsDirPath: string
  installDirPath: string
  dbDataDirPath: string
  modifiedAt: number
}

export interface UnpackResult { 
  mergedDir: string
  count: number
  blockUuid: string
}

export interface SearchResult<T> {
  acknowledged: boolean
  message: string
  results?: Record<string, T[]>
}

export interface FindResult<T> {
  acknowledged: boolean
  message: string
  results?: T
}