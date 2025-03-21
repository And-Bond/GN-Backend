
import axios from "axios";
// Type imports
import type { Group, Library, Playlist, PlaylistItem, LibraryItem } from "types/pro-presenter.js";

const path = 'http://192.168.1.172:3005/v1/'

const api = axios.create({
    baseURL: path,
});

const tiggerNextSlide = async() => api.get('trigger/next');

const tiggerPreviousSlide = async() => api.get('trigger/previous');

const triggerNextMedia = async() => api.get('trigger/media/previous');

const triggerPreviousMedia = async() => api.get('trigger/media/previous');

const triggerNextAudio = async() => api.get('trigger/audio/previous');

const triggerPreviousAudio = async() => api.get('trigger/audio/previous');

const trigggerSlide = async(uuid: string, index: string) => api.get(`presentation/${uuid}/${index}/trigger`);

const getAllGroups = async(): Promise<Group[]> => api.get('groups');

const getAllLibraries = async(): Promise<Library[]> => api.get('libraries');

const getLibraryItems = async(id: string): Promise<LibraryItem[]> => api.get('libraries/' + id);

const getAllPlaylists = async(): Promise<Playlist[]> => api.get('playlists');

const getPlaylistItems = async(id: string): Promise<PlaylistItem[]> => api.get('playlists/' + id);

const getActivePresentation = async() => api.get('presentation/active');

module.exports = {
    tiggerNextSlide,
    tiggerPreviousSlide,
    triggerNextMedia,
    triggerPreviousMedia,
    triggerNextAudio,
    triggerPreviousAudio,
    getAllGroups,
    getActivePresentation,
    trigggerSlide,
    getAllLibraries,
    getAllPlaylists,
    getPlaylistItems,
    getLibraryItems
};