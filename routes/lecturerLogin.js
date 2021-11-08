require('dotenv').config();
const { google } = require("googleapis");

const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");
const OAuth2 = google.auth.OAuth2;
var crypto = require('crypto');
const Lecturer = require('../models/lecturer_model');
const Token = require('../models/tokenModel.js');
const ForgetPasswordToken = require('../models/changePasswordToken.js');
var md5 = require('md5');
var validator = require('email-validator');



function createTokenAndSendEmail(lecturerEmail, lecturerPassword, lecturerId, lecturerName, ip,res) {

    const token = crypto.randomBytes(16).toString('hex');
    console.log(token);

    const newToken = new Token({

        token: token,
        email: lecturerEmail,
        password: lecturerPassword,
        name: lecturerName,
        lecturerId: lecturerId,
    });

    newToken.save(function (err) {

        if (err) {
            console.log(err);
            res.status(500).json({
                err: true,
                msg: "OOPS! Some Error occurred.Please try again"
            });
        } else {
            const oauth2Client = new OAuth2(
                process.env.CLIENT_ID,
                process.env.CLIENT_SECRET,
                "https://developers.google.com/oauthplayground"
            );
            
            oauth2Client.setCredentials({
                refresh_token: process.env.REFRESH_TOKEN
            });
            const accessToken = new Promise((resolve, reject) => {
                oauth2Client.getAccessToken((err, token) => {
                  if (err) {
                    reject("Failed to create access token :(");
                  }
                  resolve(token);
                });
              });

            var transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    type: "OAuth2",
                    user: process.env.EMAIL,
                    accessToken,
                    clientId: process.env.CLIENT_ID,
                    clientSecret: process.env.CLIENT_SECRET,
                    refreshToken: process.env.REFRESH_TOKEN
                },
                tls: {
                    rejectUnauthorized: false,
                    ciphers: "SSLv3"
                }
            });

            var mailOptions = {
                from: process.env.EMAIL,
                to: lecturerEmail,
                subject: 'verify your account for ams',
                text: 'To verify your account click the following link : http://' + ip+ '/lecturer/verify/' + token,
            };

            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    console.log(error);
                    res.status(500).json({
                        err: true,
                        msg: "OOPS! Some Error occurred.Please try again"
                    });
                } else {
                    console.log('Email sent');
                    res.status(200).json({
                        err: false,
                        msg: 'verification email sent'
                    });
                }
            });
        }

    });


}

function validateEmailAndPassword(email, password) {
    if (password.length >= 8 && validator.validate(email))
        return true;
    else
        return false;
}



router.get("/verify/:token", (req, res) => {

    console.log(req.params);

    Token.findOne({
        token: req.params.token
    }, (err, foundToken) => {

        if (err)
            res.status(500).send({
                err: true,
                msg: 'We were unable to find a valid token. Your token may have expired.'
            });
        else {
            if (foundToken) {
                const newLecturer = new Lecturer({

                    email: foundToken.email,
                    name: foundToken.name,
                    password: md5(foundToken.password),
                    lecturerId: foundToken.lecturerId,
                });

                newLecturer.save(function (err) {

                    if (err) {
                        console.log(err);
                        res.status(500).json({
                            err: true,
                            msg: "OOPS! Some Error occurred.Please try again later"
                        });
                    } else {
                        Token.deleteOne({
                            token: req.params.token
                        }, function (err, result) {

                            if (err) {
                                res.status(500).json({
                                    err: true,
                                    msg: "OOPS! Some Error occurred.Please try again later"
                                });
                            } else
                                res.status(200).send('successfully verified email');
                        })
                    }


                });




            } else
                res.status(500).send({
                    err: true,
                    msg: 'We were unable to find a valid token. Your token may have expired or your account is already verified'
                });
        }


    });


});

router.post("/login", function (req, res) {

    Lecturer.findOne({
        email: req.body.email
    }, function (err, foundLecturer) {

        if (err) {
            res.status(500).json({
                err: true,
                msg: "OOPS! Some Error occurred.Please try again"
            });
        } else {
            if (foundLecturer) {
                if (foundLecturer.password == md5(req.body.password))
                    res.status(200).json({
                        err: false,
                        msg: foundLecturer._id
                    });
                else {
                    res.status(400).json({
                        err: true,
                        msg: "Invalid password"
                    });
                }
            } else {
                res.status(400).json({
                    err: true,
                    msg: 'We were unable to find a user for this email.First register yourself to AMS or verify your email'
                });
            }
        }
    });
});

router.post("/register", (req, res) => {

    console.log(req.body);
    console.log(Lecturer);

    if (validateEmailAndPassword(req.body.email, req.body.password)) {
        Lecturer.findOne({
            email: req.body.email
        }, (err, foundLecturer) => {

            if (err) {
                console.log(err);
                res.status(500).json({
                    err: true,
                    msg: "OOPS! Some Error occurred.Please try again later"
                });
            } else {
                if (foundLecturer) {

                    res.status(400).json({
                        err: true,
                        msg: 'The email address you have entered is already associated with another account.'
                    });

                } else {

                    var email = req.body.email;
                    var lecturerId = email.slice(0, email.indexOf('@'));
                    console.log(lecturerId);
                    createTokenAndSendEmail(req.body.email, req.body.password, lecturerId, req.body.name, req.body.ip,res);
                }
            }
        });
    } else
        res.status(400).json({
            err: true,
            msg: "Invalid email or password. Email should be of email@email.com domain and length of password must be atleast 8"
        });


});

router.post("/resetPassword", (req, res) => {

    Lecturer.findOne({
        email: req.body.email
    }, function (err, foundLecturer) {

        if (err) {
            res.status(500).json({
                err: true,
                msg: "OOPS! Some Error occurred.Please try again"
            });
        } else {
            if (foundLecturer) {
                const tokenNum = crypto.randomBytes(16).toString('hex');
                console.log(tokenNum);
                const forgetPasswordToken = new ForgetPasswordToken({
                    token: tokenNum,
                    email: req.body.email,
                    password: md5(req.body.password),

                });
                forgetPasswordToken.save(function (err) {
                    if (err) {
                        console.log(err);
                        res.status(500).json({
                            err: true,
                            msg: "OOPS! Some Error occurred.Please try again"
                        });
                    } else {
                        var transporter = nodemailer.createTransport({
                            host: 'smtp.gmail.com',
                            port: 465,
                            secure: true,
                            service: 'gmail',
                            auth: {
                                user: 'amsfugus@gmail.com',
                                pass: '!@#$1234QWERqwer',
                            },
                            tls: {
                                rejectUnauthorized: false,
                                ciphers: "SSLv3"
                            }
                        });

                        var mailOptions = {
                            from: 'amsfugus@gmail.com',
                            to: req.body.email,
                            subject: 'verify your account for ams',
                            text: 'To verify your account click the following link : http://' + req.body.ip + '/lecturer/verifyResetPasswordRequest/' + tokenNum,
                        };

                        transporter.sendMail(mailOptions, function (error, info) {
                            if (error) {
                                console.log(error);
                                res.status(500).json({
                                    err: true,
                                    msg: "OOPS! Some Error occurred.Please try again"
                                });
                            } else {
                                console.log('Email sent');
                                res.status(200).json({
                                    err: false,
                                    msg: 'verification email sent'
                                });
                            }
                        });
                    }
                })
                res.status(200).json({
                    err: false,
                    msg: "verification email sent"
                });


            } else {
                res.status(400).json({
                    err: true,
                    msg: 'We were unable to find a user for this email.First register yourself to AMS or verify your email'
                });
            }
        }
    });

});

router.get("/verifyResetPasswordRequest/:token", (req, res) => {
    console.log(req.params);

    ForgetPasswordToken.findOne({
        token: req.params.token
    }, (err, foundToken) => {

        console.log(foundToken);
        if (err)
            res.status(500).send({
                err: true,
                msg: 'We were unable to find a valid token. Your token may have expired.'
            });
        else {
            console.log(foundToken);
            if (foundToken) {
                Lecturer.findOne({
                    email: foundToken.email
                }, (err, foundLecturer) => {

                    if (err) {
                        res.status(500).send({
                            err: true,
                            msg: "OOPS! Some error occured"
                        });
                    } else {
                        foundLecturer.password = foundToken.password;
                        foundLecturer.save(function (err) {
                            if (err)
                                res.status(500).send({
                                    err: true,
                                    msg: "OOPS! Some error occured"
                                });
                            else
                                res.status(200).send({
                                    err: false,
                                    msg: "Successfully changed password"
                                });


                        })
                    }
                });

            } else
                res.status(500).send({
                    err: true,
                    msg: 'We were unable to find a valid token. Your token may have expired or your account is already verified'
                });
        }


    });
})



module.exports = router;