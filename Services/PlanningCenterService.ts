
import axios from 'axios'
// Type imports
import type { Plan, Item, Team, People, PlanPerson, ServiceType } from 'types/planning-center.js'


type defaultResponse<MainType, Included = never> = Promise<{
    data: {
        data: MainType[]
    } & ([Included] extends [never] ? {} : { included: Included[] })
}>

type singleResponse<MainType, Included = never> = Promise<{
    data: {
        data: MainType
    } & ([Included] extends [never] ? {} : { included: Included[] })
}>

const { PLANNING_CENTER_CLIENT_ID, PLANNING_CENTER_SECRET_TOKEN } = process.env

if(!PLANNING_CENTER_CLIENT_ID || !PLANNING_CENTER_SECRET_TOKEN){
    console.error('IMPORTANT ENV IS MISSING: PLANNING_CENTER_CLIENT_ID OR PLANNING_CENTER_SECRET_TOKEN')
    process.exit(1)
}

const path = 'https://api.planningcenteronline.com/services/v2'
const auth = {
    username: PLANNING_CENTER_CLIENT_ID,
    password: PLANNING_CENTER_SECRET_TOKEN
}

if(!PLANNING_CENTER_CLIENT_ID || !PLANNING_CENTER_SECRET_TOKEN){
    console.warn('IMPORTANT PLANNING CENTER ENV IS MISSING! YOU WON\'T BE ABLE TO WORK WITH PC!')
}

const api = axios.create({
    baseURL: path,
    auth: auth
})

const peopleApi = axios.create({
    baseURL: 'https://api.planningcenteronline.com/people/v2',
    auth: auth
})

// https://developer.planning.center/docs/#/apps/services/2018-11-01/vertices/organization
const getOrganizationInfo = async () => api.get('/')

// https://developer.planning.center/docs/#/apps/services/2018-11-01/vertices/person
const getOrganizationPeople = async () => api.get('/people')

// https://developer.planning.center/docs/#/apps/services/2018-11-01/vertices/service_type
const getServiceTypes = async () => api.get('/service_types')

// https://developer.planning.center/docs/#/apps/services/2018-11-01/vertices/plan
const getPlansList = async (serviceTypeId: string, params?: any): defaultResponse<Plan> => api.get('/service_types/' + serviceTypeId + '/plans', {
    params: params
})

// https://developer.planning.center/docs/#/apps/services/2018-11-01/vertices/song
const getOrganizationSongs = async (params: any) => api.get('/songs', {
    params: params
})

// https://developer.planning.center/docs/#/apps/services/2018-11-01/vertices/team
const getOrganizationTeams = async (): defaultResponse<Team> => api.get('/teams?include=people')

// https://developer.planning.center/docs/#/apps/services/2018-11-01/vertices/series
const getSeries = async () => api.get('/series')

// https://developer.planning.center/docs/#/apps/services/2018-11-01/vertices/plan_time
const getPlanTimes = async (serviceTypeId: string) => api.get('/service_types/' + serviceTypeId + '/plan_times', {
    params: {
        order: 'sort_date',
        filter: 'future'
    }
})

// https://developer.planning.center/docs/#/apps/services/2018-11-01/vertices/item
const getPlanItems = async (serviceTypeId: string, planId: string): defaultResponse<Item> => api.get(`/service_types/${serviceTypeId}/plans/${planId}/items`)

// https://developer.planning.center/docs/#/apps/services/2018-11-01/vertices/arrangement
const getSongArrangmentInfo = async (songId: string, arrangmentId: string) => api.get(`/songs/${songId}/arrangements/${arrangmentId}`)

// https://developer.planning.center/docs/#/apps/services/2018-11-01/vertices/attachment
const getOrganizationAttachments = async () => api.get('/attachments')

const getPlanItemArrangments = async (serviceTypeId: string, planId: string, itemId: string) => api.get(`/service_types/${serviceTypeId}/plans/${planId}/items/${itemId}/arrangement`)

const getAttachmentsBySongArrangement = async (songId: string, arrangmentId: string) => api.get(`/songs/${songId}/arrangements/${arrangmentId}/attachments`)

const getAttachmentFileUrl = async (attachmentId: string) => api.post(`attachments/${attachmentId}/open`)

const getArrangementsBySong = async (songId: string) => api.get(`songs/${songId}/arrangements`)

const getPlanTeamMembers = async (serviceTypeId: string, planId: string): defaultResponse<PlanPerson> => api.get(`/service_types/${serviceTypeId}/plans/${planId}/team_members?include=team`)

const getPlan = async (serviceTypeId: string, planId: string): singleResponse<Plan, ServiceType> => api.get(`/service_types/${serviceTypeId}/plans/${planId}?include=service_type`)

// https://api.planningcenteronline.com/docs/apps/services/versions/2018-11-01/vertices/plan_person
const getPlanPeople = async (personId: string): defaultResponse<PlanPerson, Plan> => api.get(`/people/${personId}/plan_people?include=plan`)

const updatePlanPersonStatus = async (serviceTypeId: string, planId: string, planPersonId: string, status: 'C' | 'D', declineReason?: string) =>
    api.patch(`/service_types/${serviceTypeId}/plans/${planId}/team_members/${planPersonId}`, {
        data: {
            type: 'PlanPerson',
            id: planPersonId,
            attributes: {
                status,
                ...(declineReason ? { decline_reason: declineReason } : {})
            }
        }
    })

// Formats a raw phone number to PC's storage format: +380 96 463 8896
const formatPhoneForPC = (phone: string): string => {
    const digits = phone.replace(/\D/g, '')
    if (digits.length === 12 && digits.startsWith('380')) {
        return `+${digits.slice(0, 3)} ${digits.slice(3, 5)} ${digits.slice(5, 8)} ${digits.slice(8)}`
    }
    return `+${digits}`
}

// https://developer.planning.center/docs/#/apps/people/2023-03-21/vertices/phone_number
const searchPersonByPhone = async (phoneNumber: string) => peopleApi.get('/phone_numbers', {
    params: { 'where[number]': formatPhoneForPC(phoneNumber), include: 'person' }
})


export default {
    getOrganizationInfo,
    getOrganizationPeople,
    getServiceTypes,
    getPlansList,
    getOrganizationSongs,
    getOrganizationTeams,
    getSeries,
    getPlanTimes,
    getPlanItems,
    getSongArrangmentInfo,
    getOrganizationAttachments,
    getPlanItemArrangments,
    getAttachmentsBySongArrangement,
    getAttachmentFileUrl,
    getArrangementsBySong,
    getPlanPeople,
    getPlanTeamMembers,
    getPlan,
    searchPersonByPhone,
    updatePlanPersonStatus
}