export interface Post {
    id: number;
    title: string;
    content: string;
    file_content: null;
    post_uuid: string;
    user_id: number;
    parent_post_id: null;
    group_id: number;
    create_at: Date;
    update_at: Date;
    deleted: boolean;
  }