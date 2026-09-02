<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    ratingAvg: number
    ratingCount: number
    myScore: number | null
    distribution: Record<1 | 2 | 3 | 4 | 5, number>
    isLoggedIn: boolean
    loading?: boolean
    submitting?: boolean
  }>(),
  {
    loading: false,
    submitting: false
  }
)

const emit = defineEmits<{
  rate: [score: number]
}>()

const hoverScore = ref(0)
const burstKey = ref(0)

const displayScore = computed(() => hoverScore.value || props.myScore || 0)
const avgLabel = computed(() =>
  props.ratingCount > 0
    ? props.ratingAvg.toLocaleString('fa-IR', {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1
      })
    : '—'
)

const maxDist = computed(() =>
  Math.max(1, ...Object.values(props.distribution ?? {}))
)

function onEnter(score: number): void {
  if (props.submitting) return
  hoverScore.value = score
}

function onLeave(): void {
  hoverScore.value = 0
}

function onSelect(score: number): void {
  if (!props.isLoggedIn || props.submitting) return
  burstKey.value += 1
  emit('rate', score)
}

function starFilled(score: number): boolean {
  return score <= displayScore.value
}

function barWidth(score: 1 | 2 | 3 | 4 | 5): string {
  const count = props.distribution?.[score] ?? 0
  return `${Math.round((count / maxDist.value) * 100)}%`
}
</script>

<template>
  <section
    class="overflow-hidden rounded-3xl border border-default bg-gradient-to-br from-elevated via-elevated to-primary/5 p-5 sm:p-6"
    dir="rtl"
  >
    <div class="flex flex-col gap-6 lg:flex-row lg:items-stretch">
      <div class="flex flex-col items-center justify-center gap-3 lg:w-44">
        <div class="relative">
          <div
            class="flex size-24 items-center justify-center rounded-full bg-primary/10 text-primary shadow-[0_0_40px_rgba(0,193,106,0.18)]"
          >
            <span class="text-3xl font-black tabular-nums tracking-tight">
              {{ avgLabel }}
            </span>
          </div>
          <div
            class="pointer-events-none absolute inset-0 animate-ping rounded-full bg-primary/10 opacity-40"
            style="animation-duration: 2.8s"
          />
        </div>
        <p class="text-xs text-toned">
          از {{ ratingCount.toLocaleString('fa-IR') }} امتیاز
        </p>
      </div>

      <div class="min-w-0 flex-1 space-y-5">
        <div>
          <h2 class="text-base font-black text-highlighted sm:text-lg">
            امتیاز کاربران
          </h2>
          <p class="mt-1 text-sm text-toned">
            نظرات متنی جدا هستند؛ اینجا فقط ستاره بدهید.
          </p>
        </div>

        <div
          class="flex flex-wrap items-center gap-2"
          @mouseleave="onLeave"
        >
          <button
            v-for="score in [1, 2, 3, 4, 5]"
            :key="score"
            type="button"
            class="group relative size-11 rounded-2xl transition-transform duration-200 ease-out hover:scale-110 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 sm:size-12"
            :disabled="!isLoggedIn || submitting"
            :aria-label="`امتیاز ${score}`"
            @mouseenter="onEnter(score)"
            @focus="onEnter(score)"
            @click="onSelect(score)"
          >
            <UIcon
              name="i-lucide-star"
              class="size-8 transition-all duration-300 sm:size-9"
              :class="starFilled(score)
                ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.55)] scale-110'
                : 'text-muted/50 group-hover:text-amber-300'"
            />
            <span
              v-if="burstKey && myScore === score"
              :key="burstKey"
              class="pointer-events-none absolute inset-0 animate-[ping_0.7s_ease-out_1] rounded-full bg-amber-400/30"
            />
          </button>

          <span
            v-if="myScore"
            class="mr-1 text-xs font-medium text-primary"
          >
            امتیاز شما: {{ myScore.toLocaleString('fa-IR') }} از ۵
          </span>
          <span
            v-else-if="!isLoggedIn"
            class="mr-1 text-xs text-muted"
          >
            برای امتیازدهی وارد شوید
          </span>
        </div>

        <div class="space-y-2">
          <div
            v-for="score in [5, 4, 3, 2, 1]"
            :key="score"
            class="flex items-center gap-3"
          >
            <span class="w-6 text-xs tabular-nums text-muted">
              {{ score.toLocaleString('fa-IR') }}
            </span>
            <div class="h-2 flex-1 overflow-hidden rounded-full bg-default">
              <div
                class="h-full rounded-full bg-gradient-to-l from-amber-400 to-primary transition-all duration-700 ease-out"
                :style="{ width: barWidth(score as 1 | 2 | 3 | 4 | 5) }"
              />
            </div>
            <span class="w-8 text-left text-[11px] tabular-nums text-muted">
              {{ (distribution?.[score as 1 | 2 | 3 | 4 | 5] ?? 0).toLocaleString('fa-IR') }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="loading"
      class="mt-4 flex items-center gap-2 text-xs text-muted"
    >
      <UIcon
        name="i-lucide-loader-2"
        class="size-3.5 animate-spin"
      />
      در حال بارگذاری امتیازها...
    </div>
  </section>
</template>
