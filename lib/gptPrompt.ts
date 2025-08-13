// /lib/gptPrompt.ts

type TrackSearchRequest = {
  targetBPM: number;
  mood: string;
  allowVocals: boolean;
  energyRange?: 'low' | 'medium' | 'high';
  genrePreference?: string;
  seedTrack?: string;
  seedArtist?: string;
  seedAlbum?: string;
};

export function createPrompt(input: TrackSearchRequest) {
  const systemPrompt = `You are a music discovery assistant. Recommend songs based on user preferences for tempo, mood, and genre.
Respond as a JSON array of 5 to 10 objects with fields:
- title (string) - the title of the song
- artist (string) - the performing artist of the song
- notes (short vibe description) - a short description of the vibe of the song
- tempo (number) - the tempo of the song
- energy (number) - 0-100
- genre (string) - the genre of the song
- mood (string) - the mood of the song
- allowVocals (boolean) - true if vocals are allowed, false if not (if false, the song should be instrumental)
- energyRange (string) - 'low', 'medium', or 'high'
- genrePreference (string) - the genre the user prefers
- duration (number) - the duration of the song in seconds

It is very important that if the user provides a seed track, the response should also include the seed track in the response.
The seed track should be the first object in the response. The seed track MUST be included in the response.

The song should be a good fit for the user's mood and energy level.
The song should be a good fit for the user's genre preference.
The song should be a good fit for the user's target BPM.
The song should be a good fit for the user's allowVocals preference.
The song should be a good fit for the user's energyRange preference.
The song should be a good fit for the user's genrePreference preference.
The song should be a good fit for the user's target BPM.

Do NOT include any Spotify-specific fields (spotifyUrl, spotifyId, etc.) as these will be fetched separately.
`;

  const seedByTrackOnly = input.seedTrack && !(input.seedArtist) && !(input.seedAlbum);
  const seedByArtistOnly = input.seedArtist && !(input.seedTrack) && !(input.seedAlbum);
  const seedByAlbumOnly = input.seedAlbum && !(input.seedTrack) && !(input.seedArtist);
  const seedByNone = !(input.seedTrack) && !(input.seedArtist) && !(input.seedAlbum);
  const seedByAll = input.seedTrack && input.seedArtist && input.seedAlbum;

  const userPrompt = `
Find ${input.allowVocals ? '' : 'instrumental '}songs around ${input.targetBPM} BPM
that feel ${input.mood}${input.energyRange ? ` and have ${input.energyRange} energy` : ''}.
${seedByTrackOnly ? `Recommend songs similar to "${input.seedTrack}."` : ''}
${seedByArtistOnly ? `Recommend songs by "${input.seedArtist}."` : ''}
${seedByAlbumOnly ? `Recommend songs from the album "${input.seedAlbum}."` : ''}
${seedByAll ? `Recommend songs similar to "${input.seedTrack}" by "${input.seedArtist}" from the album "${input.seedAlbum}."` : ''}
${seedByNone ? 'Recommend songs based on the above criteria.' : ''}
${input.genrePreference ? `Favor the ${input.genrePreference} genre.` : ''}
Respond in properly formatted JSON only. Do not include any other text or code geate characters.
`;

  return { systemPrompt: systemPrompt.trim(), userPrompt: userPrompt.trim() };
}