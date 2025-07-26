"use client"

import { signIn } from "next-auth/react"
import { Search, Save, Shuffle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"

export function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-primary via-brand-secondary to-brand-accent">
      {/* Header */}
      <header className="border-b border-brand-light/10 bg-brand-primary/90 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Image
            src="/waveform-logo.png"
            alt="Waveform Atlas"
            width={200}
            height={40}
            className="h-8 w-auto"
            priority
          />
          <Button
            onClick={() => signIn("spotify")}
            className="bg-brand-accent hover:bg-brand-accent/80 text-brand-primary font-semibold px-6"
          >
            Connect with Spotify
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-brand-light mb-6">
            Create Perfect Playlists
            <br />
            <span className="text-brand-accent">with Precision</span>
          </h2>
          <p className="text-xl text-brand-light/80 mb-8 max-w-2xl mx-auto">
            Search, filter, and curate your Spotify playlists with advanced controls. Filter by tempo, energy, and more
            to find exactly the right vibe.
          </p>
          <Button
            onClick={() => signIn("spotify")}
            size="lg"
            className="bg-brand-accent hover:bg-brand-accent/80 text-brand-primary font-semibold px-8 py-4 text-lg"
          >
            Get Started with Spotify
          </Button>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="bg-brand-light/5 border-brand-light/10 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <Search className="h-12 w-12 text-brand-accent mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-brand-light mb-3">Advanced Search</h3>
              <p className="text-brand-light/70">
                Filter tracks by tempo, energy level, and other audio features to find the perfect songs.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-brand-light/5 border-brand-light/10 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <Shuffle className="h-12 w-12 text-brand-accent mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-brand-light mb-3">Drag & Drop</h3>
              <p className="text-brand-light/70">
                Easily reorder tracks with intuitive drag-and-drop functionality to craft the perfect flow.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-brand-light/5 border-brand-light/10 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <Save className="h-12 w-12 text-brand-accent mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-brand-light mb-3">Save to Spotify</h3>
              <p className="text-brand-light/70">
                Create new playlists or merge tracks into existing ones directly in your Spotify library.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Preview Image */}
        <div className="text-center">
          <div className="inline-block p-4 bg-brand-light/5 rounded-2xl border border-brand-light/10 backdrop-blur-sm">
            <img
              src="/design-mockup.png"
              alt="Waveform Atlas Interface Preview"
              className="rounded-lg max-w-full h-auto"
              style={{ maxHeight: "500px" }}
            />
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <h3 className="text-3xl font-bold text-brand-light mb-4">Ready to get started?</h3>
          <p className="text-brand-light/70 mb-8">Connect your Spotify account to begin creating amazing playlists.</p>
          <Button
            onClick={() => signIn("spotify")}
            size="lg"
            className="bg-brand-accent hover:bg-brand-accent/80 text-brand-primary font-semibold px-8 py-4 text-lg"
          >
            <Image src="/waveform-logo.png" alt="" width={20} height={20} className="h-5 w-5 mr-2" />
            Connect Spotify Account
          </Button>
        </div>
      </main>
    </div>
  )
}
