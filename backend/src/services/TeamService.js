const db = require('../models');
const { User, Participant } = db;

class TeamService {
  async addParticipantByEmail(walletId, emailToAdd, requesterId) {

    const requesterParticipation = await Participant.findOne({
      where: { walletId, userId: requesterId }
    });

    if (!requesterParticipation || requesterParticipation.role !== 'admin') {
      const error = new Error('Only wallet admins can add new participants.');
      error.statusCode = 403;
      throw error;
    }

    const userToAdd = await User.findOne({ where: { email: emailToAdd } });
    if (!userToAdd) {
      const error = new Error('User to be added not found.');
      error.statusCode = 404;
      throw error;
    }

    const existingParticipant = await Participant.findOne({
      where: { walletId, userId: userToAdd.id }
    });

    if (existingParticipant) {
      const error = new Error('This user is already a participant in this wallet.');
      error.statusCode = 409;
      throw error;
    }

    const newParticipant = await Participant.create({
      userId: userToAdd.id,
      walletId,
      role: 'member',
    });

    return newParticipant;
  }
}

module.exports = new TeamService();