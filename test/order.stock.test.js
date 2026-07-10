// tests/order.stock.test.js
import mongoose from 'mongoose';
import Order from '../models/Order.model.js';
import Product from '../models/Product.model.js';
import { createOrderWithStockUpdate } from '../services/order.service.js';

describe('Atomic Stock Update Tests', () => {
  let testProduct;

  beforeEach(async () => {
    testProduct = await Product.create({
      productName: 'Test Product',
      productCode: 'ASE-PRD-9999',
      category: categoryId,
      supplier: supplierId,
      purchasePrice: 10,
      sellingPrice: 20,
      quantity: 10,
      minimumStockLevel: 2
    });
  });

  test('Should atomically decrement stock on order creation', async () => {
    const orderData = {
      customerName: 'Test Customer',
      customerEmail: 'test@example.com',
      items: [{
        product: testProduct._id,
        quantity: 3,
        unitPrice: 20,
        purchasePrice: 10
      }]
    };

    const order = await createOrderWithStockUpdate(orderData, userId);
    
    const updatedProduct = await Product.findById(testProduct._id);
    expect(updatedProduct.quantity).toBe(7);
  });

  test('Should reject order if insufficient stock', async () => {
    const orderData = {
      customerName: 'Test Customer',
      customerEmail: 'test@example.com',
      items: [{
        product: testProduct._id,
        quantity: 15, // More than available (10)
        unitPrice: 20,
        purchasePrice: 10
      }]
    };

    await expect(
      createOrderWithStockUpdate(orderData, userId)
    ).rejects.toThrow('Insufficient stock');
  });

  test('Should handle concurrent order creation correctly', async () => {
    const orderData1 = {
      customerName: 'Customer 1',
      customerEmail: 'c1@example.com',
      items: [{
        product: testProduct._id,
        quantity: 6,
        unitPrice: 20,
        purchasePrice: 10
      }]
    };

    const orderData2 = {
      customerName: 'Customer 2',
      customerEmail: 'c2@example.com',
      items: [{
        product: testProduct._id,
        quantity: 5,
        unitPrice: 20,
        purchasePrice: 10
      }]
    };

    // Try to create both orders concurrently
    const results = await Promise.allSettled([
      createOrderWithStockUpdate(orderData1, userId),
      createOrderWithStockUpdate(orderData2, userId)
    ]);

    // Only one should succeed
    const successCount = results.filter(r => r.status === 'fulfilled').length;
    expect(successCount).toBe(1);

    const finalProduct = await Product.findById(testProduct._id);
    expect(finalProduct.quantity).toBe(4);
  });

  test('Should restock on order cancellation', async () => {
    const orderData = {
      customerName: 'Test Customer',
      customerEmail: 'test@example.com',
      items: [{
        product: testProduct._id,
        quantity: 3,
        unitPrice: 20,
        purchasePrice: 10
      }]
    };

    const order = await createOrderWithStockUpdate(orderData, userId);
    
    const beforeCancel = await Product.findById(testProduct._id);
    expect(beforeCancel.quantity).toBe(7);

    await order.cancelOrder(userId);
    
    const afterCancel = await Product.findById(testProduct._id);
    expect(afterCancel.quantity).toBe(10);
  });
});