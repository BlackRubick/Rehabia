import random
import string
from datetime import datetime


def generate_patient_unique_id() -> str:
    token = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
    year = datetime.utcnow().year
    return f'PAC-{year}-{token}'
