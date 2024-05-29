import { ColumnDefinitions, MigrationBuilder } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
	pgm.sql(`
    CREATE TYPE link_precedence AS ENUM ('secondary', 'primary');

    CREATE TABLE contact (
      id SERIAL PRIMARY KEY,
      phoneNumber VARCHAR(15),
      email VARCHAR(35),
      linkedId INTEGER references contact(id),
      linkPrecedence link_precedence NOT NULL,
      createdAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      deletedAt TIMESTAMP WITH TIME ZONE
    )
  `);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
	pgm.sql(
		`
    DROP TABLE contact;
    `
	);
}
