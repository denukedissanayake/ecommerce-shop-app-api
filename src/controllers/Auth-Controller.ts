import bcrypt from 'bcrypt';
import { RequestHandler } from 'express';
const User = require('../Schema/User');
const Customer = require('../Schema/Customer');
const jwt = require('jsonwebtoken');

const signup : RequestHandler = async (req, res,) => {
    const existingCustomer = await Customer.findOne({ email: req.body.email });
    if (existingCustomer) {
        res.json({
            success: false,
            user: null,
            message: "User Already Exists"
        }).status(409)
    }
    if (!existingCustomer) {
        try {
            const hashedPassword = await bcrypt.hash(req.body.password, 10);

            const newCustomer = new Customer({
                firstname: req.body.firstname,
                lastname : req.body.lastname,
                username: req.body.username,
                password: hashedPassword,
                email: req.body.email,
            })

            const createdCustomer = await newCustomer.save();
            if (createdCustomer) {
                res.json({
                    success: true,
                    user: createdCustomer,
                    message: "User is successfully created"
                }).status(200);
            } else {
                res.json({
                    success: false,
                    user: null,
                    message : "Error while saving the user"
                }).status(500);
            }
        } catch (e) {
            res.json({
                success: false,
                user: null,
                message : "Error while creating the user"
            }).status(500);
        }
    }
}

const login : RequestHandler = async (req, res,) => {
    const existingCustomer = await Customer.findOne({ email: req.body.email });
    if (!existingCustomer) {
        res.json({
            success: false,
            user: null,
            message: "Check your email or Signup"
        }).status(409)
    }
    if (existingCustomer) {
        try {
            const isPasswordCorrect = await bcrypt.compare(req.body.password, existingCustomer.password);

            if (isPasswordCorrect) {

                const accesToken = jwt.sign({
                    id: existingCustomer.id,
                    firstname: existingCustomer.firstname,
                    lastname: existingCustomer.lastname,
                    username: existingCustomer.username,
                    email: existingCustomer.email,
                    photo: existingCustomer.photo || "",
                }, process.env.JWT, {
                    expiresIn : "1d"
                })

                res.json({
                    success: true,
                    user: {
                        id: existingCustomer.id,
                        firstname: existingCustomer.firstname,
                        lastname: existingCustomer.lastname,
                        username: existingCustomer.username,
                        email: existingCustomer.email,
                        photo: existingCustomer.photo || "",
                    },
                    accesToken,
                    message: "Login Successfulll"
                }).status(200);
            } else {
                res.json({
                    success: false,
                    user: null,
                    message: "Incorrect Password"
                }).status(200);
            }
        } catch (e) {
            res.json({
                success: false,
                user: null,
                message : "Error while Login"
            }).status(500);
        }
    }
}

const adminLogin : RequestHandler = async (req, res,) => {
    const existingUser = await User.findOne({ email: req.body.email });
    if (!existingUser) {
        res.json({
            success: false,
            message: "Check your Email or Signup"
        }).status(409)
    }
    if (existingUser) {
        try {
            const isPasswordCorrect = await bcrypt.compare(req.body.password, existingUser.password);

            if (isPasswordCorrect) {

                const accesToken = jwt.sign({
                    id: existingUser.id,
                    name: existingUser.name,
                    username: existingUser.username,
                    email: existingUser.email,
                    contactdetails: existingUser.contactdetails || "",
                    location: existingUser.location || "",
                    role: existingUser.role || "",
                    photo: existingUser.photo || "",
                }, process.env.JWT, {
                    expiresIn : "5d"
                })

                res.json({
                    success: true,
                    accesToken,
                    message: "Login Successfulll"
                }).status(200);
            } else {
                res.json({
                    success: false,
                    message: "Incorrect Password"
                }).status(200);
            }
        } catch (e) {
            res.json({
                success: false,
                message : "Error while Login"
            }).status(500);
        }
    }
}

const Logout: RequestHandler = (req, res) => {
    req.session = null
    req.cookies = null
    req.logout();
    res.redirect('http://localhost:3000/');
}

module.exports = {
    signup,
    login,
    Logout,
    adminLogin
}

// TO BE Used in Future Developments

// const SuccessLogin : RequestHandler = (req, res) => {
//     if (req.user) {
//         const accesToken = jwt.sign({
//             id: req.user['id'],
//             username: req.user['username'],
//             email: req.user['email'],
//             isAdmin : req.user['isAdmin']
//         }, process.env.JWT, {
//             expiresIn : "1d"
//         })

//         res.status(200).json({
//             success: true,
//             message: 'Authorized',
//             user: {
//                 id: req.user['id'],
//                 username: req.user['username'],
//             email: req.user['email'],
//             },
//             token : accesToken
//         }); 
//     }
// }

// const UnuccessLogin :RequestHandler = (req, res) => {
//     res.status(401).json({
//         success: false,
//         message: 'Not Authorized',
//         user: null
//     });
// }