import express from 'express';
import { PollController } from '../controllers/PollController';

const router = express.Router();
const pollController = new PollController();

router.post('/', pollController.createPoll);
router.get('/active', pollController.getActivePoll);
router.get('/history', pollController.getAllPolls);
router.get('/:id', pollController.getPollById);
router.post('/:id/end', pollController.endPoll);

export default router;

