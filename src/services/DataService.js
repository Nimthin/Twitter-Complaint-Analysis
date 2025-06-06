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
          { name: 'Address & Shipping Details', tweetCount: 0, tweets: [] }
        ]
      },
      {
        name: 'Delivery & Shipping',
        tweetCount: 0,
        subtopics: [
          { name: 'Late Delivery', tweetCount: 0, tweets: [] },
          { name: 'Lost / Missing Parcel', tweetCount: 0, tweets: [] },
          { name: 'Courier Complaints', tweetCount: 0, tweets: [] },
          { name: 'International Shipping Fees', tweetCount: 0, tweets: [] }
        ]
      },
      {
        name: 'Stock & Availability',
        tweetCount: 0,
        subtopics: [
          { name: 'Out of Stock', tweetCount: 0, tweets: [] },
          { name: 'Restock Inquiry', tweetCount: 0, tweets: [] },
          { name: 'Size/Colour Unavailable', tweetCount: 0, tweets: [] },
          { name: 'Preorders', tweetCount: 0, tweets: [] }
        ]
      },
      {
        name: 'Returns & Refunds',
        tweetCount: 0,
        subtopics: [
          { name: 'Refund Pending', tweetCount: 0, tweets: [] },
          { name: 'Return Label Issues', tweetCount: 0, tweets: [] },
          { name: 'Exchange Request', tweetCount: 0, tweets: [] },
          { name: 'Collection Delay', tweetCount: 0, tweets: [] }
        ]
      },
      {
        name: 'Product Quality & Faults',
        tweetCount: 0,
        subtopics: [
          { name: 'Defective Item', tweetCount: 0, tweets: [] },
          { name: 'Damaged on Arrival', tweetCount: 0, tweets: [] },
          { name: 'Poor Material Quality', tweetCount: 0, tweets: [] },
          { name: 'Rapid Wear & Tear', tweetCount: 0, tweets: [] }
        ]
      },
      {
        name: 'Sizing & Fit',
        tweetCount: 0,
        subtopics: [
          { name: 'Too Small', tweetCount: 0, tweets: [] },
          { name: 'Too Large', tweetCount: 0, tweets: [] },
          { name: 'Size Guide Mismatch', tweetCount: 0, tweets: [] },
          { name: 'Comfort Issues', tweetCount: 0, tweets: [] }
        ]
      },
      {
        name: 'Pricing & Promotions',
        tweetCount: 0,
        subtopics: [
          { name: 'Price Discrepancy', tweetCount: 0, tweets: [] },
          { name: 'Voucher Not Applied', tweetCount: 0, tweets: [] },
          { name: 'Discount Code Request', tweetCount: 0, tweets: [] },
          { name: 'Gift Card Problems', tweetCount: 0, tweets: [] }
        ]
      },
      {
        name: 'Customer Service Experience',
        tweetCount: 0,
        subtopics: [
          { name: 'Live Chat Unresponsive', tweetCount: 0, tweets: [] },
          { name: 'Phone Wait Times', tweetCount: 0, tweets: [] },
          { name: 'Email No Response', tweetCount: 0, tweets: [] },
          { name: 'Helpful Staff Praise', tweetCount: 0, tweets: [] }
        ]
      },
      {
        name: 'Digital Platform Issues',
        tweetCount: 0,
        subtopics: [
          { name: 'Website Down', tweetCount: 0, tweets: [] },
          { name: 'App Crash', tweetCount: 0, tweets: [] },
          { name: 'Login Problems', tweetCount: 0, tweets: [] },
          { name: 'Image/Photo Load', tweetCount: 0, tweets: [] }
        ]
      },
      {
        name: 'Furniture Assembly & Parts',
        tweetCount: 0,
        subtopics: [
          { name: 'Missing Parts', tweetCount: 0, tweets: [] },
          { name: 'Assembly Difficulty', tweetCount: 0, tweets: [] },
          { name: 'Damaged Furniture', tweetCount: 0, tweets: [] },
          { name: 'Replacement Collection Delay', tweetCount: 0, tweets: [] }
        ]
      },
      {
        name: 'Account & Security',
        tweetCount: 0,
        subtopics: [
          { name: 'Unauthorized Charge', tweetCount: 0, tweets: [] },
          { name: 'Password Reset Issues', tweetCount: 0, tweets: [] },
          { name: 'Data Breach Fears', tweetCount: 0, tweets: [] },
          { name: 'Account Access', tweetCount: 0, tweets: [] }
        ]
      },
      {
        name: 'Marketing & Communications',
        tweetCount: 0,
        subtopics: [
          { name: 'Unwanted Post/Mail', tweetCount: 0, tweets: [] },
          { name: 'Email/SMS Spam', tweetCount: 0, tweets: [] },
          { name: 'Magazine Subscription', tweetCount: 0, tweets: [] },
          { name: 'Social Media Campaign Feedback', tweetCount: 0, tweets: [] }
        ]
      },
      {
        name: 'Product Information & Queries',
        tweetCount: 0,
        subtopics: [
          { name: 'Product Code Request', tweetCount: 0, tweets: [] },
          { name: 'Material/Feature Query', tweetCount: 0, tweets: [] },
          { name: 'Similar Product Request', tweetCount: 0, tweets: [] },
          { name: 'Size/Measurements Inquiry', tweetCount: 0, tweets: [] }
        ]
      },
      {
        name: 'Miscellaneous & Other',
        tweetCount: 0,
        subtopics: [
          { name: 'Brand Mention Only', tweetCount: 0, tweets: [] },
          { name: 'General Greetings', tweetCount: 0, tweets: [] },
          { name: 'Non-Specific Complaint', tweetCount: 0, tweets: [] },
          { name: 'Off-topic', tweetCount: 0, tweets: [] }
        ]
      }
    ];

    // Define keyword mappings for topics and subtopics
    const topicKeywords = {
      // 1 – Order Placement & Checkout
      'Order Placement & Checkout': [
        'order', 'checkout', 'basket', 'cart', 'payment',
        'card declined', 'confirmation', 'address error'
      ],
     
      // 2 – Delivery & Shipping (incl. international)
      'Delivery & Shipping': [
        'delivery', 'late delivery', 'parcel', 'courier', 'evri',
        'dpd', 'dispatch delay', 'international shipping', 'saudi',
        'riyals'
      ],
     
      // 3 – Stock & Availability
      'Stock & Availability': [
        'out of stock', 'back in stock', 'restock', 'sold out',
        'size unavailable', 'colour unavailable', 'preorder'
      ],
     
      // 4 – Returns & Refunds
      'Returns & Refunds': [
        'return', 'refund', 'refund pending', 'return label',
        'exchange', 'collect return'
      ],
     
      // 5 – Product Quality & Faults
      'Product Quality & Faults': [
        'faulty item', 'defective', 'damaged', 'broken', 'peeling',
        'discoloured', 'poor quality', 'boots', 'tights'
      ],
     
      // 6 – Sizing & Fit
      'Sizing & Fit': [
        'wrong size', 'fit issue', 'too small', 'too tight',
        'too large', 'loose', 'size chart', 'oversized'
      ],
     
      // 7 – Pricing & Promotions
      'Pricing & Promotions': [
        'price discrepancy', 'overcharged', 'discount',
        'voucher code', 'gift card', 'sale price', 'scam'
      ],
     
      // 8 – Customer Service Experience
      'Customer Service Experience': [
        'customer service', 'live chat', 'no response', 'phone queue',
        'email reply', 'dm', 'complaints procedure', 'helpful staff'
      ],
     
      // 9 – Digital Platform Issues
      'Digital Platform Issues': [
        'website error', 'app crash', 'login issue', 'password reset',
        'site down', 'image not loading', 'service unavailable'
      ],
     
      // 10 – Furniture Assembly & Parts
      'Furniture Assembly & Parts': [
        'furniture', 'assembly', 'missing screws', 'holes misaligned',
        'cannot assemble', 'return collection'
      ],
     
      // 11 – Account & Security
      'Account & Security': [
        'unauthorised charge', 'fraud', 'account hacked',
        'security breach', 'password reset'
      ],
     
      // 12 – Marketing & Communications
      'Marketing & Communications': [
        'magazine', 'mailing list', 'newsletter', 'promo email',
        'sms', 'trading statement', 'investor'
      ],
     
      // 13 – Product Information & Queries
      'Product Information & Queries': [
        'product code', 'how much', 'what are', 'similar',
        'material', 'dimensions', 'instructions', 'manual'
      ],
     
      // 14 – Miscellaneous & Other
      'Miscellaneous & Other': [
        'nextofficial', 'sleep', 'okay hun', 'general comment'
      ]
    };
     
    const subtopicKeywords = {
      // Order Placement & Checkout

      'Basket/Cart Errors': ['basket error', 'cart issue', 'cannot add to basket', 'bag problem', 'item disappeared', 'can\'t update quantity', 'remove item from cart', 'checkout bag', 'unable to add to cart', 'basket not updating', 'cart empty after adding', 'checkout showing wrong items', 'can\'t change quantity in basket', 'remove from basket failed', 'error code basket', 'shopping bag problem', 'items won\'t add', 'basket glitch', 'problem with my bag', 'checkout basket issue'],
      'Payment Failure': ['payment failed', 'card declined', 'transaction failed', 'payment rejected', 'card not working', 'payment error', 'unable to complete payment', 'payment issue', 'sagepay', 'paypal issue', 'payment unsuccessful', 'card error', 'payment gateway problem', 'declined payment', 'payment method not accepted', 'issue paying', 'bank declined', 'payment not going through'],
      'Order Confirmation Issues': ['no confirmation email', 'order confirmation missing', 'no tracking number', 'didn\'t get order number', 'order status unknown', 'email confirmation not received', 'order not showing', 'order went through?', 'confirmation page error', 'order number not provided', 'tracking link missing', 'order details incorrect in confirmation', 'payment taken but no confirmation', 'order history empty'],
      'Other Order/Checkout Issues': ['order other issue', 'checkout other problem', 'general order question', 'order query other'],

      // Delivery & Shipping
      'Late Delivery': ['late delivery', 'delivery delay', 'still waiting for order', 'overdue parcel', 'not arrived on time', 'expected delivery date passed', 'when will it arrive', 'order hasn\'t shipped', 'delivery taking too long', 'estimated delivery passed', 'no update on shipping', 'parcel delayed', 'why is my delivery late', 'missed delivery window', 'shipping delay', 'package overdue', 'delivery timeframe exceeded'],
      'Lost / Missing Parcel': ['lost parcel', 'parcel missing', 'order not arrived', 'never received item', 'item lost in post', 'undelivered package', 'where is my stuff', 'package lost', 'tracking says delivered but not here', 'item missing from order', 'stolen parcel', 'never got my order', 'claim for lost parcel', 'investigation missing item'],
      'Courier Complaints': ['courier issue', 'evri problem', 'dpd complaint', 'hermes issue', 'yodel problem', 'driver issue', 'delivery driver rude', 'left in wrong place', 'unsafe drop', 'delivery company bad', 'parcel force complaint', 'delivery person unprofessional', 'damaged by courier', 'attitude of driver', 'delivery service poor', 'failed delivery attempt courier fault'],
      'Other Delivery Issues': ['delivery other issue', 'shipping problem other', 'general delivery question', 'delivery query other'],

      // Stock & Availability
      'Out of Stock': ['out of stock', 'sold out', 'no stock online', 'item unavailable online', 'not available to buy', 'currently unavailable', 'item gone from site', 'product discontinued?', 'cannot find item', 'stock depleted', 'all gone', 'zero stock'],
      'Restock Inquiry': ['back in stock when', 'restock date please', 'when available again', 'notify me when back in stock', 'coming soon query item', 'will this be restocked', 'expecting more stock', 'item restock notification', 'please get more', 'waiting for restock', 'any news on restock', 'need this item restocked'],
      'Size/Colour Unavailable': ['size unavailable specific item', 'colour unavailable specific item', 'missing size in particular product', 'specific colour out of stock', 'no small/medium/large in this', 'need different size not listed', 'only xs/xl left', 'wanted colour gone', 'alternative colour available?', 'specific size sold out'],
      'General Stock/Preorder Questions': ['stock question other', 'availability query general', 'preorder issue other'],

      // Returns & Refunds
      'Refund Pending': ['refund pending still', 'waiting for my refund', 'money not back yet', 'refund status check', 'how long for refund to process', 'chasing refund', 'refund not received', 'when will I get my money', 'refund delay', 'no refund yet', 'refund confirmation but no money', 'where is my refund'],
      'Return Label Issues': ['return label needed', 'label not received email', 'qr code for return not working', 'no return slip in parcel', 'print return label problem', 'how to return without label', 'generate return label', 'return postage query', 'free return label?', 'return label missing', 'stuck for return label', 'cant print label'],
      'Exchange Request': ['exchange item for different size', 'swap item for another colour', 'replacement size/colour needed', 'want to exchange product', 'different item wanted instead', 'process exchange', 'how to exchange', 'exchange in store', 'online exchange problem', 'can I swap for', 'exchange for alternative'],
      'Other Returns/Refunds Issues': ['return issue other', 'refund query general', 'general returns question'],

      // Product Quality & Faults
      'Defective Item': ['faulty item received', 'defective product design', 'not working correctly from start', 'item broken after first use', 'doesn\'t work as expected', 'faulty goods', 'item faulty', 'product defect', 'stopped working', 'electrical fault', 'mechanical fault', 'broken zip', 'faulty clasp', 'manufacturing error'],
      'Damaged on Arrival': ['damaged item delivered', 'broken on arrival package', 'arrived damaged in box', 'packaging damaged item inside too', 'scratched product received', 'dented item', 'item crushed', 'product smashed', 'delivered broken', 'arrived faulty', 'cracked item', 'torn packaging item damage'],
      'Poor Material Quality': ['poor quality material used', 'thin material see through', 'fabric issue cheap', 'peeling fabric after one wear', 'discoloured item after wash', 'bobbling material', 'holes after washing', 'stitching coming undone', 'low quality fabric', 'material feels cheap', 'colour faded quickly', 'threads pulling', 'sequins falling off'],
      'Other Quality/Fault Issues': ['quality issue other', 'product fault general', 'general quality concern'],

      // Sizing & Fit
      'Too Small': ['too small for me', 'tight fit item', 'snug fit clothing', 'comes up small for size', 'should have ordered size up', 'very fitted', 'size is smaller than expected', 'need bigger size', 'can\'t get it on', 'restrictive fit', 'child size on adult item', 'shrunk in wash too small'],
      'Too Large': ['too large for me', 'very loose item', 'oversized item style', 'comes up big for size', 'should have ordered size down', 'baggy fit', 'size is larger than expected', 'need smaller size', 'swamped in it', 'generous sizing', 'too much material', 'looks like a tent'],
      'Size Guide Mismatch': ['size chart wrong for item', 'size guide incorrect online', 'chart misleading for product', 'measurements don\'t match size guide', 'sizing inconsistent with chart', 'followed guide but wrong fit', 'size helper inaccurate', 'check your size chart', 'size guide error', 'size conversion wrong'],
      'Other Sizing/Fit Issues': ['sizing issue other', 'fit problem general', 'general fit question'],

      // Pricing & Promotions
      'Price Discrepancy': ['price discrepancy at till', 'incorrect price online', 'price changed at checkout page', 'charged more than displayed', 'wrong price shown on tag', 'advertised price different', 'price error', 'shelf price wrong', 'scanned at wrong price', 'system price error', 'paid too much'],
      'Voucher Not Applied': ['voucher not applied at checkout', 'code invalid message', 'promo code fail to work', 'discount didn\'t work online', 'coupon error message', 'offer not deducting', 'code not recognised', 'promotion not applying', 'discount code rejected', 'voucher problem', 'can\'t use my code'],
      'Discount Code Request': ['discount code for students', 'voucher code for first order', 'need code for free delivery', 'any offers available now', 'student discount query', 'blue light card discount', 'nhs discount', 'promo code please', 'looking for a discount', 'can I get a code', 'share a voucher'],
      'Other Pricing/Promo Issues': ['pricing issue other', 'promotion problem general', 'general discount question'],

      // Customer Service Experience
      'Live Chat Issues': ['live chat unresponsive system', 'chat not working today', 'chat queue very long', 'chat ended abruptly by agent', 'live support problem connecting', 'chatbot unhelpful', 'no agent available chat', 'chat disconnected', 'technical issue with chat', 'can\'t start chat', 'chat button missing', 'waited ages for chat'],
      'Phone Support Issues': ['call waiting long time', 'on hold for ages with music', 'phone queue issue number', 'couldn\'t get through on phone line', 'call centre problem communication', 'phone agent issue', 'call dropped', 'number not working', 'customer service phone line busy', 'automated system nightmare', 'request callback not happened'],
      'Email/DM Support Issues': ['no response to my email', 'email unanswered for days', 'waiting for DM reply on social', 'social media support slow', 'message ignored by cs', 'complaint email no reply', 'ticket open no update', 'automated email reply only', 'no follow up', 'sent multiple emails', 'dm read no reply'],
      'General Customer Service Feedback': ['customer service other', 'support issue general', 'feedback on service general', 'general csat'],

      // Digital Platform Issues
      'Website Errors/Down': ['website down today', 'site offline message', 'page not loading error', 'website error message code', '404 error on page', 'server error on next website', 'can\'t access website', 'next.co.uk not working', 'site maintenance?', 'experiencing technical difficulties site', 'broken link on website', 'page unavailable'],
      'App Errors/Crashes': ['next app crash', 'app error message', 'app freezing on phone', 'unable to use next app', 'app not working android/iphone', 'mobile app issue login/payment', 'app keeps closing', 'bug in app', 'update app issue', 'app slow', 'can\'t download app', 'problem with next app'],
      'Login & Account Access Online': ['login issue online account', 'cannot log in to website/app account', 'online password reset fail link', 'my account page error message', 'forgot password link broken', 'account locked online', 'unable to sign in', 'username not recognized', 'password incorrect not working', 'account access denied', 'two factor authentication problem online'],
      'Other Digital Platform Issues': ['website issue other', 'app problem general', 'online system query'],

      // Furniture Assembly & Parts
      'Missing Parts/Hardware': ['missing screws for furniture', 'parts missing from flatpack', 'hardware missing for bed/table', 'no fittings in box', 'incomplete item furniture delivery', 'instruction manual missing', 'screws don\'t fit', 'not all parts included', 'missing component', 'part number x missing', 'fixings not supplied'],
      'Assembly Difficulty/Instructions': ['holes misaligned furniture assembly', 'cannot assemble wardrobe', 'assembly instructions unclear diagram', 'difficult to put together item', 'flat pack nightmare build', 'poor design assembly', 'confusing instructions', 'diagram wrong', 'assembly taking hours', 'need help assembling', 'parts don\'t align', 'faulty assembly design'],
      'Damaged Furniture Item': ['damaged furniture on arrival delivery', 'scratched table top', 'broken chair leg received', 'dented wardrobe panel', 'furniture quality issue damage', 'chip on furniture', 'cracked wood furniture', 'mirror broken furniture', 'upholstery torn furniture', 'delivered faulty furniture'],
      'Other Furniture Issues': ['furniture problem other', 'assembly query general', 'large item issue general'],

      // Account & Security (General)
      'Unauthorized Charges/Fraud': ['unauthorised charge on my card', 'unknown charge on account statement', 'fraudulent transaction next', 'suspicious activity on my next account', 'billing error security concern', 'payment taken twice', 'charged for item not received', 'identity theft concern', 'scam email next', 'card used without permission'],
      'Password & Security Concerns': ['password reset issue general account', 'security concern my account', 'account hacked concern general', 'phishing email received pretending next', 'suspicious login attempt notification', 'update security questions', 'password strength', 'security code not received', 'account compromised', 'unable to change password', 'too many login attempts'],
      'Data Privacy & Protection': ['data breach fear next', 'privacy concern handling my data', 'personal information security query', 'gdpr request next', 'data protection issue complaint', 'how is my data used', 'selling my data?', 'privacy policy query', 'right to be forgotten', 'subject access request', 'data security next'],
      'Other Account/Security Issues': ['account problem other', 'security issue general', 'general account question'],

=======
      'Basket/Cart Errors': ['basket error', 'cart issue', 'cannot add to basket'],
      'Payment Failure': ['payment failed', 'card declined', 'transaction failed'],
      'Order Confirmation Issues': ['no confirmation email', 'order confirmation missing', 'no tracking number'],
      'Address & Shipping Details': ['address error', 'address not recognised', 'wrong address'],
     
      // Delivery & Shipping
      'Late Delivery': ['late delivery', 'delivery delay', 'still waiting'],
      'Lost / Missing Parcel': ['lost parcel', 'parcel missing', 'parcel not arrived'],
      'Courier Complaints': ['courier delay', 'evri', 'dpd', 'driver issue'],
      'International Shipping Fees': ['international shipping', 'shipping fee', 'saudi', 'riyals'],
     
      // Stock & Availability
      'Out of Stock': ['out of stock', 'sold out', 'no stock'],
      'Restock Inquiry': ['back in stock', 'restock', 'coming soon'],
      'Size/Colour Unavailable': ['size unavailable', 'colour unavailable', 'missing size'],
      'Preorders': ['preorder', 'pre-order', 'release date'],
     
      // Returns & Refunds
      'Refund Pending': ['refund pending', 'waiting for refund', 'money back'],
      'Return Label Issues': ['return label', 'label not received', 'qr code'],
      'Exchange Request': ['exchange', 'swap item', 'replacement'],
      'Collection Delay': ['collection delay', 'courier collection', 'pick-up delay'],
     
      // Product Quality & Faults
      'Defective Item': ['faulty item', 'defective', 'not working'],
      'Damaged on Arrival': ['damaged', 'broken', 'arrived damaged'],
      'Poor Material Quality': ['poor quality', 'thin material', 'peeling', 'discoloured'],
      'Rapid Wear & Tear': ['wear quickly', 'fluff', 'bobbling', 'tights tear'],
     
      // Sizing & Fit
      'Too Small': ['too small', 'tight fit', 'snug'],
      'Too Large': ['too large', 'very loose', 'oversized'],
      'Size Guide Mismatch': ['size chart', 'size guide incorrect', 'chart misleading'],
      'Comfort Issues': ['uncomfortable', 'digging in', 'itchy'],
     
      // Pricing & Promotions
      'Price Discrepancy': ['price discrepancy', 'incorrect price', 'price changed'],
      'Voucher Not Applied': ['voucher not applied', 'code invalid', 'promo code fail'],
      'Discount Code Request': ['discount code', 'voucher code', 'need code'],
      'Gift Card Problems': ['gift card', 'gift balance', 'card not accepted'],
     
      // Customer Service Experience
      'Live Chat Unresponsive': ['live chat', 'chat not working', 'chat queue'],
      'Phone Wait Times': ['call waiting', 'on hold', 'phone queue'],
      'Email No Response': ['no response email', 'email unanswered', 'waiting for reply'],
      'Helpful Staff Praise': ['helpful staff', 'brilliant service', 'thank you'],
     
      // Digital Platform Issues
      'Website Down': ['website down', 'site offline', 'page not loading'],
      'App Crash': ['app crash', 'app error', 'app freezing'],
      'Login Problems': ['login issue', 'cannot log in', 'password reset'],
      'Image/Photo Load': ['image not loading', 'photo missing', 'clearance section no photos'],
     
      // Furniture Assembly & Parts
      'Missing Parts': ['missing screws', 'parts missing', 'hardware missing'],
      'Assembly Difficulty': ['holes misaligned', 'cannot assemble', 'assembly issue'],
      'Damaged Furniture': ['damaged furniture', 'scratched', 'broken leg'],
      'Replacement Collection Delay': ['replacement delay', 'collection delay', 'courier collection'],
     
      // Account & Security
      'Unauthorized Charge': ['unauthorised charge', 'unknown charge', 'fraudulent'],
      'Password Reset Issues': ['password reset', 'reset link', 'cannot reset'],
      'Data Breach Fears': ['data breach', 'security breach', 'privacy concern'],
      'Account Access': ['account locked', 'cannot access account', 'account hacked'],
     

      // Marketing & Communications
      'Unwanted Post/Mail': ['magazine', 'mailing list', 'post permission'],
      'Email/SMS Spam': ['promo email', 'sms spam', 'unsubscribe'],
      'Magazine Subscription': ['magazine subscription', 'catalogue', 'brochure'],
      'Social Media Campaign Feedback': ['campaign', 'ad', 'marketing'],
     
      // Product Information & Queries
      'Product Code Request': ['product code', 'code please', 'code number'],
      'Material/Feature Query': ['material', 'fabric', 'features'],
      'Similar Product Request': ['similar', 'like this', 'alternative'],
      'Size/Measurements Inquiry': ['measurements', 'dimensions', 'strap length'],
     
      // Miscellaneous & Other
      'Brand Mention Only': ['nextofficial'],
      'General Greetings': ['hello', 'hi', 'hun'],
      'Non-Specific Complaint': ['poor show', 'disappointed', 'unhappy'],
      'Off-topic': ['sleep', 'try again tomorrow']
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
        followers: parseInt(rawTweet.Followers || rawTweet['User Followers'] || rawTweet['Author Followers'] || rawTweet.followers_count || '0', 10), // Added line
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
      let topicMatched = false;

      for (const [topicName, keywords] of Object.entries(topicKeywords)) {
        if (keywords.some(keyword => text.includes(keyword))) {
          const topic = topics.find(t => t.name === topicName);
          if (!topic) {
            console.warn(`Topic '${topicName}' not found in predefined topics.`);
            continue;
          }
          topic.tweetCount++;

          for (const [subtopicName, subKeywords] of Object.entries(subtopicKeywords)) {
            if (subKeywords.some(subKeyword => text.includes(subKeyword))) {
              const subtopic = topic.subtopics.find(s => s.name === subtopicName);
              if (!subtopic) {
                console.warn(`Subtopic '${subtopicName}' not found in topic '${topicName}'.`);
                continue;
              }
              subtopic.tweetCount++;
              subtopic.tweets.push(tweet);
              topicMatched = true;
              break;
            }
          }

          if (!topicMatched && topic.subtopics[0]) {
            topic.subtopics[0].tweetCount++;
            topic.subtopics[0].tweets.push(tweet);
            topicMatched = true;
          }
          break;
        }
      }

      if (!topicMatched) {
        const otherTopic = topics.find(t => t.name === 'Miscellaneous & Other');
        if (otherTopic && otherTopic.subtopics[0]) {
          otherTopic.tweetCount++;
          otherTopic.subtopics[0].tweetCount++;
          otherTopic.subtopics[0].tweets.push(tweet);
        } else {
          console.warn('Miscellaneous & Other topic or its first subtopic not found.');
        }
      }
    });

    return topics;
  }
}

export default DataService;
