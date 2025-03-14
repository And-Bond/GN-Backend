
import Services from '@Services'
import mongoose from 'mongoose'
const ObjectId = mongoose.Types.ObjectId

export default {
    getAccountById: async(req) => {
        const { _id } = req.params
        const account = await Services.AccountService.getById(_id)
        if(!account){
            throw {
                statusCode: 404,
                message: 'Account not found!'
            }
        }

        return { account: account }
    },
    getAccounts: async(req) => {
        try{
            const query = { ...req.query }
            const populate = req?.query?.populate || []

            const criteriaAll = []
    
            // if (query.name) criteriaAll.push({ $match: { fullName: { $regex: query.name, $options: 'i' } } });

            // if (query.email) criteriaAll.push({ $match: { email: { $regex: query.email, $options: 'i' } } });

            // if (query.phone) criteriaAll.push({ $match: { phone: { $regex: query.phone, $options: 'i' } } });

            // if (query.city) criteriaAll.push({ $match: { city: { $regex: query.city, $options: 'i' } } });

            // if (query.church) criteriaAll.push({ $match: { church: { $regex: query.church, $options: 'i' } } });
            
            // if (query.eatDays) {
            //     if (query.eatDays.includes('Fr')) criteriaAll.push({ $match: { 'eatDays.Fr': true } });
            //     if (query.eatDays.includes('Sa')) criteriaAll.push({ $match: { 'eatDays.Sa': true } });
            // }
            
            // if (query.hasOwnProperty('arrived')) criteriaAll.push({ $match: { arrived: query.arrived } });

    
            const accounts = await Services.AccountService.aggregate(criteriaAll)
            return { accounts: accounts }
        } catch(err) {
            console.log(err)
            throw err
        }
    },
    createAccount: async(req) => {
        try{
            const payload = req.payload
            const account = await Services.AccountService.create(payload)
            return { account: account }
        } catch(err) {
            console.log(err)
            throw err
        }
    },
    updateAccount: async(req) => {
        const { _id } = req.params
        const account = await Services.AccountService.getById(_id)
        if(!account){
            throw {
                statusCode: 404,
                message: 'Account not found!'
            }
        }

        const payload = req.payload
        const updatedAccount = await Services.AccountService.updateOne({ _id: new ObjectId(_id) }, payload)
        return { account: updatedAccount }
    },
    deleteAccount: async(req) => {
        try{
            const { _id } = req.params
            const account = await Services.AccountService.getById(_id)
            if(!account){
                throw {
                    statusCode: 404,
                    message: 'Account not found!'
                }
            }
    
            await Services.AccountService.deleteOne({ _id: new ObjectId(_id) })
            return { deleted: true }
        } catch(err) {
            console.log(err)
            throw err
        }
    }
}