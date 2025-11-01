import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const userId = await getAuthUser(request)
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const playlists = await prisma.playlist.findMany({
      where: { userId },
      include: {
        songs: {
          include: {
            song: {
              select: {
                id: true,
                title: true,
                artist: true,
                album: true,
                duration: true,
                status: true,
              },
            },
          },
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ playlists })
  } catch (error) {
    console.error('Get playlists error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getAuthUser(request)
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { name, description } = await request.json()

    if (!name) {
      return NextResponse.json(
        { error: 'Playlist name is required' },
        { status: 400 }
      )
    }

    const playlist = await prisma.playlist.create({
      data: {
        name,
        description: description || null,
        userId,
      },
    })

    return NextResponse.json({ playlist })
  } catch (error) {
    console.error('Create playlist error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
