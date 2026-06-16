// components/PortfolioTable.tsx
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2, Edit2, TrendingDown } from "lucide-react";

export function PortfolioTable({ data, onSell, onEdit, onDelete }: any) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Company</TableHead>
          <TableHead>Holdings</TableHead>
          <TableHead>Avg Rate</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data?.portfolio?.map((item: any) => (
          <TableRow key={item._id}>
            <TableCell className="font-medium">{item.companyName}</TableCell>
            <TableCell>{item.currentQuantity}</TableCell>
            <TableCell>৳{item.averageBuyRate.toFixed(2)}</TableCell>
            <TableCell className="text-right flex justify-end gap-2">
              <Button size="sm" variant="outline" onClick={() => onSell(item)}>
                <TrendingDown className="w-4 h-4 mr-1" /> Sell
              </Button>
              <Button size="sm" variant="ghost" onClick={() => onEdit(item)}>
                <Edit2 className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => onDelete(item._id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
