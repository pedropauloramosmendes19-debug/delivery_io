from django.db.models import Count
from django.db.models.functions import ExtractHour
from django.views.generic import TemplateView
from django.contrib.auth.mixins import LoginRequiredMixin
from .models import Package
from django.utils import timezone
from datetime import timedelta
from django.utils.decorators import method_decorator
from django.views.decorators.cache import never_cache



@method_decorator(never_cache, name='dispatch')
class DashboardView(LoginRequiredMixin, TemplateView):
    template_name = 'dashboard.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)

        # 1. Filtro Principal: TUDO aqui é focado no PRÉDIO, não no usuário.
        if self.request.user.building:
            qs = Package.objects.filter(building=self.request.user.building)
        else:
            qs = Package.objects.none()

      
        
        
        now = timezone.localtime(timezone.now())
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
        # --- NOVO: RANKING DE RECEPCIONISTAS (Para o Supervisor) ---
        # Agrupa pelo nome do usuário e conta quantos pacotes cada um fez HOJE
        team_performance = qs.filter(created_at__date=today).values('user_deliver__username').annotate(total=Count('id')).order_by('-total')
        context['team_stats'] = team_performance

        return context


class ReportsView(LoginRequiredMixin, TemplateView):
    template_name = 'reports.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        from django.db.models.functions import TruncMonth

        if self.request.user.building:
            qs = Package.objects.filter(building=self.request.user.building)
        else:
            qs = Package.objects.none()

        # 1. Total de Entregas por Mês
        monthly_data = qs.annotate(month=TruncMonth('created_at')).values('month').annotate(total=Count('id')).order_by('-month')
        context['monthly_stats'] = monthly_data

        # 2. Horário com mais entregas
        hourly_data = qs.annotate(hour=ExtractHour('created_at')).values('hour').annotate(count=Count('id')).order_by('-count')
        if hourly_data:
            busiest_hour = hourly_data[0]
            context['busiest_hour'] = f"{busiest_hour['hour']}h"
            context['busiest_hour_count'] = busiest_hour['count']
        else:
            context['busiest_hour'] = "-"
            context['busiest_hour_count'] = 0

        # 3. Tipo de entrega mais feita
        type_data = qs.values('package_type__type').annotate(total=Count('id')).order_by('-total')
        if type_data:
            top_type = type_data[0]
            context['top_type'] = top_type['package_type__type'] or "Sem Tipo"
            context['top_type_count'] = top_type['total']
        else:
            context['top_type'] = "-"
            context['top_type_count'] = 0

        return context


class MonthlyDashboardView(LoginRequiredMixin, TemplateView):
    template_name = 'monthly_dashboard.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        from django.db.models.functions import ExtractHour
        from datetime import datetime
        
        # Obter mês e ano dos parâmetros GET
        month = self.request.GET.get('month')
        year = self.request.GET.get('year')
        
        if self.request.user.building and month and year:
            qs = Package.objects.filter(
                building=self.request.user.building,
                created_at__month=month,
                created_at__year=year
            )
            # Para exibição no template
            try:
                date_object = datetime(int(year), int(month), 1)
                context['current_request_date'] = date_object
            except:
                context['current_request_date'] = None
                
        else:
            qs = Package.objects.none()

        # --- DADOS GERAIS DO MÊS ---
        context['total_month'] = qs.count()
        # Média por dia (simplificada)
        context['daily_avg'] = round(qs.count() / 30) if qs.count() > 0 else 0

        # --- GRÁFICO 1: ROSQUINHA (Por Tipo) ---
        tipo_data = qs.values('package_type__type').annotate(total=Count('id')).order_by('-total')
        context['doughnut_labels'] = [item['package_type__type'] or 'Sem Tipo' for item in tipo_data]
        context['doughnut_values'] = [item['total'] for item in tipo_data]

        # --- GRÁFICO 2: MONTANHA RUSSA (Horários do Prédio) ---
        hourly_data = qs.annotate(hour=ExtractHour('created_at')).values('hour').annotate(count=Count('id')).order_by('hour')
        hours_map = {h: 0 for h in range(24)}
        for item in hourly_data:
            hours_map[item['hour']] = item['count']

        context['line_labels'] = [f"{h}h" for h in hours_map.keys()]
        context['line_values'] = list(hours_map.values())

        # --- TIPO MAIS FREQUENTE ---
        type_data = qs.values('package_type__type').annotate(total=Count('id')).order_by('-total')
        if type_data:
            top_type = type_data[0]
            context['top_type'] = top_type['package_type__type'] or "Sem Tipo"
            context['top_type_count'] = top_type['total']
        else:
            context['top_type'] = "-"
            context['top_type_count'] = 0

        # --- RANKING DE RECEPCIONISTAS ---
        team_performance = qs.values('user_deliver__username').annotate(total=Count('id')).order_by('-total')
        context['team_stats'] = team_performance

        return context