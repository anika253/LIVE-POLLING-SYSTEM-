export interface PollOption {
  text: string;
  votes: number;
}

export interface Poll {
  _id: string;
  question: string;
  options: PollOption[];
  duration: number;
  startTime: string;
  endTime: string;
  status: 'active' | 'ended';
  createdAt: string;
  updatedAt: string;
}

export interface PollState {
  poll: Poll | null;
  remainingTime: number;
  hasVoted?: boolean;
}

