// we need axios to make HTTP requests
const axios = require('axios');

// and we need jsdom and Readability to parse the article HTML
const { JSDOM } = require('jsdom');
const { Readability } = require('@mozilla/readability');

// fs to write the JSON file
const fs = require('fs');

// First lets get some search data from News API
let url = "https://newsapi.org/v2/top-headlines?country=us&category=health&apiKey=1caa99bd21a140a8a36d33ee9aec642d"

// Array to store all processed articles
const processedArticles = [];

// Set timeout length (in milliseconds)
const TIMEOUT_MS = 30000; // 30 seconds

function saveToFile(data, filename) {
  try {
    fs.writeFileSync(filename, JSON.stringify(data, null, 2));
    console.log(`Successfully saved data to ${filename}`);
  } catch (error) {
    console.error(`Error saving to ${filename}:`, error.message);
  }
}

// Make the request with axios' get() function
axios.get(url).then(async function(r1) {
  // Get all articles from the search results
  saveToFile(r1.data, 'raw_api_output.json');
  const articles = r1.data.articles;
  
  // Process each article sequentially to avoid overwhelming the server
  for (let i = 0; i < articles.length; i++) {
    const article = articles[i];
    
    try {
      console.log(`Processing article ${i+1}/${articles.length}: ${article.title}`);
      
      // Get the HTML for this article with a timeout
      const response = await axios.get(article.url, {
        timeout: TIMEOUT_MS // Will abort request after 30 seconds
      });
      
      // Convert it into a DOM object
      let dom = new JSDOM(response.data, {
        url: article.url
      });
      
      // Parse with Readability
      let parsedArticle = new Readability(dom.window.document).parse();
      
      // Create object with required fields
      processedArticles.push({
        title: article.title,
        source: article.source.name,
        publishedAt: article.publishedAt,
        url: article.url,
        textContent: parsedArticle.textContent
      });
      
    } catch (error) {
      const errorMessage = error.code === 'ECONNABORTED' 
        ? `Timeout (${TIMEOUT_MS/1000}s) exceeded` 
        : error.message;
      
      console.error(`Error processing article ${article.title}: ${errorMessage}`);
      
      // Still add the article but without textContent
      processedArticles.push({
        title: article.title,
        source: article.source.name,
        publishedAt: article.publishedAt,
        url: article.url,
        textContent: null,
        error: errorMessage
      });
    }
    
    // Save progress after every article
    if (i % 5 === 0 || i === articles.length - 1) {
      saveToFile(processedArticles, 'processed_articles_progress.json');
    }
  }
  
  // Write all processed articles to a JSON file
  fs.writeFileSync(
    'processed_articles_general.json',
    JSON.stringify(processedArticles, null, 2)
  );
  
  console.log(`Successfully processed ${processedArticles.length} articles and saved to processed_articles.json`);
}).catch(error => {
  console.error('Error fetching articles from News API:', error.message);
});