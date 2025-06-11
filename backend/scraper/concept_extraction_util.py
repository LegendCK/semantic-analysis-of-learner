"""
Concept Extraction Utility for DSA Topics

This module extracts key concepts and subtopics from the scraped DSA data
and creates a structured representation of DSA concepts.
"""

import os
import json
import logging
from typing import Dict, List, Any
from collections import defaultdict

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class ConceptExtractionUtil:
    """Utility to extract and structure DSA concepts from scraped data."""
    
    def __init__(self, input_dir: str = "data/scraped_data", output_dir: str = "data/processed_data"):
        """
        Initialize the concept extraction utility.
        
        Args:
            input_dir: Directory containing scraped data
            output_dir: Directory to save processed data
        """
        self.input_dir = input_dir
        self.output_dir = output_dir
        
        # Ensure output directory exists
        os.makedirs(output_dir, exist_ok=True)
        
        # Define common DSA subtopics for each topic
        self.topic_subtopics = {
            "arrays": [
                "array creation", "array initialization", "array traversal", 
                "array insertion", "array deletion", "array searching", 
                "array sorting", "multidimensional arrays", "array complexity", 
                "array applications", "array manipulation", "array slicing",
                "array rotation", "subarray", "array size"
            ],
            "linked_lists": [
                "singly linked list", "doubly linked list", "circular linked list",
                "linked list traversal", "linked list insertion", "linked list deletion",
                "linked list searching", "linked list reversal", "linked list complexity",
                "linked list applications", "node structure", "pointer manipulation"
            ],
            "stacks": [
                "stack operations", "push operation", "pop operation", "peek operation",
                "stack implementation", "stack applications", "stack using array",
                "stack using linked list", "stack complexity", "balanced parentheses",
                "expression evaluation", "infix to postfix", "stack overflow", "stack underflow"
            ],
            "queues": [
                "queue operations", "enqueue operation", "dequeue operation",
                "queue implementation", "queue using array", "queue using linked list",
                "circular queue", "priority queue", "double ended queue", "deque",
                "queue applications", "queue complexity", "queue overflow", "queue underflow"
            ],
            "trees": [
                "binary tree", "binary search tree", "tree traversal", "inorder traversal",
                "preorder traversal", "postorder traversal", "level order traversal",
                "tree height", "tree depth", "balanced tree", "avl tree", "red black tree",
                "b-tree", "tree insertion", "tree deletion", "tree searching", "tree complexity"
            ],
            "graphs": [
                "graph representation", "adjacency matrix", "adjacency list",
                "graph traversal", "breadth first search", "depth first search",
                "graph applications", "shortest path", "minimum spanning tree",
                "topological sort", "graph coloring", "graph complexity",
                "directed graph", "undirected graph", "weighted graph", "unweighted graph"
            ],
            "hash_tables": [
                "hash function", "collision resolution", "chaining", "open addressing",
                "linear probing", "quadratic probing", "double hashing", "rehashing",
                "load factor", "hash table complexity", "hash table applications",
                "hash map implementation", "hash set implementation"
            ],
            "sorting_algorithms": [
                "bubble sort", "selection sort", "insertion sort", "merge sort",
                "quick sort", "heap sort", "counting sort", "radix sort", "bucket sort",
                "sorting complexity", "stable sorting", "in-place sorting", "external sorting",
                "sorting comparison", "adaptive sorting", "hybrid sorting algorithms"
            ],
            "searching_algorithms": [
                "linear search", "binary search", "interpolation search", "jump search",
                "exponential search", "fibonacci search", "searching complexity",
                "searching comparison", "searching applications"
            ],
            "dynamic_programming": [
                "memoization", "tabulation", "top-down approach", "bottom-up approach",
                "optimal substructure", "overlapping subproblems", "fibonacci sequence",
                "knapsack problem", "longest common subsequence", "edit distance",
                "dynamic programming applications", "dynamic programming complexity"
            ],
            "recursion": [
                "base case", "recursive case", "recursive function", "recursion tree",
                "tail recursion", "head recursion", "nested recursion", "indirect recursion",
                "recursion complexity", "recursion vs iteration", "stack overflow",
                "recursive backtracking", "memoization in recursion"
            ]
        }
    
    def extract_topic_concepts(self, topic: str):
        """
        Extract concepts for a specific DSA topic.
        
        Args:
            topic: DSA topic to process
        """
        logger.info(f"Extracting concepts for topic: {topic}")
        
        # Load scraped data
        input_file = os.path.join(self.input_dir, f"{topic}_combined.json")
        
        if not os.path.exists(input_file):
            logger.error(f"Input file not found: {input_file}")
            return
        
        try:
            with open(input_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
        except (json.JSONDecodeError, IOError) as e:
            logger.error(f"Error loading input file {input_file}: {e}")
            return
        
        # Extract relevant subtopics
        relevant_subtopics = self.topic_subtopics.get(topic, [])
        
        # Initialize concept structure
        concept_structure = {
            "topic": topic,
            "subtopics": [],
            "resources": []
        }
        
        # Process GeeksforGeeks data
        for concept_data in data.get("geeksforgeeks", []):
            title = concept_data.get("title", "")
            url = concept_data.get("url", "")
            subtopics = concept_data.get("subtopics", [])
            
            # Add as a resource
            resource = {
                "title": title,
                "url": url,
                "source": "geeksforgeeks"
            }
            concept_structure["resources"].append(resource)
            
            # Extract subtopics
            for subtopic_text in subtopics:
                for relevant_subtopic in relevant_subtopics:
                    if relevant_subtopic.lower() in subtopic_text.lower():
                        if relevant_subtopic not in concept_structure["subtopics"]:
                            concept_structure["subtopics"].append(relevant_subtopic)
        
        # Process W3Schools data
        for concept_data in data.get("w3schools", []):
            title = concept_data.get("title", "")
            url = concept_data.get("url", "")
            subtopics = concept_data.get("subtopics", [])
            
            # Add as a resource
            resource = {
                "title": title,
                "url": url,
                "source": "w3schools"
            }
            concept_structure["resources"].append(resource)
            
            # Extract subtopics
            for subtopic_text in subtopics:
                for relevant_subtopic in relevant_subtopics:
                    if relevant_subtopic.lower() in subtopic_text.lower():
                        if relevant_subtopic not in concept_structure["subtopics"]:
                            concept_structure["subtopics"].append(relevant_subtopic)
        
        # Process Stack Overflow data
        for question_data in data.get("stackoverflow", []):
            title = question_data.get("title", "")
            url = question_data.get("url", "")
            
            # Add as a resource
            resource = {
                "title": title,
                "url": url,
                "source": "stackoverflow"
            }
            concept_structure["resources"].append(resource)
            
            # Extract subtopics from question title
            for relevant_subtopic in relevant_subtopics:
                if relevant_subtopic.lower() in title.lower():
                    if relevant_subtopic not in concept_structure["subtopics"]:
                        concept_structure["subtopics"].append(relevant_subtopic)
        
        # Add any missing important subtopics
        # These are essential subtopics that should be included even if not found in scraped data
        essential_subtopics = {
            "arrays": ["array creation", "array insertion", "array deletion", "array traversal"],
            "linked_lists": ["singly linked list", "doubly linked list", "linked list insertion", "linked list deletion"],
            "stacks": ["push operation", "pop operation", "peek operation"],
            "queues": ["enqueue operation", "dequeue operation"],
            "trees": ["binary tree", "tree traversal"],
            "graphs": ["graph representation", "graph traversal"],
            "hash_tables": ["hash function", "collision resolution"],
            "sorting_algorithms": ["bubble sort", "quick sort", "merge sort"],
            "searching_algorithms": ["linear search", "binary search"],
            "dynamic_programming": ["memoization", "tabulation"],
            "recursion": ["base case", "recursive case"]
        }
        
        for essential_subtopic in essential_subtopics.get(topic, []):
            if essential_subtopic not in concept_structure["subtopics"]:
                concept_structure["subtopics"].append(essential_subtopic)
        
        # Save processed data
        output_file = os.path.join(self.output_dir, f"{topic}_concepts.json")
        
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(concept_structure, f, indent=2, ensure_ascii=False)
            
        logger.info(f"Saved concept structure for {topic} to {output_file}")
        
        return concept_structure
    
    def extract_all_topics(self):
        """Extract concepts for all DSA topics."""
        # Get all scraped data files
        scraped_files = [f for f in os.listdir(self.input_dir) if f.endswith('_combined.json')]
        topics = [f.replace('_combined.json', '') for f in scraped_files]
        
        concept_structures = {}
        
        for topic in topics:
            concept_structure = self.extract_topic_concepts(topic)
            if concept_structure:
                concept_structures[topic] = concept_structure
        
        # Create a consolidated DSA curriculum
        self._create_dsa_curriculum(concept_structures)
    
    def _create_dsa_curriculum(self, concept_structures):
        """
        Create a consolidated DSA curriculum from all extracted concepts.
        
        Args:
            concept_structures: Dictionary of concept structures by topic
        """
        curriculum = {
            "title": "Data Structures and Algorithms Curriculum",
            "topics": []
        }
        
        # Define learning paths (topic order)
        learning_paths = [
            {
                "path_name": "Beginner DSA Path",
                "topics": ["arrays", "linked_lists", "stacks", "queues", "recursion", 
                          "searching_algorithms", "sorting_algorithms"]
            },
            {
                "path_name": "Intermediate DSA Path",
                "topics": ["trees", "hash_tables", "dynamic_programming"]
            },
            {
                "path_name": "Advanced DSA Path",
                "topics": ["graphs", "advanced_algorithms"]
            }
        ]
        
        # Add learning paths to curriculum
        curriculum["learning_paths"] = learning_paths
        
        # Add topics with their concepts
        for topic, structure in concept_structures.items():
            topic_entry = {
                "name": topic,
                "display_name": topic.replace('_', ' ').title(),
                "subtopics": structure.get("subtopics", []),
                "resources": structure.get("resources", [])
            }
            
            curriculum["topics"].append(topic_entry)
        
        # Save the curriculum
        output_file = os.path.join(self.output_dir, "dsa_curriculum.json")
        
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(curriculum, f, indent=2, ensure_ascii=False)
            
        logger.info(f"Saved DSA curriculum to {output_file}")

if __name__ == "__main__":
    extractor = ConceptExtractionUtil()
    extractor.extract_all_topics()
