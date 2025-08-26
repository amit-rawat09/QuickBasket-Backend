import cookieParser from "cookie-parser";
import express from "express"
import cors from 'cors'
import connectDB from "./config/db.js";
import "dotenv/config.js"
import { userRouter } from "./routes/userRoute.js";
import sellerRouter from "./routes/sellerRoute.js";
import connectCloudinary from "./config/cloudnary.js";
import productRouter from "./routes/productRoute.js";
import cartRouter from "./routes/cartRoute.js";
import addressRouter from "./routes/addressRoute.js";
import orderRouter from "./routes/orderRoute.js";
import { stripeWehost } from "./controllers/orderController.js";

const app = express()
const port = process.env.PORT || 4000;

// CONTECT DB
await connectDB()
 
// CONNECT CLOUDIMARY
await connectCloudinary()

// ALLOWED MULTIPLE ORIGNS
const allowedOrigins = ["http://localhost:5173","https://quickbasket-beta.vercel.app"]

app.post('/stripe',express.raw({type:"application/json"}),stripeWehost)

// MIDDLEWARE CONFIGURATION
app.use(express.json())
app.use(cookieParser())
app.use(cors({ origin: allowedOrigins, credentials: true }))

app.get("/", (req, res) => {
    res.send("hello")
})

// USER ROUTES
app.use('/api/user', userRouter)

// SELLER ROUTES
app.use('/api/seller', sellerRouter)

// PRODUCT ROUTES 
app.use('/api/product', productRouter)

// CART ROUTES 
app.use('/api/cart', cartRouter)

// ADDRESS ROUTES 
app.use('/api/address', addressRouter)    

// ORDER ROUTES 
app.use('/api/order', orderRouter)

app.listen(port, () => {
    console.log(`App is running on https://locahost:${port}`)

})
