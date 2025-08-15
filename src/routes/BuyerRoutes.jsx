import { Routes, Route, Navigate } from 'react-router-dom';
import BuyerDashboard from '../pages/buyer/BuyerDashboard';
import ProductDetail from '../pages/buyer/ProductDetail';

const BuyerRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<BuyerDashboard />} />
      <Route path="/product/:productId" element={<ProductDetail />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default BuyerRoutes;