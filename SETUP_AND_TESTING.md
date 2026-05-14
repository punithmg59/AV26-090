# Multimodal Healthcare AI System - Setup & Testing Guide

## Installation & Setup

### 1. Install Backend Dependencies

```bash
cd backend
pip install -r requirements.txt
```

**Key packages added:**
- `paddleocr==2.7.0.3` - OCR for medical documents
- `pdf2image==1.16.3` - PDF to image conversion
- `pillow==10.1.0` - Image processing
- `python-multipart==0.0.6` - Multipart form-data support

### 2. Verify PaddleOCR Installation

```bash
python -c "from paddleocr import PaddleOCR; ocr = PaddleOCR(use_angle_cls=True, lang='en'); print('OCR Ready!')"
```

### 3. Create Upload Directory

```bash
mkdir -p uploads/medical_documents
```

### 4. Update Backend App

Ensure `uploads/medical_documents` directory is created on startup (already handled in route).

## Testing the System

### Test 1: Frontend Document Uploader

1. Navigate to RiskAssessment page
2. Scroll to "Upload Medical Reports" section
3. Test drag & drop functionality
4. Test file selection via click
5. Verify file previews appear
6. Test file removal
7. Verify file size validation (>10MB should be rejected)
8. Verify unsupported file types are rejected

### Test 2: Form Data + Documents Submission

```bash
# Start backend
cd backend
uvicorn app:app --reload

# Start frontend
cd frontend
npm run dev
```

1. Fill health information form
2. Select pain areas on 3D body
3. Upload medical document (PDF or image)
4. Click "Predict Disease"
5. Verify submission sends multipart/form-data

### Test 3: Backend Processing

Use curl to test the multimodal endpoint:

```bash
curl -X POST "http://127.0.0.1:8000/predict-heart-multimodal" \
  -F "age=45" \
  -F "sex=1" \
  -F "cp=2" \
  -F "trestbps=140" \
  -F "chol=250" \
  -F "fbs=1" \
  -F "thalach=120" \
  -F "exang=1" \
  -F "smoking=1" \
  -F "stress_level=8" \
  -F "short_breath=1" \
  -F "fatigue=1" \
  -F "chest_location=1" \
  -F "left_arm_pain=1" \
  -F "pain_severity=3" \
  -F "pain_areas=[\"chest\",\"left_arm\"]" \
  -F "documents=@sample_report.pdf"
```

### Test 4: OCR Extraction

Test OCR on a medical document:

```python
from services.ocr_service import extract_medical_values, extract_all_text_with_medical_values

# Test image OCR
values = extract_medical_values("path/to/medical_image.jpg")
print("Extracted values:", values)

# Test text + values
text, values = extract_all_text_with_medical_values("path/to/document.pdf")
print("Extracted text:", text[:200])
print("Medical values:", values)
```

### Test 5: Data Integration

Test medical data extraction:

```python
from services.medical_data_extraction import get_medical_data_extractor

extractor = get_medical_data_extractor()

form_data = {
    'age': 45,
    'sex': 1,
    'trestbps': 140,
    'chol': 250,
    # ... other fields
}

pain_areas = ['chest', 'left_arm']

ocr_values = {
    'chol': 260,
    'trestbps': 145,
    'glucose': 130,
    'abnormalities': ['ST depression'],
    'ecg_findings': ['Abnormal ECG']
}

combined = extractor.combine_data_sources(form_data, pain_areas, ocr_values)
print("Combined data:", combined)
print("ML features:", combined['ml_features'])
print("Risk assessment:", combined['summary'])
```

## API Response Structure

### Success Response (200 OK)

```json
{
  "success": true,
  "prediction": 1,
  "risk_level": "HIGH RISK",
  "base_risk": 0.68,
  "enhanced_risk": 0.82,
  "reasons": [
    "High cholesterol (form)",
    "High cholesterol (OCR)",
    "Chest pain symptoms",
    "Left arm pain",
    "ST Depression"
  ],
  "recommendation": "Consult a cardiologist immediately...",
  "emergency": true,
  "gemini_report": {...},
  "documents_processed": {
    "count": 1,
    "files": ["blood_report.pdf"]
  },
  "ocr_findings": {
    "cholesterol": 260,
    "glucose": 130,
    "blood_pressure": "145/85",
    "heart_rate": 105,
    "abnormalities": ["ST depression"],
    "ecg_findings": ["Abnormal ECG"]
  },
  "combined_analysis": {
    "risk_flags": [...],
    "data_completeness": {...},
    "pain_analysis": {...}
  },
  "ml_features": {...}
}
```

## Troubleshooting

### Issue: PaddleOCR not installing

**Solution**: Install system dependencies
```bash
# On Ubuntu/Debian
sudo apt-get install python3-dev libopenblas-dev

# On macOS
brew install openblas

# Then retry
pip install paddleocr
```

### Issue: PDF processing fails

**Solution**: Install system dependency
```bash
# On Ubuntu/Debian
sudo apt-get install poppler-utils

# On macOS
brew install poppler
```

### Issue: File size errors

**Solution**: Files are limited to 10MB. Check the file or split into smaller parts.

### Issue: OCR returns empty results

**Solution**: Ensure document image quality is good. OCR performs better on:
- Clear, high-contrast images
- Straight, not rotated documents
- Higher resolution (300+ DPI)
- Text-heavy documents

### Issue: Medical values not extracting

**Solution**: OCR extraction uses regex patterns. Ensure document contains:
- Clear field labels (e.g., "Cholesterol:", "BP:", etc.)
- Numeric values immediately after labels
- Standard measurement units

## Sample Medical Documents for Testing

Create sample documents with:

```
Cholesterol: 245 mg/dL
Blood Pressure: 148/95 mmHg
Glucose: 140 mg/dL
Heart Rate: 85 bpm

ECG Findings:
- ST Depression detected
- Normal sinus rhythm

Abnormal Findings:
- Left ventricular hypertrophy
```

## Performance Notes

### OCR Processing Times

- Single image (JPG/PNG): 2-5 seconds
- Single PDF page: 3-8 seconds
- Multi-page PDF: 10-30 seconds

### Optimization Tips

1. **Resize images** before upload (max 2000x2000px)
2. **Compress PDFs** to reduce processing time
3. **Use high-quality scans** for better accuracy
4. **Async processing** recommended for production (use Celery)

## Security Checklist

- [x] File type validation
- [x] File size limits (10MB)
- [x] Secure file storage
- [ ] HTTPS in production
- [ ] Rate limiting (recommended)
- [ ] User authentication (recommended)
- [ ] File cleanup policies
- [ ] HIPAA compliance review (if handling real PHI)

## Deployment Considerations

### For Production:

1. **Use async worker** (Celery + Redis)
```python
@app.post("/predict-heart-multimodal")
async def predict_heart_multimodal(...):
    # Offload OCR to background task
    ocr_task = process_documents.delay(files)
```

2. **Add caching** for OCR results
```python
# Cache OCR results by file hash
redis_cache.set(file_hash, ocr_results, timeout=3600)
```

3. **Implement file retention** policies
```python
# Delete uploaded files after 7 days
scheduled_cleanup_task()
```

4. **Add monitoring/logging**
```python
import logging
logger = logging.getLogger(__name__)
logger.info(f"Processing {len(documents)} documents...")
```

5. **Use S3/Cloud storage**
```python
# Instead of local filesystem
s3.upload_file(local_path, bucket, s3_key)
```

## Docker Deployment

```dockerfile
FROM python:3.11

WORKDIR /app

RUN apt-get update && apt-get install -y \
    poppler-utils \
    libopenblas-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

CMD ["uvicorn", "app:app", "--host", "0.0.0.0"]
```

## Monitoring Endpoints

Add monitoring for:
- OCR success rate
- Average processing time
- File upload sizes
- Error frequencies
- Risk prediction distribution

## Next Phase Features

1. **Batch Processing**: Upload multiple documents at once
2. **Document Management**: View uploaded documents history
3. **Comparative Analysis**: Compare predictions across multiple uploads
4. **PDF Report Generation**: Generate downloadable PDF reports
5. **Mobile Support**: Mobile-optimized interface
6. **Multi-language OCR**: Support for multiple languages
7. **Advanced Analytics**: Prediction confidence scores
8. **Integration APIs**: Third-party integration support
