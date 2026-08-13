import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { all_routes } from "../router/all_routes";
import axios from "axios";

// Define interfaces based on provided API response
interface Category {
  id: string;
  name: string;
  parentId: string | null;
  description: string;
}

interface Product {
  id: string;
  name: string;
  code: string | null;
  barcode: string;
  skuCode: string;
  skuName: string;
  description: string | null;
  productUrl: string;
  qrCodeUrl: string | null;
  purchasePrice: number;
  salesPrice: number;
  mrp: number;
  categoryId: string;
  categoryName: string;
  brandName: string;
}

const BooksOrder = () => {
  const routes = all_routes;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authToken, setAuthToken] = useState<string>("");

  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<Category[]>([]);
  
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>("");
  
  const [products, setProducts] = useState<Product[]>([]);

  // 1. Initial Auth and fetch main categories
  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        const localAxios = axios.create();

        // Authenticate
        const authRes = await localAxios.post("/books-api/api/authentication", {
          userName: "admin@gmail.com",
          password: "admin@123",
        });
        
        const token = authRes.data.bearerToken;
        if (!token) throw new Error("No token received");
        setAuthToken(token);

        // Fetch main categories
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const catRes = await localAxios.get("/books-api/api/ProductCategories", config);
        setCategories(catRes.data);
        
        setLoading(false);
      } catch (err: any) {
        setError(err.message || "An error occurred");
        setLoading(false);
      }
    };
    init();
  }, []);

  // 2. Fetch subcategories when selectedCategory changes
  useEffect(() => {
    if (!selectedCategory || !authToken) {
      setSubCategories([]);
      return;
    }
    const fetchSubCategories = async () => {
      try {
        const localAxios = axios.create();
        const config = { headers: { Authorization: `Bearer ${authToken}` } };
        const res = await localAxios.get(`/books-api/api/ProductCategories?Id=${selectedCategory}`, config);
        setSubCategories(res.data);
      } catch (e) {
        console.error("Failed to fetch subcategories", e);
      }
    };
    fetchSubCategories();
  }, [selectedCategory, authToken]);

  // 3. Fetch products when categories change (or initially after auth)
  useEffect(() => {
    if (!authToken) return;

    const fetchProducts = async () => {
      try {
        setLoading(true);
        const localAxios = axios.create();
        const config = { headers: { Authorization: `Bearer ${authToken}` } };
        
        let url = "/books-api/api/Product";
        const targetCategoryId = selectedSubCategory || selectedCategory;
        if (targetCategoryId) {
          url += `?CategoryId=${targetCategoryId}`;
        }

        const res = await localAxios.get(url, config);
        setProducts(res.data);
        setLoading(false);
      } catch (e) {
        console.error("Failed to fetch products", e);
        setLoading(false);
      }
    };
    fetchProducts();
  }, [selectedCategory, selectedSubCategory, authToken]);

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategory(e.target.value);
    setSelectedSubCategory(""); // Reset subcategory when main category changes
  };

  return (
    <div className="page-wrapper">
      <div className="content">
        <div className="d-md-flex d-block align-items-center justify-content-between mb-3">
          <div className="my-auto mb-2">
            <h3 className="page-title mb-1">Books Order</h3>
            <nav>
              <ol className="breadcrumb mb-0">
                <li className="breadcrumb-item">
                  <Link to={routes.adminDashboard}>Dashboard</Link>
                </li>
                <li className="breadcrumb-item active" aria-current="page">
                  Books Order
                </li>
              </ol>
            </nav>
          </div>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        <div className="row mb-4">
          <div className="col-md-4">
            <label className="form-label">Main Grade</label>
            <select className="form-select" value={selectedCategory} onChange={handleCategoryChange} disabled={!categories.length}>
              <option value="">All Grades</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div className="col-md-4">
            <label className="form-label">Sub Grade</label>
            <select 
              className="form-select" 
              value={selectedSubCategory} 
              onChange={(e) => setSelectedSubCategory(e.target.value)}
              disabled={!selectedCategory || !subCategories.length}
            >
              <option value="">All Subgrades</option>
              {subCategories.map(sub => (
                <option key={sub.id} value={sub.id}>{sub.name}</option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div>Loading products...</div>
        ) : (
          <div className="row">
            <div className="col-sm-12">
              <div className="card">
                <div className="card-header d-flex justify-content-between align-items-center">
                  <h5 className="card-title">Products</h5>
                </div>
                <div className="card-body">
                  <div className="table-responsive">
                    <table className="table table-bordered table-striped">
                      <thead>
                        <tr>
                          <th>Image</th>
                          <th>Name</th>
                          <th>Grade</th>
                          <th>Publisher</th>
                          <th>Sales Price</th>
                        </tr>
                      </thead>
                      <tbody>
                        {products.length === 0 ? (
                          <tr><td colSpan={5} className="text-center">No products found</td></tr>
                        ) : (
                          products.map((product) => {
                            const baseUrl = process.env.REACT_APP_BOOKS_API_URL || "http://72.61.148.72";
                            const imgUrl = product.productUrl 
                              ? (product.productUrl.startsWith('http') ? product.productUrl : `${baseUrl}/${product.productUrl.replace(/^\//, '')}`)
                              : "https://via.placeholder.com/50?text=No+Image";
                            
                            return (
                              <tr key={product.id}>
                                <td>
                                  <img src={imgUrl} alt={product.name} width="50" height="50" style={{ objectFit: 'cover', borderRadius: '4px' }} />
                                </td>
                                <td>
                                  <Link to={`/product-detail/${product.id}`} className="text-primary fw-bold">
                                    {product.name}
                                  </Link>
                                </td>
                                <td>{product.categoryName}</td>
                                <td>{product.brandName}</td>
                                <td>Rs {product.salesPrice}</td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BooksOrder;
