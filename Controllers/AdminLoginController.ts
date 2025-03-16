import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import Services from '../Services/index.js'

export default {
    loginAdmin: async (req) => {
        const { email, password } = req.payload
        const contact = await Services.ContactService.getOne({ email: email })

        if(!contact){
            throw 'No contact with such email found!'
        }

        const isPasswordValid = await bcrypt.compare(password, contact.auth.password)
        if(!isPasswordValid){
            throw 'Invalid password'
        }

        const token = jwt.sign({ _id: contact._id, createdAt: Date.now() }, process.env.JWT_SECRET)
        await Services.AuthTokenService.create({ contactId: contact._id, accessToken: token })

        return { contact: contact, accessToken: token }
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

        // @ts-ignore
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