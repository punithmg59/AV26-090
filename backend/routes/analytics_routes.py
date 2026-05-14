from fastapi import APIRouter, HTTPException
from database.database import SessionLocal
from database.db_models import HeartPrediction
from sqlalchemy import func, desc
from datetime import datetime, timedelta

router = APIRouter(prefix="/api/analytics", tags=["Analytics"])


@router.get("/summary")
def get_analytics_summary():
    """Get overall analytics summary."""
    db = SessionLocal()
    try:
        total = db.query(HeartPrediction).count()
        high_risk = db.query(HeartPrediction).filter(HeartPrediction.risk_level == "HIGH RISK").count()
        moderate_risk = db.query(HeartPrediction).filter(HeartPrediction.risk_level == "MODERATE RISK").count()
        low_risk = db.query(HeartPrediction).filter(HeartPrediction.risk_level == "LOW RISK").count()
        emergencies = db.query(HeartPrediction).filter(HeartPrediction.emergency == True).count()

        avg_risk = db.query(func.avg(HeartPrediction.enhanced_risk)).scalar() or 0
        avg_bp = db.query(func.avg(HeartPrediction.blood_pressure)).scalar() or 0
        avg_chol = db.query(func.avg(HeartPrediction.cholesterol)).scalar() or 0
        avg_hr = db.query(func.avg(HeartPrediction.heart_rate)).scalar() or 0

        return {
            "total_predictions": total,
            "risk_distribution": {
                "high": high_risk,
                "moderate": moderate_risk,
                "low": low_risk,
            },
            "emergencies": emergencies,
            "averages": {
                "risk_score": round(float(avg_risk) * 100, 1),
                "blood_pressure": round(float(avg_bp), 1),
                "cholesterol": round(float(avg_chol), 1),
                "heart_rate": round(float(avg_hr), 1),
            },
            "disease_types": {
                "heart": total,
                "brain_tumor": 0,
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()


@router.get("/recent")
def get_recent_predictions(limit: int = 10):
    """Get recent predictions for dashboard."""
    db = SessionLocal()
    try:
        results = (
            db.query(HeartPrediction)
            .order_by(desc(HeartPrediction.created_at))
            .limit(limit)
            .all()
        )

        recent = []
        for r in results:
            recent.append({
                "id": r.id,
                "disease_type": "heart",
                "risk_level": r.risk_level,
                "confidence": round((r.enhanced_risk or r.base_risk or 0) * 100),
                "emergency": r.emergency,
                "created_at": r.created_at.isoformat() if r.created_at else None,
            })

        return {"recent": recent}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()


@router.get("/trends")
def get_prediction_trends():
    """Get prediction trends over time."""
    db = SessionLocal()
    try:
        # Get predictions from last 30 days grouped by date
        thirty_days_ago = datetime.utcnow() - timedelta(days=30)
        results = (
            db.query(
                func.date(HeartPrediction.created_at).label("date"),
                func.count().label("count"),
                func.avg(HeartPrediction.enhanced_risk).label("avg_risk"),
            )
            .filter(HeartPrediction.created_at >= thirty_days_ago)
            .group_by(func.date(HeartPrediction.created_at))
            .order_by(func.date(HeartPrediction.created_at))
            .all()
        )

        trends = []
        for r in results:
            trends.append({
                "date": str(r.date) if r.date else None,
                "count": r.count,
                "avg_risk": round(float(r.avg_risk or 0) * 100, 1),
            })

        return {"trends": trends}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()
