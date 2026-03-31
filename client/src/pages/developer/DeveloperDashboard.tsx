import { useState } from "react";
import DashboardHeader from "@/components/DashboardHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Edit2, Trash2, MapPin, Users, Store } from "lucide-react";
import { toast } from "sonner";

interface StoreData {
  id: string;
  storeCode: string;
  storeName: string;
  email: string;
  adminName: string;
  adminEmail: string;
  branches: number;
  managers: number;
  status: "active" | "inactive";
  logo?: string;
  createdDate: string;
}

interface BranchData {
  id: string;
  branchCode: string;
  branchName: string;
  storeId: string;
  storeName: string;
  managerName?: string;
  address: string;
  city: string;
  phone: string;
  status: "active" | "inactive";
}

interface ManagerData {
  id: string;
  name: string;
  email: string;
  username: string;
  storeAssignments: string[];
  branchAssignments: string[];
  status: "active" | "inactive";
  joinDate: string;
}

export default function DeveloperDashboard() {
  const [stores, setStores] = useState<StoreData[]>([
    {
      id: "1",
      storeCode: "STORE-001",
      storeName: "Main Store",
      email: "admin@mainstore.stores.com",
      adminName: "Ahmed Hassan",
      adminEmail: "ahmed@mainstore.stores.com",
      branches: 3,
      managers: 5,
      status: "active",
      createdDate: "2026-01-15",
    },
  ]);

  const [branches, setBranches] = useState<BranchData[]>([
    {
      id: "1",
      branchCode: "BR-001",
      branchName: "Lagos Branch",
      storeId: "1",
      storeName: "Main Store",
      managerName: "Chioma Okafor",
      address: "123 Lekki Road, Lagos",
      city: "Lagos",
      phone: "+234 701 234 5678",
      status: "active",
    },
  ]);

  const [managers, setManagers] = useState<ManagerData[]>([
    {
      id: "1",
      name: "Chioma Okafor",
      email: "chioma@mainstore.stores.com",
      username: "chioma_manager",
      storeAssignments: ["STORE-001"],
      branchAssignments: ["BR-001"],
      status: "active",
      joinDate: "2026-02-01",
    },
  ]);

  const [newStore, setNewStore] = useState({ storeName: "", adminName: "", adminEmail: "", phone: "" });
  const [newBranch, setNewBranch] = useState({ branchName: "", storeId: "", address: "", city: "", phone: "" });
  const [newManager, setNewManager] = useState({ name: "", email: "", username: "", password: "", storeId: "" });

  const handleCreateStore = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStore.storeName || !newStore.adminName || !newStore.adminEmail) {
      toast.error("Please fill in all required fields");
      return;
    }

    const storeCode = `STORE-${String(stores.length + 1).padStart(3, "0")}`;
    const store: StoreData = {
      id: (stores.length + 1).toString(),
      storeCode,
      storeName: newStore.storeName,
      email: `admin@${newStore.storeName.toLowerCase().replace(/\s+/g, "")}.stores.com`,
      adminName: newStore.adminName,
      adminEmail: newStore.adminEmail,
      branches: 0,
      managers: 0,
      status: "active",
      createdDate: new Date().toISOString().split("T")[0],
    };

    setStores([...stores, store]);
    setNewStore({ storeName: "", adminName: "", adminEmail: "", phone: "" });
    toast.success(`Store "${newStore.storeName}" created successfully!`);
  };

  const handleCreateBranch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBranch.branchName || !newBranch.storeId || !newBranch.address || !newBranch.city) {
      toast.error("Please fill in all required fields");
      return;
    }

    const branchCode = `BR-${String(branches.length + 1).padStart(3, "0")}`;
    const store = stores.find((s) => s.id === newBranch.storeId);

    const branch: BranchData = {
      id: (branches.length + 1).toString(),
      branchCode,
      branchName: newBranch.branchName,
      storeId: newBranch.storeId,
      storeName: store?.storeName || "",
      address: newBranch.address,
      city: newBranch.city,
      phone: newBranch.phone,
      status: "active",
    };

    setBranches([...branches, branch]);
    setNewBranch({ branchName: "", storeId: "", address: "", city: "", phone: "" });
    toast.success(`Branch "${newBranch.branchName}" created successfully!`);
  };

  const handleCreateManager = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newManager.name || !newManager.email || !newManager.username || !newManager.password) {
      toast.error("Please fill in all required fields");
      return;
    }

    const manager: ManagerData = {
      id: (managers.length + 1).toString(),
      name: newManager.name,
      email: newManager.email,
      username: newManager.username,
      storeAssignments: [newManager.storeId],
      branchAssignments: [],
      status: "active",
      joinDate: new Date().toISOString().split("T")[0],
    };

    setManagers([...managers, manager]);
    setNewManager({ name: "", email: "", username: "", password: "", storeId: "" });
    toast.success(`Manager "${newManager.name}" created successfully!`);
  };

  const handleDeleteStore = (id: string) => {
    setStores(stores.filter((s) => s.id !== id));
    toast.success("Store deleted successfully");
  };

  const handleDeleteBranch = (id: string) => {
    setBranches(branches.filter((b) => b.id !== id));
    toast.success("Branch deleted successfully");
  };

  const handleDeleteManager = (id: string) => {
    setManagers(managers.filter((m) => m.id !== id));
    toast.success("Manager deleted successfully");
  };

  const totalStores = stores.length;
  const totalBranches = branches.length;
  const totalManagers = managers.length;
  const activeStores = stores.filter((s) => s.status === "active").length;

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardHeader title="Developer Dashboard" subtitle="Manage stores, branches, and managers" />

      <main className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Total Stores</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-slate-900">{totalStores}</p>
              <p className="text-xs text-green-600 mt-1">{activeStores} active</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Total Branches</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-slate-900">{totalBranches}</p>
              <p className="text-xs text-slate-600 mt-1">Across all stores</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Total Managers</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-slate-900">{totalManagers}</p>
              <p className="text-xs text-slate-600 mt-1">Store & branch managers</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Avg Branches/Store</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-slate-900">
                {totalStores > 0 ? (totalBranches / totalStores).toFixed(1) : "0"}
              </p>
              <p className="text-xs text-slate-600 mt-1">Per store</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="stores" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto">
            <TabsTrigger value="stores">Stores</TabsTrigger>
            <TabsTrigger value="branches">Branches</TabsTrigger>
            <TabsTrigger value="managers">Managers</TabsTrigger>
          </TabsList>

          {/* Stores Tab */}
          <TabsContent value="stores">
            <div className="space-y-6">
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="w-4 h-4" />
                    Create New Store
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Create New Store</DialogTitle>
                    <DialogDescription>
                      Add a new store and assign an admin. The admin will receive @stores.com email credentials.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleCreateStore} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="storeName">Store Name *</Label>
                      <Input
                        id="storeName"
                        placeholder="e.g., Premium Electronics"
                        value={newStore.storeName}
                        onChange={(e) => setNewStore({ ...newStore, storeName: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="adminName">Admin Name *</Label>
                      <Input
                        id="adminName"
                        placeholder="Full name of admin"
                        value={newStore.adminName}
                        onChange={(e) => setNewStore({ ...newStore, adminName: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="adminEmail">Admin Email *</Label>
                      <Input
                        id="adminEmail"
                        type="email"
                        placeholder="admin@example.com"
                        value={newStore.adminEmail}
                        onChange={(e) => setNewStore({ ...newStore, adminEmail: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        placeholder="+234 701 234 5678"
                        value={newStore.phone}
                        onChange={(e) => setNewStore({ ...newStore, phone: e.target.value })}
                      />
                    </div>
                    <Button type="submit" className="w-full">
                      Create Store
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>

              <div className="space-y-4">
                {stores.map((store) => (
                  <Card key={store.id} className="border-0 shadow-md">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Store className="w-5 h-5 text-blue-600" />
                            <h3 className="font-semibold text-slate-900">{store.storeName}</h3>
                            <Badge className={store.status === "active" ? "bg-green-100 text-green-800" : "bg-slate-100 text-slate-800"}>
                              {store.status.toUpperCase()}
                            </Badge>
                          </div>
                          <p className="text-sm text-slate-600">Code: {store.storeCode}</p>
                          <p className="text-sm text-slate-600">Admin: {store.adminName}</p>
                          <p className="text-sm text-slate-600">Email: {store.email}</p>
                          <div className="flex gap-4 mt-2 text-sm">
                            <span className="text-slate-600">
                              <strong>{store.branches}</strong> branches
                            </span>
                            <span className="text-slate-600">
                              <strong>{store.managers}</strong> managers
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleDeleteStore(store.id)} className="text-red-600">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Branches Tab */}
          <TabsContent value="branches">
            <div className="space-y-6">
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="w-4 h-4" />
                    Create New Branch
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Create New Branch</DialogTitle>
                    <DialogDescription>Add a new branch location with address and manager assignment.</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleCreateBranch} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="storeId">Select Store *</Label>
                      <select
                        id="storeId"
                        className="w-full px-3 py-2 border border-slate-300 rounded-md"
                        value={newBranch.storeId}
                        onChange={(e) => setNewBranch({ ...newBranch, storeId: e.target.value })}
                      >
                        <option value="">Choose a store</option>
                        {stores.map((store) => (
                          <option key={store.id} value={store.id}>
                            {store.storeName}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="branchName">Branch Name *</Label>
                      <Input
                        id="branchName"
                        placeholder="e.g., Lagos Main Branch"
                        value={newBranch.branchName}
                        onChange={(e) => setNewBranch({ ...newBranch, branchName: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address">Address *</Label>
                      <Input
                        id="address"
                        placeholder="Street address"
                        value={newBranch.address}
                        onChange={(e) => setNewBranch({ ...newBranch, address: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        placeholder="City name"
                        value={newBranch.city}
                        onChange={(e) => setNewBranch({ ...newBranch, city: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="branchPhone">Phone</Label>
                      <Input
                        id="branchPhone"
                        placeholder="+234 701 234 5678"
                        value={newBranch.phone}
                        onChange={(e) => setNewBranch({ ...newBranch, phone: e.target.value })}
                      />
                    </div>
                    <Button type="submit" className="w-full">
                      Create Branch
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>

              <div className="space-y-4">
                {branches.map((branch) => (
                  <Card key={branch.id} className="border-0 shadow-md">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <MapPin className="w-5 h-5 text-amber-600" />
                            <h3 className="font-semibold text-slate-900">{branch.branchName}</h3>
                            <Badge className={branch.status === "active" ? "bg-green-100 text-green-800" : "bg-slate-100 text-slate-800"}>
                              {branch.status.toUpperCase()}
                            </Badge>
                          </div>
                          <p className="text-sm text-slate-600">Code: {branch.branchCode}</p>
                          <p className="text-sm text-slate-600">Store: {branch.storeName}</p>
                          <p className="text-sm text-slate-600">{branch.address}, {branch.city}</p>
                          {branch.managerName && <p className="text-sm text-slate-600">Manager: {branch.managerName}</p>}
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleDeleteBranch(branch.id)} className="text-red-600">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Managers Tab */}
          <TabsContent value="managers">
            <div className="space-y-6">
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="w-4 h-4" />
                    Create Manager
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Create New Manager</DialogTitle>
                    <DialogDescription>Create login credentials for a manager to access their store/branch dashboard.</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleCreateManager} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="managerName">Manager Name *</Label>
                      <Input
                        id="managerName"
                        placeholder="Full name"
                        value={newManager.name}
                        onChange={(e) => setNewManager({ ...newManager, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="managerEmail">Email *</Label>
                      <Input
                        id="managerEmail"
                        type="email"
                        placeholder="manager@store.stores.com"
                        value={newManager.email}
                        onChange={(e) => setNewManager({ ...newManager, email: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="managerUsername">Username *</Label>
                      <Input
                        id="managerUsername"
                        placeholder="manager_username"
                        value={newManager.username}
                        onChange={(e) => setNewManager({ ...newManager, username: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="managerPassword">Password *</Label>
                      <Input
                        id="managerPassword"
                        type="password"
                        placeholder="Secure password"
                        value={newManager.password}
                        onChange={(e) => setNewManager({ ...newManager, password: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="managerStore">Assign to Store *</Label>
                      <select
                        id="managerStore"
                        className="w-full px-3 py-2 border border-slate-300 rounded-md"
                        value={newManager.storeId}
                        onChange={(e) => setNewManager({ ...newManager, storeId: e.target.value })}
                      >
                        <option value="">Choose a store</option>
                        {stores.map((store) => (
                          <option key={store.id} value={store.id}>
                            {store.storeName}
                          </option>
                        ))}
                      </select>
                    </div>
                    <Button type="submit" className="w-full">
                      Create Manager
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>

              <div className="space-y-4">
                {managers.map((manager) => (
                  <Card key={manager.id} className="border-0 shadow-md">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Users className="w-5 h-5 text-purple-600" />
                            <h3 className="font-semibold text-slate-900">{manager.name}</h3>
                            <Badge className={manager.status === "active" ? "bg-green-100 text-green-800" : "bg-slate-100 text-slate-800"}>
                              {manager.status.toUpperCase()}
                            </Badge>
                          </div>
                          <p className="text-sm text-slate-600">Username: {manager.username}</p>
                          <p className="text-sm text-slate-600">Email: {manager.email}</p>
                          <p className="text-sm text-slate-600">Joined: {manager.joinDate}</p>
                          <div className="mt-2 text-sm">
                            <span className="text-slate-600">
                              Assigned to <strong>{manager.storeAssignments.length}</strong> store(s)
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleDeleteManager(manager.id)} className="text-red-600">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
