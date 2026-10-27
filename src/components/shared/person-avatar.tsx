import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

interface PersonAvatarProps {
  name: string
  photoUrl?: string | undefined
  className?: string | undefined
}

function toInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  const first = parts[0]?.[0] ?? ''
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? '') : ''

  return (first + last).toUpperCase() || '?'
}

export function PersonAvatar({ name, photoUrl, className }: PersonAvatarProps) {
  return (
    <Avatar className={cn('size-8', className)}>
      {photoUrl ? <AvatarImage src={photoUrl} alt="" /> : null}
      <AvatarFallback className="text-xs">{toInitials(name)}</AvatarFallback>
    </Avatar>
  )
}
