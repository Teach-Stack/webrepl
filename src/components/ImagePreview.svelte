<script lang="ts">
import { repls } from '$lib/state'
import Button from './ui/Button.svelte'

type Props = {
  filePath: string[]
}

let { filePath }: Props = $props()

const imageContent = $derived(repls.getFileContentInCurrentRepl(filePath))

const imageName = $derived(filePath[filePath.length - 1])

const isSvg = $derived(imageName.toLowerCase().endsWith('.svg'))

// Extract image dimensions from loaded image
let imageElement = $state<HTMLImageElement>()
let imageDimensions = $state({ width: 0, height: 0 })
let imageSize = $state('')

$effect(() => {
  if (imageContent) {
    // Calculate approximate size of the base64 content
    if (!isSvg && imageContent.startsWith('data:')) {
      // For base64 images, estimate the file size
      const base64Length = imageContent.split(',')[1]?.length || 0
      const padding = (imageContent.match(/=/g) || []).length
      const sizeInBytes = Math.round((base64Length * 3) / 4) - padding
      imageSize = formatFileSize(sizeInBytes)
    } else if (isSvg) {
      // For SVG, use the text length
      const sizeInBytes = new TextEncoder().encode(imageContent).length
      imageSize = formatFileSize(sizeInBytes)
    }
  }
})

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`
}

function handleImageLoad() {
  if (imageElement) {
    imageDimensions = {
      width: imageElement.naturalWidth,
      height: imageElement.naturalHeight,
    }
  }
}

function downloadImage() {
  if (!imageContent) return

  const link = document.createElement('a')

  if (isSvg) {
    // For SVG, create a blob from the text content
    const blob = new Blob([imageContent], { type: 'image/svg+xml' })
    link.href = URL.createObjectURL(blob)
  } else {
    // For other images, use the data URL directly
    link.href = imageContent
  }

  link.download = imageName
  link.click()

  // Clean up object URL if created
  if (isSvg) {
    setTimeout(() => URL.revokeObjectURL(link.href), 100)
  }
}
</script>

<div class="image-preview-container h-full flex flex-col bg-white rounded-lg border-1 border-slate-4 overflow-hidden">
  <!-- Header with image info -->
  <div class="border-b-1 border-slate-4 bg-slate-1 px-4 py-2 flex justify-between items-center">
    <div class="flex items-center gap-4">
      <span class="font-mono text-lg">{imageName}</span>
      <div class="flex gap-3 text-sm text-slate-10">
        {#if imageDimensions.width > 0}
          <span>{imageDimensions.width} × {imageDimensions.height}px</span>
        {/if}
        {#if imageSize}
          <span>{imageSize}</span>
        {/if}
      </div>
    </div>
    <Button
      onclick={downloadImage}
      variant="default"
      size="sm"
      title="Download image"
    >
      <div class="i-ph:download-simple size-4"></div>
      Download
    </Button>
  </div>
  
  <!-- Image display area -->
  <div class="flex-1 flex items-center justify-center p-8 bg-slate-2 overflow-auto">
    {#if imageContent}
      {#if isSvg}
        <!-- For SVG files, display as inline SVG or in an object tag -->
        {#if imageContent.startsWith('<svg')}
          <!-- If it's raw SVG content -->
          <div class="svg-container max-w-full max-h-full">
            {@html imageContent}
          </div>
        {:else}
          <!-- If it's a data URL or other format -->
          <img
            bind:this={imageElement}
            src={imageContent}
            alt={imageName}
            onload={handleImageLoad}
            class="max-w-full max-h-full object-contain shadow-lg"
          />
        {/if}
      {:else}
        <img
          bind:this={imageElement}
          src={imageContent}
          alt={imageName}
          onload={handleImageLoad}
          class="max-w-full max-h-full object-contain shadow-lg"
        />
      {/if}
    {:else}
      <div class="text-slate-10 text-center">
        <div class="i-ph:image size-12 mx-auto mb-2"></div>
        <p>No image content available</p>
      </div>
    {/if}
  </div>
</div>

<style>
  :global(.svg-container svg) {
    max-width: 100%;
    max-height: 100%;
    width: auto;
    height: auto;
  }
</style>
