export default defineAppConfig({
  ui: {
    colors: {
      primary: 'green',
      neutral: 'zinc'
    },
    button: {
      slots: {
        base: 'cursor-pointer h-auto min-h-11',
        label: 'sm:truncate'
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
        base: 'h-11 px-3 relative',
        /* show selected value right-aligned */
        placeholder: 'sm:truncate text-right w-full',
        value: 'sm:truncate text-right w-full',
        /* offset leading/trailing icons from edges for balanced spacing */
        leading: 'absolute inset-y-0 end-3 flex items-center',
        trailing: 'absolute inset-y-0 start-3 flex items-center'
      },
      /* neutralise theme's trailing icon padding so both sides share px-3 */
      compoundVariants: ['xs', 'sm', 'md', 'lg', 'xl'].map((size) => ({
        trailing: true,
        size,
        class: 'pe-3'
      }))
    },
    selectMenu: {
      slots: {
        base: 'h-11 px-3 relative',
        placeholder: 'sm:truncate text-right w-full',
        value: 'sm:truncate text-right w-full',
        leading: 'absolute inset-y-0 end-3 flex items-center',
        trailing: 'absolute inset-y-0 start-3 flex items-center'
      },
      compoundVariants: ['xs', 'sm', 'md', 'lg', 'xl'].map((size) => ({
        trailing: true,
        size,
        class: 'pe-3'
      }))
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
