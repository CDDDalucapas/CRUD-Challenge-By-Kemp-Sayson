const mysql = require("mysql");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const db = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE
});

exports.index = async (req, res) => {
    try {
        const {email, password} = req.body;

        if(!email || !password) {
            return res.status(400).render('index', {
                message: 'Please provide an email and password'
            })
        }

        db.query('SELECT * FROM users WHERE email = ?', [email], async (error, results) => {
            console.log(results);
            if(results.length<1 || !(await bcrypt.compare(password, results[0].password))){
                res.status(401).render('index', {
                    message:'Email or Password is incorrect'
                })
            } else {
                const id = results[0].id;
                
                const token = jwt.sign({ id:id}, process.env.JWT_SECRET, {
                    expiresIn: process.env.JWT_EXPIRES_IN
                });
                console.log("The token is: "+ token);

                const cookieOptions = {
                    expires: new Date(
                        Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000
                    ),
                    httpOnly: true
                }
                res.cookie('jwt', token, cookieOptions);
                res.status(200).redirect("/dashboard");
            }
        })

    } catch (error) {
        console.log(error);
    }
}

exports.register = (req, res) => {
    console.log(req.body);

    // const name = req.body.name;
    // const email = req.body.email;
    // const password = req.body.password;
    // const confirmpassword = req.body.confirmpassword;
    //  the code below is much faster and efficient

    const { name, email, password, confirmpassword } = req.body;

    db.query('SELECT email FROM users WHERE email = ?', [email], async (error, result) => {
        if(error){
            console.log(error);
        }
        if(result.length > 0 ){
            return res.render('register', {
                message: 'That email is already in use'
            })
        } else if( password !== confirmpassword){
            return res.render('register', {
                message: 'Password does not match!'
            })
        }

        let hashedpassword = await bcrypt.hash(password, 8);
        console.log(hashedpassword);
        
        db.query('INSERT INTO users SET ?', {name: name, email: email, password: hashedpassword }, (error, result) => {
            if(error){
                console.log(error);
            }   else{
                console.log(result);
                return res.render('register', {
                    message: 'User Registered!'
                })
            }
        })

    });
    // res.send("Form submitted");
}