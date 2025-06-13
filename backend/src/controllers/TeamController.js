const WalletService = require('../services/WalletService');
const { Wallet, Participant } = require('../models');

class TeamController {
  async getTeamSummary(req, res, next) {
    try {
      const { walletId } = req.params;
      const userId = req.userId;

      // Verifique se o usuário é participante da carteira
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
}

module.exports = new TeamController();