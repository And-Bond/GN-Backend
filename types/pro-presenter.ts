interface BaseData {
    id: {
        uuid: string;
        name: string;
        index: number;
    };
}

export interface Group extends BaseData {
    color: {
        red: number;
        green: number;
        blue: number;
        alpha: number;
    };
}

export interface Library extends BaseData {}

interface PlaylistBase extends BaseData {
    field_type: "playlist";
    children: [];
  }
  
interface PlaylistGroup extends BaseData {
    field_type: "group";
    children: PlaylistBase[];
  }
  
export type Playlist = PlaylistBase | PlaylistGroup;

interface PresentationItem extends BaseData {
    type: "presentation";
    presentation_info: {
      presentation_uuid: string;
      arrangement_name: string;
    };
    is_pco: boolean;
    is_hidden: boolean
}
  
interface PlaceholderItem extends BaseData {
    type: "placeholder";
    is_pco: boolean;
    is_hidden: boolean
}

interface HeaderItem extends BaseData {
    type: "header";
    header_color: {
        red: number;
        green: number;
        blue: number;
        alpha: number;
    };
    is_pco: boolean;
    is_hidden: boolean
}

export type PlaylistItem = PresentationItem | PlaceholderItem | HeaderItem;

export interface LibraryItem extends BaseData {
    updateType: 'all' | 'add' | 'remove'
}