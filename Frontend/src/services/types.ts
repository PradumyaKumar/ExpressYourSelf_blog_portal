export interface User {
  _id: string;
  name: string;
  email: string;
  image: string;
  instagram: string;
  facebook: string;
  linkedin: string;
  bio: string;
}

export interface Blog {
  id: string;
  title: string;
  description: string;
  blogcontent: string;
  image: string;
  category: string;
  author: string;
  created_at?: string;
  create_at?: string;
  view_count?: number;
}

export interface Comment {
  id: string;
  userid: string;
  comment: string;
  create_at: string;
  username: string;
}

export interface SingleBlogResponse {
  blog: Blog;
  author: User;
}

