import jwt from "jsonwebtoken"

// LOGIN SELLER : /api/seller/login
export const sellerLogin = async (req, res, next) => {
    const { email, password } = req.body

    try {
        if (email === process.env.SELLER_EMAIL && password === process.env.SELLER_PASSWORD) {
            const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '7d' })

            res.cookie("sellerToken", token, {
                httpOnly: true, // PREVENT JAVASCRIPT TO ACCESS COOKIE
                // secure: process.env.NODE_ENV === "production", // USE SECURE COOKIE IN PRODUCTION
                // sameSite: process.env.NODE_ENV === "production" ? 'none' : 'strict', // USE SECURE COOKIE IN PRODUCTION
                maxAge: 7 * 24 * 60 * 60 * 1000
            })

            return res.json({ success: true, message: "Logged in" })
        }
        else {
            return res.json({ success: false, message: "Invalid Details" })
        }
    } catch (error) {
        console.log(error.message);
        return res.json({ success: false, message: error.message })
    }
}

// CHECH SELLER AUTH : /api/seller/is-auth
export const isAuth = async (req, res) => {
    try {
        return res.json({ success: true })

    } catch (error) {
        console.log(error.message);
        return res.json({ success: false, message: error.message })
    }
}

// LOGOUT SELLER : /api/seller/logout
export const logout = async (req, res) => {
    try {
        res.clearCookie("sellerToken", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? 'none' : 'strict', 
        })
        return res.json({ success: true, message: "Logged out" })

    }  catch (error) {
        console.log(error.message);
        return res.json({ success: false, message: error.message })
    }
}

