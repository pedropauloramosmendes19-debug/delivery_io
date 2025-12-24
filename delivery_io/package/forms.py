from django import forms
from . import models


class PackageForms(forms.ModelForm):

    class Meta:
       model = models.Package
       fields = ["owner_name",
                 "ap_number",
                 "package_type",
                 "photo_field"
                 ]
