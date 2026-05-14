from fastapi import APIRouter, HTTPException, Query
from database.database import SessionLocal
from database.db_models import HeartPrediction
from sqlalchemy import desc, func
from datetime import datetime, timedelta

router = APIRouter(prefix="/api/history", tags=["History"])


@router.get("/")
def get_all_history(
    disease_type: str = Query(default=None),
    limit: int = Query(default=50, le=200),
    offset: int = Query(default=0)
):
    """Get all prediction history with optional filtering."""
    db = SessionLocal()
    try:
        query = db.query(HeartPrediction).order_by(desc(HeartPrediction.created_at))

        if disease_type and disease_type == "heart":
            pass  # Already querying HeartPrediction

        results = query.offset(offset).limit(limit).all()
        total = query.count()

        history = []
        for r in results:
            history.append({
                "id": r.id,
                "disease_type": "heart",
                "prediction": r.prediction,
                "risk_level": r.risk_level,
                "confidence": round((r.enhanced_risk or r.base_risk or 0) * 100),
                "blood_pressure": r.blood_pressure,
                "cholesterol": r.cholesterol,
                "heart_rate": r.heart_rate,
                "emergency": r.emergency,
                "created_at": r.created_at.isoformat() if r.created_at else None,
            })

        return {"history": history, "total": total}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()


@router.get("/{record_id}")
def get_history_detail(record_id: int):
    """Get single prediction detail."""
    db = SessionLocal()
    try:
        record = db.query(HeartPrediction).filter(HeartPrediction.id == record_id).first()
        if not record:
            raise HTTPException(status_code=404, detail="Record not found")

        return {
            "id": record.id,
            "disease_type": "heart",
            "prediction": record.prediction,
            "risk_level": record.risk_level,
            "base_risk": record.base_risk,
            "enhanced_risk": record.enhanced_risk,
            "confidence": round((record.enhanced_risk or record.base_risk or 0) * 100),
            "blood_pressure": record.blood_pressure,
            "cholesterol": record.cholesterol,
            "glucose": record.glucose,
            "heart_rate": record.heart_rate,
            "smoking": record.smoking,
            "stress_level": record.stress_level,
            "short_breath": record.short_breath,
            "fatigue": record.fatigue,
            "emergency": record.emergency,
            "pain_severity": record.pain_severity,
            "created_at": record.created_at.isoformat() if record.created_at else None,
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()


@router.delete("/{record_id}")
def delete_history(record_id: int):
    """Delete a prediction record."""
    db = SessionLocal()
    try:
        record = db.query(HeartPrediction).filter(HeartPrediction.id == record_id).first()
        if not record:
            raise HTTPException(status_code=404, detail="Record not found")
        db.delete(record)
        db.commit()
        return {"success": True, "message": "Record deleted"}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()


@router.delete("/")
def clear_all_history():
    """Clear all prediction history."""
    db = SessionLocal()
    try:
        count = db.query(HeartPrediction).delete()
        db.commit()
        return {"success": True, "deleted": count}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()
