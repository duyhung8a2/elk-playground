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

  export interface User {
  id:         number;
  address:    string;
  name:       string;
  avatar:     string;
  background: null;
  role:       string;
  phone:      string;
  birthday:   Date;
  email:      string;
  ssn:        string;
  sex:        string;
  user_uuid:  string;
  is_famous:  boolean;
  create_at:  Date;
  update_at:  Date;
  deleted:    boolean;
}
