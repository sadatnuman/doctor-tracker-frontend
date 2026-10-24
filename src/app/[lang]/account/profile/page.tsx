import { ProfileView } from "@/components/profile/profile-view"
import { privatePageMetadata } from "@/i18n/server"

export const generateMetadata = privatePageMetadata((d) => d.profile.title)

export default function ProfilePage() {
  return <ProfileView />
}
