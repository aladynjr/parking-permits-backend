var express = require('express');
var router = express.Router();
const pool = require('../db');


//get all registrations
router.get("/", async (req, res) => {
    try {
        const allUsersRegistrations = await pool.query('SELECT * FROM registration');

        res.json(allUsersRegistrations.rows);

    } catch (err) {
        console.log(err.message)
    }
})

//get a single registration
router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params
        const registration = await pool.query('SELECT * FROM registration WHERE registration_uid = $1', [id]);

        res.json(registration.rows[0]);

    } catch (err) {
        console.log(err.message)
    }
})


//delete a registration
router.delete("/:id", async (req, res) => {
    try {

        const { id } = req.params
        const deleteRegistration = await pool.query('DELETE FROM registration * WHERE registration_id = $1', [id]);

        res.json('registration deleted !');

    } catch (err) {
        console.log(err.message)
    }
})


//create a registration
router.post('/', async (req, res) => {
    try {
        const {
            registration_licence_plate,
            registration_apartment_number,
            registration_passcode,
            registration_start_date,
            registration_start_time,
            registration_parking_duration,
            registration_contact_email,
            registration_contact_phone,
            registration_hours_until_cancel,
            registration_active_days
        } = req.body

        const newRegistration = await pool.query(`
        INSERT INTO registration (
            registration_licence_plate,
            registration_apartment_number,
            registration_passcode,
            registration_start_date,
            registration_start_time,
            registration_parking_duration,
            registration_contact_email,
            registration_contact_phone,
            registration_hours_until_cancel,
            registration_active_days
			
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,

            [registration_licence_plate,
                registration_apartment_number,
                registration_passcode,
                registration_start_date,
                registration_start_time,
                registration_parking_duration,
                registration_contact_email,
                registration_contact_phone,
                registration_hours_until_cancel,
                registration_active_days
                ]);

        res.json(newRegistration.rows[0]);

    } catch (err) {
        console.log(err.message)
    }
}
)





module.exports = router;

