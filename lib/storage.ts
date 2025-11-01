import fs from 'fs/promises'
import path from 'path'
import { mkdir } from 'fs/promises'

const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads'
const PROCESSED_DIR = process.env.PROCESSED_DIR || './processed'

export async function ensureDirectories() {
  await mkdir(UPLOAD_DIR, { recursive: true })
  await mkdir(PROCESSED_DIR, { recursive: true })
}

export function getUploadPath(filename: string): string {
  return path.join(UPLOAD_DIR, filename)
}

export function getProcessedPath(filename: string): string {
  return path.join(PROCESSED_DIR, filename)
}

export async function saveFile(buffer: Buffer, filepath: string): Promise<void> {
  await ensureDirectories()
  await fs.writeFile(filepath, buffer)
}

export async function deleteFile(filepath: string): Promise<void> {
  try {
    await fs.unlink(filepath)
  } catch (error) {
    // File might not exist, ignore error
  }
}
