from fastapi import APIRouter, HTTPException
from models.schemas import (
    BillingCreditsResponse,
    BillingPurchaseRequest,
    BillingPurchaseResponse,
    BillingTransaction
)

router = APIRouter(prefix="/billing", tags=["billing"])


@router.get("/credits", response_model=BillingCreditsResponse)
async def get_credits(credits_service=None, user_id: str = None):
    """
    Get user's credit balance.
    """
    credits = await credits_service.get_user_credits(user_id)
    return BillingCreditsResponse(credits=credits, currency="EUR")


@router.post("/purchase", response_model=BillingPurchaseResponse)
async def purchase_credits(payload: BillingPurchaseRequest, credits_service=None, user_id: str = None):
    """
    Create a Stripe checkout session (mocked for MVP).
    """
    try:
        result = await credits_service.create_checkout_session(user_id, payload.packId)
        return BillingPurchaseResponse(
            checkoutUrl=result["checkoutUrl"],
            sessionId=result["sessionId"]
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/history")
async def get_billing_history(credits_service=None, user_id: str = None):
    """
    Get user's billing transaction history.
    """
    transactions = await credits_service.get_transactions(user_id, limit=50)
    return {"transactions": transactions}


@router.post("/webhook/stripe")
async def stripe_webhook(payload: dict, credits_service=None, db=None):
    """
    Stripe webhook handler (mocked for MVP).
    In production, verify webhook signature.
    """
    # Mock implementation - just complete the checkout
    session_id = payload.get("sessionId")
    if session_id:
        await credits_service.complete_checkout(session_id)
    
    return {"ok": True}
