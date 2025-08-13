"use client";

import { useState } from "react";
import { Search, Plus, ChevronDown, ChevronUp, Play } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import Image from "next/image";

type TrackResult = {
  title: string;
  artist: string;
  notes: string;
  tempo?: number;
  energy?: number;
  genre?: string;
  mood?: string;
  allowVocals?: boolean;
  energyRange?: string;
  genrePreference?: string;
  duration?: number;
};

import { SpotifyTrack } from "@/types/track"

type TrackSearchRequest = {
  targetBPM: number;
  mood: Mood;
  allowVocals: boolean;
  energyRange?: "low" | "medium" | "high";
  genrePreference?: string;
  seedTrack?: string;
  seedArtist?: string;
  seedAlbum?: string;
};

type Mood =
  | "energetic"
  | "chill"
  | "moody"
  | "romantic"
  | "dark"
  | "uplifting"
  | "aggressive"
  | "groovy"
  | "dreamy"
  | "melancholy"
  | "happy"
  | "sexy"
  | "introspective"
  | "fun"
  | "nostalgic";

interface TrackChatPanelProps {
  onAddTrack: (track: SpotifyTrack) => void;
}

export default function TrackChatPanel({ onAddTrack }: TrackChatPanelProps) {
  const [form, setForm] = useState<TrackSearchRequest>({
    targetBPM: 112,
    mood: "energetic",
    allowVocals: true,
    energyRange: "medium",
    genrePreference: "rock",
    seedTrack: "",
    seedArtist: "",
    seedAlbum: "",
  });

  const [loading, setLoading] = useState(false);
  const [resultTracks, setResultTracks] = useState<TrackResult[]>([]);
  const [expandedTracks, setExpandedTracks] = useState<Set<string>>(new Set());
  const [spotifyResults, setSpotifyResults] = useState<Record<string, SpotifyTrack[]>>({});
  const [searchingTracks, setSearchingTracks] = useState<Set<string>>(new Set());

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked =
      e.target instanceof HTMLInputElement ? e.target.checked : false;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSearch = async () => {
    setLoading(true);
    setResultTracks([]);
    setSpotifyResults({});
    setExpandedTracks(new Set());

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userInput: form }),
      });
      const data = await res.json();

      let gptTracks: TrackResult[] = [];

      if (data.content && Array.isArray(data.content)) {
        gptTracks = data.content;
      } else if (data.error) {
        console.error("API error:", data.error);
        gptTracks = [];
      } else {
        console.warn("Unexpected API response structure:", data);
        gptTracks = [];
      }

      setResultTracks(gptTracks);
    } catch (err) {
      console.error("GPT fetch failed:", err);
      setResultTracks([]);
    } finally {
      setLoading(false);
    }
  };

  const searchSpotifyForTrack = async (track: TrackResult) => {
    const trackKey = `${track.title}-${track.artist}`;

    if (spotifyResults[trackKey]) {
      // Toggle expansion if already searched
      setExpandedTracks(prev => {
        const newSet = new Set(prev);
        if (newSet.has(trackKey)) {
          newSet.delete(trackKey);
        } else {
          newSet.add(trackKey);
        }
        return newSet;
      });
      return;
    }

    setSearchingTracks(prev => new Set(prev).add(trackKey));

    try {
      const searchQuery = `${track.title} ${track.artist}`;
      const res = await fetch(`/api/spotify/search?q=${encodeURIComponent(searchQuery)}&limit=5`);

      if (!res.ok) {
        throw new Error(`Search failed: ${res.status}`);
      }

      const data = await res.json();
      const spotifyTracks = data.tracks?.items || [];

      setSpotifyResults(prev => ({
        ...prev,
        [trackKey]: spotifyTracks
      }));

      setExpandedTracks(prev => new Set(prev).add(trackKey));
    } catch (error) {
      console.error("Spotify search failed:", error);
      setSpotifyResults(prev => ({
        ...prev,
        [trackKey]: []
      }));
    } finally {
      setSearchingTracks(prev => {
        const newSet = new Set(prev);
        newSet.delete(trackKey);
        return newSet;
      });
    }
  };

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <Card
      className="bg-white/5 border-white/10 backdrop-blur-sm h-full flex flex-col"
      data-ref="wa.track-chat-panel.container"
    >
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Search className="h-5 w-5" />
          AI Suggestions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 flex-1">
        <div
          className="space-y-2"
          data-ref="wa.track-chat-panel.bpm.input-section"
        >
          <Label className="text-white">Target BPM</Label>
          <Input
            type="number"
            name="targetBPM"
            value={form.targetBPM}
            onChange={handleChange}
            className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
            data-ref="wa.track-chat-panel.bpm.input"
          />
        </div>

        <div
          className="space-y-2"
          data-ref="wa.track-chat-panel.input-section.track"
        >
          <Label className="text-white">Seed Track</Label>
          <Input
            type="text"
            name="seedTrack"
            value={form.seedTrack}
            onChange={handleChange}
            className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
            data-ref="wa.track-chat-panel.seed-track.input"
          />
        </div>

        <div
          className="space-y-2"
          data-ref="wa.track-chat-panel.input-section.artist"
        >
          <Label className="text-white">Seed Artist</Label>
          <Input
            type="text"
            name="seedArtist"
            value={form.seedArtist}
            onChange={handleChange}
            className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
            data-ref="wa.track-chat-panel.seed-artist.input"
          />
        </div>

        <div
          className="space-y-2"
          data-ref="wa.track-chat-panel.input-section.album"
        >
          <Label className="text-white">Seed Album</Label>
          <Input
            type="text"
            name="seedAlbum"
            value={form.seedAlbum}
            onChange={handleChange}
            className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
            data-ref="wa.track-chat-panel.seed-album.input"
          />
        </div>

        <div
          className="space-y-2"
          data-ref="wa.track-chat-panel.input-section.album"
        >
          <Label className="text-white">Genre Preference</Label>
          <Input
            type="text"
            name="genrePreference"
            value={form.genrePreference}
            onChange={handleChange}
            placeholder="optional"
            className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
            data-ref="wa.track-chat-panel.genre.input"
          />
        </div>

        <div
          className="space-y-2"
          data-ref="wa.track-chat-panel.mood.input-section"
        >
          <Label className="text-white">Mood</Label>
          <select
            name="mood"
            value={form.mood}
            onChange={handleChange}
            className="w-full bg-white/10 border border-white/20 text-white rounded-md px-3 py-2"
            data-ref="wa.track-chat-panel.mood.select"
          >
            <option value="energetic">Energetic</option>
            <option value="chill">Chill</option>
            <option value="moody">Moody</option>
            <option value="romantic">Romantic</option>
            <option value="dark">Dark</option>
            <option value="uplifting">Uplifting</option>
            <option value="aggressive">Aggressive</option>
            <option value="groovy">Groovy</option>
            <option value="dreamy">Dreamy</option>
            <option value="melancholy">Melancholy</option>
            <option value="happy">Happy</option>
            <option value="sexy">Sexy</option>
            <option value="introspective">Introspective</option>
            <option value="fun">Fun</option>
            <option value="nostalgic">Nostalgic</option>
          </select>
        </div>

        <div
          className="space-y-2"
          data-ref="wa.track-chat-panel.energy.input-section"
        >
          <Label className="text-white">Energy Range</Label>
          <select
            name="energyRange"
            value={form.energyRange}
            onChange={handleChange}
            className="w-full bg-white/10 border border-white/20 text-white rounded-md px-3 py-2"
            data-ref="wa.track-chat-panel.energy.select"
          >
            <option value="">Any</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        <div
          className="flex items-center gap-2"
          data-ref="wa.track-chat-panel.vocals.checkbox-section"
        >
          <input
            type="checkbox"
            name="allowVocals"
            checked={form.allowVocals}
            onChange={handleChange}
            className="rounded border-white/20 bg-white/10"
            data-ref="wa.track-chat-panel.vocals.checkbox"
          />
          <Label className="text-white">Allow vocals</Label>
        </div>

        <Button
          onClick={handleSearch}
          disabled={loading}
          className="w-full bg-green-500 hover:bg-green-600"
          data-ref="wa.track-chat-panel.search.button"
        >
          {loading ? "Searching..." : "Search"}
        </Button>

        {resultTracks.length > 0 && (
          <div
            className="space-y-3 max-h-96 overflow-y-auto"
            data-ref="wa.track-chat-panel.results.container"
          >
            {resultTracks.map((track, idx) => {
              const trackKey = `${track.title}-${track.artist}`;
              const isExpanded = expandedTracks.has(trackKey);
              const isSearching = searchingTracks.has(trackKey);
              const spotifyMatches = spotifyResults[trackKey] || [];

              return (
                <div
                  key={idx}
                  className="bg-white/5 rounded-lg border border-white/10 overflow-hidden"
                  data-ref={`wa.track-chat-panel.results.result-item.${idx}`}
                >
                  {/* Track Header */}
                  <div
                    className="flex items-center justify-between p-3 cursor-pointer hover:bg-white/5"
                    onClick={() => searchSpotifyForTrack(track)}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-white truncate">
                        {track.title}
                      </p>
                      <p className="text-sm text-white/60 truncate">
                        {track.artist}
                      </p>
                      <p className="text-xs text-white/40 truncate">
                        {track.notes}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {isSearching ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : isExpanded ? (
                        <ChevronUp className="h-4 w-4 text-white/60" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-white/60" />
                      )}
                    </div>
                  </div>

                  {/* Spotify Matches */}
                  {isExpanded && (
                    <div className="border-t border-white/10 bg-white/5">
                      <div className="p-3 text-sm text-white/60">
                        Found {spotifyMatches.length} Spotify matches:
                      </div>
                      <div className="space-y-1 pb-3">
                        {spotifyMatches.map((spotifyTrack) => (
                          <div
                            key={spotifyTrack.id}
                            className="flex items-center justify-between px-3 py-2 hover:bg-white/5"
                          >
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              {spotifyTrack.images?.[0]?.url ? (
                                <Image
                                  width={32}
                                  height={32}
                                  src={spotifyTrack.images[0].url}
                                  alt="Album cover"
                                  className="w-8 h-8 rounded"
                                />
                              ) : (
                                <div className="w-8 h-8 bg-white/10 rounded flex items-center justify-center">
                                  <Play className="h-4 w-4 text-white/40" />
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-white truncate">
                                  {spotifyTrack.name}
                                </p>
                                <p className="text-xs text-white/60 truncate">
                                  {spotifyTrack.album.name} • {formatDuration(spotifyTrack.duration_ms)}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {spotifyTrack.preview_url && (
                                <a
                                  href={spotifyTrack.preview_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-green-400 hover:text-green-300 text-sm"
                                >
                                  Listen
                                </a>
                              )}
                              <Button
                                onClick={() => onAddTrack(spotifyTrack)}
                                size="sm"
                                variant="outline"
                                className="bg-green-500/20 border-green-500/30 text-green-400 hover:bg-green-500/30"
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                        {spotifyMatches.length === 0 && !isSearching && (
                          <div className="px-3 py-2 text-sm text-white/40">
                            No Spotify matches found
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
