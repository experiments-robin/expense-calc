import { Group, GroupMember, BudgetType } from '../../types';

export interface GroupStoragePort {
  getGroup(groupId: string): Promise<Group | null>;
  subscribeToGroup(groupId: string, callback: (group: Group | null) => void, onError: (error: Error) => void): () => void;
  subscribeToUserGroups(userId: string, callback: (groups: Group[]) => void, onError: (error: Error) => void): () => void;
  subscribeToGroupMembers(groupId: string, callback: (members: GroupMember[]) => void, onError: (error: Error) => void): () => void;
  
  createGroup(groupData: Omit<Group, 'id'>, initialMember: GroupMember): Promise<string>;
  updateGroup(groupId: string, updates: Partial<Group>): Promise<void>;
  deleteGroup(groupId: string): Promise<void>;
  
  addMember(groupId: string, member: GroupMember): Promise<void>;
  removeMember(groupId: string, memberId: string): Promise<void>;
}
