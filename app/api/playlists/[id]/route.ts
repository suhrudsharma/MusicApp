import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

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

    await prisma.playlist.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: 'Playlist deleted' })
  } catch (error) {
    console.error('Delete playlist error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

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

    const playlist = await prisma.playlist.findFirst({
      where: {
        id: params.id,
        userId,
      },
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
                genre: true,
                year: true,
              },
            },
          },
          orderBy: { order: 'asc' },
        },
      },
    })

    if (!playlist) {
      return NextResponse.json(
        { error: 'Playlist not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ playlist })
  } catch (error) {
    console.error('Get playlist error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
