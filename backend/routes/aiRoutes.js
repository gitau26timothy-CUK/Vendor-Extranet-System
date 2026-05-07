const express = require('express');
const router = express.Router();
const { protect, checkPermission } = require('../middleware/auth');
const aiService = require('../services/aiService');
const Vendor = require('../models/Vendor');
const Order = require('../models/Order');
const logger = require('../config/logger');

/**
 * @desc    Analyze vendor profile with AI
 * @route   POST /api/ai/analyze-vendor/:id
 * @access  Private
 */
router.post('/analyze-vendor/:id', protect, checkPermission('vendor.view'), async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);
    
    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found',
      });
    }

    const insights = await aiService.analyzeVendorProfile(vendor);

    // Update vendor with AI insights
    vendor.aiInsights = insights;
    await vendor.save();

    res.status(200).json({
      success: true,
      data: insights,
    });
  } catch (error) {
    logger.error(`AI vendor analysis error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Error analyzing vendor',
      error: error.message,
    });
  }
});

/**
 * @desc    Match vendors to requirements
 * @route   POST /api/ai/match-vendors
 * @access  Private
 */
router.post('/match-vendors', protect, checkPermission('vendor.view'), async (req, res) => {
  try {
    const { requirements } = req.body;

    if (!requirements) {
      return res.status(400).json({
        success: false,
        message: 'Requirements are required',
      });
    }

    // Get all approved vendors
    const vendors = await Vendor.find({ status: { $in: ['Approved', 'Active'] } });

    const matches = await aiService.matchVendorsToRequirements(requirements, vendors);

    res.status(200).json({
      success: true,
      data: matches.slice(0, 10), // Return top 10 matches
    });
  } catch (error) {
    logger.error(`AI vendor matching error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Error matching vendors',
      error: error.message,
    });
  }
});

/**
 * @desc    Predict order delivery
 * @route   POST /api/ai/predict-delivery/:orderId
 * @access  Private
 */
router.post('/predict-delivery/:orderId', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId).populate('vendor');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    const predictions = await aiService.predictOrderDelivery(order, order.vendor);

    // Update order with predictions
    order.aiPredictions = predictions;
    await order.save();

    res.status(200).json({
      success: true,
      data: predictions,
    });
  } catch (error) {
    logger.error(`AI delivery prediction error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Error predicting delivery',
      error: error.message,
    });
  }
});

/**
 * @desc    Generate analytics insights
 * @route   POST /api/ai/analytics-insights
 * @access  Private
 */
router.post('/analytics-insights', protect, checkPermission('analytics.view'), async (req, res) => {
  try {
    const { data } = req.body;

    if (!data) {
      return res.status(400).json({
        success: false,
        message: 'Analytics data is required',
      });
    }

    const insights = await aiService.generateAnalyticsInsights(data);

    res.status(200).json({
      success: true,
      data: insights,
    });
  } catch (error) {
    logger.error(`AI analytics insights error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Error generating insights',
      error: error.message,
    });
  }
});

/**
 * @desc    Batch analyze all vendors
 * @route   POST /api/ai/batch-analyze-vendors
 * @access  Private (Admin only)
 */
router.post('/batch-analyze-vendors', protect, checkPermission('vendor.view'), async (req, res) => {
  try {
    const vendors = await Vendor.find({ status: { $in: ['Approved', 'Active'] } });

    let analyzed = 0;
    let failed = 0;

    for (const vendor of vendors) {
      try {
        const insights = await aiService.analyzeVendorProfile(vendor);
        vendor.aiInsights = insights;
        await vendor.save();
        analyzed++;
      } catch (error) {
        logger.error(`Failed to analyze vendor ${vendor._id}: ${error.message}`);
        failed++;
      }
    }

    res.status(200).json({
      success: true,
      message: `Batch analysis complete. Analyzed: ${analyzed}, Failed: ${failed}`,
      data: {
        total: vendors.length,
        analyzed,
        failed,
      },
    });
  } catch (error) {
    logger.error(`Batch vendor analysis error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Error in batch analysis',
      error: error.message,
    });
  }
});

module.exports = router;

// Made with Bob
