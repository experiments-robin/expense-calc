import { Group, GroupMember } from '../../types';
import { GroupStoragePort } from './ports';

export class GroupOperationsModule {
  constructor(private storage: GroupStoragePort) {}

  getGroup(groupId: string) {
    return this.storage.getGroup(groupId);
  }

  subscribeToGroup(groupId: string, callback: (group: Group | null) => void, onError: (error: Error) => void) {
    return this.storage.subscribeToGroup(groupId, callback, onError);
  }

  subscribeToUserGroups(userId: string, callback: (groups: Group[]) => void, onError: (error: Error) => void) {
    return this.storage.subscribeToUserGroups(userId, callback, onError);
  }

  subscribeToGroupMembers(groupId: string, callback: (members: GroupMember[]) => void, onError: (error: Error) => void) {
    return this.storage.subscribeToGroupMembers(groupId, callback, onError);
  }

  async createGroup(groupData: Omit<Group, 'id'>, initialMember: GroupMember): Promise<string> {
    if (!groupData.name) throw new Error("Group name is required");
    return this.storage.createGroup(groupData, initialMember);
  }

  async updateGroup(groupId: string, updates: Partial<Group>): Promise<void> {
    return this.storage.updateGroup(groupId, updates);
  }

  async deleteGroup(groupId: string): Promise<void> {
    return this.storage.deleteGroup(groupId);
  }

  async addMember(groupId: string, member: GroupMember): Promise<void> {
    return this.storage.addMember(groupId, member);
  }

  async removeMember(groupId: string, memberId: string): Promise<void> {
    return this.storage.removeMember(groupId, memberId);
  }
}
