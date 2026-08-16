import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

interface ProductRow {
  id: string;
  name: string;
  categoryId: string;
  brandName?: string;
}

interface Specification {
  title: string;
  value: string;
}

const LAPTOP_CATEGORY_ID = '6096fe0b-03b0-4dfc-b14e-4a4707092645';
const MONITOR_CATEGORY_ID = '53d6282f-c36d-4078-a3df-418ed3630721';

const LAPTOP_SPECS: Specification[] = [
  { title: 'شارژر', value: 'دارد' },
  { title: 'کیف همراه', value: 'ندارد' },
  { title: 'وبکم', value: 'دارد' },
  { title: 'نوع پردازنده', value: 'Intel Core i5' },
  { title: 'رم', value: '۱۶ گیگابایت' },
];

const MONITOR_SPECS: Specification[] = [
  { title: 'کابل اتصال', value: 'دارد' },
  { title: 'پایه', value: 'دارد' },
  { title: 'بلندگوی داخلی', value: 'دارد' },
  { title: 'سایز صفحه', value: '۲۷ اینچ' },
  { title: 'ریموت کنترل', value: 'ندارد' },
];

const DEFAULT_SPECS: Specification[] = [
  { title: 'گارانتی', value: '۱۸ ماه گارانتی معتبر' },
  { title: 'جعبه و لوازم جانبی', value: 'دارد' },
  { title: 'دفترچه راهنما', value: 'دارد' },
  { title: 'وضعیت کالا', value: 'نو و آکبند' },
  { title: 'بسته‌بندی', value: 'ارسال با بسته‌بندی ایمن' },
];

export class AddSpecificationsToProducts1786000000000 implements MigrationInterface {
  name = 'AddSpecificationsToProducts1786000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    if (
      (await queryRunner.hasTable('products')) &&
      !(await queryRunner.hasColumn('products', 'specifications'))
    ) {
      await queryRunner.addColumn(
        'products',
        new TableColumn({
          name: 'specifications',
          type: 'jsonb',
          isNullable: true,
        }),
      );
    }

    const products: ProductRow[] = (await queryRunner.query(
      `
      SELECT p.id, p.name, p."categoryId", b.name AS "brandName"
      FROM products p
      LEFT JOIN brands b ON b.id = p."brandId"
      WHERE p."deletedAt" IS NULL
      `,
    )) as ProductRow[];

    for (const product of products) {
      const specifications = this.buildSpecifications(product);

      if (specifications.length === 0) {
        continue;
      }

      await queryRunner.query(
        `
        UPDATE products
        SET specifications = $1
        WHERE id = $2
        `,
        [JSON.stringify(specifications), product.id],
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (await queryRunner.hasColumn('products', 'specifications')) {
      await queryRunner.dropColumn('products', 'specifications');
    }
  }

  private buildSpecifications(product: ProductRow): Specification[] {
    const pool =
      product.categoryId === LAPTOP_CATEGORY_ID
        ? LAPTOP_SPECS
        : product.categoryId === MONITOR_CATEGORY_ID
          ? MONITOR_SPECS
          : DEFAULT_SPECS;

    const seed = this.hashString(product.id);

    const rotateBy = seed % pool.length;

    const specs = pool
      .map((_, index) => pool[(index + rotateBy) % pool.length])
      .slice(0, 5)
      .map((spec) => ({ ...spec }));

    if (product.brandName) {
      specs.unshift({
        title: 'برند',
        value: product.brandName,
      });
      specs.length = Math.min(specs.length, 5);
    }

    return specs;
  }

  private hashString(value: string): number {
    let hash = 0;

    for (let index = 0; index < value.length; index += 1) {
      hash = (hash << 5) - hash + value.charCodeAt(index);
      hash |= 0;
    }

    return Math.abs(hash);
  }
}
