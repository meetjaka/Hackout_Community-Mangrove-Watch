const axios = require('axios');
const cloudinary = require('cloudinary').v2;
const tf = require('@tensorflow/tfjs-node');
const sharp = require('sharp');

class ImageProcessingService {
  constructor() {
    // Configure Cloudinary
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET
    });

    this.model = null;
    this.initModel();
  }

  async initModel() {
    // Load pre-trained model for mangrove image classification
    this.model = await tf.loadLayersModel(process.env.AI_MODEL_PATH);
  }

  // Compress and optimize image
  async compressImage(buffer) {
    return sharp(buffer)
      .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 80 })
      .toBuffer();
  }

  // Upload image to Cloudinary
  async uploadToCloudinary(buffer) {
    return new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream({
          folder: 'mangrove-reports',
          resource_type: 'auto'
        }, (error, result) => {
          if (error) reject(error);
          else resolve(result);
        })
        .end(buffer);
    });
  }

  // Validate image using AI
  async validateImage(imageBuffer) {
    try {
      // Preprocess image for the model
      const tensor = tf.node.decodeImage(imageBuffer);
      const resized = tf.image.resizeBilinear(tensor, [224, 224]);
      const expanded = resized.expandDims(0);
      const normalized = expanded.div(255.0);

      // Run prediction
      const predictions = await this.model.predict(normalized).data();
      
      // Get confidence scores
      const scores = {
        isMangrove: predictions[0],
        hasDeforestation: predictions[1],
        hasPollution: predictions[2],
        isRelevant: predictions[3]
      };

      // Cleanup
      tensor.dispose();
      resized.dispose();
      expanded.dispose();
      normalized.dispose();

      return {
        isValid: scores.isMangrove > 0.7 && scores.isRelevant > 0.6,
        confidence: scores.isMangrove,
        labels: this.getLabelsFromScores(scores),
        scores
      };
    } catch (error) {
      console.error('AI validation failed:', error);
      return {
        isValid: false,
        confidence: 0,
        labels: [],
        error: error.message
      };
    }
  }

  // Get labels based on prediction scores
  getLabelsFromScores(scores) {
    const labels = [];
    if (scores.isMangrove > 0.7) labels.push('MANGROVE');
    if (scores.hasDeforestation > 0.6) labels.push('DEFORESTATION');
    if (scores.hasPollution > 0.6) labels.push('POLLUTION');
    return labels;
  }

  // Check for duplicate images
  async checkDuplicate(imageBuffer, existingReports) {
    // Implementation of perceptual hashing or similar technique
    // This is a placeholder for the actual implementation
    return {
      isDuplicate: false,
      similarityScore: 0,
      matchedReportId: null
    };
  }

  // Process multiple images
  async processImages(files) {
    const processedImages = [];

    for (const file of files) {
      // Compress image
      const compressed = await this.compressImage(file.buffer);
      
      // Upload to Cloudinary
      const uploaded = await this.uploadToCloudinary(compressed);
      
      // Validate with AI
      const validation = await this.validateImage(compressed);

      processedImages.push({
        url: uploaded.secure_url,
        publicId: uploaded.public_id,
        aiValidated: true,
        aiScore: validation.confidence,
        validation: validation
      });
    }

    return processedImages;
  }
}

module.exports = new ImageProcessingService();
