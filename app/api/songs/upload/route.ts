import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'
import { getUploadPath, saveFile } from '@/lib/storage'
import { queue } from '@/lib/queue'
import { randomUUID } from 'crypto'

export const runtime = 'nodejs'
export const maxDuration = 300 // 5 minutes for large file uploads

export async function POST(request: NextRequest) {
  try {
    const userId = await getAuthUser(request)
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file type
    if (!file.type.startsWith('audio/')) {
      return NextResponse.json(
        { error: 'File must be an audio file' },
        { status: 400 }
      )
    }

    // Read file buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Generate unique filename
    const extension = file.name.split('.').pop() || 'mp3'
    const filename = `${randomUUID()}.${extension}`
    const uploadPath = getUploadPath(filename)

    // Save file
    await saveFile(buffer, uploadPath)

    // Create song record
    const song = await prisma.song.create({
      data: {
        title: file.name.replace(/\.[^/.]+$/, ''), // Remove extension
        originalPath: uploadPath,
        filePath: '', // Will be set after processing
        fileSize: buffer.length,
        status: 'PROCESSING',
        userId,
      },
    })

    // Queue background processing
    await queue.add('process-audio', {
      originalPath: uploadPath,
      songId: song.id,
    })

    return NextResponse.json({
      message: 'File uploaded successfully',
      song: {
        id: song.id,
        title: song.title,
        status: song.status,
      },
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}