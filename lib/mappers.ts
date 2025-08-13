import { Track, SpotifyTrack } from "@/types/track"

/**
 * Maps a Spotify track object to our Track interface
 * Used when adding tracks from GPT responses or Spotify API
 */
export function mapSpotifyTrackToTrack(spotifyTrack: SpotifyTrack): Track {
  return {
    id: spotifyTrack.id,
    name: spotifyTrack.name,
    artist: spotifyTrack.artists?.[0]?.name || 'Unknown Artist',
    album: spotifyTrack.album?.name || 'Unknown Album',
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
          spotifyAlbum: spotifyTrack.album?.name || 'Unknown Album',
    // Validation fields
    validated: true, // Already validated since it came from Spotify
  }
}

/**
 * Maps a basic track object to our Track interface
 * Used when adding tracks manually
 */
export function mapBasicTrackToTrack(track: {
  id: string
  name: string
  artist: string
  album?: string
  duration_ms: number
  tempo?: number
  energy?: number
  preview_url?: string
  uri: string
}): Track {
  return {
    ...track,
    // Initialize optional fields
    notes: undefined,
    spotifyUrl: undefined,
    spotifyId: undefined,
    genre: undefined,
    mood: undefined,
    allowVocals: undefined,
    energyRange: undefined,
    genrePreference: undefined,
    spotifyImage: undefined,
    spotifyPopularity: undefined,
    spotifyAlbum: undefined,
    validated: false,
    spotifyMatch: undefined,
    spotifyMatches: undefined,
    validationError: undefined,
    showMatchSelection: false,
  }
}

/**
 * Creates a unique ID for a track
 */
export function createUniqueTrackId(trackId: string): string {
  return `${trackId}-${Date.now()}`
}

/**
 * Safely extracts artist name from Spotify track
 */
export function extractArtistName(spotifyTrack: SpotifyTrack): string {
  if (spotifyTrack.artists && spotifyTrack.artists.length > 0) {
    return spotifyTrack.artists[0].name
  }
  return 'Unknown Artist'
}

/**
 * Safely extracts album name from Spotify track
 */
export function extractAlbumName(spotifyTrack: SpotifyTrack): string {
  if (spotifyTrack.album?.name) {
    return spotifyTrack.album.name
  }
  return 'Unknown Album'
}

/**
 * Safely extracts image URL from Spotify track
 */
export function extractImageUrl(spotifyTrack: SpotifyTrack): string | undefined {
  return spotifyTrack.images?.[0]?.url
} 