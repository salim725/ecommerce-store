/** Minimal user fields for transactional emails — avoids cross-feature model imports. */
export interface UserEmailRecipient {
  name: string
  email: string
}
