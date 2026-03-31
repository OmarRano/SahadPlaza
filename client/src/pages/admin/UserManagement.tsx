/**
 * UserManagement.tsx — Admin: view, search and update user roles
 */

import { useState } from "react";
import DashboardHeader from "@/components/DashboardHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Users, Search } from "lucide-react";

const roleBadge: Record<string, string> = {
  admin:     "bg-red-100 text-red-800",
  manager:   "bg-blue-100 text-blue-800",
  delivery:  "bg-amber-100 text-amber-800",
  reader:    "bg-purple-100 text-purple-800",
  developer: "bg-green-100 text-green-800",
  buyer:     "bg-slate-100 text-slate-700",
};

export default function UserManagement() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const utils = trpc.useUtils();

  const { data: users, isLoading } = trpc.admin.users.useQuery({ limit: 100, offset: 0, role: roleFilter || undefined });

  const updateRole = trpc.admin.updateUserRole.useMutation({
    onSuccess: () => { toast.success("Role updated"); utils.admin.users.invalidate(); },
    onError: (e) => toast.error(e.message),
  });

  const toggleAffiliate = trpc.admin.enableAffiliate.useMutation({
    onSuccess: () => { toast.success("Affiliate status changed"); utils.admin.users.invalidate(); },
    onError: (e) => toast.error(e.message),
  });

  const filtered = (users ?? []).filter((u: any) =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardHeader title="User Management" subtitle="Manage platform users and roles" />
      <main className="container mx-auto px-4 py-8">
        {/* Filters */}
        <div className="flex gap-3 mb-6 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
            <Input placeholder="Search by name or email…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="border border-slate-200 rounded-md px-3 py-2 text-sm bg-white focus:outline-none"
          >
            <option value="">All Roles</option>
            {["admin","manager","delivery","developer","buyer","reader"].map(r => (
              <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
            ))}
          </select>
        </div>

        <Card className="border-0 shadow-md overflow-hidden">
          {isLoading ? (
            <div className="flex justify-center py-16">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center py-16 gap-3">
              <Users className="w-12 h-12 text-slate-300" />
              <p className="text-slate-500">No users found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b">
                  <tr>
                    {["Name","Email","Role","Status","Actions"].map(h => (
                      <th key={h} className="text-left px-4 py-3 font-medium text-slate-600">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((u: any) => (
                    <tr key={u._id} className="border-b hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-slate-800">{u.name}</td>
                      <td className="px-4 py-3 text-slate-600">{u.email}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${roleBadge[u.role] ?? "bg-slate-100 text-slate-600"}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${u.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                          {u.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2 flex-wrap">
                          {u.role === "buyer" && (
                            <Button
                              size="sm" variant="outline" className="h-7 text-xs"
                              onClick={() => toggleAffiliate.mutate({ userId: u._id.toString(), enable: true })}
                              disabled={toggleAffiliate.isPending}
                            >
                              Make Affiliate
                            </Button>
                          )}
                          {u.role === "reader" && (
                            <Button
                              size="sm" variant="outline" className="h-7 text-xs text-red-600 border-red-200"
                              onClick={() => toggleAffiliate.mutate({ userId: u._id.toString(), enable: false })}
                              disabled={toggleAffiliate.isPending}
                            >
                              Remove Affiliate
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <p className="text-xs text-slate-400 mt-3 text-right">{filtered.length} user{filtered.length !== 1 ? "s" : ""} shown</p>
      </main>
    </div>
  );
}
