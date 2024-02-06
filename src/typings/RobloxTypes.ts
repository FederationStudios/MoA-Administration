export interface RobloxUserData extends Omit<LimitedRobloxUserData, 'username' | 'userId'> {
  description: string;
  created: ReturnType<typeof Date.prototype.toISOString>;
  isBanned: boolean;
  externalAppDisplayName: string;
  hasVerifiedBadge: boolean;
  id: number;
  name: string;
  displayName: string;
}

export type LimitedRobloxUserData = {
  buildersClubMembershipType: 0 | 1 | 2;
  hasVerifiedBadge: boolean;
  userId: number;
  username: string;
  displayName: string;
};

export type RobloxGroupData = {
  id: number;
  name: string;
  description: string;
  owner: LimitedRobloxUserData;
  shout: RobloxGroupShoutData;
  memberCount: number;
  isBuildersClubOnly: boolean;
  publicEntryAllowed: boolean;
  isLocked: boolean;
  hasVerifiedBadge: boolean;
};

export type RobloxGroupRoleData = {
  id: number;
  name: string;
  description: string;
  rank: number;
  memberCount: number;
};

export type RobloxGroupShoutData = {
  body: string;
  poster: LimitedRobloxUserData;
  created: ReturnType<typeof Date.prototype.toISOString>;
  updated: ReturnType<typeof Date.prototype.toISOString>;
};

export type RobloxGroupUserData = {
  group: RobloxGroupData;
  role: RobloxGroupRoleData;
  isPrimaryGroup: boolean;
};
