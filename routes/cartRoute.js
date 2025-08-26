import e from "express";
import authUser from "../middleware/authUser.js";
import { updateCArt } from "../controllers/cartController.js";
const cartRouter = e.Router()

cartRouter.post("/update",authUser,updateCArt)

export default cartRouter