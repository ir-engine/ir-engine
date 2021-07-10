// From Mediasoup types

export type SctpParameters = {
  /**
   * Must always equal 5000.
   */
  port: number

  /**
   * Initially requested number of outgoing SCTP streams.
   */
  OS: number

  /**
   * Maximum number of incoming SCTP streams.
   */
  MIS: number

  /**
   * Maximum allowed size for SCTP messages.
   */
  maxMessageSize: number
}
