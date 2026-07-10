// client/src/hooks/useOrderValidation.js
import { useState, useCallback } from 'react';
import { orderService } from '../services/order.service';

export const useOrderValidation = () => {
  const [validating, setValidating] = useState(false);
  const [validationResult, setValidationResult] = useState(null);
  const [errors, setErrors] = useState([]);

  const validateItems = useCallback(async (items) => {
    try {
      setValidating(true);
      setErrors([]);
      
      const response = await orderService.validateItems(items);
      
      if (response.success) {
        setValidationResult(response.data);
        
        const invalidItems = response.data.items.filter(item => !item.valid);
        if (invalidItems.length > 0) {
          setErrors(invalidItems.map(item => ({
            productName: item.productName,
            errors: item.errors
          })));
        }
        
        return response.data;
      }
      
      return null;
    } catch (error) {
      setErrors([{ error: error.message || 'Validation failed' }]);
      return null;
    } finally {
      setValidating(false);
    }
  }, []);

  return {
    validating,
    validationResult,
    errors,
    validateItems,
    isValid: validationResult?.allValid || false,
    invalidCount: validationResult?.invalidCount || 0
  };
};