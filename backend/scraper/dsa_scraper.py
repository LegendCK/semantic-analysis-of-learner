"""
DSA Web Scraper Module for DSA Learning Recommendation System

This module scrapes data from GeeksforGeeks, W3Schools, and Stack Overflow
to collect DSA concepts, topics, and related information.
"""

import os
import json
import time
import logging
import random
import requests
from typing import List, Dict, Any, Optional
from bs4 import BeautifulSoup
from urllib.parse import urljoin

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class DSAWebScraper:
    """Web scraper for DSA concepts from various online resources."""
    
    def __init__(self, output_dir: str = "data/scraped_data"):
        """
        Initialize the DSA web scraper.
        
        Args:
            output_dir: Directory to save scraped data
        """
        self.output_dir = output_dir
        
        # Ensure output directory exists
        os.makedirs(output_dir, exist_ok=True)
        
        # Common headers for requests
        self.headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.5",
            "Connection": "keep-alive",
            "Upgrade-Insecure-Requests": "1",
            "Cache-Control": "max-age=0"
        }
        
        # Define DSA topics and their respective URLs
        self.dsa_topics = {
            "arrays": {
                "geeksforgeeks": "https://www.geeksforgeeks.org/array-data-structure/",
                "w3schools": "https://www.w3schools.com/js/js_arrays.asp",
                "stackoverflow_query": "array data structure implementation"
            },
            "linked_lists": {
                "geeksforgeeks": "https://www.geeksforgeeks.org/data-structures/linked-list/",
                "w3schools": "https://www.w3schools.in/data-structures/linked-list",
                "stackoverflow_query": "linked list implementation"
            },
            "stacks": {
                "geeksforgeeks": "https://www.geeksforgeeks.org/stack-data-structure/",
                "w3schools": "https://www.w3schools.in/data-structures/stack",
                "stackoverflow_query": "stack data structure implementation"
            },
            "queues": {
                "geeksforgeeks": "https://www.geeksforgeeks.org/queue-data-structure/",
                "w3schools": "https://www.w3schools.in/data-structures/queues",
                "stackoverflow_query": "queue data structure implementation"
            },
            "trees": {
                "geeksforgeeks": "https://www.geeksforgeeks.org/binary-tree-data-structure/",
                "w3schools": "https://www.w3schools.in/data-structures/binary-tree",
                "stackoverflow_query": "binary tree implementation"
            },
            "graphs": {
                "geeksforgeeks": "https://www.geeksforgeeks.org/graph-data-structure-and-algorithms/",
                "w3schools": "https://www.w3schools.in/data-structures/graph",
                "stackoverflow_query": "graph data structure implementation"
            },
            "hash_tables": {
                "geeksforgeeks": "https://www.geeksforgeeks.org/hashing-data-structure/",
                "w3schools": "https://www.w3schools.in/data-structures/hash-tables",
                "stackoverflow_query": "hash table implementation"
            },
            "sorting_algorithms": {
                "geeksforgeeks": "https://www.geeksforgeeks.org/sorting-algorithms/",
                "w3schools": "https://www.w3schools.com/js/js_array_sort.asp",
                "stackoverflow_query": "sorting algorithms comparison"
            },
            "searching_algorithms": {
                "geeksforgeeks": "https://www.geeksforgeeks.org/searching-algorithms/",
                "w3schools": "https://www.w3schools.in/data-structures/searching-algorithms",
                "stackoverflow_query": "searching algorithms comparison"
            },
            "dynamic_programming": {
                "geeksforgeeks": "https://www.geeksforgeeks.org/dynamic-programming/",
                "w3schools": "",  # Not much DP content on W3Schools
                "stackoverflow_query": "dynamic programming examples"
            },
            "recursion": {
                "geeksforgeeks": "https://www.geeksforgeeks.org/recursion/",
                "w3schools": "https://www.w3schools.com/js/js_function_definition.asp",
                "stackoverflow_query": "recursion vs iteration"
            }
        }
    
    def _make_request(self, url: str) -> Optional[BeautifulSoup]:
        """
        Make an HTTP request and return BeautifulSoup object.
        
        Args:
            url: URL to request
            
        Returns:
            BeautifulSoup object or None if request failed
        """
        try:
            # Add random delay to avoid getting blocked
            time.sleep(random.uniform(1, 3))
            
            response = requests.get(url, headers=self.headers, timeout=10)
            response.raise_for_status()
            
            return BeautifulSoup(response.text, 'html.parser')
        except requests.exceptions.RequestException as e:
            logger.error(f"Error fetching {url}: {e}")
            return None
    
    def scrape_geeksforgeeks(self, topic: str, url: str) -> List[Dict[str, Any]]:
        """
        Scrape DSA concepts from GeeksforGeeks.
        
        Args:
            topic: DSA topic
            url: URL to scrape
            
        Returns:
            List of dictionaries containing concept data
        """
        logger.info(f"Scraping GeeksforGeeks for {topic}...")
        
        soup = self._make_request(url)
        if not soup:
            return []
        
        concepts = []
        
        # Main content is usually in a div with class 'entry-content'
        main_content = soup.find('div', class_='entry-content')
        if not main_content:
            # Try alternate class
            main_content = soup.find('article', class_='content')
            if not main_content:
                logger.warning(f"Could not find main content on {url}")
                return []
        
        # Find all subheadings (these are usually concept titles)
        subheadings = main_content.find_all(['h2', 'h3'])
        
        for heading in subheadings:
            # Skip certain headings like "Quiz", "Practice", etc.
            skip_titles = ['quiz', 'practice', 'reference', 'recommended', 'related', 'comment', 'exercise']
            if any(skip in heading.text.lower() for skip in skip_titles):
                continue
                
            concept_title = heading.text.strip()
            
            # Skip empty titles
            if not concept_title:
                continue
                
            # Get all content until the next heading
            subtopics = []
            code_examples = []
            
            next_elem = heading.find_next()
            while next_elem and next_elem.name not in ['h2', 'h3']:
                # Extract text content
                if next_elem.name in ['p', 'li', 'ul', 'ol']:
                    text = next_elem.text.strip()
                    if text and len(text) > 10:  # Filter out very short texts
                        subtopics.append(text)
                
                # Extract code examples
                if next_elem.name == 'pre' or next_elem.find('pre') or next_elem.find('code'):
                    code = next_elem.text.strip()
                    if code:
                        code_examples.append(code)
                
                next_elem = next_elem.find_next()
            
            # Create concept entry
            concept = {
                "title": concept_title,
                "url": url,
                "subtopics": subtopics,
                "code_examples": code_examples
            }
            
            concepts.append(concept)
        
        # If we couldn't extract any concepts using headings, try extracting paragraphs
        if not concepts:
            logger.info(f"No concepts found with headings, trying paragraphs for {url}")
            
            # Get all paragraphs
            paragraphs = main_content.find_all('p')
            
            if paragraphs:
                # Group into a single concept
                subtopics = [p.text.strip() for p in paragraphs if p.text.strip()]
                
                # Get code examples
                code_blocks = main_content.find_all(['pre', 'code'])
                code_examples = [code.text.strip() for code in code_blocks if code.text.strip()]
                
                concept = {
                    "title": f"{topic.capitalize()} Overview",
                    "url": url,
                    "subtopics": subtopics,
                    "code_examples": code_examples
                }
                
                concepts.append(concept)
        
        logger.info(f"Scraped {len(concepts)} concepts from GeeksforGeeks for {topic}")
        return concepts
    
    def scrape_w3schools(self, topic: str, url: str) -> List[Dict[str, Any]]:
        """
        Scrape DSA concepts from W3Schools.
        
        Args:
            topic: DSA topic
            url: URL to scrape
            
        Returns:
            List of dictionaries containing concept data
        """
        # Skip if URL is empty
        if not url:
            return []
            
        logger.info(f"Scraping W3Schools for {topic}...")
        
        soup = self._make_request(url)
        if not soup:
            return []
        
        concepts = []
        
        # Main content is usually in div with class 'w3-main'
        main_content = soup.find('div', class_='w3-main')
        if not main_content:
            # Try alternate class
            main_content = soup.find('div', class_='w3-row w3-padding-32')
            if not main_content:
                # Another alternate structure
                main_content = soup.find('div', id='main')
                if not main_content:
                    logger.warning(f"Could not find main content on {url}")
                    return []
        
        # Find all subheadings
        subheadings = main_content.find_all(['h2', 'h3'])
        
        for heading in subheadings:
            # Skip certain headings
            skip_titles = ['exercise', 'quiz', 'examples', 'reference', 'comment']
            if any(skip in heading.text.lower() for skip in skip_titles):
                continue
                
            concept_title = heading.text.strip()
            
            # Skip empty titles
            if not concept_title:
                continue
                
            # Get all content until the next heading
            subtopics = []
            code_examples = []
            
            next_elem = heading.find_next()
            while next_elem and next_elem.name not in ['h2', 'h3']:
                # Extract text content
                if next_elem.name in ['p', 'li', 'ul', 'ol']:
                    text = next_elem.text.strip()
                    if text and len(text) > 10:  # Filter out very short texts
                        subtopics.append(text)
                
                # Extract code examples
                if next_elem.name == 'pre' or next_elem.find('pre') or next_elem.find('code') or next_elem.name == 'div' and 'example' in next_elem.get('class', []):
                    code = next_elem.text.strip()
                    if code:
                        code_examples.append(code)
                
                next_elem = next_elem.find_next()
            
            # Create concept entry
            concept = {
                "title": concept_title,
                "url": url,
                "subtopics": subtopics,
                "code_examples": code_examples
            }
            
            concepts.append(concept)
        
        # If we couldn't extract any concepts using headings, try extracting paragraphs
        if not concepts:
            logger.info(f"No concepts found with headings, trying paragraphs for {url}")
            
            # Get all paragraphs
            paragraphs = main_content.find_all('p')
            
            if paragraphs:
                # Group into a single concept
                subtopics = [p.text.strip() for p in paragraphs if p.text.strip()]
                
                # Get code examples
                code_blocks = main_content.find_all(['pre', 'code', 'div', {'class': 'w3-example'}])
                code_examples = [code.text.strip() for code in code_blocks if code.text.strip()]
                
                concept = {
                    "title": f"{topic.capitalize()} Overview",
                    "url": url,
                    "subtopics": subtopics,
                    "code_examples": code_examples
                }
                
                concepts.append(concept)
        
        logger.info(f"Scraped {len(concepts)} concepts from W3Schools for {topic}")
        return concepts
    
    def scrape_stackoverflow(self, topic: str, query: str) -> List[Dict[str, Any]]:
        """
        Scrape DSA-related questions and answers from Stack Overflow.
        
        Args:
            topic: DSA topic
            query: Search query for Stack Overflow
            
        Returns:
            List of dictionaries containing question data
        """
        logger.info(f"Scraping Stack Overflow for {topic}...")
        
        # Format query for URL
        formatted_query = query.replace(' ', '+')
        url = f"https://stackoverflow.com/search?q={formatted_query}"
        
        soup = self._make_request(url)
        if not soup:
            return []
        
        questions = []
        
        # Find all question summaries
        question_summaries = soup.find_all('div', class_='question-summary')
        
        # Process only the top 5 questions
        for i, summary in enumerate(question_summaries[:5]):
            # Get question title and URL
            title_element = summary.find('a', class_='question-hyperlink')
            if not title_element:
                continue
                
            question_title = title_element.text.strip()
            question_url = urljoin("https://stackoverflow.com", title_element['href'])
            
            # Get question details
            question_soup = self._make_request(question_url)
            if not question_soup:
                continue
                
            # Get question body
            question_body = question_soup.find('div', class_='question')
            if not question_body:
                continue
                
            question_text = ""
            question_text_div = question_body.find('div', class_='s-prose')
            if question_text_div:
                question_text = question_text_div.text.strip()
            
            # Get answers
            answers = []
            answer_elements = question_soup.find_all('div', class_='answer')
            
            for answer_elem in answer_elements:
                answer_text_div = answer_elem.find('div', class_='s-prose')
                if not answer_text_div:
                    continue
                    
                answer_text = answer_text_div.text.strip()
                
                # Extract code examples from answer
                code_blocks = answer_text_div.find_all('pre')
                code_examples = [code.text.strip() for code in code_blocks if code.text.strip()]
                
                # Create answer entry
                answer = {
                    "text": answer_text,
                    "code_examples": code_examples
                }
                
                answers.append(answer)
            
            # Create question entry
            question = {
                "title": question_title,
                "url": question_url,
                "text": question_text,
                "answers": answers
            }
            
            questions.append(question)
        
        logger.info(f"Scraped {len(questions)} questions from Stack Overflow for {topic}")
        return questions
    
    def scrape_topic(self, topic: str):
        """
        Scrape a single DSA topic from all sources.
        
        Args:
            topic: DSA topic to scrape
        """
        logger.info(f"Scraping topic: {topic}")
        
        topic_data = self.dsa_topics.get(topic)
        if not topic_data:
            logger.warning(f"No URLs defined for topic: {topic}")
            return
        
        # Scrape GeeksforGeeks
        gfg_url = topic_data.get("geeksforgeeks")
        gfg_data = self.scrape_geeksforgeeks(topic, gfg_url) if gfg_url else []
        
        # Scrape W3Schools
        w3s_url = topic_data.get("w3schools")
        w3s_data = self.scrape_w3schools(topic, w3s_url) if w3s_url else []
        
        # Scrape Stack Overflow
        so_query = topic_data.get("stackoverflow_query")
        so_data = self.scrape_stackoverflow(topic, so_query) if so_query else []
        
        # Combine all data
        combined_data = {
            "topic": topic,
            "geeksforgeeks": gfg_data,
            "w3schools": w3s_data,
            "stackoverflow": so_data
        }
        
        # Save data to file
        output_file = os.path.join(self.output_dir, f"{topic}_combined.json")
        
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(combined_data, f, indent=2, ensure_ascii=False)
            
        logger.info(f"Saved combined data for {topic} to {output_file}")
    
    def scrape_all_topics(self):
        """Scrape all defined DSA topics."""
        for topic in self.dsa_topics:
            self.scrape_topic(topic)
            # Add delay between topics to avoid overloading servers
            time.sleep(random.uniform(3, 5))

if __name__ == "__main__":
    scraper = DSAWebScraper()
    scraper.scrape_all_topics()
