import { Home, TrendingUp, CreditCard, ShoppingCart, BarChart3, Settings } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

const menuItems = [
  { title: "Visão Geral", url: "/", icon: Home },
  { title: "Receitas", url: "/receitas", icon: TrendingUp },
  { title: "Contas Fixas", url: "/contas-fixas", icon: CreditCard },
  { title: "Compras / Cartões", url: "/compras", icon: ShoppingCart },
  { title: "Relatórios", url: "/relatorios", icon: BarChart3 },
  { title: "Configurações", url: "/configuracoes", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon" className="border-r border-border">
      <SidebarContent>
        <SidebarGroup>
          <div className="flex items-center justify-between px-4 py-4">
            {!isCollapsed && (
              <div className="flex items-center gap-2">
                <span className="text-2xl">💰</span>
                <span className="font-bold text-lg">Painel Financeiro</span>
              </div>
            )}
            {isCollapsed && <span className="text-2xl mx-auto">💰</span>}
          </div>

          <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/"}
                      className="flex items-center gap-3"
                      activeClassName="bg-accent text-accent-foreground font-medium"
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
