'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { api, getToken } from '@/lib/api'
import Player from '@/components/Player'
import Link from 'next/link'

interface Song {
  id: string
  title: string
  artist?: string
  album?: string
  duration: number
  status: string
}

interface PlaylistSong {
  song: Song
}

interface Playlist {
  id: string
  name: string
  description?: string
  songs: PlaylistSong[]
}

export default function PlaylistPage() {
  const router = useRouter()
  const params = useParams()
  const playlistId = params.id as string
  const [playlist, setPlaylist] = useState<Playlist | null>(null)
  const [availableSongs, setAvailableSongs] = useState<Song[]>([])
  const [currentSong, setCurrentSong] = useState<Song | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)

  useEffect(() => {
    if (!getToken()) {
      router.push('/login')
      return
    }
    loadPlaylist()
    loadAvailableSongs()
  }, [playlistId, router])

  const loadPlaylist = async () => {
    try {
      const data = await api.playlists.get(playlistId)
      setPlaylist(data.playlist)
    } catch (error) {
      console.error('Failed to load playlist:', error)
      router.push('/dashboard')
    }
  }

  const loadAvailableSongs = async () => {
    try {
      const data = await api.songs.list('', 'READY')
      setAvailableSongs(data.songs || [])
    } catch (error) {
      console.error('Failed to load songs:', error)
    }
  }

  const handleAddSong = async (songId: string) => {
    try {
      await api.playlists.addSong(playlistId, songId)
      loadPlaylist()
      setShowAddModal(false)
    } catch (error: any) {
      alert('Failed to add song: ' + error.message)
    }
  }

  const handleRemoveSong = async (songId: string) => {
    if (!confirm('Remove song from playlist?')) return

    try {
      await api.playlists.removeSong(playlistId, songId)
      loadPlaylist()
    } catch (error: any) {
      alert('Failed to remove song: ' + error.message)
    }
  }

  const handleDeletePlaylist = async () => {
    if (!confirm('Delete this playlist?')) return

    try {
      await api.playlists.delete(playlistId)
      router.push('/dashboard')
    } catch (error: any) {
      alert('Failed to delete playlist: ' + error.message)
    }
  }

  const handlePlaySong = (song: Song) => {
    if (song.status === 'READY') {
      setCurrentSong(song)
    }
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (!playlist) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-spotify-green"></div>
      </div>
    )
  }

  const readySongs = playlist.songs.filter(ps => ps.song.status === 'READY')
  const songsToAdd = availableSongs.filter(
    song => !playlist.songs.some(ps => ps.song.id === song.id)
  )

  return (
    <div className="min-h-screen bg-spotify-black pb-24">
      {/* Header */}
      <header className="bg-spotify-gray border-b border-gray-700 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/dashboard" className="text-spotify-green hover:underline">
            ← Back to Dashboard
          </Link>
          <button
            onClick={handleDeletePlaylist}
            className="text-red-400 hover:text-red-300 transition-colors"
          >
            Delete Playlist
          </button>
        </div>
      </header>

      {/* Playlist Info */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <h1 className="text-4xl font-bold mb-2">{playlist.name}</h1>
        {playlist.description && (
          <p className="text-spotify-lightgray mb-6">{playlist.description}</p>
        )}

        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-spotify-green hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Add Songs
          </button>
          <span className="text-spotify-lightgray">
            {readySongs.length} {readySongs.length === 1 ? 'song' : 'songs'}
          </span>
        </div>

        {/* Songs List */}
        {readySongs.length === 0 ? (
          <div className="text-center py-12 text-spotify-lightgray">
            <p className="text-lg mb-2">This playlist is empty</p>
            <p>Add some songs to get started!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {playlist.songs.map((playlistSong) => {
              const song = playlistSong.song
              if (song.status !== 'READY') return null
              
              return (
                <div
                  key={song.id}
                  className="bg-spotify-gray hover:bg-gray-700 rounded-lg p-4 flex items-center justify-between transition-colors"
                >
                  <div
                    onClick={() => handlePlaySong(song)}
                    className="flex-1 min-w-0 cursor-pointer"
                  >
                    <p className="text-white font-medium truncate">{song.title}</p>
                    <p className="text-spotify-lightgray text-sm truncate">
                      {song.artist || 'Unknown Artist'}
                      {song.album && ` • ${song.album}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-spotify-lightgray text-sm">
                      {formatDuration(song.duration)}
                    </div>
                    <button
                      onClick={() => handleRemoveSong(song.id)}
                      className="text-red-400 hover:text-red-300 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Add Songs Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-spotify-gray rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">Add Songs to Playlist</h2>
            {songsToAdd.length === 0 ? (
              <p className="text-spotify-lightgray">All available songs are already in this playlist.</p>
            ) : (
              <div className="space-y-2">
                {songsToAdd.map((song) => (
                  <div
                    key={song.id}
                    className="bg-spotify-dark rounded-lg p-4 flex items-center justify-between"
                  >
                    <div>
                      <p className="text-white font-medium">{song.title}</p>
                      <p className="text-spotify-lightgray text-sm">
                        {song.artist || 'Unknown Artist'}
                      </p>
                    </div>
                    <button
                      onClick={() => handleAddSong(song.id)}
                      className="bg-spotify-green hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      Add
                    </button>
                  </div>
                ))}
              </div>
            )}
            <button
              onClick={() => setShowAddModal(false)}
              className="mt-4 w-full bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Player */}
      <Player currentSong={currentSong} />
    </div>
  )
}
