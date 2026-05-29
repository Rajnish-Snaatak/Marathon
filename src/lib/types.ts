export type ParticipantStatus =
  | 'registered'
  | 'confirmed'
  | 'bib_collected'
  | 'certified'

export interface Participant {
  id: string
  created_at: string
  name: string
  email: string
  phone: string | null
  age: number | null
  tshirt_size: string | null
  status: ParticipantStatus
  bib_number: number | null
  certified_at: string | null
}
