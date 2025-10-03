export type InvoiceType = {
  title: string
  description: string
  hours: number
  rate: string
  amount: number
}

export const InvoiceData: InvoiceType[] = [
  {
    title: 'Project Design',
    description:
      'It is a long established fact that a reader will be distracted.',
    hours: 60,
    rate: '50',
    amount: 3000,
  },
  {
    title: 'Development',
    description:
      'It is a long established fact that a reader will be distracted.',
    hours: 100,
    rate: '50',
    amount: 5000,
  },
  {
    title: 'Testing & Bug Fixing',
    description:
      'It is a long established fact that a reader will be distracted.',
    hours: 10,
    rate: '20',
    amount: 200,
  },
]
