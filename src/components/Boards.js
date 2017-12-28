import React from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { graphql, compose } from 'react-apollo';
import gql from 'graphql-tag';
import { showEditBoardModal, showDeleteBoardModal } from '../actions';

const Boards = ({ data, dispatch }) => (
  <div>
    <h1>Boards</h1>
    <button onClick={() => dispatch(showEditBoardModal())}>New board</button>
    <ul>
      {data.loading ? (
        <div>Loading</div>
      ) : (
        data.user &&
        data.user.boards.map(board => (
          <li key={board.id}>
            <Link to={`/board/${board.id}`}>{board.name}</Link>
            <button onClick={() => dispatch(showEditBoardModal(board.id))}>
              Edit
            </button>
            <button onClick={() => dispatch(showDeleteBoardModal(board.id))}>
              Delete
            </button>
          </li>
        ))
      )}
    </ul>
  </div>
);

export const USER_BOARDS = gql`
  query UserBoards {
    user {
      id
      boards(orderBy: updatedAt_DESC) {
        id
        name
      }
    }
  }
`;

export default compose(graphql(USER_BOARDS), connect())(Boards);
