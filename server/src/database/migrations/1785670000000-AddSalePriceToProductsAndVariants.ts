import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddSalePriceToProductsAndVariants1785670000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    if (
      (await queryRunner.hasTable('products')) &&
      !(await queryRunner.hasColumn('products', 'salePrice'))
    ) {
      await queryRunner.addColumn(
        'products',
        new TableColumn({
          name: 'salePrice',
          type: 'decimal',
          precision: 12,
          scale: 2,
          isNullable: true,
        }),
      );
    }

    if (
      (await queryRunner.hasTable('product_variants')) &&
      !(await queryRunner.hasColumn('product_variants', 'salePrice'))
    ) {
      await queryRunner.addColumn(
        'product_variants',
        new TableColumn({
          name: 'salePrice',
          type: 'decimal',
          precision: 12,
          scale: 2,
          isNullable: true,
        }),
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (await queryRunner.hasColumn('product_variants', 'salePrice')) {
      await queryRunner.dropColumn('product_variants', 'salePrice');
    }

    if (await queryRunner.hasColumn('products', 'salePrice')) {
      await queryRunner.dropColumn('products', 'salePrice');
    }
  }
}
