/** Here we can define any JavaScript-based resources and extensions to tables

export class MyCustomResource extends tables.TableName {
	// we can define our own custom POST handler
	post(content) {
		// do something with the incoming content;
		return super.post(content);
	}
	// or custom GET handler
	get() {
		// we can modify this resource before returning
		return super.get();
	}
}
 */

// resource documentation 

//https://docs.harperdb.io/docs/technical-details/reference/resource#get-queryorproperty-resource-or-asynciterable

import 'dotenv/config'
const {User} = tables


function isValidQueryParam(value) {
    const regex = /^[a-zA-Z]+(,[a-zA-Z]+)*$/;
    return regex.test(value);
}



export class UserFavoriteNews extends User {
	async get(query) {

	// Fetch the user record
    const userRecord = await User.get(this.id, this);


    // Get the preferredNewsSources from the user record
    const preferredNewsSources = this.preferedNewsSources
	const newsArticleBookMarks = this.firstName

	console.log("------NEWS ARTICLE-------",this.newsArticleBookMarks)
	// Log or process the preferred news sources
    //console.log("Preferred News Sources:", preferredNewsSources);

	//// Trim whitespace from each source, filter out empty strings, and convert the array to a comma-separated string
	const convertPreferredNewsSourcesToStr = preferredNewsSources
	.map(source => source.trim())
	.filter(source => source.length > 0)
	.join(',');

	

	const apiPath = "http://api.mediastack.com/v1/news"
	const apiKey = process.env.NEWS_API_KEY
	const fullApiPath = `${apiPath}?access_key=${apiKey}&sources=${convertPreferredNewsSourcesToStr}&countries=us&languages=en&categories=technology&sort=published_asc`
	
	

	//making API Request
	const resp = await fetch(fullApiPath)

	// news data in json format  from api request 
	const newsData = await resp.json()

	// copy of user db table
	const tableCopy = super.get(query)

	

	return tableCopy
	
	  

	return await {
		"userBookedMarkedArticles": tableCopy,
		"latestsNewsFromFavoriteSources": newsData
	}
		
		
	}

}
// we can also define a custom resource without a specific table
export class Greeting extends Resource {
	// a "Hello, world!" handler
	get(query) {
		console.log("------QUERY-----", query?.get?.('name'))
		//console.log("-----NAME----", this)
		return { greeting: 'Hello, world!' };
	}
}


export class SearchForNewsArticlesByNewsKeyWord extends Resource {

	async get(query) {
		
		const keyword = query?.get?.('keyword')
		
		if (!isValidQueryParam(keyword)) {
			return {Message: "Invalid Query Param"}

		}
		const apiPath = "http://api.mediastack.com/v1/news"
		const apiKey = process.env.NEWS_API_KEY
		const fullApiPath = `${apiPath}?access_key=${apiKey}&keywords=${keyword.trim()}&countries=us&languages=en&categories=technology`
		console.log("---FULL API PATH-----", fullApiPath)
		const resp = await fetch(fullApiPath)
		return resp.json()
	}
}


export class RealTimeNews extends Resource {
	async connect() {

	
			
		
			// Create an outgoing messages stream
			let outgoingMessages = super.connect();
		
			// Define the API endpoint and parameters
			const apiPath = "http://api.mediastack.com/v1/news";
			const apiKey = process.env.NEWS_API_KEY; // Replace with your actual access key
			const fullApiPath = `${apiPath}?access_key=${apiKey}&countries=us&languages=en&categories=technology&sort=published_asc`
		
			// Function to fetch news updates
			const fetchNewsUpdates = async () => {
			  try {
				const resp = await fetch(fullApiPath);
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
		
			// Function to send a message
			const sendMessage = (message) => {
			  outgoingMessages.send({ message, timestamp: new Date() });
			};
		
			// Function to send a keep-alive message
			const sendKeepAlive = () => {
			  sendMessage('keep-alive');
			};
		
			// Example: Send a welcome message when the connection is established
			sendMessage('Welcome to the SSE stream!');
		
			// Fetch news updates every 5 minutes
			const newsUpdateInterval = setInterval(fetchNewsUpdates, 2 * 60 * 1000);
		
			// Send a keep-alive message every 30 seconds
			const keepAliveInterval = setInterval(sendKeepAlive, 10 * 1000);
		
			// Clean up when the connection is closed
			outgoingMessages.on('close', () => {
			  clearInterval(newsUpdateInterval);
			  clearInterval(keepAliveInterval);
			  console.log('Connection closed');
			});
		
			// Return the outgoing messages iterable
			return outgoingMessages;
		  
	}
  
  }







// export class TestSse extends Resource {
// 	connect() {
// 		console.log("CALLED------")
// // 		let eventSource = new EventSource('/341');
// // 		eventSource.onmessage = (event) => {
// // 			// received a notification from the server
// // 			let data = JSON.parse(event.data);
// // 			console.log("-----HELLO-------")
// // };

// 	  //Create an outgoing messages stream


// 	   //Create an outgoing messages stream
// 	   let outgoingMessages = super.connect();

// 	   //Send a message to the client every second
// 	//    let timer = setInterval(() => {
// 	// 	 outgoingMessages.send({ message: 'Hello World', timestamp: new Date() });
// 	//    }, 1000);
   
// 	   //Clean up the timer when the connection is closed
// 	//    outgoingMessages.on('close', () => {
// 	// 	 clearInterval(timer);
// 	//    });


// 	// Example function to send a message
//     const sendMessage = (message) => {
// 		outgoingMessages.send({ message, timestamp: new Date() });
// 	  };
  
// 	  // Example: Send a message when the connection is established
// 	  sendMessage('Welcome to the SSE stream!');
  
// 	  // Example: You could send messages based on other events or conditions here
// 	  // For instance, you might have a function that listens to some event and calls sendMessage
  
// 	  // Clean up when the connection is closed
// 	  outgoingMessages.on('close', () => {
// 		// Perform any cleanup actions here
// 		console.log('Connection closed');
// 	  });
   
// 	   //Return the outgoing messages iterable
// 	   return outgoingMessages
// 	 }
	
// 	}
	
 //Register the resource with the server
// export default (server) => {
//   server.resource('/', TestSse);
// };




	//https://api.watchmode.com/v1/title/${movieId}/sources/?apiKey=YOUR_API_KEY

// TODO: Bonus connect a websocket that returns trending move around the would to add to you movie watch list


