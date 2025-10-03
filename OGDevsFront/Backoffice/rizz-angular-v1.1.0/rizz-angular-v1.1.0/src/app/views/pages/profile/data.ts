export type LightBox = {
  image: string
  overlay?: boolean
}

export type CommentType = {
  author: string
  avatar: string
  time: string
  text: string
  replies: Reply[]
}

type Reply = {
  author: string
  avatar: string
  time: string
  text: string
}

export const lightbox: LightBox[] = [
  {
    image: 'assets/images/extra/card/img-1.jpg',
    overlay: false,
  },
  {
    image: 'assets/images/extra/card/img-2.jpg',
    overlay: true,
  },
  {
    image: 'assets/images/extra/card/img-3.jpg',
    overlay: false,
  },
  {
    image: 'assets/images/extra/card/img-4.jpg',
    overlay: true,
  },
  {
    image: 'assets/images/extra/card/img-5.jpg',
    overlay: false,
  },
  {
    image: 'assets/images/extra/card/img-6.jpg',
    overlay: true,
  },
]

export const comments: CommentType[] = [
  {
    author: 'Martin Luther',
    avatar: 'assets/images/users/avatar-2.jpg',
    time: '30 min ago',
    text: "It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English.",
    replies: [
      {
        author: 'Metrica Author',
        avatar: 'assets/images/logo-sm.png',
        time: '37 min ago',
        text: 'It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. Thank you',
      },
    ],
  },
  {
    author: 'Joseph Rust',
    avatar: 'assets/images/users/avatar-1.jpg',
    time: '40 min ago',
    text: 'Is it a long established fact that a reader will be distracted by the readable content of a page when looking at its layout?',
    replies: [],
  },
  {
    author: 'Matt Rosales',
    avatar: 'assets/images/users/avatar-5.jpg',
    time: '40 min ago',
    text: 'Is it a long established fact that a reader will be distracted by the readable content of a page when looking at its layout?',
    replies: [
      {
        author: 'Metrica Author',
        avatar: 'assets/images/logo-sm.png',
        time: '37 min ago',
        text: 'It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. Thank you',
      },
    ],
  },
]
