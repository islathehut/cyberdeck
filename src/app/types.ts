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

export type BaseMod = {
  fileName: string
  filePath: string
  checksum: string
  status: InstallStatus
  blockUuid?: string
  pauseAfterInstall?: boolean
  name?: string
  copyOverrides?: CopyOverride[]
  skip?: boolean
}

export type UninstalledMod = BaseMod & {
  name: string
  status: InstallStatus.UNINSTALLED
}

export type InstalledMod = BaseMod & {
  modifiedAt: number
  name: string
  blockUuid: string
  status: InstallStatus.INSTALLED
}

export type GetModsOptions = {
  status?: InstallStatus
  blockUuid?: string
}

export type InstalledModsByBlock = {
  [blockUuid: string]: InstalledMod[]
}

export type InstalledModsByChecksum = { 
  [checksum: string]: InstalledMod 
}

export type GetModsResult = {
  installed: InstalledModsByBlock
  uninstalled: BaseMod[]
}

export type CachedMods = GetModsResult & {
  uninstalled: UninstalledMod[]
}

export type Block = {
  uuid: string
  modChecksums: string[]
  installed: boolean
  installedAt?: number
}

export type InstallOrder = {
  [blockUuid: string]: string[]
}

export type Config = {
  modsDirPath: string
  installDirPath: string
  installedMods: InstalledModsByChecksum
  uninstalledMods: UninstalledMod[]
  installOrder: InstallOrder
  blocks: Block[]
  modifiedAt: number
}

export type UnpackResult = { 
  mergedDir: string
  count: number
  blockUuid: string
}