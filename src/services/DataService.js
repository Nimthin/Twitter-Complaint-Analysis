import * as XLSX from 'xlsx';

class DataService {
  constructor() {
    this.data = null;
  }

  // Extract and clean location data for mapping
  getLocationStats(tweets) {
    const counts = {};
    tweets.forEach(tweet => {
      if (tweet.location && tweet.location.trim() && tweet.location.trim().toLowerCase() !== 'unknown') {
        let loc = tweet.location.trim();
        // Optionally, normalize here (e.g., lowercase, remove extra info)
        loc = loc.replace(/\s*,\s*/g, ', '); // Clean up commas
        counts[loc] = (counts[loc] || 0) + 1;
      }
    });
    // Convert to array for chart/map
    const arr = Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
    return arr;
  }

  async loadData(file) {
    try {
      console.log('Reading file...');
      const arrayBuffer = await file.arrayBuffer();
      
      console.log('Creating workbook...');
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      
      console.log('Getting first sheet...');
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      
      console.log('Converting sheet to JSON...');
      this.data = XLSX.utils.sheet_to_json(worksheet);
      console.log('Successfully loaded', this.data.length, 'records');
      if (this.data.length > 0) {
        console.log('Raw XLSX Data:', this.data[0]);
        console.log('Available fields:', Object.keys(this.data[0]));
      }
      return this.data;
    } catch (error) {
      console.error('Error loading data:', error);
      throw error;
    }
  }

  generateTopics() {
    if (!this.data) {
      throw new Error('Data must be loaded before generating topics');
    }

    // Predefined topics and subtopics
    const topics = [
      {
        name: 'Order Placement & Checkout',
        tweetCount: 0,
        subtopics: [
          { name: 'Basket/Cart Errors', tweetCount: 0, tweets: [] },
          { name: 'Payment Failure', tweetCount: 0, tweets: [] },
          { name: 'Order Confirmation Issues', tweetCount: 0, tweets: [] },
          { name: 'Other Order/Checkout Issues', tweetCount: 0, tweets: [] } // Replaced 'Address & Shipping Details'
        ]
      },
      {
        name: 'Delivery & Shipping',
        tweetCount: 0,
        subtopics: [
          { name: 'Late Delivery', tweetCount: 0, tweets: [] },
          { name: 'Lost / Missing Parcel', tweetCount: 0, tweets: [] },
          { name: 'Courier Complaints', tweetCount: 0, tweets: [] },
          { name: 'Other Delivery Issues', tweetCount: 0, tweets: [] } // Replaced 'International Shipping Fees'
        ]
      },
      {
        name: 'Stock & Availability',
        tweetCount: 0,
        subtopics: [
          { name: 'Out of Stock', tweetCount: 0, tweets: [] },
          { name: 'Restock Inquiry', tweetCount: 0, tweets: [] },
          { name: 'Size/Colour Unavailable', tweetCount: 0, tweets: [] },
          { name: 'General Stock/Preorder Questions', tweetCount: 0, tweets: [] } // Replaced 'Preorders' with a more general one
        ]
      },
      {
        name: 'Returns & Refunds',
        tweetCount: 0,
        subtopics: [
          { name: 'Refund Pending', tweetCount: 0, tweets: [] },
          { name: 'Return Label Issues', tweetCount: 0, tweets: [] },
          { name: 'Exchange Request', tweetCount: 0, tweets: [] },
          { name: 'Other Returns/Refunds Issues', tweetCount: 0, tweets: [] } // Replaced 'Collection Delay'
        ]
      },
      {
        name: 'Product Quality & Faults',
        tweetCount: 0,
        subtopics: [
          { name: 'Defective Item', tweetCount: 0, tweets: [] },
          { name: 'Damaged on Arrival', tweetCount: 0, tweets: [] },
          { name: 'Poor Material Quality', tweetCount: 0, tweets: [] },
          { name: 'Other Quality/Fault Issues', tweetCount: 0, tweets: [] } // Replaced 'Rapid Wear & Tear'
        ]
      },
      {
        name: 'Sizing & Fit',
        tweetCount: 0,
        subtopics: [
          { name: 'Too Small', tweetCount: 0, tweets: [] },
          { name: 'Too Large', tweetCount: 0, tweets: [] },
          { name: 'Size Guide Mismatch', tweetCount: 0, tweets: [] },
          { name: 'Other Sizing/Fit Issues', tweetCount: 0, tweets: [] } // Replaced 'Comfort Issues'
        ]
      },
      {
        name: 'Pricing & Promotions',
        tweetCount: 0,
        subtopics: [
          { name: 'Price Discrepancy', tweetCount: 0, tweets: [] },
          { name: 'Voucher Not Applied', tweetCount: 0, tweets: [] },
          { name: 'Discount Code Request', tweetCount: 0, tweets: [] },
          { name: 'Other Pricing/Promo Issues', tweetCount: 0, tweets: [] } // Replaced 'Gift Card Problems'
        ]
      },
      {
        name: 'Customer Service Experience',
        tweetCount: 0,
        subtopics: [
          { name: 'Live Chat Issues', tweetCount: 0, tweets: [] }, // Made more general
          { name: 'Phone Support Issues', tweetCount: 0, tweets: [] }, // Made more general
          { name: 'Email/DM Support Issues', tweetCount: 0, tweets: [] }, // Made more general
          { name: 'General Customer Service Feedback', tweetCount: 0, tweets: [] } // Replaced 'Helpful Staff Praise' to be catch-all
        ]
      },
      {
        name: 'Digital Platform Issues',
        tweetCount: 0,
        subtopics: [
          { name: 'Website Errors/Down', tweetCount: 0, tweets: [] }, // Combined
          { name: 'App Errors/Crashes', tweetCount: 0, tweets: [] }, // Combined
          { name: 'Login & Account Access Online', tweetCount: 0, tweets: [] }, // Combined 'Login Problems'
          { name: 'Other Digital Platform Issues', tweetCount: 0, tweets: [] } // Replaced 'Image/Photo Load'
        ]
      },
      {
        name: 'Furniture Assembly & Parts',
        tweetCount: 0,
        subtopics: [
          { name: 'Missing Parts/Hardware', tweetCount: 0, tweets: [] }, // Combined
          { name: 'Assembly Difficulty/Instructions', tweetCount: 0, tweets: [] }, // Combined
          { name: 'Damaged Furniture Item', tweetCount: 0, tweets: [] }, // Made more specific
          { name: 'Other Furniture Issues', tweetCount: 0, tweets: [] } // Replaced 'Replacement Collection Delay'
        ]
      },
      {
        name: 'Account & Security (General)', // Added (General) to distinguish from specific online login issues
        tweetCount: 0,
        subtopics: [
          { name: 'Unauthorized Charges/Fraud', tweetCount: 0, tweets: [] }, // Combined
          { name: 'Password & Security Concerns', tweetCount: 0, tweets: [] }, // Combined
          { name: 'Data Privacy & Protection', tweetCount: 0, tweets: [] }, // Combined
          { name: 'Other Account/Security Issues', tweetCount: 0, tweets: [] } // Replaced 'Account Access' (can be too broad or covered by login)
        ]
      },
      {
        name: 'Marketing & Communications',
        tweetCount: 0,
        subtopics: [
          { name: 'Unwanted Mail/Magazine', tweetCount: 0, tweets: [] }, // Combined
          { name: 'Email/SMS Subscription Issues', tweetCount: 0, tweets: [] }, // Combined
          { name: 'Social Media Campaign Feedback', tweetCount: 0, tweets: [] }, // Kept specific
          { name: 'Other Marketing/Comms Feedback', tweetCount: 0, tweets: [] } // New general
        ]
      },
      {
        name: 'Product Information & Queries',
        tweetCount: 0,
        subtopics: [
          { name: 'Product Code/Availability Request', tweetCount: 0, tweets: [] }, // Combined
          { name: 'Material/Feature/Care Query', tweetCount: 0, tweets: [] }, // Combined
          { name: 'Size/Measurements/Fit Query', tweetCount: 0, tweets: [] }, // Combined
          { name: 'Other Product Questions', tweetCount: 0, tweets: [] } // Replaced 'Similar Product Request'
        ]
      },
      {
        name: 'General Feedback & Other Inquiries', // Renamed topic
        tweetCount: 0,
        subtopics: [
          { name: 'General Next Feedback (Non-Complaint)', tweetCount: 0, tweets: [] },
          { name: 'Uncategorized Specific Issues', tweetCount: 0, tweets: [] },
          { name: 'Social Media Chatter/Greetings', tweetCount: 0, tweets: [] },
          { name: 'Out of Scope/Irrelevant', tweetCount: 0, tweets: [] }
        ]
      }
    ];

    // Define keyword mappings for topics and subtopics
    const topicKeywords = {
      'Order Placement & Checkout': [
        'order', 'checkout', 'basket', 'cart', 'payment', 'purchase', 'transaction', 'buy', 'pay for', 'complete purchase',
        'card declined', 'confirmation', 'address error', 'unable to pay', 'checkout problem', 'billing issue', 'place order',
        'checkout page', 'payment screen', 'submit order', 'confirm payment', 'issue buying', 'glitch during order', 'payment method', 'add to bag'
      ],
      'Delivery & Shipping': [
        'delivery', 'shipping', 'late delivery', 'parcel', 'courier', 'evri', 'dpd', 'hermes', 'yodel', 'royal mail', 'delivery company',
        'dispatch delay', 'international shipping', 'saudi', 'riyals', 'where is my order', 'tracking', 'not received', 'estimated delivery',
        'shipping cost', 'delivery address', 'package', 'when will it arrive', 'shipping update', 'missed delivery'
      ],
      'Stock & Availability': [
        'out of stock', 'back in stock', 'restock', 'sold out', 'unavailable', 'no stock', 'item unavailable', 'product availability',
        'size unavailable', 'colour unavailable', 'preorder', 'item available', 'inventory', 'notify me', 'when available',
        'available soon', 'limited stock', 'low stock', 'check stock'
      ],
      'Returns & Refunds': [
        'return', 'refund', 'refund pending', 'return label', 'exchange', 'collect return', 'send back', 'returning', 'credit',
        'money back', 'credit note', 'returning item', 'refund status', 'return policy', 'how to return', 'refund process',
        'exchange policy', 'faulty return', 'incorrect item return'
      ],
      'Product Quality & Faults': [
        'faulty', 'defective', 'damaged', 'broken', 'peeling', 'torn', 'ripped', 'shrunk', 'faded', 'discoloured', 'poor quality',
        'boots', 'tights', 'material issue', 'item broke', 'quality issue', 'manufacturing defect', 'not as described', 'wear and tear',
        'stitching', 'fabric problem', 'item fell apart'
      ],
      'Sizing & Fit': [
        'size', 'sizing', 'fit', 'wrong size', 'fit issue', 'too small', 'too tight', 'doesn\'t fit', 'not true to size', 'sizing chart',
        'too large', 'loose', 'size chart', 'oversized', 'length', 'width', 'comfort', 'sizing guide', 'uncomfortable fit',
        'half size', 'shoe fit', 'clothing fit', 'runs small', 'runs large'
      ],
      'Pricing & Promotions': [
        'price', 'pricing', 'overcharged', 'discount', 'promotion', 'promo code', 'offer', 'deal', 'code', 'student discount',
        'voucher code', 'gift card', 'sale price', 'scam', 'price discrepancy', 'charged wrong', 'promotion not applied',
        'nextpay offer', 'price match', 'loyalty points', 'special offer'
      ],
      'Customer Service Experience': [
        'customer service', 'live chat', 'no response', 'phone queue', 'waiting time', 'staff', 'agent', 'advisor', 'representative',
        'email reply', 'dm', 'complaints procedure', 'helpful staff', 'unhelpful', 'rude', 'support', 'contact next',
        'customer care', 'query handling', 'resolution', 'feedback on service'
      ],
      'Digital Platform Issues': [
        'website', 'app', 'online', 'error', 'crash', 'login issue', 'password reset', 'glitch', 'bug', 'unable to access',
        'site down', 'image not loading', 'service unavailable', 'slow website', 'technical problem', 'page not found', '404',
        'cannot access account', 'payment page error', 'add to cart button not working'
      ],
      'Furniture Assembly & Parts': [
        'furniture', 'assembly', 'missing screws', 'holes misaligned', 'instructions', 'parts missing', ' fittings', 'diagram',
        'cannot assemble', 'return collection', 'damaged furniture', 'flat pack', 'wardrobe build', 'bed assembly', 'table parts',
        'sofa problem', 'broken part furniture', 'instruction manual'
      ],
      'Account & Security (General)': [
        'account', 'security', 'unauthorised charge', 'fraud', 'hacked', 'data breach', 'login', 'my account', 'statement',
        'security breach', 'password issue', 'login problem', 'personal details', 'phishing', 'suspicious email', 'data protection',
        'account settings', 'unable to login', 'forgot password'
      ],
      'Marketing & Communications': [
        'magazine', 'mailing list', 'newsletter', 'promo email', 'sms', 'unsubscribe', 'spam', 'advertising', 'campaign',
        'trading statement', 'investor', 'advert', 'social media post', 'competition', 'marketing preference', 'stop texts',
        'receive emails', 'next catalogue', 'brochure'
      ],
      'Product Information & Queries': [
        'product code', 'how much', 'what are', 'similar to', 'alternative for', 'details about', 'information on', 'product details',
        'material', 'dimensions', 'instructions', 'manual', 'care instructions', 'origin', 'product query', 'item specifics',
        'wash guide', 'weight limit', 'compatibility'
      ],
      'General Feedback & Other Inquiries': [
        'feedback', 'suggestion', 'question for next', 'enquiry', 'general query', 'comment', 'general feedback', 'next plc',
        'love next', 'great service', 'idea', 'appreciation', 'compliment', 'store query', 'opening hours', 'general help'
      ]
    };
     
    const subtopicKeywords = {
      // Order Placement & Checkout
      'Basket/Cart Errors': ['basket error', 'cart issue', 'cannot add to basket', 'bag problem', 'item disappeared', 'can\'t update quantity', 'remove item from cart', 'checkout bag', 'unable to add to cart', 'basket not updating', 'cart empty after adding', 'checkout showing wrong items', 'can\'t change quantity in basket', 'remove from basket failed', 'error code basket', 'shopping bag problem', 'items won\'t add', 'basket glitch', 'problem with my bag', 'checkout basket issue'],
      'Payment Failure': ['payment failed', 'card declined', 'transaction failed', 'payment rejected', 'card not working', 'payment error', 'unable to complete payment', 'payment issue', 'sagepay', 'paypal issue', 'payment unsuccessful', 'card error', 'payment gateway problem', 'declined payment', 'payment method not accepted', 'issue paying', 'bank declined', 'payment not going through'],
      'Order Confirmation Issues': ['no confirmation email', 'order confirmation missing', 'no tracking number', 'didn\'t get order number', 'order status unknown', 'email confirmation not received', 'order not showing', 'order went through?', 'confirmation page error', 'order number not provided', 'tracking link missing', 'order details incorrect in confirmation', 'payment taken but no confirmation', 'order history empty'],
      'Other Order/Checkout Issues': ['problem ordering', 'checkout help', 'question about order process', 'checkout query general', 'placing order issue general', 'address details order', 'shipping details order', 'order query', 'checkout general', 'difficulty placing order', 'checkout options', 'guest checkout problem', 'account order issue', 'order system error', 'general checkout question'],

      // Delivery & Shipping
      'Late Delivery': ['late delivery', 'delivery delay', 'still waiting for order', 'overdue parcel', 'not arrived on time', 'expected delivery date passed', 'when will it arrive', 'order hasn\'t shipped', 'delivery taking too long', 'estimated delivery passed', 'no update on shipping', 'parcel delayed', 'why is my delivery late', 'missed delivery window', 'shipping delay', 'package overdue', 'delivery timeframe exceeded'],
      'Lost / Missing Parcel': ['lost parcel', 'parcel missing', 'order not arrived', 'never received item', 'item lost in post', 'undelivered package', 'where is my stuff', 'package lost', 'tracking says delivered but not here', 'item missing from order', 'stolen parcel', 'never got my order', 'claim for lost parcel', 'investigation missing item'],
      'Courier Complaints': ['courier issue', 'evri problem', 'dpd complaint', 'hermes issue', 'yodel problem', 'driver issue', 'delivery driver rude', 'left in wrong place', 'unsafe drop', 'delivery company bad', 'parcel force complaint', 'delivery person unprofessional', 'damaged by courier', 'attitude of driver', 'delivery service poor', 'failed delivery attempt courier fault'],
      'Other Delivery Issues': ['delivery query general', 'shipping problem general', 'tracking information issue', 'delivery instruction not followed', 'international shipping query specific', 'shipping fee question general', 'delivery slot unavailable', 'change delivery address mid shipment', 'packaging damaged delivery', 'delivery to wrong address', 'customs charge issue', 'import duty problem', 'shipping options query'],

      // Stock & Availability
      'Out of Stock': ['out of stock', 'sold out', 'no stock online', 'item unavailable online', 'not available to buy', 'currently unavailable', 'item gone from site', 'product discontinued?', 'cannot find item', 'stock depleted', 'all gone', 'zero stock'],
      'Restock Inquiry': ['back in stock when', 'restock date please', 'when available again', 'notify me when back in stock', 'coming soon query item', 'will this be restocked', 'expecting more stock', 'item restock notification', 'please get more', 'waiting for restock', 'any news on restock', 'need this item restocked'],
      'Size/Colour Unavailable': ['size unavailable specific item', 'colour unavailable specific item', 'missing size in particular product', 'specific colour out of stock', 'no small/medium/large in this', 'need different size not listed', 'only xs/xl left', 'wanted colour gone', 'alternative colour available?', 'specific size sold out'],
      'General Stock/Preorder Questions': ['stock query general', 'availability question general', 'preorder information needed', 'item details stock general', 'product availability general query', 'is this item in stores', 'preorder update', 'preorder shipping date', 'stock levels in shop', 'online vs store stock', 'product launch date query'],

      // Returns & Refunds
      'Refund Pending': ['refund pending still', 'waiting for my refund', 'money not back yet', 'refund status check', 'how long for refund to process', 'chasing refund', 'refund not received', 'when will I get my money', 'refund delay', 'no refund yet', 'refund confirmation but no money', 'where is my refund'],
      'Return Label Issues': ['return label needed', 'label not received email', 'qr code for return not working', 'no return slip in parcel', 'print return label problem', 'how to return without label', 'generate return label', 'return postage query', 'free return label?', 'return label missing', 'stuck for return label', 'cant print label'],
      'Exchange Request': ['exchange item for different size', 'swap item for another colour', 'replacement size/colour needed', 'want to exchange product', 'different item wanted instead', 'process exchange', 'how to exchange', 'exchange in store', 'online exchange problem', 'can I swap for', 'exchange for alternative'],
      'Other Returns/Refunds Issues': ['return query general', 'refund problem unspecified', 'collection delay for return item', 'store return issue general', 'policy question return general', 'faulty item return query', 'proof of postage return', 'return tracking', 'refund to wrong card', 'partial refund issue', 'restocking fee query', 'return timeframe', 'returning gift'],

      // Product Quality & Faults
      'Defective Item': ['faulty item received', 'defective product design', 'not working correctly from start', 'item broken after first use', 'doesn\'t work as expected', 'faulty goods', 'item faulty', 'product defect', 'stopped working', 'electrical fault', 'mechanical fault', 'broken zip', 'faulty clasp', 'manufacturing error'],
      'Damaged on Arrival': ['damaged item delivered', 'broken on arrival package', 'arrived damaged in box', 'packaging damaged item inside too', 'scratched product received', 'dented item', 'item crushed', 'product smashed', 'delivered broken', 'arrived faulty', 'cracked item', 'torn packaging item damage'],
      'Poor Material Quality': ['poor quality material used', 'thin material see through', 'fabric issue cheap', 'peeling fabric after one wear', 'discoloured item after wash', 'bobbling material', 'holes after washing', 'stitching coming undone', 'low quality fabric', 'material feels cheap', 'colour faded quickly', 'threads pulling', 'sequins falling off'],
      'Other Quality/Fault Issues': ['quality complaint general', 'fault query unspecified', 'wear and tear too soon for price', 'item didn\'t last long', 'general fault with product', 'disappointed with quality', 'not as described quality', 'item not durable', 'product lifespan short', 'overall poor make', 'badly made', 'substandard item', 'expect better quality'],

      // Sizing & Fit
      'Too Small': ['too small for me', 'tight fit item', 'snug fit clothing', 'comes up small for size', 'should have ordered size up', 'very fitted', 'size is smaller than expected', 'need bigger size', 'can\'t get it on', 'restrictive fit', 'child size on adult item', 'shrunk in wash too small'],
      'Too Large': ['too large for me', 'very loose item', 'oversized item style', 'comes up big for size', 'should have ordered size down', 'baggy fit', 'size is larger than expected', 'need smaller size', 'swamped in it', 'generous sizing', 'too much material', 'looks like a tent'],
      'Size Guide Mismatch': ['size chart wrong for item', 'size guide incorrect online', 'chart misleading for product', 'measurements don\'t match size guide', 'sizing inconsistent with chart', 'followed guide but wrong fit', 'size helper inaccurate', 'check your size chart', 'size guide error', 'size conversion wrong'],
      'Other Sizing/Fit Issues': ['sizing query general', 'fit question unspecified', 'comfort problem with clothing', 'uncomfortable to wear shoes', 'length issue trousers', 'sleeve length wrong', 'leg length problem', 'body length too short/long', 'awkward fit', 'material itchy', 'strap too short/long', 'shoe width problem', 'calf fit boots'],

      // Pricing & Promotions
      'Price Discrepancy': ['price discrepancy at till', 'incorrect price online', 'price changed at checkout page', 'charged more than displayed', 'wrong price shown on tag', 'advertised price different', 'price error', 'shelf price wrong', 'scanned at wrong price', 'system price error', 'paid too much'],
      'Voucher Not Applied': ['voucher not applied at checkout', 'code invalid message', 'promo code fail to work', 'discount didn\'t work online', 'coupon error message', 'offer not deducting', 'code not recognised', 'promotion not applying', 'discount code rejected', 'voucher problem', 'can\'t use my code'],
      'Discount Code Request': ['discount code for students', 'voucher code for first order', 'need code for free delivery', 'any offers available now', 'student discount query', 'blue light card discount', 'nhs discount', 'promo code please', 'looking for a discount', 'can I get a code', 'share a voucher'],
      'Other Pricing/Promo Issues': ['pricing query general', 'promotion question unspecified', 'gift card problem use', 'sale item issue', 'loyalty points query balance', 'nextpay offer query', 'price promise question', 'terms of offer unclear', 'promotion ended early', 'excluded from offer', 'minimum spend issue', 'birthday voucher problem'],

      // Customer Service Experience
      'Live Chat Issues': ['live chat unresponsive system', 'chat not working today', 'chat queue very long', 'chat ended abruptly by agent', 'live support problem connecting', 'chatbot unhelpful', 'no agent available chat', 'chat disconnected', 'technical issue with chat', 'can\'t start chat', 'chat button missing', 'waited ages for chat'],
      'Phone Support Issues': ['call waiting long time', 'on hold for ages with music', 'phone queue issue number', 'couldn\'t get through on phone line', 'call centre problem communication', 'phone agent issue', 'call dropped', 'number not working', 'customer service phone line busy', 'automated system nightmare', 'request callback not happened'],
      'Email/DM Support Issues': ['no response to my email', 'email unanswered for days', 'waiting for DM reply on social', 'social media support slow', 'message ignored by cs', 'complaint email no reply', 'ticket open no update', 'automated email reply only', 'no follow up', 'sent multiple emails', 'dm read no reply'],
      'General Customer Service Feedback': ['customer service query general', 'support feedback positive', 'complaint handling process', 'staff attitude good/bad', 'helpful staff praise specific', 'unhelpful agent experience', 'rude staff member', 'excellent service provided', 'great support', 'poor customer care', 'abysmal service', 'complaint not resolved', 'issue escalated no news'],

      // Digital Platform Issues
      'Website Errors/Down': ['website down today', 'site offline message', 'page not loading error', 'website error message code', '404 error on page', 'server error on next website', 'can\'t access website', 'next.co.uk not working', 'site maintenance?', 'experiencing technical difficulties site', 'broken link on website', 'page unavailable'],
      'App Errors/Crashes': ['next app crash', 'app error message', 'app freezing on phone', 'unable to use next app', 'app not working android/iphone', 'mobile app issue login/payment', 'app keeps closing', 'bug in app', 'update app issue', 'app slow', 'can\'t download app', 'problem with next app'],
      'Login & Account Access Online': ['login issue online account', 'cannot log in to website/app account', 'online password reset fail link', 'my account page error message', 'forgot password link broken', 'account locked online', 'unable to sign in', 'username not recognized', 'password incorrect not working', 'account access denied', 'two factor authentication problem online'],
      'Other Digital Platform Issues': ['digital query general', 'platform problem unspecified', 'image not loading on site/app product', 'slow performance online shopping', 'filter not working on category page', 'search problem website', 'technical glitch add to bag', 'wishlist error', 'saved items gone', 'checkout button unresponsive', 'site navigation difficult', 'user interface issue'],

      // Furniture Assembly & Parts
      'Missing Parts/Hardware': ['missing screws for furniture', 'parts missing from flatpack', 'hardware missing for bed/table', 'no fittings in box', 'incomplete item furniture delivery', 'instruction manual missing', 'screws don\'t fit', 'not all parts included', 'missing component', 'part number x missing', 'fixings not supplied'],
      'Assembly Difficulty/Instructions': ['holes misaligned furniture assembly', 'cannot assemble wardrobe', 'assembly instructions unclear diagram', 'difficult to put together item', 'flat pack nightmare build', 'poor design assembly', 'confusing instructions', 'diagram wrong', 'assembly taking hours', 'need help assembling', 'parts don\'t align', 'faulty assembly design'],
      'Damaged Furniture Item': ['damaged furniture on arrival delivery', 'scratched table top', 'broken chair leg received', 'dented wardrobe panel', 'furniture quality issue damage', 'chip on furniture', 'cracked wood furniture', 'mirror broken furniture', 'upholstery torn furniture', 'delivered faulty furniture'],
      'Other Furniture Issues': ['furniture query general', 'large item delivery problem access', 'sofa issue comfort/quality', 'bed problem slats/frame', 'replacement part for furniture request', 'collection delay damaged furniture', 'furniture warranty query', 'measurement query furniture', 'colour different furniture', 'wood finish poor furniture'],

      // Account & Security (General)
      'Unauthorized Charges/Fraud': ['unauthorised charge on my card', 'unknown charge on account statement', 'fraudulent transaction next', 'suspicious activity on my next account', 'billing error security concern', 'payment taken twice', 'charged for item not received', 'identity theft concern', 'scam email next', 'card used without permission'],
      'Password & Security Concerns': ['password reset issue general account', 'security concern my account', 'account hacked concern general', 'phishing email received pretending next', 'suspicious login attempt notification', 'update security questions', 'password strength', 'security code not received', 'account compromised', 'unable to change password', 'too many login attempts'],
      'Data Privacy & Protection': ['data breach fear next', 'privacy concern handling my data', 'personal information security query', 'gdpr request next', 'data protection issue complaint', 'how is my data used', 'selling my data?', 'privacy policy query', 'right to be forgotten', 'subject access request', 'data security next'],
      'Other Account/Security Issues': ['account problem other', 'security issue general', 'general account question'],

      // Marketing & Communications
      'Unwanted Mail/Magazine': ['unwanted next magazine', 'stop mailing list next', 'post permission change request', 'remove from next postal marketing', 'too much junk mail from next', 'catalogue not requested', 'stop sending brochures', 'reduce paper mail', 'opt out of physical mail', 'unsolicited mail'],
      'Email/SMS Subscription Issues': ['next promo email unsubscribe link not working', 'next sms spam stop messages', 'cannot unsubscribe next emails', 'too many marketing messages from next', 'subscription management next account', 'opt out marketing emails/sms', 'still getting emails after unsubscribe', 'report spam next', 'communication preferences update fail'],
      'Social Media Campaign Feedback': ['next campaign feedback', 'next advertisement comment', 'next social media ad query', 'next influencer post reaction', 'marketing message opinion next', 'competition entry next query', 'response to your post', 'advert misleading', 'love the new ad', 'social media content feedback'],
      'Other Marketing/Comms Feedback': ['marketing issue other', 'communication problem general', 'general comms query'],

      // Product Information & Queries
      'Product Code/Availability Request': ['product code needed for item', 'item number request specific product', 'is this in stock in my local store', 'online availability check specific item', 'style number for dress/shoes', 'reference number for product', 'catalogue number', 'stock check in particular shop', 'can I find this in store'],
      'Material/Feature/Care Query': ['what material is this made of', 'fabric composition details', 'product features question specific item', 'washing instructions for garment', 'care guide for product', 'product origin query made where', 'is it waterproof/leather/cotton', 'sustainability of material', 'ethical sourcing query', 'allergy information material', 'product specification details'],
      'Size/Measurements/Fit Query': ['measurements needed for furniture/clothing', 'dimensions of item please', 'strap length query bag/dress', 'inseam length trousers', 'product fit question specific style', 'size details needed before buy', 'chest/waist/hip measurement', 'model height in photo', 'size conversion chart query', 'compare sizes', 'which size for me'],
      'Other Product Questions': ['product information other', 'item query general', 'general question about product item'],

      // General Feedback & Other Inquiries
      'General Next Feedback (Non-Complaint)': ['love next products', 'great service from next', 'suggestion for next website/app', 'idea for new product range', 'positive feedback general', 'appreciate next customer care', 'compliment for next team', 'highly recommend next', 'impressed with next', 'next is my favorite', 'kudos to next team', 'fantastic experience', 'very happy with purchase', 'excellent quality as always', 'big fan of next', 'shoutout to next', 'next always delivers', 'great job next', 'positive comment', 'happy customer'],
      'Uncategorized Specific Issues': ['specific problem unspecified', 'issue not covered', 'complaint no category', 'unclear what is wrong', 'assistance needed strange issue', 'problem i have', 'issue not sure where fits', 'general problem next', 'another issue', 'different problem'],
      'Social Media Chatter/Greetings': ['hello next team', 'hi next official', 'thanks next for help', 'good morning next social', '@nextofficial how are you today', 'general social media mention positive/neutral', 'okay hun', 'hope you are well team', 'just saying hi', 'nextfashion', 'hey next', 'yo next', 'whatsup next', 'just saying hello', 'quick hi', 'hope everyone at next is well', 'next team rocks', 'big up next', 'nice one next', 'thanks for the update next', 'good to see next', 'waves at next'],
      'Out of Scope/Irrelevant': ['spam message unrelated', 'unrelated question to next', 'wrong company contacted sorry', 'not about next products/service', 'job application query', 'lottery win message ignore', 'random comment', 'political comment', 'selling something', 'looking for different brand', 'this isn\'t about Next', 'ignore this message', 'test tweet']
    };

    // Categorize tweets into topics and subtopics
    // Map and normalize the data first
    const Sentiment = require('sentiment');
    const sentiment = new Sentiment();
    const normalizedTweets = this.data.map(rawTweet => {
      const text = rawTweet.Tweet || '';
      const sentimentResult = sentiment.analyze(text);
      let sentimentLabel = 'neutral';
      if (sentimentResult.score > 1) sentimentLabel = 'positive';
      else if (sentimentResult.score < -1) sentimentLabel = 'negative';
      return {
        text,
        user: rawTweet.Author || rawTweet.User || rawTweet.Username || '',
        date: rawTweet.Date ? new Date(rawTweet.Date) : new Date(),
        likes: parseInt(rawTweet.Likes || '0', 10),
        replies: parseInt(rawTweet.Replies || '0', 10),
        views: parseInt(rawTweet.Views || '0', 10),
        engagement: parseInt(rawTweet.Engagement || '0', 10),
        sentimentScore: sentimentResult.score,
        sentimentLabel,
        location: rawTweet.Location || rawTweet.City || rawTweet.Country || '',
        originalData: rawTweet
      };
    });

    // Process each normalized tweet
    normalizedTweets.forEach(tweet => {
        const text = tweet.text.toLowerCase();
        let tweetSuccessfullyCategorized = false;

        for (const topicEntry of topics) {
            const topicName = topicEntry.name;
            const currentTopicKeywords = topicKeywords[topicName] || [];

            if (currentTopicKeywords.some(keyword => text.includes(keyword))) {
                // --- Topic keywords matched for topicEntry ---
                let subtopicAssignedForThisTopic = false;

                // 1. Attempt to match a specific subtopic using its keywords
                for (const subtopicData of topicEntry.subtopics) {
                    const subtopicKeywordsForCurrent = subtopicKeywords[subtopicData.name] || [];
                    if (subtopicKeywordsForCurrent.length > 0 && subtopicKeywordsForCurrent.some(subKeyword => text.includes(subKeyword))) {
                        topicEntry.tweetCount++;
                        subtopicData.tweetCount++;
                        subtopicData.tweets.push(tweet);
                        subtopicAssignedForThisTopic = true;
                        break; // Exit subtopic loop for this topic
                    }
                }

                // 2. If no specific subtopic was matched by keywords, assign to the general subtopic
                if (!subtopicAssignedForThisTopic) {
                    // Construct search terms for general subtopics based on the parent topic name
                    // E.g., for "Order Placement & Checkout", search for "Other Order", "General Order"
                    const baseTopicNameForSearch = topicName.toLowerCase().split(" & ")[0].split(" ")[0];
                    let generalSubtopic = topicEntry.subtopics.find(st =>
                        st.name.startsWith("Other ") ||
                        st.name.startsWith("General ") ||
                        (st.name.toLowerCase().includes("other ") && st.name.toLowerCase().includes(baseTopicNameForSearch)) ||
                        (st.name.toLowerCase().includes("general ") && st.name.toLowerCase().includes(baseTopicNameForSearch))
                    );

                    if (!generalSubtopic && topicEntry.subtopics.length > 0) {
                        // Fallback: assume the last subtopic is the general one if no specific naming convention matches
                        generalSubtopic = topicEntry.subtopics[topicEntry.subtopics.length - 1];
                    }

                    if (generalSubtopic) {
                        topicEntry.tweetCount++;
                        generalSubtopic.tweetCount++;
                        generalSubtopic.tweets.push(tweet);
                        subtopicAssignedForThisTopic = true;
                    } else {
                        // This condition means the topic (whose keywords matched) has no subtopics. This is a structural data issue.
                        console.warn(`Tweet matched topic '${topicName}' keywords but the topic has no subtopics or general subtopic identified. Tweet: ${text}`);
                        // Do not set subtopicAssignedForThisTopic = true; the tweet is not truly categorized within this problematic topic.
                        // The outer loop will continue to check if other topics might match this tweet.
                    }
                }

                // If the tweet was successfully assigned to a subtopic (specific or general) under this topic,
                // then we are done with this tweet according to "first topic wins".
                if (subtopicAssignedForThisTopic) {
                    tweetSuccessfullyCategorized = true;
                    break; // Exit the main topic loop (for...of topics)
                }
                // If subtopicAssignedForThisTopic is still false here, it means:
                // - The topic's keywords matched.
                // - BUT, it couldn't be placed into any of its subtopics (e.g., topic has no subtopics - data error).
                // The loop continues to check if OTHER topics might match this tweet. This is a deviation from strict "first topic wins"
                // but is more robust if the first matching topic is malformed (e.g. no subtopics).
            }
        }

        // If, after checking all topics, the tweet was not successfully categorized
        if (!tweetSuccessfullyCategorized) {
            const fallbackTopic = topics.find(t => t.name === 'General Feedback & Other Inquiries');
            if (fallbackTopic) {
                const uncategorizedSubtopic = fallbackTopic.subtopics.find(st => st.name === 'Uncategorized Specific Issues');
                if (uncategorizedSubtopic) {
                    fallbackTopic.tweetCount++;
                    uncategorizedSubtopic.tweetCount++;
                    uncategorizedSubtopic.tweets.push(tweet);
                } else {
                    // Fallback if 'Uncategorized Specific Issues' subtopic is not found
                    if (fallbackTopic.subtopics.length > 0) {
                        fallbackTopic.tweetCount++;
                        fallbackTopic.subtopics[0].tweetCount++;
                        fallbackTopic.subtopics[0].tweets.push(tweet);
                        console.warn("Fallback to first subtopic of 'General Feedback & Other Inquiries' due to missing 'Uncategorized Specific Issues' subtopic. Tweet: " + text);
                    } else {
                        // This state should be highly unlikely if the topic structure is correctly set up.
                        console.error("'General Feedback & Other Inquiries' topic has NO subtopics for fallback. Tweet unassigned: " + text);
                    }
                }
            } else {
                // This state indicates a critical error in the predefined topic structure.
                console.error("'General Feedback & Other Inquiries' topic not found for fallback! Tweet unassigned: " + text);
            }
        }
    });

    return topics;
  }
}

export default DataService;
