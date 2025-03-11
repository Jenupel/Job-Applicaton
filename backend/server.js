require("dotenv").config();
const express = require("express");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { exec } = require("child_process");
const fs = require("fs");
const cors = require("cors");
const nodemailer = require("nodemailer");
const moment = require("moment-timezone"); 

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer({ dest: "uploads/" });


cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});


const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.GMAIL_USER, 
        pass: process.env.GMAIL_PASS, 
    },
});


const sendEmail = (email, name) => {
    const mailOptions = {
        from: process.env.GMAIL_USER, 
        to: email,
        subject: "Your CV is Under Review", 
        text: `Hi ${name}, your CV is under review. Thank you for applying!`, 
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error("❌ Error sending email:", error);
        } else {
            console.log("✅ Email sent:", info.response);
        }
    });
};


const scheduleFollowUpEmail = (email, name, timeZone) => {
    const now = moment().tz(timeZone); 
    const followUpTime = now.add(1, "day").set({ hour: 10, minute: 0, second: 0 }); 

    const delay = followUpTime.diff(moment()); 

    setTimeout(() => {
        sendEmail(email, name);
    }, delay);
};

app.post("/upload", upload.single("file"), async (req, res) => {
    try {
        const { name, email, timeZone } = req.body;
        const result = await cloudinary.uploader.upload(req.file.path, {
            resource_type: "raw",
            use_filename: true,
            unique_filename: false,
            folder: "job_applications",
        });

        console.log("✅ File uploaded to Cloudinary:", result.secure_url);
        fs.unlinkSync(req.file.path); 

    
        exec(`python ../parser/parse_cv.py "${result.secure_url}"`, (error, stdout, stderr) => {
            if (error) {
                console.error("❌ Error executing Python script:", error);
                return res.status(500).json({ error: "CV Processing Failed" });
            }
            console.log("✅ Python Output:", stdout);

            
            scheduleFollowUpEmail(email, name, timeZone);

    
            res.json({
                success: true,
                message: "✅ CV Successfully Uploaded & Processed!",
                fileUrl: result.secure_url,
            });
        });

    } catch (error) {
        console.error("❌ Cloudinary Upload Error:", error);
        res.status(500).json({ success: false, error: "File upload failed" });
    }
});


app.listen(5000, () => console.log("🚀 Server running on port 5000"));