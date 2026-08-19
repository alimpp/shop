export interface TIranCity {
  id: string
  name: string
}

export interface TIranProvince {
  id: string
  name: string
  cities: TIranCity[]
}

export const IRAN_PROVINCES: TIranProvince[] = [
  {
    id: 'tehran',
    name: 'تهران',
    cities: [
      { id: 'tehran-city', name: 'تهران' },
      { id: 'islamshahr', name: 'اسلامشهر' },
      { id: 'rey', name: 'ری' },
      { id: 'varamin', name: 'ورامین' },
      { id: 'pakdasht', name: 'پاکدشت' },
      { id: 'shahriar', name: 'شهریار' },
      { id: 'malard', name: 'ملارد' },
      { id: 'robat-karim', name: 'رباط‌کریم' },
      { id: 'damavand', name: 'دماوند' },
      { id: 'firuzkuh', name: 'فیروزکوه' }
    ]
  },
  {
    id: 'alborz',
    name: 'البرز',
    cities: [
      { id: 'karaj', name: 'کرج' },
      { id: 'fardis', name: 'فردیس' },
      { id: 'nazarabad', name: 'نظرآباد' },
      { id: 'savojbolagh', name: 'ساوجبلاغ' },
      { id: 'eshtehard', name: 'اشتهارد' },
      { id: 'hashtgerd', name: 'هشتگرد' }
    ]
  },
  {
    id: 'isfahan',
    name: 'اصفهان',
    cities: [
      { id: 'isfahan-city', name: 'اصفهان' },
      { id: 'kashan', name: 'کاشان' },
      { id: 'najafabad', name: 'نجف‌آباد' },
      { id: 'khomeinishahr', name: 'خمینی‌شهر' },
      { id: 'shahinshahr', name: 'شاهین‌شهر' },
      { id: 'mobarakeh', name: 'مبارکه' },
      { id: 'falavarjan', name: 'فلاورجان' }
    ]
  },
  {
    id: 'fars',
    name: 'فارس',
    cities: [
      { id: 'shiraz', name: 'شیراز' },
      { id: 'marvdasht', name: 'مرودشت' },
      { id: 'jahrom', name: 'جهرم' },
      { id: 'kazerun', name: 'کازرون' },
      { id: 'lar', name: 'لار' },
      { id: 'fasa', name: 'فسا' }
    ]
  },
  {
    id: 'razavi-khorasan',
    name: 'خراسان رضوی',
    cities: [
      { id: 'mashhad', name: 'مشهد' },
      { id: 'neyshabur', name: 'نیشابور' },
      { id: 'sabzevar', name: 'سبزوار' },
      { id: 'torbat-heydarieh', name: 'تربت حیدریه' },
      { id: 'quchan', name: 'قوچان' },
      { id: 'kashmar', name: 'کاشمر' }
    ]
  },
  {
    id: 'east-azerbaijan',
    name: 'آذربایجان شرقی',
    cities: [
      { id: 'tabriz', name: 'تبریز' },
      { id: 'maragheh', name: 'مراغه' },
      { id: 'marand', name: 'مرند' },
      { id: 'miyaneh', name: 'میانه' },
      { id: 'ahar', name: 'اهر' }
    ]
  },
  {
    id: 'west-azerbaijan',
    name: 'آذربایجان غربی',
    cities: [
      { id: 'urmia', name: 'ارومیه' },
      { id: 'khoy', name: 'خوی' },
      { id: 'mahabad', name: 'مهاباد' },
      { id: 'bukan', name: 'بوکان' },
      { id: 'miandoab', name: 'میاندوآب' }
    ]
  },
  {
    id: 'gilan',
    name: 'گیلان',
    cities: [
      { id: 'rasht', name: 'رشت' },
      { id: 'bandar-anzali', name: 'بندرانزلی' },
      { id: 'lahijan', name: 'لاهیجان' },
      { id: 'langarud', name: 'لنگرود' },
      { id: 'astara', name: 'آستارا' }
    ]
  },
  {
    id: 'mazandaran',
    name: 'مازندران',
    cities: [
      { id: 'sari', name: 'ساری' },
      { id: 'babol', name: 'بابل' },
      { id: 'amol', name: 'آمل' },
      { id: 'qaemshahr', name: 'قائم‌شهر' },
      { id: 'babolsar', name: 'بابلسر' },
      { id: 'nowshahr', name: 'نوشهر' },
      { id: 'chalus', name: 'چالوس' }
    ]
  },
  {
    id: 'khuzestan',
    name: 'خوزستان',
    cities: [
      { id: 'ahvaz', name: 'اهواز' },
      { id: 'abadan', name: 'آبادان' },
      { id: 'khorramshahr', name: 'خرمشهر' },
      { id: 'dezful', name: 'دزفول' },
      { id: 'andimeshk', name: 'اندیمشک' },
      { id: 'behbahan', name: 'بهبهان' }
    ]
  },
  {
    id: 'kerman',
    name: 'کرمان',
    cities: [
      { id: 'kerman-city', name: 'کرمان' },
      { id: 'rafsanjan', name: 'رفسنجان' },
      { id: 'sirjan', name: 'سیرجان' },
      { id: 'bam', name: 'بم' },
      { id: 'jiroft', name: 'جیرفت' }
    ]
  },
  {
    id: 'qom',
    name: 'قم',
    cities: [{ id: 'qom-city', name: 'قم' }]
  },
  {
    id: 'qazvin',
    name: 'قزوین',
    cities: [
      { id: 'qazvin-city', name: 'قزوین' },
      { id: 'alvand', name: 'الوند' },
      { id: 'takestan', name: 'تاکستان' },
      { id: 'abyek', name: 'آبیک' }
    ]
  },
  {
    id: 'markazi',
    name: 'مرکزی',
    cities: [
      { id: 'arak', name: 'اراک' },
      { id: 'saveh', name: 'ساوه' },
      { id: 'khomein', name: 'خمین' },
      { id: 'mahallat', name: 'محلات' }
    ]
  },
  {
    id: 'hamadan',
    name: 'همدان',
    cities: [
      { id: 'hamadan-city', name: 'همدان' },
      { id: 'malayer', name: 'ملایر' },
      { id: 'nahavand', name: 'نهاوند' },
      { id: 'tuyserkan', name: 'تویسرکان' }
    ]
  },
  {
    id: 'kermanshah',
    name: 'کرمانشاه',
    cities: [
      { id: 'kermanshah-city', name: 'کرمانشاه' },
      { id: 'eslamabad-gharb', name: 'اسلام‌آباد غرب' },
      { id: 'kangavar', name: 'کنگاور' },
      { id: 'javanrud', name: 'جوانرود' }
    ]
  },
  {
    id: 'yazd',
    name: 'یزد',
    cities: [
      { id: 'yazd-city', name: 'یزد' },
      { id: 'ardakan', name: 'اردکان' },
      { id: 'meybod', name: 'میبد' },
      { id: 'bafq', name: 'بافق' }
    ]
  },
  {
    id: 'semnan',
    name: 'سمنان',
    cities: [
      { id: 'semnan-city', name: 'سمنان' },
      { id: 'shahroud', name: 'شاهرود' },
      { id: 'damghan', name: 'دامغان' },
      { id: 'garmsar', name: 'گرمسار' }
    ]
  },
  {
    id: 'golestan',
    name: 'گلستان',
    cities: [
      { id: 'gorgan', name: 'گرگان' },
      { id: 'gonbad', name: 'گنبد کاووس' },
      { id: 'aliabad', name: 'علی‌آباد' },
      { id: 'bandar-turkmen', name: 'بندرترکمن' }
    ]
  },
  {
    id: 'ardabil',
    name: 'اردبیل',
    cities: [
      { id: 'ardabil-city', name: 'اردبیل' },
      { id: 'parsabad', name: 'پارس‌آباد' },
      { id: 'khalkhal', name: 'خلخال' },
      { id: 'meshginshahr', name: 'مشگین‌شهر' }
    ]
  },
  {
    id: 'zanjan',
    name: 'زنجان',
    cities: [
      { id: 'zanjan-city', name: 'زنجان' },
      { id: 'abhar', name: 'ابهر' },
      { id: 'khorramdarreh', name: 'خرمدره' },
      { id: 'qidar', name: 'قیدار' }
    ]
  },
  {
    id: 'lorestan',
    name: 'لرستان',
    cities: [
      { id: 'khorramabad', name: 'خرم‌آباد' },
      { id: 'borujerd', name: 'بروجرد' },
      { id: 'dorud', name: 'دورود' },
      { id: 'aligudarz', name: 'الیگودرز' }
    ]
  },
  {
    id: 'ilam',
    name: 'ایلام',
    cities: [
      { id: 'ilam-city', name: 'ایلام' },
      { id: 'dehloran', name: 'دهلران' },
      { id: 'eyvan', name: 'ایوان' }
    ]
  },
  {
    id: 'bushehr',
    name: 'بوشهر',
    cities: [
      { id: 'bushehr-city', name: 'بوشهر' },
      { id: 'borazjan', name: 'برازجان' },
      { id: 'gachsaran-bushehr', name: 'کنگان' },
      { id: 'genaveh', name: 'گناوه' }
    ]
  },
  {
    id: 'hormozgan',
    name: 'هرمزگان',
    cities: [
      { id: 'bandar-abbas', name: 'بندرعباس' },
      { id: 'minab', name: 'میناب' },
      { id: 'qeshm', name: 'قشم' },
      { id: 'kish', name: 'کیش' },
      { id: 'bandar-lengeh', name: 'بندرلنگه' }
    ]
  },
  {
    id: 'sistan',
    name: 'سیستان و بلوچستان',
    cities: [
      { id: 'zahedan', name: 'زاهدان' },
      { id: 'zabol', name: 'زابل' },
      { id: 'chabahar', name: 'چابهار' },
      { id: 'iranshahr', name: 'ایرانشهر' }
    ]
  },
  {
    id: 'kurdistan',
    name: 'کردستان',
    cities: [
      { id: 'sanandaj', name: 'سنندج' },
      { id: 'saqqez', name: 'سقز' },
      { id: 'marivan', name: 'مریوان' },
      { id: 'baneh', name: 'بانه' }
    ]
  },
  {
    id: 'chaharmahal',
    name: 'چهارمحال و بختیاری',
    cities: [
      { id: 'shahrekord', name: 'شهرکرد' },
      { id: 'borujen', name: 'بروجن' },
      { id: 'farsan', name: 'فارسان' },
      { id: 'lordegan', name: 'لردگان' }
    ]
  },
  {
    id: 'kohgiluyeh',
    name: 'کهگیلویه و بویراحمد',
    cities: [
      { id: 'yasuj', name: 'یاسوج' },
      { id: 'gachsaran', name: 'گچساران' },
      { id: 'dehdasht', name: 'دهدشت' }
    ]
  },
  {
    id: 'north-khorasan',
    name: 'خراسان شمالی',
    cities: [
      { id: 'bojnurd', name: 'بجنورد' },
      { id: 'shirvan', name: 'شیروان' },
      { id: 'esfarayen', name: 'اسفراین' }
    ]
  },
  {
    id: 'south-khorasan',
    name: 'خراسان جنوبی',
    cities: [
      { id: 'birjand', name: 'بیرجند' },
      { id: 'qaen', name: 'قائن' },
      { id: 'ferdows', name: 'فردوس' },
      { id: 'tabas', name: 'طبس' }
    ]
  }
]

export function getProvinceByName(name: string): TIranProvince | undefined {
  return IRAN_PROVINCES.find(province => province.name === name)
}

export function getCitiesByProvinceName(provinceName: string): TIranCity[] {
  return getProvinceByName(provinceName)?.cities ?? []
}

export function getProvinceByCityName(cityName: string): TIranProvince | undefined {
  return IRAN_PROVINCES.find(province =>
    province.cities.some(city => city.name === cityName)
  )
}
