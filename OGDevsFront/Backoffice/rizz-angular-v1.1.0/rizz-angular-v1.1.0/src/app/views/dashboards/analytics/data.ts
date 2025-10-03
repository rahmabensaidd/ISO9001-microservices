export type StateType = {
  title: string
  value: string
  icon: string
  description: {
    percentage: string
    text: string
    trend: string
  }
}

export type BrowserType = {
  image: string
  browser: string
  sessions: string
  bounce_rate: string
  transactions: string
}

type SessionType = {
  count?: number
  percentage?: number
  trend?: string
}

export type VisitType = {
  channel: string
  sessions: SessionType
  prev_period: SessionType
  change: SessionType
}

export const stateData: StateType[] = [
  {
    title: 'Sessions',
    value: '24k',
    icon: 'iconoir-hexagon-dice',
    description: {
      percentage: '8.5%',
      text: 'New Sessions Today',
      trend: 'positive',
    },
  },
  {
    title: 'Avg.Sessions',
    value: '00:18',
    icon: 'iconoir-clock',
    description: {
      percentage: '1.5%',
      text: 'Weekly Avg.Sessions',
      trend: 'positive',
    },
  },
  {
    title: 'Bounce Rate',
    value: '36.45%',
    icon: 'iconoir-percentage-circle',
    description: {
      percentage: '8%',
      text: 'Up Bounce Rate Weekly',
      trend: 'negative',
    },
  },
]

export const BrowserData = [
  {
    image: 'assets/images/logos/chrome.png',
    browser: 'Chrome',
    sessions: '10853 (52%)',
    bounce_rate: '52.80%',
    transactions: '566 (92%)',
  },
  {
    image: 'assets/images/logos/micro-edge.png',
    browser: 'Microsoft Edge',
    sessions: '2545 (47%)',
    bounce_rate: '47.54%',
    transactions: '498 (81%)',
  },
  {
    image: 'assets/images/logos/in-explorer.png',
    browser: 'Internet-Explorer',
    sessions: '1836 (38%)',
    bounce_rate: '41.12%',
    transactions: '455 (74%)',
  },
  {
    image: 'assets/images/logos/opera.png',
    browser: 'Opera',
    sessions: '1958 (31%)',
    bounce_rate: '36.82%',
    transactions: '361 (61%)',
  },
  {
    image: 'assets/images/logos/chrome.png',
    browser: 'Chrome',
    sessions: '10853 (52%)',
    bounce_rate: '52.80%',
    transactions: '566 (92%)',
  },
]

export const VisitsList: VisitType[] = [
  {
    channel: 'Organic search',
    sessions: {
      count: 10853,
      percentage: 52,
    },
    prev_period: {
      count: 566,
      percentage: 92,
    },
    change: {
      percentage: 52.8,
      trend: 'up',
    },
  },
  {
    channel: 'Direct',
    sessions: {
      count: 2545,
      percentage: 47,
    },
    prev_period: {
      count: 498,
      percentage: 81,
    },
    change: {
      percentage: -17.2,
      trend: 'down',
    },
  },
  {
    channel: 'Referal',
    sessions: {
      count: 1836,
      percentage: 38,
    },
    prev_period: {
      count: 455,
      percentage: 74,
    },
    change: {
      percentage: 41.12,
      trend: 'up',
    },
  },
  {
    channel: 'Email',
    sessions: {
      count: 1958,
      percentage: 31,
    },
    prev_period: {
      count: 361,
      percentage: 61,
    },
    change: {
      percentage: -8.24,
      trend: 'down',
    },
  },
  {
    channel: 'Social',
    sessions: {
      count: 1566,
      percentage: 26,
    },
    prev_period: {
      count: 299,
      percentage: 49,
    },
    change: {
      percentage: 29.33,
      trend: 'up',
    },
  },
]
