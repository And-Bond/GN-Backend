import Services from '@Services'
const ObjectId = require('mongoose').Types.ObjectId


export default {
    getContactById: async(req) => {
        const { _id } = req.params
        const contact = await Services.ContactService.getById(_id)
        if(!contact){
            throw {
                statusCode: 404,
                message: 'Contact not found!'
            }
        }

        return { contact: contact }
    },
    getContacts: async(req) => {
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

    
            const contacts = await Services.ContactService.aggregate(criteriaAll)
            return { contacts: contacts }
        } catch(err) {
            console.log(err)
            throw err
        }
    },
    createContact: async(req) => {
        try{
            const payload = req.payload
            const contact = await Services.ContactService.create(payload)
            return { contact: contact }
        } catch(err) {
            console.log(err)
            throw err
        }
    },
    updateContact: async(req) => {
        const { _id } = req.params
        const contact = await Services.ContactService.getById(_id)
        if(!contact){
            throw {
                statusCode: 404,
                message: 'Contact not found!'
            }
        }

        const payload = req.payload
        const updatedContact = await Services.ContactService.updateOne({ _id: new ObjectId(_id) }, payload)
        return { contact: updatedContact }
    },
    deleteContact: async(req) => {
        try{
            const { _id } = req.params
            const contact = await Services.ContactService.getById(_id)
            if(!contact){
                throw {
                    statusCode: 404,
                    message: 'Contact not found!'
                }
            }
    
            await Services.ContactService.deleteOne({ _id: new ObjectId(_id) })
            return { deleted: true }
        } catch(err) {
            console.log(err)
            throw err
        }
    }
}