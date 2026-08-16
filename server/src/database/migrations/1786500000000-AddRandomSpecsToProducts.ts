import { MigrationInterface, QueryRunner } from 'typeorm';

interface ProductRow {
  id: string;
  categoryId: string;
  name: string;
  specifications?: Array<{ title: string; value: string }>;
}

interface Specification {
  title: string;
  value: string;
}

interface SpecPool {
  title: string;
  values: string[];
}

const DIGITAL_CATEGORY_ID = '08c03da0-1399-4669-868b-151d080e73fc';
const LAPTOP_CATEGORY_ID = '79fba845-b4d1-42a9-a8ab-9971adb85db8';
const MONITOR_CATEGORY_ID = '9a57e925-a2b3-4db0-bd39-996afc0ef210';
const MOBILE_CATEGORY_ID = '4494270e-0060-4320-ac23-b6e2e884b18e';

const LAPTOP_POOL: SpecPool[] = [
  {
    title: 'پردازنده',
    values: [
      'Intel Core i5 نسل ۱۱',
      'Intel Core i5 نسل ۱۲',
      'AMD Ryzen 5',
      'Intel Core i7 نسل ۱۲',
    ],
  },
  {
    title: 'حافظه رم',
    values: ['۸ گیگابایت DDR4', '۱۶ گیگابایت DDR4', '۳۲ گیگابایت DDR5'],
  },
  {
    title: 'حافظه داخلی',
    values: [
      'SSD 256 گیگابایت',
      'SSD 512 گیگابایت',
      'HDD ۱ ترابایت',
      'SSD 1 ترابایت',
    ],
  },
  {
    title: 'کارت گرافیک',
    values: [
      'Intel Iris Xe',
      'NVIDIA GeForce MX550',
      'NVIDIA GeForce RTX 3050',
    ],
  },
  { title: 'باتری', values: ['۴ سلولی', '۳ سلولی', '۳ سلولی لیپولیمر'] },
  {
    title: 'سیستم عامل',
    values: ['بدون سیستم عامل', 'Windows 11', 'Windows 10'],
  },
  { title: 'کیبورد', values: ['مجهز به نور پس‌زمینه', 'استاندارد'] },
  { title: 'پورت USB-C', values: ['دارد', 'ندارد'] },
  { title: 'چراغ کیبورد', values: ['دارد', 'ندارد'] },
];

const MONITOR_POOL: SpecPool[] = [
  { title: 'نوع پنل', values: ['IPS', 'VA', 'TN'] },
  { title: 'رزولوشن', values: ['2560x1440 (2K)', '1920x1080 (Full HD)'] },
  {
    title: 'نرخ نوسازی',
    values: ['۱۴۴ هرتز', '۱۶۵ هرتز', '۷۵ هرتز', '۶۰ هرتز'],
  },
  { title: 'پورت HDMI', values: ['دارد', 'ندارد'] },
  { title: 'پورت DisplayPort', values: ['دارد', 'ندارد'] },
  {
    title: 'زمان پاسخ‌گویی',
    values: ['۱ میلی‌ثانیه', '۴ میلی‌ثانیه', '۵ میلی‌ثانیه'],
  },
  { title: 'قابلیت چرخش', values: ['دارد', 'ندارد'] },
  { title: 'ابعاد', values: ['۶۰ × ۳۵ سانتی‌متر', '۵۴ × ۳۲ سانتی‌متر'] },
];

const MOBILE_POOL: SpecPool[] = [
  { title: 'سایز صفحه', values: ['۶.۴ اینچ', '۶.۱ اینچ', '۶.۶ اینچ'] },
  {
    title: 'دوربین اصلی',
    values: ['۵۰ مگاپیکسل', '۱۰۸ مگاپیکسل', '۶۴ مگاپیکسل'],
  },
  {
    title: 'دوربین سلفی',
    values: ['۳۲ مگاپیکسل', '۱۲ مگاپیکسل', '۱۰ مگاپیکسل'],
  },
  {
    title: 'باتری',
    values: ['۵۰۰۰ میلی‌آمپر', '۴۵۰۰ میلی‌آمپر', '۴۰۰۰ میلی‌آمپر'],
  },
  { title: 'NFC', values: ['دارد', 'ندارد'] },
  { title: 'سیم‌کارت', values: ['دو سیم‌کارت', 'یک سیم‌کارت'] },
  { title: 'شبکه', values: ['5G', '4G LTE'] },
  { title: 'سیستم عامل', values: ['اندروید ۱۳', 'اندروید ۱۴', 'Android 14'] },
  { title: 'وزن', values: ['۱۸۷ گرم', '۱۶۸ گرم', '۲۰۲ گرم'] },
];

const DIGITAL_GENERAL_POOL: SpecPool[] = [
  {
    title: 'اتصال بی‌سیم',
    values: ['۲.۴ گیگاهرتز', 'بلوتوث 5.3', 'بلوتوث 5.2'],
  },
  { title: 'دمای کارکرد', values: ['۰ تا ۴۰ درجه', '-۱۰ تا ۴۵ درجه'] },
  { title: 'وزن', values: ['۳۰۰ گرم', '۵۰۰ گرم', '۸۵۰ گرم'] },
  { title: 'منبع تغذیه', values: ['باتری AAA', 'باتری داخلی', 'USB'] },
];

const KEYBOARD_POOL: SpecPool[] = [
  { title: 'نوع کلید', values: ['ممبران', 'مکانیکال'] },
  { title: 'چیدمان', values: ['فارسی/انگلیسی', 'انگلیسی'] },
  { title: 'اتصال', values: ['بی‌سیم ۲.۴ گیگاهرتز', 'بلوتوث + USB'] },
  { title: 'محدوده برد', values: ['۱۰ متر', '۸ متر'] },
  { title: 'باتری', values: ['۲ عدد باتری AAA', 'باتری داخلی قابل شارژ'] },
];

const HEADPHONE_POOL: SpecPool[] = [
  { title: 'نوع اتصال', values: ['بلوتوث 5.3', 'بلوتوث 5.0'] },
  { title: 'نوع هدفون', values: ['رو‌گوشی (On-Ear)', 'دورگوشی (Over-Ear)'] },
  { title: 'برد بلوتوث', values: ['۱۰ متر', '۱۵ متر'] },
  { title: 'زمان پخش', values: ['۱۰ ساعت', '۲۰ ساعت', '۳۰ ساعت'] },
  { title: 'وزن', values: ['۱۷۰ گرم', '۲۵۰ گرم', '۳۱۰ گرم'] },
];

export class AddRandomSpecsToProducts1786500000000 implements MigrationInterface {
  name = 'AddRandomSpecsToProducts1786500000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    if (!(await queryRunner.hasColumn('products', 'specifications'))) {
      return;
    }

    const products: ProductRow[] = (await queryRunner.query(
      `SELECT id, name, "categoryId", specifications FROM products WHERE "deletedAt" IS NULL`,
    )) as ProductRow[];

    for (const product of products) {
      const existing: Specification[] = Array.isArray(product.specifications)
        ? product.specifications
        : [];

      const existingTitles = new Set(existing.map((spec) => spec.title));

      const pool = this.resolvePool(product);

      const candidates = pool.filter((spec) => !existingTitles.has(spec.title));

      if (candidates.length === 0) {
        continue;
      }

      this.shuffle(candidates);

      const count = 3 + Math.floor(Math.random() * 3);
      const picked = candidates.slice(0, count).map((spec) => ({
        title: spec.title,
        value: spec.values[Math.floor(Math.random() * spec.values.length)],
      }));

      const merged = [...existing, ...picked];

      await queryRunner.query(
        `UPDATE products SET specifications = $1 WHERE id = $2`,
        [JSON.stringify(merged), product.id],
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}

  private resolvePool(product: ProductRow): SpecPool[] {
    if (product.name.includes('کیبورد')) {
      return KEYBOARD_POOL;
    }

    if (product.name.includes('هدفون')) {
      return HEADPHONE_POOL;
    }

    switch (product.categoryId) {
      case LAPTOP_CATEGORY_ID:
        return LAPTOP_POOL;
      case MONITOR_CATEGORY_ID:
        return MONITOR_POOL;
      case MOBILE_CATEGORY_ID:
        return MOBILE_POOL;
      case DIGITAL_CATEGORY_ID:
        return DIGITAL_GENERAL_POOL;
      default:
        return DIGITAL_GENERAL_POOL;
    }
  }

  private shuffle<T>(array: T[]): void {
    for (let index = array.length - 1; index > 0; index -= 1) {
      const randomIndex = Math.floor(Math.random() * (index + 1));
      [array[index], array[randomIndex]] = [array[randomIndex], array[index]];
    }
  }
}
