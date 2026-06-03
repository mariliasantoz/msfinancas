import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTransactions } from "@/hooks/useTransactions";
import { useCartoes } from "@/hooks/useCartoes";
import { useCategorias } from "@/hooks/useCategorias";
import { useCategoriasReceita } from "@/hooks/useCategoriasReceita";
import { formatCurrency } from "@/lib/formatters";
import { useMonth } from "@/contexts/MonthContext";
import { useView } from "@/contexts/ViewContext";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis } from "recharts";
import { MonthNavigator } from "@/components/MonthNavigator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronRight, Download } from "lucide-react";
import { format } from "date-fns";


export default function Relatorios() {
  const { currentDate, setCurrentDate } = useMonth();
  const { transactions } = useTransactions(currentDate);
  const { cartoes } = useCartoes();
  const { categorias } = useCategorias();
  const { categoriasReceita } = useCategoriasReceita();
  const { showValues } = useView();

  const [cartaoFilter, setCartaoFilter] = useState("Todos");
  const [categoriaFilter, setCategoriaFilter] = useState("Todas");
  const [categoriaReceitaFilter, setCategoriaReceitaFilter] = useState("Todas");
  const [selectedCategoria, setSelectedCategoria] = useState<string | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const receitas = useMemo(() => {
    return transactions.filter((t) => t.tipo === "receita");
  }, [transactions]);

  const receitasFiltradas = useMemo(() => {
    return categoriaReceitaFilter === "Todas"
      ? receitas
      : receitas.filter((t) => t.categoria === categoriaReceitaFilter);
  }, [receitas, categoriaReceitaFilter]);

  const receitasPorCategoria = useMemo(() => {
    return categoriasReceita.map((cat) => ({
      name: cat.nome,
      value: receitas
        .filter((t) => t.categoria === cat.nome)
        .reduce((sum, t) => sum + Number(t.valor), 0),
    }));
  }, [receitas, categoriasReceita]);

  const totalReceitasFiltradas = useMemo(
    () => receitasFiltradas.reduce((sum, t) => sum + Number(t.valor), 0),
    [receitasFiltradas]
  );

  const categoriasReceitaOptions = ["Todas", ...categoriasReceita.map((c) => c.nome)];

  const handleExportCSV = () => {
    const header = ["Data", "Descricao", "Responsavel", "categoria_receita", "Valor", "Status"];
    const rows = receitasFiltradas.map((t) => [
      t.data,
      t.descricao,
      t.responsavel,
      t.categoria || "",
      Number(t.valor).toFixed(2),
      t.status,
    ]);
    const escape = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
    const csv = [header, ...rows].map((r) => r.map(escape).join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `receitas-${format(currentDate, "yyyy-MM")}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };


  const despesas = useMemo(() => {
    return transactions.filter((t) => t.tipo !== "receita");
  }, [transactions]);

  const transacoesDaCategoriaSelecionada = useMemo(() => {
    if (!selectedCategoria) return [];
    return despesas
      .filter(t => t.categoria === selectedCategoria)
      .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
  }, [despesas, selectedCategoria]);

  const totalCategoriaSelecionada = useMemo(() => {
    return transacoesDaCategoriaSelecionada.reduce((sum, t) => sum + Number(t.valor), 0);
  }, [transacoesDaCategoriaSelecionada]);

  const despesasPorCategoria = useMemo(() => {
    const filtered = cartaoFilter === "Todos" 
      ? despesas 
      : despesas.filter(t => cartoes.find(c => c.id === t.cartao)?.nome === cartaoFilter);
    
    const categoriasTotals = filtered.reduce((acc, t) => {
      acc[t.categoria] = (acc[t.categoria] || 0) + Number(t.valor);
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(categoriasTotals).map(([name, value]) => ({ name, value }));
  }, [despesas, cartaoFilter, cartoes]);

  const despesasPorCartao = useMemo(() => {
    const filtered = categoriaFilter === "Todas" 
      ? despesas 
      : despesas.filter(t => t.categoria === categoriaFilter);
    
    const cartaosTotals = filtered.reduce((acc, t) => {
      const cartaoNome = cartoes.find(c => c.id === t.cartao)?.nome || "Sem cartão";
      acc[cartaoNome] = (acc[cartaoNome] || 0) + Number(t.valor);
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(cartaosTotals).map(([name, value]) => ({ name, value }));
  }, [despesas, categoriaFilter, cartoes]);

  const totalPorCartao = useMemo(() => {
    return cartoes.map(cartao => {
      const total = despesas
        .filter(t => t.cartao === cartao.id)
        .reduce((sum, t) => sum + Number(t.valor), 0);
      return { name: cartao.nome, value: total };
    }).filter(c => c.value > 0);
  }, [despesas, cartoes]);

  const totalPorCategoria = useMemo(() => {
    const allCategorias = [...new Set(despesas.map(t => t.categoria))];
    return allCategorias.map(cat => {
      const total = despesas
        .filter(t => t.categoria === cat)
        .reduce((sum, t) => sum + Number(t.valor), 0);
      return { name: cat, value: total };
    }).filter(c => c.value > 0);
  }, [despesas]);

  const COLORS = ["hsl(var(--liana))", "hsl(var(--stefany))", "hsl(var(--marilia))", "hsl(var(--nosso))", "hsl(var(--primary))", "hsl(var(--secondary))"];

  const cartoesOptions = ["Todos", ...cartoes.map(c => c.nome)];
  const categoriasOptions = ["Todas", ...categorias.map(c => c.nome)];

  const handleCategoriaClick = (categoriaName: string) => {
    setSelectedCategoria(categoriaName);
    setIsDetailModalOpen(true);
  };

  const getCartaoNome = (cartaoId: string | null) => {
    if (!cartaoId) return "—";
    return cartoes.find(c => c.id === cartaoId)?.nome || "—";
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Relatórios 📊</h1>
        <MonthNavigator currentDate={currentDate} onDateChange={setCurrentDate} />
      </div>

      <Tabs defaultValue="categorias" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="categorias">Por Categoria</TabsTrigger>
          <TabsTrigger value="cartoes">Por Cartão</TabsTrigger>
        </TabsList>

        <TabsContent value="categorias" className="space-y-6">
          <Card className="shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Despesas por Categoria</CardTitle>
                <Select value={cartaoFilter} onValueChange={setCartaoFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filtrar por cartão" />
                  </SelectTrigger>
                  <SelectContent>
                    {cartoesOptions.map((cartao) => (
                      <SelectItem key={cartao} value={cartao}>
                        {cartao}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {despesasPorCategoria.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={despesasPorCategoria}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {despesasPorCategoria.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatCurrency(Number(value), showValues)} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={despesasPorCategoria} layout="vertical">
                      <XAxis type="number" tickFormatter={(value) => formatCurrency(value, showValues)} />
                      <YAxis type="category" dataKey="name" width={100} />
                      <Tooltip formatter={(value) => formatCurrency(Number(value), showValues)} />
                      <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                        {despesasPorCategoria.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-12">Nenhuma despesa registrada</p>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Resumo por Categoria</CardTitle>
            </CardHeader>
            <CardContent>
              {totalPorCategoria.length > 0 ? (
                <div className="space-y-3">
                  {totalPorCategoria.sort((a, b) => b.value - a.value).map((cat, index) => (
                    <div 
                      key={cat.name} 
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50 cursor-pointer hover:bg-muted transition-colors"
                      onClick={() => handleCategoriaClick(cat.name)}
                    >
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="font-medium">{cat.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold">{formatCurrency(cat.value, showValues)}</span>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">Nenhuma despesa registrada</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cartoes" className="space-y-6">
          <Card className="shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Despesas por Cartão</CardTitle>
                <Select value={categoriaFilter} onValueChange={setCategoriaFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filtrar por categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categoriasOptions.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {despesasPorCartao.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={despesasPorCartao}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {despesasPorCartao.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatCurrency(Number(value), showValues)} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={despesasPorCartao} layout="vertical">
                      <XAxis type="number" tickFormatter={(value) => formatCurrency(value, showValues)} />
                      <YAxis type="category" dataKey="name" width={100} />
                      <Tooltip formatter={(value) => formatCurrency(Number(value), showValues)} />
                      <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                        {despesasPorCartao.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-12">Nenhuma despesa registrada</p>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Resumo por Cartão</CardTitle>
            </CardHeader>
            <CardContent>
              {totalPorCartao.length > 0 ? (
                <div className="space-y-3">
                  {totalPorCartao.sort((a, b) => b.value - a.value).map((cartao, index) => (
                    <div key={cartao.name} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="font-medium">💳 {cartao.name}</span>
                      </div>
                      <span className="font-bold">{formatCurrency(cartao.value, showValues)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">Nenhuma despesa com cartão registrada</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal de detalhes da categoria */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">{selectedCategoria}</DialogTitle>
          </DialogHeader>
          
          {transacoesDaCategoriaSelecionada.length > 0 ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Responsável</TableHead>
                    <TableHead>Cartão</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transacoesDaCategoriaSelecionada.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell>{format(new Date(t.data), "dd/MM/yyyy")}</TableCell>
                      <TableCell className="font-medium">{t.descricao}</TableCell>
                      <TableCell>{t.responsavel}</TableCell>
                      <TableCell>{getCartaoNome(t.cartao)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(t.valor, showValues)}</TableCell>
                      <TableCell>
                        <Badge variant={t.status === "Pago" || t.status === "Recebido" ? "default" : "secondary"}>
                          {t.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              <div className="flex justify-end pt-4 border-t">
                <div className="text-lg font-bold">
                  Total: {formatCurrency(totalCategoriaSelecionada, showValues)}
                </div>
              </div>
            </>
          ) : (
            <p className="text-center text-muted-foreground py-8">Nenhuma transação nesta categoria</p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
