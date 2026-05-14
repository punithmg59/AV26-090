"""
Medical Data Extraction Service
Combines form data, pain selection, and OCR-extracted values
into a unified structured feature set for ML prediction
"""

import logging
from typing import Dict, List, Any, Optional
from datetime import datetime

logger = logging.getLogger(__name__)


class MedicalDataExtractor:
    """Extracts and normalizes medical data from multiple sources"""
    
    # Medical value ranges for normalization/validation
    NORMAL_RANGES = {
        'chol': (125, 200),  # mg/dL
        'glucose': (70, 100),  # mg/dL (fasting)
        'trestbps': (90, 120),  # mmHg
        'thalach': (60, 100),  # bpm
        'ldl': (0, 100),  # mg/dL (good)
        'hdl': (40, 100),  # mg/dL
        'triglycerides': (0, 150),  # mg/dL
    }
    
    # Pain area risk factors
    PAIN_AREA_RISK_MAPPING = {
        'chest': 10,  # High risk
        'left_arm': 8,  # High risk
        'right_arm': 5,  # Medium risk
        'back': 4,  # Low-Medium risk
        'jaw': 7,  # Medium-High risk
        'neck': 6,  # Medium risk
        'shoulder': 5,  # Medium risk
    }

    def __init__(self):
        """Initialize the medical data extractor"""
        self.extracted_data = {}

    def validate_value(self, value: float, field_name: str) -> Optional[float]:
        """
        Validate medical value against normal ranges
        
        Args:
            value: The value to validate
            field_name: Name of the medical field
            
        Returns:
            Validated value or None if invalid
        """
        if value is None:
            return None
        
        if field_name not in self.NORMAL_RANGES:
            return value
        
        min_val, max_val = self.NORMAL_RANGES[field_name]
        
        # Allow some tolerance outside normal range
        if value < 0 or value > max_val * 2:
            logger.warning(f"Value {value} for {field_name} seems invalid")
            return None
        
        return value

    def extract_from_form(self, form_data: Dict) -> Dict:
        """
        Extract and normalize form data
        
        Args:
            form_data: Dictionary of form fields
            
        Returns:
            Normalized form data
        """
        normalized = {}
        
        form_fields = {
            'age': int,
            'sex': int,
            'cp': int,  # chest pain type
            'trestbps': float,  # resting blood pressure
            'chol': float,  # serum cholesterol
            'fbs': int,  # fasting blood sugar
            'thalach': float,  # max heart rate
            'exang': int,  # exercise induced angina
            'smoking': int,
            'stress_level': int,
            'short_breath': int,
            'fatigue': int,
            'chest_location': int,
            'left_arm_pain': int,
            'pain_severity': int,
        }
        
        for field, field_type in form_fields.items():
            if field in form_data:
                try:
                    value = field_type(form_data[field])
                    
                    # Validate numeric medical fields
                    if field in self.NORMAL_RANGES:
                        validated = self.validate_value(float(value), field)
                        if validated is not None:
                            normalized[field] = validated
                    else:
                        normalized[field] = value
                except (ValueError, TypeError) as e:
                    logger.warning(f"Error converting {field}: {e}")
        
        return normalized

    def extract_from_pain_areas(self, pain_areas: List[str]) -> Dict:
        """
        Extract risk factors from pain areas
        
        Args:
            pain_areas: List of selected pain areas
            
        Returns:
            Dictionary with pain-derived features
        """
        pain_data = {
            'selected_pain_areas': pain_areas,
            'pain_area_count': len(pain_areas),
            'max_pain_risk_score': 0,
            'total_pain_risk_score': 0,
            'high_risk_pain': False,
        }
        
        if not pain_areas:
            return pain_data
        
        # Calculate risk scores from pain areas
        for area in pain_areas:
            risk = self.PAIN_AREA_RISK_MAPPING.get(area, 2)
            pain_data['total_pain_risk_score'] += risk
            pain_data['max_pain_risk_score'] = max(pain_data['max_pain_risk_score'], risk)
            
            # Check for high-risk pain areas
            if risk >= 8:
                pain_data['high_risk_pain'] = True
        
        logger.info(f"Pain areas analysis: {pain_data}")
        return pain_data

    def extract_from_ocr(self, ocr_values: Dict) -> Dict:
        """
        Extract and normalize OCR data
        
        Args:
            ocr_values: Dictionary of OCR-extracted values
            
        Returns:
            Normalized OCR data
        """
        normalized = {}
        
        # Medical values from OCR
        ocr_fields = {
            'chol': float,
            'glucose': float,
            'trestbps': float,
            'thalach': float,
            'ldl': float,
            'hdl': float,
            'triglycerides': float,
        }
        
        for field, field_type in ocr_fields.items():
            if field in ocr_values:
                try:
                    value = field_type(ocr_values[field])
                    validated = self.validate_value(value, field)
                    if validated is not None:
                        normalized[f'ocr_{field}'] = validated
                except (ValueError, TypeError) as e:
                    logger.warning(f"Error processing OCR {field}: {e}")
        
        # Qualitative findings
        if 'ecg_findings' in ocr_values:
            normalized['ocr_ecg_findings'] = ocr_values['ecg_findings']
        
        if 'abnormalities' in ocr_values:
            normalized['ocr_abnormalities'] = ocr_values['abnormalities']
        
        if 'imaging_finding' in ocr_values:
            normalized['ocr_imaging_finding'] = ocr_values['imaging_finding']
        
        if 'has_imaging' in ocr_values:
            normalized['has_imaging'] = ocr_values['has_imaging']
        
        return normalized

    def combine_data_sources(
        self,
        form_data: Dict,
        pain_areas: List[str],
        ocr_values: Dict
    ) -> Dict:
        """
        Combine all data sources into unified feature set
        
        Args:
            form_data: Data from form input
            pain_areas: Selected pain areas
            ocr_values: OCR-extracted medical values
            
        Returns:
            Unified structured data ready for ML prediction
        """
        
        # Extract from each source
        form_extracted = self.extract_from_form(form_data)
        pain_extracted = self.extract_from_pain_areas(pain_areas)
        ocr_extracted = self.extract_from_ocr(ocr_values)
        
        # Combine everything
        combined_data = {
            'timestamp': datetime.now().isoformat(),
            'form_data': form_extracted,
            'pain_analysis': pain_extracted,
            'ocr_data': ocr_extracted,
        }
        
        # Create ML feature vector
        ml_features = self._create_ml_features(form_extracted, pain_extracted, ocr_extracted)
        combined_data['ml_features'] = ml_features
        
        # Summary statistics
        combined_data['summary'] = self._create_summary(combined_data)
        
        logger.info(f"Combined data: {combined_data}")
        return combined_data

    def _create_ml_features(self, form: Dict, pain: Dict, ocr: Dict) -> Dict:
        """
        Create feature vector for ML model
        
        Args:
            form: Form-extracted data
            pain: Pain area analysis
            ocr: OCR-extracted data
            
        Returns:
            Feature dictionary for ML model
        """
        features = {}
        
        # Core demographic/vital features
        features['age'] = form.get('age', 0)
        features['sex'] = form.get('sex', 0)
        features['cp'] = form.get('cp', 0)
        
        # Vital signs - prefer OCR values if available
        features['trestbps'] = ocr.get('ocr_trestbps', form.get('trestbps', 0))
        features['chol'] = ocr.get('ocr_chol', form.get('chol', 0))
        features['fbs'] = form.get('fbs', 0)
        features['thalach'] = ocr.get('ocr_thalach', form.get('thalach', 0))
        
        # Symptoms
        features['exang'] = form.get('exang', 0)
        features['smoking'] = form.get('smoking', 0)
        features['stress_level'] = form.get('stress_level', 0)
        features['short_breath'] = form.get('short_breath', 0)
        features['fatigue'] = form.get('fatigue', 0)
        
        # Pain features
        features['pain_area_count'] = pain.get('pain_area_count', 0)
        features['max_pain_risk_score'] = pain.get('max_pain_risk_score', 0)
        features['high_risk_pain'] = int(pain.get('high_risk_pain', False))
        
        # Additional cardiac markers from OCR
        if 'ocr_ldl' in ocr:
            features['ldl'] = ocr['ocr_ldl']
        if 'ocr_hdl' in ocr:
            features['hdl'] = ocr['ocr_hdl']
        if 'ocr_triglycerides' in ocr:
            features['triglycerides'] = ocr['ocr_triglycerides']
        
        # ECG and imaging indicators
        features['has_ecg_findings'] = int(bool(ocr.get('ocr_ecg_findings')))
        features['has_abnormalities'] = int(bool(ocr.get('ocr_abnormalities')))
        features['has_imaging'] = int(ocr.get('has_imaging', False))
        
        return features

    def _create_summary(self, combined_data: Dict) -> Dict:
        """
        Create human-readable summary
        
        Args:
            combined_data: Combined data from all sources
            
        Returns:
            Summary dictionary
        """
        summary = {}
        
        form = combined_data['form_data']
        pain = combined_data['pain_analysis']
        ocr = combined_data['ocr_data']
        
        # Risk indicators
        risk_flags = []
        
        if form.get('chol', 0) > 200:
            risk_flags.append('High cholesterol')
        
        if ocr.get('ocr_chol', 0) > 200:
            risk_flags.append('OCR: High cholesterol')
        
        if form.get('trestbps', 0) > 140:
            risk_flags.append('High blood pressure')
        
        if ocr.get('ocr_trestbps', 0) > 140:
            risk_flags.append('OCR: High blood pressure')
        
        if form.get('smoking', 0) == 1:
            risk_flags.append('Active smoker')
        
        if pain.get('high_risk_pain', False):
            risk_flags.append('High-risk chest/arm pain')
        
        if ocr.get('ocr_abnormalities'):
            risk_flags.append(f"Abnormalities detected: {len(ocr['ocr_abnormalities'])}")
        
        if ocr.get('ocr_ecg_findings'):
            risk_flags.append(f"ECG findings: {', '.join(ocr['ocr_ecg_findings'])}")
        
        summary['risk_flags'] = risk_flags
        summary['risk_level'] = self._calculate_risk_level(risk_flags)
        summary['data_completeness'] = self._calculate_data_completeness(combined_data)
        
        return summary

    def _calculate_risk_level(self, risk_flags: List[str]) -> str:
        """
        Calculate overall risk level
        
        Args:
            risk_flags: List of identified risk factors
            
        Returns:
            Risk level: 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'
        """
        if len(risk_flags) >= 5:
            return 'CRITICAL'
        elif len(risk_flags) >= 3:
            return 'HIGH'
        elif len(risk_flags) >= 1:
            return 'MEDIUM'
        else:
            return 'LOW'

    def _calculate_data_completeness(self, combined_data: Dict) -> Dict:
        """
        Calculate how complete the data is
        
        Args:
            combined_data: Combined data dictionary
            
        Returns:
            Completeness report
        """
        form_fields = combined_data['form_data']
        ocr_fields = combined_data['ocr_data']
        pain_areas = combined_data['pain_analysis']
        
        total_possible = 15  # Total possible form fields
        form_filled = len(form_fields)
        
        return {
            'form_completeness': f"{form_filled}/{total_possible} fields",
            'has_ocr_data': bool(ocr_fields),
            'has_pain_areas': pain_areas['pain_area_count'] > 0,
            'ocr_fields_count': len(ocr_fields),
            'overall_percent': int((form_filled / total_possible) * 100)
        }


# Global extractor instance
_extractor = None


def get_medical_data_extractor():
    """Get or create medical data extractor instance"""
    global _extractor
    if _extractor is None:
        _extractor = MedicalDataExtractor()
    return _extractor
