import Order from "../models/Order.js"
import Product from "../models/Product.js"
import User from "../models/User.js"
import stripe from 'stripe'

// PLACE ORDER COD :/api/order/cod
export const placeORderCOD = async (req, res) => {
    try {
        const { userId, items, address } = req.body

        if (!address || items.length === 0) {
            return res.json({ success: false, message: "Invalid data" })
        }

        // CALCULATE AMOUNT USEING ITEMS
        let amount = await items.reduce(async (acc, item) => {
            const product = await Product.findById(item.product);
            return (await acc) + product.offerPrice * item.quantity
        }, 0)

        // ADD TAX CHARGE
        amount += Math.floor(amount * 0.05)
        const add = await Order.create({
            userId,
            items,
            address,
            amount,
            paymentType: "COD"
        })

        return res.json({ success: true, message: "order placed" })
    } catch (error) {
        console.log(error.message)
        res.json({ success: false, message: error.message })
    }
}

// PLACE ORDER STRPE :/api/order/stripe
export const placeORderStripe = async (req, res) => {
    try {
        const { userId, items, address } = req.body
        const { origin } = req.headers

        if (!address || items.length === 0) {
            return res.json({ success: false, message: "Invalid data" })
        }

        let productData = []

        // CALCULATE AMOUNT USEING ITEMS
        let amount = await items.reduce(async (acc, item) => {
            const product = await Product.findById(item.product);
            productData.push({
                name: product.name,
                price: product.offerPrice,
                quantity: item.quantity
            })
            return (await acc) + product.offerPrice * item.quantity
        }, 0)

        // ADD TAX CHARGE
        amount += Math.floor(amount * 0.05)
        const order = await Order.create({
            userId,
            items,
            address,
            amount,
            paymentType: "online"
        });

        // Stripe Gateway intialize
        const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY)

        // create line item for stripe

        const line_items = productData.map((item) => {
            return {
                price_data: {
                    currency: "inr",
                    product_data: {
                        name: item.name,
                    },
                    unit_amount: Math.floor(item.price + item.price * 0.04) * 100
                },
                quantity: item.quantity
            }
        })

        // create session
        const session = await stripeInstance.checkout.sessions.create({
            line_items,
            mode: "payment",
            success_url: `${origin}/loader?next=my-orders`,
            cancel_url: `${origin}/cart`,
            metadata: {
                orderId: order._id.toString(),
                userId,
            }
        })

        return res.json({ success: true, url: session.url })
    } catch (error) {
        console.log(error.message)
        res.json({ success: false, message: error.message })
    }
}

// Stripe webhost to verify payment 
export const stripeWehost = async (req, res) => {
    const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY)

    const sig = req.headers["stripe-signature"]
    let event;

    try {
        event = stripeInstance.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOST_SECRET,

        )
    } catch (error) {
        res.status(400).send("Webhook Error : " + error.message)
    }

    // handle the event 
    switch (event.type) {
        case "payment_intent.succeeded": {
            const payment_intent = event.data.object;
            const paymentintentid = payment_intent.id;

            const session = await stripeInstance.checkout.sessions.list({
                payment_intent: paymentintentid,
            })
            const { orderId, userId } = session.data[0].metadata

            // Mark payment as paid
            await Order.findByIdAndUpdate(orderId, { isPaid: true })
            // clear user cart
            await User.findByIdAndUpdate(userId, { cartItems: {} })
            break;
        }
        case "payment_intent.payment_failed": {
            const payment_intent = event.data.object;
            const paymentintentid = payment_intent.id;

            const session = await stripeInstance.checkout.sessions.list({
                payment_intent: paymentintentid,
            })
            const { orderId } = session.data[0].metadata

            await Order.findByIdAndDelete(orderId)
            break;
        }


        default:
            console.error(`Unhandle event type ${event.type}`);
            break;
    }
    res.json({recived:true})

}

// GET ORDER BY USER ID : /api/order/user
export const getUserOrders = async (req, res) => {
    try {
        const { userId } = req.query;

        const orders = await Order.find(
            {
                userId,
                $or: [{ paymentType: "COD" }, { isPaid: true }]
            }
        ).populate("items.product address").sort({ createdAt: -1 })
        return res.json({ success: true, orders })
    } catch (error) {
        console.log(error.message)
        res.json({ success: false, message: error.message })
    }
}


// GET AL ORDER (for seller/admin) : /api/order/seller 
export const getAllOrder = async (req, res) => {
    try {
        const orders = await Order.find({
            $or: [{ paymentType: "COD" }, { isPaid: true }]
        }).populate("items.product address").sort({ createdAt: -1 })
        return res.json({ success: true, orders })
    } catch (error) {
        console.log(error.message)
        res.json({ success: false, message: error.message })
    }
}
