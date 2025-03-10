const Services = require('../Services')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { UnFx } = require('../Other/constants')
const { ContactModel } = require('../Models')

module.exports = {
    loginAdmin: async (req) => {
        const { email, password } = req.payload
        const contact = await Services.ContactService.getOne({ email: email })

        if(!contact){
            throw 'No contact with such email found!'
        }

        const isPasswordValid = await bcrypt.compare(password, contact.password)
        if(!isPasswordValid){
            throw 'Invalid password'
        }

        const token = jwt.sign({ _id: admin._id, createdAt: Date.now() }, process.env.JWT_SECRET)
        await Services.AuthTokenService.create({ adminId: admin._id, accessToken: token })

        return { admin: admin, accessToken: token }
    },
    loginAdminViaAccessToken: async(req) => {
        const { token } = req.auth
        const tokenExists = await Services.AuthTokenService.getOne({ accessToken: token })
        if(!tokenExists){
            throw {
                statusCode: 401,
                messsage: 'No token with such access token found!'
            }
        }

        const { _id } = jwt.verify(token, process.env.JWT_SECRET)
        const contact = await Services.ContactService.getById(_id)
        if(!contact){
            throw {
                statusCode: 401,
                message: 'No contact with such id found!'
            }
        }
        return { contact: contact, accessToken: token }
    },
    logoutAdmin: async(req) => {
        const accessToken = req.auth.token
        await Services.AuthTokenService.deleteOne({ accessToken: accessToken })
        return { message: 'Successfully logged out' }
    }
}