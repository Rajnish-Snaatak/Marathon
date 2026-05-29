export type ParticipantStatus =
  | 'registered'
  | 'approved'
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
  approved_at: string | null
  confirmed_at: string | null
  certified_at: string | null
}
