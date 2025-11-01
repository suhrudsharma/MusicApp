# MusicApp - Full Stack Spotify Clone

A full-stack music streaming application built with Next.js, PostgreSQL, and TypeScript. Users can upload, store, and stream audio files with playlist management features.

## Features

- ✅ **User Authentication**: Sign up, login, and secure session management with JWT tokens
- ✅ **Audio Upload & Storage**: Upload audio files with automatic background processing
- ✅ **Background Processing**: Audio files are processed in the background to extract metadata and prepare for streaming
- ✅ **Audio Streaming**: Stream audio files with range request support for efficient playback
- ✅ **Music Library**: View and search through your uploaded songs
- ✅ **Playlist Management**: Create playlists, add/remove songs, and organize your music
- ✅ **Modern UI**: Beautiful, responsive interface inspired by Spotify

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Node.js
- **Database**: PostgreSQL with Prisma ORM
- **Storage**: Local file system (can be upgraded to AWS S3)
- **Background Jobs**: In-memory queue system (can be upgraded to BullMQ/Redis)

## Prerequisites

- Node.js 18+ installed
- PostgreSQL database running
- npm or yarn package manager

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/musicapp?schema=public"

# JWT Secret (change this to a secure random string in production)
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"

# Server (optional, defaults to localhost:3000)
NEXT_PUBLIC_API_URL="http://localhost:3000"

# Storage Directories (optional, defaults shown)
UPLOAD_DIR="./uploads"
PROCESSED_DIR="./processed"
```

### 3. Set Up Database

```bash
# Generate Prisma Client
npm run db:generate

# Push schema to database (creates tables)
npm run db:push
```

Alternatively, you can use migrations for production:
```bash
npx prisma migrate dev --name init
```

### 4. Create Required Directories

The application will automatically create the upload and processed directories, but you can create them manually:

```bash
mkdir uploads processed
```

### 5. Run the Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Usage

1. **Sign Up**: Create a new account with your email and password
2. **Login**: Sign in with your credentials
3. **Upload Music**: Click the "Upload" button and select audio files (MP3, WAV, etc.)
4. **Wait for Processing**: Files will be processed in the background (status shown in dashboard)
5. **Play Music**: Click on any processed song to start playback
6. **Create Playlists**: Organize your music by creating playlists and adding songs
7. **Search**: Use the search bar to find songs in your library

## Project Structure

```
├── app/                    # Next.js app router pages
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication endpoints
│   │   ├── songs/         # Song management endpoints
│   │   └── playlists/     # Playlist endpoints
│   ├── dashboard/         # Main dashboard page
│   ├── login/             # Login page
│   ├── register/          # Registration page
│   └── playlist/[id]/     # Individual playlist page
├── components/            # React components
│   └── Player.tsx         # Audio player component
├── lib/                   # Utility functions
│   ├── api.ts             # API client functions
│   ├── auth.ts            # Authentication utilities
│   ├── prisma.ts          # Prisma client instance
│   ├── storage.ts         # File storage utilities
│   ├── audioProcessor.ts  # Audio processing logic
│   └── queue.ts           # Background job queue
├── prisma/                # Database schema
│   └── schema.prisma      # Prisma schema definition
├── uploads/               # Uploaded files (gitignored)
└── processed/             # Processed files (gitignored)
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Songs
- `GET /api/songs` - Get user's songs (with optional search query)
- `POST /api/songs/upload` - Upload audio file
- `GET /api/songs/[id]/stream` - Stream audio file (supports range requests)

### Playlists
- `GET /api/playlists` - Get user's playlists
- `POST /api/playlists` - Create new playlist
- `GET /api/playlists/[id]` - Get playlist details
- `DELETE /api/playlists/[id]` - Delete playlist
- `POST /api/playlists/[id]/songs` - Add song to playlist
- `DELETE /api/playlists/[id]/songs?songId=...` - Remove song from playlist

## Database Schema

- **User**: Stores user accounts with email, password hash, and profile info
- **Song**: Stores song metadata, file paths, and processing status
- **Playlist**: Stores playlist information
- **PlaylistSong**: Junction table for playlist-song relationships

## Background Processing

When a file is uploaded:
1. File is saved to the upload directory
2. A database record is created with status "PROCESSING"
3. A background job is queued to process the audio
4. Metadata is extracted (title, artist, album, duration, etc.)
5. File is copied to processed directory
6. Database is updated with metadata and status "READY"

## Production Considerations

1. **Database**: Use a managed PostgreSQL service (AWS RDS, Supabase, etc.)
2. **File Storage**: Migrate to cloud storage (AWS S3, Google Cloud Storage)
3. **Background Jobs**: Use BullMQ with Redis for job processing
4. **JWT Secret**: Use a secure, randomly generated secret
5. **HTTPS**: Always use HTTPS in production
6. **Environment Variables**: Use a secure secret management system
7. **Audio Processing**: Consider using FFmpeg for format conversion and optimization
8. **CDN**: Use a CDN for audio file delivery
9. **Rate Limiting**: Implement rate limiting for upload endpoints
10. **File Size Limits**: Set appropriate file size limits

## License

This project is for educational purposes.