"use client"

import { useState, useEffect } from "react"
import { Save, Plus, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Track } from "@/app/page"

interface SavePanelProps {
  playlist: Track[]
  playlistName: string
}

interface SpotifyPlaylist {
  id: string
  name: string
  tracks: {
    total: number
  }
  owner: {
    display_name: string
  }
}

export function SavePanel({ playlist, playlistName }: SavePanelProps) {
  const [userPlaylists, setUserPlaylists] = useState<SpotifyPlaylist[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPlaylists = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch("/api/spotify/playlists")

      if (!response.ok) {
        throw new Error("Failed to fetch playlists")
      }

      const data = await response.json()
      setUserPlaylists(data.items || [])
    } catch (err) {
      setError("Failed to load playlists")
      console.error("Error fetching playlists:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPlaylists()
  }, [])

  const handleCreateNewPlaylist = () => {
    // In a real app, this would call the Spotify API to create a playlist
    console.log("Creating new playlist:", playlistName, playlist)
  }

  const handleMergePlaylist = (playlistId: string) => {
    // In a real app, this would call the Spotify API to add tracks to existing playlist
    console.log("Merging into playlist:", playlistId, playlist)
  }

  return (
    <Card className="bg-white/5 border-white/10 backdrop-blur-sm h-full flex flex-col" data-ref="wa.save-panel.container">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <Save className="h-5 w-5" />
            Save to Spotify
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchPlaylists}
            disabled={loading}
            className="text-white/60 hover:text-white hover:bg-white/10"
            data-ref="wa.save-panel.refresh.button"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 flex-1">
        <div className="border-2 border-dashed border-white/20 rounded-lg p-6 text-center" data-ref="wa.save-panel.create-new.container">
          <Plus className="h-8 w-8 text-green-400 mx-auto mb-3" />
          <h3 className="font-medium text-white mb-2">Create New Playlist</h3>
          <p className="text-sm text-white/60 mb-4">Save as a new playlist</p>
          <Button
            onClick={handleCreateNewPlaylist}
            disabled={playlist.length === 0 || !playlistName.trim()}
            className="w-full bg-green-500 hover:bg-green-600 disabled:opacity-50"
            data-ref="wa.save-panel.create-new.button"
          >
            Create Playlist
          </Button>
        </div>

        <div className="space-y-3" data-ref="wa.save-panel.merge.container">
          <p className="text-sm text-white/60">Or merge into existing:</p>

          {loading ? (
            <div className="text-center py-4" data-ref="wa.save-panel.merge.loading">
              <RefreshCw className="h-6 w-6 text-white/40 mx-auto animate-spin mb-2" />
              <p className="text-sm text-white/60">Loading playlists...</p>
            </div>
          ) : error ? (
            <div className="text-center py-4" data-ref="wa.save-panel.merge.error">
              <p className="text-sm text-red-400 mb-2">{error}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchPlaylists}
                className="border-white/20 text-white/70 hover:bg-white/10 bg-transparent"
                data-ref="wa.save-panel.merge.error.retry-button"
              >
                Try Again
              </Button>
            </div>
          ) : userPlaylists.length === 0 ? (
            <div className="text-center py-4" data-ref="wa.save-panel.merge.empty">
              <p className="text-sm text-white/60">No playlists found</p>
            </div>
          ) : (
            <div className="max-h-64 overflow-y-auto space-y-2" data-ref="wa.save-panel.merge.playlists.list">
              {userPlaylists.map((userPlaylist) => (
                <div
                  key={userPlaylist.id}
                  className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors"
                  data-ref={`wa.save-panel.merge.playlists.item.${userPlaylist.id}`}
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white truncate">{userPlaylist.name}</p>
                    <p className="text-sm text-white/60">
                      {userPlaylist.tracks.total} songs • {userPlaylist.owner.display_name}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleMergePlaylist(userPlaylist.id)}
                    disabled={playlist.length === 0}
                    className="border-white/20 text-white hover:bg-white/10 disabled:opacity-50 ml-2"
                    data-ref={`wa.save-panel.merge.playlists.item.merge-button.${userPlaylist.id}`}
                  >
                    Merge
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        <Button
          className="w-full bg-green-500 hover:bg-green-600 disabled:opacity-50"
          disabled={playlist.length === 0}
          onClick={() => console.log("Saving to Spotify")}
          data-ref="wa.save-panel.save.button"
        >
          <Save className="h-4 w-4 mr-2" />
          Save to Spotify
        </Button>
      </CardContent>
    </Card>
  )
}
