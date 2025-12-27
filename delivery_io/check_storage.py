import os
import django
from django.conf import settings
from django.core.files.storage import default_storage

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "app.settings")
django.setup()

print(f"DEFAULT_FILE_STORAGE Setting: {settings.DEFAULT_FILE_STORAGE}")
print(f"Default Storage Class: {default_storage.__class__.__name__}")
print(f"Cloudinary Config: {settings.CLOUDINARY_STORAGE}")

try:
    import cloudinary_storage
    print(f"cloudinary_storage version: {cloudinary_storage.__version__}")
except ImportError:
    print("cloudinary_storage NOT installed")

try:
    import cloudinary
    print(f"cloudinary version: {cloudinary.__version__}")
except ImportError:
    print("cloudinary NOT installed")
