import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

export async function POST(
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

    const { songId } = await request.json()

    if (!songId) {
      return NextResponse.json(
        { error: 'Song ID is required' },
        { status: 400 }
      )
    }

    // Verify playlist belongs to user
    const playlist = await prisma.playlist.findFirst({
      where: {
        id: params.id,
        userId,
      },
    })

    if (!playlist) {
      return NextResponse.json(
        { error: 'Playlist not found' },
        { status: 404 }
      )
    }

    // Verify song belongs to user
    const song = await prisma.song.findFirst({
      where: {
        id: songId,
        userId,
      },
    })

    if (!song) {
      return NextResponse.json(
        { error: 'Song not found' },
        { status: 404 }
      )
    }

    // Check if song already in playlist
    const existing = await prisma.playlistSong.findUnique({
      where: {
        playlistId_songId: {
          playlistId: params.id,
          songId,
        },
      },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Song already in playlist' },
        { status: 400 }
      )
    }

    // Get max order
    const maxOrder = await prisma.playlistSong.findFirst({
      where: { playlistId: params.id },
      orderBy: { order: 'desc' },
    })

    // Add song to playlist
    const playlistSong = await prisma.playlistSong.create({
      data: {
        playlistId: params.id,
        songId,
        order: maxOrder ? maxOrder.order + 1 : 0,
      },
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
    })

    return NextResponse.json({ playlistSong })
  } catch (error) {
    console.error('Add song to playlist error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
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

    const searchParams = request.nextUrl.searchParams
    const songId = searchParams.get('songId')

    if (!songId) {
      return NextResponse.json(
        { error: 'Song ID is required' },
        { status: 400 }
      )
    }

    // Verify playlist belongs to user
    const playlist = await prisma.playlist.findFirst({
      where: {
        id: params.id,
        userId,
      },
    })

    if (!playlist) {
      return NextResponse.json(
        { error: 'Playlist not found' },
        { status: 404 }
      )
    }

    await prisma.playlistSong.delete({
      where: {
        playlistId_songId: {
          playlistId: params.id,
          songId,
        },
      },
    })

    return NextResponse.json({ message: 'Song removed from playlist' })
  } catch (error) {
    console.error('Remove song from playlist error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
