import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Settings2 } from "lucide-react";
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory, CategoryType, Category, defaultCategories } from "@/hooks/useCategories";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const categoryTypes: { value: CategoryType; label: string; description: string }[] = [
  { value: "vehicle_type", label: "Vehicle Types", description: "Types of vehicles in your fleet" },
  { value: "expense_category", label: "Expense Categories", description: "Categories for tracking expenses" },
  { value: "goods_type", label: "Goods Types", description: "Types of goods transported" },
  { value: "fuel_type", label: "Fuel Types", description: "Fuel options for vehicles" },
  { value: "payment_method", label: "Payment Methods", description: "Accepted payment methods" },
];

export default function AdminCategories() {
  const [activeTab, setActiveTab] = useState<CategoryType>("vehicle_type");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [isSeeding, setIsSeeding] = useState(false);

  const { user } = useAuth();
  const { data: categories, isLoading, refetch } = useCategories(activeTab);
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast.error("Name is required");
      return;
    }

    try {
      if (editingCategory) {
        await updateCategory.mutateAsync({
          id: editingCategory.id,
          name: formData.name,
          description: formData.description || null,
        });
      } else {
        await createCategory.mutateAsync({
          type: activeTab,
          name: formData.name,
          description: formData.description || undefined,
        });
      }

      setFormData({ name: "", description: "" });
      setIsAddOpen(false);
      setEditingCategory(null);
    } catch (error) {
      // Error is already handled by mutation
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({ name: category.name, description: category.description || "" });
    setIsAddOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this category?")) {
      await deleteCategory.mutateAsync(id);
    }
  };

  const handleDialogClose = (open: boolean) => {
    if (!open) {
      setFormData({ name: "", description: "" });
      setEditingCategory(null);
    }
    setIsAddOpen(open);
  };

  const seedDefaults = async () => {
    if (!user) return;
    
    setIsSeeding(true);
    const toSeed = defaultCategories.filter((dc) => dc.type === activeTab);
    let addedCount = 0;
    
    for (const cat of toSeed) {
      const { error } = await supabase
        .from("categories")
        .insert({ ...cat, user_id: user.id });
      
      if (!error) addedCount++;
    }
    
    await refetch();
    setIsSeeding(false);
    
    if (addedCount > 0) {
      toast.success(`Added ${addedCount} default categories`);
    } else {
      toast.info("All default categories already exist");
    }
  };

  const currentTypeInfo = categoryTypes.find((t) => t.value === activeTab);

  return (
    <AppLayout title="Manage Categories" subtitle="Configure all dropdown options">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Manage Categories</h1>
            <p className="text-muted-foreground">Configure all dropdown options across your application</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings2 className="h-5 w-5" />
              Category Management
            </CardTitle>
            <CardDescription>
              Add, edit, or remove categories that appear in dropdowns throughout the app
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as CategoryType)}>
              <TabsList className="grid w-full grid-cols-5 mb-6">
                {categoryTypes.map((type) => (
                  <TabsTrigger key={type.value} value={type.value} className="text-xs">
                    {type.label}
                  </TabsTrigger>
                ))}
              </TabsList>

              {categoryTypes.map((type) => (
                <TabsContent key={type.value} value={type.value}>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-semibold">{type.label}</h3>
                      <p className="text-sm text-muted-foreground">{type.description}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={seedDefaults} disabled={isSeeding}>
                        {isSeeding ? "Adding..." : "Add Defaults"}
                      </Button>
                      <Dialog open={isAddOpen} onOpenChange={handleDialogClose}>
                        <DialogTrigger asChild>
                          <Button size="sm" onClick={() => { setEditingCategory(null); setFormData({ name: "", description: "" }); }}>
                            <Plus className="h-4 w-4 mr-2" />
                            Add New
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>{editingCategory ? "Edit" : "Add"} {currentTypeInfo?.label.slice(0, -1)}</DialogTitle>
                            <DialogDescription>
                              {editingCategory ? "Update the category details" : "Create a new category option"}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label>Name *</Label>
                              <Input
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Category name"
                              />
                            </div>
                            <div>
                              <Label>Description</Label>
                              <Textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Optional description"
                                rows={2}
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button variant="outline" onClick={() => handleDialogClose(false)}>Cancel</Button>
                            <Button onClick={handleSubmit} disabled={createCategory.isPending || updateCategory.isPending}>
                              {createCategory.isPending || updateCategory.isPending ? "Saving..." : editingCategory ? "Update" : "Create"}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>

                  {isLoading ? (
                    <div className="text-center py-8 text-muted-foreground">Loading...</div>
                  ) : categories && categories.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {categories.map((category) => (
                          <TableRow key={category.id}>
                            <TableCell className="font-medium">{category.name}</TableCell>
                            <TableCell className="text-muted-foreground">{category.description || "-"}</TableCell>
                            <TableCell>
                              <Badge variant={category.is_active ? "default" : "secondary"}>
                                {category.is_active ? "Active" : "Inactive"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="icon" onClick={() => handleEdit(category)}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => handleDelete(category.id)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-8 border rounded-lg bg-muted/30">
                      <p className="text-muted-foreground mb-2">No categories found</p>
                      <Button variant="outline" size="sm" onClick={seedDefaults} disabled={isSeeding}>
                        {isSeeding ? "Adding..." : `Add Default ${type.label}`}
                      </Button>
                    </div>
                  )}
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
