import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSaltColToUser1702739613934 implements MigrationInterface {
    name = 'AddSaltColToUser1702739613934';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "users" ADD "salt" character varying NOT NULL`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "salt"`);
    }
}
