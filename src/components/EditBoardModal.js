import React from 'react'
import { withRouter } from 'react-router-dom'
import { connect } from 'react-redux'
import { graphql, compose } from 'react-apollo'
import gql from 'graphql-tag'
import Modal from 'react-modal'

import { hideModal } from '../actions'
import { USER_BOARDS_QUERY } from './Boards'

export const EDIT_BOARD_MODAL = 'EDIT_BOARD_MODAL'

class EditBoardModal extends React.Component {
  state = { name: '', repository: '' }

  componentDidMount() {
    const { boardId, data } = this.props

    if (boardId && !data.loading) {
      this.initializeFormState(data.board)
    }
  }

  componentDidUpdate(prevProps) {
    const { boardId, data } = this.props

    if (boardId && prevProps.data.loading && !data.loading) {
      this.initializeFormState(data.board)
    }
  }

  initializeFormState = ({ name, repository }) =>
    this.setState({ name, repository })

  handleNameChange = event => this.setState({ name: event.target.value })

  handleRepositoryChange = event =>
    this.setState({ repository: event.target.value })

  handleClose = () => this.props.dispatch(hideModal())

  handleSubmit = async event => {
    const { boardId, ownerId, history, updateBoard, createBoard } = this.props
    const { name, repository } = this.state

    event.preventDefault()
    this.handleClose()

    if (boardId) {
      updateBoard(boardId, name, repository)
    } else {
      const { data } = await createBoard(ownerId, name, repository)
      history.push(`/board/${data.createBoard.id}`)
    }
  }

  render() {
    const { boardId, data } = this.props
    const { name, repository } = this.state

    return (
      <Modal isOpen onRequestClose={this.handleClose}>
        <h1>{boardId ? 'Edit board' : 'New board'}</h1>
        <form id="edit-board" onSubmit={this.handleSubmit}>
          <label>
            Name
            <input
              value={name}
              onChange={this.handleNameChange}
              disabled={data && data.loading}
              required
            />
          </label>
          <label>
            Repository
            <input
              value={repository}
              onChange={this.handleRepositoryChange}
              disabled={data && data.loading}
              required
            />
          </label>
        </form>
        <button onClick={this.handleClose}>Cancel</button>
        <button type="submit" form="edit-board" disabled={data && data.loading}>
          {boardId ? 'Save' : 'Create'}
        </button>
      </Modal>
    )
  }
}

const BOARD_QUERY = gql`
  query Board($id: ID!) {
    board: Board(id: $id) {
      id
      name
      repository
    }
  }
`

const UPDATE_BOARD_MUTATION = gql`
  mutation UpdateBoard($id: ID!, $name: String!, $repository: String!) {
    updateBoard(id: $id, name: $name, repository: $repository) {
      id
      name
      repository
    }
  }
`

const CREATE_BOARD_MUATION = gql`
  mutation CreateBoard($ownerId: ID!, $name: String!, $repository: String!) {
    createBoard(ownerId: $ownerId, name: $name, repository: $repository) {
      id
      name
      repository
    }
  }
`

export default compose(
  withRouter,
  graphql(BOARD_QUERY, {
    options: ({ boardId }) => ({ variables: { id: boardId } }),
    skip: ({ boardId }) => !boardId,
  }),
  graphql(UPDATE_BOARD_MUTATION, {
    name: 'updateBoardMutation',
    props: ({ updateBoardMutation }) => ({
      updateBoard: (boardId, name, repository) =>
        updateBoardMutation({ variables: { id: boardId, name, repository } }),
    }),
  }),
  graphql(CREATE_BOARD_MUATION, {
    name: 'createBoardMutation',
    props: ({ createBoardMutation }) => ({
      createBoard: (ownerId, name, repository) =>
        createBoardMutation({
          variables: { ownerId, name, repository },
          update: (store, { data: { createBoard } }) => {
            const data = store.readQuery({ query: USER_BOARDS_QUERY })
            data.user.boards.unshift(createBoard)
            store.writeQuery({ query: USER_BOARDS_QUERY, data })
          },
        }),
    }),
  }),
  connect(),
)(EditBoardModal)