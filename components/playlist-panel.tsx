"use client"

import { Music2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Track } from "@/app/page"
import { TrackCard } from "@/components/track-card"
import { useDroppable } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"

interface PlaylistPanelProps {
  tracks: Track[]
  playlistName: string
  onPlaylistNameChange: (name: string) => void
  onRemoveTrack: (trackId: string) => void
}

export function PlaylistPanel({ tracks, playlistName, onPlaylistNameChange, onRemoveTrack }: PlaylistPanelProps) {
  const { setNodeRef } = useDroppable({
    id: "playlist-droppable",
  })

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  const totalDuration = tracks.reduce((acc, track) => acc + track.duration_ms, 0)

  return (
    <Card className="bg-white/5 border-white/10 backdrop-blur-sm h-full flex flex-col" data-ref="wa.playlist-panel.container">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Music2 className="h-5 w-5" />
          Temp Playlist
        </CardTitle>
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
                <TrackCard key={track.id} track={track} onRemove={onRemoveTrack} />
              ))}
            </SortableContext>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
