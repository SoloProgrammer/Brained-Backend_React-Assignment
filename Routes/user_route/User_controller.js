const express = require('express');

const router = express.Router();

const fetchuser = require('../../middleware/fetchuser');

const User = require('../../models/User');

const fs = require('fs');

const bcrypt = require('bcryptjs');

const jwt = require('jsonwebtoken');

const upload = require('../../middleware/multer_avatar_upload');

// Route to create a new user.......................................................................

router.post('/create_user', async (req, res) => {

    const data = { ...req.body };

    const { fname, email, password } = data

    if (Object.keys(data).length == 0) return res.status(400).json({ success: false, "message": "All fields are manditory !" });

    if (!fname) return res.status(400).json({ success: false, "message": "fullname is manditory!!" });
    if (!email) return res.status(400).json({ success: false, "message": "email is manditory!!" });
    if (!password) return res.status(400).json({ success: false, "message": "password is manditory!!" });


    let user = await User.findOne({ "email": email });

    let username = await User.findOne({"fname":fname})

    console.log(username,fname)

    let success = false

    if (user) return res.status(400).json({ success: false, "message": "This email is already in use!" })

    if (username) return res.status(400).json({ success: false, "message": "This username is not available!" })

    try {
        const salt = await bcrypt.genSalt();
        const hashed_pass = await bcrypt.hash(password, salt)

        user = await new User({ ...req.body, password: hashed_pass }).save()

        if(user) res.json({success:true, message: "Account created successfully" })

    } catch (error) {
        res.json({ success, "message": error.message })
    }

})

// Route to Authneticate user.......................................................................

router.post('/auth_user', async (req, res) => {

    try {
        const data = { ...req.body }

        const { email, password } = data;

        let success = false

        if (Object.keys(data).length == 0) return res.status(400).json({ success: false, "errormsg": "All fields are manditory !" });

        if (!email) return res.status(400).json({ success, "errormsg": "Email is manditory!!" });
        if (!password) return res.status(400).json({ success, "errormsg": "Password is manditory!!" });
        
        const user = await User.findOne({ "email": email });
    
        if (!user) return res.status(400).json({ success, "errormsg": "User not found need to Sign-up first !" });
        
        const comapare_pass = await bcrypt.compare(password, user.password)
        
        if (!comapare_pass) return res.json({ success, "errormsg": "Invalid Credentails !" })
        

        const payload = {
            user: {
                id: user._id
            }
        }

        const authToken = jwt.sign(payload, process.env.jwt_secret);

        res.json({ success: true, authToken, message: "Login Sucessfull " })

    } catch (error) {
        console.log(error.message)
        res.json({ success: false,errormsg: error.message })
    }
})


// Route to get all details of logged in user.......................................................

router.get('/getuser', fetchuser, async (req, res) => {

    try {
        const user = await User.findById(req.user.id).select('-password');
        res.status(200).json({ success: true, user });
    } catch (error) {
        res.status(505).json({ success, message: "Internal server Error" })
    }

})

// Route to Update Profile details of logged in user................................................

router.put('/updateProfile/:current_avatar', upload.single('avatar'), fetchuser, async (req, res) => {

    let success = false

    try {
    
        if (Object.keys(req.body).length === 0 && !req.file) return res.status(400).json({ success, message: "Data is required to Update Profile" });

        if (req.file) {

            const DIR = "Upload_avatar";
            
            if(req.params.current_avatar !== "new_avatar") fs.unlinkSync(DIR + "/" + req.params.current_avatar);

            await User.findByIdAndUpdate(req.user.id, { $set: { ...req.body, avatar: req.file.filename } });
            success = true

        }
        else {
            await User.findByIdAndUpdate(req.user.id, { $set: { ...req.body } });
            success = true
        }

        if (success) res.status(200).json({ success, message: "Profile Updated Successfully" });

    } catch (error) {
        res.status(505).json({ success, message: "Internal server Error",error:error.message });
    }
})

// Route to Remove avatar of user request...........................................................

router.put('/removeAvatar/:current_avatar', fetchuser, async (req, res) => {

    try {

        const DIR = "Upload_avatar";

        fs.unlinkSync(DIR + "/" + req.params.current_avatar);

        await User.findByIdAndUpdate(req.user.id, { $set: { avatar: "" } });

        res.status(200).json({ success: true, message: "Avatar Removed Sucessfully" });

    }
    catch (error) {

        res.status(505).json({ success: false, message: "Internal server Error", error: error.message });

    }

})



module.exports = router