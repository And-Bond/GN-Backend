
import axios from "axios";
// Type imports
import type { Group, Library, Playlist, PlaylistItem, LibraryPlaylist, Presentation, Prop, PropCollection, StageScreen, StageLayout } from "types/pro-presenter.js";

const path = 'http://192.168.1.172:3005/v1/'

const api = axios.create({
    baseURL: path,
});

/**
 * UUID representation of item
 * for example: 3C39C433-5C18-4F51-B357-55BB870227C4
 */
type UUID = string

/**
 * UUID, name or index of item
 */
type ID = string

// Libraries

const getAllLibraries = async(): Promise<Library[]> => api.get('libraries');

// Playlists

const getAllPlaylists = async(): Promise<Playlist[]> => api.get('playlists');

const getLibraryPlaylists = async(id: ID): Promise<LibraryPlaylist[]> => api.get('libraries/' + id);

const getPlaylistItems = async(id: ID): Promise<Playlist['id'] & { items: PlaylistItem[] } > => api.get('playlists/' + id);

// Presentations

const getPresentationById = async(uuid: UUID): Promise<{ presentation: Presentation }> => api.get('presentation' + uuid)

const getActivePresentation = async() => api.get('presentation/active');

// Props

const getAllPropCollections = async(): Promise<{ collections: PropCollection[] }> => api.get('prop_collections')

const getAllProps = async(): Promise<Prop[]> => api.get('props');

// Groups

const getAllGroups = async(): Promise<Group[]> => api.get('groups');

// Stage Screens/Layout

const getAllStageScreens = async(): Promise<StageScreen[]> => api.get('stage/screens')

const getAllStageLayouts = async(): Promise<StageLayout[]> => api.get('stage/layouts')

// Triggers

const tiggerNextSlide = async(): Promise<void> => api.get('trigger/next');

const tiggerPreviousSlide = async(): Promise<void> => api.get('trigger/previous');

const triggerNextMedia = async(): Promise<void> => api.get('trigger/media/previous');

const triggerPreviousMedia = async(): Promise<void> => api.get('trigger/media/previous');

const triggerNextAudio = async(): Promise<void> => api.get('trigger/audio/previous');

const triggerPreviousAudio = async(): Promise<void> => api.get('trigger/audio/previous');

const trigggerSlide = async(uuid: UUID, index: string): Promise<void> => api.get(`presentation/${uuid}/${index}/trigger`);


export default {
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
    getLibraryPlaylists,
    getPresentationById,
    getAllPropCollections,
    getAllProps,
    getAllStageScreens,
    getAllStageLayouts
};