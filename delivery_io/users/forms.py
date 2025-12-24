from django.contrib.auth.forms import UserCreationForm
from .models import CustomUser

class CustomUserForm(UserCreationForm):
    class Meta:
        model = CustomUser
        fields = ['username', 'email', 'building']

        labels = {
            'building': 'Unidade (Prédio)',
            'username': 'Nome de Usuário',
            'email': 'Endereço de E-mail',
            'Password': 'Senha',
            'Password Confirmation': 'Confirmação de senha'
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        self.fields['password1'].label = "Senha"
        self.fields['password2'].label = "Confirmar Senha"
        self.fields['password1'].help_text = "A senha deve ter no mínimo 8 caracteres."

        for field in self.fields:
            self.fields[field].widget.attrs.update({'class': 'form-control form-control-lg bg-light'})