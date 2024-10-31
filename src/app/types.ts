export type CLIOptions = {
  verbose?: true | undefined
  dry?: true | undefined
  test?: true | undefined
}

export enum InstallStatus {
  INSTALLED = 'INSTALLED',
  UNINSTALLED = 'UNINSTALLED',
  UNKNOWN = 'UNKNOWN'
}

export type CopyOverride = {
  in: string
  out: string
}

export type Mod = {
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

export type Block = {
  uuid: string
  installOrder: string[]
  installed: boolean
  installedAt?: number | null
  createdAt: number
  modifiedAt: number
}

export type Config = {
  modsDirPath: string
  installDirPath: string
  dbDataDirPath: string
  modifiedAt: number
}

export type UnpackResult = { 
  mergedDir: string
  count: number
  blockUuid: string
}