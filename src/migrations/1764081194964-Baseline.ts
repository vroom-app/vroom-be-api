import { MigrationInterface, QueryRunner } from "typeorm";

export class Baseline1764081194964 implements MigrationInterface {
    name = 'Baseline1764081194964'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "business_opening_hours" ("id" SERIAL NOT NULL, "business_id" uuid NOT NULL, "day_of_week" smallint NOT NULL, "opens_at" TIME NOT NULL, "closes_at" TIME NOT NULL, CONSTRAINT "PK_ac78b0e618f7c0bb59ddeb3e118" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "slots" ("id" SERIAL NOT NULL, "businessId" uuid NOT NULL, "offeringId" integer NOT NULL, "date" date NOT NULL, "startTime" TIME NOT NULL, "endTime" TIME NOT NULL, "bookingsCount" integer NOT NULL DEFAULT '0', "isBlocked" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_8b553bb1941663b63fd38405e42" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."businesses_categories_enum" AS ENUM('CarWash', 'Mobile', 'CarRepair', 'Parking', 'GasStation', 'ElectricVehicleChargingStation', 'CarDealer', 'CarRental', 'DetailingStudio', 'RimsShop', 'Tuning', 'TireShop', 'CarInspectionStation')`);
        await queryRunner.query(`CREATE TABLE "businesses" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "owner_id" integer NOT NULL, "name" character varying NOT NULL, "description" character varying, "categories" "public"."businesses_categories_enum" array NOT NULL DEFAULT '{}', "specializations" text array NOT NULL DEFAULT ARRAY[]::text[], "email" character varying, "website" text, "phone" character varying, "average_rating" numeric(3,2) NOT NULL DEFAULT '0', "review_count" integer NOT NULL DEFAULT '0', "address" character varying NOT NULL, "city" character varying NOT NULL, "latitude" double precision NOT NULL, "longitude" double precision NOT NULL, "logo_url" character varying, "logo_map_url" character varying, "photo_url" character varying, "additional_photos" text, "facebook" character varying, "instagram" character varying, "youtube" character varying, "linkedin" character varying, "tiktok" character varying, "is_verified" boolean NOT NULL DEFAULT false, "is_sponsored" boolean NOT NULL DEFAULT false, "accept_bookings" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_bc1bf63498dd2368ce3dc8686e8" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "reviews" ("id" SERIAL NOT NULL, "business_id" uuid NOT NULL, "user_id" integer NOT NULL, "rating" integer NOT NULL, "comment" text NOT NULL, "ratings" jsonb, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_231ae565c273ee700b283f15c1d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_5487461baf5ad075430309fb8e" ON "reviews" ("business_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_728447781a30bc3fcfe5c2f1cd" ON "reviews" ("user_id") `);
        await queryRunner.query(`CREATE TABLE "review_services" ("id" SERIAL NOT NULL, "review_id" integer NOT NULL, "service_id" integer NOT NULL, CONSTRAINT "PK_b8b7a151856818c1b06148c8142" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."service_offerings_action_type_enum" AS ENUM('BOOKING_SYSTEM', 'EMBEDDED', 'CTA', 'E_COMMERCE', 'CONTACT_FORM', 'NONE')`);
        await queryRunner.query(`CREATE TABLE "service_offerings" ("id" SERIAL NOT NULL, "business_id" uuid NOT NULL, "name" character varying NOT NULL, "category" character varying NOT NULL, "action_type" "public"."service_offerings_action_type_enum" NOT NULL, "action_details" jsonb NOT NULL, "description" jsonb NOT NULL, "capacity" integer NOT NULL DEFAULT '1', "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_9b854841d82dd234996e82399e8" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."bookings_status_enum" AS ENUM('created', 'pending', 'confirmed', 'completed', 'cancelled')`);
        await queryRunner.query(`CREATE TABLE "bookings" ("id" SERIAL NOT NULL, "userId" integer, "slotId" integer NOT NULL, "serviceOfferingId" integer NOT NULL, "status" "public"."bookings_status_enum" NOT NULL DEFAULT 'created', "specialRequests" character varying(500), "guestName" character varying(100), "guestEmail" character varying(255), "guestPhone" character varying(20), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_bee6805982cc1e248e94ce94957" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_fa0a0ac15d78b40d6d850f5765" ON "bookings" ("guestEmail") `);
        await queryRunner.query(`CREATE TYPE "public"."expense_history_type_enum" AS ENUM('Fuel', 'Repair', 'Maintenance', 'Insurance', 'Tax', 'Other')`);
        await queryRunner.query(`CREATE TABLE "expense_history" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "date" date NOT NULL, "type" "public"."expense_history_type_enum" NOT NULL DEFAULT 'Other', "amount" numeric(10,2) NOT NULL, "car_id" uuid, CONSTRAINT "PK_f57aa2c8253c42ef3b98da76acb" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "tire_history" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "date" date NOT NULL, "size" character varying NOT NULL, "type" character varying NOT NULL, "car_id" uuid, CONSTRAINT "PK_070df91d95c7ec5bdd854aa3385" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "service_history" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "date" date NOT NULL, "mileage" integer NOT NULL, "description" character varying NOT NULL, "car_id" uuid, CONSTRAINT "PK_87a290fb43cabe61c55e0481dce" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."car_reminders_type_enum" AS ENUM('Oil', 'Filters', 'TireChange', 'Inspection', 'Other')`);
        await queryRunner.query(`CREATE TABLE "car_reminders" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "type" "public"."car_reminders_type_enum" NOT NULL DEFAULT 'Other', "dueDate" date NOT NULL, "car_id" uuid, CONSTRAINT "PK_73b6c0eb85d477fd34c25df274e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."cars_type_enum" AS ENUM('Sedan', 'SUV', 'Hatchback', 'Coupe', 'Convertible', 'Wagon', 'Van', 'Other')`);
        await queryRunner.query(`CREATE TABLE "cars" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "licensePlate" character varying NOT NULL, "model" character varying NOT NULL, "brand" character varying NOT NULL, "year" integer, "type" "public"."cars_type_enum" NOT NULL DEFAULT 'Other', "vin" character varying, "enginePower" character varying, "engineVolume" character varying, "euroStandard" character varying, "color" character varying, "oilType" character varying, "vignetteExpiry" date, "gtpExpiry" date, "civilInsuranceExpiry" date, "cascoExpiry" date, "taxExpiry" date, "mileage" integer, "photo" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_1a56deecb54b4ed4917445f49e9" UNIQUE ("vin"), CONSTRAINT "PK_fc218aa84e79b477d55322271b6" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."auth_provider_enum" AS ENUM('local', 'google')`);
        await queryRunner.query(`CREATE TYPE "public"."user_role_enum" AS ENUM('user', 'business_owner', 'worker', 'admin')`);
        await queryRunner.query(`CREATE TABLE "users" ("id" SERIAL NOT NULL, "email" character varying NOT NULL, "first_name" character varying NOT NULL, "last_name" character varying NOT NULL, "country" character varying NOT NULL DEFAULT 'BG', "phone" character varying, "password_hash" character varying, "provider" "public"."auth_provider_enum" NOT NULL DEFAULT 'local', "provider_id" character varying, "avatar_url" character varying, "email_verified" boolean NOT NULL DEFAULT false, "roles" "public"."user_role_enum" array NOT NULL DEFAULT '{user}', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "car_users" ("car_id" uuid NOT NULL, "user_id" integer NOT NULL, CONSTRAINT "PK_cf3d468ffd84e0be330b8624507" PRIMARY KEY ("car_id", "user_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_ab88396746c4c4210cd1cac380" ON "car_users" ("car_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_4b4ed131c4e1eead2cb0f2fb2c" ON "car_users" ("user_id") `);
        await queryRunner.query(`ALTER TABLE "business_opening_hours" ADD CONSTRAINT "FK_6b4157ed5416e4e5c5d2eb4d8b1" FOREIGN KEY ("business_id") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "slots" ADD CONSTRAINT "FK_4fce30e2ef00f258c7f53c9a83a" FOREIGN KEY ("businessId") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "slots" ADD CONSTRAINT "FK_65b9d07d22166d65d6c85299325" FOREIGN KEY ("offeringId") REFERENCES "service_offerings"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "businesses" ADD CONSTRAINT "FK_8881b96819252080592fe1592ea" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "reviews" ADD CONSTRAINT "FK_5487461baf5ad075430309fb8e7" FOREIGN KEY ("business_id") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "reviews" ADD CONSTRAINT "FK_728447781a30bc3fcfe5c2f1cdf" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "review_services" ADD CONSTRAINT "FK_547a71ce0dc6209a326a4f5f058" FOREIGN KEY ("review_id") REFERENCES "reviews"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "review_services" ADD CONSTRAINT "FK_91b26dd52432c33474e82399aa6" FOREIGN KEY ("service_id") REFERENCES "service_offerings"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "service_offerings" ADD CONSTRAINT "FK_69b9579f4ff2ba38d2670a32a79" FOREIGN KEY ("business_id") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "bookings" ADD CONSTRAINT "FK_38a69a58a323647f2e75eb994de" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "bookings" ADD CONSTRAINT "FK_bb2c09a19d48380aca836adf7d9" FOREIGN KEY ("slotId") REFERENCES "slots"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "bookings" ADD CONSTRAINT "FK_554567fca1ba2ce9522d8584a2d" FOREIGN KEY ("serviceOfferingId") REFERENCES "service_offerings"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "expense_history" ADD CONSTRAINT "FK_13a5cbcf3a999ee235a5c1a37fc" FOREIGN KEY ("car_id") REFERENCES "cars"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "tire_history" ADD CONSTRAINT "FK_7d00b24097904507f71125c8159" FOREIGN KEY ("car_id") REFERENCES "cars"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "service_history" ADD CONSTRAINT "FK_d78660f3fd7afce36bcc93b0df2" FOREIGN KEY ("car_id") REFERENCES "cars"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "car_reminders" ADD CONSTRAINT "FK_8e9c470ed56914ba2e3a0bad092" FOREIGN KEY ("car_id") REFERENCES "cars"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "car_users" ADD CONSTRAINT "FK_ab88396746c4c4210cd1cac380d" FOREIGN KEY ("car_id") REFERENCES "cars"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "car_users" ADD CONSTRAINT "FK_4b4ed131c4e1eead2cb0f2fb2c5" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "car_users" DROP CONSTRAINT "FK_4b4ed131c4e1eead2cb0f2fb2c5"`);
        await queryRunner.query(`ALTER TABLE "car_users" DROP CONSTRAINT "FK_ab88396746c4c4210cd1cac380d"`);
        await queryRunner.query(`ALTER TABLE "car_reminders" DROP CONSTRAINT "FK_8e9c470ed56914ba2e3a0bad092"`);
        await queryRunner.query(`ALTER TABLE "service_history" DROP CONSTRAINT "FK_d78660f3fd7afce36bcc93b0df2"`);
        await queryRunner.query(`ALTER TABLE "tire_history" DROP CONSTRAINT "FK_7d00b24097904507f71125c8159"`);
        await queryRunner.query(`ALTER TABLE "expense_history" DROP CONSTRAINT "FK_13a5cbcf3a999ee235a5c1a37fc"`);
        await queryRunner.query(`ALTER TABLE "bookings" DROP CONSTRAINT "FK_554567fca1ba2ce9522d8584a2d"`);
        await queryRunner.query(`ALTER TABLE "bookings" DROP CONSTRAINT "FK_bb2c09a19d48380aca836adf7d9"`);
        await queryRunner.query(`ALTER TABLE "bookings" DROP CONSTRAINT "FK_38a69a58a323647f2e75eb994de"`);
        await queryRunner.query(`ALTER TABLE "service_offerings" DROP CONSTRAINT "FK_69b9579f4ff2ba38d2670a32a79"`);
        await queryRunner.query(`ALTER TABLE "review_services" DROP CONSTRAINT "FK_91b26dd52432c33474e82399aa6"`);
        await queryRunner.query(`ALTER TABLE "review_services" DROP CONSTRAINT "FK_547a71ce0dc6209a326a4f5f058"`);
        await queryRunner.query(`ALTER TABLE "reviews" DROP CONSTRAINT "FK_728447781a30bc3fcfe5c2f1cdf"`);
        await queryRunner.query(`ALTER TABLE "reviews" DROP CONSTRAINT "FK_5487461baf5ad075430309fb8e7"`);
        await queryRunner.query(`ALTER TABLE "businesses" DROP CONSTRAINT "FK_8881b96819252080592fe1592ea"`);
        await queryRunner.query(`ALTER TABLE "slots" DROP CONSTRAINT "FK_65b9d07d22166d65d6c85299325"`);
        await queryRunner.query(`ALTER TABLE "slots" DROP CONSTRAINT "FK_4fce30e2ef00f258c7f53c9a83a"`);
        await queryRunner.query(`ALTER TABLE "business_opening_hours" DROP CONSTRAINT "FK_6b4157ed5416e4e5c5d2eb4d8b1"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_4b4ed131c4e1eead2cb0f2fb2c"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_ab88396746c4c4210cd1cac380"`);
        await queryRunner.query(`DROP TABLE "car_users"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TYPE "public"."user_role_enum"`);
        await queryRunner.query(`DROP TYPE "public"."auth_provider_enum"`);
        await queryRunner.query(`DROP TABLE "cars"`);
        await queryRunner.query(`DROP TYPE "public"."cars_type_enum"`);
        await queryRunner.query(`DROP TABLE "car_reminders"`);
        await queryRunner.query(`DROP TYPE "public"."car_reminders_type_enum"`);
        await queryRunner.query(`DROP TABLE "service_history"`);
        await queryRunner.query(`DROP TABLE "tire_history"`);
        await queryRunner.query(`DROP TABLE "expense_history"`);
        await queryRunner.query(`DROP TYPE "public"."expense_history_type_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_fa0a0ac15d78b40d6d850f5765"`);
        await queryRunner.query(`DROP TABLE "bookings"`);
        await queryRunner.query(`DROP TYPE "public"."bookings_status_enum"`);
        await queryRunner.query(`DROP TABLE "service_offerings"`);
        await queryRunner.query(`DROP TYPE "public"."service_offerings_action_type_enum"`);
        await queryRunner.query(`DROP TABLE "review_services"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_728447781a30bc3fcfe5c2f1cd"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_5487461baf5ad075430309fb8e"`);
        await queryRunner.query(`DROP TABLE "reviews"`);
        await queryRunner.query(`DROP TABLE "businesses"`);
        await queryRunner.query(`DROP TYPE "public"."businesses_categories_enum"`);
        await queryRunner.query(`DROP TABLE "slots"`);
        await queryRunner.query(`DROP TABLE "business_opening_hours"`);
    }

}
