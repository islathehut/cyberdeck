import chalk from 'chalk'

import Seven from 'node-7z'
import * as unrar from 'node-unrar-js'
import JSZip, { JSZipObject } from "jszip"

import * as fs from 'node:fs/promises';
import * as path from "path"

import { sleep } from '../../utils/util.js'
import { createSimpleModuleLogger } from '../../utils/logger.js'

const LOGGER = createSimpleModuleLogger('mods:extract')

const ZIP_EXT = new Set<string>(['.zip'])
const RAR_EXT = new Set<string>(['.rar'])
const SEVENZ_EXT = new Set<string>(['.7z', '.7zip'])

const extractZipArchiveToTempDir = async (filePath: string, tempDirPath: string) => {
  LOGGER.log(`Extracting zip file ${filePath}`)
  const data = await fs.readFile(filePath)
  const extracted = await JSZip.loadAsync(data, { createFolders: true })
  const files: JSZipObject[] =[]
  extracted.forEach(async (subPath: string, file: JSZipObject) => {
    if (file.dir) {
      const subDirPath = path.join(tempDirPath, subPath)
      LOGGER.log(`Writing sub directory ${subPath} to ${subDirPath}`)
      await fs.mkdir(subDirPath, { recursive: true })
    } else {
      files.push(file)
    }
  })
  for (const file of files) {
    const subFilePath = path.join(tempDirPath, file.name)
    LOGGER.log(`Writing sub file ${file.name} to ${subFilePath}`)
    const value = await file.async('nodebuffer')
    await fs.writeFile(path.join(tempDirPath, file.name), value)
  }
}

const extractRarArchiveToTempDir = async (filePath: string, tempDirPath: string) => {
  LOGGER.log(`Extracting rar file ${filePath}`)
  const buf = Uint8Array.from(await fs.readFile(filePath)).buffer
  const extractor = await unrar.createExtractorFromData({ data: buf })
  const extracted = extractor.extract()
  const files: unrar.ArcFile<any>[] = []
  const dirs: string[] = []

  for (const file of extracted.files) {
    if (file.fileHeader.flags.directory) {
      dirs.push(file.fileHeader.name)
    } else {
      if (file.extraction == null) {
        throw new Error(`Found a file with no data: ${file.fileHeader.name}`)
      }
  
      files.push(file)
    }
  }

  dirs.sort((a, b) =>  a.split('/').length - b.split('/').length)
  for (const dir of dirs) {
    const subDirPath = path.join(tempDirPath, dir)
    LOGGER.log(`Writing sub directory ${dir} to ${subDirPath}`)
    await fs.mkdir(subDirPath)
  }

  for (const file of files) {
    const subFilePath = path.join(tempDirPath, file.fileHeader.name)
    LOGGER.log(`Writing sub file ${file.fileHeader.name} to ${subFilePath}`)
    await fs.writeFile(subFilePath, file.extraction!)
  }
}

const extract7zArchiveToTempDir = async (filePath: string, tempDirPath: string, ext: string) => {
  LOGGER.log(`Extracting ${ext} file with path ${filePath}`)
  let done = false
  Seven.extractFull(
    filePath, 
    tempDirPath, 
    { 
      recursive: true, 
      fullyQualifiedPaths: true, 
      $progress: true
    })
    .on("error", (err) => LOGGER.error(chalk.redBright(`Error ocurred while extracting ${ext} file using 7zip`), err))
    .on('end', () => {
      done = true
    })

    while (!done) {
      // process.stdout.write('.')
      await sleep(1000)
    }
    // process.stdout.write('\n')
    return
}

export const extractArchiveToTempDir = async (filePath: string, tempDirPath: string) => {
  const ext = path.extname(filePath)
  if (!RAR_EXT.has(ext)) {
    return extract7zArchiveToTempDir(filePath, tempDirPath, ext)
  }

  LOGGER.log(chalk.dim.yellow(`Using native extraction method for extension ${ext}`))
  if (ZIP_EXT.has(ext)) {
    return extractZipArchiveToTempDir(filePath, tempDirPath)
  } else if (RAR_EXT.has(ext)) {
    return extractRarArchiveToTempDir(filePath, tempDirPath)
  } else if (SEVENZ_EXT.has(ext)) {
    return extract7zArchiveToTempDir(filePath, tempDirPath, ext)
  } else {
    LOGGER.error(chalk.redBright(`Unknown extension ${ext}`))
  }

  return
}