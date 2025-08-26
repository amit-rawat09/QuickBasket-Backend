import e from "express";
import authUser from "../middleware/authUser.js";
import { getAllOrder, getUserOrders, placeORderCOD, placeORderStripe } from "../controllers/orderController.js";
import authseller from "../middleware/authSeller.js";
const orderRouter = e.Router()

orderRouter.post("/cod",authUser,placeORderCOD)
orderRouter.post("/stripe",authUser,placeORderStripe)
orderRouter.get("/user",authUser,getUserOrders)
orderRouter.get("/seller",authseller,getAllOrder)

export default orderRouter  