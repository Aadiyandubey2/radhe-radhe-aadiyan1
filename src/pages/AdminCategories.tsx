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
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Manage Categories</h1>
            <p className="text-sm text-muted-foreground">Configure dropdown options</p>
          </div>
        </div>

        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Settings2 className="h-5 w-5" />
              Category Management
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Add, edit, or remove categories
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as CategoryType)}>
              {/* Mobile: Select dropdown instead of tabs */}
              <div className="block sm:hidden mb-4">
                <Select value={activeTab} onValueChange={(v) => setActiveTab(v as CategoryType)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select category type" />
                  </SelectTrigger>
                  <SelectContent className="bg-background">
                    {categoryTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Desktop: Tab list */}
              <TabsList className="hidden sm:grid w-full grid-cols-5 mb-6">
                {categoryTypes.map((type) => (
                  <TabsTrigger key={type.value} value={type.value} className="text-xs">
                    {type.label}
                  </TabsTrigger>
                ))}
              </TabsList>

              {categoryTypes.map((type) => (
                <TabsContent key={type.value} value={type.value}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                    <div>
                      <h3 className="font-semibold text-sm sm:text-base">{type.label}</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground">{type.description}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={seedDefaults} disabled={isSeeding} className="flex-1 sm:flex-none text-xs">
                        {isSeeding ? "Adding..." : "Defaults"}
                      </Button>
                      <Dialog open={isAddOpen} onOpenChange={handleDialogClose}>
                        <DialogTrigger asChild>
                          <Button size="sm" onClick={() => { setEditingCategory(null); setFormData({ name: "", description: "" }); }} className="flex-1 sm:flex-none text-xs">
                            <Plus className="h-4 w-4 mr-1" />
                            Add
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-[95vw] sm:max-w-md">
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
                          <DialogFooter className="flex-col sm:flex-row gap-2">
                            <Button variant="outline" onClick={() => handleDialogClose(false)} className="w-full sm:w-auto">Cancel</Button>
                            <Button onClick={handleSubmit} disabled={createCategory.isPending || updateCategory.isPending} className="w-full sm:w-auto">
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
                    <>
                      {/* Mobile: Card layout */}
                      <div className="block sm:hidden space-y-3">
                        {categories.map((category) => (
                          <div key={category.id} className="border rounded-lg p-3 bg-card">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm truncate">{category.name}</p>
                                <p className="text-xs text-muted-foreground truncate">{category.description || "No description"}</p>
                              </div>
                              <Badge variant={category.is_active ? "default" : "secondary"} className="text-xs shrink-0">
                                {category.is_active ? "Active" : "Inactive"}
                              </Badge>
                            </div>
                            <div className="flex gap-2 mt-3 pt-3 border-t">
                              <Button variant="outline" size="sm" onClick={() => handleEdit(category)} className="flex-1 text-xs">
                                <Pencil className="h-3 w-3 mr-1" /> Edit
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => handleDelete(category.id)} className="flex-1 text-xs text-destructive">
                                <Trash2 className="h-3 w-3 mr-1" /> Delete
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Desktop: Table layout */}
                      <div className="hidden sm:block">
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
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-6 sm:py-8 border rounded-lg bg-muted/30">
                      <p className="text-muted-foreground mb-2 text-sm">No categories found</p>
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
