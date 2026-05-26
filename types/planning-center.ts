type Relationship<T extends string> = {
    data: {
      type: T;
      id: string;
    };
  };

type Included<T extends string> = {
  data: {
    type: T;
    id: string;
  }[]
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
  
  export type Team = {
    type: "Team";
    id: string;
    attributes?: {
      archived_at?: string;
      assigned_directly?: boolean;
      created_at?: string;
      default_prepare_notifications?: boolean;
      default_status?: string;
      deleted_at?: string;
      last_plan_from?: string;
      name?: string;
      rehearsal_team?: boolean;
      schedule_to?: string;
      secure_team?: boolean;
      sequence?: number;
      stage_color?: string;
      stage_variant?: string;
      updated_at?: string;
      viewers_see?: number;
    },
    relationships?: {
      service_type?: Relationship<"ServiceType">;
      default_responds_to?: Relationship<"Person">;
      service_types?: Relationship<"ServiceType">[];
      /** Only when included with the team request */
      people?: Included<"People">;
    };
  }

  export type People = {
    type: "Person";
    id: string;
    attributes: {
      access_media_attachments: boolean;
      access_plan_attachments: boolean;
      access_song_attachments: boolean;
      anniversary: string;
      archived: boolean;
      archived_at: string;
      assigned_to_rehearsal_team: boolean;
      birthdate: string;
      can_edit_all_people: boolean;
      can_view_all_people: boolean;
      created_at: string;
      facebook_id: string;
      first_name: string;
      full_name: string;
      given_name: string;
      ical_code: string;
      last_name: string;
      legacy_id: string;
      logged_in_at: string;
      max_permissions: string;
      max_plan_permissions: string;
      me_tab: string;
      media_permissions: string;
      media_tab: string;
      middle_name: string;
      name_prefix: string;
      name_suffix: string;
      nickname: string;
      notes: string;
      onboardings: any[];
      passed_background_check: boolean;
      people_tab: string;
      permissions: string;
      photo_thumbnail_url: string;
      photo_url: string;
      plans_tab: string;
      praise_charts_enabled: boolean;
      preferred_app: string;
      preferred_max_plans_per_day: number;
      preferred_max_plans_per_month: number;
      profile_name: string;
      signature: string;
      site_administrator: boolean;
      song_permissions: string;
      songs_tab: string;
      status: string;
      updated_at: string;
    };
    relationships?: {
      created_by?: Relationship<"Person">;
      updated_by?: Relationship<"Person">;
      current_folder?: Relationship<"Folder">;
      team?: Relationship<"Team">
    };
  }

export type PlanPerson = {
  type: "PlanPerson";
  id: string;
  attributes?: {
    can_accept_partial?: boolean;
    created_at?: string;
    updated_at?: string;
    decline_reason?: string;
    name?: string;
    notes?: string;
    notification_changed_at?: string;
    notification_changed_by_name?: string;
    notification_prepared_at?: string;
    notification_read_at?: string;
    notification_sender_name?: string;
    notification_sent_at?: string;
    photo_thumbnail?: string;
    prepare_notification?: boolean;
    scheduled_by_is_eligible_for_responds_to?: boolean;
    scheduled_by_name?: string;
    status?: string;
    status_updated_at?: string;
    team_position_name?: string;
  };
  relationships?: {
    person?: Relationship<"Person">;
    plan?: Relationship<"Plan">;
    scheduled_by?: Relationship<"Person">;
    service_type?: Relationship<"ServiceType">;
    team?: Relationship<"Team">;
    responds_to?: Relationship<"Person">;
  };
}

export type ServiceType = {
  type: "ServiceType";
  id: string;
  attributes: {
    name: string;
    frequency?: string;
    sequence?: number;
    permissions?: string;
    background_check_permissions?: string;
    attachment_types_enabled?: boolean;
    scheduled_publish?: boolean;
    custom_item_types?: { matcher: string; color: string }[];
    standard_item_types?: { item_type: string; color: string }[];
    last_plan_from?: string;
    created_at?: string;
    updated_at?: string;
    archived_at?: string | null;
    deleted_at?: string | null;
  };
  relationships?: {
    parent?: Relationship<"Folder">;
  };
}