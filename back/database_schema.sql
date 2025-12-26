-- ============================
-- AlgoMaster Database Schema (Updated)
-- PostgreSQL Database Setup
-- ============================

-- Create Database (run this separately if needed)
-- CREATE DATABASE algomaster;

-- ============================
-- TABLE USER
-- ============================
CREATE TABLE IF NOT EXISTS "USER" (
    "idUser" SERIAL PRIMARY KEY,
    "Nom" VARCHAR(100),
    "Prenom" VARCHAR(100),
    "DateNaissance" DATE,
    "Email" VARCHAR(150) UNIQUE NOT NULL,
    "motDePasse" VARCHAR(255) NOT NULL
);

-- ============================
-- TABLE ETUDIANT
-- ============================
CREATE TABLE IF NOT EXISTS "ETUDIANT" (
    "idUser" INT PRIMARY KEY,
    "Specialite" VARCHAR(150),
    "Annee" INT,
    FOREIGN KEY ("idUser") REFERENCES "USER"("idUser") ON DELETE CASCADE
);

-- ============================
-- TABLE ENSEIGNANT
-- ============================
CREATE TABLE IF NOT EXISTS "ENSEIGNANT" (
    "idUser" INT PRIMARY KEY,
    "Specialite" VARCHAR(150),
    "Grade" VARCHAR(100),
    FOREIGN KEY ("idUser") REFERENCES "USER"("idUser") ON DELETE CASCADE
);

-- ============================
-- TABLE COURS
-- ============================
CREATE TABLE IF NOT EXISTS "COURS" (
    "idCours"      INT PRIMARY KEY,
    "titre"        VARCHAR(150),
    "niveau"       VARCHAR(20) CHECK ("niveau" IN ('Algo1', 'Algo2')),
    "description"  TEXT,
    "duree"        VARCHAR(50),
    "idEnseignant" INT,
    FOREIGN KEY ("idEnseignant") REFERENCES "ENSEIGNANT"("idUser")
);

-- ============================
-- TABLE TOPIC
-- ============================
CREATE TABLE IF NOT EXISTS "TOPIC" (
    "idTopic" SERIAL PRIMARY KEY,
    "nom"     VARCHAR(100),
    "idCours" INT,
    FOREIGN KEY ("idCours") REFERENCES "COURS"("idCours")
);

-- ============================
-- TABLE COURS_SECTION
-- ============================
CREATE TABLE IF NOT EXISTS "COURS_SECTION" (
    "idSection"   SERIAL PRIMARY KEY,
    "section"     VARCHAR(150),
    "theorie"     TEXT,
    "codeExample" TEXT,
    "idCours"     INT,
    FOREIGN KEY ("idCours") REFERENCES "COURS"("idCours")
);

-- =======================================================
-- NEW EXERCISE MODEL (supports QCM, QUIZ, CODE)
-- =======================================================

-- ============================
-- TABLE EXERCISE
-- ============================
CREATE TABLE IF NOT EXISTS exercise (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('qcm', 'quiz', 'code')),
    statement TEXT NOT NULL,

    "idEnseignant" INT,
    "idCours" INT,

    FOREIGN KEY ("idEnseignant")
        REFERENCES "ENSEIGNANT"("idUser")
        ON DELETE SET NULL,

    FOREIGN KEY ("idCours")
        REFERENCES "COURS"("idCours")
        ON DELETE SET NULL
);

-- ============================
-- TABLE QCM_OPTIONS
-- ============================
CREATE TABLE IF NOT EXISTS qcm_option (
    id SERIAL PRIMARY KEY,
    exercise_id INT NOT NULL,
    option_text TEXT NOT NULL,

    FOREIGN KEY (exercise_id)
        REFERENCES exercise(id)
        ON DELETE CASCADE
);

-- ============================
-- TABLE QCM_ANSWER (index correct)
-- ============================
CREATE TABLE IF NOT EXISTS qcm_answer (
    exercise_id INT PRIMARY KEY,
    correct_option_index INT NOT NULL,

    FOREIGN KEY (exercise_id)
        REFERENCES exercise(id)
        ON DELETE CASCADE
);

-- ============================
-- TABLE QUIZ_ANSWER (text)
-- ============================
CREATE TABLE IF NOT EXISTS quiz_answer (
    exercise_id INT PRIMARY KEY,
    answer TEXT NOT NULL,

    FOREIGN KEY (exercise_id)
        REFERENCES exercise(id)
        ON DELETE CASCADE
);

-- ============================
-- TABLE CODE_TEST (input/output)
-- ============================
CREATE TABLE IF NOT EXISTS code_test (
    id SERIAL PRIMARY KEY,
    exercise_id INT NOT NULL,
    input TEXT NOT NULL,
    expected_output TEXT NOT NULL,

    FOREIGN KEY (exercise_id)
        REFERENCES exercise(id)
        ON DELETE CASCADE
);

-- ============================
-- TABLE FEEDBACK
-- ============================
CREATE TABLE IF NOT EXISTS "FEEDBACK" (
    "idFeedback" SERIAL PRIMARY KEY,
    "Avis" VARCHAR(255),
    "idUser" INT,
    FOREIGN KEY ("idUser") REFERENCES "USER"("idUser") ON DELETE CASCADE
);

-- ============================
-- TABLE ETUDIANT_EXERCICE (Relation N-N)
-- ============================
CREATE TABLE IF NOT EXISTS "ETUDIANT_EXERCICE" (
    "idUser" INT,
    "idExercice" INT,
    PRIMARY KEY ("idUser", "idExercice"),
    FOREIGN KEY ("idUser") REFERENCES "ETUDIANT"("idUser") ON DELETE CASCADE,
    FOREIGN KEY ("idExercice") REFERENCES exercise(id) ON DELETE CASCADE
);

-- ============================
-- TABLE ETUDIANT_COURS (Relation N-N)
-- ============================
CREATE TABLE IF NOT EXISTS "ETUDIANT_COURS" (
    "idUser" INT,
    "idCours" INT,
    "temps_debut" INT,
    "temps_fin" INT,
    "temps_concentration" INT,
    PRIMARY KEY ("idUser", "idCours"),
    FOREIGN KEY ("idUser") REFERENCES "ETUDIANT"("idUser") ON DELETE CASCADE,
    FOREIGN KEY ("idCours") REFERENCES "COURS"("idCours") ON DELETE CASCADE
);

-- ============================
-- TABLE USER_FEEDBACK (Relation N-N)
-- ============================
CREATE TABLE IF NOT EXISTS "USER_FEEDBACK" (
    "idUser" INT,
    "idFeedback" INT,
    PRIMARY KEY ("idUser", "idFeedback"),
    FOREIGN KEY ("idUser") REFERENCES "USER"("idUser") ON DELETE CASCADE,
    FOREIGN KEY ("idFeedback") REFERENCES "FEEDBACK"("idFeedback") ON DELETE CASCADE
);

-- ============================
-- INDEXES
-- ============================
CREATE INDEX IF NOT EXISTS idx_user_email ON "USER"("Email");
CREATE INDEX IF NOT EXISTS idx_etudiant_user ON "ETUDIANT"("idUser");
CREATE INDEX IF NOT EXISTS idx_enseignant_user ON "ENSEIGNANT"("idUser");
CREATE INDEX IF NOT EXISTS idx_cours_enseignant ON "COURS"("idEnseignant");
CREATE INDEX IF NOT EXISTS idx_exercise_teacher ON exercise(idenseignant);
CREATE INDEX IF NOT EXISTS idx_exercise_cours ON exercise(idcours);

CREATE INDEX IF NOT EXISTS idx_qcm_option_exercise ON qcm_option(exercise_id);
CREATE INDEX IF NOT EXISTS idx_code_test_exercise ON code_test(exercise_id);

CREATE INDEX IF NOT EXISTS idx_topic_cours ON "TOPIC"("idCours");
CREATE INDEX IF NOT EXISTS idx_section_cours ON "COURS_SECTION"("idCours");
