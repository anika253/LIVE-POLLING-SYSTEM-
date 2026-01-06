import Poll, { IPoll } from '../models/Poll';
import Vote from '../models/Vote';

export class PollService {

  async createPoll(question: string, options: string[], duration: number): Promise<IPoll> {
    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + duration * 1000);

    const pollOptions = options.map((text) => ({ text, votes: 0 }));

    const poll = new Poll({
      question,
      options: pollOptions,
      duration,
      startTime,
      endTime,
      status: 'active',
    });

    // End any existing active polls
    await Poll.updateMany({ status: 'active' }, { status: 'ended' });

    const savedPoll = await poll.save();
    return savedPoll;
  }

  async getActivePoll(): Promise<IPoll | null> {
    return await Poll.findOne({ status: 'active' }).sort({ createdAt: -1 });
  }

  async getPollById(pollId: string): Promise<IPoll | null> {
    return await Poll.findById(pollId);
  }

  async getAllPolls(): Promise<IPoll[]> {
    return await Poll.find().sort({ createdAt: -1 });
  }

  async submitVote(pollId: string, studentId: string, optionIndex: number): Promise<IPoll> {
    const poll = await Poll.findById(pollId);
    if (!poll) {
      throw new Error('Poll not found');
    }

    if (poll.status === 'ended') {
      throw new Error('Poll has ended');
    }

    // Check if student already voted
    const existingVote = await Vote.findOne({ pollId, studentId });
    if (existingVote) {
      throw new Error('Student has already voted');
    }

    // Check if time has expired
    const now = new Date();
    if (now > poll.endTime) {
      poll.status = 'ended';
      await poll.save();
      throw new Error('Poll time has expired');
    }

    // Create vote record
    await Vote.create({
      pollId,
      studentId,
      optionIndex,
    });

    // Update poll vote count
    poll.options[optionIndex].votes += 1;
    await poll.save();

    return poll;
  }

  async endPoll(pollId: string): Promise<IPoll> {
    const poll = await Poll.findById(pollId);
    if (!poll) {
      throw new Error('Poll not found');
    }

    poll.status = 'ended';
    await poll.save();

    return poll;
  }

  async getRemainingTime(pollId: string): Promise<number> {
    const poll = await Poll.findById(pollId);
    if (!poll || poll.status === 'ended') {
      return 0;
    }

    const now = new Date();
    const remaining = Math.max(0, Math.floor((poll.endTime.getTime() - now.getTime()) / 1000));
    
    if (remaining === 0) {
      poll.status = 'ended';
      await poll.save();
    }

    return remaining;
  }

  async canCreateNewPoll(): Promise<boolean> {
    const activePoll = await this.getActivePoll();
    if (!activePoll) {
      return true;
    }

    // Check if all students have answered (this would require checking votes vs active students)
    // For now, we'll allow creating a new poll if the current one has ended
    return activePoll.status === 'ended';
  }
}

