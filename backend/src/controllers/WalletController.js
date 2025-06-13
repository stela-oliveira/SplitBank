const WalletService = require('../services/WalletService');
const { Wallet, Participant } = require('../models'); // Importar Participant para validação

class WalletController {
  async getSummary(req, res, next) {
    try {
      // req.userId é definido pelo middleware de autenticação
      const summary = await WalletService.getUserWalletsSummary(req.userId);
      return res.status(200).json(summary);
    } catch (error) {
      next(error);
    }
  }

  async getWalletDetails(req, res, next) {
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

      const details = await WalletService.getWalletDetails(walletId);
      if (!details) {
        return res.status(404).json({ message: 'Wallet not found.' });
      }
      return res.status(200).json(details);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new WalletController();