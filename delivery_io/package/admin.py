from django.contrib import admin
from . import models

class PackageAdmin(admin.ModelAdmin):
    list_display = ("owner_name",
                    "ap_number",
                    "package_type",
                    "created_at",
                    "photo_field",)

    exclude = ("user_deliver", "building",)

admin.site.register(models.Package, PackageAdmin)