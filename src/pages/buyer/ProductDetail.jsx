import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { auth, db } from '../../firebase/firebaseConfig';
import { doc, getDoc, runTransaction, collection, query, where, getDocs, addDoc, updateDoc } from 'firebase/firestore';
import '../../styles/product-detail.css';

const ProductDetail = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [creator, setCreator] = useState(null);
  const [userCredits, setUserCredits] = useState(0);
  const [reviews, setReviews] = useState([]);
  const [userReview, setUserReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewData, setReviewData] = useState({ rating: 5, comment: '' });

  useEffect(() => {
    loadProductDetails();
  }, [productId]);

  const loadProductDetails = async () => {
    try {
      const productDoc = await getDoc(doc(db, 'creator_forms', productId));
      if (!productDoc.exists()) {
        setMessage({ text: 'Product not found', type: 'error' });
        setLoading(false);
        return;
      }

      const productData = { id: productDoc.id, ...productDoc.data() };
      setProduct(productData);

      if (productData.creatorId) {
        const creatorDoc = await getDoc(doc(db, 'users', productData.creatorId));
        if (creatorDoc.exists()) {
          setCreator(creatorDoc.data());
        }
      }

      if (auth.currentUser) {
        const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUserCredits(userData.credits || 0);
          
          const purchaseHistory = userData.purchaseHistory || [];
          const purchased = purchaseHistory.some(purchase => purchase.productId === productId);
          setHasPurchased(purchased);
        }

        await loadReviews();
      }

    } catch (error) {
      console.error('Error loading product details:', error);
      setMessage({ text: 'Error loading product details', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const loadReviews = async () => {
    try {
      const reviewsQuery = query(
        collection(db, 'reviews'),
        where('productId', '==', productId)
      );
      const reviewsSnapshot = await getDocs(reviewsQuery);
      const reviewsData = reviewsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setReviews(reviewsData);

      const currentUserReview = reviewsData.find(
        review => review.userId === auth.currentUser?.uid
      );
      setUserReview(currentUserReview);

    } catch (error) {
      console.error('Error loading reviews:', error);
    }
  };

  const handlePurchase = async () => {
    if (!auth.currentUser) {
      navigate('/login');
      return;
    }

    if (!product || purchasing) return;

    const price = product.productPrice || 0;

    if (price > 0 && userCredits < price) {
      setMessage({ text: 'Insufficient credits', type: 'error' });
      return;
    }

    setPurchasing(true);

    try {
      await runTransaction(db, async (transaction) => {
        const buyerRef = doc(db, 'users', auth.currentUser.uid);
        const creatorRef = doc(db, 'users', product.creatorId);
        const productRef = doc(db, 'creator_forms', productId);

        const buyerDoc = await transaction.get(buyerRef);
        const creatorDoc = await transaction.get(creatorRef);
        const productDoc = await transaction.get(productRef);

        if (!buyerDoc.exists() || !creatorDoc.exists() || !productDoc.exists()) {
          throw new Error('Required documents do not exist');
        }

        const buyerData = buyerDoc.data();
        const creatorData = creatorDoc.data();
        const productData = productDoc.data();

        if (price > 0 && (buyerData.credits || 0) < price) {
          throw new Error('Insufficient credits');
        }

        const purchaseRecord = {
          productId: productId,
          productTitle: product.productTitle,
          creatorId: product.creatorId,
          creatorName: product.creatorName,
          price: price,
          timestamp: new Date().toISOString(),
          productFiles: product.productFiles || []
        };

        const transactionRecord = {
          id: Date.now().toString(),
          type: 'purchase',
          amount: price,
          productId: productId,
          productTitle: product.productTitle,
          timestamp: new Date().toISOString(),
          description: `Purchased ${product.productTitle}`
        };

        const creatorTransaction = {
          id: Date.now().toString() + '_sale',
          type: 'sale',
          amount: price,
          productId: productId,
          productTitle: product.productTitle,
          buyerId: auth.currentUser.uid,
          timestamp: new Date().toISOString(),
          description: `Sale of ${product.productTitle}`
        };

        transaction.update(buyerRef, {
          credits: (buyerData.credits || 0) - price,
          purchaseHistory: [...(buyerData.purchaseHistory || []), purchaseRecord],
          transactionHistory: [...(buyerData.transactionHistory || []), transactionRecord]
        });

        transaction.update(creatorRef, {
          credits: (creatorData.credits || 0) + price,
          transactionHistory: [...(creatorData.transactionHistory || []), creatorTransaction]
        });

        transaction.update(productRef, {
          purchaseCount: (productData.purchaseCount || 0) + 1
        });
      });

      setHasPurchased(true);
      setUserCredits(prev => prev - price);
      setMessage({ text: 'Purchase successful! You now have access to the product.', type: 'success' });

    } catch (error) {
      console.error('Purchase error:', error);
      setMessage({ text: error.message || 'Purchase failed', type: 'error' });
    } finally {
      setPurchasing(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    
    if (!hasPurchased) {
      setMessage({ text: 'You must purchase this product to leave a review', type: 'error' });
      return;
    }

    if (!reviewData.comment.trim()) {
      setMessage({ text: 'Please enter a comment', type: 'error' });
      return;
    }

    try {
      const reviewDoc = {
        productId: productId,
        userId: auth.currentUser.uid,
        userName: auth.currentUser.displayName || 'Anonymous User',
        rating: reviewData.rating,
        comment: reviewData.comment.trim(),
        timestamp: new Date().toISOString()
      };

      if (userReview) {
        await updateDoc(doc(db, 'reviews', userReview.id), reviewDoc);
        setMessage({ text: 'Review updated successfully!', type: 'success' });
      } else {
        await addDoc(collection(db, 'reviews'), reviewDoc);
        setMessage({ text: 'Review submitted successfully!', type: 'success' });
      }

      setShowReviewForm(false);
      setReviewData({ rating: 5, comment: '' });
      await loadReviews();
      
    } catch (error) {
      console.error('Error submitting review:', error);
      setMessage({ text: 'Error submitting review', type: 'error' });
    }
  };

  const renderStars = (rating, interactive = false, onStarClick = null) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span
          key={i}
          className={`star ${i <= rating ? 'filled' : ''} ${interactive ? 'interactive' : ''}`}
          onClick={() => interactive && onStarClick && onStarClick(i)}
        >
          ⭐
        </span>
      );
    }
    return stars;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
    : 0;

  if (loading) {
    return <div className="detail-loading">Loading product details...</div>;
  }

  if (!product) {
    return <div className="product-not-found">Product not found</div>;
  }

  return (
    <div className="product-detail">
      <button onClick={() => navigate('/browse')} className="back-btn">
        ← Back to Browse
      </button>

      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="product-main">
        <div className="product-image-section">
          <img
            src={product.productImageUrl || "src/assets/images/placeholder.jpg"}
            alt={product.productTitle}
            className="main-product-image"
            onError={(e) => {
              e.target.src = 'src/assets/images/placeholder.jpg';
            }}
          />
        </div>

        <div className="product-info-section">
          <div className="product-header">
            <span className="product-category">{product.category}</span>
            <h1>{product.productTitle}</h1>
            <div className="creator-info">
              <span>by {product.creatorName}</span>
              {creator && (
                <span className="creator-badge">
                  {creator.role === 'creator' ? 'Verified Creator' : 'Creator'}
                </span>
              )}
            </div>
          </div>

          <div className="product-stats">
            <div className="rating-section">
              <div className="stars-large">
                {renderStars(Math.round(averageRating))}
              </div>
              <span className="rating-text">
                {averageRating.toFixed(1)} ({reviews.length} reviews)
              </span>
            </div>
            <div className="purchase-count">
              {product.purchaseCount || 0} purchases
            </div>
          </div>

          <div className="product-description">
            <h3>Description</h3>
            <p>{product.productDescription}</p>
          </div>

          <div className="purchase-section">
            <div className="price-section">
              <span className="price">
                {product.productPrice > 0 ? `${product.productPrice} Credits` : 'Free'}
              </span>
              {auth.currentUser && (
                <span className="user-credits">
                  Your Credits: {userCredits}
                </span>
              )}
            </div>

            {hasPurchased ? (
              <div className="purchased-section">
                <div className="purchased-badge">✅ Purchased</div>
                {product.productFiles && product.productFiles.length > 0 && (
                  <div className="product-files">
                    <h4>Your Files:</h4>
                    {product.productFiles.map((file, index) => (
                      <a
                        key={index}
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="file-link"
                      >
                        📎 {file.name}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={handlePurchase}
                disabled={purchasing || !auth.currentUser}
                className="purchase-btn"
              >
                {purchasing ? 'Processing...' : 
                 !auth.currentUser ? 'Login to Purchase' :
                 product.productPrice > 0 ? `Purchase for ${product.productPrice} Credits` : 'Get Free Product'}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="reviews-section">
        <div className="reviews-header">
          <h3>Reviews ({reviews.length})</h3>
          {hasPurchased && !showReviewForm && (
            <button
              onClick={() => setShowReviewForm(true)}
              className="write-review-btn"
            >
              {userReview ? 'Edit Review' : 'Write Review'}
            </button>
          )}
        </div>

        {showReviewForm && (
          <form onSubmit={handleReviewSubmit} className="review-form">
            <div className="rating-input">
              <label>Rating:</label>
              <div className="stars-input">
                {renderStars(reviewData.rating, true, (rating) =>
                  setReviewData(prev => ({ ...prev, rating }))
                )}
              </div>
            </div>
            <div className="comment-input">
              <label>Comment:</label>
              <textarea
                value={reviewData.comment}
                onChange={(e) => setReviewData(prev => ({ ...prev, comment: e.target.value }))}
                placeholder="Share your thoughts about this product..."
                required
              />
            </div>
            <div className="review-actions">
              <button type="submit" className="submit-review-btn">
                {userReview ? 'Update Review' : 'Submit Review'}
              </button>
              <button
                type="button"
                onClick={() => setShowReviewForm(false)}
                className="cancel-review-btn"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        <div className="reviews-list">
          {reviews.length > 0 ? (
            reviews.map((review) => (
              <div key={review.id} className="review-item">
                <div className="review-header">
                  <div className="reviewer-info">
                    <span className="reviewer-name">{review.userName}</span>
                    <div className="review-stars">
                      {renderStars(review.rating)}
                    </div>
                  </div>
                  <span className="review-date">{formatDate(review.timestamp)}</span>
                </div>
                <p className="review-comment">{review.comment}</p>
              </div>
            ))
          ) : (
            <div className="no-reviews">
              <p>No reviews yet. Be the first to review this product!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;