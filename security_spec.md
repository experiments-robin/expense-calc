# Security Specification for Budgetly

## Data Invariants
1. A **User** profile must match the authenticated user's UID.
2. A **Group** must have at least one member (the creator).
3. An **Expense** must belong to an existing Group.
4. Only members of a Group can view its expenses and member list.
5. Only the creator of an Expense or a Group Admin (TBD) can modify/delete it.
6. The `memberIds` list in a Group document must be kept in sync with the `members` subcollection for query optimization.

## The "Dirty Dozen" Payloads

1. **Identity Spoofing (User)**: Create a user profile with a different UID.
2. **Identity Spoofing (Group)**: Create a group with someone else as `createdBy`.
3. **Identity Spoofing (Expense)**: Create an expense and set `paidBy` to another user's UID.
4. **State Shortcutting**: Update a group's `createdBy` after creation.
5. **Resource Poisoning**: Inject a 1MB string into a group's `name`.
6. **Privilege Escalation**: A non-member attempting to read or write to a group they don't belong to.
7. **Orphaned Writes**: Creating an expense for a group that does not exist.
8. **Shadow Update**: Adding an extra field like `isAdmin: true` to a user profile that isn't in the schema.
9. **PII Leak**: A stranger attempting to read all users' emails by listing the `users` collection.
10. **Improper Deletion**: A member (non-creator) trying to delete a group.
11. **Negative Amount**: Creating an expense with a negative amount.
12. **Future Timestamp**: Creating an expense with a future `createdAt` timestamp (not server time).

## Red Team Audit Results (To be filled after rules implementation)
| Collection | Identity Spoofing | State Shortcutting | Resource Poisoning |
| :--- | :--- | :--- | :--- |
| users | Protected | Protected | Protected |
| groups | Protected | Protected | Protected |
| expenses | Protected | Protected | Protected |
| members | Protected | Protected | Protected |
