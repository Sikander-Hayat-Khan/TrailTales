export interface User {
  _id: string;
  username: string;
  email: string;
  avatarColor: string;
  bio?: string;
  friends: string[];
}

export interface Memory {
  _id: string;
  title: string;
  description: string;
  date: string;
  location: {
    lat: number;
    lng: number;
    name: string;
  };
  images: string[];
  tags: string[];
  userId: string | User;
  visibility: 'private' | 'friends' | 'public';
}

export interface FriendRequest {
  _id: string;
  sender: User;
  receiver: User;
  status: 'pending' | 'accepted' | 'rejected';
}
