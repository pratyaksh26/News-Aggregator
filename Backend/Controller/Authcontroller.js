const userModel = require('../Models/Usermodel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


const registerCtrl = async (req, res) => {
    try {
        console.log('Register request received:', req.body);

        // Check if user already exists
        const existingUser = await userModel.findOne({ email: req.body.email });
        if (existingUser) {
            console.log('User already exists:', req.body.email);
            return res.status(200).send({ message: 'User already exists', success: false });
        }

        // Hash the password
        const password = req.body.password;
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        req.body.password = hashedPassword;


        // Create a new user
        const newUser = new userModel(req.body);
        await newUser.save();
        console.log('New user registered:', newUser);

        res.status(201).send({ message: 'Registered successfully', success: true });
    } catch (error) {
        console.error('Error in registerCtrl:', error);
        res.status(500).send({ success: false, error: error.message });
    }
};

const loginCtrl = async (req, res) => {
    try {
        console.log('Login request received:', req.body);

        // Find user without aggressive timeout
        const myuser = await userModel.findOne({ email: req.body.email });
        console.log('User found:', myuser ? 'Yes' : 'No');

        if (!myuser) {
            return res.status(200).send({ message: "User not found", success: false });
        }

        const ismatch = await bcrypt.compare(req.body.password, myuser.password);
        console.log('Password match:', ismatch);

        if (!ismatch) {
            return res.status(200).send({ message: "Password is incorrect", success: false });
        }

        const token = jwt.sign({ id: myuser._id }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '1d' });
        console.log('Token generated successfully');

        res.status(200).send({
            message: "Login successful",
            success: true,
            data: {
                id: myuser._id,
                name: myuser.name,
                email: myuser.email
            },
            token: token
        });

    } catch (error) {
        console.error('Error in loginCtrl:', error);
        res.status(500).send({ message: "Error in login", success: false, error: error.message });
    }
};

module.exports = { loginCtrl, registerCtrl };