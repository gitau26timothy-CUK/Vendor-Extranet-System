const OpenAI = require('openai');
const natural = require('natural');
const logger = require('../config/logger');

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Initialize NLP tools
const TfIdf = natural.TfIdf;
const tokenizer = new natural.WordTokenizer();

class AIService {
  /**
   * Analyze vendor profile and generate AI insights
   * @param {Object} vendor - Vendor data
   * @returns {Object} AI insights
   */
  async analyzeVendorProfile(vendor) {
    try {
      logger.info(`Analyzing vendor profile: ${vendor.companyName}`);

      // Calculate risk score based on multiple factors
      const riskScore = this.calculateRiskScore(vendor);

      // Calculate recommendation score
      const recommendationScore = this.calculateRecommendationScore(vendor);

      // Generate predictions using AI
      const predictions = await this.generateVendorPredictions(vendor);

      // Identify strengths and weaknesses
      const { strengths, weaknesses } = this.identifyStrengthsWeaknesses(vendor);

      return {
        riskScore,
        recommendationScore,
        predictedPerformance: predictions.performance,
        strengths,
        weaknesses,
        lastAnalyzed: new Date(),
      };
    } catch (error) {
      logger.error(`Error analyzing vendor profile: ${error.message}`);
      throw error;
    }
  }

  /**
   * Calculate vendor risk score (0-100, lower is better)
   */
  calculateRiskScore(vendor) {
    let riskScore = 50; // Base score

    // Years in business (more years = lower risk)
    if (vendor.yearsInBusiness) {
      if (vendor.yearsInBusiness > 10) riskScore -= 15;
      else if (vendor.yearsInBusiness > 5) riskScore -= 10;
      else if (vendor.yearsInBusiness < 2) riskScore += 10;
    }

    // Performance rating
    if (vendor.performanceRating) {
      riskScore -= (vendor.performanceRating - 3) * 5;
    }

    // On-time delivery rate
    if (vendor.onTimeDeliveryRate) {
      if (vendor.onTimeDeliveryRate > 90) riskScore -= 10;
      else if (vendor.onTimeDeliveryRate < 70) riskScore += 15;
    }

    // Quality score
    if (vendor.qualityScore) {
      if (vendor.qualityScore > 90) riskScore -= 10;
      else if (vendor.qualityScore < 70) riskScore += 15;
    }

    // Certifications
    if (vendor.certifications && vendor.certifications.length > 0) {
      riskScore -= vendor.certifications.length * 2;
    }

    // Document verification
    const verifiedDocs = vendor.documents?.filter(doc => doc.verified).length || 0;
    riskScore -= verifiedDocs * 3;

    // Ensure score is within bounds
    return Math.max(0, Math.min(100, riskScore));
  }

  /**
   * Calculate vendor recommendation score (0-100, higher is better)
   */
  calculateRecommendationScore(vendor) {
    let score = 50; // Base score

    // Performance rating
    if (vendor.performanceRating) {
      score += (vendor.performanceRating - 3) * 10;
    }

    // Completion rate
    if (vendor.totalOrders > 0) {
      const completionRate = (vendor.completedOrders / vendor.totalOrders) * 100;
      score += (completionRate - 50) / 5;
    }

    // On-time delivery
    if (vendor.onTimeDeliveryRate) {
      score += (vendor.onTimeDeliveryRate - 50) / 5;
    }

    // Quality score
    if (vendor.qualityScore) {
      score += (vendor.qualityScore - 50) / 5;
    }

    // Years in business
    if (vendor.yearsInBusiness) {
      score += Math.min(vendor.yearsInBusiness * 2, 20);
    }

    // Certifications
    if (vendor.certifications) {
      score += vendor.certifications.length * 3;
    }

    // Ensure score is within bounds
    return Math.max(0, Math.min(100, score));
  }

  /**
   * Generate vendor predictions using AI
   */
  async generateVendorPredictions(vendor) {
    try {
      const prompt = `Analyze this vendor profile and predict their future performance:
      
Company: ${vendor.companyName}
Years in Business: ${vendor.yearsInBusiness || 'N/A'}
Performance Rating: ${vendor.performanceRating || 'N/A'}/5
On-Time Delivery Rate: ${vendor.onTimeDeliveryRate || 'N/A'}%
Quality Score: ${vendor.qualityScore || 'N/A'}%
Total Orders: ${vendor.totalOrders || 0}
Completed Orders: ${vendor.completedOrders || 0}
Industry: ${vendor.industryCategory}

Provide a brief performance prediction (one sentence).`;

      const response = await openai.chat.completions.create({
        model: process.env.AI_MODEL || 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an expert in vendor performance analysis and supply chain management.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: parseFloat(process.env.AI_TEMPERATURE) || 0.7,
        max_tokens: parseInt(process.env.AI_MAX_TOKENS) || 150,
      });

      return {
        performance: response.choices[0].message.content.trim(),
      };
    } catch (error) {
      logger.error(`Error generating AI predictions: ${error.message}`);
      return {
        performance: 'Unable to generate prediction at this time.',
      };
    }
  }

  /**
   * Identify vendor strengths and weaknesses
   */
  identifyStrengthsWeaknesses(vendor) {
    const strengths = [];
    const weaknesses = [];

    // Years in business
    if (vendor.yearsInBusiness > 10) {
      strengths.push('Extensive industry experience');
    } else if (vendor.yearsInBusiness < 2) {
      weaknesses.push('Limited operational history');
    }

    // Performance rating
    if (vendor.performanceRating >= 4) {
      strengths.push('High performance rating');
    } else if (vendor.performanceRating < 3) {
      weaknesses.push('Below average performance rating');
    }

    // On-time delivery
    if (vendor.onTimeDeliveryRate > 90) {
      strengths.push('Excellent on-time delivery record');
    } else if (vendor.onTimeDeliveryRate < 70) {
      weaknesses.push('Poor on-time delivery performance');
    }

    // Quality score
    if (vendor.qualityScore > 90) {
      strengths.push('Outstanding quality standards');
    } else if (vendor.qualityScore < 70) {
      weaknesses.push('Quality concerns');
    }

    // Certifications
    if (vendor.certifications && vendor.certifications.length > 3) {
      strengths.push('Well-certified and compliant');
    } else if (!vendor.certifications || vendor.certifications.length === 0) {
      weaknesses.push('Lacks industry certifications');
    }

    // Order history
    if (vendor.totalOrders > 50) {
      strengths.push('Proven track record with multiple orders');
    } else if (vendor.totalOrders < 5) {
      weaknesses.push('Limited order history');
    }

    return { strengths, weaknesses };
  }

  /**
   * Match vendors to requirements using NLP
   * @param {String} requirements - Order requirements
   * @param {Array} vendors - List of vendors
   * @returns {Array} Ranked vendors
   */
  async matchVendorsToRequirements(requirements, vendors) {
    try {
      logger.info('Matching vendors to requirements using NLP');

      const tfidf = new TfIdf();

      // Add requirements as the first document
      tfidf.addDocument(requirements.toLowerCase());

      // Add vendor profiles as documents
      vendors.forEach(vendor => {
        const vendorText = `
          ${vendor.companyName}
          ${vendor.industryCategory}
          ${vendor.productsServices?.map(p => p.name).join(' ')}
          ${vendor.productsServices?.map(p => p.description).join(' ')}
          ${vendor.qualityStandards?.join(' ')}
        `.toLowerCase();
        tfidf.addDocument(vendorText);
      });

      // Calculate similarity scores
      const scores = vendors.map((vendor, index) => {
        let score = 0;
        tfidf.tfidfs(requirements.toLowerCase(), (i, measure) => {
          if (i === index + 1) {
            score = measure;
          }
        });

        // Boost score based on vendor performance
        const performanceBoost = (vendor.performanceRating || 0) * 0.1;
        const qualityBoost = (vendor.qualityScore || 0) * 0.001;
        const deliveryBoost = (vendor.onTimeDeliveryRate || 0) * 0.001;

        return {
          vendor,
          matchScore: score + performanceBoost + qualityBoost + deliveryBoost,
        };
      });

      // Sort by match score
      scores.sort((a, b) => b.matchScore - a.matchScore);

      return scores;
    } catch (error) {
      logger.error(`Error matching vendors: ${error.message}`);
      throw error;
    }
  }

  /**
   * Predict order delivery date using AI
   * @param {Object} order - Order data
   * @param {Object} vendor - Vendor data
   * @returns {Object} Prediction results
   */
  async predictOrderDelivery(order, vendor) {
    try {
      logger.info(`Predicting delivery for order: ${order.orderNumber}`);

      // Calculate base delivery time based on vendor history
      const avgDeliveryDays = this.calculateAverageDeliveryTime(vendor);

      // Calculate risk factors
      const riskFactors = this.calculateOrderRiskFactors(order, vendor);

      // Adjust delivery time based on risk
      const adjustedDays = Math.round(avgDeliveryDays * (1 + riskFactors.totalRisk / 100));

      // Calculate estimated delivery date
      const estimatedDeliveryDate = new Date(order.orderDate);
      estimatedDeliveryDate.setDate(estimatedDeliveryDate.getDate() + adjustedDays);

      return {
        estimatedDeliveryDate,
        riskScore: riskFactors.totalRisk,
        delayProbability: riskFactors.delayProbability,
        qualityPrediction: this.predictQuality(vendor),
        recommendations: this.generateOrderRecommendations(riskFactors),
        lastAnalyzed: new Date(),
      };
    } catch (error) {
      logger.error(`Error predicting order delivery: ${error.message}`);
      throw error;
    }
  }

  /**
   * Calculate average delivery time for vendor
   */
  calculateAverageDeliveryTime(vendor) {
    // Default to 14 days if no history
    if (!vendor.totalOrders || vendor.totalOrders === 0) {
      return 14;
    }

    // Use on-time delivery rate as a proxy
    // Better performance = faster delivery
    const baseTime = 14;
    const performanceFactor = (vendor.onTimeDeliveryRate || 80) / 100;

    return Math.round(baseTime / performanceFactor);
  }

  /**
   * Calculate order risk factors
   */
  calculateOrderRiskFactors(order, vendor) {
    let totalRisk = 0;
    let delayProbability = 0;

    // Vendor performance risk
    if (vendor.onTimeDeliveryRate < 80) {
      totalRisk += 20;
      delayProbability += 30;
    }

    // Order complexity (number of items)
    if (order.items && order.items.length > 10) {
      totalRisk += 10;
      delayProbability += 15;
    }

    // Order value risk
    if (order.totalAmount > 1000000) {
      totalRisk += 15;
      delayProbability += 10;
    }

    // Tight deadline
    const daysUntilRequired = Math.ceil(
      (new Date(order.requiredDate) - new Date(order.orderDate)) / (1000 * 60 * 60 * 24)
    );
    if (daysUntilRequired < 7) {
      totalRisk += 25;
      delayProbability += 40;
    }

    // Vendor quality score
    if (vendor.qualityScore < 80) {
      totalRisk += 15;
    }

    return {
      totalRisk: Math.min(100, totalRisk),
      delayProbability: Math.min(100, delayProbability),
    };
  }

  /**
   * Predict quality score for order
   */
  predictQuality(vendor) {
    if (vendor.qualityScore) {
      return Math.round(vendor.qualityScore / 20); // Convert to 1-5 scale
    }
    if (vendor.performanceRating) {
      return vendor.performanceRating;
    }
    return 3; // Default to average
  }

  /**
   * Generate recommendations based on risk factors
   */
  generateOrderRecommendations(riskFactors) {
    const recommendations = [];

    if (riskFactors.totalRisk > 50) {
      recommendations.push('Consider alternative vendors or split the order');
    }

    if (riskFactors.delayProbability > 40) {
      recommendations.push('Add buffer time to delivery schedule');
      recommendations.push('Implement milestone-based tracking');
    }

    if (riskFactors.totalRisk > 30) {
      recommendations.push('Schedule regular progress check-ins with vendor');
    }

    if (recommendations.length === 0) {
      recommendations.push('Order appears low-risk, proceed as planned');
    }

    return recommendations;
  }

  /**
   * Generate analytics insights using AI
   * @param {Object} data - Analytics data
   * @returns {Object} AI-generated insights
   */
  async generateAnalyticsInsights(data) {
    try {
      const prompt = `Analyze this vendor management data and provide key insights:

Total Vendors: ${data.totalVendors}
Active Vendors: ${data.activeVendors}
Average Performance Rating: ${data.avgPerformanceRating}
Total Orders: ${data.totalOrders}
Average On-Time Delivery: ${data.avgOnTimeDelivery}%
Top Category: ${data.topCategory}

Provide 3-5 actionable insights in bullet points.`;

      const response = await openai.chat.completions.create({
        model: process.env.AI_MODEL || 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a supply chain analytics expert providing actionable business insights.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 300,
      });

      return response.choices[0].message.content.trim();
    } catch (error) {
      logger.error(`Error generating analytics insights: ${error.message}`);
      return 'Unable to generate insights at this time.';
    }
  }
}

module.exports = new AIService();

// Made with Bob
