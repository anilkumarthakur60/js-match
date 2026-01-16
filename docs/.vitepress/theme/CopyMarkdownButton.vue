<template>
  <div class="copy-markdown-button-container">
    <button
      class="copy-markdown-button"
      @click="copyMarkdown"
      :title="copyStatus"
    >
      <span v-if="!copied" class="icon">📋</span>
      <span v-else class="icon">✓</span>
      {{ copied ? 'Copied!' : 'Copy Markdown' }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRoute } from 'vitepress'

const route = useRoute()
const copied = ref(false)
const copyStatus = ref('Copy page markdown to clipboard')

const copyMarkdown = async () => {
  try {
    // Get all text content from the main article
    const article = document.querySelector('main article')
    if (!article) {
      alert('Could not find article content')
      return
    }

    // Extract markdown from the page
    const markdown = extractMarkdown(article)

    // Copy to clipboard
    await navigator.clipboard.writeText(markdown)

    copied.value = true
    copyStatus.value = 'Copied to clipboard!'

    // Reset after 2 seconds
    setTimeout(() => {
      copied.value = false
      copyStatus.value = 'Copy page markdown to clipboard'
    }, 2000)
  } catch (err) {
    console.error('Failed to copy:', err)
    alert('Failed to copy markdown to clipboard')
  }
}

const extractMarkdown = (element: Element): string => {
  let markdown = ''

  const processNode = (node: Node, level: number = 0): void => {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent?.trim()
      if (text) {
        markdown += text + '\n'
      }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as Element

      if (el.tagName === 'H1') {
        markdown += `# ${el.textContent}\n\n`
      } else if (el.tagName === 'H2') {
        markdown += `## ${el.textContent}\n\n`
      } else if (el.tagName === 'H3') {
        markdown += `### ${el.textContent}\n\n`
      } else if (el.tagName === 'H4') {
        markdown += `#### ${el.textContent}\n\n`
      } else if (el.tagName === 'H5') {
        markdown += `##### ${el.textContent}\n\n`
      } else if (el.tagName === 'H6') {
        markdown += `###### ${el.textContent}\n\n`
      } else if (el.tagName === 'P') {
        markdown += `${el.textContent}\n\n`
      } else if (el.tagName === 'LI') {
        markdown += `- ${el.textContent}\n`
      } else if (el.tagName === 'CODE' && el.parentElement?.tagName !== 'PRE') {
        markdown += `\`${el.textContent}\``
      } else if (el.tagName === 'PRE') {
        const code = el.querySelector('code')
        if (code) {
          markdown += `\`\`\`\n${code.textContent}\n\`\`\`\n\n`
        }
      } else if (el.tagName === 'STRONG' || el.tagName === 'B') {
        markdown += `**${el.textContent}**`
      } else if (el.tagName === 'EM' || el.tagName === 'I') {
        markdown += `*${el.textContent}*`
      } else if (el.tagName === 'A') {
        const href = (el as HTMLAnchorElement).href
        markdown += `[${el.textContent}](${href})`
      } else if (el.tagName === 'UL' || el.tagName === 'OL') {
        Array.from(el.children).forEach(child => {
          processNode(child, level + 1)
        })
      } else if (el.tagName !== 'SCRIPT' && el.tagName !== 'STYLE') {
        Array.from(el.childNodes).forEach(child => {
          processNode(child, level)
        })
      }
    }
  }

  processNode(element)
  return markdown.trim()
}
</script>

<style scoped>
.copy-markdown-button-container {
  margin: 2rem 0;
  display: flex;
  justify-content: center;
}

.copy-markdown-button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background-color: var(--vp-button-brand-bg);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.copy-markdown-button:hover {
  background-color: var(--vp-button-brand-hover-bg);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.copy-markdown-button:active {
  transform: translateY(0);
}

.icon {
  font-size: 1.2em;
}

@media (max-width: 768px) {
  .copy-markdown-button {
    padding: 0.5rem 1rem;
    font-size: 0.9rem;
  }
}
</style>
