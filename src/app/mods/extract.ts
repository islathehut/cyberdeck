import * as fs from 'fs'
import * as path from "path"

import Seven from 'node-7z'
import * as unrar from 'node-unrar-js'
import JSZip, { JSZipObject } from "jszip"
import { sleep } from '../../utils/util.js'


const ZIP_EXT = new Set<string>(['.zip'])
const RAR_EXT = new Set<string>(['.rar'])
const SEVENZ_EXT = new Set<string>(['.7z', '.7zip'])

const extractZipArchiveToTempDir = async (filePath: string, tempDirPath: string) => {
  console.log(`Extracting zip file ${filePath}`)
  const data = fs.readFileSync(filePath)
  const extracted = await JSZip.loadAsync(data, { createFolders: true })
  const files: JSZipObject[] =[]
  extracted.forEach((subPath: string, file: JSZipObject) => {
    if (file.dir) {
      const subDirPath = path.join(tempDirPath, subPath)
      console.log(`Writing sub directory ${subPath} to ${subDirPath}`)
      fs.mkdirSync(subDirPath, { recursive: true })
    } else {
      files.push(file)
    }
  })
  for (const file of files) {
    const subFilePath = path.join(tempDirPath, file.name)
    console.log(`Writing sub file ${file.name} to ${subFilePath}`)
    const value = await file.async('nodebuffer')
    fs.writeFileSync(path.join(tempDirPath, file.name), value)
  }
}

const extractRarArchiveToTempDir = async (filePath: string, tempDirPath: string) => {
  console.log(`Extracting rar file ${filePath}`)
  const buf = Uint8Array.from(fs.readFileSync(filePath)).buffer
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
    console.log(`Writing sub directory ${dir} to ${subDirPath}`)
    fs.mkdirSync(subDirPath)
  }

  for (const file of files) {
    const subFilePath = path.join(tempDirPath, file.fileHeader.name)
    console.log(`Writing sub file ${file.fileHeader.name} to ${subFilePath}`)
    fs.writeFileSync(subFilePath, file.extraction!)
  }
}

const extract7zArchiveToTempDir = async (filePath: string, tempDirPath: string, ext: string) => {
  console.log(`Extracting ${ext} file with path ${filePath}`)
  let done = false
  Seven.extractFull(
    filePath, 
    tempDirPath, 
    { 
      recursive: true, 
      fullyQualifiedPaths: true, 
      $progress: true
    })
    .on("error", (err) => console.error(`Error ocurred while extracting ${ext} file using 7zip`, err))
    .on('end', () => {
      done = true
    })

    while (!done) {
      process.stdout.write('.')
      await sleep(1000)
    }
    process.stdout.write('\n')
    return
}

export const extractArchiveToTempDir = async (filePath: string, tempDirPath: string) => {
  const ext = path.extname(filePath)
  if (!RAR_EXT.has(ext)) {
    await extract7zArchiveToTempDir(filePath, tempDirPath, ext)
    return
  }

  console.warn(`Using native extraction method for extension ${ext}`)
  if (ZIP_EXT.has(ext)) {
    await extractZipArchiveToTempDir(filePath, tempDirPath)
  } else if (RAR_EXT.has(ext)) {
    await extractRarArchiveToTempDir(filePath, tempDirPath)
  } else if (SEVENZ_EXT.has(ext)) {
    await extract7zArchiveToTempDir(filePath, tempDirPath, ext)
  } else {
    console.error(`Unknown extension ${ext}`)
  }
}