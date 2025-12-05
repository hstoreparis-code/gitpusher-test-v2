from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Header, HTTPException

router = APIRouter(prefix="/admin/credits", tags=["admin-credits-mint"])


async def require_super_admin(authorization: Optional[str] = Header(None)) -> dict:
    from server import require_admin

    # require_admin renvoie déjà le document user
    user = await require_admin(authorization, None)
    if not user.get("is_super_admin"):
        raise HTTPException(status_code=403, detail="Super admin access required")
    return user


@router.post("/mint/user")
async def mint_credits_for_user(
    payload: dict,
    authorization: Optional[str] = Header(None),
):
    """Mint des crédits pour un utilisateur spécifique.

    Ce endpoint ne touche pas Stripe. Il crédite directement l'utilisateur
    et enregistre une transaction de type "mint" dans billing_transactions.
    """
    from server import db

    super_admin = await require_super_admin(authorization)
    _ = super_admin

    user_id = payload.get("user_id")
    amount = int(payload.get("amount", 0))
    reason = payload.get("reason") or "super_admin_mint"

    if not user_id or amount <= 0:
        raise HTTPException(status_code=400, detail="user_id and positive amount are required")

    user = await db.users.find_one({"_id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    now = datetime.now(timezone.utc).isoformat()

    # Update credits on user
    await db.users.update_one(
        {"_id": user_id},
        {"$inc": {"credits": amount}, "$set": {"updated_at": now}},
    )

    # Log mint transaction
    from services.credits_service import CreditsService

    credits_service = CreditsService(db)
    await credits_service.add_credits(user_id, amount, transaction_type="mint")

    return {"ok": True, "user_id": user_id, "amount": amount}


@router.post("/mint/all")
async def mint_credits_for_all(
    payload: dict,
    authorization: Optional[str] = Header(None),
):
    """Mint des crédits pour tous les utilisateurs.

    Utilisé uniquement par le super admin pour recharger massivement
    le "système" de crédits.
    """
    from server import db

    super_admin = await require_super_admin(authorization)
    _ = super_admin

    amount = int(payload.get("amount", 0))
    # We keep a reason for auditability of the bulk mint
    reason = payload.get("reason") or "super_admin_mint_all"

    if amount <= 0:
        raise HTTPException(status_code=400, detail="Positive amount is required")

    now = datetime.now(timezone.utc).isoformat()

    # Incrémente les crédits pour tous les users
    await db.users.update_many({}, {"$inc": {"credits": amount}, "$set": {"updated_at": now}})

    # On loggue une entrée agrégée dans billing_transactions pour traçabilité globale
    doc = {
        "_id": f"mint_all_{now}",
        "user_id": "ALL",
        "amount": amount,
        "type": "mint_all",
        "credits": None,
        "created_at": now,
        "reason": reason,
    }
    await db.billing_transactions.insert_one(doc)

    return {"ok": True, "amount": amount}
