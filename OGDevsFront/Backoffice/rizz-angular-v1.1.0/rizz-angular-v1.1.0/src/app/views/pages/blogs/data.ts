import { currentYear } from '@/app/common/constants'

export type BlogDataType = {
  category: string
  date: string
  image: string
  title: string
  content: string
  author: {
    name: string
    avatar: string
  }
}
export const blogData: BlogDataType[] = [
  {
    category: 'Finance',
    date: '15 Sep' + currentYear,
    image: 'assets/images/extra/card/img-1.jpg',
    title: 'How does cancer grow and spread?',
    content:
      'It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout.',
    author: {
      name: 'Billy Pearson',
      avatar: 'assets/images/users/avatar-10.jpg',
    },
  },
  {
    category: 'Food',
    date: '31 Dec 2023',
    image: 'assets/images/extra/card/img-2.jpg',
    title: 'Where does psoriasis usually start?',
    content:
      'The standard chunk of Lorem Ipsum used since the 1500s is reproduced below for those interested. Cum sociis natoque penatibus et magnis.',
    author: {
      name: 'Harry Simpson',
      avatar: 'assets/images/users/avatar-9.jpg',
    },
  },
  {
    category: 'Health',
    date: '18 Oct' + currentYear,
    image: 'assets/images/extra/card/img-3.jpg',
    title: 'What Can Yoga Do for Migraine Relief?',
    content:
      'When an unknown printer took a galley of type and scrambled generator on the Internet it to make a type specimen book.',
    author: {
      name: 'Larry Wells',
      avatar: 'assets/images/users/avatar-8.jpg',
    },
  },
  {
    category: 'Nature',
    date: '12 Feb' + currentYear,
    image: 'assets/images/extra/card/img-4.jpg',
    title: 'How Long Do Migraine Attacks Last? What to Expect',
    content:
      'It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout.',
    author: {
      name: 'Steven Warner',
      avatar: 'assets/images/users/avatar-7.jpg',
    },
  },
  {
    category: 'Economic',
    date: '26 Jun' + currentYear,
    image: 'assets/images/extra/card/img-5.jpg',
    title: 'Your 5-Minute Read on Beating Stress',
    content:
      'Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature.',
    author: {
      name: 'Morgan Smith',
      avatar: 'assets/images/users/avatar-6.jpg',
    },
  },
  {
    category: 'Fashion',
    date: '01 Aug' + currentYear,
    image: 'assets/images/extra/card/img-6.jpg',
    title: 'World Oral Health Day 2023',
    content:
      'There are many variations of passages of Lorem Ipsum available, but the majority web page editors now have suffered',
    author: {
      name: 'Cecil Herbert',
      avatar: 'assets/images/users/avatar-2.jpg',
    },
  },
]
