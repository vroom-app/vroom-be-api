import { MigrationInterface, QueryRunner } from "typeorm";

export class UniqueReviewByUserAndBusiness31764098887043 implements MigrationInterface {
    name = 'UniqueReviewByUserAndBusiness31764098887043'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "businesses" ALTER COLUMN "specializations" SET DEFAULT ARRAY[]::text[]`);
        await queryRunner.query(`ALTER TABLE "cars" DROP COLUMN "oilType"`);
        await queryRunner.query(`CREATE TYPE "public"."cars_oiltype_enum" AS ENUM('PETROL', 'DIESEL', 'ELECTRIC', 'HYBRID', 'LPG', 'CNG', 'OTHER')`);
        await queryRunner.query(`ALTER TABLE "cars" ADD "oilType" "public"."cars_oiltype_enum"`);
        await queryRunner.query(`ALTER TABLE "reviews" ADD CONSTRAINT "UQ_822c80c52e3d265bdd538c5e14c" UNIQUE ("business_id", "user_id")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "reviews" DROP CONSTRAINT "UQ_822c80c52e3d265bdd538c5e14c"`);
        await queryRunner.query(`ALTER TABLE "cars" DROP COLUMN "oilType"`);
        await queryRunner.query(`DROP TYPE "public"."cars_oiltype_enum"`);
        await queryRunner.query(`ALTER TABLE "cars" ADD "oilType" character varying`);
        await queryRunner.query(`ALTER TABLE "businesses" ALTER COLUMN "specializations" SET DEFAULT ARRAY[]`);
    }

}
