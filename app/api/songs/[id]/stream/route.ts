import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'
import fs from 'fs'
import path from 'path'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getAuthUser(request)
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const song = await prisma.song.findFirst({
      where: {
        id: params.id,
        userId,
        status: 'READY',
      },
    })

    if (!song || !song.filePath) {
      return NextResponse.json(
        { error: 'Song not found or not ready' },
        { status: 404 }
      )
    }

    // Check if file exists
    if (!fs.existsSync(song.filePath)) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      )
    }

    const stat = fs.statSync(song.filePath)
    const fileSize = stat.size
    const range = request.headers.get('range')

    if (range) {
      // Handle range requests for streaming
      const parts = range.replace(/bytes=/, '').split('-')
      const start = parseInt(parts[0], 10)
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1
      const chunksize = end - start + 1
      const file = fs.createReadStream(song.filePath, { start, end })
      const head = {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': 'audio/mpeg',
      }

      return new NextResponse(file as any, {
        status: 206,
        headers: head,
      })
    } else {
      // Return entire file
      const file = fs.createReadStream(song.filePath)
      const head = {
        'Content-Length': fileSize,
        'Content-Type': 'audio/mpeg',
      }

      return new NextResponse(file as any, {
        status: 200,
        headers: head,
      })
    }
  } catch (error) {
    console.error('Stream error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
