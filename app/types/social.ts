// ── Shared micro-types ────────────────────────────────────────────────────────

export interface SocialUser {
  id: string;
  email: string;
  avatarUrl: string | null;
  level?: number;
}

// ── Reviews ───────────────────────────────────────────────────────────────────

export interface ReviewAuthor extends SocialUser {
  level: number;
}

export interface Review {
  id: string;
  animeId: string;
  title: string;
  content: string;
  rating: number;
  likesCount: number;
  isLikedByMe: boolean;
  createdAt: string;
  updatedAt: string;
  author: ReviewAuthor;
}

export interface AnimeRatingSummary {
  average: number;
  count: number;
  distribution: Record<number, number>;
}

export interface ReviewListResult {
  items: Review[];
  total: number;
  avgRating: number | null;
}

export type ReviewSortOrder =
  | 'newest'
  | 'oldest'
  | 'highest_rated'
  | 'most_liked';

export interface CreateReviewPayload {
  animeId: string;
  title: string;
  content: string;
  rating: number;
}

export interface UpdateReviewPayload {
  title?: string;
  content?: string;
  rating?: number;
}

// ── Comments ──────────────────────────────────────────────────────────────────

export interface CommentAuthor extends SocialUser {
  level: number;
}

export interface Comment {
  id: string;
  animeId: string;
  parentId: string | null;
  content: string;
  createdAt: string;
  updatedAt: string;
  author: CommentAuthor;
  replyCount: number;
}

export interface CommentThread extends Comment {
  replies: Comment[];
}

export interface CommentsPage {
  items: CommentThread[];
  nextCursor: string | null;
}

export interface CreateCommentPayload {
  animeId: string;
  content: string;
  parentId?: string;
}

// ── Friendships ───────────────────────────────────────────────────────────────

export interface FriendItem extends SocialUser {
  level: number;
  friendshipId: string;
  friendsSince: string;
}

export interface PendingRequest {
  friendshipId: string;
  user: SocialUser & { level: number };
  sentAt: string;
}

export type FriendshipRelation =
  | 'none'
  | 'pending_sent'
  | 'pending_received'
  | 'friends'
  | 'blocked';

export interface FriendshipStatusResult {
  status: FriendshipRelation;
  friendshipId?: string;
}

// ── Social feed ───────────────────────────────────────────────────────────────

export interface UserWithStatus extends SocialUser {
  status?: string;
  updatedAt: string;
}

export interface AnimeFriendsResult {
  total: number;
  watching: UserWithStatus[];
  completed: UserWithStatus[];
  planned: UserWithStatus[];
  others: UserWithStatus[];
}

export interface FriendsWatchingItem {
  animeId: string;
  title: string;
  titleRu: string | null;
  posterUrl: string | null;
  watchers: SocialUser[];
  lastActivityAt: string;
}

export interface FriendStats {
  score: number;
  watching: number;
  completed: number;
  planned: number;
  liked: number;
  total: number;
}

export interface PopularInCircleItem {
  animeId: string;
  title: string;
  titleRu: string | null;
  posterUrl: string | null;
  shikimoriScore: number | null;
  kind: string;
  year: number | null;
  friendStats: FriendStats;
}
