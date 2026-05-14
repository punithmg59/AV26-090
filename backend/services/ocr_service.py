import os
import re
import logging
from typing import Dict, Optional, List, Tuple
from pathlib import Path

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

try:
    from paddleocr import PaddleOCR
    # Initialize OCR model
    ocr = PaddleOCR(use_angle_cls=True, lang='en')
    OCR_AVAILABLE = True
except Exception as e:
    ocr = None
    OCR_AVAILABLE = False
    logger.warning(f"PaddleOCR load error: {e}")

try:
    from pdf2image import convert_from_path
    PDF_AVAILABLE = True
except Exception as e:
    PDF_AVAILABLE = False
    logger.warning(f"pdf2image not available: {e}")


def extract_text_from_document(file_path: str) -> str:
    """
    Extract raw text from document (image or PDF)
    
    Args:
        file_path: Path to document file
        
    Returns:
        Extracted text
    """
    if not OCR_AVAILABLE or ocr is None:
        logger.warning("OCR not available")
        return ""
    
    try:
        file_ext = Path(file_path).suffix.lower()
        
        # Handle PDF files
        if file_ext == '.pdf' and PDF_AVAILABLE:
            try:
                images = convert_from_path(file_path)
                all_text = []
                for image in images:
                    # Save image temporarily
                    temp_path = f"/tmp/ocr_temp_{Path(file_path).stem}.png"
                    image.save(temp_path)
                    
                    result = ocr.ocr(temp_path, cls=True)
                    if result:
                        for block in result:
                            if block:
                                for line in block:
                                    all_text.append(line[1][0])
                    
                    # Clean up
                    if os.path.exists(temp_path):
                        os.remove(temp_path)
                
                return " ".join(all_text)
            except Exception as e:
                logger.error(f"PDF processing error: {e}")
                return ""
        
        # Handle image files
        elif file_ext in ['.jpg', '.jpeg', '.png', '.bmp']:
            result = ocr.ocr(file_path, cls=True)
            extracted_text = ""
            if result:
                for block in result:
                    if block:
                        for line in block:
                            extracted_text += line[1][0] + " "
            return extracted_text
        
        else:
            logger.warning(f"Unsupported file type: {file_ext}")
            return ""
            
    except Exception as e:
        logger.error(f"Error extracting text: {e}")
        return ""


def extract_medical_values(image_path: str) -> Dict:
    """
    Extracts medical values from a document image.
    Targets: cholesterol, glucose (fbs), blood pressure (trestbps),
    and heart rate (thalach), ECG values, MRI findings, etc.
    """
    if ocr is None:
        logger.warning("OCR is not available.")
        return {}
        
    try:
        result = ocr.ocr(image_path, cls=True)
    except Exception as e:
        logger.error(f"OCR processing error: {e}")
        return {}
    
    extracted_text = ""
    if result:
        for idx in range(len(result)):
            res = result[idx]
            if not res:
                continue
            for line in res:
                extracted_text += line[1][0] + " "
                
    extracted_text = extracted_text.lower()
    logger.info(f"Extracted Text from {Path(image_path).name}: {extracted_text[:200]}...")
    
    extracted_values = {}
    
    # 1. Cholesterol (mg/dL)
    chol_match = re.search(r'(?:cholesterol|chol|total chol)\s*[:-]?\s*(\d{2,3}(?:\.\d+)?)', extracted_text)
    if chol_match:
        extracted_values['chol'] = float(chol_match.group(1))
        logger.info(f"Found cholesterol: {extracted_values['chol']}")
        
    # 2. Glucose / Fasting Blood Sugar (mg/dL)
    glucose_match = re.search(r'(?:glucose|fbs|blood sugar|fasting blood sugar)\s*[:-]?\s*(\d{2,3}(?:\.\d+)?)', extracted_text)
    if glucose_match:
        glucose_val = float(glucose_match.group(1))
        extracted_values['glucose'] = glucose_val
        extracted_values['fbs'] = 1 if glucose_val > 120 else 0
        logger.info(f"Found glucose: {glucose_val}, fbs classification: {extracted_values['fbs']}")
        
    # 3. Blood Pressure (systolic/diastolic)
    bp_match = re.search(r'(?:blood pressure|bp|bp:)\s*[:\-]?\s*(\d{2,3})\s*[/\\]\s*(\d{2,3})', extracted_text)
    if bp_match:
        systolic = float(bp_match.group(1))
        diastolic = float(bp_match.group(2))
        extracted_values['trestbps'] = systolic
        extracted_values['bp_diastolic'] = diastolic
        logger.info(f"Found BP: {systolic}/{diastolic}")
    else:
        # Fallback if it just says systolic
        sys_match = re.search(r'(?:systolic|sys)\s*[:-]?\s*(\d{2,3})', extracted_text)
        if sys_match:
            extracted_values['trestbps'] = float(sys_match.group(1))
            logger.info(f"Found systolic: {extracted_values['trestbps']}")
            
    # 4. Max Heart Rate / Heart Rate (bpm)
    hr_match = re.search(r'(?:heart rate|hr|pulse|max\s*hr|max heart rate)\s*[:-]?\s*(\d{2,3})', extracted_text)
    if hr_match:
        extracted_values['thalach'] = float(hr_match.group(1))
        logger.info(f"Found heart rate: {extracted_values['thalach']}")
    
    # 5. ECG values and findings
    ecg_findings = []
    if 'normal' in extracted_text and 'ecg' in extracted_text:
        ecg_findings.append('Normal ECG')
    if 'st elevation' in extracted_text:
        ecg_findings.append('ST Elevation')
    if 'st depression' in extracted_text:
        ecg_findings.append('ST Depression')
    if 'arrhythmia' in extracted_text or 'irregular' in extracted_text:
        ecg_findings.append('Arrhythmia')
    
    if ecg_findings:
        extracted_values['ecg_findings'] = ecg_findings
        logger.info(f"Found ECG findings: {ecg_findings}")
    
    # 6. Other cardiac values
    # LDL Cholesterol
    ldl_match = re.search(r'(?:ldl|bad cholesterol)\s*[:-]?\s*(\d{2,3}(?:\.\d+)?)', extracted_text)
    if ldl_match:
        extracted_values['ldl'] = float(ldl_match.group(1))
    
    # HDL Cholesterol
    hdl_match = re.search(r'(?:hdl|good cholesterol)\s*[:-]?\s*(\d{2,3}(?:\.\d+)?)', extracted_text)
    if hdl_match:
        extracted_values['hdl'] = float(hdl_match.group(1))
    
    # Triglycerides
    trig_match = re.search(r'(?:triglyceride|triglycerides)\s*[:-]?\s*(\d{2,3}(?:\.\d+)?)', extracted_text)
    if trig_match:
        extracted_values['triglycerides'] = float(trig_match.group(1))
    
    # 7. Abnormal findings
    abnormalities = []
    abnormal_keywords = ['abnormal', 'abnormality', 'finding', 'abnormal finding', 'pathology']
    for keyword in abnormal_keywords:
        if keyword in extracted_text:
            # Try to extract the finding
            pattern = rf'{keyword}[:\-]?\s*([^.\n]+)'
            match = re.search(pattern, extracted_text)
            if match:
                finding = match.group(1).strip()
                if finding and len(finding) > 3:
                    abnormalities.append(finding)
    
    if abnormalities:
        extracted_values['abnormalities'] = abnormalities
        logger.info(f"Found abnormalities: {abnormalities}")
    
    # 8. MRI/Imaging findings
    if any(term in extracted_text for term in ['mri', 'scan', 'imaging', 'ct scan', 'x-ray']):
        extracted_values['has_imaging'] = True
        
        # Look for specific findings
        if 'lesion' in extracted_text:
            extracted_values['imaging_finding'] = 'Lesion detected'
        elif 'mass' in extracted_text:
            extracted_values['imaging_finding'] = 'Mass detected'
        elif 'infarction' in extracted_text:
            extracted_values['imaging_finding'] = 'Infarction detected'
    
    logger.info(f"Final extracted values: {extracted_values}")
    return extracted_values


def extract_all_text_with_medical_values(image_path: str) -> Tuple[str, Dict]:
    """
    Extract both raw text and medical values from a document
    
    Args:
        image_path: Path to image file
        
    Returns:
        Tuple of (extracted_text, medical_values_dict)
    """
    raw_text = extract_text_from_document(image_path)
    medical_values = extract_medical_values(image_path)
    return raw_text, medical_values
