from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models


class Package(models.Model):
    owner_name = models.CharField(max_length=200)
    ap_number = models.PositiveSmallIntegerField(
        validators=[
            MinValueValidator(11),
            MaxValueValidator(283)
        ]
    )
    package_type = models.ForeignKey(
        'type.Type',
        on_delete=models.PROTECT,
        null=True,
        blank=True,
    )
    user_deliver = models.ForeignKey(
        'users.CustomUser',
        on_delete=models.PROTECT,
    )
    building = models.ForeignKey(
        'building.Building',
        on_delete=models.PROTECT,
        null=True
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    photo_field = models.ImageField(
        upload_to='comprovantes/'
    )

    def __str__(self):
        return f'{self.owner_name} - {self.ap_number} - {self.created_at}'

