from __future__ import annotations

import base64
from typing import Any

import cv2
import mediapipe as mp
import numpy as np


class PoseAnalyzer:
    def __init__(self) -> None:
        self.available = False
        self.pose = None

        try:
            if not hasattr(mp, 'solutions'):
                return

            self.pose = mp.solutions.pose.Pose(
                static_image_mode=True,
                model_complexity=1,
                min_detection_confidence=0.6,
            )
            self.available = True
        except Exception:  # noqa: BLE001
            self.available = False
            self.pose = None

    @staticmethod
    def _decode_base64_image(data_url: str) -> np.ndarray:
        encoded = data_url.split(',')[-1]
        binary = base64.b64decode(encoded)
        image = np.frombuffer(binary, dtype=np.uint8)
        return cv2.imdecode(image, cv2.IMREAD_COLOR)

    @staticmethod
    def _calculate_angle(a: np.ndarray, b: np.ndarray, c: np.ndarray) -> float:
        ba = a - b
        bc = c - b
        cosine = np.dot(ba, bc) / (np.linalg.norm(ba) * np.linalg.norm(bc) + 1e-8)
        cosine = np.clip(cosine, -1.0, 1.0)
        return float(np.degrees(np.arccos(cosine)))

    def analyze(self, image_base64: str, side: str, range_min: float, range_max: float) -> dict[str, Any]:
        if not self.available or self.pose is None:
            return {'detected': False, 'status': 'mediapipe_unavailable', 'angle': 0.0}

        frame = self._decode_base64_image(image_base64)
        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        result = self.pose.process(rgb)

        if not result.pose_landmarks:
            return {'detected': False, 'status': 'not_detected', 'angle': 0.0}

        lm = result.pose_landmarks.landmark
        if side == 'derecha':
            hip_idx, knee_idx, ankle_idx = 24, 26, 28
        else:
            hip_idx, knee_idx, ankle_idx = 23, 25, 27

        h = np.array([lm[hip_idx].x, lm[hip_idx].y])
        k = np.array([lm[knee_idx].x, lm[knee_idx].y])
        a = np.array([lm[ankle_idx].x, lm[ankle_idx].y])

        angle = self._calculate_angle(h, k, a)
        status = 'correct' if range_min <= angle <= range_max else 'out_of_range'

        return {'detected': True, 'status': status, 'angle': round(angle, 2)}


pose_analyzer = PoseAnalyzer()
