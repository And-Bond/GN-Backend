/**
 * true if the item is a Planning Center Online item, false otherwise.
 * If it's true -> all additional info as presenation uuid will be hidden, so you wouldn't be able to achive it
 */
type is_pco = boolean
/**
 * true if the item is hidden, false if the item is visible.
 */
type is_hidden = boolean

/**
 * RGBA representation of color
 */
type Color = {
    /**
     * The red component of the color, between 0 and 1
     */
    red: number;
    /**
     * The green component of the color, between 0 and 1
     */
    green: number;
    /**
     * The blue component of the color, between 0 and 1
     */
    blue: number;
    /**
     * The alpha component of the color, between 0 and 1
     */
    alpha: number;
}

export interface BaseData {
    id: {
        /**
         * The UUID of the item
         */
        uuid: string;
        /**
         * The user-defined name of the item
         */
        name: string;
        /**
         * The index of the item
         */
        index: number;
    };
}

export interface Group extends BaseData {
    color: Color;
}

export interface Library extends BaseData {}

interface PlaylistBase extends BaseData {
    /**
     * The type of playlist item
     */
    field_type: "playlist";
    /**
     * Children of group playlist, if field_type is playlist -> empty array
     */
    children: [];
}

/**
 * eg - Playlist Folder
 */
interface PlaylistGroup extends BaseData {
    /**
     * The type of playlist item
     */
    field_type: "group";
    /**
     * All playlists of playlist group
     */
    children: PlaylistBase[];
  }
  
export type Playlist = PlaylistBase | PlaylistGroup;

interface PresentationItemNoPCO extends BaseData {
    type: "presentation";
    /**
     * Is Planning Center Online Item
     */
    is_pco: false;
    /**
     * true if the item is hidden, false if the item is visible.
     */
    is_hidden: is_hidden;
    /**
     * May be not present even if is_pco -> false, if was linked from placeholder
     */
    presentation_info?: {
        /**
         * The UUID of the presentation referenced by a playlist item. This can be used to obtain presentation information by this uuid
         */
        presentation_uuid: string;
        /**
         * The name of the selected arrangement for the presentation.
         */
        arrangement_name: string;
    };
}

interface PresentationItemPCO extends BaseData {
    type: "presentation";
    /**
     * Is Planning Center Online Item
     */
    is_pco: true;
    /**
     * true if the item is hidden, false if the item is visible.
     */
    is_hidden: is_hidden;
}

type PresentationItem = PresentationItemPCO | PresentationItemNoPCO
  
interface PlaceholderItem extends BaseData {
    type: "placeholder";
    /**
     * Is Planning Center Online Item
     */
    is_pco: is_pco;
    /**
     * true if the item is hidden, false if the item is visible.
     */
    is_hidden: boolean
}

interface HeaderItem extends BaseData {
    type: "header";
    header_color: Color;
    /**
     * Is Planning Center Online Item
     */
    is_pco: is_pco;
    is_hidden: boolean
}

/**
 * Can be also audio, media or livevideo, these types currently not provided, add them later
 */
export type PlaylistItem = PresentationItem | PlaceholderItem | HeaderItem;

export interface LibraryPlaylist extends BaseData {
    updateType: 'all' | 'add' | 'remove'
}

type PresentationSlide = {
    /**
     * Is this slide enabled
     */
    enabled: boolean,
    /**
     * Notes to be showed along with the slide
     */
    notes: string,
    /**
     * Slide text
     */
    text: string,
    /**
     * The label for the slide
     */
    label: string,
    size: {
        /**
         * The width of the slide, in pixels
         */
        width: number,
        /**
         * The height of the slide, in pixels
         */
        height: number
    }
}

interface PresentationGroup extends Group {
    name: string,
    slides: PresentationSlide[]
}

export interface Presentation extends BaseData {
    groups: PresentationGroup[],
    /**
     * True if this presentation has an associated timeline
     */
    has_timeline?: boolean,
    /**
     * The path to the presentation file on disk
     */
    presentation_path: string,
    /**
     * The presentation destination:
     */
    destination: "presentation" | "announcements"
}

export interface Prop extends BaseData {
    /**
     * true if the prop is currently active (triggered), false otherwise
     */
    is_active: boolean
    /**
     * true if the prop automatically clears after a specified duration, false otherwise
     */
    auto_clear_enabled: boolean
    /**
     * The duration in seconds after which the prop will automatically clear. If auto_clear_enabled is false, this value is ignored.
     */
    auto_clear_duration: number
}


export interface PropCollection extends BaseData {
    props: Prop[]
}

/**
 * Hardware created stage output (Monitors, NDI, Syphon etc)
 */
export interface StageScreen extends BaseData {}

/**
 * Hardware created stage output (Monitors, NDI, Syphon etc)
 */
export interface StageLayout extends BaseData {}