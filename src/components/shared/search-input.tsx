'use client'

import { Search, X } from 'lucide-react'
import { useId } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface SearchInputProps {
  value: string
  onValueChange: (value: string) => void
  label: string
  placeholder?: string
}

export function SearchInput({ value, onValueChange, label, placeholder }: SearchInputProps) {
  const id = useId()

  return (
    <div className="relative">
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <Search
        className="pointer-events-none absolute top-1/2 left-3.5 size-[18px] -translate-y-1/2 text-muted-foreground"
        aria-hidden="true"
      />
      <Input
        id={id}
        type="search"
        role="searchbox"
        value={value}
        placeholder={placeholder ?? label}
        onChange={(event) => {
          onValueChange(event.target.value)
        }}
        className="pr-12 pl-11"
      />
      {value.length > 0 ? (
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Clear search"
          onClick={() => {
            onValueChange('')
          }}
          className="absolute top-1/2 right-2 -translate-y-1/2 text-muted-foreground"
        >
          <X aria-hidden="true" />
        </Button>
      ) : null}
    </div>
  )
}
