import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";
import { useCartoes } from "@/hooks/useCartoes";

interface FilterBarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  responsavelFilter: string;
  onResponsavelChange: (value: string) => void;
  cartaoFilter: string;
  onCartaoChange: (value: string) => void;
  categoriaFilter: string;
  onCategoriaChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (value: string) => void;
  showCartao?: boolean;
  showStatus?: boolean;
}

const responsaveis = ["Todos", "Liana", "Stefany", "Marília", "Nosso ❤️"];
const categorias = ["Todas", "Alimentação", "Transporte", "Saúde", "Educação", "Lazer", "Moradia", "Vestuário", "Outros"];
const statusOptions = ["Todos", "Pago", "A Pagar", "Recebido", "A Receber"];

export function FilterBar({
  searchValue,
  onSearchChange,
  responsavelFilter,
  onResponsavelChange,
  cartaoFilter,
  onCartaoChange,
  categoriaFilter,
  onCategoriaChange,
  statusFilter,
  onStatusChange,
  showCartao = true,
  showStatus = true,
}: FilterBarProps) {
  const { cartoes } = useCartoes();
  const cartoesOptions = ["Todos", ...cartoes.map(c => c.nome)];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      <div className="relative lg:col-span-2">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por descrição ou valor..."
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      <Select value={responsavelFilter} onValueChange={onResponsavelChange}>
        <SelectTrigger>
          <SelectValue placeholder="Responsável" />
        </SelectTrigger>
        <SelectContent>
          {responsaveis.map((resp) => (
            <SelectItem key={resp} value={resp}>
              {resp}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={categoriaFilter} onValueChange={onCategoriaChange}>
        <SelectTrigger>
          <SelectValue placeholder="Categoria" />
        </SelectTrigger>
        <SelectContent>
          {categorias.map((cat) => (
            <SelectItem key={cat} value={cat}>
              {cat}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {showCartao && (
        <Select value={cartaoFilter} onValueChange={onCartaoChange}>
          <SelectTrigger>
            <SelectValue placeholder="Cartão" />
          </SelectTrigger>
          <SelectContent>
            {cartoesOptions.map((cartao) => (
              <SelectItem key={cartao} value={cartao}>
                {cartao}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {showStatus && (
        <Select value={statusFilter} onValueChange={onStatusChange}>
          <SelectTrigger>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((st) => (
              <SelectItem key={st} value={st}>
                {st}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}
