import { parseFile } from 'music-metadata'
import fs from 'fs/promises'
import path from 'path'
import { getProcessedPath, getUploadPath } from './storage'

export interface AudioMetadata {
  duration: number
  title?: string
  artist?: string
  album?: string
  genre?: string
  year?: number
}

export async function extractMetadata(filePath: string): Promise<AudioMetadata> {
  try {
    const metadata = await parseFile(filePath)
    
    return {
      duration: Math.round(metadata.format.duration || 0),
      title: metadata.common.title || undefined,
      artist: metadata.common.artist || undefined,
      album: metadata.common.album || undefined,
      genre: metadata.common.genre?.[0] || undefined,
      year: metadata.common.year || undefined,
    }
  } catch (error) {
    console.error('Error extracting metadata:', error)
    return {
      duration: 0,
    }
  }
}

export async function processAudioFile(
  originalPath: string,
  songId: string
): Promise<{ processedPath: string; metadata: AudioMetadata }> {
  // In a production app, you would convert the audio to a specific format here
  // For now, we'll just copy the file and extract metadata
  
  const extension = path.extname(originalPath)
  const processedFilename = `${songId}${extension}`
  const processedPath = getProcessedPath(processedFilename)
  
  // Copy file to processed directory
  await fs.copyFile(originalPath, processedPath)
  
  // Extract metadata
  const metadata = await extractMetadata(originalPath)
  
  return {
    processedPath,
    metadata,
  }
}
