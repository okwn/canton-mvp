/**
 * Deal lifecycle domain service.
 */

import {
  swapLegs,
  composeSettlement,
  isSettlementBalanced,
} from "@canton-mvp/token-standard";
import type { Deal, ExchangeLeg, PreSettlementCheck, LegApproval, SettlementInstruction } from "../domain/models.js";
import { canTransition, getTargetState, type DealEvent } from "../domain/state-machine.js";
import type { ISwapEngineStore } from "../persistence/ISwapEngineStore.js";
import type { ISwapEngineEventEmitter } from "../events/SwapEngineEvents.js";

function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
}

/** Build settlement from requester-give and counterparty-give legs. */
function createSettlementFromLegs(requesterGive: ExchangeLeg, counterpartyGive: ExchangeLeg) {
  const legs = swapLegs(
    requesterGive.party,
    requesterGive.instrumentId,
    requesterGive.amount,
    counterpartyGive.party,
    counterpartyGive.instrumentId,
    counterpartyGive.amount
  );
  return composeSettlement(legs);
}

export class DealService {
  constructor(
    private readonly store: ISwapEngineStore,
    private readonly events?: ISwapEngineEventEmitter
  ) {}

  async createDealFromAcceptance(
    requestId: string,
    responseId: string,
    decisionId: string,
    giveLeg: ExchangeLeg,
    receiveLeg: ExchangeLeg,
    validUntil?: number
  ): Promise<Deal> {
    const now = Date.now();
    const deal: Deal = {
      id: generateId("deal"),
      state: "accepted",
      requestId,
      responseId,
      decisionId,
      giveLeg,
      receiveLeg,
      ...(validUntil !== undefined && { validUntil }),
      metadata: {},
      createdAt: now,
      updatedAt: now,
    };
    await this.store.saveDeal(deal);
    this.events?.emit("deal_state_changed", { deal, event: "accepted" });
    return deal;
  }

  async transition(dealId: string, event: DealEvent): Promise<Deal> {
    const deal = await this.store.getDeal(dealId);
    if (!deal) throw new Error(`Deal not found: ${dealId}`);
    if (!canTransition(deal.state, event)) {
      throw new Error(`Invalid transition: ${deal.state} -> ${event}`);
    }

    const targetState = getTargetState(event);
    if (!targetState) throw new Error(`No target state for event: ${event}`);

    const updated: Deal = {
      ...deal,
      state: targetState,
      updatedAt: Date.now(),
    };
    await this.store.updateDeal(updated);
    this.events?.emit("deal_state_changed", { deal: updated, event });

    if (event === "cancel") this.events?.emit("deal_cancelled", { deal: updated });
    if (event === "expire") this.events?.emit("deal_expired", { deal: updated });
    if (event === "settlement_confirmed") this.events?.emit("settlement_confirmed", { dealId });

    return updated;
  }

  async recordPreSettlementCheck(
    dealId: string,
    checkType: PreSettlementCheck["checkType"],
    passed: boolean,
    details?: string
  ): Promise<PreSettlementCheck> {
    const deal = await this.store.getDeal(dealId);
    if (!deal) throw new Error(`Deal not found: ${dealId}`);

    const check: PreSettlementCheck = {
      id: generateId("psc"),
      dealId,
      checkType,
      passed,
      ...(details !== undefined && { details }),
      createdAt: Date.now(),
    };
    await this.store.savePreSettlementCheck(check);
    this.events?.emit("pre_settlement_check", { check });
    return check;
  }

  async recordLegApproval(
    dealId: string,
    legId: string,
    party: string,
    status: LegApproval["status"],
    approvalId?: string
  ): Promise<LegApproval> {
    const approval: LegApproval = {
      dealId,
      legId,
      party,
      status,
      ...(approvalId !== undefined && { approvalId }),
      createdAt: Date.now(),
    };
    await this.store.saveLegApproval(approval);
    this.events?.emit("leg_approval", { approval });
    return approval;
  }

  async createSettlementInstruction(dealId: string): Promise<SettlementInstruction> {
    const deal = await this.store.getDeal(dealId);
    if (!deal) throw new Error(`Deal not found: ${dealId}`);

    const checks = await this.store.getPreSettlementChecks(dealId);
    const approvals = await this.store.getLegApprovals(dealId);

    const checksPassed = checks.length > 0 && checks.every((c) => c.passed);
    const approvalsComplete =
      approvals.length >= 2 &&
      approvals.every((a) => a.status === "approved");

    const settlement = createSettlementFromLegs(deal.giveLeg, deal.receiveLeg);
    if (!isSettlementBalanced(settlement)) {
      throw new Error("Settlement legs are not balanced");
    }

    const instruction: SettlementInstruction = {
      id: generateId("si"),
      dealId,
      settlement: { ...settlement, settlementId: dealId },
      checksPassed,
      approvalsComplete,
      createdAt: Date.now(),
    };
    await this.store.saveSettlementInstruction(instruction);
    await this.store.updateDeal({
      ...deal,
      settlementInstructionId: instruction.id,
      state: "settlement_ready",
      updatedAt: Date.now(),
    });
    this.events?.emit("settlement_instruction_created", { instruction });
    return instruction;
  }

  async cancelDeal(dealId: string): Promise<Deal> {
    return this.transition(dealId, "cancel");
  }

  async expireDeal(dealId: string): Promise<Deal> {
    return this.transition(dealId, "expire");
  }
}
