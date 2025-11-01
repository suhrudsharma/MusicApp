// app/api/songs/[id]/stream/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // Make sure this path is correct
import fs from 'fs';
import path from 'path';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const songId = params.id;

    // 1. Find the song in the database
    const song = await prisma.song.findUnique({
      where: { id: songId },
    });

    // 2. Check if the song exists and is ready to play
    if (!song || !song.processedPath || song.status !== 'READY') {
      return new NextResponse('Song not found or not processed', { status: 404 });
    }

    const filePath = song.processedPath;

    // 3. Check if the file actually exists on the disk
    if (!fs.existsSync(filePath)) {
      console.error(`File not found at path: ${filePath}`);
      return new NextResponse('File not found on server', { status: 404 });
    }

    // 4. Get file stats to set headers
    const stat = fs.statSync(filePath);
    const fileSize = stat.size;

    // 5. Create a readable stream from the file
    const fileStream = fs.createReadStream(filePath);

    // 6. Send the stream as the response
    // We create a standard Response object to stream
    return new Response(fileStream as any, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg', // Assuming MP3. Change if needed.
        'Content-Length': fileSize.toString(),
        'Accept-Ranges': 'bytes', // Important for allowing seeking
      },
    });

  } catch (error) {
    console.error('Stream API error:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}