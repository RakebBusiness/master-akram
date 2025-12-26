-- ============================
-- Add Progress Tracking Features
-- ============================

-- Add completion status and progress fields to ETUDIANT_EXERCICE
ALTER TABLE "ETUDIANT_EXERCICE"
ADD COLUMN IF NOT EXISTS "completed" BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS "score" INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS "completedAt" TIMESTAMP;

-- Add completion status and progress fields to ETUDIANT_COURS
ALTER TABLE "ETUDIANT_COURS"
ADD COLUMN IF NOT EXISTS "completed" BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS "progress" INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS "completedAt" TIMESTAMP;

-- Add level and XP to ETUDIANT table
ALTER TABLE "ETUDIANT"
ADD COLUMN IF NOT EXISTS "level" INT DEFAULT 1,
ADD COLUMN IF NOT EXISTS "xp" INT DEFAULT 0;

-- Create ACHIEVEMENT table
CREATE TABLE IF NOT EXISTS "ACHIEVEMENT" (
    "idAchievement" SERIAL PRIMARY KEY,
    "name" VARCHAR(150) NOT NULL,
    "description" TEXT,
    "icon" VARCHAR(100),
    "xpReward" INT DEFAULT 0
);

-- Create STUDENT_ACHIEVEMENT table (many-to-many relationship)
CREATE TABLE IF NOT EXISTS "STUDENT_ACHIEVEMENT" (
    "idUser" INT,
    "idAchievement" INT,
    "unlockedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY ("idUser", "idAchievement"),
    FOREIGN KEY ("idUser") REFERENCES "ETUDIANT"("idUser") ON DELETE CASCADE,
    FOREIGN KEY ("idAchievement") REFERENCES "ACHIEVEMENT"("idAchievement") ON DELETE CASCADE
);

-- Insert default achievements
INSERT INTO "ACHIEVEMENT" ("name", "description", "icon", "xpReward")
VALUES
    ('First Steps', 'Complete your first exercise', '🎯', 50),
    ('Course Explorer', 'Enroll in your first course', '📚', 30),
    ('Quick Learner', 'Complete 5 exercises', '⚡', 100),
    ('Dedicated Student', 'Complete 10 exercises', '🌟', 200),
    ('Course Master', 'Complete your first course', '🏆', 150),
    ('Algorithm Expert', 'Complete 20 exercises', '💎', 500),
    ('Consistency King', 'Complete 3 courses', '👑', 300)
ON CONFLICT DO NOTHING;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_student_achievement_user ON "STUDENT_ACHIEVEMENT"("idUser");
CREATE INDEX IF NOT EXISTS idx_etudiant_level ON "ETUDIANT"("level");
CREATE INDEX IF NOT EXISTS idx_etudiant_cours_completed ON "ETUDIANT_COURS"("completed");
CREATE INDEX IF NOT EXISTS idx_etudiant_exercice_completed ON "ETUDIANT_EXERCICE"("completed");
