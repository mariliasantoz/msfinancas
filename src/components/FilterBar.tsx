import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";

interface FilterBarProps {
  onSearchChange: (value: string) => void;
  onResponsavelChange: (value: string) => void;
  onCartaoChange: (value: string) => void;
  onCategoriaChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  searchValue: string;
  responsavelValue: string;
  cartaoValue: string;
  categoriaValue: string;
  statusValue: string;
  showCartao?: boolean;
  showStatus?: boolean;
}

const responsaveis = ["Todos", "Liana", "Stefany", "Marília", "Nosso ❤️"];
const cartoes = ["Todos", "Nubank", "Santander", "Mercado Pago", "Amazon"];
const categorias = ["Todas", "Alimentação", "Transporte", "Saúde", "Educação", "Lazer", "Moradia", "Vestuário", "Outros"];
const status = ["Todos", "Pago", "A Pagar"];

export function FilterBar({
  onSearchChange,
  onResponsavelChange,
  onCartaoChange,
  onCategoriaChange,
  onStatusChange,
  searchValue,
  responsavelValue,
  cartaoValue,
  categoriaValue,
  statusValue,
  showCartao = true,
  showStatus = true,
}: FilterBarProps) {
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

      <Select value={responsavelValue} onValueChange={onResponsavelChange}>
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

      <Select value={categoriaValue} onValueChange={onCategoriaChange}>
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
        <Select value={cartaoValue} onValueChange={onCartaoChange}>
          <SelectTrigger>
            <SelectValue placeholder="Cartão" />
          </SelectTrigger>
          <SelectContent>
            {cartoes.map((cartao) => (
              <SelectItem key={cartao} value={cartao}>
                {cartao}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {showStatus && (
        <Select value={statusValue} onValueChange={onStatusChange}>
          <SelectTrigger>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {status.map((st) => (
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
