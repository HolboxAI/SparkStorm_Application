# app/services/azure_ocr.py
from azure.cognitiveservices.vision.computervision import ComputerVisionClient
from azure.cognitiveservices.vision.computervision.models import OperationStatusCodes
from msrest.authentication import CognitiveServicesCredentials
import time
import os
from ..config import settings

class AzureOcrHelper:
    def __init__(self):
        if not settings.AZURE_VISION_ENDPOINT or not settings.AZURE_VISION_KEY:
            raise ValueError("Azure Vision credentials not properly configured")
            
        self.client = ComputerVisionClient(
            endpoint=settings.AZURE_VISION_ENDPOINT,
            credentials=CognitiveServicesCredentials(settings.AZURE_VISION_KEY)
        )
    
    def extract_text_from_pdf(self, file_path):
        """
        Extract text from a PDF file using Azure OCR.
        """
        if not os.path.isfile(file_path):
            raise FileNotFoundError(f"File not found: {file_path}")
            
        with open(file_path, "rb") as image_stream:
            read_response = self.client.read_in_stream(image_stream, raw=True)
            
        read_operation_location = read_response.headers["Operation-Location"]
        operation_id = read_operation_location.split("/")[-1]
        
        while True:
            read_result = self.client.get_read_result(operation_id)
            if read_result.status not in ['notStarted', 'running']:
                break
            time.sleep(1)
        
        extracted_text = ""
        if read_result.status == OperationStatusCodes.succeeded:
            for text_result in read_result.analyze_result.read_results:
                for line in text_result.lines:
                    extracted_text += line.text + " "
        else:
            raise Exception("OCR operation failed or timed out")
        
        return extracted_text