import axios from 'axios';
import * as cheerio from 'cheerio';

export interface ScrapedChurchData {
  name?: string;
  description?: string;
  phone?: string;
  email?: string;
  address?: string;
  serviceTimes?: string;
  denomination?: string;
  pastor?: string;
  events?: string;
}

export async function scrapeChurchWebsite(url: string): Promise<ScrapedChurchData> {
  try {
    // Fetch the website HTML
    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    const html = response.data;
    const $ = cheerio.load(html);

    const scrapedData: ScrapedChurchData = {};

    // Extract church name from title or h1
    scrapedData.name = $('title').text().trim() || $('h1').first().text().trim();

    // Extract description from meta description or first paragraph
    scrapedData.description = 
      $('meta[name="description"]').attr('content') ||
      $('meta[property="og:description"]').attr('content') ||
      $('p').first().text().trim();

    // Look for phone numbers
    const phonePatterns = [
      /\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g,
      /\d{3}-\d{3}-\d{4}/g
    ];
    
    const bodyText = $('body').text();
    for (const pattern of phonePatterns) {
      const match = bodyText.match(pattern);
      if (match) {
        scrapedData.phone = match[0];
        break;
      }
    }

    // Look for email addresses
    const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const emailMatch = bodyText.match(emailPattern);
    if (emailMatch) {
      scrapedData.email = emailMatch[0];
    }

    // Try to find service times
    const serviceKeywords = ['service', 'worship', 'mass', 'sunday', 'saturday'];
    $('*').each((_, element) => {
      const text = $(element).text().toLowerCase();
      if (serviceKeywords.some(keyword => text.includes(keyword)) && text.includes(':')) {
        const elementText = $(element).text().trim();
        if (elementText.length < 500 && elementText.length > 10) {
          scrapedData.serviceTimes = elementText;
          return false; // break
        }
      }
    });

    // Try to find denomination
    const denominationKeywords = ['catholic', 'baptist', 'methodist', 'lutheran', 'presbyterian', 
                                  'pentecostal', 'episcopal', 'orthodox', 'evangelical', 'non-denominational'];
    for (const keyword of denominationKeywords) {
      if (bodyText.toLowerCase().includes(keyword)) {
        scrapedData.denomination = keyword.charAt(0).toUpperCase() + keyword.slice(1);
        break;
      }
    }

    // Try to find address
    const addressPattern = /\d+\s+[A-Za-z\s]+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Lane|Ln|Drive|Dr|Court|Ct|Circle|Cir|Way)[,\s]+[A-Za-z\s]+,\s+[A-Z]{2}\s+\d{5}/;
    const addressMatch = bodyText.match(addressPattern);
    if (addressMatch) {
      scrapedData.address = addressMatch[0];
    }

    // Try to find pastor/minister name
    const pastorKeywords = ['pastor', 'reverend', 'rev.', 'father', 'minister', 'priest'];
    $('*').each((_, element) => {
      const text = $(element).text().toLowerCase();
      for (const keyword of pastorKeywords) {
        if (text.includes(keyword)) {
          const elementText = $(element).text().trim();
          if (elementText.length < 100 && elementText.length > 5) {
            scrapedData.pastor = elementText;
            return false; // break
          }
        }
      }
    });

    // Try to find events
    const eventKeywords = ['event', 'calendar', 'upcoming', 'schedule'];
    $('*').each((_, element) => {
      const text = $(element).text().toLowerCase();
      if (eventKeywords.some(keyword => text.includes(keyword))) {
        const elementText = $(element).text().trim();
        if (elementText.length < 1000 && elementText.length > 20) {
          scrapedData.events = elementText;
          return false; // break
        }
      }
    });

    return scrapedData;

  } catch (error: any) {
    console.error('Error scraping website:', error.message);
    throw new Error(`Failed to scrape website: ${error.message}`);
  }
}
