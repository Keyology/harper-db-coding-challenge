/** Here we can define any JavaScript-based resources and extensions to tables
 */

// resource documentation 

//https://docs.harperdb.io/docs/technical-details/reference/resource#get-queryorproperty-resource-or-asynciterable


import 'dotenv/config'

// Import the user table
const {User} = tables


/**
 * Checks if a given value is a valid query parameter.
 * 
 * A valid query parameter must match the following criteria:
 * - Consists of one or more alphabetic strings (a-z, A-Z)
 * - Strings are separated by commas if there are multiple
 * - No leading or trailing commas
 * 
 * 
 * 
 * @param {string} value - The value to be checked.
 * @return {boolean} - Returns true if the value is a valid query parameter, otherwise false.
 */

function isValidQueryParam(value) {
    // Regular expression to match the valid query parameter format
    const regex = /^[a-zA-Z]+(,[a-zA-Z]+)*$/;
    
    // Test the value against the regular expression
    return regex.test(value);
}


// extend to the User class
export class UserFavoriteNews extends User {

    // Asynchronous method to get user favorite news
    async get(query) {

        // Get the preferred news sources from the user record
        const preferredNewsSources = this.preferedNewsSources;
        
        // Log or process the preferred news sources
        // console.log("Preferred News Sources:", preferredNewsSources);

        // Trim whitespace from each source, filter out empty strings, and convert the array to a comma-separated string
        const convertPreferredNewsSourcesToStr = preferredNewsSources
            .map(source => source.trim())
            .filter(source => source.length > 0)
            .join(',');

        // Define the API path for mediastack
        const apiPath = "http://api.mediastack.com/v1/news";
        
        // Retrieve the API key from environment variables
        const apiKey = process.env.NEWS_API_KEY;
        
        // Construct the full API path with query parameters
        const fullApiPath = `${apiPath}?access_key=${apiKey}&sources=${convertPreferredNewsSourcesToStr}&countries=us&languages=en&categories=technology&sort=published_asc`;

        // Making API request to fetch news
        const resp = await fetch(fullApiPath);

        // Parse the news data in JSON format from API response
        const newsData = await resp.json();

        // Get a copy of the user database table using the query
        const tableCopy = super.get(query);

        // Return an object containing user data and latest news from favorite sources
        return await {
            "User": tableCopy,
            "latestsNewsFromFavoriteSources": newsData
        }
    }
}




// extend to the Resource class
export class SearchForNewsArticlesByNewsKeyWord extends Resource {

    // Asynchronous method to get news articles based on a keyword
    async get(query) { 

        // Extract the keyword from the query object
        const keyword = query?.get?.('keyword');
        
        // Validate the keyword query parameter
        if (!isValidQueryParam(keyword)) {
            return {Message: "Invalid Query Param"};
        }

        // Define the API path for mediastack
        const apiPath = "http://api.mediastack.com/v1/news";
        
        // Retrieve the API key from environment variables
        const apiKey = process.env.NEWS_API_KEY;
        
        // Construct the full API path with query parameters, trimming the keyword
        const fullApiPath = `${apiPath}?access_key=${apiKey}&keywords=${keyword.trim()}&countries=us&languages=en&categories=technology`;
        
        // Make API request to fetch news articles based on the keyword
        const resp = await fetch(fullApiPath);
        
        // Return the response data in JSON format
        return resp.json();
    }
}

// Import the Resource class
export class RealTimeNews extends Resource {
    
    // Asynchronous method to establish a connection for real-time news updates
    async connect() {

        // Create an outgoing messages stream
        let outgoingMessages = super.connect();
        
        // Define the API endpoint and parameters
        const apiPath = "http://api.mediastack.com/v1/news";
        
        // Retrieve the API key from environment variables
        const apiKey = process.env.NEWS_API_KEY; // Replace with your actual access key
        
        // Construct the full API path with query parameters
        const fullApiPath = `${apiPath}?access_key=${apiKey}&countries=us&languages=en&categories=technology&sort=published_asc`;
        
        // Function to fetch news updates
        const fetchNewsUpdates = async () => {
            try {
                const resp = await fetch(fullApiPath);
                
                // Check if the response status is successful
                if (resp.status >= 200 && resp.status <= 400) {
                    const data = await resp.json();
                    sendMessage(data);
                } else {
                    console.error('Error fetching news:', resp.statusText);
                    sendMessage({ message: "Error fetching news", status: resp.status });
                }
            } catch (error) {
                console.error('Error fetching news:', error);
                sendMessage({ message: "Error fetching news", error: error.message });
            }
        };
        
        // Function to send a message through the outgoing messages stream
        const sendMessage = (message) => {
            outgoingMessages.send({ message, timestamp: new Date() });
        };
        
        // Function to send a keep-alive message to maintain the connection
        const sendKeepAlive = () => {
            sendMessage('keep-alive');
        };
        
        // Send a welcome message when the connection is established
        sendMessage('Welcome to the SSE stream!');
        
        // Fetch news updates every 1 minute
        const newsUpdateInterval = setInterval(fetchNewsUpdates, 1 * 60 * 1000);
        
        // Send a keep-alive message every 10 seconds
     
	}
}
