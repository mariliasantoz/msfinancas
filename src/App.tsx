import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { MonthProvider } from "@/contexts/MonthContext";
import { ViewProvider } from "@/contexts/ViewContext";
import Dashboard from "./pages/Dashboard";
import Receitas from "./pages/Receitas";
import Contas from "./pages/Contas";
import Compras from "./pages/ComprasAgrupadas";
import Relatorios from "./pages/Relatorios";
import Configuracoes from "./pages/Configuracoes";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ViewProvider>
      <MonthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
          <SidebarProvider>
            <div className="flex min-h-screen w-full">
              <AppSidebar />
              <main className="flex-1 overflow-auto bg-background">
                <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
                  <div className="flex items-center gap-4 p-4">
                    <SidebarTrigger />
                    <div className="flex-1" />
                  </div>
                </div>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/receitas" element={<Receitas />} />
                  <Route path="/contas-fixas" element={<Contas />} />
                  <Route path="/compras" element={<Compras />} />
                  <Route path="/relatorios" element={<Relatorios />} />
                  <Route path="/configuracoes" element={<Configuracoes />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
            </div>
          </SidebarProvider>
        </BrowserRouter>
        </TooltipProvider>
      </MonthProvider>
    </ViewProvider>
  </QueryClientProvider>
);

export default App;
