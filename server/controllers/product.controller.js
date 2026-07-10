// controllers/product.controller.js
import Product from '../models/Product.model.js';
import Category from '../models/Category.model.js';
import Supplier from '../models/Supplier.model.js';
import { uploadToCloudinary, deleteFromCloudinary, extractPublicId } from '../utils/cloudinary.utils.js';
import fs from 'fs';
import path from 'path';

// Create Product
export const createProduct = async (req, res) => {
  try {
    const {
      productName,
      category,
      supplier,
      purchasePrice,
      sellingPrice,
      quantity,
      minimumStockLevel,
      description
    } = req.body;

    // Validate required fields
    if (!productName || !category || !supplier || !purchasePrice || !sellingPrice) {
      return res.status(400).json({
        success: false,
        message: 'Product name, category, supplier, purchase price, and selling price are required'
      });
    }

    // Check if category exists
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Check if supplier exists
    const supplierExists = await Supplier.findById(supplier);
    if (!supplierExists) {
      return res.status(404).json({
        success: false,
        message: 'Supplier not found'
      });
    }

    // Prepare product data
    const productData = {
      productName,
      category,
      supplier,
      purchasePrice: parseFloat(purchasePrice),
      sellingPrice: parseFloat(sellingPrice),
      quantity: parseInt(quantity) || 0,
      minimumStockLevel: parseInt(minimumStockLevel) || 5,
      description,
      createdBy: req.user._id,
      updatedBy: req.user._id
    };

    // Handle image upload
    if (req.file) {
      try {
        const fileName = `product-${Date.now()}`;
        const result = await uploadToCloudinary(req.file.buffer, fileName, 'products');
        productData.productImage = result.secure_url;
        productData.imagePublicId = result.public_id;
        
        // Remove local file after cloudinary upload
        if (req.file.path) {
          fs.unlinkSync(req.file.path);
        }
      } catch (error) {
        console.error('Image upload error:', error);
        // Continue without image if upload fails
      }
    }

    // Create product
    const product = await Product.create(productData);

    // Populate references
    const populatedProduct = await Product.findById(product._id)
      .populate('category', 'name description')
      .populate('supplier', 'companyName contactPerson email');

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: populatedProduct
    });

  } catch (error) {
    console.error('Create product error:', error);
    
    // Handle duplicate product code error
    if (error.code === 11000 && error.keyPattern?.productCode) {
      return res.status(409).json({
        success: false,
        message: 'Product code already exists. Please try again.'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create product',
      error: error.message
    });
  }
};

// Get All Products with Pagination, Filtering, and Search
export const getProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      category,
      supplier,
      minPrice,
      maxPrice,
      stockStatus,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      isActive
    } = req.query;

    // Build filter
    const filter = {};

    // Text search
    if (search) {
      filter.$text = { $search: search };
    }

    // Category filter
    if (category) {
      filter.category = category;
    }

    // Supplier filter
    if (supplier) {
      filter.supplier = supplier;
    }

    // Price range
    if (minPrice || maxPrice) {
      filter.sellingPrice = {};
      if (minPrice) filter.sellingPrice.$gte = parseFloat(minPrice);
      if (maxPrice) filter.sellingPrice.$lte = parseFloat(maxPrice);
    }

    // Stock status filter
    if (stockStatus) {
      if (stockStatus === 'out-of-stock') {
        filter.quantity = 0;
      } else if (stockStatus === 'low-stock') {
        filter.$expr = { 
          $and: [
            { $gt: ['$quantity', 0] },
            { $lte: ['$quantity', '$minimumStockLevel'] }
          ]
        };
      } else if (stockStatus === 'in-stock') {
        filter.$expr = { $gt: ['$quantity', '$minimumStockLevel'] };
      }
    }

    // Active status filter
    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Sorting
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query
    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate('category', 'name description')
        .populate('supplier', 'companyName contactPerson email')
        .populate('createdBy', 'firstName lastName email')
        .sort(sort)
        .skip(skip)
        .limit(limitNum),
      Product.countDocuments(filter)
    ]);

    // Calculate statistics
    const stockStats = await Product.aggregate([
      {
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          totalValue: { $sum: { $multiply: ['$quantity', '$purchasePrice'] } },
          totalQuantity: { $sum: '$quantity' },
          lowStock: {
            $sum: {
              $cond: [
                { $and: [
                  { $gt: ['$quantity', 0] },
                  { $lte: ['$quantity', '$minimumStockLevel'] }
                ]},
                1,
                0
              ]
            }
          },
          outOfStock: {
            $sum: {
              $cond: [{ $eq: ['$quantity', 0] }, 1, 0]
            }
          }
        }
      }
    ]);

    const stats = stockStats[0] || {
      totalProducts: 0,
      totalValue: 0,
      totalQuantity: 0,
      lowStock: 0,
      outOfStock: 0
    };

    res.status(200).json({
      success: true,
      data: {
        products,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum)
        },
        stats: {
          ...stats,
          inStock: stats.totalProducts - stats.lowStock - stats.outOfStock
        }
      }
    });

  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products',
      error: error.message
    });
  }
};

// Get Single Product
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id)
      .populate('category', 'name description')
      .populate('supplier', 'companyName contactPerson email')
      .populate('createdBy', 'firstName lastName email')
      .populate('updatedBy', 'firstName lastName email');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.status(200).json({
      success: true,
      data: product
    });

  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product',
      error: error.message
    });
  }
};

// Update Product
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      productName,
      category,
      supplier,
      purchasePrice,
      sellingPrice,
      quantity,
      minimumStockLevel,
      description,
      isActive
    } = req.body;

    // Check if product exists
    const existingProduct = await Product.findById(id);
    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Validate category if provided
    if (category) {
      const categoryExists = await Category.findById(category);
      if (!categoryExists) {
        return res.status(404).json({
          success: false,
          message: 'Category not found'
        });
      }
    }

    // Validate supplier if provided
    if (supplier) {
      const supplierExists = await Supplier.findById(supplier);
      if (!supplierExists) {
        return res.status(404).json({
          success: false,
          message: 'Supplier not found'
        });
      }
    }

    // Prepare update data
    const updateData = {
      updatedBy: req.user._id
    };

    if (productName) updateData.productName = productName;
    if (category) updateData.category = category;
    if (supplier) updateData.supplier = supplier;
    if (purchasePrice !== undefined) updateData.purchasePrice = parseFloat(purchasePrice);
    if (sellingPrice !== undefined) updateData.sellingPrice = parseFloat(sellingPrice);
    if (quantity !== undefined) updateData.quantity = parseInt(quantity);
    if (minimumStockLevel !== undefined) updateData.minimumStockLevel = parseInt(minimumStockLevel);
    if (description !== undefined) updateData.description = description;
    if (isActive !== undefined) updateData.isActive = isActive === 'true';

    // Handle image update
    if (req.file) {
      try {
        // Delete old image from Cloudinary
        if (existingProduct.imagePublicId) {
          await deleteFromCloudinary(existingProduct.imagePublicId);
        }

        // Upload new image
        const fileName = `product-${Date.now()}`;
        const result = await uploadToCloudinary(req.file.buffer, fileName, 'products');
        updateData.productImage = result.secure_url;
        updateData.imagePublicId = result.public_id;

        // Remove local file
        if (req.file.path) {
          fs.unlinkSync(req.file.path);
        }
      } catch (error) {
        console.error('Image update error:', error);
      }
    }

    // Update product
    const product = await Product.findByIdAndUpdate(
      id,
      updateData,
      {
        new: true,
        runValidators: true
      }
    )
    .populate('category', 'name description')
    .populate('supplier', 'companyName contactPerson email')
    .populate('createdBy', 'firstName lastName email')
    .populate('updatedBy', 'firstName lastName email');

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: product
    });

  } catch (error) {
    console.error('Update product error:', error);

    if (error.code === 11000 && error.keyPattern?.productCode) {
      return res.status(409).json({
        success: false,
        message: 'Product code already exists. Please try again.'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update product',
      error: error.message
    });
  }
};

// Delete Product (Soft Delete)
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Soft delete - just deactivate
    product.isActive = false;
    product.updatedBy = req.user._id;
    await product.save();

    res.status(200).json({
      success: true,
      message: 'Product deactivated successfully',
      data: {
        id: product._id,
        productName: product.productName,
        productCode: product.productCode,
        isActive: product.isActive
      }
    });

  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete product',
      error: error.message
    });
  }
};

// Hard Delete Product (Admin only)
export const hardDeleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Delete image from Cloudinary
    if (product.imagePublicId) {
      try {
        await deleteFromCloudinary(product.imagePublicId);
      } catch (error) {
        console.error('Image deletion error:', error);
      }
    }

    await Product.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Product permanently deleted successfully'
    });

  } catch (error) {
    console.error('Hard delete product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to permanently delete product',
      error: error.message
    });
  }
};

// Update Product Stock
export const updateStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity, operation } = req.body;

    if (quantity === undefined || !operation) {
      return res.status(400).json({
        success: false,
        message: 'Quantity and operation (add/subtract) are required'
      });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const quantityToUpdate = parseInt(quantity);
    let newQuantity;

    if (operation === 'add') {
      newQuantity = product.quantity + quantityToUpdate;
    } else if (operation === 'subtract') {
      if (product.quantity < quantityToUpdate) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock. Available: ${product.quantity}`
        });
      }
      newQuantity = product.quantity - quantityToUpdate;
    } else {
      return res.status(400).json({
        success: false,
        message: 'Operation must be either "add" or "subtract"'
      });
    }

    product.quantity = newQuantity;
    product.updatedBy = req.user._id;
    await product.save();

    res.status(200).json({
      success: true,
      message: 'Stock updated successfully',
      data: {
        productId: product._id,
        productName: product.productName,
        previousQuantity: product.quantity - (operation === 'add' ? quantityToUpdate : -quantityToUpdate),
        newQuantity: product.quantity,
        stockStatus: product.stockStatus
      }
    });

  } catch (error) {
    console.error('Update stock error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update stock',
      error: error.message
    });
  }
};

// Bulk Upload Products
export const bulkCreateProducts = async (req, res) => {
  try {
    const { products } = req.body;

    if (!products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Products array is required'
      });
    }

    const createdProducts = [];
    const errors = [];

    for (let i = 0; i < products.length; i++) {
      try {
        const productData = products[i];
        
        // Validate category and supplier exist
        const [category, supplier] = await Promise.all([
          Category.findById(productData.category),
          Supplier.findById(productData.supplier)
        ]);

        if (!category) {
          errors.push({ index: i, product: productData.productName, error: 'Category not found' });
          continue;
        }
        if (!supplier) {
          errors.push({ index: i, product: productData.productName, error: 'Supplier not found' });
          continue;
        }

        const product = await Product.create({
          ...productData,
          createdBy: req.user._id,
          updatedBy: req.user._id
        });

        createdProducts.push(product);
      } catch (error) {
        errors.push({ index: i, product: products[i].productName, error: error.message });
      }
    }

    res.status(201).json({
      success: true,
      message: `${createdProducts.length} products created successfully`,
      data: {
        created: createdProducts.length,
        failed: errors.length,
        errors: errors,
        products: createdProducts
      }
    });

  } catch (error) {
    console.error('Bulk create error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to bulk create products',
      error: error.message
    });
  }
};