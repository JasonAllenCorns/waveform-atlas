"use client"

import { LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useSession, signOut } from "next-auth/react"
import Image from "next/image"

export function Header() {
  const { data: session } = useSession()

  return (
    <header className="border-b border-brand-primary/20 bg-brand-primary/90 backdrop-blur-sm" data-ref="wa.header.container">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center" data-ref="wa.header.logo.container">
          <Image
            src="/waveform-logo.png"
            alt="Waveform Atlas"
            width={200}
            height={40}
            className="h-8 w-auto"
            priority
            data-ref="wa.header.logo.image"
          />
        </div>

        <div className="flex items-center gap-4" data-ref="wa.header.user.container">
          <span className="text-brand-light/80 text-sm" data-ref="wa.header.user.welcome">Welcome, {session?.user?.name}</span>
          <Avatar data-ref="wa.header.user.avatar">
            <AvatarImage src={session?.user?.image || ""} />
            <AvatarFallback className="bg-brand-accent text-brand-primary">
              {session?.user?.name?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
          <Button
            variant="outline"
            size="sm"
            onClick={() => signOut()}
            className="border-brand-light/20 text-brand-light/80 hover:bg-brand-light/10 bg-transparent"
            data-ref="wa.header.user.sign-out.button"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>
    </header>
  )
}
