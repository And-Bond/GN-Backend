
const dotenv = require('dotenv')
const axios = require('axios')
dotenv.config()

const { PLANNING_CENTER_CLIENT_ID, PLANNING_CENTER_SECRET_TOKEN } = process.env

const path = 'https://api.planningcenteronline.com/services/v2'
const auth = {
    username: PLANNING_CENTER_CLIENT_ID,
    password: PLANNING_CENTER_SECRET_TOKEN
}

const api = axios.create({
    baseURL: path,
    auth: auth
})

// https://developer.planning.center/docs/#/apps/services/2018-11-01/vertices/organization
const getOrganizationInfo = async () => api.get('/')

// https://developer.planning.center/docs/#/apps/services/2018-11-01/vertices/person
const getOrganizationPeople = async () => api.get('/people')

// https://developer.planning.center/docs/#/apps/services/2018-11-01/vertices/service_type
const getServiceTypes = async () => api.get('/service_types')

// https://developer.planning.center/docs/#/apps/services/2018-11-01/vertices/plan
const getPlansList = async (serviceTypeId, params) => api.get('/service_types/' + serviceTypeId + '/plans', {
    params: params
})

// https://developer.planning.center/docs/#/apps/services/2018-11-01/vertices/song
const getOrganizationSongs = async (params) => api.get('/songs', {
    params: params
})

// https://developer.planning.center/docs/#/apps/services/2018-11-01/vertices/team
const getOrganizationTeams = async () => api.get('/teams')

// https://developer.planning.center/docs/#/apps/services/2018-11-01/vertices/series
const getSeries = async () => api.get('/series')

// https://developer.planning.center/docs/#/apps/services/2018-11-01/vertices/plan_time
const getPlanTimes = async (serviceTypeId) => api.get('/service_types/' + serviceTypeId + '/plan_times', {
    params: {
        order: 'sort_date',
        filter: 'future'
    }
})

// https://developer.planning.center/docs/#/apps/services/2018-11-01/vertices/item
const getPlanItems = async (serviceTypeId, planId) => api.get(`/service_types/${serviceTypeId}/plans/${planId}/items`)

// https://developer.planning.center/docs/#/apps/services/2018-11-01/vertices/arrangement
const getSongArrangmentInfo = async (songId, arrangmentId) => api.get(`/songs/${songId}/arrangements/${arrangmentId}`)

// https://developer.planning.center/docs/#/apps/services/2018-11-01/vertices/attachment
const getOrganizationAttachments = async () => api.get('/attachments')

const getPlanItemArrangments = async (serviceTypeId, planId, itemId) => api.get(`/service_types/${serviceTypeId}/plans/${planId}/items/${itemId}/arrangement`)

const getAttachmentsBySongArrangement = async (songId, arrangmentId) => api.get(`/songs/${songId}/arrangements/${arrangmentId}/attachments`)

const getAttachmentFileUrl = async (attachmentId) => api.post(`attachments/${attachmentId}/open`)

const getArrangementsBySong = async (songId) => api.get(`songs/${songId}/arrangements`)

module.exports = {
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
    getPlanItemArrangments,
    getOrganizationAttachments,
    getAttachmentsBySongArrangement,
    getAttachmentFileUrl,
    getArrangementsBySong
}