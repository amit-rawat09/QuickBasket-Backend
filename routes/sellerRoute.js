import express from 'express'
import { isAuth, logout, sellerLogin } from '../controllers/sellerController.js'
import authseller from '../middleware/authSeller.js'

const sellerRouter = express.Router()

sellerRouter.post("/login", sellerLogin)
sellerRouter.get("/is-auth", authseller, isAuth)
sellerRouter.get("/logout", logout)
 
export default sellerRouter;