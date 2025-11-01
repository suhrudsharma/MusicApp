'use client'

import { useState, useRef, useEffect } from 'react'
import { api } from '@/lib/api'

interface Song {
  id: string
  title: string
  artist?: string
  album?: string
  duration: number
}

interface PlayerProps {
  currentSong: Song | null
  onNext?: () => void
  onPrevious?: () => void
  playlist?: Song[]
}

export default function Player({ currentSong, onNext, onPrevious, playlist }: PlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const updateTime = () => setCurrentTime(audio.currentTime)
    const updateDuration = () => setDuration(audio.duration)

    audio.addEventListener('timeupdate', updateTime)
    audio.addEventListener('loadedmetadata', updateDuration)

    return () => {
      audio.removeEventListener('timeupdate', updateTime)
      audio.removeEventListener('loadedmetadata', updateDuration)
    }
  }, [])

  useEffect(() => {
    if (currentSong) {
      setCurrentTime(0)
      if (audioRef.current) {
        audioRef.current.load()
      }
    }
  }, [currentSong])

  const togglePlay = () => {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying) {
      audio.pause()
    } else {
      audio.play()
    }
    setIsPlaying(!isPlaying)
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current
    if (!audio) return

    const newTime = parseFloat(e.target.value)
    audio.currentTime = newTime
    setCurrentTime(newTime)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (!currentSong) {
    return null
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-spotify-gray border-t border-gray-700 px-6 py-4">
      <audio
        ref={audioRef}
        src={api.songs.stream(currentSong.id)}
        onEnded={() => {
          setIsPlaying(false)
          if (onNext) onNext()
        }}
      />
      
      <div className="max-w-7xl mx-auto flex items-center gap-4">
        {/* Song Info */}
        <div className="flex-1 min-w-0">
          <p className="text-white font-medium truncate">{currentSong.title}</p>
          <p className="text-spotify-lightgray text-sm truncate">
            {currentSong.artist || 'Unknown Artist'}
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-col items-center gap-2 flex-1">
          <div className="flex items-center gap-4">
            <button
              onClick={onPrevious}
              className="text-white hover:text-spotify-green transition-colors"
              disabled={!onPrevious}
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8.445 14.832A1 1 0 0010 14v-2.798l5.445 3.63A1 1 0 0017 14V6a1 1 0 00-1.555-.832L10 8.798V6a1 1 0 00-1.555-.832l-6 4a1 1 0 000 1.664l6 4z" />
              </svg>
            </button>
            
            <button
              onClick={togglePlay}
              className="bg-white hover:bg-gray-200 text-spotify-black rounded-full p-3 transition-colors"
            >
              {isPlaying ? (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
              )}
            </button>

            <button
              onClick={onNext}
              className="text-white hover:text-spotify-green transition-colors"
              disabled={!onNext}
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M4.555 5.168A1 1 0 003 6v8a1 1 0 001.555.832L10 11.202V14a1 1 0 001.555.832l6-4a1 1 0 000-1.664l-6-4A1 1 0 0011 6v2.798l-5.445-3.63z" />
              </svg>
            </button>
          </div>

          {/* Progress Bar */}
          <div className="flex items-center gap-2 w-full max-w-md">
            <span className="text-xs text-spotify-lightgray w-12 text-right">
              {formatTime(currentTime)}
            </span>
            <input
              type="range"
              min="0"
              max={duration || 0}
              value={currentTime}
              onChange={handleSeek}
              className="flex-1 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-spotify-green"
            />
            <span className="text-xs text-spotify-lightgray w-12">
              {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* Volume & Additional Controls */}
        <div className="flex-1"></div>
      </div>
    </div>
  )
}
