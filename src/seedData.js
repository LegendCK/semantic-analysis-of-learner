const mongoose = require('mongoose');
const Concept = require('../models/Concept');
const Resource = require('../models/Resource');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const concepts = [
  {
    name: 'Arrays',
    description: 'Arrays are a fundamental data structure that stores elements in contiguous memory locations.',
    category: 'arrays',
    difficulty: 'beginner',
    keywords: ['array', 'index', 'element', 'length', 'iteration'],
    commonQuestions: [
      'How to initialize an array?',
      'How to access array elements?',
      'How to find the length of an array?',
      'How to add elements to an array?',
      'How to remove elements from an array?'
    ],
    subConcepts: [
      {
        name: 'initialization',
        description: 'Creating and initializing arrays with values',
        keywords: ['create', 'declare', 'initialize', 'new'],
        codeExamples: [
          {
            language: 'javascript',
            code: 'let arr = [1, 2, 3, 4, 5];',
            explanation: 'Initialize array with values'
          },
          {
            language: 'python',
            code: 'arr = [1, 2, 3, 4, 5]',
            explanation: 'Initialize array with values'
          }
        ]
      },
      {
        name: 'insertion',
        description: 'Adding elements to arrays',
        keywords: ['push', 'append', 'insert', 'add'],
        codeExamples: [
          {
            language: 'javascript',
            code: 'arr.push(6); // Add to end\narr.unshift(0); // Add to beginning',
            explanation: 'Insert elements at different positions'
          }
        ]
      },
      {
        name: 'deletion',
        description: 'Removing elements from arrays',
        keywords: ['pop', 'remove', 'delete', 'splice'],
        codeExamples: [
          {
            language: 'javascript',
            code: 'arr.pop(); // Remove from end\narr.shift(); // Remove from beginning',
            explanation: 'Remove elements from different positions'
          }
        ]
      },
      {
        name: 'traversal',
        description: 'Iterating through array elements',
        keywords: ['loop', 'iterate', 'for', 'foreach'],
        codeExamples: [
          {
            language: 'javascript',
            code: 'for(let i = 0; i < arr.length; i++) {\n  console.log(arr[i]);\n}',
            explanation: 'Traverse array using for loop'
          }
        ]
      }
    ]
  },
  {
    name: 'Linked Lists',
    description: 'Linked lists are linear data structures where elements are stored in nodes, and each node contains data and a reference to the next node.',
    category: 'linked-lists',
    difficulty: 'beginner',
    keywords: ['linked list', 'node', 'pointer', 'next', 'head', 'tail'],
    commonQuestions: [
      'How to create a linked list?',
      'How to insert a node in linked list?',
      'How to delete a node from linked list?',
      'How to traverse a linked list?',
      'How to reverse a linked list?'
    ],
    subConcepts: [
      {
        name: 'insertion',
        description: 'Adding nodes to linked list',
        keywords: ['insert', 'add', 'append', 'prepend'],
        codeExamples: [
          {
            language: 'javascript',
            code: 'class Node {\n  constructor(data) {\n    this.data = data;\n    this.next = null;\n  }\n}',
            explanation: 'Basic node structure for linked list'
          }
        ]
      }
    ]
  },
  {
    name: 'Stacks',
    description: 'Stacks are linear data structures that follow Last-In-First-Out (LIFO) principle.',
    category: 'stacks',
    difficulty: 'beginner',
    keywords: ['stack', 'push', 'pop', 'top', 'lifo'],
    commonQuestions: [
      'How to implement a stack?',
      'How to push elements to stack?',
      'How to pop elements from stack?',
      'How to check if stack is empty?',
      'What are stack applications?'
    ],
    subConcepts: [
      {
        name: 'push',
        description: 'Adding elements to the top of stack',
        keywords: ['push', 'add', 'insert'],
        codeExamples: [
          {
            language: 'javascript',
            code: 'stack.push(element);',
            explanation: 'Add element to top of stack'
          }
        ]
      },
      {
        name: 'pop',
        description: 'Removing elements from the top of stack',
        keywords: ['pop', 'remove', 'delete'],
        codeExamples: [
          {
            language: 'javascript',
            code: 'let element = stack.pop();',
            explanation: 'Remove and return top element'
          }
        ]
      }
    ]
  },
  {
    name: 'Queues',
    description: 'Queues are linear data structures that follow First-In-First-Out (FIFO) principle.',
    category: 'queues',
    difficulty: 'beginner',
    keywords: ['queue', 'enqueue', 'dequeue', 'front', 'rear', 'fifo'],
    commonQuestions: [
      'How to implement a queue?',
      'How to enqueue elements?',
      'How to dequeue elements?',
      'What is the difference between stack and queue?',
      'What are queue applications?'
    ]
  },
  {
    name: 'Binary Trees',
    description: 'Binary trees are hierarchical data structures where each node has at most two children.',
    category: 'trees',
    difficulty: 'intermediate',
    keywords: ['tree', 'binary tree', 'root', 'leaf', 'node', 'height'],
    commonQuestions: [
      'How to create a binary tree?',
      'How to traverse a binary tree?',
      'What is tree height?',
      'How to find maximum element in tree?',
      'What are different tree traversal methods?'
    ]
  },
  {
    name: 'Graphs',
    description: 'Graphs are non-linear data structures consisting of vertices connected by edges.',
    category: 'graphs',
    difficulty: 'intermediate',
    keywords: ['graph', 'vertex', 'edge', 'adjacent', 'connected'],
    commonQuestions: [
      'How to represent a graph?',
      'What is BFS and DFS?',
      'How to detect cycle in graph?',
      'What is shortest path algorithm?',
      'What are graph applications?'
    ]
  }
];

const resources = [
  {
    title: 'Arrays in JavaScript - Complete Guide',
    description: 'Comprehensive tutorial on JavaScript arrays covering all operations',
    type: 'tutorial',
    url: 'https://example.com/js-arrays',
    programmingLanguage: 'javascript',
    difficulty: 'beginner',
    rating: 4.5,
    source: 'custom',
    tags: ['arrays', 'javascript', 'tutorial']
  },
  {
    title: 'Python Lists and Arrays',
    description: 'Understanding lists and arrays in Python with examples',
    type: 'article',
    url: 'https://example.com/python-arrays',
    programmingLanguage: 'python',
    difficulty: 'beginner',
    rating: 4.2,
    source: 'custom',
    tags: ['arrays', 'python', 'lists']
  },
  {
    title: 'Data Structures: Linked Lists',
    description: 'Complete guide to linked lists implementation and operations',
    type: 'video',
    url: 'https://example.com/linked-lists-video',
    duration: '45 minutes',
    programmingLanguage: 'any',
    difficulty: 'beginner',
    rating: 4.7,
    source: 'youtube',
    tags: ['linked-lists', 'data-structures']
  },
  {
    title: 'Stack Implementation in C++',
    description: 'Learn how to implement stack data structure in C++',
    type: 'tutorial',
    url: 'https://example.com/cpp-stack',
    programmingLanguage: 'cpp',
    difficulty: 'beginner',
    rating: 4.3,
    source: 'geeksforgeeks',
    tags: ['stack', 'cpp', 'implementation']
  }
];

async function seedData() {
  try {
    console.log('Starting data seeding...');

    // Clear existing data
    await Concept.deleteMany({});
    await Resource.deleteMany({});

    // Insert concepts
    console.log('Inserting concepts...');
    const insertedConcepts = await Concept.insertMany(concepts);
    console.log(`Inserted ${insertedConcepts.length} concepts`);

    // Associate resources with concepts
    const updatedResources = resources.map(resource => {
      const matchingConcept = insertedConcepts.find(concept => 
        resource.tags.some(tag => concept.keywords.includes(tag) || concept.category === tag)
      );
      
      if (matchingConcept) {
        resource.concepts = [matchingConcept._id];
      }
      
      return resource;
    });

    // Insert resources
    console.log('Inserting resources...');
    const insertedResources = await Resource.insertMany(updatedResources);
    console.log(`Inserted ${insertedResources.length} resources`);

    // Update concepts with resource references
    for (const concept of insertedConcepts) {
      const conceptResources = insertedResources.filter(resource =>
        resource.concepts.some(id => id.toString() === concept._id.toString())
      );
      
      concept.resources = conceptResources.map(r => r._id);
      await concept.save();
    }

    console.log('Data seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
}

// Run seeding if this file is executed directly
if (require.main === module) {
  seedData();
}

module.exports = { seedData, concepts, resources };