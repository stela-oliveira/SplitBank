// Este serviço conteria a lógica complexa para calcular a divisão de despesas,
// o que cada participante deve, o que já pagou, etc.
// Por enquanto, é um placeholder.

class ExpenseCalculationService {
  // Calcula as divisões da despesa
  async calculateSplit(expense, participants) {
    // Exemplo simples: dividir igualmente
    const amountPerParticipant = expense.amount / participants.length;
    return participants.map(p => ({
      userId: p.userId,
      amountOwed: amountPerParticipant,
      isPaid: false
    }));
  }

  // Outras lógicas como:
  // - Recalcular saldos da carteira
  // - Gerar notificações de dívida
  // - Lógica de reembolso
}

module.exports = new ExpenseCalculationService();