"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// Schema de validação com Zod
const criarProcessoSchema = z.object({
  templateNome: z.string().min(3, "O nome do processo é obrigatório."),
  templateDescricao: z.string().optional(),
  etapaNome: z.string().min(3, "O nome da etapa é obrigatório."),
  etapaDescricao: z.string().optional(),
});

type CriarProcessoFormData = z.infer<typeof criarProcessoSchema>;

// Função para criar a etapa
const criarEtapa = async (data: { nome: string; descricao?: string }) => {
  const response = await fetch("http://localhost:3000/etapas", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error("Erro ao criar a etapa inicial.");
  }
  return response.json();
};

// Função para criar o template
const criarTemplate = async (data: { nome: string; descricao?: string; etapa_inicial_id: number }) => {
  const response = await fetch("http://localhost:3000/templates", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error("Erro ao criar o processo.");
  }
  return response.json();
};

export function CriarProcessoForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CriarProcessoFormData>({
    resolver: zodResolver(criarProcessoSchema),
  });

  const mutation = useMutation({
    mutationFn: async (data: CriarProcessoFormData) => {
      // 1. Criar a etapa inicial
      const novaEtapa = await criarEtapa({
        nome: data.etapaNome,
        descricao: data.etapaDescricao,
      });

      // 2. Criar o template com o ID da etapa inicial
      const novoTemplate = await criarTemplate({
        nome: data.templateNome,
        descricao: data.templateDescricao,
        etapa_inicial_id: novaEtapa.id,
      });

      return novoTemplate;
    },
    onSuccess: (data) => {
      toast.success(`Processo "${data.nome}" criado com sucesso!`);
      reset(); // Limpa o formulário
    },
    onError: (error) => {
      toast.error(error.message || "Ocorreu um erro inesperado.");
    },
  });

  const onSubmit = (data: CriarProcessoFormData) => {
    mutation.mutate(data);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Criar Novo Processo</CardTitle>
        <CardDescription>
          Defina um novo processo (template) e sua etapa inicial. Outras etapas poderão ser adicionadas depois.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Campos do Processo (Template) */}
          <div className="space-y-4 rounded-md border p-4">
            <h3 className="text-lg font-medium">Dados do Processo</h3>
            <div className="space-y-2">
              <Label htmlFor="templateNome">Nome do Processo</Label>
              <Input
                id="templateNome"
                placeholder="Ex: Solicitação de Férias"
                {...register("templateNome")}
              />
              {errors.templateNome && (
                <p className="text-sm text-destructive">{errors.templateNome.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="templateDescricao">Descrição do Processo (Opcional)</Label>
              <Input
                id="templateDescricao"
                placeholder="Ex: Processo para formalizar pedidos de férias dos colaboradores"
                {...register("templateDescricao")}
              />
            </div>
          </div>

          {/* Campos da Etapa Inicial */}
          <div className="space-y-4 rounded-md border p-4">
            <h3 className="text-lg font-medium">Etapa Inicial do Processo</h3>
            <div className="space-y-2">
              <Label htmlFor="etapaNome">Nome da Etapa Inicial</Label>
              <Input
                id="etapaNome"
                placeholder="Ex: Preenchimento do Formulário"
                {...register("etapaNome")}
              />
              {errors.etapaNome && (
                <p className="text-sm text-destructive">{errors.etapaNome.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="etapaDescricao">Descrição da Etapa (Opcional)</Label>
              <Input
                id="etapaDescricao"
                placeholder="Ex: O colaborador preenche os dados para solicitar as férias"
                {...register("etapaDescricao")}
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Criando...
              </>
            ) : (
              "Criar Processo"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
