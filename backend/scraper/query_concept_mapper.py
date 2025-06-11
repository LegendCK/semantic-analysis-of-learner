"""
Query to Concept Mapper for DSA Learning Recommendation System

This module analyzes learner queries and maps them to DSA concepts
to identify knowledge gaps and provide relevant learning resources.
"""

import os
import json
import logging
import re
from typing import Dict, List, Any, Tuple
from collections import defaultdict

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class QueryConceptMapper:
    """Map learner queries to DSA concepts and identify knowledge gaps."""
    
    def __init__(self, curriculum_file: str = "data/processed_data/dsa_curriculum.json"):
        """
        Initialize the query concept mapper.
        
        Args:
            curriculum_file: Path to the DSA curriculum file
        """
        self.curriculum_file = curriculum_file
        self.curriculum = self._load_curriculum()
        
        # Create concept index for fast lookup
        self.concept_index = self._build_concept_index()
        
        # Common query patterns
        self.query_patterns = {
            "definition": [
                r"what is (a|an)?\s+(.+)",
                r"define\s+(.+)",
                r"explain\s+(.+)",
                r"describe\s+(.+)"
            ],
            "comparison": [
                r"(difference|compare)\s+between\s+(.+)\s+and\s+(.+)",
                r"(.+)\s+vs\s+(.+)",
                r"how\s+does\s+(.+)\s+differ\s+from\s+(.+)"
            ],
            "implementation": [
                r"how\s+to\s+implement\s+(.+)",
                r"implementation\s+of\s+(.+)",
                r"code\s+for\s+(.+)",
                r"program\s+for\s+(.+)"
            ],
            "complexity": [
                r"(time|space)\s+complexity\s+of\s+(.+)",
                r"how\s+(efficient|fast)\s+is\s+(.+)",
                r"performance\s+of\s+(.+)"
            ],
            "application": [
                r"(use|application)\s+of\s+(.+)",
                r"when\s+to\s+use\s+(.+)",
                r"where\s+is\s+(.+)\s+used"
            ]
        }
    
    def _load_curriculum(self) -> Dict[str, Any]:
        """
        Load the DSA curriculum from file.
        
        Returns:
            DSA curriculum dictionary
        """
        try:
            with open(self.curriculum_file, 'r', encoding='utf-8') as f:
                return json.load(f)
        except (json.JSONDecodeError, IOError) as e:
            logger.error(f"Error loading curriculum file {self.curriculum_file}: {e}")
            return {"topics": []}
    
    def _build_concept_index(self) -> Dict[str, Dict[str, Any]]:
        """
        Build an index of all concepts for fast lookup.
        
        Returns:
            Concept index dictionary
        """
        concept_index = {}
        
        for topic_entry in self.curriculum.get("topics", []):
            topic_name = topic_entry.get("name", "")
            
            # Add topic name to index
            concept_index[topic_name] = {
                "type": "topic",
                "display_name": topic_entry.get("display_name", topic_name),
                "subtopics": topic_entry.get("subtopics", []),
                "resources": topic_entry.get("resources", [])
            }
            
            # Add alternative forms
            alt_name = topic_name.replace('_', ' ')
            if alt_name != topic_name:
                concept_index[alt_name] = concept_index[topic_name]
                
            display_name = topic_entry.get("display_name", "").lower()
            if display_name and display_name != topic_name and display_name != alt_name:
                concept_index[display_name] = concept_index[topic_name]
            
            # Add all subtopics to index
            for subtopic in topic_entry.get("subtopics", []):
                concept_index[subtopic.lower()] = {
                    "type": "subtopic",
                    "parent_topic": topic_name,
                    "display_name": subtopic,
                    "resources": [r for r in topic_entry.get("resources", []) 
                                if subtopic.lower() in r.get("title", "").lower()]
                }
        
        return concept_index
    
    def analyze_query(self, query: str) -> Dict[str, Any]:
        """
        Analyze a learner query to identify concepts and query intent.
        
        Args:
            query: The learner's query text
            
        Returns:
            Analysis result dictionary
        """
        # Clean query
        clean_query = query.lower().strip()
        
        # Identify query type
        query_type, extracted_concepts = self._identify_query_type(clean_query)
        
        # Find all mentioned concepts
        if not extracted_concepts:
            extracted_concepts = self._extract_concepts_from_query(clean_query)
        
        # Find related concepts
        related_concepts = self._find_related_concepts(extracted_concepts)
        
        # Get relevant resources
        resources = self._get_relevant_resources(extracted_concepts)
        
        # Create analysis result
        result = {
            "original_query": query,
            "query_type": query_type,
            "extracted_concepts": extracted_concepts,
            "related_concepts": related_concepts,
            "resources": resources
        }
        
        return result
    
    def _identify_query_type(self, query: str) -> Tuple[str, List[str]]:
        """
        Identify the type of query and extract concepts.
        
        Args:
            query: The learner's query text
            
        Returns:
            Query type and list of extracted concepts
        """
        for query_type, patterns in self.query_patterns.items():
            for pattern in patterns:
                match = re.search(pattern, query, re.IGNORECASE)
                if match:
                    # Extract concepts from the matched groups
                    if query_type == "comparison":
                        # For comparison queries, we extract two concepts
                        if len(match.groups()) >= 2:
                            concept1 = match.group(2).strip()
                            concept2 = match.group(3).strip() if len(match.groups()) >= 3 else ""
                            return query_type, [concept1, concept2]
                    else:
                        # For other queries, extract the main concept
                        if len(match.groups()) >= 1:
                            concept = match.group(len(match.groups())).strip()
                            return query_type, [concept]
        
        # Default if no pattern matches
        return "general", []
    
    def _extract_concepts_from_query(self, query: str) -> List[str]:
        """
        Extract DSA concepts from the query text.
        
        Args:
            query: The learner's query text
            
        Returns:
            List of extracted concepts
        """
        extracted_concepts = []
        
        # Check for exact matches in concept index
        for concept_name in self.concept_index.keys():
            if concept_name in query:
                extracted_concepts.append(concept_name)
        
        # If no exact matches, try to find partial matches
        if not extracted_concepts:
            for concept_name in self.concept_index.keys():
                # Check if any word in the concept name appears in the query
                concept_words = concept_name.split()
                for word in concept_words:
                    if len(word) > 3 and word in query.split():  # Only match significant words
                        extracted_concepts.append(concept_name)
                        break
        
        return extracted_concepts
    
    def _find_related_concepts(self, concepts: List[str]) -> List[str]:
        """
        Find concepts related to the extracted concepts.
        
        Args:
            concepts: List of extracted concepts
            
        Returns:
            List of related concepts
        """
        related_concepts = []
        
        for concept in concepts:
            if concept in self.concept_index:
                concept_info = self.concept_index[concept]
                
                if concept_info.get("type") == "topic":
                    # For topics, add their subtopics
                    related_concepts.extend(concept_info.get("subtopics", []))
                elif concept_info.get("type") == "subtopic":
                    # For subtopics, add other subtopics from the same topic
                    parent_topic = concept_info.get("parent_topic")
                    if parent_topic in self.concept_index:
                        parent_info = self.concept_index[parent_topic]
                        related_concepts.extend(parent_info.get("subtopics", []))
        
        # Remove duplicates and already extracted concepts
        related_concepts = [c for c in related_concepts if c not in concepts]
        
        return related_concepts[:5]  # Limit to top 5 related concepts
    
    def _get_relevant_resources(self, concepts: List[str]) -> List[Dict[str, str]]:
        """
        Get relevant learning resources for the extracted concepts.
        
        Args:
            concepts: List of extracted concepts
            
        Returns:
            List of relevant resources
        """
        resources = []
        
        for concept in concepts:
            if concept in self.concept_index:
                concept_info = self.concept_index[concept]
                concept_resources = concept_info.get("resources", [])
                
                # Add resources with source information
                for resource in concept_resources:
                    resources.append({
                        "title": resource.get("title", ""),
                        "url": resource.get("url", ""),
                        "source": resource.get("source", ""),
                        "concept": concept
                    })
        
        # Remove duplicates by URL
        unique_resources = []
        seen_urls = set()
        
        for resource in resources:
            url = resource.get("url", "")
            if url and url not in seen_urls:
                unique_resources.append(resource)
                seen_urls.add(url)
        
        return unique_resources[:10]  # Limit to top 10 resources

    def identify_knowledge_gaps(self, query: str) -> Dict[str, Any]:
        """
        Identify potential knowledge gaps based on the learner's query.
        
        Args:
            query: The learner's query text
            
        Returns:
            Knowledge gaps analysis
        """
        # Analyze the query
        analysis = self.analyze_query(query)
        
        # Identify knowledge gaps
        knowledge_gaps = []
        prerequisite_concepts = []
        
        for concept in analysis["extracted_concepts"]:
            if concept in self.concept_index:
                concept_info = self.concept_index[concept]
                
                if concept_info.get("type") == "subtopic":
                    parent_topic = concept_info.get("parent_topic")
                    
                    # Find prerequisites for this subtopic
                    if parent_topic in self.concept_index:
                        parent_info = self.concept_index[parent_topic]
                        subtopics = parent_info.get("subtopics", [])
                        
                        # Get index of current subtopic
                        try:
                            idx = subtopics.index(concept_info.get("display_name"))
                            
                            # Add prerequisites (subtopics that should come before)
                            for i in range(idx):
                                prerequisite_concepts.append(subtopics[i])
                        except ValueError:
                            pass
                    
                    # Add advanced concepts as potential knowledge gaps
                    if parent_topic == "arrays":
                        knowledge_gaps.extend(["array searching", "array sorting", "multidimensional arrays"])
                    elif parent_topic == "linked_lists":
                        knowledge_gaps.extend(["doubly linked list", "circular linked list"])
                    elif parent_topic == "stacks" or parent_topic == "queues":
                        knowledge_gaps.extend(["stack applications", "queue applications"])
                    elif parent_topic == "trees":
                        knowledge_gaps.extend(["binary search tree", "balanced tree"])
                    elif parent_topic == "graphs":
                        knowledge_gaps.extend(["shortest path", "minimum spanning tree"])
                    elif parent_topic == "sorting_algorithms":
                        knowledge_gaps.extend(["merge sort", "quick sort", "heap sort"])
                    elif parent_topic == "searching_algorithms":
                        knowledge_gaps.extend(["binary search", "hashing"])
                    elif parent_topic == "dynamic_programming":
                        knowledge_gaps.extend(["memoization", "tabulation"])
        
        # Remove duplicates and concepts already mentioned in the query
        prerequisite_concepts = list(set(prerequisite_concepts) - set(analysis["extracted_concepts"]))
        knowledge_gaps = list(set(knowledge_gaps) - set(analysis["extracted_concepts"]) - set(prerequisite_concepts))
        
        # Get learning resources for prerequisites and knowledge gaps
        prerequisite_resources = self._get_relevant_resources(prerequisite_concepts)
        gap_resources = self._get_relevant_resources(knowledge_gaps)
        
        # Create knowledge gaps analysis
        result = {
            "query_analysis": analysis,
            "prerequisite_concepts": prerequisite_concepts,
            "knowledge_gaps": knowledge_gaps,
            "prerequisite_resources": prerequisite_resources,
            "gap_resources": gap_resources
        }
        
        return result

if __name__ == "__main__":
    # Example usage
    mapper = QueryConceptMapper()
    
    # Test queries
    test_queries = [
        "What is a binary search tree?",
        "How to implement quicksort?",
        "Difference between stack and queue",
        "Time complexity of bubble sort",
        "Applications of graphs in real life"
    ]
    
    for query in test_queries:
        print(f"\nAnalyzing query: {query}")
        analysis = mapper.identify_knowledge_gaps(query)
        
        print(f"Query type: {analysis['query_analysis']['query_type']}")
        print(f"Extracted concepts: {analysis['query_analysis']['extracted_concepts']}")
        print(f"Related concepts: {analysis['query_analysis']['related_concepts']}")
        print(f"Prerequisite concepts: {analysis['prerequisite_concepts']}")
        print(f"Knowledge gaps: {analysis['knowledge_gaps']}")
        
        print("Top resources:")
        for resource in analysis['query_analysis']['resources'][:3]:
            print(f"- {resource['title']} ({resource['source']})")
