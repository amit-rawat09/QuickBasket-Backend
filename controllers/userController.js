import User from "../models/User.js";
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

// REGISTER USER : /api/user/register
export const register = async (req, res) => {
    try {

        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.json({ success: false, message: "Missing Details" })
        }

        const existingUser = await User.findOne({ email })
        if (existingUser) {
            return res.json({ success: false, message: "User Already exist" })
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        const user = await User.create({ name, email, password: hashedPassword })

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' })

        res.cookie("token", token, {
            httpOnly: true, // PREVENT JAVASCRIPT TO ACCESS COOKIE
            secure: process.env.NODE_ENV === "production", // USE SECURE COOKIE IN PRODUCTION
            sameSite: process.env.NODE_ENV === "production" ? 'none' : 'strict', // USE SECURE COOKIE IN PRODUCTION
            maxAge: 7 * 24 * 60 * 60 * 1000
        })

        return res.json({ success: true, user: { email: user.email, name: user.name } })

    } catch (error) {
        console.log(error.message);
        return res.json({ success: false, message: error.message })
    }
}

// LOGIN USER : /api/user/login
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.json({ success: false, message: "Email and Password are required" })
        }

        const user = await User.findOne({ email })
        if (!user) {
            return res.json({ success: false, message: "Invalid email or password" })
        }

        const isMatch = await bcrypt.compare(password, user.password)

        if (!isMatch) {
            return res.json({ success: false, message: "Invalid email or password" })
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' })

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? 'none' : 'strict', // USE SECURE COOKIE IN PRODUCTION
            maxAge: 7 * 24 * 60 * 60 * 1000
        })

        return res.json({ success: true, user: { email: user.email, name: user.name } })
    } catch (error) {
        console.log(error.message);
        return res.json({ success: false, message: error.message })
    }
}

// CHECH AUTH : /api/user/is-auth
export const isAuth = async (req, res) => {
    try {
        // const { userId } = req.body
        // console.log(userId);

        const user = await User.findById(req.userId).select("-password")
        return res.json({ success: true,user })

    } catch (error) {
        console.log(error.message);
        return res.json({ success: false, message: error.message })
    }
}

// LOGOUT USER : /api/user/logout
export const logout = async (req, res) => {
    try {
        res.clearCookie("token", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? 'none' : 'strict',
        })
        return res.json({ success: true, message: "Logged out" })

    } catch (error) {
        console.log(error.message);
        return res.json({ success: false, message: error.message })
    }
}