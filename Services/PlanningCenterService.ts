
import axios from 'axios'

type Plan = {
    type: "Plan";
    id: string;
    attributes: {
      can_view_order?: boolean;
      prefers_order_view?: boolean;
      rehearsable?: boolean;
      items_count?: number;
      permissions?: string;
      created_at?: string;
      title?: string;
      updated_at?: string;
      public?: boolean;
      series_title?: string;
      plan_notes_count?: number;
      other_time_count?: number;
      rehearsal_time_count?: number;
      service_time_count?: number;
      plan_people_count?: number;
      needed_positions_count?: number;
      total_length?: number;
      multi_day?: boolean;
      files_expire_at?: string;
      sort_date?: string;
      last_time_at?: string;
      dates?: string;
      short_dates?: string;
      planning_center_url?: string;
      reminders_disabled?: boolean;
    };
    relationships?: {
      service_type?: { data?: { type: "ServiceType"; id: string } };
      previous_plan?: { data?: { type: "Plan"; id: string } };
      next_plan?: { data?: { type: "Plan"; id: string } };
      series?: { data?: { type: "Series"; id: string } };
      created_by?: { data?: { type: "Person"; id: string } };
      updated_by?: { data?: { type: "Person"; id: string } };
      linked_publishing_episode?: {
        data?: { type: "LinkedPublishingEpisode"; id: string };
      };
      attachment_types?: {
        data?: { type: "AttachmentType"; id: string }[];
      };
    };
  };

type getPlansListResponse = Promise<{
    data: {
        data: Plan[]
    }
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
const getPlansList = async (serviceTypeId: string, params: any): getPlansListResponse => api.get('/service_types/' + serviceTypeId + '/plans', {
    params: params
})

// https://developer.planning.center/docs/#/apps/services/2018-11-01/vertices/song
const getOrganizationSongs = async (params: any) => api.get('/songs', {
    params: params
})

// https://developer.planning.center/docs/#/apps/services/2018-11-01/vertices/team
const getOrganizationTeams = async () => api.get('/teams')

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
const getPlanItems = async (serviceTypeId: string, planId: string) => api.get(`/service_types/${serviceTypeId}/plans/${planId}/items`)

// https://developer.planning.center/docs/#/apps/services/2018-11-01/vertices/arrangement
const getSongArrangmentInfo = async (songId: string, arrangmentId: string) => api.get(`/songs/${songId}/arrangements/${arrangmentId}`)

// https://developer.planning.center/docs/#/apps/services/2018-11-01/vertices/attachment
const getOrganizationAttachments = async () => api.get('/attachments')

const getPlanItemArrangments = async (serviceTypeId: string, planId: string, itemId: string) => api.get(`/service_types/${serviceTypeId}/plans/${planId}/items/${itemId}/arrangement`)

const getAttachmentsBySongArrangement = async (songId: string, arrangmentId: string) => api.get(`/songs/${songId}/arrangements/${arrangmentId}/attachments`)

const getAttachmentFileUrl = async (attachmentId: string) => api.post(`attachments/${attachmentId}/open`)

const getArrangementsBySong = async (songId: string) => api.get(`songs/${songId}/arrangements`)

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
    getArrangementsBySong
}