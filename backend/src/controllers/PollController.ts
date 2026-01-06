import { Request, Response } from 'express';
import { PollService } from '../services/PollService';

export class PollController {
  private pollService: PollService;

  constructor() {
    this.pollService = new PollService();
  }

  createPoll = async (req: Request, res: Response): Promise<void> => {
    try {
      const { question, options, duration } = req.body;

      if (!question || !options || !Array.isArray(options) || options.length === 0) {
        res.status(400).json({ error: 'Question and options are required' });
        return;
      }

      if (!duration || duration <= 0 || duration > 60) {
        res.status(400).json({ error: 'Duration must be between 1 and 60 seconds' });
        return;
      }

      const canCreate = await this.pollService.canCreateNewPoll();
      if (!canCreate) {
        res.status(400).json({ error: 'Cannot create new poll. Previous poll is still active.' });
        return;
      }

      const poll = await this.pollService.createPoll(question, options, duration);
      res.status(201).json(poll);
    } catch (error: any) {
      console.error('Error creating poll:', error);
      res.status(500).json({ error: error.message || 'Failed to create poll' });
    }
  };

  getActivePoll = async (req: Request, res: Response): Promise<void> => {
    try {
      const poll = await this.pollService.getActivePoll();
      if (!poll) {
        res.status(404).json({ error: 'No active poll found' });
        return;
      }

      const remainingTime = await this.pollService.getRemainingTime(poll._id.toString());
      res.json({ poll, remainingTime });
    } catch (error: any) {
      console.error('Error getting active poll:', error);
      res.status(500).json({ error: error.message || 'Failed to get active poll' });
    }
  };

  getAllPolls = async (req: Request, res: Response): Promise<void> => {
    try {
      const polls = await this.pollService.getAllPolls();
      res.json(polls);
    } catch (error: any) {
      console.error('Error getting polls:', error);
      res.status(500).json({ error: error.message || 'Failed to get polls' });
    }
  };

  getPollById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const poll = await this.pollService.getPollById(id);
      
      if (!poll) {
        res.status(404).json({ error: 'Poll not found' });
        return;
      }

      const remainingTime = await this.pollService.getRemainingTime(id);
      res.json({ poll, remainingTime });
    } catch (error: any) {
      console.error('Error getting poll:', error);
      res.status(500).json({ error: error.message || 'Failed to get poll' });
    }
  };

  endPoll = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const poll = await this.pollService.endPoll(id);
      res.json(poll);
    } catch (error: any) {
      console.error('Error ending poll:', error);
      res.status(500).json({ error: error.message || 'Failed to end poll' });
    }
  };
}

