import { Server, Socket } from 'socket.io';
import { PollService } from '../services/PollService';
import { StudentService } from '../services/StudentService';
import Vote from '../models/Vote';

const pollService = new PollService();
const studentService = new StudentService();

export const socketHandler = (io: Server): void => {
  io.on('connection', (socket: Socket) => {
    console.log('Client connected:', socket.id);

    // Handle student joining
    socket.on('student:join', async (data: { name: string; studentId?: string }) => {
      try {
        let studentId = data.studentId;
        
        // If studentId provided, verify it exists
        if (studentId) {
          const student = await studentService.getStudentById(studentId);
          if (!student) {
            socket.emit('error', { message: 'Invalid student ID' });
            return;
          }
        } else {
          // Create new student
          const student = await studentService.createStudent(data.name);
          studentId = student.studentId;
          socket.emit('student:registered', { studentId, name: student.name });
        }

        socket.data.studentId = studentId;
        socket.data.role = 'student';

        // Notify teacher about new student
        io.emit('student:joined', { studentId, name: data.name });

        // Send current active poll if exists
        const activePoll = await pollService.getActivePoll();
        if (activePoll) {
          const remainingTime = await pollService.getRemainingTime(activePoll._id.toString());
          socket.emit('poll:active', { poll: activePoll, remainingTime });
        }
      } catch (error: any) {
        socket.emit('error', { message: error.message || 'Failed to join' });
      }
    });

    // Handle teacher joining
    socket.on('teacher:join', () => {
      socket.data.role = 'teacher';
      console.log('Teacher joined:', socket.id);
    });

    // Handle poll creation
    socket.on('poll:create', async (data: { question: string; options: string[]; duration: number }) => {
      try {
        if (socket.data.role !== 'teacher') {
          socket.emit('error', { message: 'Unauthorized' });
          return;
        }

        const poll = await pollService.createPoll(data.question, data.options, data.duration);
        const remainingTime = await pollService.getRemainingTime(poll._id.toString());

        // Broadcast to all clients
        io.emit('poll:created', { poll, remainingTime });
      } catch (error: any) {
        socket.emit('error', { message: error.message || 'Failed to create poll' });
      }
    });

    // Handle vote submission
    socket.on('poll:vote', async (data: { pollId: string; optionIndex: number }) => {
      try {
        const studentId = socket.data.studentId;
        if (!studentId) {
          socket.emit('error', { message: 'Student not registered' });
          return;
        }

        const poll = await pollService.submitVote(data.pollId, studentId, data.optionIndex);
        const remainingTime = await pollService.getRemainingTime(poll._id.toString());

        // Broadcast updated poll to all clients
        io.emit('poll:updated', { poll, remainingTime });
        socket.emit('vote:success', { message: 'Vote submitted successfully' });
      } catch (error: any) {
        socket.emit('error', { message: error.message || 'Failed to submit vote' });
      }
    });

    // Handle poll end
    socket.on('poll:end', async (data: { pollId: string }) => {
      try {
        if (socket.data.role !== 'teacher') {
          socket.emit('error', { message: 'Unauthorized' });
          return;
        }

        const poll = await pollService.endPoll(data.pollId);
        io.emit('poll:ended', { poll });
      } catch (error: any) {
        socket.emit('error', { message: error.message || 'Failed to end poll' });
      }
    });

    // Handle request for current state (for recovery)
    socket.on('state:request', async () => {
      try {
        const activePoll = await pollService.getActivePoll();
        if (activePoll) {
          const remainingTime = await pollService.getRemainingTime(activePoll._id.toString());
          
          if (socket.data.role === 'teacher') {
            socket.emit('state:response', { poll: activePoll, remainingTime, role: 'teacher' });
          } else if (socket.data.studentId) {
            // Check if student has voted
            const hasVoted = await Vote.findOne({
              pollId: activePoll._id,
              studentId: socket.data.studentId,
            });
            
            socket.emit('state:response', {
              poll: activePoll,
              remainingTime,
              role: 'student',
              hasVoted: !!hasVoted,
            });
          }
        } else {
          socket.emit('state:response', { poll: null });
        }
      } catch (error: any) {
        socket.emit('error', { message: error.message || 'Failed to get state' });
      }
    });

    // Handle student removal
    socket.on('student:remove', async (data: { studentId: string }) => {
      try {
        if (socket.data.role !== 'teacher') {
          socket.emit('error', { message: 'Unauthorized' });
          return;
        }

        await studentService.removeStudent(data.studentId);
        io.emit('student:removed', { studentId: data.studentId });
      } catch (error: any) {
        socket.emit('error', { message: error.message || 'Failed to remove student' });
      }
    });

    // Handle chat messages
    socket.on('chat:send', (data: { sender: string; message: string; isTeacher: boolean }) => {
      try {
        const messageData = {
          sender: data.sender,
          message: data.message,
          isTeacher: data.isTeacher,
          timestamp: new Date().toISOString(),
        };

        // Broadcast to all clients
        io.emit('chat:message', messageData);
      } catch (error: any) {
        socket.emit('error', { message: error.message || 'Failed to send message' });
      }
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });
};

