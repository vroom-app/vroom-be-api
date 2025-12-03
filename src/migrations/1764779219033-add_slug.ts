import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSlug1764779219033 implements MigrationInterface {
    name = 'AddSlug1764779219033'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "businesses" ADD "slug" character varying`);
        await queryRunner.query(`ALTER TABLE "businesses" ALTER COLUMN "specializations" SET DEFAULT ARRAY[]::text[]`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "businesses" ALTER COLUMN "specializations" SET DEFAULT ARRAY[]`);
        await queryRunner.query(`ALTER TABLE "businesses" DROP COLUMN "slug"`);
    }

}
