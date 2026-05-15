from fpdf import FPDF
import os
from datetime import datetime

class PDFReport(FPDF):
    def header(self):
        self.set_font('Arial', 'B', 15)
        self.cell(0, 10, 'Medical Analysis Report - Brain Tumor Detection', 0, 1, 'C')
        self.ln(10)

    def footer(self):
        self.set_y(-15)
        self.set_font('Arial', 'I', 8)
        self.cell(0, 10, f'Page {self.page_no()}', 0, 0, 'C')

def generate_mri_pdf(data):
    """
    Generates a PDF report for MRI analysis.
    data = {
        "prediction": "Glioma",
        "confidence": 98.5,
        "image_path": "uploads/mri_123.jpg",
        "report": "...",
        "suggestions": "...",
        "risk_level": "High",
        "timestamp": "..."
    }
    """
    pdf = PDFReport()
    pdf.add_page()
    
    # Patient Info
    pdf.set_font('Arial', 'B', 12)
    pdf.cell(0, 10, f"Report ID: MRI-{int(datetime.now().timestamp())}", 0, 1)
    pdf.cell(0, 10, f"Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", 0, 1)
    pdf.ln(5)

    # Analysis Results
    pdf.set_fill_color(240, 240, 240)
    pdf.set_font('Arial', 'B', 14)
    pdf.cell(0, 10, "Analysis Results", 0, 1, 'L', True)
    pdf.set_font('Arial', '', 12)
    pdf.cell(0, 10, f"Classification: {data['prediction']}", 0, 1)
    pdf.cell(0, 10, f"Confidence Score: {data['confidence']}%", 0, 1)
    pdf.cell(0, 10, f"Risk Level: {data['risk_level']}", 0, 1)
    pdf.ln(5)

    # Image
    if data['image_path'] and os.path.exists(data['image_path']):
        pdf.set_font('Arial', 'B', 12)
        pdf.cell(0, 10, "Uploaded MRI Image:", 0, 1)
        pdf.image(data['image_path'], x=10, w=100)
        pdf.ln(10)

    # AI Explanation
    pdf.set_font('Arial', 'B', 12)
    pdf.cell(0, 10, "AI Explanation:", 0, 1)
    pdf.set_font('Arial', '', 10)
    pdf.multi_cell(0, 7, data['report'])
    pdf.ln(5)

    # Doctor Suggestions
    pdf.set_font('Arial', 'B', 12)
    pdf.cell(0, 10, "Doctor Recommendations:", 0, 1)
    pdf.set_font('Arial', '', 10)
    pdf.multi_cell(0, 7, data['suggestions'])
    
    # Save PDF
    output_dir = "backend/outputs/pdfs"
    os.makedirs(output_dir, exist_ok=True)
    filename = f"mri_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
    file_path = os.path.join(output_dir, filename)
    pdf.output(file_path)
    
    return file_path
