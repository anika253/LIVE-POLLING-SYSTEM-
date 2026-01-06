import Student, { IStudent } from '../models/Student';
import { v4 as uuidv4 } from 'uuid';

export class StudentService {
  async createStudent(name: string): Promise<IStudent> {
    const studentId = uuidv4();
    const student = new Student({
      studentId,
      name,
      isActive: true,
    });

    return await student.save();
  }

  async getStudentById(studentId: string): Promise<IStudent | null> {
    return await Student.findOne({ studentId, isActive: true });
  }

  async removeStudent(studentId: string): Promise<void> {
    await Student.updateOne({ studentId }, { isActive: false });
  }

  async getAllActiveStudents(): Promise<IStudent[]> {
    return await Student.find({ isActive: true });
  }
}

