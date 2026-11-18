# Doctor Dubang Firestore Security Specification

## 1. Data Invariants
1. **Default-Deny Baseline**: Every path not explicitly matched defaults to `allow read, write: if false`.
2. **Verified Identity**: All writes require `request.auth != null && request.auth.token.email_verified == true`.
3. **Zero Privilege Escalation**: Users creating their own `/users/{userId}` document must set `role == 'user'` (unless bootstrapped admin) and cannot alter `role` or write to `/admins/{userId}`.
4. **Admin Directory Integrity**: Only verified admins (`ajayparmar9801@gmail.com` or UID present in `/admins/{uid}`) may create, edit, verify, or delete `/hospitals/{hospitalId}` records.
5. **Dispatch Ownership & Terminal Lock**: A verified user may create an `/emergencyDispatches/{dispatchId}` only with `userId == request.auth.uid` and `status == 'sent'`. Only admins can advance or resolve dispatch statuses, and once `status == 'resolved'`, non-admins cannot modify it.

## 2. Dirty Dozen Attack Payloads (Expected: PERMISSION_DENIED)
1. Unauthenticated write to `/hospitals/hosp1`
2. Unverified email (`email_verified: false`) admin spoofing attempt with `email: "ajayparmar9801@gmail.com"`
3. Non-admin user attempting to set `role: "admin"` in `/users/{uid}` on create
4. Non-admin user attempting to update `role` field on their own `/users/{uid}` profile
5. Non-admin user attempting to write `/admins/{uid}` directly
6. Non-admin user creating a `/hospitals/hosp1` document with `verified: true`
7. Admin creating `/hospitals/hosp1` with an extra shadow field `isSponsored: true`
8. Admin creating `/hospitals/` with an oversized 2000-char document ID or invalid characters
9. User creating `/emergencyDispatches/disp1` with `userId` set to another user's UID
10. User creating `/emergencyDispatches/disp1` with `status: "resolved"` instead of `"sent"`
11. User reading another user's `/emergencyDispatches/dispOther` document
12. User attempting to modify `createdAt` or `aiDispatchBrief` on an existing dispatch
