<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from 'vue'
import { FileText, Upload, Trash2, X } from '@lucide/vue'
import { validateDocumentFile } from '@/lib/security'
import type { FileUploadAreaProps } from './types'

const props = withDefaults(defineProps<FileUploadAreaProps>(), {
  multiple: false,
  maxSizeMB: 10,
})

const emit = defineEmits<{
  fileChange: [field: string, files: FileList | null]
}>()

const fileInput = ref<HTMLInputElement | null>(null)

const fileKey = computed(() => props.field.split('.')[1] || props.field)
const selectedFile = computed(() => props.fileSelections[fileKey.value])
const hasFile = computed(() => Boolean(selectedFile.value))

const isUploading = ref(false)
const uploadProgress = ref(0)
const prevFileName = ref<string | null>(null)
const sizeError = ref<string | null>(null)

let progressTimer: ReturnType<typeof setInterval> | undefined
let doneTimer: ReturnType<typeof setTimeout> | undefined

function clearTimers() {
  if (progressTimer !== undefined) {
    clearInterval(progressTimer)
    progressTimer = undefined
  }
  if (doneTimer !== undefined) {
    clearTimeout(doneTimer)
    doneTimer = undefined
  }
}

function formatFileSize(bytes?: number) {
  if (!bytes) return ''
  const mb = bytes / (1024 * 1024)
  return mb < 1 ? `${Math.round(bytes / 1024)} KB` : `${mb.toFixed(2)} MB`
}

function handleFileSelect(event: Event) {
  const input = event.target as HTMLInputElement
  const files = input.files
  if (files && files.length > 0) {
    for (const file of Array.from(files)) {
      const result = validateDocumentFile(file, props.maxSizeMB)
      if (!result.valid) {
        sizeError.value = result.error ?? 'Invalid file'
        input.value = ''
        return
      }
    }
    sizeError.value = null
  } else {
    sizeError.value = null
  }
  emit('fileChange', props.field, files)
}

watch(
  () => selectedFile.value?.name,
  (currentFileName) => {
    clearTimers()
    if (currentFileName && currentFileName !== prevFileName.value) {
      prevFileName.value = currentFileName
      isUploading.value = true
      uploadProgress.value = 0

      const duration = 1500
      const interval = 30
      const steps = duration / interval
      const increment = 100 / steps
      let progress = 0

      progressTimer = setInterval(() => {
        progress += increment
        if (progress >= 100) {
          progress = 100
          if (progressTimer !== undefined) {
            clearInterval(progressTimer)
            progressTimer = undefined
          }
          doneTimer = setTimeout(() => {
            isUploading.value = false
            uploadProgress.value = 0
          }, 200)
        }
        uploadProgress.value = Math.min(progress, 100)
      }, interval)
    } else if (!currentFileName) {
      prevFileName.value = null
      isUploading.value = false
      uploadProgress.value = 0
    }
  },
)

onUnmounted(clearTimers)

const displayError = computed(() => props.error || sizeError.value)
const isSuccess = computed(() => hasFile.value && !displayError.value && !isUploading.value)

const containerClasses = computed(() => {
  let classes =
    'relative w-full overflow-hidden rounded-xl cursor-pointer flex items-center justify-between p-4 transition-all duration-200 '
  if (displayError.value) {
    classes += 'border-2 border-om-error bg-om-error/5'
  } else if (isSuccess.value) {
    classes += 'border border-om-green bg-om-green/5'
  } else {
    classes += 'border border-gray-300 bg-white hover:bg-gray-50 hover:border-om-green'
  }
  return classes
})

const iconClass = computed(() =>
  displayError.value
    ? 'text-om-error'
    : isSuccess.value
      ? 'text-om-green'
      : 'text-gray-500',
)

function handleRemove(event: MouseEvent) {
  event.stopPropagation()
  sizeError.value = null
  emit('fileChange', props.field, null)
}

function openPicker() {
  fileInput.value?.click()
}

defineExpose({ openPicker, fileInput })
</script>

<template>
  <div>
    <input
      ref="fileInput"
      type="file"
      class="hidden"
      accept=".pdf,.png,.jpg,.jpeg"
      :multiple="multiple"
      @change="handleFileSelect"
    />

    <div :class="containerClasses" @click="openPicker">
      <div class="flex items-center gap-3">
        <FileText :class="['h-5 w-5 shrink-0', iconClass]" />
        <div>
          <p :class="['text-sm font-medium', hasFile ? 'text-gray-800' : 'text-gray-400']">
            {{ selectedFile ? selectedFile.name : label }}
          </p>

          <p v-if="displayError" class="text-xs font-medium text-om-error">{{ displayError }}</p>
          <p v-else-if="isUploading" class="text-xs text-gray-400">Uploading...</p>
          <p v-else-if="isSuccess" class="text-xs text-gray-400">
            {{ formatFileSize(selectedFile?.size) }}
          </p>
          <p v-else class="text-xs text-gray-400">PDF, PNG or JPG. Max {{ maxSizeMB }} MB</p>
        </div>
      </div>

      <X
        v-if="displayError"
        class="h-5 w-5 shrink-0 text-om-error"
        @click="handleRemove"
      />
      <X
        v-else-if="isUploading"
        class="h-5 w-5 shrink-0 text-gray-500"
        @click="handleRemove"
      />
      <Trash2
        v-else-if="isSuccess"
        class="h-5 w-5 shrink-0 text-gray-500"
        @click="handleRemove"
      />
      <Upload v-else class="h-5 w-5 shrink-0 text-gray-500" />

      <div v-if="isUploading" class="absolute inset-x-0 bottom-0 h-1 bg-gray-100">
        <div
          class="h-full bg-om-green transition-all duration-300"
          :style="{ width: `${uploadProgress}%` }"
        />
      </div>
    </div>
  </div>
</template>
