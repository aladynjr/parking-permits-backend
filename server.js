const express = require('express');
const cors = require('cors');
const users = require('./routes/usersroutes');
const registrations = require('./routes/registrationsroutes');
const app = express();
app.use(express.json())

const pool = require('./db');

var cron = require('node-cron');

const EventEmitter = require('events');
const event = new EventEmitter();

const corsOptions = {
    origin: '*',
    credentials: true,            //access-control-allow-credentials:true
    optionSuccessStatus: 200,
}

app.use(cors(corsOptions)) // Use this after the variable declaration


//puppeteer
const { Keyboard } = require('puppeteer');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');


//ROUTES 
//users
app.use("/api/appuser", users)

app.get("/", async (req, res) => {
    try {

        res.json({ 'message: ': 'this is working finnnnnnne' })
    } catch (err) {
        console.log(err.message)
    }
})
//registrations
app.use("/api/registration", registrations)

//click by text
const escapeXpathString = str => {
    const splitedQuotes = str.replace(/'/g, `', "'", '`);
    return `concat('${splitedQuotes}', '')`;
};

const clickByText = async (page, text) => {
    const escapedText = escapeXpathString(text);
    const linkHandlers = await page.$x(`//a[contains(text(), ${escapedText})]`);

    if (linkHandlers.length > 0) {
        await linkHandlers[0].click();
    } else {
        throw new Error(`Link not found: ${text}`);
    }
};

//register vehicle 

const RegisterVehicle = (
    id,
    licencePlate,
    apartmentNumber,
    passcode,
    startDate,
    startTime,
    parkingDuration,
    contactEmail,
    contactPhone) => {

    (async () => {
        console.log('bot started to register id : ', id)
        const browser = await puppeteer.launch({
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-gpu',
                '--enable-webgl',
                '--window-size=1860,1400'
            ]
        });

        const submissionUrl = "https://homecomingpreserve.parkingattendant.com/rtqjn8cnc50jzc1enhsmrk4vjw/services"
        const ua = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.91 Safari/537.36";
        const page = await browser.newPage();

        await page.setUserAgent(ua);
        await page.goto(submissionUrl, { waitUntil: 'networkidle2' });
       
        await page.waitForSelector('body > main > section:nth-child(2) > nav:nth-child(1) > a:nth-child(5)');
        await clickByText(page, `register vehicle`);
        await page.waitForTimeout(4000)

      //  const data = await page.evaluate(() => document.querySelector('valid').outerHTML);

      //  console.log(data);
        
        await page.waitForSelector('body > main > section:nth-child(3) > form > fieldset.valid');
        await page.type('INPUT[name=vehicle]', licencePlate)
        await page.type('INPUT[name=tenant]', apartmentNumber)
        await page.type('INPUT[name=token]', passcode)

        await page.select('select[name="startDate"]', startDate)
        await page.waitForTimeout(200)
        await page.select('select[name="valid.min.time"]', startTime); 

        // await page.waitForTimeout(200)
        // await page.waitForSelector('body > main > section:nth-child(3) > form > fieldset.valid > fieldset.valid.duration > label > select', {
        //     visible: true,
        //   });
        //  await page.select('body > main > section:nth-child(3) > form > fieldset.valid > fieldset.valid.duration > label > select', parkingDuration)

        // const durationSelector = await page.$('body > main > section:nth-child(3) > form > fieldset.valid > fieldset.valid.duration > label > select ');
        // if (durationSelector) {
        // }


        //await page.type('INPUT[type=email]', ('start date : ' + startDate + ' start time : ' + startTime))


      //  const data = await page.evaluate(() => document.querySelector('fieldset .valid.duration > ul > li:nth-child(1) > label > input[type=radio]').outerHTML);
     //   console.log(data);

await page.click('fieldset .valid.duration > ul > li:nth-child(1) > label > input[type=radio]')
        await page.type('INPUT[type=email]', contactEmail)
        await page.type('INPUT[type=tel]', contactPhone)

        await page.click('BUTTON[type=submit]')


        //check if chomre alert appeared     
        page.on('dialog', async dialog => {
            console.log(dialog.message());
            console.log('a dialog appeared !')
            UpdateRegistration(id, 'registration_error', dialog.message())
            UpdateRegistration(id, 'registration_state', 'notregistered')
            await page.waitForTimeout(5000);
            await dialog.accept();
            console.log('closing browser');
            await browser.close();
        });

        //check if an alert dialog appeared then log the message 
       await page.waitForTimeout(6000)

        if (page.url().startsWith('https://homecomingpreserve.parkingattendant.com/p/')) {
            const grabRecord = await page.evaluate(() =>{
                const record = document.querySelector('body > main > section.permit > figure.permit > dl:nth-child(4) > dd:nth-child(4) > data')
            return record.innerText;
            })
            console.log('registration success RECORD : ', grabRecord)
            UpdateRegistration(id, 'registration_record', grabRecord)

            UpdateRegistration(id, 'registration_state', 'registered')
            await page.waitForTimeout(5000);
            
        }
        if(!page.url().startsWith('https://homecomingpreserve.parkingattendant.com/p/')) {
            console.log('registration failed')
            UpdateRegistration(id, 'registration_state', 'notregistered')
            
            await page.waitForTimeout(5000);

           
        }
        //finish and close browser
        console.log('closing browser');
        await browser.close();

    })();
}

const CancelRegistration = (
    id,
    licencePlate,
    apartmentNumber,
    passcode,
    startDate,
    startTime,
    parkingDuration,
    contactEmail,
    contactPhone) => {

    (async () => {

        console.log('bot started to CANCEL  id : ', id)
        const browser = await puppeteer.launch({
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-gpu',
                '--enable-webgl',
                '--window-size=800,800'
            ]

        });

        const submissionUrl = "https://homecomingpreserve.parkingattendant.com/rtqjn8cnc50jzc1enhsmrk4vjw/services"
        const ua = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.91 Safari/537.36";
        const page = await browser.newPage();

        await page.setUserAgent(ua);
        await page.goto(submissionUrl, { waitUntil: 'networkidle2' });
        await page.waitForSelector('body > main > section:nth-child(2) > nav:nth-child(1) > a:nth-child(5)');
        await clickByText(page, `Check Your Usage`);
        await page.waitForSelector('body > main > section:nth-child(17) > form > fieldset.tenant.account > label > input[type=text]');

        await page.type('INPUT[name=tenant]', apartmentNumber)
        await page.type('INPUT[name=password]', passcode)

        // await page.click('body > main > section:nth-child(17) > form > button')
        //await page.waitForTimeout(3000);
        const button = await page.$('body > main > section:nth-child(17) > form > button');
        await button.evaluate(b => b.click());

        //  await page.click('BUTTON[type="submit"]')

        page.on('dialog', async dialog => {
            console.log(dialog.message());
            console.log('a dialog appeared !')
            UpdateRegistration(id, 'registration_cancel_error', dialog.message())
            //UpdateRegistration(id, 'registration_state', 'notregistered')
            await dialog.accept();
        });

        //--PERMITS LIST PAGE--

        await page.waitForTimeout(5000);
        //check if we reached permits page, or close browser
        const elementExists = await page.$('body > main > section:nth-child(17) > article > ul > li > ul:nth-child(4) > li > a');
        console.log('closing browser');if (!elementExists) { console.log('closing browser'); 
        await browser.close(); }
        else {

            //wait for details button, click on details of permit
            await page.waitForSelector('body > main > section:nth-child(17) > article > ul > li > ul:nth-child(4) > li > a');
            await page.click('body > main > section:nth-child(17) > article > ul > li > ul:nth-child(4) > li > a')

            //wait for cancel button ,click on it
            await page.waitForSelector('body > main > section.permit > figure.permit > nav > button');
            await page.click('body > main > section.permit > figure.permit > nav > button')

            //write email 
            await page.type('INPUT[id=send-to-email]', contactEmail)

            //click cancel button
            // await page.waitForSelector('body > main > section.permit > figure.permit > nav > section > form > button');
            // await page.click('body > main > section.permit > figure.permit > nav > section > form > button')

            const button = await page.$('body > main > section.permit > figure.permit > nav > section > form > button');
            await button.evaluate(b => b.click());


            UpdateRegistration(id, 'registration_cancel_error', '')
            UpdateRegistration(id, 'registration_error', '')
            UpdateRegistration(id, 'registration_record', '')

            UpdateRegistration(id, 'registration_state', 'notregistered')


            console.log('registration cancelled, id : ', id)
        }

        await page.waitForTimeout(10000);

        console.log('closing browser');
        await browser.close();



    })();
}


//update registration 
const UpdateRegistration = (id, column, newValue) => {
    pool.query(
        'UPDATE registration SET ' + column + ' = $1 WHERE registration_id = $2',
        [newValue, id],
        (error, results) => {
            if (error) {
                throw error
            }
            if (column == 'registration_contact_phone') {
                console.log('#####   updated bot last active time value to : ', new Date(newValue).toLocaleString("en-US", { timeZone: "America/Los_Angeles" }), '    #####')
            } else {

                console.log('updated column ' + column + ' with : ', newValue, ' in registration with id : ', id)
            }
        }
    )
}

var registrationsList
const FetchRegistrations = async () => {
    UpdateRegistration(1, 'registration_contact_phone', new Date().getTime())
    try {
        const allUsersRegistrations = await pool.query('SELECT * FROM registration');

        registrationsList = allUsersRegistrations.rows;
        //console.log(registrationsList.length);
        if (registrationsList.length > 0) {
            registrationsList.map((registration) => {
                var startDate = new Date(registration.registration_start_date + ' 21:00 ' );
                startDate.setHours(0, 0, 0, 0)


                var startTime = new Date(registration.registration_start_date + ' ' + registration.registration_start_time)//.toLocaleTimeString('en-US', {timeZone: "America/Los_Angeles", hour: 'numeric', minute: 'numeric', hour12: false })

                var endTime = new Date(startTime.getTime() + (Number(registration.registration_hours_until_cancel) * 60 * 60 * 1000));

                var cancelTimePassed = new Date().setMonth(4, 4, 4) >= endTime.setMonth(4, 4, 4)


                if (registration.registration_state == 'notregistered') {
                    var minuteTolerance = 10;
                    var isSameHour = Number(new Date().toLocaleString('en-US', { timeZone: "America/Los_Angeles", hour: 'numeric', hour12: false }).substring(0, 2)) == Number(registration.registration_start_time.split(':')[0]);
                    var isSameMinute =  (Number(registration.registration_start_time.split(':')[1].substring(0, 2)) <= Number(String(new Date().getMinutes()).padStart(2, '0')) + minuteTolerance) && (Number(registration.registration_start_time.split(':')[1].substring(0, 2)) >= Number(String(new Date().getMinutes()).padStart(2, '0')) - minuteTolerance);
                    var isActiveDay = registration.registration_active_days.includes(new Date().toLocaleString('en-us', { timeZone: "America/Los_Angeles", weekday: 'long' }))
                    var isStartingDayPassed = startDate <= new Date().setHours(0, 0, 0, 0);

                    //check is star date has passed or not 
                    //compare startDate and endDate without time 



                    var eligible = (isActiveDay && isSameHour && isSameMinute && isStartingDayPassed && (registration.registration_state == 'notregistered'))


                    var done = false;
                    console.log(`
                    `)
                    console.log('---------- FALSE STATE, ID : ', registration.registration_id, ' --------------')


                    if (eligible && !done) {
                        console.log('eligible for registration,  id :', registration.registration_id);
                        RegisterVehicle(
                            registration.registration_id,
                            registration.registration_licence_plate,
                            registration.registration_apartment_number,
                            registration.registration_passcode,
                            registration.registration_start_date,
                            registration.registration_start_time,
                            registration.registration_parking_duration,
                            registration.registration_contact_email,
                            registration.registration_contact_phone,

                        )
                        done = true
                    } else {
                        console.log('not eligible for registration, because of : ',
                            ((!isActiveDay) ? '- not an active day -' : ''),
                            ((!isSameHour) ? ('- not same hour -') : ''),
                            ((!isSameMinute) ? '- not same minute -' : ''),
                            ((!isStartingDayPassed) ? '- start date is not reached -' : ''));
                    }
                    console.log('♠ Registration Hour : ' + Number(registration.registration_start_time.split(':')[0]) + ' Current : ' + Number(new Date().toLocaleString('en-US', { hour: 'numeric', hour12: false, timeZone: "America/Los_Angeles" }).substring(0, 2)))
                    console.log('♠ Registration Minute : ' + Number(registration.registration_start_time.split(':')[1].substring(0, 2)) + ' Current : ' + Number(String(new Date().getMinutes()).padStart(2, '0')))
                    console.log('♠ Registration Start Date : ' + startDate.toLocaleDateString("en-US", { timeZone: "America/Los_Angeles" })+  ' Current ' + new Date().toLocaleDateString("en-US", { timeZone: "America/Los_Angeles" }))
                    console.log('♠ Registration Start Time : ' + startTime.toLocaleTimeString('en-US', { timeZone: "America/Los_Angeles", hour: 'numeric', minute: 'numeric', hour12: false }) + '  ('+registration.registration_hours_until_cancel+' Hours)')
                    console.log('♠ Registration End Time : ' + endTime.toLocaleString("en-US", { timeZone: "America/Los_Angeles", hour: 'numeric', minute: 'numeric', hour12: false }) + ' Current : ' + new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles", hour: 'numeric', minute: 'numeric', hour12: false }))

                    console.log('♠ Registration Active Days : ' + registration.registration_active_days)

                    console.log('♠ Cancel Time Passed : ' + cancelTimePassed)



                    console.log(`
                    `)

                }

                //registrations that are registered and waiting for cancellation
                else if (registration.registration_state == 'registered') {
                    console.log(`
                    `)

                    console.log('---------- TRUE STATE, ID : ', registration.registration_id, '  --------------')

                    console.log('registration already done, id : ', registration.registration_id)
                    console.log('♠ Registration Start Time : ' + startTime.toLocaleTimeString('en-US', { timeZone: "America/Los_Angeles", hour: 'numeric', minute: 'numeric', hour12: false }))
                    console.log('♠ Registration End Time : ' + endTime.toLocaleString("en-US", { timeZone: "America/Los_Angeles", hour: 'numeric', minute: 'numeric', hour12: false }) + ' Current : ' + new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles", hour: 'numeric', minute: 'numeric', hour12: false }))

                    console.log('♠ Cancel Time Passed : ' + cancelTimePassed)


                    //check if endDate has passed or not
                    if (cancelTimePassed) {
                        console.log('registration is eligible for cancellation, id : ', registration.registration_id);
                        // return ;
                        CancelRegistration(
                            registration.registration_id,
                            registration.registration_licence_plate,
                            registration.registration_apartment_number,
                            registration.registration_passcode,
                            registration.registration_start_date,
                            registration.registration_start_time,
                            registration.registration_parking_duration,
                            registration.registration_contact_email,
                            registration.registration_contact_phone)
                    }

                    console.log(`
                    `)

                }

            })
        }

    } catch (err) {
        console.log(err.message)
    }
}

//FetchRegistrations()

 const task = cron.schedule('* */5 * * * *', async () => {
     await FetchRegistrations();
     event.emit('JOB COMPLETED');
 }, {
     timezone: "America/Los_Angeles"
 });

event.on('JOB COMPLETED', () => {

    console.log('Job done!');
    task.stop();
    setTimeout(() => { task.start() }, 200000);
});

app.listen(8080, () => {
    console.log('listening on port 8080')
})




// app.post("/api/send-data", (req, res) => {
//     console.log('data recieved')
//     try {

//         const {
//             licencePlate,
//             apartmentNumber,
//             passcode,
//             startDate,
//             startTime,
//             parkingDuration,
//             contactEmail,
//             contactPhone
//         } = req.body

//         console.log(req.body)

//         // RegisterVehicle(
//         //     licencePlate,
//         //     apartmentNumber,
//         //     passcode,
//         //     startDate,
//         //     startTime,
//         //     parkingDuration,
//         //     contactEmail,
//         //     contactPhone);

//     } catch (err) {
//         console.error(err.message)

//     }
// })