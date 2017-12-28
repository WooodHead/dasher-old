import React from 'react';
import Modal from 'react-modal';
import { connect } from 'react-redux';
import { graphql, compose } from 'react-apollo';
import gql from 'graphql-tag';
import { hideModal } from '../actions';

export const DELETE_BOARD_MODAL = 'DELETE_BOARD_MODAL';

class DeleteBoardModal extends React.Component {
  handleClose = () => {
    this.props.dispatch(hideModal());
  };

  handleDelete = () => {
    this.props.deleteBoard(this.props.boardId);
    this.handleClose();
  };

  render() {
    const { data } = this.props;

    return (
      <Modal isOpen={true} onRequestClose={this.handleClose}>
        {data.loading ? (
          <div>Loading</div>
        ) : (
          <div>
            <h1>Delete board</h1>
            <p>
              Are you sure you want to delete <strong>{data.Board.name}</strong>?
              This action cannot be undone.
            </p>
            <button onClick={this.handleClose}>Cancel</button>
            <button onClick={this.handleClose}>Delete</button>
          </div>
        )}
      </Modal>
    );
  }
}

const BOARD = gql`
  query Board($id: ID!) {
    Board(id: $id) {
      name
    }
  }
`;

const DELETE_BOARD = gql`
  mutation DeleteBoard($id: ID!) {
    deleteBoard(id: $id) {
      id
    }
  }
`;

export default compose(
  graphql(BOARD, {
    options: ({ boardId }) => ({ variables: { id: boardId } }),
  }),
  graphql(DELETE_BOARD, {
    props: ({ mutate }) => ({
      deleteBoard: boardId => mutate({ variables: { id: boardId } }),
    }),
  }),
  connect(),
)(DeleteBoardModal);