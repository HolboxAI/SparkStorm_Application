import boto3
from ..config import settings
import logging
from typing import Optional

class TextractHelper:
    def __init__(self):
        self.client = boto3.client(
            'textract',
            region_name=settings.AWS_REGION,
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY
        )
        self.logger = logging.getLogger(__name__)

    def extract_text_from_pdf(self, file_path: str) -> str:
        try:
            with open(file_path, 'rb') as document_file:
                document_bytes = document_file.read()

            response = self.client.analyze_document(
                Document={'Bytes': document_bytes},
                FeatureTypes=['TABLES', 'FORMS']
            )

            return self._parse_textract_response(response)
        except Exception as e:
            self.logger.error(f"Textract processing failed: {str(e)}")
            raise ValueError(f"Textract error: {str(e)}")

    def _parse_textract_response(self, response: dict) -> str:
        text = []
        for block in response.get('Blocks', []):
            if block['BlockType'] == 'LINE':
                text.append(block['Text'])
        return '\n'.join(text)