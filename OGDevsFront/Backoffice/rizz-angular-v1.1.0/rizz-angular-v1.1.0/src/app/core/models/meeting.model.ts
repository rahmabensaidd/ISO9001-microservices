export interface Meeting {
  meetingid: number;
  meetingStatus: string;
  meetingDate?: string;
  meetingTime?: string;
  meetingDuration: number;
  meetingLink: string;
  password?: string;
  client: UserEntity;
}

export interface UserEntity {
  id: string;
  username: string;
  email: string;
  enabled: boolean;
  firstName?: string;
  lastName?: string;
}

export interface MeetingRequest {
  title: string;
  date: string;
  time: string;
  duration: number;
  password?: string;
  clientId: string;
}
