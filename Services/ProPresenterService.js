
const dotenv = require('dotenv')
const axios = require('axios')
dotenv.config()


const path = 'http://192.168.1.172:3005/v1/'

const api = axios.create({
    baseURL: path,
});

const slideNext = async () => api.get('trigger/next');

const slidePrev = async () => api.get('trigger/previous');

const mediaNext = async () => api.get('trigger/media/previous');

const mediaPrev = async () => api.get('trigger/media/previous');

const audioNext = async () => api.get('trigger/audio/previous');

const audioPrev = async () => api.get('trigger/audio/previous');

const getAllGroups = async () => api.get('groups');

const getActivePresentation = async () => api.get('presentation/active');

const trgSpecSlide = async (uuid, index) => api.get(`presentation/${uuid}/${index}/trigger`);

const createStageMessage = async (message) => api.put(`stage/message`, message.toString(), { headers: {'Accept': '*/*', 'Content-Type': 'application/json'} });

const hideStageMessage = async () => api.delete(`stage/message`)

module.exports = {
    slideNext,
    slidePrev,
    mediaNext,
    mediaPrev,
    audioNext,
    audioPrev,
    getAllGroups,
    getActivePresentation,
    trgSpecSlide,
    createStageMessage,
    hideStageMessage,
};