'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
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

interface Playlist {
  id: string
  name: string
  description?: string
  songs: {
    song: Song
  }[]
}

export default function Dashboard() {
  const router = useRouter()
  const [songs, setSongs] = useState<Song[]>([])
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [currentSong, setCurrentSong] = useState<Song | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'library' | 'playlists'>('library')
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [showPlaylistModal, setShowPlaylistModal] = useState(false)
  const [newPlaylistName, setNewPlaylistName] = useState('')

  useEffect(() => {
    if (!getToken()) {
      router.push('/login')
      return
    }
    loadSongs()
    loadPlaylists()
  }, [router])

  const loadSongs = async () => {
    try {
      const data = await api.songs.list(searchQuery)
      setSongs(data.songs || [])
    } catch (error) {
      console.error('Failed to load songs:', error)
    }
  }

  const loadPlaylists = async () => {
    try {
      const data = await api.playlists.list()
      setPlaylists(data.playlists || [])
    } catch (error) {
      console.error('Failed to load playlists:', error)
    }
  }

  useEffect(() => {
    loadSongs()
  }, [searchQuery])

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      await api.songs.upload(file)
      setShowUploadModal(false)
      loadSongs()
      alert('Song uploaded! Processing in background...')
    } catch (error: any) {
      alert('Upload failed: ' + error.message)
    } finally {
      setUploading(false)
    }
  }

  const handleCreatePlaylist = async () => {
    if (!newPlaylistName.trim()) return

    try {
      await api.playlists.create(newPlaylistName)
      setNewPlaylistName('')
      setShowPlaylistModal(false)
      loadPlaylists()
    } catch (error: any) {
      alert('Failed to create playlist: ' + error.message)
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

  const readySongs = songs.filter(s => s.status === 'READY')
  const processingSongs = songs.filter(s => s.status === 'PROCESSING')

  return (
    <div className="min-h-screen bg-spotify-black pb-24">
      {/* Header */}
      <header className="bg-spotify-gray border-b border-gray-700 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold text-spotify-green">MusicApp</h1>
          <div className="flex items-center gap-4">
            <input
              type="text"
              placeholder="Search songs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-4 py-2 bg-spotify-dark border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-spotify-green"
            />
            <button
              onClick={() => setShowUploadModal(true)}
              className="bg-spotify-green hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Upload
            </button>
            <button
              onClick={() => api.auth.logout()}
              className="text-spotify-lightgray hover:text-white transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex gap-4 border-b border-gray-700 mb-6">
          <button
            onClick={() => setActiveTab('library')}
            className={`pb-2 px-4 font-medium transition-colors ${
              activeTab === 'library'
                ? 'text-spotify-green border-b-2 border-spotify-green'
                : 'text-spotify-lightgray hover:text-white'
            }`}
          >
            Library
          </button>
          <button
            onClick={() => setActiveTab('playlists')}
            className={`pb-2 px-4 font-medium transition-colors ${
              activeTab === 'playlists'
                ? 'text-spotify-green border-b-2 border-spotify-green'
                : 'text-spotify-lightgray hover:text-white'
            }`}
          >
            Playlists
          </button>
        </div>

        {/* Library Tab */}
        {activeTab === 'library' && (
          <div>
            {processingSongs.length > 0 && (
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-4">Processing...</h2>
                <div className="space-y-2">
                  {processingSongs.map((song) => (
                    <div
                      key={song.id}
                      className="bg-spotify-gray rounded-lg p-4 flex items-center justify-between"
                    >
                      <div>
                        <p className="text-white">{song.title}</p>
                        <p className="text-spotify-lightgray text-sm">
                          Processing audio file...
                        </p>
                      </div>
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-spotify-green"></div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <h2 className="text-xl font-semibold mb-4">Your Music</h2>
            {readySongs.length === 0 ? (
              <div className="text-center py-12 text-spotify-lightgray">
                <p className="text-lg mb-2">No songs yet</p>
                <p>Upload your first song to get started!</p>
              </div>
            ) : (
              <div className="space-y-2">
                {readySongs.map((song) => (
                  <div
                    key={song.id}
                    onClick={() => handlePlaySong(song)}
                    className="bg-spotify-gray hover:bg-gray-700 rounded-lg p-4 flex items-center justify-between cursor-pointer transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium truncate">{song.title}</p>
                      <p className="text-spotify-lightgray text-sm truncate">
                        {song.artist || 'Unknown Artist'}
                        {song.album && ` • ${song.album}`}
                      </p>
                    </div>
                    <div className="text-spotify-lightgray text-sm ml-4">
                      {formatDuration(song.duration)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Playlists Tab */}
        {activeTab === 'playlists' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Playlists</h2>
              <button
                onClick={() => setShowPlaylistModal(true)}
                className="bg-spotify-green hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Create Playlist
              </button>
            </div>

            {playlists.length === 0 ? (
              <div className="text-center py-12 text-spotify-lightgray">
                <p className="text-lg mb-2">No playlists yet</p>
                <p>Create your first playlist to organize your music!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {playlists.map((playlist) => (
                  <Link
                    key={playlist.id}
                    href={`/playlist/${playlist.id}`}
                    className="bg-spotify-gray hover:bg-gray-700 rounded-lg p-6 transition-colors"
                  >
                    <h3 className="text-white font-semibold text-lg mb-2">{playlist.name}</h3>
                    <p className="text-spotify-lightgray text-sm mb-2">
                      {playlist.description || 'No description'}
                    </p>
                    <p className="text-spotify-lightgray text-xs">
                      {playlist.songs.length} {playlist.songs.length === 1 ? 'song' : 'songs'}
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-spotify-gray rounded-lg p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">Upload Song</h2>
            <input
              type="file"
              accept="audio/*"
              onChange={handleUpload}
              disabled={uploading}
              className="mb-4"
            />
            {uploading && (
              <div className="text-spotify-lightgray">Uploading...</div>
            )}
            <button
              onClick={() => setShowUploadModal(false)}
              className="mt-4 w-full bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Create Playlist Modal */}
      {showPlaylistModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-spotify-gray rounded-lg p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">Create Playlist</h2>
            <input
              type="text"
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
              placeholder="Playlist name"
              className="w-full px-4 py-3 bg-spotify-dark border border-gray-700 rounded-lg focus:outline-none focus:border-spotify-green text-white mb-4"
            />
            <div className="flex gap-2">
              <button
                onClick={handleCreatePlaylist}
                className="flex-1 bg-spotify-green hover:bg-green-600 text-white py-2 rounded-lg transition-colors"
              >
                Create
              </button>
              <button
                onClick={() => {
                  setShowPlaylistModal(false)
                  setNewPlaylistName('')
                }}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Player */}
      <Player currentSong={currentSong} />
    </div>
  )
}
