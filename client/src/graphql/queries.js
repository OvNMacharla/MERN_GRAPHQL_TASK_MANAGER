import { gql } from '@apollo/client';

export const GET_ME = gql`
  query GetMe {
    me {
      id
      username
      email
    }
  }
`;

export const GET_TASKS = gql`
  query GetTasks {
    getTasks {
      id
      title
      description
      status
      priority
      dueDate
      createdAt
      updatedAt
    }
  }
`;