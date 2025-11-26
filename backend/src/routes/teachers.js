import prisma from '../services/prisma.js';
import { requireRole } from '../middleware/auth.js';

export default async function teacherRoutes(fastify, options) {
  // Get class overview
  fastify.get('/:id/class-overview', {
    preHandler: requireRole(['TEACHER', 'ADMIN']),
  }, async (request, reply) => {
    const { id } = request.params;
    const { classId } = request.query;

    if (!classId) {
      return reply.status(400).send({ error: 'classId query parameter required' });
    }

    // Verify teacher owns this class
    const teacherClass = await prisma.class.findFirst({
      where: {
        id: classId,
        teacherId: id,
      },
      include: {
        students: {
          include: {
            student: {
              include: {
                gameState: true,
              },
            },
          },
        },
      },
    });

    if (!teacherClass) {
      return reply.status(404).send({ error: 'Class not found or not authorized' });
    }

    // Get reading logs for all students in class
    const studentIds = teacherClass.students.map(s => s.studentId);

    const readingLogs = await prisma.readingLog.findMany({
      where: {
        studentId: { in: studentIds },
      },
      include: {
        book: true,
        student: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    // Calculate class statistics
    const totalBooksRead = await prisma.readingLog.count({
      where: {
        studentId: { in: studentIds },
        verifiedByTeacher: true,
      },
    });

    const activeStudents = teacherClass.students.filter(s => {
      const lastActive = new Date(s.lastActive);
      const daysSinceActive = (Date.now() - lastActive) / (1000 * 60 * 60 * 24);
      return daysSinceActive <= 14;
    }).length;

    return {
      class: {
        id: teacherClass.id,
        name: teacherClass.name,
        gradeLevel: teacherClass.gradeLevel,
        studentCount: teacherClass.students.length,
      },
      students: teacherClass.students.map(s => ({
        id: s.student.id,
        name: s.student.name,
        avatar: s.avatar,
        gameState: s.student.gameState,
        lastActive: s.lastActive,
      })),
      recentActivity: readingLogs.slice(0, 10),
      statistics: {
        totalBooksRead,
        activeStudents,
        inactiveStudents: teacherClass.students.length - activeStudents,
      },
    };
  });

  // Verify reading log
  fastify.post('/:id/verify-log', {
    preHandler: requireRole(['TEACHER', 'ADMIN']),
  }, async (request, reply) => {
    const { id } = request.params;
    const { logId, verified } = request.body;

    if (!logId || verified === undefined) {
      return reply.status(400).send({ error: 'logId and verified required' });
    }

    // Get log and verify teacher has access to this student
    const log = await prisma.readingLog.findUnique({
      where: { id: logId },
      include: {
        student: {
          include: {
            studentProfile: {
              include: {
                class: true,
              },
            },
          },
        },
      },
    });

    if (!log) {
      return reply.status(404).send({ error: 'Reading log not found' });
    }

    if (log.student.studentProfile.class.teacherId !== id && request.user.role !== 'ADMIN') {
      return reply.status(403).send({ error: 'Not authorized to verify this log' });
    }

    // Update log
    const updatedLog = await prisma.readingLog.update({
      where: { id: logId },
      data: {
        verifiedByTeacher: verified,
        teacherVerifiedAt: verified ? new Date() : null,
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        actorId: id,
        action: verified ? 'VERIFY_READING_LOG' : 'UNVERIFY_READING_LOG',
        target: `ReadingLog:${logId}`,
        metadataJson: JSON.stringify({
          studentId: log.studentId,
          bookId: log.bookId,
        }),
      },
    });

    return updatedLog;
  });

  // Get students needing attention (inactive, low progress)
  fastify.get('/:id/alerts', {
    preHandler: requireRole(['TEACHER', 'ADMIN']),
  }, async (request, reply) => {
    const { id } = request.params;

    // Get all classes for this teacher
    const classes = await prisma.class.findMany({
      where: { teacherId: id },
      include: {
        students: {
          include: {
            student: {
              include: {
                gameState: true,
              },
            },
          },
        },
      },
    });

    const alerts = [];

    for (const teacherClass of classes) {
      for (const studentProfile of teacherClass.students) {
        const lastActive = new Date(studentProfile.lastActive);
        const daysSinceActive = (Date.now() - lastActive) / (1000 * 60 * 60 * 24);

        // Alert for inactivity
        if (daysSinceActive > 14) {
          alerts.push({
            type: 'INACTIVE',
            severity: daysSinceActive > 30 ? 'high' : 'medium',
            student: {
              id: studentProfile.student.id,
              name: studentProfile.student.name,
            },
            message: `No activity for ${Math.floor(daysSinceActive)} days`,
            classId: teacherClass.id,
            className: teacherClass.name,
          });
        }

        // Alert for low streak
        if (studentProfile.student.gameState && studentProfile.student.gameState.streak === 0) {
          const recentLogs = await prisma.readingLog.count({
            where: {
              studentId: studentProfile.studentId,
              createdAt: {
                gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
              },
            },
          });

          if (recentLogs === 0) {
            alerts.push({
              type: 'LOW_ENGAGEMENT',
              severity: 'medium',
              student: {
                id: studentProfile.student.id,
                name: studentProfile.student.name,
              },
              message: 'No books logged in the past week',
              classId: teacherClass.id,
              className: teacherClass.name,
            });
          }
        }
      }
    }

    return {
      alerts,
      summary: {
        total: alerts.length,
        high: alerts.filter(a => a.severity === 'high').length,
        medium: alerts.filter(a => a.severity === 'medium').length,
      },
    };
  });

  // Create class challenge
  fastify.post('/:id/challenge', {
    preHandler: requireRole(['TEACHER', 'ADMIN']),
  }, async (request, reply) => {
    const { id } = request.params;
    const { classId, name, description, targetBooks, startDate, endDate } = request.body;

    if (!classId || !name || !targetBooks || !startDate || !endDate) {
      return reply.status(400).send({ error: 'Missing required fields' });
    }

    // Verify teacher owns this class
    const teacherClass = await prisma.class.findFirst({
      where: {
        id: classId,
        teacherId: id,
      },
    });

    if (!teacherClass) {
      return reply.status(403).send({ error: 'Not authorized for this class' });
    }

    const challenge = await prisma.classChallenge.create({
      data: {
        classId,
        name,
        description,
        targetBooks: parseInt(targetBooks),
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        isActive: true,
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        actorId: id,
        action: 'CREATE_CHALLENGE',
        target: `ClassChallenge:${challenge.id}`,
        metadataJson: JSON.stringify({
          classId,
          name,
          targetBooks,
        }),
      },
    });

    return challenge;
  });
}
