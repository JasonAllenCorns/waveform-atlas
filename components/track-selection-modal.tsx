"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Play, ExternalLink } from "lucide-react"
import type { Track } from "@/types/track"

interface SpotifyMatch {
  id: string
  uri: string
  externalUrl: string
  previewUrl?: string
  name: string
  artist: string
  album: string
  duration_ms: number
  popularity: number
}

interface TrackSelectionModalProps {
  track: Track
  matches: SpotifyMatch[]
  isOpen: boolean
  onClose: () => void
  onSelectMatch: (match: SpotifyMatch) => void
  onSkip: () => void
}

export function TrackSelectionModal({
  track,
  matches,
  isOpen,
  onClose,
  onSelectMatch,
  onSkip
}: TrackSelectionModalProps) {
  const [playingPreview, setPlayingPreview] = useState<string | null>(null)

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  const handlePlayPreview = (previewUrl: string, matchId: string) => {
    if (playingPreview === matchId) {
      setPlayingPreview(null)
      // Stop audio would go here
    } else {
      setPlayingPreview(matchId)
      // Play audio would go here
    }
  }

  const handleSelectMatch = (match: SpotifyMatch) => {
    onSelectMatch(match)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] bg-white/95 backdrop-blur-sm border-white/20">
        <DialogHeader>
          <DialogTitle className="text-gray-900">
            Select Spotify Match for &quot;{track.name}&quot; by {track.artist}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="text-sm text-gray-600">
            Found {matches.length} potential matches on Spotify. Select the best match or skip if none are correct.
          </div>

          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-3">
              {matches.slice(0, 10).map((match, index) => {
                // Determine if this is the best match based on name similarity and popularity
                const isBestMatch = index === 0 ||
                  (match.name.toLowerCase().includes(track.name.toLowerCase()) &&
                   match.artist.toLowerCase().includes(track.artist.toLowerCase()));

                return (
                  <Card
                    key={match.id}
                    className="hover:bg-gray-50 transition-colors cursor-pointer border-gray-200"
                    onClick={() => handleSelectMatch(match)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium text-gray-900 truncate">
                              {match.name}
                            </span>
                            {isBestMatch && (
                              <Badge variant="secondary" className="text-xs">
                                Best Match
                              </Badge>
                            )}
                          </div>

                          <div className="text-sm text-gray-600 mb-2">
                            {match.artist} • {match.album}
                          </div>

                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>{formatDuration(match.duration_ms)}</span>
                            <span>Popularity: {match.popularity}/100</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 ml-4">
                          {match.previewUrl && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation()
                                handlePlayPreview(match.previewUrl!, match.id)
                              }}
                              className="h-8 w-8 p-0"
                            >
                              <Play className="h-4 w-4" />
                            </Button>
                          )}

                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation()
                              window.open(match.externalUrl, '_blank')
                            }}
                            className="h-8 w-8 p-0"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </ScrollArea>

          <div className="flex justify-between pt-4 border-t border-gray-200">
            <Button variant="outline" onClick={onSkip}>
              Skip - No Match Found
            </Button>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}