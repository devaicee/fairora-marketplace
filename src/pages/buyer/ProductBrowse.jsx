import { useState, useEffect } from 'react';
import { db } from '../../firebase/firebaseConfig';
import { collection, query, where, orderBy, getDocs, limit, startAfter } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import '../../styles/product-browse.css';

const ProductBrowse = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const navigate = useNavigate();

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'digital-assets', label: 'Digital Assets' },
    { value: 'creative', label: 'Creative' },
    { value: 'knowledge', label: 'Knowledge' },
    { value: 'technology', label: 'Technology' },
    { value: 'business', label: 'Business' },
    { value: 'education', label: 'Education' },
    { value: 'entertainment', label: 'Entertainment' }
  ];

  const productsPerPage = 12;

  useEffect(() => {
    loadProducts();
  }, [selectedCategory, sortBy, searchTerm]);

  const loadProducts = async (loadMore = false) => {
    try {
      setLoading(!loadMore);

      let baseQuery = collection(db, 'creator_forms');
      let constraints = [where('status', '==', 'approved')];

      if (selectedCategory !== 'all') {
        constraints.push(where('category', '==', selectedCategory));
      }

      switch (sortBy) {
        case 'newest':
          constraints.push(orderBy('createdAt', 'desc'));
          break;
        case 'oldest':
          constraints.push(orderBy('createdAt', 'asc'));
          break;
        case 'price-low':
          constraints.push(orderBy('productPrice', 'asc'));
          break;
        case 'price-high':
          constraints.push(orderBy('productPrice', 'desc'));
          break;
        case 'popular':
          constraints.push(orderBy('purchaseCount', 'desc'));
          break;
        default:
          constraints.push(orderBy('createdAt', 'desc'));
      }

      constraints.push(limit(productsPerPage));

      const q = query(baseQuery, ...constraints);
      const querySnapshot = await getDocs(q);
      
      let productsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        purchaseCount: doc.data().purchaseCount || 0,
        rating: doc.data().rating || 0,
        reviewCount: doc.data().reviewCount || 0
      }));

      if (searchTerm) {
        productsData = productsData.filter(product =>
          product.productTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.productDescription?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.creatorName?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      if (loadMore) {
        setProducts(prev => [...prev, ...productsData]);
      } else {
        setProducts(productsData);
        setCurrentPage(1);
      }

      setHasMore(productsData.length === productsPerPage);

    } catch (error) {
      console.error('Error loading products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  const handleSortChange = (sort) => {
    setSortBy(sort);
    setCurrentPage(1);
  };

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  const loadMoreProducts = () => {
    setCurrentPage(prev => prev + 1);
    loadProducts(true);
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={`star ${i <= rating ? 'filled' : ''}`}>
          ⭐
        </span>
      );
    }
    return stars;
  };

  const formatPrice = (price) => {
    if (!price || price === 0) return 'Free';
    return `${price} Credits`;
  };

  if (loading && products.length === 0) {
    return (
      <div className="browse-loading">
        <div className="loading-spinner">Loading products...</div>
      </div>
    );
  }

  return (
    <div className="product-browse">
      <div className="browse-header">
        <h1>Browse Digital Products</h1>
        <p>Discover amazing digital products from our creators</p>
      </div>

      <div className="browse-controls">
        <div className="search-section">
          <input
            type="text"
            placeholder="Search products, creators, or keywords..."
            value={searchTerm}
            onChange={handleSearch}
            className="search-input"
          />
        </div>

        <div className="filter-section">
          <div className="filter-group">
            <label>Category:</label>
            <select
              value={selectedCategory}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="filter-select"
            >
              {categories.map(category => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Sort by:</label>
            <select
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value)}
              className="filter-select"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="popular">Most Popular</option>
            </select>
          </div>
        </div>
      </div>

      <div className="products-section">
        <div className="results-info">
          <p>{products.length} products found</p>
        </div>

        {products.length > 0 ? (
          <>
            <div className="products-grid">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="product-card"
                  onClick={() => handleProductClick(product.id)}
                >
                  <div className="product-image">
                    <img
                      src={product.productImageUrl || "src/assets/images/placeholder.jpg"}
                      alt={product.productTitle}
                      onError={(e) => {
                        e.target.src = 'src/assets/images/placeholder.jpg';
                      }}
                    />
                    <div className="product-badge">
                      {product.category}
                    </div>
                  </div>

                  <div className="product-content">
                    <h3 className="product-title">{product.productTitle}</h3>
                    <p className="product-creator">by {product.creatorName}</p>
                    
                    <div className="product-description">
                      {product.productDescription?.substring(0, 100)}...
                    </div>

                    <div className="product-stats">
                      <div className="rating">
                        <div className="stars">
                          {renderStars(Math.round(product.rating || 0))}
                        </div>
                        <span className="review-count">
                          ({product.reviewCount || 0} reviews)
                        </span>
                      </div>
                      <div className="purchase-count">
                        {product.purchaseCount || 0} purchases
                      </div>
                    </div>

                    <div className="product-footer">
                      <div className="product-price">
                        {formatPrice(product.productPrice)}
                      </div>
                      <button className="view-btn">
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {hasMore && (
              <div className="load-more-section">
                <button
                  onClick={loadMoreProducts}
                  className="load-more-btn"
                  disabled={loading}
                >
                  {loading ? 'Loading...' : 'Load More Products'}
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="no-products">
            <div className="no-products-icon">🔍</div>
            <h3>No products found</h3>
            <p>Try adjusting your search criteria or browse different categories.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductBrowse;