from fastapi import APIRouter, Header
from typing import Optional
from datetime import datetime, timezone, timedelta
import os

router = APIRouter(prefix="/admin/stripe")

async def require_admin_auth(authorization: Optional[str] = Header(None)):
    from server import require_admin
    return await require_admin(authorization)

@router.get("/stats")
async def stripe_stats(authorization: Optional[str] = Header(None)):
    await require_admin_auth(authorization)
    
    import stripe
    stripe.api_key = os.environ.get("STRIPE_SECRET_KEY")
    
    try:
        # Get recent charges
        charges = stripe.Charge.list(limit=100)
        
        # Calculate stats
        successful = [c for c in charges.data if c.status == "succeeded"]
        pending = [c for c in charges.data if c.status == "pending"]
        failed = [c for c in charges.data if c.status == "failed"]
        
        total_revenue = sum(c.amount for c in successful) / 100
        
        # Monthly revenue (last 30 days)
        thirty_days_ago = datetime.now(timezone.utc) - timedelta(days=30)
        thirty_days_timestamp = int(thirty_days_ago.timestamp())
        monthly_charges = [c for c in successful if c.created >= thirty_days_timestamp]
        monthly_revenue = sum(c.amount for c in monthly_charges) / 100
        
        average_transaction = total_revenue / len(successful) if successful else 0
        
        # Recent transactions
        recent_transactions = []
        for charge in charges.data[:20]:
            recent_transactions.append({
                "id": charge.id,
                "amount": charge.amount / 100,
                "currency": charge.currency.upper(),
                "status": charge.status,
                "customer_email": charge.billing_details.email if charge.billing_details else None,
                "created": datetime.fromtimestamp(charge.created).isoformat(),
                "description": charge.description
            })
        
        return {
            "stats": {
                "total_revenue": total_revenue,
                "monthly_revenue": monthly_revenue,
                "successful_transactions": len(successful),
                "pending_transactions": len(pending),
                "failed_transactions": len(failed),
                "average_transaction": average_transaction
            },
            "transactions": recent_transactions
        }
    except Exception as e:
        # Fallback to DB data if Stripe fails
        from server import db
        transactions = await db.billing_transactions.find({}, {"_id": 0}).sort("created_at", -1).limit(50).to_list(50)
        
        total = sum(t.get("amount", 0) for t in transactions if t.get("type") == "purchase")
        
        return {
            "stats": {
                "total_revenue": total,
                "monthly_revenue": total,
                "successful_transactions": len([t for t in transactions if t.get("type") == "purchase"]),
                "pending_transactions": 0,
                "failed_transactions": 0,
                "average_transaction": total / len(transactions) if transactions else 0
            },
            "transactions": transactions[:20],
            "source": "database_fallback"
        }
