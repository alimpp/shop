import { useToast } from '#imports'

let _toast: ReturnType<typeof useToast>

export const toast = {
  add: (options: Parameters<ReturnType<typeof useToast>['add']>[0]) => {
    _toast?.add(options)
  }
}

export default defineNuxtPlugin(() => {
  _toast = useToast()
})