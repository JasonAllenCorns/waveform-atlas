import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export function getAuthSession() {
  return getServerSession(authOptions)
}
