const pool = require('../config/database');

const coursModel = {
    async findAll() {
        const query = 'SELECT * FROM "COURS"';
        const result = await pool.query(query);
        return result.rows;
    },

    async findById(id) {
        const courseQuery = 'SELECT * FROM "COURS" WHERE "idCours" = $1';
        const courseResult = await pool.query(courseQuery, [id]);

        if (courseResult.rows.length === 0) {
            return null;
        }

        const course = courseResult.rows[0];

        const sectionsQuery = `
            SELECT "idSection", "section", "theorie", "codeExample"
            FROM "COURS_SECTION"
            WHERE "idCours" = $1
            ORDER BY "idSection"
        `;
        const sectionsResult = await pool.query(sectionsQuery, [id]);

        const topicsQuery = `
            SELECT "idTopic", "nom"
            FROM "TOPIC"
            WHERE "idCours" = $1
            ORDER BY "idTopic"
        `;
        const topicsResult = await pool.query(topicsQuery, [id]);

        return {
            ...course,
            content: sectionsResult.rows,
            topics: topicsResult.rows
        };
    },

    async findByTeacher(idEnseignant) {
        const query = 'SELECT * FROM "COURS" WHERE "idEnseignant" = $1';
        const result = await pool.query(query, [idEnseignant]);
        return result.rows;
    },

    async create(coursData) {
        const { idCours, titre, niveau, description, duree, idEnseignant, sections, topics } = coursData;

        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const courseQuery = `
                INSERT INTO "COURS" ("idCours", "titre", "niveau", "description", "duree", "idEnseignant")
                VALUES ($1, $2, $3, $4, $5, $6)
                RETURNING *
            `;
            const courseResult = await client.query(courseQuery, [
                idCours, titre, niveau, description, duree, idEnseignant
            ]);
            const course = courseResult.rows[0];

            if (sections && sections.length > 0) {
                for (const section of sections) {
                    const sectionQuery = `
                        INSERT INTO "COURS_SECTION" ("section", "theorie", "codeExample", "idCours")
                        VALUES ($1, $2, $3, $4)
                    `;
                    await client.query(sectionQuery, [
                        section.section,
                        section.theorie,
                        section.codeExample || null,
                        course.idCours
                    ]);
                }
            }

            if (topics && topics.length > 0) {
                for (const topic of topics) {
                    const topicQuery = `
                        INSERT INTO "TOPIC" ("nom", "idCours")
                        VALUES ($1, $2)
                    `;
                    await client.query(topicQuery, [
                        topic.nom,
                        course.idCours
                    ]);
                }
            }

            await client.query('COMMIT');
            return course;
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }
    },

    async update(id, coursData) {
        const { titre, niveau, description, duree, sections, topics } = coursData;

        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const updateQuery = `
                UPDATE "COURS"
                SET "titre" = $1, "niveau" = $2, "description" = $3, "duree" = $4
                WHERE "idCours" = $5
                RETURNING *
            `;
            const result = await client.query(updateQuery, [titre, niveau, description, duree, id]);
            const course = result.rows[0];

            if (sections && sections.length > 0) {
                await client.query('DELETE FROM "COURS_SECTION" WHERE "idCours" = $1', [id]);

                for (const section of sections) {
                    const sectionQuery = `
                        INSERT INTO "COURS_SECTION" ("section", "theorie", "codeExample", "idCours")
                        VALUES ($1, $2, $3, $4)
                    `;
                    await client.query(sectionQuery, [
                        section.section,
                        section.theorie,
                        section.codeExample || null,
                        id
                    ]);
                }
            }

            if (topics && topics.length > 0) {
                await client.query('DELETE FROM "TOPIC" WHERE "idCours" = $1', [id]);

                for (const topic of topics) {
                    const topicQuery = `
                        INSERT INTO "TOPIC" ("nom", "idCours")
                        VALUES ($1, $2)
                    `;
                    await client.query(topicQuery, [
                        topic.nom,
                        id
                    ]);
                }
            }

            await client.query('COMMIT');
            return course;
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }
    },

    async delete(id) {
        const query = 'DELETE FROM "COURS" WHERE "idCours" = $1';
        await pool.query(query, [id]);
    },

    async enrollStudent(idUser, idCours) {
        const query = `
            INSERT INTO "ETUDIANT_COURS" ("idUser", "idCours", "temps_debut", "temps_fin", "temps_concentration")
            VALUES ($1, $2, 0, 0, 0)
            ON CONFLICT ("idUser", "idCours") DO NOTHING
            RETURNING *
        `;
        const result = await pool.query(query, [idUser, idCours]);
        return result.rows[0];
    },

    async isEnrolled(idUser, idCours) {
        const query = 'SELECT * FROM "ETUDIANT_COURS" WHERE "idUser" = $1 AND "idCours" = $2';
        const result = await pool.query(query, [idUser, idCours]);
        return result.rows.length > 0;
    },

    async getEnrolledCourses(idUser) {
        const query = `
            SELECT c.* FROM "COURS" c
            INNER JOIN "ETUDIANT_COURS" ec ON c."idCours" = ec."idCours"
            WHERE ec."idUser" = $1
        `;
        const result = await pool.query(query, [idUser]);
        return result.rows;
    }
};

module.exports = coursModel;
