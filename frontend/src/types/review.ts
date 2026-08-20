export interface Review {
  id: number;
  tourId: number;
  userId: number;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment?: string;
  imageUrl?: string;
  createdAt: string;
}

export interface ReviewCreateRequest {
  tourId: number;
  rating: number;
  comment?: string;
  imageUrl?: string;
}
