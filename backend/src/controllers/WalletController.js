const WalletService = require('../services/WalletService');
const { Wallet, Participant } = require('../models');

class WalletController {
  async createWallet(req, res, next) {
    try {
      const { name, description } = req.body;
      const ownerId = req.userId; // ID do usuário logado (do token)

      if (!name) {
        return res.status(400).json({ message: 'Wallet name is required.' });
      }

      const newWallet = await WalletService.createWallet(name, description, ownerId);

      return res.status(201).json(newWallet);
    } catch (error) {
      next(error);
    }
  }

  async getSummary(req, res, next) {
    try {
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