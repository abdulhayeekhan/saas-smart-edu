import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { all_routes } from "../router/all_routes";
import axios from "axios";

const ProductDetail = () => {
  const routes = all_routes;
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [product, setProduct] = useState<any>(null);
  const [quantity, setQuantity] = useState<string>("");

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const localAxios = axios.create();

        // 1. Authenticate to get a token
        const authRes = await localAxios.post("/books-api/api/authentication", {
          userName: "admin@gmail.com",
          password: "admin@123",
        });
        
        const token = authRes.data.bearerToken;
        if (!token) throw new Error("No token received");

        // 2. Fetch product details
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const res = await localAxios.get(`/books-api/api/Product/${id}`, config);
        const fetchedProduct = res.data;

        // 3. Fetch Brands
        let matchedBrand = null;
        try {
          const brandRes = await localAxios.get("/books-api/api/Brands", config);
          const brands = brandRes.data;
          matchedBrand = brands.find((b: any) => b.id === fetchedProduct.brandId);
          if (matchedBrand) {
            fetchedProduct.brandName = matchedBrand.name;
            fetchedProduct.brandImageUrl = matchedBrand.imageUrl;
          }
        } catch (e) {
          console.error("Failed to fetch brands", e);
        }

        // 4. Fetch Category List and Match
        try {
          const listRes = await localAxios.get(`/books-api/api/ProductCategories`, config);
          const mainCategories = listRes.data;
          let matchedCategory = mainCategories.find((c: any) => c.id === fetchedProduct.categoryId);
          
          if (!matchedCategory && mainCategories.length > 0) {
            // Fetch subcategories for all main categories concurrently to find the match
            const subCatPromises = mainCategories.map((c: any) => 
              localAxios.get(`/books-api/api/ProductCategories?Id=${c.id}`, config)
            );
            const subCatResponses = await Promise.all(subCatPromises);
            const allSubCategories = subCatResponses.flatMap(res => res.data);
            
            matchedCategory = allSubCategories.find((c: any) => c.id === fetchedProduct.categoryId);
          }

          if (matchedCategory) {
            fetchedProduct.categoryName = matchedCategory.name;
          }
        } catch (err) {
          console.error("Failed to fetch category list", err);
        }

        setProduct(fetchedProduct);
        
        setLoading(false);
      } catch (err: any) {
        setError(err.message || "An error occurred");
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  const handleQuantityChange = (value: string) => {
    const parsed = parseInt(value, 10);
    if (!isNaN(parsed) && parsed > 0) {
      setQuantity(parsed.toString());
    } else if (value === "") {
      setQuantity("");
    }
  };

  const handleAddToCart = () => {
    const qty = parseInt(quantity, 10);
    if (qty && qty > 0) {
      alert(`Added ${qty} of "${product.name}" to cart!`);
      setQuantity("");
    } else {
      alert("Please enter a valid positive quantity first.");
    }
  };

  const baseUrl = process.env.REACT_APP_BOOKS_API_URL || "http://72.61.148.72";
  const imgUrl = product?.productUrl 
    ? (product.productUrl.startsWith('http') ? product.productUrl : `${baseUrl}/${product.productUrl.replace(/^\//, '')}`)
    : "https://via.placeholder.com/250?text=No+Image";

  return (
    <div className="page-wrapper">
      <div className="content">
        <div className="d-md-flex d-block align-items-center justify-content-between mb-3">
          <div className="my-auto mb-2">
            <h3 className="page-title mb-1">Product Details</h3>
            <nav>
              <ol className="breadcrumb mb-0">
                <li className="breadcrumb-item">
                  <Link to={routes.adminDashboard}>Dashboard</Link>
                </li>
                <li className="breadcrumb-item">
                  <Link to={routes.booksOrder}>Books Order</Link>
                </li>
                <li className="breadcrumb-item active" aria-current="page">
                  Product Details
                </li>
              </ol>
            </nav>
          </div>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        {loading ? (
          <div>Loading product details...</div>
        ) : product ? (
          <div className="row">
            <div className="col-md-12">
              <div className="card">
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-4">
                      <img src={imgUrl} alt={product.name} className="img-fluid rounded" style={{ width: '100%', maxHeight: '400px', objectFit: 'cover' }} />
                    </div>
                    <div className="col-md-8">
                      <h4>{product.name}</h4>
                      <div className="d-flex align-items-center mt-2 mb-3">
                        <span className="badge bg-primary me-2">{product.categoryName || 'No Category'}</span>
                        {product.brandImageUrl ? (
                          <span className="badge bg-secondary d-flex align-items-center">
                            <img 
                              src={product.brandImageUrl.startsWith('http') ? product.brandImageUrl : `${baseUrl}/${product.brandImageUrl.replace(/^\//, '')}`} 
                              alt={product.brandName} 
                              style={{ width: '20px', height: '20px', marginRight: '5px', borderRadius: '50%' }} 
                            />
                            {product.brandName}
                          </span>
                        ) : (
                          <span className="badge bg-secondary">{product.brandName || 'No Brand'}</span>
                        )}
                      </div>
                      
                      <div className="mt-4">
                        <h5>Description</h5>
                        <p>{product.description || 'No description available.'}</p>
                      </div>

                      <div className="mt-4">
                        <table className="table table-bordered">
                          <tbody>
                            <tr>
                              <th style={{ width: '30%' }}>Sales Price</th>
                              <td>Rs {product.salesPrice}</td>
                            </tr>
                            <tr>
                              <th>Tax Amount</th>
                              <td>{product.taxAmount || 'N/A'}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                      
                      <div className="mt-4 d-flex align-items-center bg-light p-3 rounded">
                        <label className="me-3 fw-bold mb-0">Quantity:</label>
                        <input 
                          type="number" 
                          className="form-control me-3" 
                          style={{ width: '100px' }} 
                          min="1" 
                          step="1"
                          placeholder="Qty"
                          value={quantity}
                          onChange={(e) => handleQuantityChange(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === '.' || e.key === '-' || e.key === 'e') {
                              e.preventDefault();
                            }
                          }}
                        />
                        <button 
                          className="btn btn-primary"
                          onClick={handleAddToCart}
                        >
                          <i className="ti ti-shopping-cart me-2"></i> Add to Cart
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default ProductDetail;
