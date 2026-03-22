import type {
  AnimeFriendsResult,
  FriendItem,
  FriendshipItem,
  FriendshipStatusResult,
  FriendsWatchingItem,
  PendingRequest,
  PopularInCircleItem,
} from '~/types/social';

// Re-export FriendshipItem for external use
export type { FriendshipItem };

// ── Global friend list (shared across components in one session) ──────────────

const _friends = ref<FriendItem[]>([]);
const _friendsLoaded = ref(false);

// ── useFriends ────────────────────────────────────────────────────────────────

export function useFriends() {
  const apiUrl = useApiUrl();
  const loading = ref(false);
  const pendingRequests = ref<PendingRequest[]>([]);
  const sentRequests = ref<PendingRequest[]>([]);

  async function fetchFriends(force = false): Promise<void> {
    if (_friendsLoaded.value && !force) return;
    loading.value = true;
    try {
      _friends.value = await $fetch<FriendItem[]>(`${apiUrl}/social/friends`, {
        credentials: 'include',
      });
      _friendsLoaded.value = true;
    } finally {
      loading.value = false;
    }
  }

  async function fetchPendingRequests(): Promise<void> {
    pendingRequests.value = await $fetch<PendingRequest[]>(
      `${apiUrl}/social/friends/pending`,
      { credentials: 'include' },
    );
  }

  async function fetchSentRequests(): Promise<void> {
    sentRequests.value = await $fetch<PendingRequest[]>(
      `${apiUrl}/social/friends/sent`,
      { credentials: 'include' },
    );
  }

  async function sendRequest(addresseeId: string): Promise<FriendshipItem> {
    const result = await $fetch<FriendshipItem>(
      `${apiUrl}/social/friends/request`,
      {
        method: 'POST',
        body: { addresseeId },
        credentials: 'include',
      },
    );
    return result;
  }

  async function acceptRequest(friendshipId: string): Promise<void> {
    const friend = await $fetch<FriendshipItem>(
      `${apiUrl}/social/friends/request/${friendshipId}/accept`,
      { method: 'POST', credentials: 'include' },
    );
    // Remove from pending, add to friends
    pendingRequests.value = pendingRequests.value.filter(
      (r) => r.friendshipId !== friendshipId,
    );
    // Refresh friends list
    _friendsLoaded.value = false;
    await fetchFriends(true);
    return void friend;
  }

  async function rejectRequest(friendshipId: string): Promise<void> {
    await $fetch(
      `${apiUrl}/social/friends/request/${friendshipId}/reject`,
      { method: 'POST', credentials: 'include' },
    );
    pendingRequests.value = pendingRequests.value.filter(
      (r) => r.friendshipId !== friendshipId,
    );
  }

  async function removeFriend(friendshipId: string): Promise<void> {
    await $fetch(`${apiUrl}/social/friends/${friendshipId}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    _friends.value = _friends.value.filter(
      (f) => f.friendshipId !== friendshipId,
    );
  }

  async function blockUser(targetId: string): Promise<void> {
    await $fetch(`${apiUrl}/social/block/${targetId}`, {
      method: 'POST',
      credentials: 'include',
    });
    _friendsLoaded.value = false;
    await fetchFriends(true);
  }

  async function getFriendshipStatus(
    targetId: string,
  ): Promise<FriendshipStatusResult> {
    return $fetch<FriendshipStatusResult>(
      `${apiUrl}/social/friends/status/${targetId}`,
      { credentials: 'include' },
    );
  }

  return {
    friends: readonly(_friends),
    friendsLoaded: readonly(_friendsLoaded),
    loading: readonly(loading),
    pendingRequests: readonly(pendingRequests),
    sentRequests: readonly(sentRequests),
    fetchFriends,
    fetchPendingRequests,
    fetchSentRequests,
    sendRequest,
    acceptRequest,
    rejectRequest,
    removeFriend,
    blockUser,
    getFriendshipStatus,
  };
}

// ── useAnimeActivity ──────────────────────────────────────────────────────────

export function useAnimeActivity(animeId: string) {
  const apiUrl = useApiUrl();
  const activity = ref<AnimeFriendsResult | null>(null);
  const loading = ref(false);

  async function fetchActivity(): Promise<void> {
    loading.value = true;
    try {
      activity.value = await $fetch<AnimeFriendsResult>(
        `${apiUrl}/social/anime/${animeId}/friends`,
        { credentials: 'include' },
      );
    } catch {
      activity.value = null;
    } finally {
      loading.value = false;
    }
  }

  return {
    activity: readonly(activity),
    loading: readonly(loading),
    fetchActivity,
  };
}

// ── useSocialFeed ─────────────────────────────────────────────────────────────

export function useSocialFeed() {
  const apiUrl = useApiUrl();
  const watching = ref<FriendsWatchingItem[]>([]);
  const popular = ref<PopularInCircleItem[]>([]);
  const loadingWatching = ref(false);
  const loadingPopular = ref(false);

  async function fetchFriendsWatching(limit = 20): Promise<void> {
    loadingWatching.value = true;
    try {
      watching.value = await $fetch<FriendsWatchingItem[]>(
        `${apiUrl}/social/friends-watching`,
        { params: { limit }, credentials: 'include' },
      );
    } finally {
      loadingWatching.value = false;
    }
  }

  async function fetchPopularInCircle(limit = 20): Promise<void> {
    loadingPopular.value = true;
    try {
      popular.value = await $fetch<PopularInCircleItem[]>(
        `${apiUrl}/social/popular-in-circle`,
        { params: { limit }, credentials: 'include' },
      );
    } finally {
      loadingPopular.value = false;
    }
  }

  return {
    watching: readonly(watching),
    popular: readonly(popular),
    loadingWatching: readonly(loadingWatching),
    loadingPopular: readonly(loadingPopular),
    fetchFriendsWatching,
    fetchPopularInCircle,
  };
}
