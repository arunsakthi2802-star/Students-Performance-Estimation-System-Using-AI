"""
Vercel Serverless Python Entrypoint
Students Performance Estimation System Using AI
Project Owner: Nithyasri S
"""

import sys
import os

# Add root directory to python sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.app.main import app
