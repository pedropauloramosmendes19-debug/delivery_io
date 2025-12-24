from django.db import models
from django.contrib.auth.models import AbstractUser



class CustomUser(AbstractUser):
    email = models.EmailField(unique=True)
    building = models.ForeignKey(
        'building.Building',
        on_delete=models.SET_NULL,
        null=True,

    )

    def __str__(self):
        return self.username