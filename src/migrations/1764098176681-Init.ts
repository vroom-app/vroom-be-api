import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1764098176681 implements MigrationInterface {
    name = 'Init1764098176681'

    public async up(queryRunner: QueryRunner): Promise<void> {}

    public async down(queryRunner: QueryRunner): Promise<void> {}

}
