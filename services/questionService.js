const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class QuestionService {
    constructor() {
        this.dbPath = process.env.DATABASE_PATH || './database/questions.db';
        this.db = null;
    }

    async initializeDatabase() {
        return new Promise((resolve, reject) => {
            this.db = new sqlite3.Database(this.dbPath, (err) => {
                if (err) {
                    console.error('Error opening database:', err);
                    reject(err);
                } else {
                    console.log('Connected to SQLite database');
                    this.createTables().then(resolve).catch(reject);
                }
            });
        });
    }

    async createTables() {
        return new Promise((resolve, reject) => {
            const createQuestionsTable = `
                CREATE TABLE IF NOT EXISTS questions (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    topic TEXT NOT NULL,
                    question TEXT NOT NULL,
                    option_a TEXT NOT NULL,
                    option_b TEXT NOT NULL,
                    option_c TEXT NOT NULL,
                    option_d TEXT NOT NULL,
                    correct_answer TEXT NOT NULL,
                    explanation TEXT NOT NULL,
                    difficulty TEXT DEFAULT 'medium',
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            `;

            this.db.run(createQuestionsTable, (err) => {
                if (err) {
                    console.error('Error creating questions table:', err);
                    reject(err);
                } else {
                    console.log('Questions table created successfully');
                    this.seedQuestions().then(resolve).catch(reject);
                }
            });
        });
    }

    async seedQuestions() {
        return new Promise((resolve, reject) => {
            // Check if questions already exist
            this.db.get("SELECT COUNT(*) as count FROM questions", (err, row) => {
                if (err) {
                    reject(err);
                    return;
                }

                if (row.count > 0) {
                    console.log('Questions already exist in database');
                    resolve();
                    return;
                }

                // Insert sample questions
                const questions = this.getSampleQuestions();
                const insertQuery = `
                    INSERT INTO questions (topic, question, option_a, option_b, option_c, option_d, correct_answer, explanation, difficulty)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                `;

                let completed = 0;
                questions.forEach((q, index) => {
                    this.db.run(insertQuery, [
                        q.topic,
                        q.question,
                        q.option_a,
                        q.option_b,
                        q.option_c,
                        q.option_d,
                        q.correct_answer,
                        q.explanation,
                        q.difficulty
                    ], (err) => {
                        if (err) {
                            console.error(`Error inserting question ${index + 1}:`, err);
                        }
                        completed++;
                        if (completed === questions.length) {
                            console.log(`Inserted ${questions.length} sample questions`);
                            resolve();
                        }
                    });
                });
            });
        });
    }

    getSampleQuestions() {
        return [
            // Mathematics Questions
            {
                topic: 'math',
                question: 'What is the value of 15 + 27?',
                option_a: '40',
                option_b: '42',
                option_c: '44',
                option_d: '46',
                correct_answer: 'B',
                explanation: '15 + 27 = 42. You can add 15 + 20 = 35, then 35 + 7 = 42.',
                difficulty: 'easy'
            },
            {
                topic: 'math',
                question: 'If a triangle has angles of 60°, 60°, and 60°, what type of triangle is it?',
                option_a: 'Right triangle',
                option_b: 'Isosceles triangle',
                option_c: 'Equilateral triangle',
                option_d: 'Scalene triangle',
                correct_answer: 'C',
                explanation: 'An equilateral triangle has all three angles equal to 60° and all three sides equal in length.',
                difficulty: 'medium'
            },
            {
                topic: 'math',
                question: 'What is the derivative of x²?',
                option_a: 'x',
                option_b: '2x',
                option_c: 'x²',
                option_d: '2x²',
                correct_answer: 'B',
                explanation: 'Using the power rule: d/dx(x²) = 2x¹ = 2x.',
                difficulty: 'hard'
            },
            {
                topic: 'math',
                question: 'What is 25% of 80?',
                option_a: '15',
                option_b: '20',
                option_c: '25',
                option_d: '30',
                correct_answer: 'B',
                explanation: '25% of 80 = 0.25 × 80 = 20.',
                difficulty: 'easy'
            },
            {
                topic: 'math',
                question: 'Solve for x: 2x + 5 = 13',
                option_a: 'x = 3',
                option_b: 'x = 4',
                option_c: 'x = 5',
                option_d: 'x = 6',
                correct_answer: 'B',
                explanation: '2x + 5 = 13, so 2x = 8, therefore x = 4.',
                difficulty: 'medium'
            },

            // Science Questions
            {
                topic: 'science',
                question: 'What is the chemical symbol for water?',
                option_a: 'H2O',
                option_b: 'CO2',
                option_c: 'NaCl',
                option_d: 'O2',
                correct_answer: 'A',
                explanation: 'Water is H2O, which means it contains 2 hydrogen atoms and 1 oxygen atom.',
                difficulty: 'easy'
            },
            {
                topic: 'science',
                question: 'Which planet is known as the Red Planet?',
                option_a: 'Venus',
                option_b: 'Mars',
                option_c: 'Jupiter',
                option_d: 'Saturn',
                correct_answer: 'B',
                explanation: 'Mars is called the Red Planet because of the iron oxide (rust) on its surface, which gives it a reddish appearance.',
                difficulty: 'easy'
            },
            {
                topic: 'science',
                question: 'What is the process by which plants make their own food?',
                option_a: 'Respiration',
                option_b: 'Photosynthesis',
                option_c: 'Digestion',
                option_d: 'Fermentation',
                correct_answer: 'B',
                explanation: 'Photosynthesis is the process by which plants use sunlight, carbon dioxide, and water to produce glucose and oxygen.',
                difficulty: 'medium'
            },
            {
                topic: 'science',
                question: 'What is the speed of light in a vacuum?',
                option_a: '300,000 km/s',
                option_b: '300,000,000 m/s',
                option_c: '3 × 10⁸ m/s',
                option_d: 'All of the above',
                correct_answer: 'D',
                explanation: 'The speed of light in a vacuum is approximately 3 × 10⁸ m/s, which is also 300,000 km/s or 300,000,000 m/s.',
                difficulty: 'hard'
            },
            {
                topic: 'science',
                question: 'Which gas makes up most of Earth\'s atmosphere?',
                option_a: 'Oxygen',
                option_b: 'Carbon dioxide',
                option_c: 'Nitrogen',
                option_d: 'Argon',
                correct_answer: 'C',
                explanation: 'Nitrogen makes up about 78% of Earth\'s atmosphere, while oxygen makes up about 21%.',
                difficulty: 'medium'
            },

            // English Questions
            {
                topic: 'english',
                question: 'What is the plural of "child"?',
                option_a: 'childs',
                option_b: 'children',
                option_c: 'childes',
                option_d: 'child\'s',
                correct_answer: 'B',
                explanation: 'The plural of "child" is "children". This is an irregular plural form.',
                difficulty: 'easy'
            },
            {
                topic: 'english',
                question: 'Which word is a synonym for "happy"?',
                option_a: 'Sad',
                option_b: 'Angry',
                option_c: 'Joyful',
                option_d: 'Tired',
                correct_answer: 'C',
                explanation: '"Joyful" is a synonym for "happy" as both words express positive emotions.',
                difficulty: 'easy'
            },
            {
                topic: 'english',
                question: 'What type of word is "quickly" in the sentence "She ran quickly"?',
                option_a: 'Noun',
                option_b: 'Verb',
                option_c: 'Adjective',
                option_d: 'Adverb',
                correct_answer: 'D',
                explanation: '"Quickly" is an adverb because it modifies the verb "ran" by describing how she ran.',
                difficulty: 'medium'
            },
            {
                topic: 'english',
                question: 'Which sentence is written in passive voice?',
                option_a: 'The cat chased the mouse.',
                option_b: 'The mouse was chased by the cat.',
                option_c: 'The cat is chasing the mouse.',
                option_d: 'The cat will chase the mouse.',
                correct_answer: 'B',
                explanation: 'Passive voice has the subject receiving the action. "The mouse was chased by the cat" is passive voice.',
                difficulty: 'medium'
            },
            {
                topic: 'english',
                question: 'What is the main theme of Shakespeare\'s "Romeo and Juliet"?',
                option_a: 'Revenge',
                option_b: 'Love conquers all',
                option_c: 'Power and corruption',
                option_d: 'Coming of age',
                correct_answer: 'B',
                explanation: 'The main theme of "Romeo and Juliet" is that love can overcome obstacles, even family feuds and social barriers.',
                difficulty: 'hard'
            },

            // History Questions
            {
                topic: 'history',
                question: 'In which year did World War II end?',
                option_a: '1944',
                option_b: '1945',
                option_c: '1946',
                option_d: '1947',
                correct_answer: 'B',
                explanation: 'World War II ended in 1945 with the surrender of Japan on September 2, 1945.',
                difficulty: 'easy'
            },
            {
                topic: 'history',
                question: 'Who was the first President of the United States?',
                option_a: 'John Adams',
                option_b: 'Thomas Jefferson',
                option_c: 'George Washington',
                option_d: 'Benjamin Franklin',
                correct_answer: 'C',
                explanation: 'George Washington was the first President of the United States, serving from 1789 to 1797.',
                difficulty: 'easy'
            },
            {
                topic: 'history',
                question: 'Which ancient wonder of the world was located in Alexandria?',
                option_a: 'Hanging Gardens',
                option_b: 'Colossus of Rhodes',
                option_c: 'Lighthouse of Alexandria',
                option_d: 'Temple of Artemis',
                correct_answer: 'C',
                explanation: 'The Lighthouse of Alexandria, also known as the Pharos of Alexandria, was one of the Seven Wonders of the Ancient World.',
                difficulty: 'medium'
            },
            {
                topic: 'history',
                question: 'What was the name of the ship that brought the Pilgrims to America?',
                option_a: 'Mayflower',
                option_b: 'Santa Maria',
                option_c: 'Endeavour',
                option_d: 'Discovery',
                correct_answer: 'A',
                explanation: 'The Mayflower brought the Pilgrims from England to America in 1620, landing at Plymouth Rock.',
                difficulty: 'medium'
            },
            {
                topic: 'history',
                question: 'Which empire was ruled by Julius Caesar?',
                option_a: 'Greek Empire',
                option_b: 'Roman Empire',
                option_c: 'Byzantine Empire',
                option_d: 'Ottoman Empire',
                correct_answer: 'B',
                explanation: 'Julius Caesar was a Roman general and statesman who played a critical role in the rise of the Roman Empire.',
                difficulty: 'hard'
            }
        ];
    }

    async getQuestion(topic, index) {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT * FROM questions 
                WHERE topic = ? 
                ORDER BY id 
                LIMIT 1 OFFSET ?
            `;

            this.db.get(query, [topic, index], (err, row) => {
                if (err) {
                    reject(err);
                } else if (row) {
                    resolve({
                        id: row.id,
                        question: row.question,
                        options: [row.option_a, row.option_b, row.option_c, row.option_d],
                        correctAnswer: row.correct_answer,
                        explanation: row.explanation,
                        difficulty: row.difficulty
                    });
                } else {
                    resolve(null);
                }
            });
        });
    }

    async getQuestionsByTopic(topic, limit = 10) {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT * FROM questions 
                WHERE topic = ? 
                ORDER BY RANDOM() 
                LIMIT ?
            `;

            this.db.all(query, [topic, limit], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    const questions = rows.map(row => ({
                        id: row.id,
                        question: row.question,
                        options: [row.option_a, row.option_b, row.option_c, row.option_d],
                        correctAnswer: row.correct_answer,
                        explanation: row.explanation,
                        difficulty: row.difficulty
                    }));
                    resolve(questions);
                }
            });
        });
    }

    async getQuestionCount(topic) {
        return new Promise((resolve, reject) => {
            const query = topic 
                ? "SELECT COUNT(*) as count FROM questions WHERE topic = ?"
                : "SELECT COUNT(*) as count FROM questions";
            
            const params = topic ? [topic] : [];

            this.db.get(query, params, (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row.count);
                }
            });
        });
    }

    async addQuestion(questionData) {
        return new Promise((resolve, reject) => {
            const query = `
                INSERT INTO questions (topic, question, option_a, option_b, option_c, option_d, correct_answer, explanation, difficulty)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;

            this.db.run(query, [
                questionData.topic,
                questionData.question,
                questionData.option_a,
                questionData.option_b,
                questionData.option_c,
                questionData.option_d,
                questionData.correct_answer,
                questionData.explanation,
                questionData.difficulty || 'medium'
            ], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(this.lastID);
                }
            });
        });
    }

    async getTopics() {
        return new Promise((resolve, reject) => {
            const query = "SELECT DISTINCT topic FROM questions ORDER BY topic";
            
            this.db.all(query, [], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    const topics = rows.map(row => row.topic);
                    resolve(topics);
                }
            });
        });
    }

    close() {
        if (this.db) {
            this.db.close((err) => {
                if (err) {
                    console.error('Error closing database:', err);
                } else {
                    console.log('Database connection closed');
                }
            });
        }
    }
}

module.exports = new QuestionService();
