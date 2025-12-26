-- Migration: Fix Section and Topic ID columns to use SERIAL
-- This allows the database to auto-generate IDs instead of relying on client-side generation

-- Drop and recreate TOPIC table with SERIAL primary key
DROP TABLE IF EXISTS "TOPIC" CASCADE;
CREATE TABLE "TOPIC" (
    "idTopic" SERIAL PRIMARY KEY,
    "nom"     VARCHAR(100),
    "idCours" INT,
    FOREIGN KEY ("idCours") REFERENCES "COURS"("idCours") ON DELETE CASCADE
);

-- Drop and recreate COURS_SECTION table with SERIAL primary key
DROP TABLE IF EXISTS "COURS_SECTION" CASCADE;
CREATE TABLE "COURS_SECTION" (
    "idSection"   SERIAL PRIMARY KEY,
    "section"     VARCHAR(150),
    "theorie"     TEXT,
    "codeExample" TEXT,
    "idCours"     INT,
    FOREIGN KEY ("idCours") REFERENCES "COURS"("idCours") ON DELETE CASCADE
);

-- Recreate indexes
CREATE INDEX IF NOT EXISTS idx_topic_cours ON "TOPIC"("idCours");
CREATE INDEX IF NOT EXISTS idx_section_cours ON "COURS_SECTION"("idCours");
