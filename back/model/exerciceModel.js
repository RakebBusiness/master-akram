const pool = require('../config/database');

const exerciceModel = {
    async findAll() {
        const query = 'SELECT * FROM exercise ORDER BY id DESC';
        const result = await pool.query(query);
        const exercises = [];

        for (const row of result.rows) {
            const fullExercise = await this.findById(row.id);
            exercises.push(fullExercise);
        }

        return exercises;
    },

    async findById(id) {
        const query = 'SELECT * FROM exercise WHERE id = $1';
        const result = await pool.query(query, [id]);

        if (result.rows.length === 0) {
            return null;
        }

        const exercise = result.rows[0];

        if (exercise.type === 'qcm') {
            const optionsQuery = 'SELECT * FROM qcm_option WHERE exercise_id = $1 ORDER BY id';
            const optionsResult = await pool.query(optionsQuery, [id]);
            exercise.options = optionsResult.rows;

            const answerQuery = 'SELECT correct_option_index FROM qcm_answer WHERE exercise_id = $1';
            const answerResult = await pool.query(answerQuery, [id]);
            exercise.correctOptionIndex = answerResult.rows[0]?.correct_option_index;
        } else if (exercise.type === 'quiz') {
            const answerQuery = 'SELECT answer FROM quiz_answer WHERE exercise_id = $1';
            const answerResult = await pool.query(answerQuery, [id]);
            exercise.answer = answerResult.rows[0]?.answer;
        } else if (exercise.type === 'code') {
            const testsQuery = 'SELECT * FROM code_test WHERE exercise_id = $1 ORDER BY id';
            const testsResult = await pool.query(testsQuery, [id]);
            exercise.tests = testsResult.rows;
        }

        return exercise;
    },

    async findByTeacher(idEnseignant) {
        // CORRECTION : utiliser idenseignant au lieu de "idEnseignant"
        const query = 'SELECT * FROM exercise WHERE idenseignant = $1 ORDER BY id DESC';
        const result = await pool.query(query, [idEnseignant]);
        const exercises = [];

        for (const row of result.rows) {
            const fullExercise = await this.findById(row.id);
            exercises.push(fullExercise);
        }

        return exercises;
    },

    async create(exerciceData) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const { title, type, statement, idEnseignant, idCours, options, correctOptionIndex, answer, tests } = exerciceData;

            // CORRECTION : utiliser idenseignant et idcours (minuscules)
            const insertExerciseQuery = `
                INSERT INTO exercise (title, type, statement, idenseignant, idcours)
                VALUES ($1, $2, $3, $4, $5)
                RETURNING *
            `;
            const exerciseResult = await client.query(insertExerciseQuery, [title, type, statement, idEnseignant, idCours || null]);
            const newExercise = exerciseResult.rows[0];

            if (type === 'qcm') {
                if (options && options.length > 0) {
                    for (const option of options) {
                        await client.query(
                            'INSERT INTO qcm_option (exercise_id, option_text) VALUES ($1, $2)',
                            [newExercise.id, option.option_text || option]
                        );
                    }
                }

                if (correctOptionIndex !== undefined) {
                    await client.query(
                        'INSERT INTO qcm_answer (exercise_id, correct_option_index) VALUES ($1, $2)',
                        [newExercise.id, correctOptionIndex]
                    );
                }
            } else if (type === 'quiz') {
                if (answer) {
                    await client.query(
                        'INSERT INTO quiz_answer (exercise_id, answer) VALUES ($1, $2)',
                        [newExercise.id, answer]
                    );
                }
            } else if (type === 'code') {
                if (tests && tests.length > 0) {
                    for (const test of tests) {
                        await client.query(
                            'INSERT INTO code_test (exercise_id, input, expected_output) VALUES ($1, $2, $3)',
                            [newExercise.id, test.input, test.expected_output]
                        );
                    }
                }
            }

            await client.query('COMMIT');
            return await this.findById(newExercise.id);
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    },

    async update(id, exerciceData) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const { title, type, statement, idCours, options, correctOptionIndex, answer, tests } = exerciceData;

            // CORRECTION : utiliser idcours (minuscule) au lieu de "idCours"
            const updateExerciseQuery = `
                UPDATE exercise
                SET title = $1, type = $2, statement = $3, idcours = $4
                WHERE id = $5
                RETURNING *
            `;
            await client.query(updateExerciseQuery, [title, type, statement, idCours || null, id]);

            await client.query('DELETE FROM qcm_option WHERE exercise_id = $1', [id]);
            await client.query('DELETE FROM qcm_answer WHERE exercise_id = $1', [id]);
            await client.query('DELETE FROM quiz_answer WHERE exercise_id = $1', [id]);
            await client.query('DELETE FROM code_test WHERE exercise_id = $1', [id]);

            if (type === 'qcm') {
                if (options && options.length > 0) {
                    for (const option of options) {
                        await client.query(
                            'INSERT INTO qcm_option (exercise_id, option_text) VALUES ($1, $2)',
                            [id, option.option_text || option]
                        );
                    }
                }

                if (correctOptionIndex !== undefined) {
                    await client.query(
                        'INSERT INTO qcm_answer (exercise_id, correct_option_index) VALUES ($1, $2)',
                        [id, correctOptionIndex]
                    );
                }
            } else if (type === 'quiz') {
                if (answer) {
                    await client.query(
                        'INSERT INTO quiz_answer (exercise_id, answer) VALUES ($1, $2)',
                        [id, answer]
                    );
                }
            } else if (type === 'code') {
                if (tests && tests.length > 0) {
                    for (const test of tests) {
                        await client.query(
                            'INSERT INTO code_test (exercise_id, input, expected_output) VALUES ($1, $2, $3)',
                            [id, test.input, test.expected_output]
                        );
                    }
                }
            }

            await client.query('COMMIT');
            return await this.findById(id);
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    },

    async delete(id) {
        const query = 'DELETE FROM exercise WHERE id = $1';
        await pool.query(query, [id]);
    },

    async enrollStudent(idUser, idExercice) {
        const query = `
            INSERT INTO "ETUDIANT_EXERCICE" ("idUser", "idExercice")
            VALUES ($1, $2)
            ON CONFLICT ("idUser", "idExercice") DO NOTHING
            RETURNING *
        `;
        const result = await pool.query(query, [idUser, idExercice]);
        return result.rows[0];
    },

    async isEnrolled(idUser, idExercice) {
        const query = 'SELECT * FROM "ETUDIANT_EXERCICE" WHERE "idUser" = $1 AND "idExercice" = $2';
        const result = await pool.query(query, [idUser, idExercice]);
        return result.rows.length > 0;
    },

    async getEnrolledExercises(idUser) {
        const query = `
            SELECT e.* FROM exercise e
            INNER JOIN "ETUDIANT_EXERCICE" ee ON e.id = ee."idExercice"
            WHERE ee."idUser" = $1
            ORDER BY e.id DESC
        `;
        const result = await pool.query(query, [idUser]);
        const exercises = [];

        for (const row of result.rows) {
            const fullExercise = await this.findById(row.id);
            exercises.push(fullExercise);
        }

        return exercises;
    }
};

module.exports = exerciceModel;