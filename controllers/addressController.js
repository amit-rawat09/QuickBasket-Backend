import Address from "../models/Address.js"

// ADD ADDRESS : /api/address/add
export const addAddress = async (req, res) => {
    try {
        const { address, userId } = req.body
        await Address.create({ ...address, userId })
        res.json({ success: true, message: "Address added" })
    } catch (error) {
        console.log(error.message)
        res.json({ success: false, message: error.message })
    } 
}

// GET ADDRESS : /api/address/get
export const getAddress = async (req, res) => {
    try {
        const { userId } = req.query
        
        const addresses = await Address.find({ userId })
        res.json({ success: true, addresses })
    } catch (error) {
        console.log(error.message,
            "ds"
        )
        res.json({ success: false, message: error.message })
    }
}