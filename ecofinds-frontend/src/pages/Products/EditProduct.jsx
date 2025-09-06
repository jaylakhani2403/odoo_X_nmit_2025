import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { productService } from '../../services/productService';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import { toast } from 'react-toastify';

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors }, setValue } = useForm();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [product, setProduct] = useState(null);

  const categories = ['Electronics', 'Clothing', 'Books', 'Furniture', 'Toys', 'Sports', 'Miscellaneous'];

  useEffect(() => {
    loadProduct();
  }, [id]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const response = await productService.getProductById(id);
       if (response && response.product)  {
        const product = response.product;
        setProduct(product);
        
        // Set form values
        setValue('title', product.title);
        setValue('description', product.description);
        setValue('category', product.category);
        setValue('price', product.price);
        setValue('image_url', product.image_url || '');
      }
    } catch (error) {
      console.error('Error loading product:', error);
      toast.error('Product not found');
      navigate('/my-products');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      setSaving(true);
      const response = await productService.updateProduct(id, data);
      
      if (response.success) {
        toast.success('Product updated successfully!');
        navigate('/my-products');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to update product');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading product..." />;
  }

  if (!product) {
    return (
      <div className="container">
        <div className="empty-state">
          <h2>Product not found</h2>
          <button onClick={() => navigate('/my-products')} className="btn btn--primary">
            Back to My Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="edit-product-page">
      <div className="container">
        <div className="page-header">
          <h1>Edit Product</h1>
          <p>Update your product information</p>
        </div>

        <div className="product-form-container">
          <form onSubmit={handleSubmit(onSubmit)} className="product-form">
            <div className="form-group">
              <label htmlFor="title">Product Title</label>
              <input
                type="text"
                id="title"
                {...register('title', {
                  required: 'Product title is required',
                  minLength: {
                    value: 5,
                    message: 'Title must be at least 5 characters'
                  }
                })}
                className={errors.title ? 'form-input form-input--error' : 'form-input'}
                placeholder="Enter product title"
              />
              {errors.title && (
                <span className="form-error">{errors.title.message}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                rows={4}
                {...register('description', {
                  required: 'Product description is required',
                  minLength: {
                    value: 20,
                    message: 'Description must be at least 20 characters'
                  }
                })}
                className={errors.description ? 'form-textarea form-input--error' : 'form-textarea'}
                placeholder="Describe your product in detail"
              />
              {errors.description && (
                <span className="form-error">{errors.description.message}</span>
              )}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="category">Category</label>
                <select
                  id="category"
                  {...register('category', {
                    required: 'Please select a category'
                  })}
                  className={errors.category ? 'form-select form-input--error' : 'form-select'}
                >
                  <option value="">Select category</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                {errors.category && (
                  <span className="form-error">{errors.category.message}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="price">Price (₹)</label>
                <input
                  type="number"
                  id="price"
                  step="0.01"
                  min="1"
                  {...register('price', {
                    required: 'Price is required',
                    min: {
                      value: 1,
                      message: 'Price must be at least ₹1'
                    }
                  })}
                  className={errors.price ? 'form-input form-input--error' : 'form-input'}
                  placeholder="0.00"
                />
                {errors.price && (
                  <span className="form-error">{errors.price.message}</span>
                )}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="image_url">Image URL (optional)</label>
              <input
                type="url"
                id="image_url"
                {...register('image_url')}
                className="form-input"
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div className="form-actions">
              <button
                type="button"
                onClick={() => navigate('/my-products')}
                className="btn btn--outline"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn btn--primary"
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProduct;
