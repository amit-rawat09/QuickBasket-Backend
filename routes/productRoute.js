import express from 'express'
import { upload } from '../config/multer.js'
import { addProduct, changeStock, productById, productList } from '../controllers/productController.js'
import authseller from '../middleware/authSeller.js'
const productRouter = express.Router()

productRouter.post("/add", upload.array(["images"]), authseller, addProduct)
productRouter.get("/list", productList)
productRouter.get("/id", productById)
productRouter.post("/stock", authseller, changeStock)

export default productRouter;