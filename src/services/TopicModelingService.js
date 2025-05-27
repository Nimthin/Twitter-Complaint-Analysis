import nlp from 'compromise';
// eslint-disable-next-line no-unused-vars
import * as tf from '@tensorflow/tfjs';

/**
 * Advanced Topic Modeling Service
 * 
 * This service uses modern NLP techniques for accurate topic modeling:
 * 1. Text preprocessing and normalization
 * 2. Transformer-based embedding model for semantic understanding
 * 3. Contextual pattern recognition for specific topic indicators
 * 4. Hierarchical classification for detailed categorization
 */

// Define main topics with their descriptions for better identification
  const TOPIC_DEFINITIONS = [
    {
      name: 'Wrong Item',
      keywords: ['wrong item', 'incorrect product', 'not what I ordered', 'different from description', 'received wrong', 'not as pictured', 'not as advertised', 'completely different']
    },
    {
      name: 'Damaged Item',
      keywords: ['damaged', 'broken', 'torn', 'defective', 'faulty', 'cracked', 'ripped', 'scratched', 'dented', 'stained', 'soiled', 'frayed']
    },
    {
      name: 'Late Delivery',
      keywords: ['late delivery', 'not delivered', 'delivery delay', 'shipping delay', 'waiting for weeks', 'never arrived', 'overdue', 'long shipping time', 'slow delivery']
    },
    {
      name: 'Missing Items',
      keywords: ['missing', 'not included', 'part of order missing', 'incomplete order', 'item not in package', 'only received part', 'missing components']
    },
    {
      name: 'Poor Quality',
      keywords: ['poor quality', 'cheap material', 'falls apart', 'not as expected', 'subpar', 'low quality', 'bad stitching', 'thin fabric', 'cheaply made']
    },
    {
      name: 'Size Issue',
      keywords: ['wrong size', 'too small', 'too large', 'runs small', 'runs big', 'not true to size', 'size chart wrong', 'misleading sizing', 'fit issue']
    },
    {
      name: 'Support Issue',
      keywords: ['poor service', 'rude', 'unhelpful', 'no response', 'ignored', 'poor communication', 'unfriendly staff', 'bad support', 'unprofessional']
    },
    {
      name: 'Return Problem',
      keywords: ['return problem', 'refund delay', 'refund denied', 'difficult return', 'return policy', 'cannot return', 'return cost', 'restocking fee']
    },
    {
      name: 'Website Error',
      keywords: ['website error', 'checkout problem', 'payment issue', 'site crashed', 'cannot order', 'website glitch', 'account issue', 'login problem']
    },
    {
      name: 'Pricing Error',
      keywords: ['overcharged', 'price different', 'wrong price', 'misleading price', 'hidden fees', 'unexpected charges', 'discount not applied']
    },
    {
      name: 'Color Mismatch',
      keywords: ['wrong color', 'not as pictured', 'color different', 'not the color I ordered', 'faded color', 'color mismatch', 'dye issues']
    },
    {
      name: 'Bad Packaging',
      keywords: ['poor packaging', 'inadequate protection', 'damaged box', 'opened package', 'tampered packaging', 'leaking package', 'insecure shipping']
    },
    {
      name: 'Out of Stock',
      keywords: ['out of stock', 'backordered', 'unavailable', 'sold out', 'no longer available', 'discontinued', 'stock issues', 'inventory problem']
    },
    {
      name: 'Subscription Issue',
      keywords: ['subscription problem', 'unwanted renewal', 'cannot cancel', 'subscription charged', 'membership issues', 'recurring billing', 'automatic renewal']
    },
    {
      name: 'Fake Product',
      keywords: ['fake', 'counterfeit', 'knock off', 'not genuine', 'not authentic', 'imitation', 'replica', 'bootleg', 'falsely advertised']
    },
    {
      name: 'Stock Inquiry',
      keywords: ['back in stock', 'restock', 'when available', 'notify', 'stock alert', 'availability', 'get more', 'coming back', 'will you have']
    }
  ];
  

// Custom stopwords for the fashion complaint domain
const STOPWORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'in', 'on', 'at', 'to', 'for', 'with', 'by', 'about', 'against', 'between', 'into', 'through',
  'during', 'before', 'after', 'above', 'below', 'from', 'up', 'down', 'of', 'off', 'over', 'under',
  'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why', 'how',
  'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such',
  'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very',
  'can', 'will', 'just', 'should', 'now', 'twitter', 'rt', 'like', 'im', 'get', 'got', 'ive',
  'next', 'fashion', 'company', 'please', 'thanks', 'thank', 'help', 'need', 'would', 'really'
]);

/**
 * Clean and normalize text for processing
 */
function preprocessText(text) {
  if (!text) return [];
  
  // Convert to lowercase and remove special characters
  let processed = text.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  
  // Parse with NLP library
  const doc = nlp(processed);
  
  // Normalize common terms
  doc.normalize({
    plurals: true,
    possessives: true,
    contractions: true
  });
  
  // Extract tokens and filter out stopwords
  return doc.terms()
    .out('array')
    .filter(term => term.length > 2 && !STOPWORDS.has(term));
}

/**
 * Calculate term frequency for a document
 */
function calculateTermFrequency(tokens) {
  const tf = {};
  tokens.forEach(token => {
    tf[token] = (tf[token] || 0) + 1;
  });
  return tf;
}

/**
 * Calculate inverse document frequency from a corpus
 */
function calculateIDF(corpusTerms, documents) {
  const idf = {};
  const N = documents.length;
  
  corpusTerms.forEach(term => {
    const docsWithTerm = documents.filter(doc => 
      doc.some(token => token === term)
    ).length;
    
    idf[term] = Math.log(N / (1 + docsWithTerm));
  });
  
  return idf;
}

/**
 * Get TF-IDF weighted terms for a document
 */
// eslint-disable-next-line no-unused-vars
function getTFIDFTerms(tokens, idf) {
  const tf = calculateTermFrequency(tokens);
  const tfidf = {};
  
  Object.keys(tf).forEach(term => {
    if (idf[term]) {
      tfidf[term] = tf[term] * idf[term];
    }
  });
  
  // Sort terms by TF-IDF score
  return Object.entries(tfidf)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10) // Get top 10 terms
    .map(([term]) => term);
}

/**
 * Vectorize a document based on topic terms
 */
// eslint-disable-next-line no-unused-vars
function vectorize(tokens, topicTerms) {
  return topicTerms.map(term => 
    tokens.includes(term) ? 1 : 0
  );
}

/**
 * Calculate cosine similarity between two vectors
 */
// eslint-disable-next-line no-unused-vars
function cosineSimilarity(vecA, vecB) {
  // Handle zero vectors
  if (vecA.every(v => v === 0) || vecB.every(v => v === 0)) {
    return 0;
  }
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Identify topics for a given text using semantic analysis and contextual patterns
 */
async function identifyTopics(text, allProcessedDocs, allTopicTerms) {
  // Preprocess the input text
  // eslint-disable-next-line no-unused-vars
  const tokens = preprocessText(text);
  
  // Get embedding for the input text using Universal Sentence Encoder
  let textEmbedding;
  try {
    textEmbedding = await getTextEmbedding(text);
  } catch (error) {
    console.error('Error getting text embedding:', error);
    // Fall back to simple text fingerprint if embedding fails
    textEmbedding = simpleTextFingerprint(text.toLowerCase());
  }
  
  // Calculate similarity scores with all topic examples
  const topicScores = await Promise.all(TOPIC_DEFINITIONS.map(async topic => {
    // Get semantic similarity with topic examples
    let semanticScore = 0;
    
    if (topic.examples && topic.examples.length > 0) {
      // Get embeddings for all examples and calculate similarity
      const exampleEmbeddings = await Promise.all(topic.examples.map(ex => getTextEmbedding(ex)));
      
      // Average similarity with all examples
      const similarities = exampleEmbeddings.map(emb => calculateCosineSimilarity(textEmbedding, emb));
      semanticScore = similarities.reduce((sum, score) => sum + score, 0) / similarities.length;
    }
    
    // Traditional keyword matching for backward compatibility
    const keywordScore = calculateKeywordScore(text, topic.keywords || []);
    
    // Contextual pattern recognition using NLP
    const doc = nlp(text);
    let contextScore = 0;
    
    // Topic-specific pattern detection - much more comprehensive than before
    if (topic.name === 'Wrong Product' && (doc.match('(wrong|incorrect|not) * (product|item|order)').found || 
                                           doc.match('(received|sent|delivered) (wrong|different)').found)) {
      contextScore += 0.25;
    } else if (topic.name === 'Damaged Product' && doc.match('(damaged|broken|cracked|torn|defective|faulty)').found) {
      contextScore += 0.25;
    } else if (topic.name === 'Late Delivery' && (doc.match('(late|delay|waiting|where) * (delivery|shipping|arrive|package)').found ||
                                                   doc.match('(hasn\'t|not) (arrived|delivered|received) (yet|still)').found)) {
      contextScore += 0.25;
    } else if (topic.name === 'Customer Service' && doc.match('(customer service|support|representative|agent|help|spoke to|talked to|chat)').found) {
      contextScore += 0.25;
    } else if (topic.name === 'Return Issues' && doc.match('(return|refund|money back|send back|exchange)').found) {
      contextScore += 0.25;
    } else if (topic.name === 'Sizing Problems' && doc.match('(size|fit|too (small|big|large)|measurement)').found) {
      contextScore += 0.25;
    } else if (topic.name === 'Item in Stock Queries' && (doc.match('(when|will) * (back in stock|restock|available again)').found ||
                                                          doc.match('(getting more|have more|more stock)').found ||
                                                          doc.match('(stock|availability) * (check|query|question)').found)) {
      contextScore += 0.3; // Boosting this category to catch stock queries more accurately
    }
    
    // Combined score with weighted components
    // We prioritize semantic and contextual understanding over keywords
    const combinedScore = semanticScore * 0.5 + contextScore * 0.3 + keywordScore * 0.2;
    
    return {
      name: topic.name,
      score: Math.min(combinedScore, 0.95), // Cap at 0.95
      // Debug information
      details: {
        semantic: semanticScore,
        context: contextScore,
        keyword: keywordScore
      }
    };
  }));
  
  // Sort by score and return
  return topicScores.sort((a, b) => b.score - a.score);
}

// Load the Universal Sentence Encoder model
let useModel = null;

/**
 * Initialize the Universal Sentence Encoder model
 */
async function loadModel() {
  if (!useModel) {
    try {
      // Use dynamic import to avoid loading the model during initial bundle
      const use = await import('@tensorflow-models/universal-sentence-encoder');
      useModel = await use.load();
    } catch (error) {
      console.error('Error loading Universal Sentence Encoder model:', error);
      // Fall back to simple text fingerprint if model loading fails
      return false;
    }
  }
  return true;
}

// Initialize the model when the module loads
let modelLoading = loadModel();

/**
 * Calculate text embedding using Universal Sentence Encoder
 */
async function getTextEmbedding(text) {
  try {
    // Wait for the model to be loaded
    const modelLoaded = await modelLoading;
    
    if (modelLoaded && useModel) {
      // Get the embedding from the model
      const embeddings = await useModel.embed([text]);
      const embeddingArray = await embeddings.array();
      // Free up memory
      embeddings.dispose();
      return embeddingArray[0];
    } else {
      // Fallback to simple text fingerprint if model loading failed
      console.warn('Using fallback text fingerprint - Universal Sentence Encoder not available');
      return simpleTextFingerprint(text.toLowerCase());
    }
  } catch (error) {
    console.error('Error generating text embedding:', error);
    // Fallback to simple text fingerprint in case of errors
    return simpleTextFingerprint(text.toLowerCase());
  }
}

/**
 * Generate a simplified text fingerprint that captures some semantic features
 * This is used as a fallback when the Universal Sentence Encoder is not available
 */
function simpleTextFingerprint(text) {
  if (!text || typeof text !== 'string') {
    return Array(50).fill(0);
  }
  
  // Basic text cleaning
  const cleanedText = text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')  // Remove punctuation
    .replace(/\s+/g, ' ')      // Normalize whitespace
    .trim();
    
  const words = cleanedText.split(/\s+/);
  if (words.length === 0) return Array(50).fill(0);
  
  // Use a Set to remove duplicates
  const unigrams = new Set(words);
  
  // Extract bigrams
  const bigrams = [];
  for (let i = 0; i < words.length - 1; i++) {
    if (words[i] && words[i+1]) { // Ensure we don't have empty strings
      bigrams.push(`${words[i]}_${words[i+1]}`);
    }
  }
  
  // Create a simplified feature vector
  const features = Array(50).fill(0);
  
  // Add unigram features
  for (const word of unigrams) {
    if (!word) continue;
    const index = Math.abs(hashString(word) % features.length);
    features[index] += 1;
  }
  
  // Add bigram features with more weight
  for (const bigram of bigrams) {
    if (!bigram) continue;
    const index = Math.abs(hashString(bigram) % features.length);
    features[index] += 1.5;
  }
  
  // Normalize the vector to unit length
  const magnitude = Math.sqrt(features.reduce((sum, val) => sum + val * val, 0));
  return magnitude > 0 ? features.map(val => val / magnitude) : features;
}

/**
 * Simple string hashing function
 */
function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash;
}

/**
 * Calculate cosine similarity between two vectors
 */
function calculateCosineSimilarity(vecA, vecB) {
  // Handle zero vectors
  if (vecA.every(v => v === 0) || vecB.every(v => v === 0)) {
    return 0;
  }
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < Math.min(vecA.length, vecB.length); i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Calculate keyword-based score
 */
function calculateKeywordScore(text, keywords) {
  const lowercaseText = text.toLowerCase();
  let matches = 0;
  
  for (const keyword of keywords) {
    if (lowercaseText.includes(keyword.toLowerCase())) {
      matches++;
    }
  }
  
  return matches > 0 ? Math.min(matches / keywords.length * 2, 1) : 0;
}

/**
 * Extract subtopics for specific topics
 */
function getSubtopics(text, topicName) {
  const doc = nlp(text.toLowerCase());
  
  // Define subtopics for each main topic category - comprehensive coverage of all 15 topics
  switch(topicName) {
    case 'Wrong Product':
      return [
        { name: 'Size Discrepancy', check: () => doc.match('(size|fit|small|large|bigger|smaller)').found },
        { name: 'Color Mismatch', check: () => doc.match('(color|colour|shade|tone|hue|dye)').found },
        { name: 'Different Item', check: () => doc.match('(different|wrong|not) (product|item|order)').found }
      ];
      
    case 'Damaged Product':
      return [
        { name: 'Broken Parts', check: () => doc.match('(broken|cracked|shattered|snapped|smashed)').found },
        { name: 'Fabric Issues', check: () => doc.match('(torn|ripped|hole|stain|frayed|worn)').found },
        { name: 'Structural Damage', check: () => doc.match('(bent|dented|crushed|warped|damaged|scratched)').found }
      ];
      
    case 'Late Delivery':
      return [
        { name: 'Extreme Delay', check: () => doc.match('(week|month|forever|ages|still waiting)').found },
        { name: 'Tracking Problems', check: () => doc.match('(tracking|status|update|information|whereabouts)').found },
        { name: 'Missed Delivery', check: () => doc.match('(missed|failed|attempt|not home|delivery note)').found }
      ];
      
    case 'Missing Items':
      return [
        { name: 'Incomplete Order', check: () => doc.match('(incomplete|partial|half|some items|part of)').found },
        { name: 'Empty Package', check: () => doc.match('(empty|nothing inside|missing all|no items)').found },
        { name: 'Missing Components', check: () => doc.match('(component|part|accessory|attachment|missing piece)').found }
      ];
      
    case 'Quality Issues':
      return [
        { name: 'Poor Materials', check: () => doc.match('(cheap|low quality|poor material|flimsy|thin)').found },
        { name: 'Bad Construction', check: () => doc.match('(poorly made|bad stitching|falling apart|construction|workmanship)').found },
        { name: 'Doesn\'t Last', check: () => doc.match('(fell apart|didn\'t last|wear out|broke after|deteriorated)').found }
      ];
      
    case 'Sizing Problems':
      return [
        { name: 'Too Small', check: () => doc.match('(too small|tight|can\'t fit|smaller than expected)').found },
        { name: 'Too Large', check: () => doc.match('(too big|large|loose|bigger than expected)').found },
        { name: 'Inconsistent Sizing', check: () => doc.match('(inconsistent|varies|different sizes|not standard|size chart wrong)').found }
      ];
      
    case 'Customer Service':
      return [
        { name: 'No Response', check: () => doc.match('(no response|didn\'t reply|ignored|ghosted|no answer)').found },
        { name: 'Rude Service', check: () => doc.match('(rude|unhelpful|unfriendly|unprofessional|attitude)').found },
        { name: 'Long Wait Times', check: () => doc.match('(wait|hold|hours|long time|forever|queue)').found }
      ];
      
    case 'Return Issues':
      return [
        { name: 'Refused Return', check: () => doc.match('(won\'t|refuse|denied|can\'t|not accepting) (return|refund)').found },
        { name: 'Complicated Process', check: () => doc.match('(complicated|difficult|hassle|complex|confusing) (return|process)').found },
        { name: 'Return Costs', check: () => doc.match('(pay|cost|fee|shipping|expensive) (return|send back)').found }
      ];
      
    case 'Website Problems':
      return [
        { name: 'Checkout Failures', check: () => doc.match('(checkout|payment|transaction|purchase) (failed|error|problem|issue)').found },
        { name: 'Account Issues', check: () => doc.match('(account|login|sign in|password|access) (problem|issue|can\'t)').found },
        { name: 'Site Performance', check: () => doc.match('(slow|crash|down|lag|glitch|bug|freeze)').found }
      ];
      
    case 'Pricing Issues':
      return [
        { name: 'Overcharged', check: () => doc.match('(overcharged|higher price|more than|extra|additional cost)').found },
        { name: 'Discount Problems', check: () => doc.match('(discount|coupon|promo|code|sale) (not applied|didn\'t work)').found },
        { name: 'Hidden Fees', check: () => doc.match('(hidden|unexpected|surprise|extra) (fee|charge|cost)').found }
      ];
      
    case 'Color Discrepancy':
      return [
        { name: 'Wrong Color', check: () => doc.match('(wrong|different|not right) color').found },
        { name: 'Faded/Dull', check: () => doc.match('(faded|dull|washed out|not vibrant|pale)').found },
        { name: 'Not As Pictured', check: () => doc.match('(not as|doesn\'t match|different from) (pictured|photo|image|shown)').found }
      ];
      
    case 'Packaging Issues':
      return [
        { name: 'Damaged Packaging', check: () => doc.match('(damaged|broken|torn|wet|crushed) (packaging|box|package)').found },
        { name: 'Poor Protection', check: () => doc.match('(poor|inadequate|minimal|no) (protection|padding|packaging|cushioning)').found },
        { name: 'Opened/Tampered', check: () => doc.match('(opened|tampered|seal broken|resealed|not new)').found }
      ];
      
    case 'Stock Problems':
      return [
        { name: 'Out of Stock After Order', check: () => doc.match('(out of stock|unavailable|no longer available) (after|when)').found },
        { name: 'Long Backorder', check: () => doc.match('(backorder|wait list|pre-order|long wait|restock)').found },
        { name: 'Discontinued Items', check: () => doc.match('(discontinued|no longer made|not produced|stopped making)').found }
      ];

    case 'Item in Stock Queries':
      return [
        { name: 'Size Availability', check: () => doc.match('(size|small|medium|large|xl|xxl|[0-9]+)').found },
        { name: 'Color Availability', check: () => doc.match('(color|colour|shade|black|white|red|blue|green|yellow|champagne|gold)').found },
        { name: 'Restock Timeline', check: () => doc.match('(when|soon|timeline|date|will you|getting more)').found }
      ];
      
    case 'Subscription Issues':
      return [
        { name: 'Unwanted Renewals', check: () => doc.match('(unwanted|automatic|didn\'t want) (renewal|subscription|charge)').found },
        { name: 'Cancellation Problems', check: () => doc.match('(can\'t|couldn\'t|difficult|impossible|won\'t let me) cancel').found },
        { name: 'Changed Terms', check: () => doc.match('(changed|increased|different) (price|terms|plan|subscription)').found }
      ];
      
    case 'Product Authenticity':
      return [
        { name: 'Counterfeit Product', check: () => doc.match('(fake|counterfeit|knock off|replica|dupe|not real)').found },
        { name: 'Misrepresented Brand', check: () => doc.match('(not|isn\'t) (authentic|genuine|original|real|official)').found },
        { name: 'Quality Comparison', check: () => doc.match('(quality|compared|difference|real vs fake|authentic vs)').found }
      ];
      
    default:
      // Default subtopics based on common complaint patterns
      return [
        { name: 'Product Issue', check: () => doc.match('(product|item|quality|material|broke|damaged)').found },
        { name: 'Service Issue', check: () => doc.match('(service|support|help|response|contact|communication)').found },
        { name: 'Delivery Issue', check: () => doc.match('(delivery|shipping|arrived|package|tracking|wait)').found },
        { name: 'Website Issue', check: () => doc.match('(website|app|online|checkout|payment|account)').found },
        { name: 'Other Issue', check: () => true } // Default fallback that will only be used if none of the above match
      ];
  }
}

/**
 * Get the most relevant subtopic for a text and topic combination
 */
function identifySubtopic(text, topicName) {
  const subtopics = getSubtopics(text, topicName);
  
  // Find the first matching subtopic
  const matchedSubtopic = subtopics.find(subtopic => subtopic.check());
  
  return matchedSubtopic ? matchedSubtopic.name : 'General';
}

/**
 * Get topics for a given text
 */
async function getTopicsForText(text, allProcessedDocs, allTopicTerms, topN = 3) {
  // Get topic scores using our improved semantic model
  const topics = await identifyTopics(text, allProcessedDocs, allTopicTerms);
  
  // Get primary topic
  const primaryTopic = topics[0].name;
  
  // Add subtopic for the primary topic
  const subtopic = identifySubtopic(text, primaryTopic);
  
  return {
    topicScores: topics.slice(0, topN),  // Top N topics
    primaryTopic,                        // Best match topic
    subtopic,                            // Relevant subtopic
    confidence: topics[0].score,         // Confidence score
    details: topics[0].details           // Detailed scoring breakdown for transparency
  };
}

/**
 * Process all tweets and assign topics
 */
async function processTweets(tweets) {
  // Step 1: Preprocess all documents
  const processedDocs = tweets.map(tweet => preprocessText(tweet.Tweet));
  
  // Step 2: Get unique terms across all documents
  const allTerms = Array.from(new Set(
    processedDocs.flatMap(doc => doc)
  ));
  
  // Step 3: Calculate IDF for all terms (for backward compatibility)
  // eslint-disable-next-line no-unused-vars
  const idf = calculateIDF(allTerms, processedDocs);
  
  // Step 4: Pre-compute any needed model data
  // In a production environment with a real transformer model,
  // we would load the model once here instead of per-request
  
  // Process each tweet to assign topics
  const processedTweets = await Promise.all(tweets.map(async (tweet) => {
    try {
      // Get topics for this tweet using the new async method
      const { topicScores, primaryTopic, subtopic, confidence, details } = await getTopicsForText(
        tweet.Tweet, processedDocs, allTerms
      );
      
      // Return the enhanced tweet object with topic information
      return {
        ...tweet,
        topicScores,       // All potential topics with scores
        primaryTopic,      // The main topic
        subtopic,          // Relevant subtopic
        confidence,        // The confidence score (0-1)
        details            // Scoring breakdown for debugging
      };
    } catch (error) {
      console.error(`Error processing tweet: ${tweet.id}`, error);
      // Return the tweet with basic classification in case of error
      return {
        ...tweet,
        primaryTopic: 'Unclassified',
        subtopic: 'Error',
        confidence: 0
      };
    }
  }));
  
  return processedTweets;
}

// Export the topic modeling service
export { getTopicsForText, processTweets, TOPIC_DEFINITIONS };

// For compatibility with default imports
const TopicModelingService = {
  getTopicsForText,
  processTweets,
  TOPIC_DEFINITIONS,
  // Add additional helper methods for testing
  getTextEmbedding,
  calculateKeywordScore
};

export default TopicModelingService;
