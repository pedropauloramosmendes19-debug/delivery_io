from django.contrib import admin
from . import models


class BuildingAdmin(admin.ModelAdmin):
    list_display = ('building_name', )


admin.site.register(models.Building, BuildingAdmin)
