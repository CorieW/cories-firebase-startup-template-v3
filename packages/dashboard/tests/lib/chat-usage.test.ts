/**
 * Tests shared chat usage sizing and credit-cost helpers.
 */
import { describe, expect, it } from "vitest";
import {
  CHAT_USAGE_CHARACTERS_PER_UNIT,
  getChatMessageCharacterCount,
  getChatUsageUnits,
  getEstimatedChatCreditCost,
  getWalletUsageSnapshot,
  normalizeChatMessage,
  WALLET_CREDIT_COST_SNAPSHOT_PROPERTY,
  WALLET_DEBIT_AMOUNT_SNAPSHOT_PROPERTY,
} from '@/lib/chat-usage';

describe("chat usage helpers", () => {
  it("normalizes chat messages before billing", () => {
    expect(normalizeChatMessage("  Hello there  ")).toBe("Hello there");
    expect(getChatMessageCharacterCount("  Hello there  ")).toBe(11);
  });

  it("tracks usage in 3-character blocks", () => {
    expect(getChatUsageUnits("")).toBe(0);
    expect(getChatUsageUnits("a".repeat(CHAT_USAGE_CHARACTERS_PER_UNIT))).toBe(
      1,
    );
    expect(
      getChatUsageUnits("a".repeat(CHAT_USAGE_CHARACTERS_PER_UNIT + 1)),
    ).toBe(2);
  });

  it("estimates credit cost from the message size", () => {
    expect(getEstimatedChatCreditCost("a".repeat(2), 2)).toBe(2);
    expect(getEstimatedChatCreditCost("a".repeat(7), 2)).toBe(6);
    expect(getEstimatedChatCreditCost("", 2)).toBe(0);
    expect(getEstimatedChatCreditCost("hello", null)).toBeNull();
  });

  it("builds a wallet pricing snapshot for recorded usage", () => {
    expect(getWalletUsageSnapshot(4, 2)).toEqual({
      [WALLET_CREDIT_COST_SNAPSHOT_PROPERTY]: 2,
      [WALLET_DEBIT_AMOUNT_SNAPSHOT_PROPERTY]: 8,
    });
    expect(getWalletUsageSnapshot(4, null)).toBeNull();
  });
});
