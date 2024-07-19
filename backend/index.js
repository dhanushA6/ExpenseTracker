// backend/index.js

//  Built-In Modules 
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import express from 'express';
import http from 'http';
import cors from 'cors';
import dotenv from "dotenv" 
import passport  from 'passport'; 
import session from 'express-session'; 
import connectMongo from 'connect-mongodb-session';
import { buildContext } from 'graphql-passport';  


//  Custom Modules 
import {connectDB} from './db/ConnectDB.js'
import mergedTypeDefs from './typeDefs/index.js';
import mergedResolvers from './resolvers/index.js'; 
import { configurePassport } from './passport/passport.config.js';





dotenv.config();
configurePassport(); 
 
const MongoDBStore = connectMongo(session);


const app = express(); 
const httpServer = http.createServer(app); 


const store = new MongoDBStore(
  {
    uri:process.env.MONGO_URI, 
    collection:"session"
  }
);

store.on("error", (err)=> console.log(err.message));

app.use(

  session({
    secret: process.env.SESSION_SECRET,
    resave: false, 
    saveUninitialized: false, 
    cookie:{
      maxAge: 1000*60*60*24*7, 
      httpOnly: true,  // to prevent XSS
    }, 
    store: store 
  }
  )
) 

app.use(passport.initialize());
app.use(passport.session());

const server = new ApolloServer({
  typeDefs: mergedTypeDefs,
  resolvers: mergedResolvers, 
  plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  
});  

await server.start();



app.use(
  '/',
  cors( {
    origin : "http://localhost:300",
    credentials: true,
  }
  ),
  express.json(),
  // expressMiddleware accepts the same arguments:
  // an Apollo Server instance and optional configuration options
  expressMiddleware(server, {
    context: async ({ req , res}) => buildContext({req, res}),
  }),
);

// Modified server startup
await new Promise((resolve) => httpServer.listen({ port: 4000 }, resolve)); 
await connectDB()


console.log(`🚀 Server ready at http://localhost:4000/`);

