import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import Services from '../Services/index.js'
// Type imports
import type Hapi from '@hapi/hapi'
import mongoose from 'mongoose'
import type { loginAdminRequest } from 'Routes/AdminLoginRoute.js'
import type { IAuthTokenModel } from 'Models/AuthTokenModel.js'
const ObjectId = mongoose.Types.ObjectId

const { JWT_SECRET } = process.env
if(!JWT_SECRET){
    console.log('IMPORTANT ENV IS MISSING: JWT_SECRET')
    process.exit(1)
}

export default {
    loginAdmin: async (req: Hapi.Request & loginAdminRequest ) => {
        const { email, password } = req.payload
        const contact = await Services.ContactService.getOne({ email: email })

        if(!contact){
            throw 'No contact with such email found!'
        }

        if(!contact.auth?.email){
            throw 'Contact has no auth!'
        }

        const isPasswordValid = await bcrypt.compare(password, contact.auth.password)
        if(!isPasswordValid){
            throw 'Invalid password'
        }

        const token = jwt.sign({ _id: contact._id, createdAt: Date.now() }, JWT_SECRET)
        await Services.AuthTokenService.create({ contactId: contact._id, accessToken: token })

        return { contact: contact, accessToken: token }
    },
    loginAdminViaAccessToken: async(req: Hapi.Request) => {
        const { token } = req.auth.credentials
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
    logoutAdmin: async(req: Hapi.Request) => {
        const { token } = req.auth.credentials
        await Services.AuthTokenService.deleteOne({ accessToken: token })
        return { message: 'Successfully logged out' }
    }
}