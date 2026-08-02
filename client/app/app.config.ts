export default defineAppConfig({
  ui: {
    colors: {
      primary: 'green',
      neutral: 'zinc'
    },
    button: {
      slots: {
        base: 'cursor-pointer h-11'
      }
    },
    input: {
      slots: {
        base: 'h-11 placeholder:text-xs'
      }
    },
    textarea: {
      slots: {
        base: 'placeholder:text-xs'
      }
    },
    select: {
      slots: {
        base: 'h-11',
        placeholder: 'text-xs'
      }
    },
    selectMenu: {
      slots: {
        base: 'h-11',
        placeholder: 'text-xs'
      }
    },
    locale: {
      search: 'جستجو...',
      noResults: 'موردی یافت نشد',
      theme: 'پوسته',
      light: 'روشن',
      dark: 'تیره',
      system: 'سیستم'
    }
  }
})
