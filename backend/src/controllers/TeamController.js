const WalletService = require('../services/WalletService');
const { Wallet, Participant } = require('../models');
const TeamService = require('../services/TeamService');

class TeamController {
  async getTeamSummary(req, res, next) {
    try {
      const { walletId } = req.params;
      const userId = req.userId;

      const isParticipant = await Participant.findOne({
        where: { walletId: walletId, userId: userId }
      });

      if (!isParticipant) {
        return res.status(403).json({ message: 'User is not a participant of this wallet.' });
      }

      const teamData = await WalletService.getTeamSummary(walletId);
      if (!teamData) {
        return res.status(404).json({ message: 'Team or wallet not found.' });
      }
      return res.status(200).json(teamData);
    } catch (error) {
      next(error);
    }
  }
  async addParticipant(req, res, next) {
    try {
      const { walletId } = req.params;
      const { email } = req.body;
      const requesterId = req.userId;

      if (!email) {
        return res.status(400).json({ message: 'Participant email is required.' });
      }
      const newParticipant = await TeamService.addParticipantByEmail(walletId, email, requesterId);

      return res.status(201).json({ message: 'Participant added successfully.', participant: newParticipant });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new TeamController();