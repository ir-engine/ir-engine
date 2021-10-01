/** Interface for Network schema. */
export interface NetworkSchema {
  /** Transporter of the message. */
  transport: any
  /** List of supported message types. */
  messageTypes: {
    [key: string]: any
  }
}
