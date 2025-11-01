# Quick Setup Guide

Follow these steps to get your MusicApp up and running:

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Set Up PostgreSQL Database

Make sure PostgreSQL is installed and running. Create a new database:

```sql
CREATE DATABASE musicapp;
```

## Step 3: Configure Environment

Create a `.env` file in the root directory with the following:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/musicapp?schema=public"
JWT_SECRET="change-this-to-a-random-secret-key"
NEXT_PUBLIC_API_URL="http://localhost:3000"
```

**Important**: Replace `username` and `password` with your PostgreSQL credentials, and change `JWT_SECRET` to a secure random string.

## Step 4: Initialize Database

```bash
# Generate Prisma Client
npm run db:generate

# Create database tables
npm run db:push
```

## Step 5: Start Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` and you're ready to go!

## First Steps

1. Register a new account
2. Upload an audio file (MP3, WAV, etc.)
3. Wait for processing (shown in dashboard)
4. Start playing your music!

## Troubleshooting

### Database Connection Error
- Ensure PostgreSQL is running
- Verify your DATABASE_URL in `.env`
- Check that the database exists

### File Upload Issues
- Make sure the `uploads` and `processed` directories are writable
- Check file size limits
- Verify audio file format is supported

### Port Already in Use
- Change the port: `npm run dev -- -p 3001`
- Or stop other processes using port 3000
