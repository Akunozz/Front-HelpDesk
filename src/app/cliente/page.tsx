"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function ClientePage() {
  const [user, setUser] = useState<{ 
    id: number; 
    nome: string; 
    email: string; 
    tipo_usuario: string; 
  } | null>(null);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    // Remove cookie
    document.cookie = "user=; path=/; max-age=0";
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-secondary/30 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Área do Cliente</CardTitle>
            <CardDescription>Bem-vindo à sua área exclusiva</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {user && (
              <div className="space-y-2">
                <p className="text-lg">
                  <span className="font-semibold">Nome:</span> {user.nome}
                </p>
                <p className="text-lg">
                  <span className="font-semibold">Email:</span> {user.email}
                </p>
              </div>
            )}
            <Button onClick={handleLogout} variant="outline">
              Sair
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Seus Serviços</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Aqui você pode gerenciar seus serviços e solicitações.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
