import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
import { ApolloProvider } from 'react-apollo';
import { InMemoryCache } from 'apollo-cache-inmemory';
import {SubscriptionClient} from 'subscriptions-transport-ws';
import ApolloClient from 'apollo-client';

// Create WebSocket client
const WSClient = new SubscriptionClient(`ws://localhost:8000/api/ws`, {
  reconnect: true,
  connectionParams: {
    // Connection parameters to pass some validations 
    // on server side during first handshake
  }
});

const GraphQLClient = new ApolloClient({
  link: WSClient,
  cache: new InMemoryCache()
});

ReactDOM.render(
  <ApolloProvider client={GraphQLClient}>
    <App />
  </ApolloProvider>,
  document.getElementById('root'));
registerServiceWorker();