const db = require('../config/db')
const { QueryTypes } = require('sequelize')


const sequelizeExamHistory = require('../sequelize-models/ExamHistory')
const sequelizeUserExamHistoryMapping = require('../sequelize-models/UserExamHistoryMapping')


exports.view_AllQuizDetails = async (req, res, next) => {
    try {
        console.log("All Quiz Details", req.body);
        const quizDetailsAll = await sequelizeExamHistory.findAll({
            attributes: ['id', 'quiz_name', 'total_question', 'time', 'marks', 'question']
        })
        console.log("quizDetails", quizDetailsAll);

        res.json({
            data: quizDetailsAll
        })
    }
    catch (err) {
        console.log(err)
        res.status(500).json({
            error: err
        })
    }

}

exports.view_quizDetails = async (req, res, next) => {

    console.log("one", req.user.id);

    const userQuizDetailslist = [];
    const findUserId = await sequelizeUserExamHistoryMapping.findAll({
        where: {
            user_id: req.user.id,
        },
        attributes: ["exam_history_id"]
    })
    findUserId.map((val) => {
        userQuizDetailslist.push(val.exam_history_id)
    })
    console.log("list", userQuizDetailslist);

    try {
        if (userQuizDetailslist === undefined || userQuizDetailslist.length === 0) {
            console.log("two")
            return res.status(404).send({ message: "Quiz details is not found!!!" });

        } else {
            const quizDetails = await db.query(
                `SELECT
                    eh.id,
                    eh.quiz_name,
                    eh.total_question,
                    eh.marks,
                    eh.time,
                    eh.question
                FROM
                    quiz_app.users u,
                    quiz_app.exam_history eh,
                    quiz_app.user_exam_history_mapping uehm
                WHERE
                u.id = uehm.user_id
                AND eh.id = uehm.exam_history_id
                AND u.id = ${req.user.id};`
                , {
                    type: QueryTypes.SELECT
                })

            res.json({
                message: "Find successfully", quizDetails
            })
        }

    }

    catch (err) {
        console.log(err)
        res.status(500).json({
            error: err
        })
    }
}

exports.create_quizDetails = async (req, res, next) => {
    console.log("quiz_create_details", req.body);
    // console.log("two", req.user);
    // console.log("three", req.user.id);

    // const user_id = req.user.id

    try {
        const { quiz_name, total_question, time, marks, question } = req.body;
        if (quiz_name === undefined || total_question === undefined || question === undefined || time === undefined || marks === undefined) {
            return res.status(500).send({
                message: "Something went wrong!"
            });
        }

        const newQuizDetails = await sequelizeExamHistory.create({
            quiz_name,
            total_question,
            time,
            marks,
            question
        })
        // console.log(newQuiz)
        // console.log("newQuizID", newQuiz.id)

        const userExamHistory = await sequelizeUserExamHistoryMapping.create({
            user_id: req.user.id,
            exam_history_id: newQuizDetails.id
        })

        res.json({
            data: "New Quiz_Details created successfully",
            newQuizDetails
        })

        if (!newQuizDetails) {
            const error = new Error('Quiz_Details is not created!');
            error.status = 500;
            throw error;
        }
    }
    catch (err) {
        console.log(err)
        res.status(500).json({
            error: err
        })
    }
}

exports.view_AllQuizDetailsAdmin = async (req, res, next) => {
    try {
        const quizDetailsAdmin = await db.query(
            `SELECT
                u.id,
                u.email,
                u.name,
                eh.id,
                eh.quiz_name,
                eh.total_question,
                eh.time,
                eh.marks
            FROM
                quiz_app.users u,
                quiz_app.exam_history eh,
                quiz_app.user_exam_history_mapping uehm
            WHERE
                u.id = uehm.user_id
                AND eh.id = uehm.exam_history_id;`
            , {
                type: QueryTypes.SELECT
            })

        res.json({
            message: "Find successfully", quizDetailsAdmin
        })
    }
    catch (err) {
        console.log(err)
        res.status(500).json({
            error: err
        })
    }

}

exports.view_AllQuizDetailsTutor = async (req, res, next) => {
    try {
        const quizDetailsTutor = await db.query(
            `SELECT
                    u.id,
                    u.email,
                    u.name,
                    eh.id,
                    eh.quiz_name,
                    eh.total_question,
                    eh.time,
                    eh.marks
                FROM
                    quiz_app.users u,
                    quiz_app.quiz q,
                    quiz_app.exam_history eh,
                    quiz_app.user_quiz_mapping uqm,
                    quiz_app.user_exam_history_mapping uehm
                WHERE
                u.id = uehm.user_id
                AND uehm.exam_history_id = eh.id        
                AND eh.quiz_name = q.quiz_name
                AND q.id = uqm.quiz_id
                AND uqm.user_id = ${req.user.id};`
            , {
                type: QueryTypes.SELECT
            })

        res.json({
            message: "Find successfully", quizDetailsTutor
        })
    }

    catch (err) {
        console.log(err)
        res.status(500).json({
            error: err
        })
    }

}

