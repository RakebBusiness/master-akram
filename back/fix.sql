-- Créer les indexes avec les noms en minuscules
CREATE INDEX IF NOT EXISTS idx_exercise_teacher ON exercise(idenseignant);
CREATE INDEX IF NOT EXISTS idx_exercise_cours ON exercise(idcours);
