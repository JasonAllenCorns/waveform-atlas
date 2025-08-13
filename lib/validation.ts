import { Track, SpotifyMatch } from "@/types/track"

/**
 * Creates a search query from track name and artist
 */
export function createSearchQuery(track: Track): string {
  return `${track.name} ${track.artist}`
}

/**
 * Finds an exact match between a track and Spotify search results
 */
export function findExactMatch(track: Track, spotifyTracks: any[]): any | null {
  return spotifyTracks.find((spotifyTrack: any) => 
    spotifyTrack.name.toLowerCase() === track.name.toLowerCase() &&
    spotifyTrack.artists.some((artist: any) => 
      artist.name.toLowerCase() === track.artist.toLowerCase()
    )
  ) || null
}

/**
 * Maps Spotify API response to our SpotifyMatch format
 */
export function mapSpotifyTracksToMatches(spotifyTracks: any[]): SpotifyMatch[] {
  return spotifyTracks.map((spotifyTrack: any) => ({
    id: spotifyTrack.id,
    uri: spotifyTrack.uri,
    externalUrl: spotifyTrack.external_urls.spotify,
    previewUrl: spotifyTrack.preview_url,
    name: spotifyTrack.name,
    artist: spotifyTrack.artists.map((a: any) => a.name).join(', '),
    album: spotifyTrack.album.name,
    duration_ms: spotifyTrack.duration_ms,
    popularity: spotifyTrack.popularity,
  }))
}

/**
 * Updates a track with validation error
 */
export function updateTrackWithValidationError(playlist: Track[], trackId: string, error: string): Track[] {
  return playlist.map(t => 
    t.id === trackId 
      ? {
          ...t,
          validated: false,
          validationError: error,
        }
      : t
  )
}

/**
 * Updates a track with exact match validation
 */
export function updateTrackWithExactMatch(playlist: Track[], trackId: string, exactMatch: any): Track[] {
  return playlist.map(t => 
    t.id === trackId 
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
  )
}

/**
 * Updates a track with multiple matches for selection
 */
export function updateTrackWithMultipleMatches(playlist: Track[], trackId: string, matches: SpotifyMatch[]): Track[] {
  return playlist.map(t => 
    t.id === trackId 
      ? {
          ...t,
          spotifyMatches: matches,
          showMatchSelection: true,
          validationError: undefined,
        }
      : t
  )
}

/**
 * Updates a track with selected match
 */
export function updateTrackWithSelectedMatch(playlist: Track[], trackId: string, selectedMatch: SpotifyMatch): Track[] {
  return playlist.map(t => 
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
  )
}

/**
 * Updates a track when match selection is skipped
 */
export function updateTrackWithSkippedMatch(playlist: Track[], trackId: string): Track[] {
  return playlist.map(t => 
    t.id === trackId 
      ? {
          ...t,
          validated: false,
          validationError: "No match selected",
          spotifyMatches: undefined,
          showMatchSelection: false,
        }
      : t
  )
}

/**
 * Validates a single track against Spotify API
 */
export async function validateTrack(track: Track): Promise<
  | { success: true; exactMatch: any; matches?: never; error?: never }
  | { success: true; exactMatch?: never; matches: SpotifyMatch[]; error?: never }
  | { success: false; exactMatch?: never; matches?: never; error: string }
> {
  try {
    const searchQuery = createSearchQuery(track)
    const res = await fetch(`/api/spotify/search?q=${encodeURIComponent(searchQuery)}&limit=10`)
    
    if (!res.ok) {
      throw new Error(`Search failed: ${res.status}`)
    }
    
    const data = await res.json()
    const spotifyTracks = data.tracks?.items || []
    
    if (spotifyTracks.length === 0) {
      return {
        success: false,
        error: "No matches found on Spotify"
      }
    }
    
    const exactMatch = findExactMatch(track, spotifyTracks)
    
    if (exactMatch) {
      return {
        success: true,
        exactMatch
      }
    } else {
      const matches = mapSpotifyTracksToMatches(spotifyTracks)
      return {
        success: true,
        matches
      }
    }
  } catch (error) {
    console.error("Validation failed:", error)
    return {
      success: false,
      error: "Validation failed"
    }
  }
} 