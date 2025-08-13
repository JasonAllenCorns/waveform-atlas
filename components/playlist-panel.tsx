"use client"

import { Music2, CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { SpotifyMatch, Track } from "@/types/track"
import { TrackCard } from "@/components/track-card"
import { TrackSelectionModal } from "@/components/track-selection-modal"
import { useDroppable } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { useState } from "react"

interface PlaylistPanelProps {
  tracks: Track[]
  playlistName: string
  onPlaylistNameChange: (name: string) => void
  onRemoveTrack: (trackId: string) => void
  onValidateTrack: (track: Track) => Promise<void>
  onValidateAllTracks: () => Promise<void>
  onMatchSelection: (trackId: string, selectedMatch: SpotifyMatch) => void
  onSkipMatchSelection: (trackId: string) => void
}

export function PlaylistPanel({ 
  tracks, 
  playlistName, 
  onPlaylistNameChange, 
  onRemoveTrack,
  onValidateTrack,
  onValidateAllTracks,
  onMatchSelection,
  onSkipMatchSelection
}: PlaylistPanelProps) {
  const { setNodeRef } = useDroppable({
    id: "playlist-droppable",
  })

  const [validatingTracks, setValidatingTracks] = useState<Set<string>>(new Set())

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  const totalDuration = tracks.reduce((acc, track) => acc + track.duration_ms, 0)

  const handleValidateTrack = async (track: Track) => {
    setValidatingTracks(prev => new Set(prev).add(track.id))
    try {
      await onValidateTrack(track)
    } finally {
      setValidatingTracks(prev => {
        const newSet = new Set(prev)
        newSet.delete(track.id)
        return newSet
      })
    }
  }

  const handleValidateAll = async () => {
    const unvalidatedTracks = tracks.filter(track => !track.validated && !track.validationError)
    setValidatingTracks(prev => new Set([...prev, ...unvalidatedTracks.map(t => t.id)]))
    try {
      await onValidateAllTracks()
    } finally {
      setValidatingTracks(prev => {
        const newSet = new Set(prev)
        unvalidatedTracks.forEach(track => newSet.delete(track.id))
        return newSet
      })
    }
  }

  const unvalidatedTracks = tracks.filter(track => !track.validated && !track.validationError)

  return (
    <Card className="bg-white/5 border-white/10 backdrop-blur-sm h-full flex flex-col" data-ref="wa.playlist-panel.container">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-white">
            <Music2 className="h-5 w-5" />
            Temp Playlist
          </CardTitle>
          {unvalidatedTracks.length > 0 && (
            <Button
              onClick={handleValidateAll}
              size="sm"
              variant="outline"
              className="bg-blue-500/20 border-blue-500/30 text-blue-400 hover:bg-blue-500/30"
            >
              Validate All
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4 flex-1">
        <Input
          placeholder="Playlist name..."
          value={playlistName}
          onChange={(e) => onPlaylistNameChange(e.target.value)}
          className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
          data-ref="wa.playlist-panel.name.input"
        />

        {tracks.length > 0 && (
          <div className="text-sm text-white/60" data-ref="wa.playlist-panel.playlist.stats">
            {tracks.length} tracks • {formatDuration(totalDuration)}
          </div>
        )}

        <div
          ref={setNodeRef}
          className="space-y-2 flex-1 overflow-y-auto border-2 border-dashed border-white/20 rounded-lg p-4"
          data-ref="wa.playlist-panel.tracks.container"
        >
          {tracks.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-8" data-ref="wa.playlist-panel.tracks.empty">
              <Music2 className="h-12 w-12 text-white/30 mb-4" />
              <p className="text-white/60">Add tracks from your search to build your playlist</p>
            </div>
          ) : (
            <SortableContext items={tracks.map((t) => t.id)} strategy={verticalListSortingStrategy} data-ref="wa.playlist-panel.tracks.list">
              {tracks.map((track) => (
                <div key={track.id} className="relative">
                  <TrackCard track={track} onRemove={onRemoveTrack} />
                  {/* Validation Status Overlay */}
                  <div className="absolute top-2 right-2 flex items-center gap-1">
                    {validatingTracks.has(track.id) ? (
                      <Loader2 className="h-4 w-4 text-blue-400 animate-spin" />
                    ) : track.validated ? (
                      <CheckCircle className="h-4 w-4 text-green-400" />
                    ) : track.validationError ? (
                      <AlertCircle className="h-4 w-4 text-red-400" />
                    ) : track.spotifyMatches && track.showMatchSelection ? (
                      <div className="flex items-center gap-1">
                        <Badge variant="secondary" className="text-xs bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                          {track.spotifyMatches.length} matches
                        </Badge>
                      </div>
                    ) : (
                      <div className="h-4 w-4 rounded-full border border-white/40" />
                    )}
                    
                    {/* Validate Button */}
                    {!track.validated && !validatingTracks.has(track.id) && !track.spotifyMatches && (
                      <Button
                        onClick={() => handleValidateTrack(track)}
                        size="sm"
                        variant="ghost"
                        className="text-xs text-blue-400 hover:text-blue-300 bg-black/20"
                      >
                        Validate
                      </Button>
                    )}
                    
                    {/* Select Match Button */}
                    {track.spotifyMatches && track.showMatchSelection && (
                      <Button
                        onClick={() => onMatchSelection(track.id, track.spotifyMatches![0])}
                        size="sm"
                        variant="ghost"
                        className="text-xs text-yellow-400 hover:text-yellow-300 bg-black/20"
                      >
                        Select
                      </Button>
                    )}
                  </div>
                  {/* Validation Error Message */}
                  {track.validationError && (
                    <div className="text-xs text-red-400 mt-1 px-2">
                      {track.validationError}
                    </div>
                  )}
                  
                  {/* Multiple Matches Message */}
                  {track.spotifyMatches && track.showMatchSelection && (
                    <div className="text-xs text-yellow-400 mt-1 px-2">
                      {track.spotifyMatches.length} potential matches found - click to select
                    </div>
                  )}
                </div>
              ))}
            </SortableContext>
          )}
        </div>
      </CardContent>
      
      {/* Track Selection Modal */}
      {tracks.map(track => 
        track.showMatchSelection && track.spotifyMatches ? (
          <TrackSelectionModal
            key={`modal-${track.id}`}
            track={track}
            matches={track.spotifyMatches}
            isOpen={track.showMatchSelection}
            onClose={() => onSkipMatchSelection(track.id)}
            onSelectMatch={(match) => onMatchSelection(track.id, match)}
            onSkip={() => onSkipMatchSelection(track.id)}
          />
        ) : null
      )}
    </Card>
  )
}
