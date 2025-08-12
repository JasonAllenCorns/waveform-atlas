"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import TrackChatPanel from "@/components/track-chat-panel"
import { PlaylistPanel } from "@/components/playlist-panel"
import { SavePanel } from "@/components/save-panel"
import { Header } from "@/components/header"
import { DndContext, type DragEndEvent, DragOverlay, type DragStartEvent } from "@dnd-kit/core"
import { TrackCard } from "@/components/track-card"
import { LandingPage } from "@/components/landing-page"
import { LoadingSpinner } from "@/components/loading-spinner"

export interface Track {
  id: string
  name: string
  artist: string
  album?: string
  duration_ms: number
  tempo?: number
  energy?: number
  preview_url?: string
  uri: string
  // GPT track fields
  notes?: string
  spotifyUrl?: string
  spotifyId?: string
  genre?: string
  mood?: string
  allowVocals?: boolean
  energyRange?: string
  genrePreference?: string
  spotifyImage?: string
  spotifyPopularity?: number
  spotifyAlbum?: string
  // Validation fields
  validated?: boolean
  spotifyMatch?: {
    id: string
    uri: string
    externalUrl: string
    previewUrl?: string
  }
  spotifyMatches?: Array<{
    id: string
    uri: string
    externalUrl: string
    previewUrl?: string
    name: string
    artist: string
    album: string
    duration_ms: number
    popularity: number
  }>
  validationError?: string
  showMatchSelection?: boolean
}

export default function Home() {
  const [playlist, setPlaylist] = useState<Track[]>([])
  const [playlistName, setPlaylistName] = useState("")
  const [activeTrack, setActiveTrack] = useState<Track | null>(null)
  const { data: session, status } = useSession()

  if (status === "loading") {
    return <LoadingSpinner />
  }

  if (!session) {
    return <LandingPage />
  }

  const addToPlaylist = (track: Track) => {
    setPlaylist((prev) => [...prev, { ...track, id: `${track.id}-${Date.now()}` }])
  }

  const addGptTrackToPlaylist = (spotifyTrack: any) => {
    console.log('Adding Spotify track:', spotifyTrack);
    
    const track: Track = {
      id: spotifyTrack.id,
      name: spotifyTrack.name,
      artist: spotifyTrack.artists?.[0]?.name || spotifyTrack.artist || 'Unknown Artist',
      album: spotifyTrack.album?.name || spotifyTrack.album || 'Unknown Album',
      duration_ms: spotifyTrack.duration_ms,
      tempo: undefined, // Will be filled by Spotify API if available
      energy: undefined, // Will be filled by Spotify API if available
      preview_url: spotifyTrack.preview_url,
      uri: spotifyTrack.uri,
      // GPT fields (if available)
      notes: spotifyTrack.notes,
      spotifyUrl: spotifyTrack.external_urls?.spotify,
      spotifyId: spotifyTrack.id,
      genre: spotifyTrack.genre,
      mood: spotifyTrack.mood,
      allowVocals: spotifyTrack.allowVocals,
      energyRange: spotifyTrack.energyRange,
      genrePreference: spotifyTrack.genrePreference,
      spotifyImage: spotifyTrack.images?.[0]?.url,
      spotifyPopularity: spotifyTrack.popularity,
      spotifyAlbum: spotifyTrack.album?.name || spotifyTrack.album || 'Unknown Album',
      // Validation fields
      validated: true, // Already validated since it came from Spotify
    }
    
    console.log('Processed track:', track);
    setPlaylist((prev) => [...prev, track])
  }

  const validateTrack = async (track: Track) => {
    if (!track.validated && !track.validationError) {
      try {
        const searchQuery = `${track.name} ${track.artist}`;
        const res = await fetch(`/api/spotify/search?q=${encodeURIComponent(searchQuery)}&limit=10`);
        
        if (!res.ok) {
          throw new Error(`Search failed: ${res.status}`);
        }
        
        const data = await res.json();
        const spotifyTracks = data.tracks?.items || [];
        
        if (spotifyTracks.length === 0) {
          // No matches found
          setPlaylist(prev => prev.map(t => 
            t.id === track.id 
              ? {
                  ...t,
                  validated: false,
                  validationError: "No matches found on Spotify",
                }
              : t
          ));
          return;
        }
        
        // Find exact match
        const exactMatch = spotifyTracks.find((spotifyTrack: any) => 
          spotifyTrack.name.toLowerCase() === track.name.toLowerCase() &&
          spotifyTrack.artists.some((artist: any) => 
            artist.name.toLowerCase() === track.artist.toLowerCase()
          )
        );
        
        if (exactMatch) {
          // Exact match found - auto-validate
          setPlaylist(prev => prev.map(t => 
            t.id === track.id 
              ? {
                  ...t,
                  validated: true,
                  spotifyMatch: {
                    id: exactMatch.id,
                    uri: exactMatch.uri,
                    externalUrl: exactMatch.external_urls.spotify,
                    previewUrl: exactMatch.preview_url,
                  },
                  validationError: undefined,
                }
              : t
          ));
        } else {
          // Multiple matches found - show selection modal
          const matches = spotifyTracks.map((spotifyTrack: any) => ({
            id: spotifyTrack.id,
            uri: spotifyTrack.uri,
            externalUrl: spotifyTrack.external_urls.spotify,
            previewUrl: spotifyTrack.preview_url,
            name: spotifyTrack.name,
            artist: spotifyTrack.artists.map((a: any) => a.name).join(', '),
            album: spotifyTrack.album.name,
            duration_ms: spotifyTrack.duration_ms,
            popularity: spotifyTrack.popularity,
          }));
          
          setPlaylist(prev => prev.map(t => 
            t.id === track.id 
              ? {
                  ...t,
                  spotifyMatches: matches,
                  showMatchSelection: true,
                  validationError: undefined,
                }
              : t
          ));
        }
      } catch (error) {
        console.error("Validation failed:", error);
        setPlaylist(prev => prev.map(t => 
          t.id === track.id 
            ? {
                ...t,
                validated: false,
                validationError: "Validation failed",
              }
            : t
        ));
      }
    }
  };

  const handleMatchSelection = (trackId: string, selectedMatch: any) => {
    setPlaylist(prev => prev.map(t => 
      t.id === trackId 
        ? {
            ...t,
            validated: true,
            spotifyMatch: {
              id: selectedMatch.id,
              uri: selectedMatch.uri,
              externalUrl: selectedMatch.externalUrl,
              previewUrl: selectedMatch.previewUrl,
            },
            spotifyMatches: undefined,
            showMatchSelection: false,
            validationError: undefined,
          }
        : t
    ));
  };

  const handleSkipMatchSelection = (trackId: string) => {
    setPlaylist(prev => prev.map(t => 
      t.id === trackId 
        ? {
            ...t,
            validated: false,
            validationError: "No match selected",
            spotifyMatches: undefined,
            showMatchSelection: false,
          }
        : t
    ));
  };

  const validateAllTracks = async () => {
    const unvalidatedTracks = playlist.filter(track => !track.validated && !track.validationError);
    
    if (unvalidatedTracks.length === 0) return;
    
    // For batch validation, we'll validate tracks individually to handle multiple matches properly
    for (const track of unvalidatedTracks) {
      await validateTrack(track);
    }
  };

  const removeFromPlaylist = (trackId: string) => {
    setPlaylist((prev) => prev.filter((track) => track.id !== trackId))
  }

  const reorderPlaylist = (activeId: string, overId: string) => {
    setPlaylist((prev) => {
      const activeIndex = prev.findIndex((track) => track.id === activeId)
      const overIndex = prev.findIndex((track) => track.id === overId)

      if (activeIndex === -1 || overIndex === -1) return prev

      const newPlaylist = [...prev]
      const [removed] = newPlaylist.splice(activeIndex, 1)
      newPlaylist.splice(overIndex, 0, removed)

      return newPlaylist
    })
  }

  const handleDragStart = (event: DragStartEvent) => {
    const track = playlist.find((t) => t.id === event.active.id)
    setActiveTrack(track || null)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      reorderPlaylist(active.id as string, over.id as string)
    }

    setActiveTrack(null)
  }

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="min-h-screen bg-gradient-to-br from-brand-primary via-brand-secondary to-brand-accent flex flex-col">
        <Header />

        <main className="container mx-auto p-4 flex-1 flex" data-ref="wa.dashboard.main">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1" data-ref="wa.dashboard.container.layout">
            <TrackChatPanel onAddTrack={addGptTrackToPlaylist} />

            <PlaylistPanel
              tracks={playlist}
              playlistName={playlistName}
              onPlaylistNameChange={setPlaylistName}
              onRemoveTrack={removeFromPlaylist}
              onValidateTrack={validateTrack}
              onValidateAllTracks={validateAllTracks}
              onMatchSelection={handleMatchSelection}
              onSkipMatchSelection={handleSkipMatchSelection}
            />

            <SavePanel playlist={playlist} playlistName={playlistName} />
          </div>
        </main>

        <DragOverlay>
          {activeTrack ? <TrackCard track={activeTrack} onRemove={() => {}} isDragging /> : null}
        </DragOverlay>
      </div>
    </DndContext>
  )
}
