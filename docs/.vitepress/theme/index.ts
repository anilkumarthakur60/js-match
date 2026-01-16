import { h } from 'vue'
import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import CopyMarkdownButton from './CopyMarkdownButton.vue'

export default {
  extends: DefaultTheme,
  Layout: () => {
    return h(DefaultTheme.Layout, null, {
      'doc-after': () => h(CopyMarkdownButton)
    })
  }
} satisfies Theme
