/**
 * Shared chat usage constants and size-based billing helpers.
 */
export const CHAT_FEATURE_ID = "chat_messages";
export const WALLET_FEATURE_ID = "usd_credits";
export const MAX_CHAT_MESSAGE_LENGTH = 500;
export const CHAT_USAGE_CHARACTERS_PER_UNIT = 3;
export const WALLET_CREDIT_COST_SNAPSHOT_PROPERTY = "walletCreditCostSnapshot";
export const WALLET_DEBIT_AMOUNT_SNAPSHOT_PROPERTY = "walletDebitAmountSnapshot";

export function normalizeChatMessage(message: string): string {
  return message.trim();
}

export function getChatMessageCharacterCount(message: string): number {
  return Array.from(normalizeChatMessage(message)).length;
}

/**
 * Converts a draft into Autumn usage units using 3-character blocks.
 */
export function getChatUsageUnits(message: string): number {
  const characterCount = getChatMessageCharacterCount(message);

  if (characterCount === 0) {
    return 0;
  }

  return Math.ceil(characterCount / CHAT_USAGE_CHARACTERS_PER_UNIT);
}

export function getEstimatedChatCreditCost(
  message: string,
  creditCost: number | null | undefined,
): number | null {
  if (
    typeof creditCost !== "number" ||
    !Number.isFinite(creditCost) ||
    creditCost <= 0
  ) {
    return null;
  }

  return getChatUsageUnits(message) * creditCost;
}

export function getWalletUsageSnapshot(
  usageUnits: number,
  creditCost: number | null | undefined,
) {
  if (
    typeof creditCost !== "number" ||
    !Number.isFinite(creditCost) ||
    creditCost <= 0
  ) {
    return null;
  }

  return {
    [WALLET_CREDIT_COST_SNAPSHOT_PROPERTY]: creditCost,
    [WALLET_DEBIT_AMOUNT_SNAPSHOT_PROPERTY]: usageUnits * creditCost,
  };
}
