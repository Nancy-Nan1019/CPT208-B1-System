export interface Group {
  id: string;
  session_id: string;
  name: string;
  created_at: string;
}

export interface GroupMember {
  id: string;
  group_id: string;
  user_id: string;
  joined_at: string;
  user?: {
    id: string;
    name: string;
    personality: 'E' | 'I' | null;
  };
}

export interface GroupWithMembers extends Group {
  members: GroupMember[];
}
