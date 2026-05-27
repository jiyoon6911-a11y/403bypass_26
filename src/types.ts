export interface UserProfile {
  email: string;
  name: string;
  userId: string;
  role: string;
  avatarUrl?: string;
  favoriteGenres?: string[];
  requiredSupports?: string[];
}

export interface Comment {
  id: number;
  authorId: string;
  authorName: string;
  text: string;
  timestamp: string;
}

export interface ReviewLog {
  id: number;
  userId: string;
  userName: string;
  userRole: string;
  show: string;
  rating: number;
  text: string;
  comments: Comment[];
}

export interface Show {
  id: number;
  title: string;
  genre: string;
  facility: string;
  score: number;
  elevator: boolean;
  toilet: boolean;
  toiletRating: number;
  image: string;
  tags: string[];
}

export interface Booking {
  id: string;
  type: 'manager' | 'glass';
  date: string;
  time: string;
  detail: string;
  note: string;
}

export interface Ticket {
  id: string;
  provider: 'interpark' | 'yes24' | 'melon';
  title: string;
  place: string;
  time: string;
  seat: string;
}

export interface MapTheater {
  header: string;
  milestone: string;
  dist: number;
  score: string;
  crowd: string;
}
