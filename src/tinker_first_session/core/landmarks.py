"""MediaPipe FaceMesh landmark index constants.

Reference: https://github.com/google-ai-edge/mediapipe/blob/master/mediapipe/modules/face_geometry/data/canonical_face_model_uv_visualization.png

These indices are stable across MediaPipe versions and correspond to the
468 face landmarks + 10 iris landmarks (478 total).
"""

from __future__ import annotations

# ── Eye contour landmarks (for EAR calculation) ─────────────────────────────
# Each eye uses 6 landmarks arranged as:
#     P1 ── P2
#    /        \
#   P6         P3
#    \        /
#     P5 ── P4

LEFT_EYE = (33, 160, 158, 133, 153, 144)
RIGHT_EYE = (362, 385, 387, 263, 373, 380)

# ── Iris landmarks ──────────────────────────────────────────────────────────
# Each iris has 5 points: centre + 4 boundary (right, top, left, bottom)

LEFT_IRIS = (468, 469, 470, 471, 472)
RIGHT_IRIS = (473, 474, 475, 476, 477)

# ── Eye corners (for gaze direction) ────────────────────────────────────────

LEFT_EYE_INNER_CORNER = 133
LEFT_EYE_OUTER_CORNER = 33
RIGHT_EYE_INNER_CORNER = 362
RIGHT_EYE_OUTER_CORNER = 263

# ── Head-pose model points (6 canonical landmarks for solvePnP) ─────────────

NOSE_TIP = 1
CHIN = 199
LEFT_EYE_CORNER = 33
RIGHT_EYE_CORNER = 263
LEFT_MOUTH_CORNER = 61
RIGHT_MOUTH_CORNER = 291

HEAD_POSE_LANDMARKS = (
    NOSE_TIP,
    CHIN,
    LEFT_EYE_CORNER,
    RIGHT_EYE_CORNER,
    LEFT_MOUTH_CORNER,
    RIGHT_MOUTH_CORNER,
)

# Canonical 3-D model points (approximate, in arbitrary units).
# These correspond to HEAD_POSE_LANDMARKS in the same order.
import numpy as np

HEAD_POSE_MODEL_POINTS = np.array(
    [
        (0.0, 0.0, 0.0),           # Nose tip
        (0.0, -330.0, -65.0),      # Chin
        (-225.0, 170.0, -135.0),   # Left eye corner
        (225.0, 170.0, -135.0),    # Right eye corner
        (-150.0, -150.0, -125.0),  # Left mouth corner
        (150.0, -150.0, -125.0),   # Right mouth corner
    ],
    dtype=np.float64,
)

# ── Mouth landmarks (for MAR / yawn detection) ──────────────────────────────

UPPER_LIP = 13
LOWER_LIP = 14
LEFT_LIP_CORNER = 61
RIGHT_LIP_CORNER = 291
UPPER_LIP_TOP = 12
LOWER_LIP_BOTTOM = 15

# Vertical mouth landmarks for a more accurate MAR
MOUTH_TOP = 13
MOUTH_BOTTOM = 14
MOUTH_TOP_INNER = 82
MOUTH_BOTTOM_INNER = 87

# ── Brow landmarks ─────────────────────────────────────────────────────────

LEFT_BROW = (70, 63, 105, 66, 107)
RIGHT_BROW = (336, 296, 334, 293, 300)

# Reference points below each brow for measuring brow raise distance
LEFT_BROW_REFERENCE = 159   # Upper eyelid centre (left)
RIGHT_BROW_REFERENCE = 386  # Upper eyelid centre (right)
