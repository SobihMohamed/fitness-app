"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { AdminLayout } from "@/components/admin/admin-layout";
import { toast } from "react-hot-toast";

const API_BASE = "http://localhost:8000/AdminProducts";

const categories = [
  { id: 1, name: "Supplements" },
  { id: 2, name: "Equipment" },
  { id: 3, name: "Technology" },
  { id: 4, name: "Apparel" },
];

export default function ProductsManagement() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    category_id: "",
    price: "",
    is_in_stock: "",
    description: "",
    image_url: "",
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  const itemsPerPage = 5;
  const [currentPage, setCurrentPage] = useState(1);

  const getAuthHeaders = () => {
    const token = localStorage.getItem("adminAuth");
    return { Authorization: `Bearer ${token}` };
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API_BASE}/getAll`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to fetch products");
      }
      const result = await res.json();
      const data = result.data || result.products || result || [];
      const formattedData = data.map((product: any) => ({
        product_id: product.product_id,
        name: product.name,
        image_url: product.image_url
          ? extractFilename(product.image_url)
          : null,
        price: product.price,
        description: product.description,
        is_in_stock: product.is_in_stock || "0",
        category_id: product.category_id,
      }));
      setProducts(formattedData);
    } catch (err: any) {
      console.error("Fetch error:", err);
      toast.error(err.message || "Error loading products");
    } finally {
      setLoading(false);
    }
  };

  const extractFilename = (path: string): string => {
    if (!path) return "";
    const filename = path.split(/[/\\]/).pop() || "";
    return filename;
  };

  const parseResponse = async (response: Response) => {
    const responseText = await response.text();
    try {
      return JSON.parse(responseText);
    } catch (e) {
      return {
        status: response.ok ? "success" : "error",
        message:
          responseText ||
          (response.ok ? "Operation completed" : "Operation failed"),
      };
    }
  };

  const filteredProducts = products.filter(
    (p: any) =>
      p.name?.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (selectedCategory === "all" ||
        p.category_id?.toString() === selectedCategory)
  );

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.price) {
      toast.error("Name and price are required");
      return;
    }
    const formDataToSend = new FormData();
    formDataToSend.append("name", formData.name);
    formDataToSend.append("price", formData.price);
    formDataToSend.append("description", formData.description);
    formDataToSend.append("category_id", formData.category_id);
    formDataToSend.append("is_in_stock", formData.is_in_stock);
    if (selectedImage) {
      formDataToSend.append("image_url", selectedImage);
    }
    try {
      const endpoint = editingProduct
        ? `updateProduct/${editingProduct.product_id}`
        : "addProduct";
      const res = await fetch(`${API_BASE}/${endpoint}`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: formDataToSend,
      });
      const result = await parseResponse(res);
      if (!res.ok) throw new Error(result.message || "Failed to save product");

      toast.success(result.message || "Product saved successfully");
      await fetchProducts();
      setFormData({
        name: "",
        category_id: "",
        price: "",
        is_in_stock: "",
        description: "",
        image_url: "",
      });
      setSelectedImage(null);
      setEditingProduct(null);
      setIsAddDialogOpen(false);
    } catch (err: any) {
      console.error("Error saving product", err);
      toast.error(err.message || "Something went wrong");
    }
  };

  const handleEdit = (product: any) => {
    setEditingProduct(product);
    setFormData({
      name: product.name || "",
      category_id: product.category_id?.toString() || "",
      price: product.price?.toString() || "",
      is_in_stock: product.is_in_stock?.toString() || "",
      description: product.description || "",
      image_url: product.image_url || "",
    });
    setSelectedImage(null);
    setIsAddDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    const confirmDelete = window.confirm("Are you sure?");
    if (!confirmDelete) return;
    try {
      const res = await fetch(`${API_BASE}/deleteProduct/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      const result = await parseResponse(res);
      if (!res.ok) throw new Error(result.message || "Delete failed");

      toast.success(result.message || "Deleted");
      await fetchProducts();
    } catch (err: any) {
      console.error("Delete error", err);
      toast.error(err.message || "Delete failed");
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="text-lg text-gray-600 animate-pulse">
          Loading products...
        </div>
      </div>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">📦 Product Management</h1>
        <div className="flex gap-4 mb-4">
          <Input
            placeholder="🔍 Search for a product..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
          <Select
            value={selectedCategory}
            onValueChange={(val) => setSelectedCategory(val)}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id.toString()}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            ➕ Add Product
          </Button>
        </div>

        {/* PRODUCT TABLE */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedProducts.map((product: any) => (
                <TableRow key={product.product_id}>
                  <TableCell>
                    <div className="w-12 h-12 relative">
                      <Image
                        src={
                          product.image_url
                            ? `http://localhost:8000/uploads/${product.image_url}`
                            : "/placeholder.svg"
                        }
                        alt={product.name}
                        fill
                        className="object-cover rounded"
                      />
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>
                    {categories.find((cat) => cat.id === product.category_id)
                      ?.name || product.category_id}
                  </TableCell>
                  <TableCell>${product.price}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        product.is_in_stock === "1"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {product.is_in_stock === "1"
                        ? "In stock"
                        : "Out of stock"}
                    </span>
                  </TableCell>
                  <TableCell className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(product)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(product.product_id)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* No results */}
          {filteredProducts.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No products found
            </div>
          )}

          {/* Pagination Controls */}
          <div className="flex justify-center gap-2 p-4">
            {Array.from({ length: totalPages }, (_, i) => (
              <Button
                key={i}
                variant={currentPage === i + 1 ? "default" : "outline"}
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </Button>
            ))}
          </div>
        </div>

        {/* Dialog for Add/Edit */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingProduct ? "Edit Product" : "Add New Product"}
              </DialogTitle>
              <DialogDescription>
                {editingProduct
                  ? "Modify the product details."
                  : "Fill in to add a new product."}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-4">
              {/* Form Fields */}
              <div>
                <label className="block text-sm mb-1">Product Name *</label>
                <Input
                  placeholder="Name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <label className="block text-sm mb-1">Category</label>
                <Select
                  value={formData.category_id}
                  onValueChange={(val) =>
                    setFormData({ ...formData, category_id: val })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id.toString()}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm mb-1">Price *</label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="Price"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <label className="block text-sm mb-1">Stock Quantity</label>
                <Select
                  value={formData.is_in_stock}
                  onValueChange={(val) =>
                    setFormData({ ...formData, is_in_stock: val })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select stock status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">In stock</SelectItem>
                    <SelectItem value="0">Out of stock</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm mb-1">Description</label>
                <Textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      description: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <label className="block text-sm mb-1">Image</label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                />
                {selectedImage && (
                  <p className="text-sm mt-1 text-gray-500">
                    Selected: {selectedImage.name}
                  </p>
                )}
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1">
                  {editingProduct ? "Save Changes" : "Add Product"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddDialogOpen(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
