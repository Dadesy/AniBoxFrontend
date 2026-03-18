<script setup lang="ts">
import { PRESET_AVATAR_SEEDS, presetAvatarUrl } from '~/types/user'

const props = defineProps<{
  currentUrl: string | null
  open: boolean
}>()

const emit = defineEmits<{
  close: []
  selectPreset: [presetId: string]
  uploadFile:   [file: File]
}>()

const tab            = ref<'presets' | 'upload'>('presets')
const selectedId     = ref<string | null>(null)
const uploading      = ref(false)
const uploadError    = ref<string | null>(null)
const dragOver       = ref(false)
const previewUrl     = ref<string | null>(null)
const fileInput      = ref<HTMLInputElement | null>(null)

// Reset on open
watch(() => props.open, (open) => {
  if (open) {
    selectedId.value  = null
    uploadError.value = null
    previewUrl.value  = null
    tab.value         = 'presets'
  }
})

const presets = PRESET_AVATAR_SEEDS.map((p) => ({
  id:  p.id,
  url: presetAvatarUrl(p.seed),
}))

function selectPreset(id: string) {
  selectedId.value = id
}

async function confirmPreset() {
  if (!selectedId.value) return
  emit('selectPreset', selectedId.value)
  emit('close')
}

function pickFile(e: Event) {
  const input = e.target as HTMLInputElement
  const file  = input.files?.[0]
  if (file) processFile(file)
}

function onDrop(e: DragEvent) {
  dragOver.value = false
  const file = e.dataTransfer?.files?.[0]
  if (file) processFile(file)
}

function processFile(file: File) {
  uploadError.value = null

  const MAX_SIZE  = 5 * 1024 * 1024
  const ALLOWED   = ['image/jpeg', 'image/png', 'image/webp']

  if (file.size > MAX_SIZE) {
    uploadError.value = 'Файл слишком большой (макс. 5 МБ)'
    return
  }
  if (!ALLOWED.includes(file.type)) {
    uploadError.value = 'Разрешены только JPG, PNG, WebP'
    return
  }

  // Show preview
  const reader = new FileReader()
  reader.onload = (ev) => { previewUrl.value = ev.target?.result as string }
  reader.readAsDataURL(file)

  // Emit for parent to handle upload
  uploadSelectedFile.value = file
}

const uploadSelectedFile = ref<File | null>(null)

async function confirmUpload() {
  if (!uploadSelectedFile.value) return
  uploading.value = true
  uploadError.value = null
  try {
    emit('uploadFile', uploadSelectedFile.value)
    emit('close')
  } catch (e: unknown) {
    uploadError.value = (e as Error)?.message ?? 'Ошибка загрузки'
  } finally {
    uploading.value = false
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="open"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        @click.self="emit('close')"
      >
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/70 backdrop-blur-sm" @click="emit('close')" />

        <!-- Modal -->
        <div class="relative z-10 w-full max-w-lg rounded-2xl border border-white/8 bg-[#0d0d10] shadow-2xl">

          <!-- Header -->
          <div class="flex items-center justify-between border-b border-white/6 px-6 py-4">
            <h2 class="text-base font-bold text-white">Сменить аватар</h2>
            <button
              class="flex h-8 w-8 items-center justify-center rounded-lg text-white/40 transition-colors hover:bg-white/8 hover:text-white"
              @click="emit('close')"
            >
              <UIcon name="i-heroicons-x-mark" class="h-5 w-5" />
            </button>
          </div>

          <!-- Tabs -->
          <div class="flex border-b border-white/6">
            <button
              v-for="t in [{ key: 'presets', label: 'Готовые' }, { key: 'upload', label: 'Загрузить' }]"
              :key="t.key"
              class="flex-1 py-3 text-sm font-medium transition-colors"
              :class="tab === t.key
                ? 'border-b-2 border-green-500 text-white'
                : 'text-white/40 hover:text-white/70'"
              @click="tab = t.key as 'presets' | 'upload'"
            >
              {{ t.label }}
            </button>
          </div>

          <!-- Presets tab -->
          <div v-if="tab === 'presets'" class="p-5">
            <div class="grid grid-cols-4 gap-3 sm:grid-cols-5">
              <button
                v-for="preset in presets"
                :key="preset.id"
                class="group relative aspect-square overflow-hidden rounded-xl border-2 transition-all duration-200"
                :class="selectedId === preset.id
                  ? 'border-green-500 ring-2 ring-green-500/30 scale-105'
                  : 'border-transparent hover:border-white/20 hover:scale-[1.03]'"
                @click="selectPreset(preset.id)"
              >
                <img
                  :src="preset.url"
                  :alt="preset.id"
                  class="h-full w-full object-cover bg-[#1a1a24]"
                />
                <!-- Selected checkmark -->
                <div
                  v-if="selectedId === preset.id"
                  class="absolute inset-0 flex items-center justify-center bg-green-500/20"
                >
                  <div class="flex h-6 w-6 items-center justify-center rounded-full bg-green-500">
                    <UIcon name="i-heroicons-check" class="h-4 w-4 text-white" />
                  </div>
                </div>
              </button>
            </div>

            <div class="mt-5 flex justify-end gap-3">
              <button
                class="rounded-xl px-5 py-2.5 text-sm font-medium text-white/60 transition-colors hover:text-white"
                @click="emit('close')"
              >
                Отмена
              </button>
              <button
                class="rounded-xl bg-green-500 px-5 py-2.5 text-sm font-bold text-black shadow-lg shadow-green-500/20 transition-all hover:bg-green-400 disabled:cursor-not-allowed disabled:opacity-50"
                :disabled="!selectedId"
                @click="confirmPreset"
              >
                Сохранить
              </button>
            </div>
          </div>

          <!-- Upload tab -->
          <div v-else class="p-5">
            <!-- Drop zone / preview -->
            <div
              class="relative flex flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed transition-all"
              :class="dragOver
                ? 'border-green-500 bg-green-500/5'
                : 'border-white/10 bg-white/[0.02] hover:border-white/20'"
              style="min-height: 200px"
              @dragover.prevent="dragOver = true"
              @dragleave="dragOver = false"
              @drop.prevent="onDrop"
            >
              <template v-if="previewUrl">
                <img :src="previewUrl" class="h-48 w-48 rounded-xl object-cover" />
                <button
                  class="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white/60 hover:text-white"
                  @click="previewUrl = null; uploadSelectedFile = null"
                >
                  <UIcon name="i-heroicons-x-mark" class="h-4 w-4" />
                </button>
              </template>
              <template v-else>
                <UIcon name="i-heroicons-cloud-arrow-up" class="mb-3 h-10 w-10 text-white/20" />
                <p class="text-sm font-medium text-white/60">
                  Перетащите файл или
                  <button
                    class="text-green-400 underline underline-offset-2 hover:text-green-300"
                    @click="fileInput?.click()"
                  >выберите</button>
                </p>
                <p class="mt-1 text-xs text-white/30">JPG, PNG, WebP — до 5 МБ</p>
              </template>
            </div>

            <input
              ref="fileInput"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              class="hidden"
              @change="pickFile"
            />

            <p v-if="uploadError" class="mt-3 text-sm text-red-400">{{ uploadError }}</p>

            <div class="mt-5 flex justify-end gap-3">
              <button
                class="rounded-xl px-5 py-2.5 text-sm font-medium text-white/60 transition-colors hover:text-white"
                @click="emit('close')"
              >
                Отмена
              </button>
              <button
                class="flex items-center gap-2 rounded-xl bg-green-500 px-5 py-2.5 text-sm font-bold text-black shadow-lg shadow-green-500/20 transition-all hover:bg-green-400 disabled:cursor-not-allowed disabled:opacity-50"
                :disabled="!uploadSelectedFile || uploading"
                @click="confirmUpload"
              >
                <UIcon v-if="uploading" name="i-heroicons-arrow-path" class="h-4 w-4 animate-spin" />
                {{ uploading ? 'Загрузка...' : 'Сохранить' }}
              </button>
            </div>
          </div>

        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-enter-active, .modal-leave-active { transition: all 0.2s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; transform: scale(0.97); }
</style>
