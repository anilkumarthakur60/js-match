<template>
  <div v-show="!isIndexPage" ref="wrapper" class="copy-button-wrapper">
    <button
      class="copy-markdown-button"
      @click="copyMarkdown"
      :title="copyStatus"
      type="button"
    >
      <span v-if="!copied" class="icon">📋</span>
      <span v-else class="icon">✓</span>
      {{ copied ? 'Copied!' : 'Copy Page' }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useRoute } from 'vitepress'

const route = useRoute()
const wrapper = ref<HTMLElement | null>(null)

const copied = ref(false)
const copyStatus = ref('Copy page markdown to clipboard')

const isIndexPage = computed(() => {
  return (
    route.path === '/' ||
    route.path === '/guide/' ||
    route.path === '/api/' ||
    route.path === '/examples/'
  )
})

function findFirstH1(): HTMLElement | null {
  return (
    (document.querySelector('.VPDoc h1') as HTMLElement) ||
    (document.querySelector('main h1') as HTMLElement) ||
    null
  )
}

async function wrapTitleAndButtonInRow() {
  await nextTick()

  const btnWrap = wrapper.value
  const h1 = findFirstH1()
  if (!btnWrap || !h1) return

  // avoid doing it twice
  const existingRow = h1.closest('.vp-title-row')
  if (existingRow) {
    // ensure button is still inside row
    if (!existingRow.contains(btnWrap)) existingRow.appendChild(btnWrap)
    return
  }

  // create flex row wrapper
  const row = document.createElement('div')
  row.className = 'vp-title-row'

  // insert row where h1 currently is
  h1.parentNode?.insertBefore(row, h1)

  // move h1 + button into row
  row.appendChild(h1)
  row.appendChild(btnWrap)
}

onMounted(() => wrapTitleAndButtonInRow())

watch(
  () => route.path,
  () => wrapTitleAndButtonInRow()
)

const copyMarkdown = async () => {
  try {
    let content = ''
    const docContent =
      document.querySelector('.VPDoc .content-container') ||
      document.querySelector('.VPDoc') ||
      document.querySelector('main')

    if (docContent) content = (docContent as HTMLElement).innerText

    if (!content || content.trim().length === 0) {
      alert('Could not find article content')
      return
    }

    await navigator.clipboard.writeText(content)

    copied.value = true
    copyStatus.value = 'Copied to clipboard!'
    setTimeout(() => {
      copied.value = false
      copyStatus.value = 'Copy page markdown to clipboard'
    }, 2000)
  } catch (err) {
    console.error(err)
    alert('Failed to copy markdown to clipboard')
  }
}
</script>

<style scoped>
/* The flex row that contains H1 + button */
:global(.vp-title-row) {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

/* prevent h1 from pushing button to next line */
:global(.vp-title-row > h1) {
  margin: 0;              /* VitePress gives h1 margin; remove it for row layout */
  flex: 1;
  min-width: 0;
}

/* button wrapper should sit on the right */
.copy-button-wrapper {
  margin: 0;              /* important: remove vertical margins */
  display: flex;
  justify-content: flex-end;
  flex-shrink: 0;
}

.copy-markdown-button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 1.0rem;
  background-color: var(--vp-button-brand-bg);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.copy-markdown-button:hover {
  background-color: var(--vp-button-brand-hover-bg);
  transform: translateY(-1px);
}

.icon {
  font-size: 1.1em;
}

/* on mobile stack nicely */
@media (max-width: 640px) {
  :global(.vp-title-row) {
    flex-direction: column;
    align-items: flex-start;
  }
  .copy-button-wrapper {
    width: 100%;
    justify-content: flex-start;
    margin-top: 0.5rem;
  }
}
</style>
