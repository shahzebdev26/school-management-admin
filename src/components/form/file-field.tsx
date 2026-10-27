'use client'

import { CircleAlert, File as FileIcon, Upload, X } from 'lucide-react'
import { useId, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

const BYTES_PER_MB = 1_048_576

interface SelectedFileRowProps {
  file: File
  canRemove: boolean
  isUploading: boolean
  percent: number | undefined
  onRemove: () => void
}

function SelectedFileRow({
  file,
  canRemove,
  isUploading,
  percent,
  onRemove,
}: SelectedFileRowProps) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-card p-3 shadow-sm">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-accent text-accent-foreground">
        <FileIcon className="size-[18px]" aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold">{file.name}</p>
        <p className="tabular text-[13px] text-muted-foreground">
          {(file.size / BYTES_PER_MB).toFixed(1)} MB
          {isUploading && percent !== undefined ? ` · ${String(percent)}%` : ''}
        </p>
        {isUploading && percent !== undefined ? (
          <UploadProgress percent={percent} fileName={file.name} />
        ) : null}
      </div>
      {canRemove ? (
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={`Remove ${file.name}`}
          className="shrink-0 text-muted-foreground"
          onClick={onRemove}
        >
          <X aria-hidden="true" />
        </Button>
      ) : null}
    </div>
  )
}

interface UploadProgressProps {
  percent: number
  fileName: string
}

function UploadProgress({ percent, fileName }: UploadProgressProps) {
  return (
    <div
      role="progressbar"
      aria-valuenow={percent}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`Uploading ${fileName}`}
      className="mt-2 h-2 overflow-hidden rounded-full bg-brand-100"
    >
      <div
        className="h-full rounded-full bg-primary transition-all"
        style={{ width: `${String(percent)}%` }}
      />
    </div>
  )
}

interface FilePickerProps {
  inputId: string
  accept: string
  disabled: boolean
  selected: File | undefined
  progress: number | undefined
  onSelect: (file: File | undefined) => void
}

function FilePicker({ inputId, accept, disabled, selected, progress, onSelect }: FilePickerProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const isUploading = progress !== undefined

  return (
    <>
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={accept}
        disabled={disabled || isUploading}
        className="sr-only"
        onChange={(event) => {
          onSelect(event.target.files?.[0])
        }}
      />
      {selected ? (
        <SelectedFileRow
          file={selected}
          canRemove={!isUploading}
          isUploading={isUploading}
          percent={progress}
          onRemove={() => {
            onSelect(undefined)
            if (inputRef.current) {
              inputRef.current.value = ''
            }
          }}
        />
      ) : (
        <button
          type="button"
          disabled={disabled}
          onClick={() => {
            inputRef.current?.click()
          }}
          className="flex cursor-pointer flex-col items-center gap-1.5 rounded-xl border-2 border-dashed border-input px-5 py-5 text-center transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-55"
        >
          <Upload className="size-6 text-primary" aria-hidden="true" />
          <span className="font-bold">Choose file</span>
        </button>
      )}
    </>
  )
}

interface FileFieldProps {
  label: string
  accept: string
  maxSizeMb: number
  selected?: File | undefined
  onSelect: (file: File | undefined) => void
  progress?: number | undefined
  error?: string | undefined
  disabled?: boolean
}

export function FileField({
  label,
  accept,
  maxSizeMb,
  selected,
  onSelect,
  progress,
  error,
  disabled = false,
}: FileFieldProps) {
  const id = useId()

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>{label}</Label>

      <FilePicker
        inputId={id}
        accept={accept}
        disabled={disabled}
        selected={selected}
        progress={progress}
        onSelect={onSelect}
      />

      <p className="text-[13px] text-muted-foreground">
        {accept.replaceAll('.', '').toUpperCase()} up to {maxSizeMb} MB
      </p>

      {error ? (
        <p className="flex gap-1.5 text-[13px] font-semibold text-destructive-text">
          <CircleAlert className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
          {error}
        </p>
      ) : null}
    </div>
  )
}
