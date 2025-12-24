from django.contrib import admin
from . import models

class TypeAdmin(admin.ModelAdmin):
    list_display = ('type', )


admin.site.register(models.Type, TypeAdmin)

