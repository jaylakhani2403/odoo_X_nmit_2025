import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { productService } from '../../services/productService';
import { toast } from 'react-toastify';

const AddProduct = () => {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);

  const categories = ['Electronics', 'Clothing', 'Books', 'Furniture', 'Toys', 'Sports', 'Miscellaneous'];

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const response = await productService.createProduct(data);
      
      if (response.success) {
        toast.success('Product added successfully! Waiting for approval.');
        navigate('/my-products');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to add product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-product-page">
      <div className="container">
        <div className="page-header">
          <h1>Add New Product</h1>
          <p>List your item for sale</p>
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
                disabled={loading}
              >
                {loading ? 'Adding...' : 'Add Product'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddProduct;
