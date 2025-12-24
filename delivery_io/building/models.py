from django.db import models


class Building(models.Model):
    id = models.AutoField(primary_key=True)
    building_name = models.CharField(max_length=400)

    def __str__(self):
        return self.building_name
