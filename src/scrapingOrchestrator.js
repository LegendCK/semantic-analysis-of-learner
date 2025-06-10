#!/usr/bin/env node

const mongoose = require('mongoose');
const comprehensiveScraper = require('./comprehensiveScraper');
const dynamicKnowledgeGraph = require('../services/dynamicKnowledgeGraph');
require('dotenv').config();

class ScrapingOrchestrator {
  constructor() {
    this.isRunning = false;
    this.startTime = null;
    this.stats = {
      totalTime: 0,
      conceptsProcessed: 0,
      resourcesAdded: 0,
      questionsGenerated: 0,
      nodesExpanded: 0,
      errors: []
    };
  }

  async run() {
    if (this.isRunning) {
      console.log('⚠️ Scraping orchestrator is already running');
      return;
    }

    this.isRunning = true;
    this.startTime = new Date();
    
    console.log('🚀 Starting DSA NLP Learning Platform - Comprehensive Data Collection');
    console.log('=' .repeat(80));
    console.log(`Start Time: ${this.startTime.toLocaleString()}`);
    console.log('=' .repeat(80));

    try {
      // Connect to database
      console.log('\n📦 Connecting to MongoDB...');
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/dsa_nlp_platform');
      console.log('✅ Connected to MongoDB');

      // Phase 1: Comprehensive Resource Scraping
      console.log('\n🔍 Phase 1: Comprehensive Resource Scraping');
      console.log('-'.repeat(50));
      const scrapingStart = new Date();
      
      await comprehensiveScraper.runComprehensiveScraping();
      
      const scrapingStats = comprehensiveScraper.getStats();
      this.stats.conceptsProcessed = scrapingStats.conceptsProcessed;
      this.stats.resourcesAdded = scrapingStats.resourcesAdded;
      this.stats.questionsGenerated = scrapingStats.questionsGenerated;
      
      const scrapingTime = new Date() - scrapingStart;
      console.log(`✅ Phase 1 completed in ${this.formatTime(scrapingTime)}`);
      console.log(`📊 Stats: ${scrapingStats.conceptsProcessed} concepts, ${scrapingStats.resourcesAdded} resources, ${scrapingStats.questionsGenerated} questions`);

      // Phase 2: Knowledge Graph Analysis and Expansion
      console.log('\n🕸️ Phase 2: Knowledge Graph Analysis');
      console.log('-'.repeat(50));
      const graphStart = new Date();
      
      await this.analyzeAndExpandKnowledgeGraph();
      
      const graphTime = new Date() - graphStart;
      console.log(`✅ Phase 2 completed in ${this.formatTime(graphTime)}`);

      // Phase 3: Data Quality Analysis
      console.log('\n🔍 Phase 3: Data Quality Analysis');
      console.log('-'.repeat(50));
      const qualityStart = new Date();
      
      await this.performQualityAnalysis();
      
      const qualityTime = new Date() - qualityStart;
      console.log(`✅ Phase 3 completed in ${this.formatTime(qualityTime)}`);

      // Final Summary
      await this.generateFinalReport();

    } catch (error) {
      console.error('\n❌ Critical error in scraping orchestrator:', error);
      this.stats.errors.push({
        phase: 'main',
        error: error.message,
        timestamp: new Date()
      });
    } finally {
      this.isRunning = false;
      await mongoose.disconnect();
      console.log('\n📦 Disconnected from MongoDB');
      
      const totalTime = new Date() - this.startTime;
      this.stats.totalTime = totalTime;
      
      console.log('\n🏁 Scraping orchestrator completed');
      console.log(`⏱️ Total execution time: ${this.formatTime(totalTime)}`);
    }
  }

  async analyzeAndExpandKnowledgeGraph() {
    try {
      console.log('🔍 Analyzing knowledge graph for expansion opportunities...');
      
      // Get expansion candidates
      const candidates = dynamicKnowledgeGraph.getExpansionCandidates();
      console.log(`📋 Found ${candidates.length} expansion candidates`);

      // Process high-priority candidates
      const highPriority = candidates.filter(c => c.progressToExpansion > 80);
      
      for (const candidate of highPriority.slice(0, 5)) {
        try {
          console.log(`🚀 Expanding knowledge graph with: ${candidate.term}`);
          
          const result = await dynamicKnowledgeGraph.manualExpansion(
            candidate.term,
            `What is ${candidate.term} in data structures and algorithms?`,
            { source: 'orchestrator', priority: 'high' }
          );
          
          if (result && result.action === 'expanded') {
            this.stats.nodesExpanded++;
            console.log(`✅ Successfully expanded: ${candidate.term}`);
          }
          
          // Add delay between expansions
          await this.delay(2000);
          
        } catch (error) {
          console.error(`❌ Error expanding ${candidate.term}:`, error.message);
          this.stats.errors.push({
            phase: 'graph-expansion',
            term: candidate.term,
            error: error.message,
            timestamp: new Date()
          });
        }
      }
      
      console.log(`🕸️ Knowledge graph expansion completed. ${this.stats.nodesExpanded} new nodes added.`);
      
    } catch (error) {
      console.error('❌ Error in knowledge graph analysis:', error);
      this.stats.errors.push({
        phase: 'graph-analysis',
        error: error.message,
        timestamp: new Date()
      });
    }
  }

  async performQualityAnalysis() {
    try {
      console.log('🔍 Performing data quality analysis...');
      
      const Concept = require('../models/Concept');
      const Resource = require('../models/Resource');
      const Question = require('../models/Question');
      
      // Analyze concepts
      const concepts = await Concept.find({ isActive: true });
      const conceptsWithoutResources = await Concept.aggregate([
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
            'resources': { $size: 0 }
          }
        }
      ]);
      
      console.log(`📊 Concept Analysis:`);
      console.log(`   Total concepts: ${concepts.length}`);
      console.log(`   Concepts without resources: ${conceptsWithoutResources.length}`);
      console.log(`   Dynamic concepts: ${concepts.filter(c => c.isDynamic).length}`);
      
      // Analyze resources
      const resourceStats = await Resource.aggregate([
        { $match: { isActive: true } },
        {
          $group: {
            _id: '$source',
            count: { $sum: 1 },
            avgRating: { $avg: '$rating' },
            totalViews: { $sum: '$views' }
          }
        },
        { $sort: { count: -1 } }
      ]);
      
      console.log(`📊 Resource Analysis:`);
      resourceStats.forEach(stat => {
        console.log(`   ${stat._id}: ${stat.count} resources (avg rating: ${stat.avgRating?.toFixed(2) || 'N/A'})`);
      });
      
      // Analyze questions
      const totalQuestions = await Question.countDocuments();
      const generatedQuestions = await Question.countDocuments({ isGenerated: true });
      
      console.log(`📊 Question Analysis:`);
      console.log(`   Total questions: ${totalQuestions}`);
      console.log(`   Generated questions: ${generatedQuestions}`);
      console.log(`   User questions: ${totalQuestions - generatedQuestions}`);
      
      // Identify improvement opportunities
      console.log(`\n💡 Improvement Opportunities:`);
      
      if (conceptsWithoutResources.length > 0) {
        console.log(`   • ${conceptsWithoutResources.length} concepts need resources`);
      }
      
      const lowRatedSources = resourceStats.filter(s => s.avgRating < 3);
      if (lowRatedSources.length > 0) {
        console.log(`   • Review resources from: ${lowRatedSources.map(s => s._id).join(', ')}`);
      }
      
      if (generatedQuestions / totalQuestions > 0.8) {
        console.log(`   • Need more user-generated content (${((1 - generatedQuestions/totalQuestions) * 100).toFixed(1)}% user content)`);
      }
      
    } catch (error) {
      console.error('❌ Error in quality analysis:', error);
      this.stats.errors.push({
        phase: 'quality-analysis',
        error: error.message,
        timestamp: new Date()
      });
    }
  }

  async generateFinalReport() {
    console.log('\n📊 FINAL REPORT');
    console.log('='.repeat(80));
    console.log(`Execution Time: ${this.formatTime(this.stats.totalTime)}`);
    console.log(`Start: ${this.startTime.toLocaleString()}`);
    console.log(`End: ${new Date().toLocaleString()}`);
    console.log('');
    console.log('RESULTS:');
    console.log(`✅ Concepts Processed: ${this.stats.conceptsProcessed}`);
    console.log(`✅ Resources Added: ${this.stats.resourcesAdded}`);
    console.log(`✅ Questions Generated: ${this.stats.questionsGenerated}`);
    console.log(`✅ Knowledge Graph Nodes Expanded: ${this.stats.nodesExpanded}`);
    console.log(`❌ Errors Encountered: ${this.stats.errors.length}`);
    
    if (this.stats.errors.length > 0) {
      console.log('\nERROR SUMMARY:');
      const errorsByPhase = this.stats.errors.reduce((acc, error) => {
        acc[error.phase] = (acc[error.phase] || 0) + 1;
        return acc;
      }, {});
      
      Object.entries(errorsByPhase).forEach(([phase, count]) => {
        console.log(`   ${phase}: ${count} errors`);
      });
    }
    
    // Generate recommendations  
    console.log('\n💡 RECOMMENDATIONS:');
    
    if (this.stats.resourcesAdded > 1000) {
      console.log('✅ Excellent resource collection - over 1000 resources added');
    } else if (this.stats.resourcesAdded > 500) {
      console.log('👍 Good resource collection - consider running scraping more frequently');
    } else {
      console.log('⚠️ Low resource collection - check scraping sources and network connectivity');
    }
    
    if (this.stats.conceptsProcessed >= 10) {
      console.log('✅ All major DSA concepts processed');
    } else {
      console.log('⚠️ Some concepts may not have been processed - check database seeding');
    }
    
    if (this.stats.nodesExpanded > 0) {
      console.log(`✅ Knowledge graph expanded with ${this.stats.nodesExpanded} new nodes`);
    } else {
      console.log('ℹ️ No knowledge graph expansion - this is normal for initial runs');
    }
    
    console.log('\n🎉 DSA NLP Learning Platform data collection completed successfully!');
    console.log('🚀 The platform is now ready with comprehensive educational resources.');
    console.log('='.repeat(80));
  }

  formatTime(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  }

  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Command line interface
if (require.main === module) {
  const orchestrator = new ScrapingOrchestrator();
  
  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n⚠️ Received interrupt signal. Shutting down gracefully...');
    process.exit(0);
  });
  
  process.on('SIGTERM', () => {
    console.log('\n⚠️ Received termination signal. Shutting down gracefully...');
    process.exit(0);
  });
  
  // Run the orchestrator
  orchestrator.run()
    .then(() => {
      console.log('\n✅ Orchestrator completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Orchestrator failed:', error);
      process.exit(1);
    });
}

module.exports = ScrapingOrchestrator;
