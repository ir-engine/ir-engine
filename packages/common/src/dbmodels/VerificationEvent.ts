export interface VerificationEventInterface {
  id: String
  userId: String
  expiresAt: Date
  log: String // verification result log (fine-grained results, like "expired" / "revoked"
}
