import { MigrationInterface, QueryRunner } from 'typeorm';

export class MakeUserNameNullable1702702018944 implements MigrationInterface {
    name = 'MakeUserNameNullable1702702018944';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "users" ALTER COLUMN "name" DROP NOT NULL`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "users" ALTER COLUMN "name" SET NOT NULL`,
        );
    }
}
