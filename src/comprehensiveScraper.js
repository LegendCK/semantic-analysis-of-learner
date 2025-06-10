const mongoose = require('mongoose');
const cron = require('node-cron');
const enhancedResourceService = require('../services/enhancedResourceService');
const nlpService = require('../services/nlpService');
const Concept = require('../models/Concept');
const Question = require('../models/Question');
const Resource = require('../models/Resource');

class ComprehensiveScraper {
  constructor() {
    this.isRunning = false;
    this.stats = {
      totalScraped: 0,
      conceptsProcessed: 0,
      questionsGenerated: 0,
      resourcesAdded: 0,
      errors: 0
    };
    
    // Target numbers per concept
    this.targets = {
      articles: 100,
      videos: 50,
      problems: 150,
      documentation: 100,
      total: 500
    };
  }

  // Main scraping orchestrator
  async runComprehensiveScraping() {
    if (this.isRunning) {
      console.log('Scraping already in progress...');
      return;
    }

    this.isRunning = true;
    console.log('🚀 Starting comprehensive DSA content scraping...');
    
    try {
      await this.connectToDatabase();
      
      // Get all concepts from database
      const concepts = await Concept.find({ isActive: true });
      console.log(`📚 Found ${concepts.length} concepts to process`);

      // Process each concept
      for (const concept of concepts) {
        await this.processConceptComprehensively(concept);
        
        // Add delay between concepts to be respectful to servers
        await this.delay(5000);
      }

      // Generate intelligent questions based on scraped content
      await this.generateIntelligentQuestions();
      
      // Update concept relationships and knowledge graph
      await this.updateKnowledgeGraph();
      
      console.log('✅ Comprehensive scraping completed!');
      console.log('📊 Final Stats:', this.stats);

    } catch (error) {
      console.error('❌ Error in comprehensive scraping:', error);
      this.stats.errors++;
    } finally {
      this.isRunning = false;
      await enhancedResourceService.closeBrowser();
    }
  }

  // Process a single concept comprehensively
  async processConceptComprehensively(concept) {
    console.log(`\n🔍 Processing concept: ${concept.name}`);
    
    const conceptStats = {
      articles: 0,
      videos: 0,
      problems: 0,
      documentation: 0
    };

    try {
      // Get existing resources count
      const existingCount = await Resource.countDocuments({ 
        concepts: concept._id,
        isActive: true 
      });
      
      console.log(`📈 Existing resources: ${existingCount}`);
      
      if (existingCount >= this.targets.total) {
        console.log(`✅ Concept ${concept.name} already has sufficient resources`);
        return;
      }

      // Perform comprehensive search
      const resources = await enhancedResourceService.comprehensiveSearch(
        concept.key,
        'any',
        'any'
      );

      if (resources.length === 0) {
        console.log(`⚠️ No resources found for ${concept.name}`);
        return;
      }

      // Categorize and save resources
      const categorizedResources = this.categorizeResources(resources);
      
      // Save resources in batches with enhanced metadata
      for (const [category, categoryResources] of Object.entries(categorizedResources)) {
        if (categoryResources.length > 0) {
          const saved = await enhancedResourceService.saveResourcesBatch(
            categoryResources.slice(0, this.targets[category] || 50),
            concept._id
          );
          
          conceptStats[category] = saved.length;
          console.log(`💾 Saved ${saved.length} ${category} for ${concept.name}`);
        }
      }

      // Generate section-wise sub-topics
      await this.generateSubTopics(concept, resources);
      
      // Create micro-learning suggestions
      await this.createMicroLearningSuggestions(concept, conceptStats);

      this.stats.conceptsProcessed++;
      this.stats.resourcesAdded += Object.values(conceptStats).reduce((a, b) => a + b, 0);
      
      console.log(`✅ Completed ${concept.name}:`, conceptStats);

    } catch (error) {
      console.error(`❌ Error processing ${concept.name}:`, error);
      this.stats.errors++;
    }
  }

  // Categorize resources by type
  categorizeResources(resources) {
    const categorized = {
      articles: [],
      videos: [],
      problems: [],
      documentation: []
    };

    resources.forEach(resource => {
      switch (resource.type) {
        case 'article':
          categorized.articles.push(resource);
          break;
        case 'video':
          categorized.videos.push(resource);
          break;
        case 'problem':
          categorized.problems.push(resource);
          break;
        case 'documentation':
          categorized.documentation.push(resource);
          break;
        default:
          // Categorize based on source if type is unclear
          if (['youtube'].includes(resource.source)) {
            categorized.videos.push(resource);
          } else if (['leetcode', 'hackerrank', 'codechef'].includes(resource.source)) {
            categorized.problems.push(resource);
          } else if (['stackoverflow'].includes(resource.source)) {
            categorized.documentation.push(resource);
          } else {
            categorized.articles.push(resource);
          }
      }
    });

    return categorized;
  }

  // Generate sub-topics based on scraped content
  async generateSubTopics(concept, resources) {
    const subTopics = new Set();
    
    // Extract sub-topics from resource titles and descriptions
    resources.forEach(resource => {
      const text = `${resource.title} ${resource.description}`.toLowerCase();
      
      // Use NLP to extract key phrases
      const processed = nlpService.processQuestion(text);
      processed.keywords.forEach(keyword => {
        if (keyword.length > 3 && !concept.name.toLowerCase().includes(keyword)) {
          subTopics.add(keyword);
        }
      });
      
      // Extract from tags
      if (resource.tags) {
        resource.tags.forEach(tag => {
          if (tag.length > 3 && !concept.name.toLowerCase().includes(tag.toLowerCase())) {
            subTopics.add(tag);
          }
        });
      }
    });

    // Update concept with sub-topics
    const subTopicsArray = Array.from(subTopics).slice(0, 20); // Limit to 20 sub-topics
    
    if (subTopicsArray.length > 0) {
      await Concept.findByIdAndUpdate(concept._id, {
        $addToSet: { 
          subTopics: { $each: subTopicsArray },
          keywords: { $each: subTopicsArray }
        }
      });
      
      console.log(`🏷️ Added ${subTopicsArray.length} sub-topics to ${concept.name}`);
    }
  }

  // Create micro-learning suggestions
  async createMicroLearningSuggestions(concept, stats) {
    const suggestions = [];
    
    // Get a sample of resources for each type
    const sampleResources = await Resource.find({
      concepts: concept._id,
      isActive: true
    }).limit(10);

    // Create progressive learning path
    if (stats.articles > 0) {
      suggestions.push({
        type: 'read',
        title: `Understanding ${concept.name} Fundamentals`,
        description: `Start with basic concepts and theory`,
        estimatedTime: '15-20 minutes',
        difficulty: 'easy',
        resources: sampleResources.filter(r => r.type === 'article').slice(0, 3)
      });
    }

    if (stats.videos > 0) {
      suggestions.push({
        type: 'watch',
        title: `Visual Learning: ${concept.name}`,
        description: `Watch explanatory videos for better understanding`,
        estimatedTime: '20-30 minutes',
        difficulty: 'easy',
        resources: sampleResources.filter(r => r.type === 'video').slice(0, 2)
      });
    }

    if (stats.problems > 0) {
      suggestions.push({
        type: 'practice',
        title: `Hands-on Practice: ${concept.name}`,
        description: `Solve problems to reinforce learning`,
        estimatedTime: '30-45 minutes',
        difficulty: 'medium',
        resources: sampleResources.filter(r => r.type === 'problem').slice(0, 3)
      });
    }

    // Save micro-learning suggestions to concept
    if (suggestions.length > 0) {
      await Concept.findByIdAndUpdate(concept._id, {
        microLearningSuggestions: suggestions
      });
      
      console.log(`💡 Added ${suggestions.length} micro-learning suggestions for ${concept.name}`);
    }
  }

  // Generate intelligent questions based on scraped content
  async generateIntelligentQuestions() {
    console.log('\n🤔 Generating intelligent questions from scraped content...');
    
    const concepts = await Concept.find({ isActive: true });
    
    for (const concept of concepts) {
      const resources = await Resource.find({
        concepts: concept._id,
        isActive: true
      }).limit(50);

      const questions = [];
      
      // Generate different types of questions
      questions.push(...this.generateDefinitionQuestions(concept, resources));
      questions.push(...this.generateImplementationQuestions(concept, resources));
      questions.push(...this.generateComparisonQuestions(concept, resources));
      questions.push(...this.generateApplicationQuestions(concept, resources));
      
      // Save generated questions
      for (const questionData of questions) {
        try {
          const existingQuestion = await Question.findOne({ 
            question: questionData.question 
          });
          
          if (!existingQuestion) {
            const question = new Question({
              ...questionData,
              concept: concept._id,
              isGenerated: true,
              generatedAt: new Date()
            });
            
            await question.save();
            this.stats.questionsGenerated++;
          }
        } catch (error) {
          console.error('Error saving generated question:', error);
        }
      }
      
      console.log(`❓ Generated ${questions.length} questions for ${concept.name}`);
    }
  }

  // Generate definition-type questions
  generateDefinitionQuestions(concept, resources) {
    const questions = [];
    const conceptName = concept.name.replace('-', ' ');
    
    questions.push({
      question: `What is ${conceptName} and when should it be used?`,
      expectedAnswer: `${conceptName} is a fundamental concept in data structures and algorithms...`,
      difficulty: 'easy',
      tags: [concept.key, 'definition', 'theory'],
      resources: resources.filter(r => r.type === 'article').slice(0, 3).map(r => r._id)
    });
    
    questions.push({
      question: `Explain the key characteristics of ${conceptName}`,
      expectedAnswer: `The key characteristics include...`,
      difficulty: 'easy',
      tags: [concept.key, 'characteristics', 'theory'],
      resources: resources.filter(r => r.type === 'article').slice(0, 3).map(r => r._id)
    });
    
    return questions;
  }

  // Generate implementation-type questions
  generateImplementationQuestions(concept, resources) {
    const questions = [];
    const conceptName = concept.name.replace('-', ' ');
    
    const languages = ['javascript', 'python', 'java', 'cpp'];
    
    languages.forEach(lang => {
      questions.push({
        question: `How do you implement ${conceptName} in ${lang}?`,
        expectedAnswer: `Here's how to implement ${conceptName} in ${lang}...`,
        difficulty: 'medium',
        programmingLanguage: lang,
        tags: [concept.key, 'implementation', lang],
        resources: resources.filter(r => 
          r.programmingLanguage === lang || r.tags?.includes(lang)
        ).slice(0, 2).map(r => r._id)
      });
    });
    
    return questions.slice(0, 3); // Limit to 3 languages
  }

  // Generate comparison questions
  generateComparisonQuestions(concept, resources) {
    const questions = [];
    const conceptName = concept.name.replace('-', ' ');
    
    // Common comparisons for different concepts
    const comparisons = {
      'arrays': ['linked lists', 'dynamic arrays'],
      'stacks': ['queues', 'arrays'],
      'trees': ['graphs', 'linked lists'],
      'sorting': ['searching', 'different sorting algorithms'],
      'graphs': ['trees', 'matrices']
    };
    
    const compareWith = comparisons[concept.key] || [];
    
    compareWith.forEach(other => {
      questions.push({
        question: `What are the differences between ${conceptName} and ${other}?`,
        expectedAnswer: `The main differences are...`,
        difficulty: 'medium',
        tags: [concept.key, other, 'comparison'],
        resources: resources.filter(r => r.type === 'article').slice(0, 2).map(r => r._id)
      });
    });
    
    return questions.slice(0, 2);
  }

  // Generate application questions
  generateApplicationQuestions(concept, resources) {
    const questions = [];
    const conceptName = concept.name.replace('-', ' ');
    
    questions.push({
      question: `What are some real-world applications of ${conceptName}?`,
      expectedAnswer: `Real-world applications include...`,
      difficulty: 'medium',
      tags: [concept.key, 'applications', 'real-world'],
      resources: resources.filter(r => r.type === 'article').slice(0, 3).map(r => r._id)
    });
    
    questions.push({
      question: `How do you optimize ${conceptName} for better performance?`,
      expectedAnswer: `Optimization techniques include...`,
      difficulty: 'hard',
      tags: [concept.key, 'optimization', 'performance'],
      resources: resources.filter(r => r.type === 'problem').slice(0, 2).map(r => r._id)
    });
    
    return questions;
  }

  // Update knowledge graph with new relationships
  async updateKnowledgeGraph() {
    console.log('\n🕸️ Updating knowledge graph with new relationships...');
    
    const concepts = await Concept.find({ isActive: true });
    
    for (const concept of concepts) {
      // Find related concepts based on shared resources and keywords
      const relatedConcepts = await this.findRelatedConcepts(concept);
      
      if (relatedConcepts.length > 0) {
        await Concept.findByIdAndUpdate(concept._id, {
          $addToSet: {
            relatedConcepts: { $each: relatedConcepts }
          }
        });
        
        console.log(`🔗 Added ${relatedConcepts.length} relationships for ${concept.name}`);
      }
    }
  }

  // Find related concepts using NLP and resource analysis
  async findRelatedConcepts(concept) {
    const related = [];
    
    // Get resources for this concept
    const resources = await Resource.find({
      concepts: concept._id,
      isActive: true
    }).limit(20);
    
    // Extract keywords from all resources
    const allKeywords = new Set();
    resources.forEach(resource => {
      if (resource.tags) {
        resource.tags.forEach(tag => allKeywords.add(tag.toLowerCase()));
      }
      
      // Process title and description for more keywords
      const processed = nlpService.processQuestion(
        `${resource.title} ${resource.description}`
      );
      processed.keywords.forEach(keyword => allKeywords.add(keyword.toLowerCase()));
    });
    
    // Find concepts with similar keywords
    const allConcepts = await Concept.find({ 
      _id: { $ne: concept._id },
      isActive: true 
    });
    
    for (const otherConcept of allConcepts) {
      let similarity = 0;
      
      // Check keyword overlap
      if (otherConcept.keywords) {
        const overlap = otherConcept.keywords.filter(keyword => 
          allKeywords.has(keyword.toLowerCase())
        ).length;
        similarity += overlap * 0.3;
      }
      
      // Check if they share resources
      const sharedResources = await Resource.countDocuments({
        concepts: { $all: [concept._id, otherConcept._id] }
      });
      similarity += sharedResources * 0.5;
      
      // Use NLP to find semantic similarity
      const semanticSimilarity = nlpService.calculateCosineSimilarity(
        nlpService.createWordVector([concept.name, ...concept.keywords]),
        nlpService.createWordVector([otherConcept.name, ...otherConcept.keywords])
      );
      similarity += semanticSimilarity * 0.2;
      
      if (similarity > 0.5) {
        related.push({
          concept: otherConcept._id,
          name: otherConcept.name,
          similarity: similarity,
          relationship: this.determineRelationshipType(concept, otherConcept)
        });
      }
    }
    
    return related.sort((a, b) => b.similarity - a.similarity).slice(0, 5);
  }

  // Determine relationship type between concepts
  determineRelationshipType(concept1, concept2) {
    const hierarchies = {
      'data-structures': ['arrays', 'linked-lists', 'stacks', 'queues', 'trees', 'graphs'],
      'algorithms': ['sorting', 'searching', 'dynamic-programming', 'greedy', 'backtracking']
    };
    
    // Check if they're in the same hierarchy
    for (const [parent, children] of Object.entries(hierarchies)) {
      if (children.includes(concept1.key) && children.includes(concept2.key)) {
        return 'sibling';
      }
    }
    
    // Check for prerequisite relationships
    const prerequisites = {
      'trees': ['arrays', 'recursion'],
      'graphs': ['trees', 'queues', 'stacks'],
      'dynamic-programming': ['recursion', 'arrays']
    };
    
    if (prerequisites[concept1.key]?.includes(concept2.key)) {
      return 'prerequisite';
    }
    
    if (prerequisites[concept2.key]?.includes(concept1.key)) {
      return 'builds-on';
    }
    
    return 'related';
  }

  // Utility functions
  async connectToDatabase() {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/dsa_nlp_platform');
      console.log('📦 Connected to MongoDB');
    }
  }

  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Schedule regular scraping updates
  scheduleRegularUpdates() {
    // Run comprehensive scraping weekly
    cron.schedule('0 2 * * 0', async () => {
      console.log('🕐 Running scheduled comprehensive scraping...');
      await this.runComprehensiveScraping();
    });

    // Run incremental updates daily
    cron.schedule('0 3 * * *', async () => {
      console.log('🕐 Running daily incremental updates...');
      await this.runIncrementalUpdate();
    });
  }

  // Run incremental updates for trending topics
  async runIncrementalUpdate() {
    try {
      // Get concepts that need updates (less than 100 resources or old resources)
      const concepts = await Concept.aggregate([
        {
          $lookup: {
            from: 'resources',
            localField: '_id',
            foreignField: 'concepts',
            as: 'resources'
          }
        },
        {
          $match: {
            $or: [
              { 'resources': { $size: 0 } },
              { 'resources': { $lt: { $size: 100 } } }
            ]
          }
        },
        { $limit: 5 }
      ]);

      for (const concept of concepts) {
        await this.processConceptComprehensively(concept);
        await this.delay(2000);
      }

      console.log(`✅ Incremental update completed for ${concepts.length} concepts`);
    } catch (error) {
      console.error('❌ Error in incremental update:', error);
    }
  }

  // Get scraping statistics
  getStats() {
    return this.stats;
  }

  // Reset statistics
  resetStats() {
    this.stats = {
      totalScraped: 0,
      conceptsProcessed: 0,
      questionsGenerated: 0,
      resourcesAdded: 0,
      errors: 0
    };
  }
}

module.exports = new ComprehensiveScraper();
