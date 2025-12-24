from django.shortcuts import render
from django.views.generic import CreateView, DetailView, UpdateView, ListView
from django.contrib.auth.mixins import LoginRequiredMixin
from django.urls import reverse_lazy
from .models import Package
from .forms import PackageForms
from type.models import Type
from rest_framework import generics, permissions
from .serializers import PackageSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated


class PackageCreateView(LoginRequiredMixin, CreateView):
    model = Package
    form_class = PackageForms
    template_name = 'create_package.html'
    success_url = reverse_lazy('packages_list')

    def form_valid(self, form):
        form.instance.user_deliver = self.request.user
        form.instance.building = self.request.user.building
        return super().form_valid(form)

class PackageDetailView(LoginRequiredMixin, DetailView):
    model = Package
    template_name = 'package_detail.html'
    context_object_name = 'package'


class PackageUpdateView(LoginRequiredMixin, UpdateView):
    model = Package
    form_class = PackageForms
    template_name = 'package_update.html'
    success_url = reverse_lazy('packages_list')


class PackageListView(LoginRequiredMixin, ListView):
    model = Package
    template_name = 'package_list.html'
    context_object_name = 'packages'
    paginate_by = 10

    def get_queryset(self):
        query = Package.objects.filter(building=self.request.user.building)
        type = self.request.GET.get('package_type',)
        ap_number = self.request.GET.get('ap_number',)

        if type:
            query = query.filter(package_type__id=type)

        if ap_number:
            query =  query.filter(ap_number__icontains=ap_number)

        return query.order_by('-created_at')

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)

        # O HTML espera uma variável chamada 'all_types'
        context['all_types'] = Type.objects.all()

        # O HTML espera 'selected_type' para marcar o que foi escolhido
        context['selected_type'] = self.request.GET.get('package_type', '')

        # Mantém o valor do apartamento preenchido também
        context['selected_apto'] = self.request.GET.get('ap_number', '')

        return context


class PackageListCreateAPIView(generics.ListCreateAPIView):
    serializer_class = PackageSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        print(self.request.META.get('HTTP_AUTHORIZATION'))
        print("AUTH HEADER:", self.request.META.get('HTTP_AUTHORIZATION'))
        return Package.objects.filter(building= self.request.user.building)

    def perform_create(self, serializer):
        serializer.save(
            user_deliver=self.request.user,
            building=self.request.user.building
        )


class PackageUpdateDetailAPIView(generics.RetrieveUpdateAPIView):
    serializer_class = PackageSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Package.objects.filter(building= self.request.user.building)



class EspiaoView(APIView):
    permission_classes = [IsAuthenticated] # Deixa qualquer um entrar

    def post(self, request):
        print("------------------------------------------------")
        print("🕵️ ESPIÃO RELATA:")
        print(f"Tipo de Conteúdo: {request.content_type}")
        print(f"Dados Recebidos: {request.data}")
        print("------------------------------------------------")
        return Response({"status": "Recebido com sucesso! Olhe o terminal."})
