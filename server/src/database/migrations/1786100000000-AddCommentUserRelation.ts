import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCommentUserRelation1786100000000 implements MigrationInterface {
  name = 'AddCommentUserRelation1786100000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('comments');

    if (!table) {
      return;
    }

    const userIdColumn = table.columns.find(
      (column) => column.name === 'userId',
    );

    if (userIdColumn?.type !== 'uuid') {
      await queryRunner.query(
        `ALTER TABLE "comments" ALTER COLUMN "userId" TYPE uuid USING "userId"::uuid`,
      );
    }

    const fkExists = table.foreignKeys.some(
      (fk) =>
        fk.columnNames[0] === 'userId' &&
        fk.referencedTableName === 'user_entity' &&
        fk.referencedColumnNames[0] === 'id',
    );

    if (!fkExists) {
      await queryRunner.query(
        `ALTER TABLE "comments" ADD CONSTRAINT "FK_7e8d7c49f218ebb14314fdb3749" FOREIGN KEY ("userId") REFERENCES "user_entity"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('comments');

    if (!table) {
      return;
    }

    const fkExists = table.foreignKeys.some(
      (fk) =>
        fk.columnNames[0] === 'userId' &&
        fk.referencedTableName === 'user_entity',
    );

    if (fkExists) {
      await queryRunner.query(
        `ALTER TABLE "comments" DROP CONSTRAINT "FK_7e8d7c49f218ebb14314fdb3749"`,
      );
    }

    if (await queryRunner.hasColumn('comments', 'userId')) {
      await queryRunner.query(
        `ALTER TABLE "comments" ALTER COLUMN "userId" TYPE character varying USING "userId"::character varying`,
      );
    }
  }
}
