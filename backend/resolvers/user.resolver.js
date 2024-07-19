// backend/resolvers/user.resolver.js
import { users } from '../dummy/data.js';

const userResolver = {
  Query: {
    users: () => users,  // Resolver for 'users' query
    user: (_, { userId }) => {
      return users.find(user => user._id == userId);  // Resolver for 'user' query
    },
  },
  Mutation: {},
};

export default userResolver;
