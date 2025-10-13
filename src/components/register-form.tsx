"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

const registerSchema = z.object({
  nome: z.string().min(3, "O nome deve ter no mínimo 3 caracteres"),
  email: z.email("Email inválido"),
  senha: z.string().min(4, "A senha deve ter no mínimo 4 caracteres"),
  tipo_usuario: z.enum(["cliente", "suporte"], {
    error: "Selecione o tipo de usuário",
  }),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      tipo_usuario: "cliente",
    },
  });

  const userType = watch("tipo_usuario");

  const registerMutation = useMutation({
    mutationFn: async (data: RegisterFormData) => {
      const response = await fetch("http://localhost:3000/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Falha no cadastro");
      }

      return response.json();
    },
    onSuccess: (data) => {
      toast.success("Cadastro realizado com sucesso!");

      // Optionally auto-login after registration
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("token", data.token);

      setTimeout(() => {
        if (data.user.type === "cliente") {
          window.location.href = "/cliente";
        } else {
          window.location.href = "/suporte";
        }
      }, 1000);
    },
    onError: () => {
      toast.error("Erro no cadastro");
    },
  });

  const onSubmit = (data: RegisterFormData) => {
    registerMutation.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="register-name">Nome</Label>
        <Input
          id="register-name"
          type="text"
          placeholder="Seu nome completo"
          {...register("nome")}
        />
        {errors.nome && (
          <p className="text-sm text-destructive">{errors.nome.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="register-email">Email</Label>
        <Input
          id="register-email"
          type="email"
          placeholder="seu@email.com"
          {...register("email")}
        />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="register-senha">Senha</Label>
        <Input
          id="register-senha"
          type="password"
          placeholder="••••••••"
          {...register("senha")}
        />
        {errors.senha && (
          <p className="text-sm text-destructive">{errors.senha.message}</p>
        )}
      </div>

      <div className="space-y-3">
        <Label>Tipo de usuário</Label>
        <RadioGroup
          value={userType}
          onValueChange={(value) =>
            setValue("tipo_usuario", value as "cliente" | "suporte")
          }
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="cliente" id="cliente" />
            <Label htmlFor="cliente" className="font-normal cursor-pointer">
              Cliente
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="suporte" id="suporte" />
            <Label htmlFor="suporte" className="font-normal cursor-pointer">
              Suporte
            </Label>
          </div>
        </RadioGroup>
        {errors.tipo_usuario && (
          <p className="text-sm text-destructive">{errors.tipo_usuario.message}</p>
        )}
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={registerMutation.isPending}
      >
        {registerMutation.isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Cadastrando...
          </>
        ) : (
          "Cadastrar"
        )}
      </Button>
    </form>
  );
}
