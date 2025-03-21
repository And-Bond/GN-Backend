type Relationship<T extends string> = {
    data: {
      type: T;
      id: string;
    };
  };

export type Plan = {
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
      service_type?: Relationship<"ServiceType">;
      previous_plan?: Relationship<"Plan">;
      next_plan?: Relationship<"Plan">;
      series?: Relationship<"Series">;
      created_by?: Relationship<"Person">;
      updated_by?: Relationship<"Person">;
      linked_publishing_episode?: Relationship<"LinkedPublishingEpisode">;
      attachment_types?: Relationship<"AttachmentType">;
    };
  };

  
  export type Item = {
    type: "Item";
    id: string;
    attributes?: {
      title?: string;
      sequence?: number;
      created_at?: string;
      updated_at?: string;
      length?: number;
      item_type?: string;
      html_details?: string;
      service_position?: string;
      description?: string;
      key_name?: string;
      custom_arrangement_sequence?: any[];
      custom_arrangement_sequence_short?: any[];
      custom_arrangement_sequence_full?: any[];
    };
    relationships?: {
      plan?: Relationship<"Plan">;
      song?: Relationship<"Song">;
      arrangement?: Relationship<"Arrangement">;
      key?: Relationship<"Key">;
      selected_layout?: Relationship<"Layout">;
      selected_background?: Relationship<"Attachment">;
    };
  };