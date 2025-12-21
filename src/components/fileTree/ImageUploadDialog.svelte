<script lang="ts">
import Dialog from '../ui/Dialog.svelte'
import Button from '../ui/Button.svelte'
import Compressor from 'compressorjs'

import { repls, editor } from '$lib/state'

type Props = {
  open: boolean
  directory?: string[]
}

let { open = $bindable(false), directory = [] }: Props = $props()

let fileInput: HTMLInputElement
let selectedFile = $state<File | null>(null)
let newFileName = $state('')
let fileNameError = $state('')
let isCompressing = $state(false)
let originalSize = $state(0)
let compressedSize = $state(0)
let compressedDataUrl = $state('')

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

function validateFileName(name: string): boolean {
  // Check for empty name
  if (!name.trim()) {
    fileNameError = 'File name cannot be empty'
    return false
  }

  // Only allow alphanumeric, dots, dashes, underscores
  const validPattern = /^[a-zA-Z0-9._-]+$/
  if (!validPattern.test(name)) {
    fileNameError =
      'File name can only contain letters, numbers, dots, dashes, and underscores'
    return false
  }

  fileNameError = ''
  return true
}

async function handleFileSelection(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  
  if (!file) return
  
  // Check if it's an image
  if (!file.type.startsWith('image/')) {
    fileNameError = 'Please select an image file'
    selectedFile = null
    return
  }
  
  selectedFile = file
  originalSize = file.size
  newFileName = file.name
  fileNameError = ''
  
  // Handle SVG files differently (no compression)
  if (file.type === 'image/svg+xml' || file.name.toLowerCase().endsWith('.svg')) {
    const reader = new FileReader()
    reader.onload = (e) => {
      compressedDataUrl = e.target?.result as string
      compressedSize = originalSize
    }
    reader.readAsText(file)
    return
  }
  
  // Compress other image types
  isCompressing = true
  
  try {
    await compressImage(file)
  } catch (error) {
    console.error('Compression error:', error)
    fileNameError = 'Failed to compress image. Please try again.'
    selectedFile = null
    isCompressing = false
  }
}

function compressImage(file: File): Promise<void> {
  return new Promise((resolve, reject) => {
    new Compressor(file, {
      quality: 0.9,
      maxWidth: 1920,
      convertSize: 1000000, // Automatically reduce quality if > 1MB
      success(result) {
        compressedSize = result.size
        
        // Convert blob to base64
        const reader = new FileReader()
        reader.onloadend = () => {
          compressedDataUrl = reader.result as string
          isCompressing = false
          resolve()
        }
        reader.onerror = () => {
          reject(new Error('Failed to read compressed image'))
        }
        reader.readAsDataURL(result)
      },
      error(err) {
        reject(err)
      }
    })
  })
}

function uploadImage() {
  if (!validateFileName(newFileName)) return
  if (!compressedDataUrl) return
  
  const fullPath = [...directory, newFileName]
  
  // For SVG files, store as text
  if (selectedFile?.type === 'image/svg+xml' || newFileName.toLowerCase().endsWith('.svg')) {
    repls.addFileToCurrentRepl(fullPath, compressedDataUrl)
  } else {
    // For other images, store as base64
    repls.addFileToCurrentRepl(fullPath, compressedDataUrl)
  }
  
  editor.currentFilePath = fullPath
  
  // Reset state
  selectedFile = null
  newFileName = ''
  originalSize = 0
  compressedSize = 0
  compressedDataUrl = ''
  open = false
}

function handleCancel() {
  selectedFile = null
  newFileName = ''
  fileNameError = ''
  originalSize = 0
  compressedSize = 0
  compressedDataUrl = ''
  open = false
}

$effect(() => {
  if (open) {
    selectedFile = null
    newFileName = ''
    fileNameError = ''
    originalSize = 0
    compressedSize = 0
    compressedDataUrl = ''
  }
})
</script>

<Dialog bind:open>
  {#snippet title()}
    <h2 class="text-2xl font-semibold">Upload Image</h2>
  {/snippet}
  
  {#snippet description()}
    <p class="text-slate-11">
      {#if directory.length > 0}
        Uploading to: <span class="font-mono text-sm">{directory.join('/')}/</span>
      {:else}
        Uploading to root directory
      {/if}
    </p>
  {/snippet}
  
  <div class="space-y-4">
    <!-- File Input -->
    <div>
      <input
        bind:this={fileInput}
        type="file"
        accept="image/*"
        onchange={handleFileSelection}
        class="hidden"
        id="imageFileInput"
      />
      <label
        for="imageFileInput"
        class="block w-full px-4 py-3 border-2 border-dashed border-slate-4 rounded-lg cursor-pointer hover:border-blue-5 transition-colors text-center"
      >
        {#if selectedFile}
          <div class="text-green-9">
            ✓ Selected: {selectedFile.name}
          </div>
        {:else}
          <div class="text-slate-10">
            Click to select an image
          </div>
        {/if}
      </label>
    </div>
    
    <!-- Compression Status -->
    {#if isCompressing}
      <div class="flex items-center justify-center py-4">
        <span class="i-svg-spinners:3-dots-fade size-8 text-blue-5"></span>
        <span class="ml-2 text-slate-10">Compressing image...</span>
      </div>
    {:else if selectedFile && compressedSize > 0}
      <div class="bg-slate-2 rounded p-3">
        <div class="text-sm text-slate-11">
          <span class="font-medium">Original:</span> {formatFileSize(originalSize)}
          {#if compressedSize < originalSize}
            → <span class="font-medium text-green-9">Compressed:</span> {formatFileSize(compressedSize)}
            <span class="text-green-9 ml-1">
              (-{Math.round((1 - compressedSize / originalSize) * 100)}%)
            </span>
          {:else}
            <span class="text-slate-10 ml-1">(No compression needed)</span>
          {/if}
        </div>
      </div>
    {/if}
    
    <!-- File Name Input -->
    {#if selectedFile && !isCompressing}
      <div>
        <label for="fileName" class="block text-sm font-medium mb-2">
          File Name
        </label>
        <input
          id="fileName"
          type="text"
          bind:value={newFileName}
          oninput={() => fileNameError = ''}
          placeholder="image.jpg"
          class="w-full px-3 py-2 border-1 border-slate-4 rounded focus:outline-none focus:border-blue-5 font-mono"
        />
        {#if fileNameError}
          <p class="text-red-9 text-sm mt-1">{fileNameError}</p>
        {/if}
        <p class="text-slate-10 text-xs mt-1">
          Only letters, numbers, dots, dashes, and underscores allowed
        </p>
      </div>
    {/if}
    
    <!-- Action Buttons -->
    <div class="flex justify-end gap-2">
      <Button 
        variant="default" 
        onclick={handleCancel}
      >
        Cancel
      </Button>
      <Button 
        variant="blue" 
        onclick={uploadImage}
        disabled={!selectedFile || isCompressing || !compressedDataUrl}
      >
        Upload Image
      </Button>
    </div>
  </div>
</Dialog>
