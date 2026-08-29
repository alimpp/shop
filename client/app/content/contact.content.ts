import { SITE_NAME } from '~/utils/seo'

export const contactContent = {
  brand: SITE_NAME,
  hero: {
    headline: 'همین حالا با ما در ارتباط باشید',
    support:
      'سوال دربارهٔ محصول، وضعیت سفارش یا مشاورهٔ خرید؛ تیم پشتیبانی پاسخگوست.',
    primaryCta: { label: 'ارسال پیام', to: '#contact-form' },
    secondaryCta: { label: 'چت پشتیبانی', to: '/profile/support' }
  },
  channels: {
    title: 'راه‌های ارتباطی',
    support: 'از مسیر دلخواهتان با ما حرف بزنید.',
    items: [
      {
        key: 'phone',
        label: 'تلفن پشتیبانی',
        value: '۰۲۱-۹۱۰۹۱۲۳۴',
        href: 'tel:+982191091234',
        hint: 'شنبه تا پنجشنبه، ۹ تا ۱۸',
        icon: 'i-lucide-phone'
      },
      {
        key: 'mobile',
        label: 'موبایل / واتساپ',
        value: '۰۹۱۲ ۱۲۳ ۴۵۶۷',
        href: 'tel:+989121234567',
        hint: 'پاسخ سریع‌تر در ساعات اداری',
        icon: 'i-lucide-smartphone'
      },
      {
        key: 'email',
        label: 'ایمیل',
        value: 'support@vistashop.ir',
        href: 'mailto:support@vistashop.ir',
        hint: 'پاسخ تا یک روز کاری',
        icon: 'i-lucide-mail'
      },
      {
        key: 'address',
        label: 'آدرس فروشگاه',
        value: 'تهران، خیابان ولیعصر، پلاک ۱۲۴۰',
        href: 'https://maps.google.com/?q=تهران+ولیعصر',
        hint: 'بازدید حضوری با هماهنگی قبلی',
        icon: 'i-lucide-map-pin'
      }
    ]
  },
  hours: {
    title: 'ساعات پاسخگویی',
    rows: [
      { day: 'شنبه تا چهارشنبه', time: '۹:۰۰ تا ۱۸:۰۰' },
      { day: 'پنجشنبه', time: '۹:۰۰ تا ۱۴:۰۰' },
      { day: 'جمعه و تعطیلات رسمی', time: 'تعطیل' }
    ]
  },
  form: {
    title: 'پیام بگذارید',
    support: 'فرم را پر کنید؛ در کوتاه‌ترین زمان با شما تماس می‌گیریم.',
    fields: {
      name: { label: 'نام و نام خانوادگی', placeholder: 'مثلاً علی رضایی' },
      phone: { label: 'شماره تماس', placeholder: '۰۹۱۲xxxxxxx' },
      subject: { label: 'موضوع', placeholder: 'مثلاً مشاوره خرید لپ‌تاپ' },
      message: {
        label: 'متن پیام',
        placeholder: 'سوال یا درخواست خود را بنویسید...'
      }
    },
    submitLabel: 'ارسال پیام',
    successTitle: 'پیام شما ثبت شد',
    successDescription: 'به‌زودی از طریق شماره تماس با شما ارتباط می‌گیریم.'
  },
  seo: {
    title: `تماس با ما | ${SITE_NAME}`,
    description:
      `ارتباط با پشتیبانی ${SITE_NAME}؛ تلفن، ایمیل و فرم تماس برای مشاوره خرید لپ‌تاپ، مانیتور و پیگیری سفارش.`,
    keywords:
      'تماس با فروشگاه دیجیتال, پشتیبانی فروشگاه, مشاوره خرید لپ تاپ'
  }
} as const
