import { GroupStoragePort } from '../ports';
import { Group, GroupMember } from '../../../types';
import { db } from '../../../firebase';
import { 
  collection, doc, getDoc, getDocs, query, where, 
  onSnapshot, addDoc, updateDoc, deleteDoc, setDoc, arrayUnion, arrayRemove
} from 'firebase/firestore';

export class FirebaseGroupAdapter implements GroupStoragePort {
  async getGroup(groupId: string): Promise<Group | null> {
    const snap = await getDoc(doc(db, 'groups', groupId));
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() } as Group;
  }

  subscribeToGroup(groupId: string, callback: (group: Group | null) => void, onError: (error: Error) => void) {
    return onSnapshot(doc(db, 'groups', groupId), (snap) => {
      if (snap.exists()) {
        callback({ id: snap.id, ...snap.data() } as Group);
      } else {
        callback(null);
      }
    }, onError);
  }

  subscribeToUserGroups(userId: string, callback: (groups: Group[]) => void, onError: (error: Error) => void) {
    const q = query(collection(db, 'groups'), where('memberIds', 'array-contains', userId));
    return onSnapshot(q, (snapshot) => {
      const groups = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Group));
      callback(groups);
    }, onError);
  }

  subscribeToGroupMembers(groupId: string, callback: (members: GroupMember[]) => void, onError: (error: Error) => void) {
    const q = collection(db, 'groups', groupId, 'members');
    return onSnapshot(q, (snapshot) => {
      const members = snapshot.docs.map(d => ({ uid: d.id, ...d.data() } as GroupMember));
      callback(members);
    }, onError);
  }

  async createGroup(groupData: Omit<Group, 'id'>, initialMember: GroupMember): Promise<string> {
    const groupRef = await addDoc(collection(db, 'groups'), groupData);
    await setDoc(doc(db, 'groups', groupRef.id, 'members', initialMember.uid), initialMember);
    return groupRef.id;
  }

  async updateGroup(groupId: string, updates: Partial<Group>): Promise<void> {
    await updateDoc(doc(db, 'groups', groupId), updates);
  }

  async deleteGroup(groupId: string): Promise<void> {
    await deleteDoc(doc(db, 'groups', groupId));
  }

  async addMember(groupId: string, member: GroupMember): Promise<void> {
    await setDoc(doc(db, 'groups', groupId, 'members', member.uid), member);
    await updateDoc(doc(db, 'groups', groupId), {
      memberIds: arrayUnion(member.uid)
    });
  }

  async removeMember(groupId: string, memberId: string): Promise<void> {
    await deleteDoc(doc(db, 'groups', groupId, 'members', memberId));
    await updateDoc(doc(db, 'groups', groupId), {
      memberIds: arrayRemove(memberId)
    });
  }
}
