exports.codeMailer = function (email, name, course_n, course_i, code) {
  require('dotenv').config();
  const { google } = require("googleapis");
  var nodemailer = require('nodemailer')
  const OAuth2 = google.auth.OAuth2;

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
    to: email,
    subject: 'Course ' + course_n + " added",
    text: "Hello, " + name + "\n\n" +
      "Your course " + course_i + ": " + course_n + ", is added successfully please share the following code with your students to eroll with: " + code +
      "\n\n" + "Regards," + "\n" + "AMS Fugus Team"
  }
  transporter.sendMail(mailOptions, function (error, info) {
    if (error)
      console.log(error);
  })

}