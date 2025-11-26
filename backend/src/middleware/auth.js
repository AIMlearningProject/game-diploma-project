import prisma from '../services/prisma.js';

export const authenticate = async (request, reply) => {
  try {
    await request.jwtVerify();
  } catch (err) {
    reply.status(401).send({ error: 'Unauthorized', message: 'Invalid or missing token' });
  }
};

export const requireRole = (roles) => {
  return async (request, reply) => {
    await authenticate(request, reply);

    if (!roles.includes(request.user.role)) {
      reply.status(403).send({ error: 'Forbidden', message: 'Insufficient permissions' });
    }
  };
};

export const canAccessStudent = async (request, reply) => {
  await authenticate(request, reply);

  const studentId = request.params.id || request.params.studentId;
  const user = request.user;

  // Admins can access anyone
  if (user.role === 'ADMIN') return;

  // Students can only access their own data
  if (user.role === 'STUDENT') {
    if (user.id !== studentId) {
      reply.status(403).send({ error: 'Forbidden', message: 'Cannot access other students data' });
    }
    return;
  }

  // Teachers can access students in their classes
  if (user.role === 'TEACHER') {
    const student = await prisma.studentProfile.findUnique({
      where: { studentId },
      include: { class: true },
    });

    if (!student || student.class.teacherId !== user.id) {
      reply.status(403).send({ error: 'Forbidden', message: 'Student not in your class' });
    }
    return;
  }

  reply.status(403).send({ error: 'Forbidden' });
};
