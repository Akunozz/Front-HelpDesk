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
import { useRouter } from "next/navigation";

const loginSchema = z.object({
  email: z.email("Email inválido"),
  senha: z.string().min(4, "A senha deve ter no mínimo 4 caracteres"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginFormData) => {
      const response = await fetch("http://localhost:3000/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Falha no login");
      }

      return response.json();
    },
    onSuccess: (data) => {
      // Store user data
      const userData = {
        id: data.id,
        nome: data.nome,
        email: data.email,
        tipo_usuario: data.tipo_usuario
      };
      
      // Store in localStorage
      localStorage.setItem("user", JSON.stringify(userData));
      
      // Store in cookie for middleware
      document.cookie = `user=${JSON.stringify(userData)}; path=/; max-age=86400`; // 24 hours
      
      toast.success(data.message || "Login realizado!");

      // Redirect based on user type
      if (data.tipo_usuario === "cliente") {
        router.push("/cliente");
      } else {
        router.push("/suporte");
      }
    },
    onError: () => {
      toast.error("Erro no login");
    },
  });

  const onSubmit = (data: LoginFormData) => {
    loginMutation.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="login-email">Email</Label>
        <Input
          id="login-email"
          type="email"
          placeholder="seu@email.com"
          {...register("email")}
        />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="login-senha">Senha</Label>
        <Input
          id="login-senha"
          type="password"
          placeholder="••••••••"
          {...register("senha")}
        />
        {errors.senha && (
          <p className="text-sm text-destructive">{errors.senha.message}</p>
        )}
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={loginMutation.isPending}
      >
        {loginMutation.isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Entrando...
          </>
        ) : (
          "Entrar"
        )}
      </Button>
    </form>
  );
}
