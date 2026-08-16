<script setup lang="ts">
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Placeholder from '@tiptap/extension-placeholder'
import TextAlign from '@tiptap/extension-text-align'

const props = defineProps<{
  modelValue: string
  placeholder?: string
}>()

const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

const editor = useEditor({
  content: props.modelValue,
  extensions: [
    StarterKit,
    Underline,
    Placeholder.configure({
      placeholder: props.placeholder ?? 'متن را وارد کنید...',
    }),
    TextAlign.configure({
      types: ['heading', 'paragraph'],
    }),
  ],
  editorProps: {
    attributes: {
      class: 'tiptap-editor',
    },
  },
  onUpdate({ editor }) {
    emit('update:modelValue', editor.getHTML())
  },
})

watch(
  () => props.modelValue,
  (val) => {
    if (editor.value && editor.value.getHTML() !== val) {
      editor.value.commands.setContent(val, false)
    }
  }
)

onBeforeUnmount(() => editor.value?.destroy())

const tools = computed(() => [
  {
    group: [
      { icon: 'i-lucide-bold', action: () => editor.value?.chain().focus().toggleBold().run(), active: () => editor.value?.isActive('bold') },
      { icon: 'i-lucide-italic', action: () => editor.value?.chain().focus().toggleItalic().run(), active: () => editor.value?.isActive('italic') },
      { icon: 'i-lucide-underline', action: () => editor.value?.chain().focus().toggleUnderline().run(), active: () => editor.value?.isActive('underline') },
      { icon: 'i-lucide-strikethrough', action: () => editor.value?.chain().focus().toggleStrike().run(), active: () => editor.value?.isActive('strike') },
    ],
  },
  {
    group: [
      { icon: 'i-lucide-align-right', action: () => editor.value?.chain().focus().setTextAlign('right').run(), active: () => editor.value?.isActive({ textAlign: 'right' }) },
      { icon: 'i-lucide-align-center', action: () => editor.value?.chain().focus().setTextAlign('center').run(), active: () => editor.value?.isActive({ textAlign: 'center' }) },
      { icon: 'i-lucide-align-left', action: () => editor.value?.chain().focus().setTextAlign('left').run(), active: () => editor.value?.isActive({ textAlign: 'left' }) },
    ],
  },
  {
    group: [
      { icon: 'i-lucide-list', action: () => editor.value?.chain().focus().toggleBulletList().run(), active: () => editor.value?.isActive('bulletList') },
      { icon: 'i-lucide-list-ordered', action: () => editor.value?.chain().focus().toggleOrderedList().run(), active: () => editor.value?.isActive('orderedList') },
      { icon: 'i-lucide-text-quote', action: () => editor.value?.chain().focus().toggleBlockquote().run(), active: () => editor.value?.isActive('blockquote') },
    ],
  },
  {
    group: [
      { icon: 'i-lucide-undo', action: () => editor.value?.chain().focus().undo().run(), active: () => false },
      { icon: 'i-lucide-redo', action: () => editor.value?.chain().focus().redo().run(), active: () => false },
    ],
  },
])
</script>

<template>
  <div class="rich-editor border border-(--ui-border) rounded-md overflow-hidden focus-within:ring-2 focus-within:ring-(--ui-primary)">
    <!-- Toolbar -->
    <div class="flex flex-wrap items-center gap-1 px-2 py-1.5 border-b border-(--ui-border) bg-(--ui-bg-elevated)">
      <template v-for="(tool, i) in tools" :key="i">
        <UButton
          v-for="btn in tool.group"
          :key="btn.icon"
          :icon="btn.icon"
          size="xs"
          variant="ghost"
          :color="btn.active() ? 'primary' : 'neutral'"
          :class="{ 'bg-(--ui-bg-accented)': btn.active() }"
          @click="btn.action()"
        />
        <UDivider
          v-if="i < tools.length - 1"
          orientation="vertical"
          class="h-5 mx-0.5"
        />
      </template>
    </div>

    <!-- Content -->
    <EditorContent :editor="editor" />
  </div>
</template>

<style>
.tiptap-editor {
  min-height: 150px;
  padding: 0.75rem;
  outline: none;
  font-size: 0.875rem;
  line-height: 1.7;
  direction: rtl;
}

.tiptap-editor p { margin: 0 0 0.5rem; }
.tiptap-editor strong { font-weight: 700; }
.tiptap-editor em { font-style: italic; }
.tiptap-editor u { text-decoration: underline; }
.tiptap-editor s { text-decoration: line-through; }

.tiptap-editor ul {
  list-style-type: disc;
  padding-right: 1.5rem;
  margin: 0.5rem 0;
}

.tiptap-editor ol {
  list-style-type: decimal;
  padding-right: 1.5rem;
  margin: 0.5rem 0;
}

.tiptap-editor blockquote {
  border-right: 3px solid var(--ui-border-accented);
  padding-right: 0.75rem;
  color: var(--ui-text-muted);
  margin: 0.5rem 0;
}

.tiptap-editor p.is-editor-empty:first-child::before {
  content: attr(data-placeholder);
  float: right;
  color: var(--ui-text-muted);
  pointer-events: none;
  height: 0;
}
</style>