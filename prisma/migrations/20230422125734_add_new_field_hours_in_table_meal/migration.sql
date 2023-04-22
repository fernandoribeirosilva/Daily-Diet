/*
  Warnings:

  - Added the required column `hours` to the `meal` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_meal" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "dentroDaDieta" BOOLEAN NOT NULL,
    "data" TEXT NOT NULL,
    "hours" TEXT NOT NULL
);
INSERT INTO "new_meal" ("data", "dentroDaDieta", "descricao", "id", "nome") SELECT "data", "dentroDaDieta", "descricao", "id", "nome" FROM "meal";
DROP TABLE "meal";
ALTER TABLE "new_meal" RENAME TO "meal";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
