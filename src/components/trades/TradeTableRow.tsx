"use client";

import { TableCell, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { TradeActions } from "./TradeActions";

interface TradeRowProps {
  trade: any;
  isSelected: boolean;
  isSelectionMode: boolean;
  onToggleSelect: (id: string, checked: boolean) => void;
  onEdit: (trade: any) => void;
  onDelete: (id: string) => void;
}

export function TradeTableRow({
  trade,
  isSelected,
  isSelectionMode,
  onToggleSelect,
  onEdit,
  onDelete,
}: TradeRowProps) {
  const isNegative = trade.netAmount < 0;

  return (
    <TableRow
      className={`transition-colors hover:bg-muted/50 ${isSelected ? "bg-muted/50" : ""}`}
    >
      {isSelectionMode && (
        <TableCell className="w-[40px] px-4">
          <Checkbox
            className="rounded border data-[state=checked]:bg-blue-500 border-blue-500  data-[state=checked]:text-primary-foreground"
            checked={isSelected}
            onCheckedChange={(c) => onToggleSelect(trade._id, !!c)}
          />
        </TableCell>
      )}

      {/* Date */}
      <TableCell className="text-muted-foreground">
        {new Date(trade.transactionDate).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })}
      </TableCell>

      {/* Instrument */}
      <TableCell className="font-bold uppercase tracking-wide">
        {trade.instrument}
      </TableCell>

      {/* Trade Type Badge */}
      <TableCell className="text-center">
        <span
          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${
            trade.tradeType === "BUY"
              ? "bg-rose-500/10 text-rose-600 border-rose-500/20"
              : "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
          }`}
        >
          {trade.tradeType}
        </span>
      </TableCell>

      {/* Financials (Using font-mono for perfect alignment) */}
      <TableCell className="text-right font-mono font-medium">
        {trade.quantity.toLocaleString()}
      </TableCell>
      <TableCell className="text-right font-mono text-muted-foreground">
        {trade.rate.toFixed(2)}
      </TableCell>
      <TableCell className="text-right font-mono text-muted-foreground">
        {trade.commission.toFixed(2)}
      </TableCell>

      {/* Net Impact (Colored and Formatted) */}
      <TableCell
        className={`text-right font-mono font-bold ${isNegative ? "text-rose-600" : "text-emerald-600"}`}
      >
        {isNegative ? "" : "+"}
        {trade.netAmount.toLocaleString(undefined, {
          minimumFractionDigits: 2,
        })}
      </TableCell>

      {/* Actions */}
      <TableCell className="text-right">
        {/* <TradeActions trade={trade} onEdit={onEdit} onDelete={onDelete} /> */}
      </TableCell>
    </TableRow>
  );
}
