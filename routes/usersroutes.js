var express = require('express');
var router = express.Router();
const pool = require('../db');


//get all users 
router.get("/", async (req, res) => {
    try {
        const allUsers = await pool.query('SELECT * FROM appuser');

        res.json(allUsers.rows);

    } catch (err) {
        console.log(err.message)
    }
})

//get a single user 
router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params
        const user = await pool.query('SELECT * FROM appuser WHERE appuser_uid = $1', [id]);

        res.json(user.rows[0]);

    } catch (err) {
        console.log(err.message)
    }
})

//delete a user
router.delete("/:id", async (req, res) => {
    try {

        const { id } = req.params
        const deleteUsers = await pool.query('DELETE FROM appuser * WHERE appuser_id = $1', [id]);

        res.json('user deleted !');

    } catch (err) {
        console.log(err.message)
    }
})


//create a user 
router.post('/', async (req, res) => {
    try {
        const {
            appuser_uid,
            appuser_email,
            appuser_name,
            appuser_grade,
            appuser_state,
            appuser_school
        } = req.body

        const newUser = await pool.query(`
        INSERT INTO appuser (
            appuser_uid,
            appuser_email,
            appuser_name,
            appuser_grade,
            appuser_state,
            appuser_school
            ) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,

            [appuser_uid,
            appuser_email,
            appuser_name,
            appuser_grade,
            appuser_state,
            appuser_school]);

        res.json(newUser.rows);

    } catch (err) {
        console.log(err.message)
    }
}
)





module.exports = router;

