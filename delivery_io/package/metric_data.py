from django.db.models import Count
from django.db.models.functions import ExtractHour
from django.views.generic import TemplateView
from django.contrib.auth.mixins import LoginRequiredMixin
from .models import Package


class DashboardView(LoginRequiredMixin, TemplateView):
    template_name = 'dashboard.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)

        # 1. Filtro Principal: TUDO aqui é focado no PRÉDIO, não no usuário.
        if self.request.user.building:
            qs = Package.objects.filter(building=self.request.user.building)
        else:
            qs = Package.objects.none()

        # --- DADOS GERAIS ---
        from django.utils import timezone
        from datetime import timedelta
        
        now = timezone.now()
        today = now.date()
        yesterday = (now - timedelta(days=1)).date()
        
        # Dashboard Cards: Ontem e Hoje
        context['packages_yesterday'] = qs.filter(created_at__date=yesterday).count()
        context['packages_today'] = qs.filter(created_at__date=today).count()

        # --- GRÁFICO 1: ROSQUINHA (Por Tipo) ---
        tipo_data = qs.values('package_type__type').annotate(total=Count('id')).order_by('-total')
        context['doughnut_labels'] = [item['package_type__type'] or 'Sem Tipo' for item in tipo_data]
        context['doughnut_values'] = [item['total'] for item in tipo_data]

        # --- GRÁFICO 2: MONTANHA RUSSA (Horários do Prédio) ---
        hourly_data = qs.annotate(hour=ExtractHour('created_at')).values('hour').annotate(count=Count('id')).order_by(
            'hour')
        hours_map = {h: 0 for h in range(24)}
        for item in hourly_data:
            hours_map[item['hour']] = item['count']

        context['line_labels'] = [f"{h}h" for h in hours_map.keys()]
        context['line_values'] = list(hours_map.values())

        # --- NOVO: RANKING DE RECEPCIONISTAS (Para o Supervisor) ---
        # Agrupa pelo nome do usuário e conta quantos pacotes cada um fez
        team_performance = qs.values('user_deliver__username').annotate(total=Count('id')).order_by('-total')
        context['team_stats'] = team_performance

        return context