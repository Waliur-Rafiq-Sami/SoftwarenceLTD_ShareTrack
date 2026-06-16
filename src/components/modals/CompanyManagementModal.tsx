"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Building2, Trash2, Edit2, Check, X } from "lucide-react";

interface Company {
  companyName: string;
  shareQuantity: number;
  totalNetProfit: number;
}

interface CompanyManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegistryChange?: () => void;
}

export default function CompanyManagementModal({
  isOpen,
  onClose,
  onRegistryChange,
}: CompanyManagementModalProps) {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  const [newCompany, setNewCompany] = useState<string>("");
  const [editingCompany, setEditingCompany] = useState<string | null>(null);
  const [modifiedName, setModifiedName] = useState<string>("");

  useEffect(() => {
    if (isOpen) fetchCompanies();
  }, [isOpen]);

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/company");
      const data = await res.json();
      if (data.success) setCompanies(data.companies || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompany.trim()) return;
    setActionLoading(true);
    try {
      const res = await fetch("/api/company", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyName: newCompany.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setNewCompany("");
        fetchCompanies();
        if (onRegistryChange) onRegistryChange();
      } else alert(data.message);
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdate = async (oldName: string) => {
    if (!modifiedName.trim() || oldName === modifiedName.trim().toUpperCase()) {
      setEditingCompany(null);
      return;
    }
    setActionLoading(true);
    try {
      const res = await fetch("/api/company", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          oldCompanyName: oldName,
          newCompanyName: modifiedName.trim(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setEditingCompany(null);
        fetchCompanies();
        if (onRegistryChange) onRegistryChange();
      } else alert(data.message);
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (name: string) => {
    if (!confirm(`Are you absolutely sure you want to drop ${name}?`)) return;
    setActionLoading(true);
    try {
      const res = await fetch("/api/company", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyName: name }),
      });
      const data = await res.json();
      if (data.success) {
        fetchCompanies();
        if (onRegistryChange) onRegistryChange();
      } else alert(data.message);
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <DialogHeader>
          <DialogTitle className="text-base font-bold tracking-tight flex items-center gap-2">
            <Building2 className="w-5 h-5 text-indigo-600" />
            Corporate Directory Registry
          </DialogTitle>
          <DialogDescription className="text-xs">
            Manage your legal enterprise nodes. Modification cascading applies
            immediately.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleCreate} className="flex gap-2 items-center pt-2">
          <Input
            placeholder="ADD NEW COMPANY (e.g. SQUARE)"
            value={newCompany}
            onChange={(e) => setNewCompany(e.target.value)}
            className="h-9 text-xs uppercase font-semibold"
            disabled={actionLoading}
          />
          <Button
            type="submit"
            disabled={actionLoading || !newCompany.trim()}
            size="sm"
            className="bg-indigo-600 hover:bg-indigo-700 h-9 px-4"
          >
            {actionLoading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              "Register"
            )}
          </Button>
        </form>

        <div className="space-y-2 mt-2 max-h-[300px] overflow-y-auto pr-1">
          {loading ? (
            <div className="flex justify-center p-6 text-slate-400 text-xs italic gap-2 items-center">
              <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />{" "}
              Synchronization ongoing...
            </div>
          ) : companies.length === 0 ? (
            <p className="text-center py-6 text-xs text-slate-400 italic border border-dashed rounded-xl">
              No active nodes registered in matrix.
            </p>
          ) : (
            companies.map((c) => {
              const isEditing = editingCompany === c.companyName;
              const canDelete = c.shareQuantity === 0;

              return (
                <div
                  key={c.companyName}
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/50 hover:bg-slate-50 dark:hover:bg-zinc-800/60 transition-all"
                >
                  {isEditing ? (
                    <div className="flex items-center gap-1.5 flex-1 mr-4">
                      <Input
                        value={modifiedName}
                        onChange={(e) => setModifiedName(e.target.value)}
                        className="h-8 text-xs font-bold uppercase flex-1"
                        autoFocus
                      />
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                        onClick={() => handleUpdate(c.companyName)}
                        disabled={actionLoading}
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                        onClick={() => setEditingCompany(null)}
                        disabled={actionLoading}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900 dark:text-zinc-100 tracking-tight">
                          {c.companyName}
                        </span>
                        <Badge
                          variant="outline"
                          className={`text-[9px] px-1.5 py-0 rounded ${
                            c.shareQuantity > 0
                              ? "bg-indigo-50 border-indigo-200 text-indigo-600 dark:bg-indigo-950/40 dark:border-indigo-900 dark:text-indigo-400"
                              : "bg-slate-100 border-slate-200 text-slate-500 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-400"
                          }`}
                        >
                          Holding: {c.shareQuantity}
                        </Badge>
                      </div>
                      <p className="text-[10px] font-mono text-slate-400 mt-0.5">
                        Net Realized: ৳{c.totalNetProfit.toFixed(2)}
                      </p>
                    </div>
                  )}

                  {!isEditing && (
                    <div className="flex items-center gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-slate-500 hover:text-slate-900 dark:hover:text-zinc-100"
                        onClick={() => {
                          setEditingCompany(c.companyName);
                          setModifiedName(c.companyName);
                        }}
                        disabled={actionLoading}
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        disabled={!canDelete || actionLoading}
                        className={`h-8 w-8 ${
                          canDelete
                            ? "text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 hover:text-rose-600"
                            : "text-slate-300 dark:text-zinc-700 cursor-not-allowed"
                        }`}
                        onClick={() => handleDelete(c.companyName)}
                        title={
                          !canDelete
                            ? "Cannot delete company with active stock quantity"
                            : "Purge node"
                        }
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
